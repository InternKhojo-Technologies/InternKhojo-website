import { MongoClient, ObjectId, type Collection, type Document } from "mongodb";

// Server-only accessor for the hire question bank.
//
// Env contract:
//   MONGODB_QUESTIONS_URI  full connection string (required, includes credentials)
//   MONGODB_QUESTIONS_DB   database name (optional — parsed from the URI when omitted)
//
// Collections are resolved dynamically per category, e.g.
//   aptitude  -> aptitude_questions
//   technical -> technical_questions
// Callers pass the already-sanitized collection name.

let cachedClient: MongoClient | null = null;
let cachedKey: string | null = null;

function readEnv(name: string): string | null {
  const raw = process.env[name]?.trim() ?? "";
  if (!raw) return null;
  if (raw.length >= 2) {
    const first = raw.charAt(0);
    const last = raw.charAt(raw.length - 1);
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      const inner = raw.slice(1, -1).trim();
      return inner === "" ? null : inner;
    }
  }
  return raw;
}

export function questionsMongoUri(): string | null {
  return readEnv("MONGODB_QUESTIONS_URI");
}

/** Extract `/dbname` from a MongoDB URI path, if present. */
function dbFromUri(uri: string): string | null {
  try {
    // Strip protocol + credentials + hosts, keep the path.
    const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//, "");
    const slashIdx = withoutProtocol.indexOf("/");
    if (slashIdx === -1) return null;
    const path = withoutProtocol.slice(slashIdx + 1).split("?")[0].trim();
    if (!path || path === "") return null;
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

export function questionsDbName(): string | null {
  return readEnv("MONGODB_QUESTIONS_DB") ?? (questionsMongoUri() ? dbFromUri(questionsMongoUri()!) : null);
}

export function isQuestionsMongoConfigured(): boolean {
  return Boolean(questionsMongoUri() && questionsDbName());
}

export function questionsMongoStatus(): { configured: boolean; reason?: string } {
  if (!questionsMongoUri()) {
    return {
      configured: false,
      reason: "MONGODB_QUESTIONS_URI is not set. Add it to .env.local (never commit secrets).",
    };
  }
  if (!questionsDbName()) {
    return {
      configured: false,
      reason:
        "Could not determine the database name. Append /<dbName> to MONGODB_QUESTIONS_URI or set MONGODB_QUESTIONS_DB.",
    };
  }
  return { configured: true };
}

async function getClient(): Promise<{ client: MongoClient; dbName: string }> {
  const uri = questionsMongoUri();
  const dbName = questionsDbName();
  if (!uri || !dbName) {
    throw new Error(
      "[hire] Questions MongoDB is not configured. Set MONGODB_QUESTIONS_URI (and MONGODB_QUESTIONS_DB if the URI has no /db path) in .env.local."
    );
  }
  const key = `${uri}::${dbName}`;
  if (cachedClient && cachedKey === key) {
    return { client: cachedClient, dbName };
  }
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });
  await client.connect();
  cachedClient = client;
  cachedKey = key;
  return { client, dbName };
}

export async function getQuestionsCollection(collectionName: string): Promise<Collection<Document>> {
  const safe = collectionName.trim().replace(/[^a-zA-Z0-9_]+/g, "_");
  if (!safe) throw new Error("[hire] Invalid questions collection name.");
  const { client, dbName } = await getClient();
  return client.db(dbName).collection(safe);
}

export function toObjectIdOrNull(id: string): ObjectId | null {
  try {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * Coerce a MongoDB `solution` value to displayable text.
 * Live collections store plain strings, but seeds may contain null,
 * objects ({ text/explanation/... }) or arrays — never blank the review UI.
 *
 * Banks also use the placeholder "No answer description is available…"
 * where no real explanation exists — that is normalised to "" so callers
 * can render an honest "(Solution not available)" fallback instead.
 */
export function solutionToString(value: unknown): string {
  const text = solutionToStringInner(value);
  if (text.trim().toLowerCase().startsWith("no answer description is available")) {
    return "";
  }
  return text;
}

function solutionToStringInner(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === "string").join("\n");
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["text", "explanation", "detail", "solution", "answer_explanation"]) {
      if (typeof obj[key] === "string" && (obj[key] as string).trim() !== "") {
        return obj[key] as string;
      }
    }
    try {
      const json = JSON.stringify(obj);
      return json.length > 2000 ? `${json.slice(0, 2000)}…` : json;
    } catch {
      return "";
    }
  }
  return String(value);
}

export interface HireDocMeta {
  subject?: string;
  subtopic?: string;
  targets: string[];
}

function cleanLabel(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim().replace(/\s+/g, " ");
  return t === "" ? undefined : t;
}

/**
 * Per-question display metadata. Collections use different key names for
 * the same concepts, so every alias is tried in order:
 * - subject:  tech_subject | category_label | dsa_topic
 *   ("Operating Systems", "Verbal Ability", …)
 * - subtopic: sub_topic | topic_sublabel
 *   ("UNIX Operating System", "Selecting Words", …)
 * - targets:  target_fields | target_exams (string arrays)
 *   (["Placements", "Bank Exams"], ["Google", "Microsoft"], …)
 */
export function docMeta(doc: Record<string, unknown>): HireDocMeta {
  const subject =
    cleanLabel(doc.tech_subject) ??
    cleanLabel(doc.category_label) ??
    cleanLabel(doc.dsa_topic);
  const subtopic =
    cleanLabel(doc.sub_topic) ?? cleanLabel(doc.topic_sublabel);
  const rawTargets = doc.target_fields ?? doc.target_exams;
  const targets: string[] = [];
  if (Array.isArray(rawTargets)) {
    for (const t of rawTargets) {
      const c = cleanLabel(t);
      if (c && !targets.includes(c)) targets.push(c);
      if (targets.length >= 6) break;
    }
  }
  return { subject, subtopic, targets };
}

/** "MEDIUM" -> "Medium", "easy" -> "Easy". Passes through anything else. */
export function prettyDifficulty(value: unknown): string | undefined {
  const c = cleanLabel(value);
  if (!c) return undefined;
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
}

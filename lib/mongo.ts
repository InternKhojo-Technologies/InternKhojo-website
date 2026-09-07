import { MongoClient, type Collection, type Document } from "mongodb";

// Server-only MongoDB accessor for the external-postings bulletin.
//
// Env contract (set values in .env.local — never commit secrets):
//   MONGODB_URI              full connection string (required)
//   MONGODB_DB               database name (required)
//   MONGODB_JOBS_COLLECTION  collection name (optional, defaults to "jobs")
//
// When env is missing (e.g. local builds without DB access) getJobsCollection()
// throws a coded error — callers catch it and render a friendly empty state so
// the build and the page never crash.

let cachedClient: MongoClient | null = null;
let cachedDbName: string | null = null;

function readEnv(name: string): string | null {
  let v = process.env[name]?.trim() ?? "";
  // Tolerate values pasted with surrounding quotes ("..."/'...').
  if (v.length >= 2) {
    const first = v.charAt(0);
    const last = v.charAt(v.length - 1);
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      v = v.slice(1, -1).trim();
    }
  }
  return v !== "" ? v : null;
}

export function mongoConfig() {
  return {
    uri: readEnv("MONGODB_URI"),
    db: readEnv("MONGODB_DB"),
    collection: readEnv("MONGODB_JOBS_COLLECTION") ?? "jobs",
  };
}

/**
 * Your setup keeps credentials as separate MONGODB_USERNAME / MONGODB_PASSWORD
 * keys. If MONGODB_URI already contains `user:pass@`, it is used as-is;
 * otherwise the credentials are injected (URI-encoded) after `://`.
 */
export function effectiveMongoUri(): string | null {
  const { uri } = mongoConfig();
  if (!uri) return null;
  if (uri.includes("@")) return uri;
  const user = readEnv("MONGODB_USERNAME");
  const pass = readEnv("MONGODB_PASSWORD");
  if (!user || !pass) return uri;
  const m = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!m) return uri;
  return `${m[1]}${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${m[2]}`;
}

export function isMongoConfigured(): boolean {
  const { uri, db } = mongoConfig();
  return Boolean(uri && db);
}

async function getClient(): Promise<{ client: MongoClient; dbName: string }> {
  const { db } = mongoConfig();
  const uri = effectiveMongoUri();
  if (!uri || !db) {
    throw new Error(
      "[bulletin] MongoDB is not configured. Set MONGODB_URI and MONGODB_DB in .env.local.",
    );
  }
  if (cachedClient && cachedDbName === db) {
    return { client: cachedClient, dbName: db };
  }
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });
  await client.connect();
  cachedClient = client;
  cachedDbName = db;
  return { client, dbName: db };
}

export async function getJobsCollection(): Promise<Collection<Document>> {
  const { client, dbName } = await getClient();
  const { collection } = mongoConfig();
  return client.db(dbName).collection(collection);
}

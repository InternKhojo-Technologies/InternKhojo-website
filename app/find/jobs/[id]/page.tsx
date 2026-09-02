"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Zap,
  FileText,
  Briefcase,
  Banknote,
  Clock,
  Loader2,
  Maximize2,
  X,
  Download,
  Building,
  ArrowUpRight,
  ChevronDown,
  Eye,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import posthog from "posthog-js";

function timeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

  const days = Math.floor(diff / 86400);
  if (days > 0) return `${days}d ago`;

  const hours = Math.floor(diff / 3600);
  if (hours > 0) return `${hours}h ago`;

  const minutes = Math.floor(diff / 60);
  if (minutes > 0) return `${minutes}m ago`;

  return "Just now";
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [resolvedDocUrl, setResolvedDocUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    loadJob();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewOpen(false);
    };
    if (previewOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewOpen]);

  const loadJob = async () => {
    if (!jobId) return;

    const { data, error } = await supabase
      .from("jobs")
      .select(`*, companies(name, logo_url)`)
      .eq("id", jobId)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setJob(data);

    // Fetch User Session and User Profile Role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Get user profile details to check role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }

      // Check if user has already applied
      const { data: existingApp } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("user_id", user.id);

      if (existingApp && existingApp.length > 0) {
        setHasApplied(true);
      }
    }

    if (data?.attachment_url) {
      const rawUrl = data.attachment_url.trim();

      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        setResolvedDocUrl(rawUrl);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("job-attachments")
          .getPublicUrl(rawUrl);

        if (publicUrlData?.publicUrl) {
          setResolvedDocUrl(publicUrlData.publicUrl);
        }
      }
    }

    setLoading(false);
  };

  if (loading)
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    );
  if (!job)
    return (
      <div className="p-10 text-center font-bold text-slate-400">
        Job vacancy reference not found.
      </div>
    );

  return (
    <div className="bg-[#fcfcfc] min-h-screen text-black pb-28 select-none antialiased">
      <div className="max-w-[1140px] mx-auto px-6">
        {/* Editorial Navigation */}
        <div className="pt-14 mb-16 flex items-center justify-between border-b border-slate-100 pb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return
          </button>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            Active Opportunity // {String(jobId || "").slice(0, 8)}
          </div>
        </div>

        {/* Studio Grid Split Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT COLUMN: CONTEXT METRICS */}
          <div className="lg:col-span-8 space-y-14">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4.5">
                  <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center p-3 flex-shrink-0 shadow-sm">
                    {job.companies?.logo_url ? (
                      <img
                        src={job.companies.logo_url}
                        className="w-full h-full object-contain"
                        alt="Logo"
                      />
                    ) : (
                      <Building className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                      <span className="text-black font-bold">
                        {job.companies?.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />{" "}
                        {timeAgo(job.created_at)}
                      </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-[1000] tracking-tighter uppercase leading-[0.95] text-slate-900">
                      {job.title}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {job.skills?.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] font-black uppercase bg-white px-3 py-1.5 rounded-lg border border-slate-200/60 text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Description Card */}
            <div className="space-y-4 border-t border-slate-100 pt-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-sm" /> 01 /
                Profile Outline
              </h2>

              <div
                className="text-sm text-slate-700 font-medium leading-relaxed max-w-2xl pl-3.5 border-l-2 border-slate-100
                  [&_h1]:text-2xl [&_h1]:font-black [&_h1]:my-3 [&_h1]:text-slate-900 
                  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_h2]:text-slate-900 
                  [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2 [&_h3]:text-slate-900 
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 
                  [&_li]:my-1 
                  [&_b]:font-black [&_strong]:font-black 
                  [&_u]:underline"
                dangerouslySetInnerHTML={{
                  __html:
                    job.description ||
                    "No mission brief specified for this opportunity window.",
                }}
              />
            </div>

            {/* Documentation Hub */}
            {resolvedDocUrl && (
              <div className="space-y-4 border-t border-slate-100 pt-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-sm" /> 02 /
                  Documentation Repo
                </h3>

                <div
                  onClick={() => setPreviewOpen(true)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#fafafa] hover:bg-white rounded-2xl border border-slate-100 hover:border-black transition-all duration-500 w-full text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:scale-[1.01] cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-600 shadow-sm flex-shrink-0 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                        Project Assignment Specifications
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Click container block to trigger preview
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-red-600 group-hover:text-black flex items-center gap-1 sm:pl-4 flex-shrink-0 group-hover:translate-x-1 transition-transform self-end sm:self-center">
                    Launch Hub <ArrowUpRight size={13} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ACTION BLOCK PANEL */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white border border-slate-200/80 p-6 rounded-[24px] shadow-[0_24px_60px_rgba(0,0,0,0.02)] space-y-6">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-3.5 flex items-center justify-between">
                <span>Core Framework Details</span>
                <Zap className="w-3 h-3 text-red-600 fill-red-600" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm flex-shrink-0">
                    <Banknote size={15} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      Compensation
                    </p>
                    <p className="text-sm font-black text-slate-900 tracking-tight">
                      {job.stipend || job.salary || "Unpaid exposure"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm flex-shrink-0">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      Location Scope
                    </p>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {job.location || "Remote Bounds"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm flex-shrink-0">
                    <Briefcase size={15} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      Deployment Model
                    </p>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {job.job_type || "Internship Slot"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <ApplyButton
                  job={job}
                  hasApplied={hasApplied}
                  setHasApplied={setHasApplied}
                  userRole={userRole}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blueprint Document Iframe Modal */}
      {previewOpen && resolvedDocUrl && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-white w-full max-w-4xl h-[88vh] rounded-[24px] border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-red-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">
                  Blueprint Explorer
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={resolvedDocUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-50 hover:bg-black hover:text-white text-slate-600 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider border border-slate-200 flex items-center gap-1.5"
                >
                  <Download size={12} /> Download
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-slate-50 relative">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(resolvedDocUrl)}&embedded=true`}
                className="w-full h-full border-none absolute inset-0 bg-slate-50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= MODULAR APPLICATION FORM SYSTEM =================
function ApplyButton({
  job,
  hasApplied,
  setHasApplied,
  userRole,
}: {
  job: any;
  hasApplied: boolean;
  setHasApplied: (val: boolean) => void;
  userRole: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [bucketResumes, setBucketResumes] = useState<
    { name: string; url: string }[]
  >([]);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string>("");
  const [fetchingFiles, setFetchingFiles] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inlinePreview, setInlinePreview] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDropdownOpen(false);
      }
    };
    if (open) window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [open]);

  useEffect(() => {
    const handleModalScroll = () => {
      setDropdownOpen(false);
    };

    const currentContainer = scrollContainerRef.current;
    if (open && currentContainer) {
      currentContainer.addEventListener("scroll", handleModalScroll, {
        passive: true,
      });
    }
    return () => {
      if (currentContainer)
        currentContainer.removeEventListener("scroll", handleModalScroll);
    };
  }, [open, dropdownOpen]);

  useEffect(() => {
    if (open) fetchUserBucketResumes();
  }, [open]);

  const handleInitialClick = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Unauthenticated Guest Handling: Redirect to Sign Up
    if (!user) {
      router.push("/signup?role=candidate");
      return;
    }

    // 2. Candidate Open Modal
    setOpen(true);
  };

  const fetchUserBucketResumes = async () => {
    setFetchingFiles(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setFetchingFiles(false);
      return;
    }

    const { data: files, error } = await supabase.storage
      .from("resume")
      .list(user.id, {
        limit: 20,
        sortBy: { column: "name", order: "desc" },
      });

    if (error || !files) {
      console.error(error);
      setFetchingFiles(false);
      return;
    }

    const parsedFiles = files
      .filter((f) => f.name.endsWith(".pdf"))
      .map((f) => {
        const fullStoragePath = `${user.id}/${f.name}`;
        return {
          name: f.name,
          url:
            supabase.storage.from("resume").getPublicUrl(fullStoragePath).data
              .publicUrl || "",
        };
      });

    setBucketResumes(parsedFiles);
    if (parsedFiles.length > 0 && !selectedResumeUrl) {
      setSelectedResumeUrl(parsedFiles[0].url);
    }
    setFetchingFiles(false);
  };

  const getSelectedFileName = () => {
    const matched = bucketResumes.find((r) => r.url === selectedResumeUrl);
    return matched ? matched.name : "Select your resume file...";
  };

  const apply = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/signup?role=candidate");
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", job.id)
      .eq("user_id", user.id);

    if (existing && existing.length > 0) {
      alert("You have already applied for this role.");
      setHasApplied(true);
      setLoading(false);
      setOpen(false);
      return;
    }

    // Check mandatory questions
    if (job.questions?.length > 0) {
      for (let i = 0; i < job.questions.length; i++) {
        const q = job.questions[i];
        const isRequired = typeof q === "object" ? q.required : true;
        const answer = answers[i];

        if (
          isRequired &&
          (answer === undefined ||
            answer === "" ||
            (Array.isArray(answer) && answer.length === 0))
        ) {
          const qTitle = typeof q === "object" ? q.title : q;
          alert(`Please answer mandatory question: "${qTitle}"`);
          setLoading(false);
          return;
        }
      }
    }

    const { error } = await supabase.from("applications").insert({
      job_id: job.id,
      user_id: user.id,
      stage: "pending",
      answers,
      resume_url: selectedResumeUrl,
    });

    setLoading(false);
    if (error) alert(error.message);
    else {
      if (
        process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
        process.env.NEXT_PUBLIC_POSTHOG_HOST
      ) {
        posthog.capture("job_application_submitted", {
          job_id: job.id,
          job_type: job.job_type || "unknown",
          has_screening_questions: Boolean(job.questions?.length),
        });
      }
      alert("Applied successfully!");
      setHasApplied(true);
      setOpen(false);
      setAnswers({});
    }
  };

  // RECRUITER VIEW: HIDE APPLY BUTTON AND SHOW ROLE NOTICE
  if (userRole === "recruiter") {
    return (
      <div className="w-full bg-slate-50 border border-slate-200 text-slate-500 py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
        <UserCheck size={15} className="text-slate-400" />
        Recruiter Mode // Application Restricted
      </div>
    );
  }

  // ALREADY APPLIED VIEW: SHOW BADGE BUTTON
  if (hasApplied) {
    return (
      <button
        disabled
        className="w-full bg-emerald-50 border border-emerald-200 text-emerald-600 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-sm cursor-not-allowed"
      >
        <CheckCircle2 size={16} /> Already Applied
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleInitialClick}
        className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-md active:scale-[0.98] cursor-pointer"
      >
        Apply for loop
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999999] p-4"
          onClick={() => {
            setOpen(false);
            setDropdownOpen(false);
          }}
        >
          <div
            className="bg-white w-full max-w-lg max-h-[85vh] rounded-[24px] border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Frame */}
            <div className="flex-shrink-0 p-6 sm:p-8 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-[1000] tracking-tight uppercase text-slate-900">
                  Apply for {job.title}
                </h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                  Pipeline processing configuration
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-black p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Central Scrolling Body */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-6 sm:px-8 pb-4 space-y-6"
            >
              <div
                className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl space-y-4"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wide">
                    Select Dashboard Resume
                  </p>
                  {selectedResumeUrl && (
                    <button
                      type="button"
                      onClick={() => setInlinePreview(!inlinePreview)}
                      className="text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-black flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={12} />{" "}
                      {inlinePreview ? "Hide Preview" : "Live Preview"}
                    </button>
                  )}
                </div>

                {fetchingFiles ? (
                  <div className="py-2.5 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Gathering
                    folder parameters...
                  </div>
                ) : bucketResumes.length === 0 ? (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold text-center border border-red-100">
                    No resumes found inside your profile repo.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(!dropdownOpen);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between font-bold text-xs text-slate-700 shadow-sm focus:border-black transition-colors text-left cursor-pointer"
                      >
                        <span className="truncate pr-4 flex items-center gap-2">
                          <FileText size={14} className="text-slate-400" />
                          {getSelectedFileName()}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-[160px] overflow-y-auto z-50 py-1">
                          {bucketResumes.map((resObj, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedResumeUrl(resObj.url);
                                setDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 truncate cursor-pointer ${selectedResumeUrl === resObj.url ? "bg-slate-50 font-black text-black" : "text-slate-600"}`}
                            >
                              <span className="text-[10px] font-mono text-slate-300">
                                [{idx + 1}]
                              </span>
                              {resObj.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {inlinePreview && selectedResumeUrl && (
                      <div className="w-full h-[240px] rounded-xl border border-slate-200 bg-white overflow-hidden shadow-inner animate-in fade-in duration-200">
                        <iframe
                          src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedResumeUrl)}&embedded=true`}
                          className="w-full h-full border-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Screening Questions Section */}
              {job.questions?.length > 0 ? (
                <div
                  className="space-y-5 pr-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2">
                    Screening Questions
                  </p>
                  {job.questions.map((q: any, i: number) => {
                    const isObj = typeof q === "object";
                    const title = isObj ? q.title : q;
                    const type = isObj ? q.type : "text";
                    const isRequired = isObj ? q.required : true;
                    const options = isObj && q.options ? q.options : [];

                    return (
                      <div
                        key={i}
                        className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100"
                      >
                        <p className="text-xs font-black uppercase text-slate-700 tracking-wide flex items-center justify-between">
                          <span>
                            {i + 1}. {title}
                          </span>
                          {isRequired && (
                            <span className="text-red-500 text-[10px] font-black uppercase ml-1">
                              *Required
                            </span>
                          )}
                        </p>

                        {/* Text Field */}
                        {type === "text" && (
                          <textarea
                            rows={3}
                            value={answers[i] || ""}
                            placeholder="Type response guidelines..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-slate-700"
                            onChange={(e) =>
                              setAnswers({ ...answers, [i]: e.target.value })
                            }
                          />
                        )}

                        {/* Single Choice Radio */}
                        {type === "radio" && (
                          <div className="space-y-2 pt-1">
                            {options.map((opt: string, optIdx: number) => (
                              <label
                                key={optIdx}
                                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:border-black transition-colors"
                              >
                                <input
                                  type="radio"
                                  name={`q_${i}`}
                                  value={opt}
                                  checked={answers[i] === opt}
                                  onChange={(e) =>
                                    setAnswers({
                                      ...answers,
                                      [i]: e.target.value,
                                    })
                                  }
                                  className="accent-black w-4 h-4"
                                />
                                <span className="text-xs font-bold text-slate-700 uppercase">
                                  {opt}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Multiple Choice Checkbox */}
                        {type === "checkbox" && (
                          <div className="space-y-2 pt-1">
                            {options.map((opt: string, optIdx: number) => {
                              const currentSelected: string[] = Array.isArray(
                                answers[i],
                              )
                                ? answers[i]
                                : [];
                              const isChecked = currentSelected.includes(opt);

                              return (
                                <label
                                  key={optIdx}
                                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:border-black transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    value={opt}
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const updated = e.target.checked
                                        ? [...currentSelected, opt]
                                        : currentSelected.filter(
                                            (item) => item !== opt,
                                          );
                                      setAnswers({ ...answers, [i]: updated });
                                    }}
                                    className="accent-black w-4 h-4 rounded"
                                  />
                                  <span className="text-xs font-bold text-slate-700 uppercase">
                                    {opt}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Dropdown Select */}
                        {type === "dropdown" && (
                          <select
                            value={answers[i] || ""}
                            onChange={(e) =>
                              setAnswers({ ...answers, [i]: e.target.value })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase text-slate-700 outline-none focus:border-black cursor-pointer"
                          >
                            <option value="">Select option...</option>
                            {options.map((opt: string, optIdx: number) => (
                              <option key={optIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wide py-2 italic">
                  No custom verification steps bounded.
                </p>
              )}
            </div>

            {/* Static Action Buttons Footer Panel */}
            <div
              className="flex-shrink-0 p-6 border-t border-slate-100 flex justify-end gap-3 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={apply}
                disabled={
                  loading || fetchingFiles || bucketResumes.length === 0
                }
                className="px-5 py-2.5 bg-black hover:bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Registering..." : "Submit Intent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

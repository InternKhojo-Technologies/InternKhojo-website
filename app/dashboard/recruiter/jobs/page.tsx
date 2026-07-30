"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Menu,
  Plus,
  MapPin,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCcw,
  Clock,
  Edit3,
  Eye,
  Save,
  FileType,
  Upload,
  ChevronDown,
  Layers,
  ShieldCheck,
  Zap,
  CreditCard,
  Target,
  Database,
  ExternalLink,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

interface QuestionItem {
  id: string;
  type: "text" | "radio" | "checkbox" | "dropdown";
  title: string;
  options: string[];
  required: boolean;
}

const Toast = ({ message, type, onClose }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border ${
      type === "error"
        ? "bg-red-50 border-red-100 text-red-600"
        : "bg-gray-900 border-gray-800 text-white"
    }`}
  >
    {type === "error" ? (
      <AlertCircle size={18} />
    ) : (
      <CheckCircle2 size={18} className="text-green-400" />
    )}
    <span className="text-sm font-bold tracking-tight">{message}</span>
    <button
      onClick={onClose}
      className="ml-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
    >
      <X size={14} />
    </button>
  </motion.div>
);

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const [deleteTargetJob, setDeleteTargetJob] = useState<any | null>(null);

  // VIEW & EDIT DRAWER STATE
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  // Form States for Edit
  const [editTitle, setEditTitle] = useState("");
  const [editDescriptionHtml, setEditDescriptionHtml] = useState("");
  const [editIsPaid, setEditIsPaid] = useState(true);
  const [editCurrency, setEditCurrency] = useState("INR");
  const [editStipend, setEditStipend] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editWorkType, setEditWorkType] = useState("internship");
  const [editDuration, setEditDuration] = useState("3-6 Months");
  const [editExperienceLevel, setEditExperienceLevel] = useState("fresher");

  const [editSkillInput, setEditSkillInput] = useState("");
  const [editSkillsList, setEditSkillsList] = useState<string[]>([]);

  // Full Google Forms Question Builder States
  const [editQuestions, setEditQuestions] = useState<QuestionItem[]>([]);

  const [editAttachment, setEditAttachment] = useState<File | null>(null);
  const [editAttachmentUrl, setEditAttachmentUrl] = useState<string | null>(
    null,
  );

  // Rich Text ContentEditable Ref & Active Formats
  const editEditorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<{
    [key: string]: boolean;
  }>({});

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b")
        setCollapsed((prev) => !prev);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    if (!loading) setRefreshing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData?.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profileData.company_id)
          .single();
        setCompany(companyData);
      }

      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false });

      const { data: applications } = await supabase
        .from("applications")
        .select("job_id, stage");
      const statsMap: any = {};
      applications?.forEach((a) => {
        if (!statsMap[a.job_id])
          statsMap[a.job_id] = {
            total: 0,
            shortlisted: 0,
            interview: 0,
            hired: 0,
          };
        statsMap[a.job_id].total++;
        if (a.stage === "shortlisted") statsMap[a.job_id].shortlisted++;
        if (a.stage === "interview") statsMap[a.job_id].interview++;
        if (a.stage === "hired") statsMap[a.job_id].hired++;
      });

      setJobs(
        (jobsData || []).map((job) => ({
          ...job,
          stats: statsMap[job.id] || {
            total: 0,
            shortlisted: 0,
            interview: 0,
            hired: 0,
          },
        })),
      );

      if (refreshing) showToast("Sync Complete");
    } catch (err) {
      showToast("Sync Error", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- RICH TEXT NATIVE COMMAND HELPERS ---
  const formatEditText = (
    command: string,
    value: string | undefined = undefined,
  ) => {
    document.execCommand(command, false, value);
    if (editEditorRef.current) {
      setEditDescriptionHtml(editEditorRef.current.innerHTML);
      checkActiveFormats();
    }
  };

  const checkActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  };

  const handleEditEditorInput = () => {
    if (editEditorRef.current) {
      setEditDescriptionHtml(editEditorRef.current.innerHTML);
      checkActiveFormats();
    }
  };

  // --- GOOGLE FORM QUESTION BUILDER HELPERS FOR EDIT ---
  const addEditQuestion = () => {
    setEditQuestions([
      ...editQuestions,
      {
        id: `q_${Date.now()}`,
        type: "text",
        title: "",
        options: [""],
        required: false,
      },
    ]);
  };

  const updateEditQuestion = (
    id: string,
    key: keyof QuestionItem,
    value: any,
  ) => {
    setEditQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [key]: value } : q)),
    );
  };

  const addEditQuestionOption = (questionId: string) => {
    setEditQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  };

  const updateEditQuestionOption = (
    questionId: string,
    optIdx: number,
    value: string,
  ) => {
    setEditQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const updated = [...q.options];
          updated[optIdx] = value;
          return { ...q, options: updated };
        }
        return q;
      }),
    );
  };

  const removeEditQuestionOption = (questionId: string, optIdx: number) => {
    setEditQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options.length > 1) {
          return {
            ...q,
            options: q.options.filter((_, idx) => idx !== optIdx),
          };
        }
        return q;
      }),
    );
  };

  const removeEditQuestion = (id: string) => {
    if (editQuestions.length > 1) {
      setEditQuestions(editQuestions.filter((q) => q.id !== id));
    }
  };

  const toggleStatus = async (job: any) => {
    const newStatus = job.status === "open" ? "closed" : "open";
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", job.id);
    if (!error) {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j)),
      );
      if (selectedJob?.id === job.id) {
        setSelectedJob({ ...selectedJob, status: newStatus });
      }
      showToast(`Job is now ${newStatus.toUpperCase()}`);
    }
  };

  const executeJobDeletion = async () => {
    if (!deleteTargetJob) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", deleteTargetJob.id);

      if (error) throw error;

      setJobs((prev) => prev.filter((j) => j.id !== deleteTargetJob.id));
      if (selectedJob?.id === deleteTargetJob.id) {
        setSelectedJob(null);
      }
      showToast("Job removed successfully");
    } catch (err) {
      showToast("Failed to remove job", "error");
    } finally {
      setDeleteTargetJob(null);
    }
  };

  const openJobDetails = (job: any) => {
    setSelectedJob(job);
    setIsEditing(false);

    setEditTitle(job.title || "");
    const initialDesc = job.description || "";
    setEditDescriptionHtml(initialDesc);

    setTimeout(() => {
      if (editEditorRef.current) {
        editEditorRef.current.innerHTML = initialDesc;
      }
    }, 50);

    const isUnpaid = (job.stipend || "").toLowerCase() === "unpaid";
    setEditIsPaid(!isUnpaid);

    if (isUnpaid || !job.stipend) {
      setEditStipend("");
      setEditCurrency("INR");
    } else {
      const raw = job.stipend.toString();
      if (raw.startsWith("₹")) {
        setEditCurrency("INR");
        setEditStipend(raw.replace("₹", ""));
      } else if (raw.startsWith("$")) {
        setEditCurrency("USD");
        setEditStipend(raw.replace("$", ""));
      } else if (raw.startsWith("€")) {
        setEditCurrency("EURO");
        setEditStipend(raw.replace("€", ""));
      } else {
        setEditStipend(raw);
      }
    }

    setEditLocation(job.location || "");
    setEditWorkType(job.job_type || "internship");
    setEditDuration(job.duration || "3-6 Months");
    setEditExperienceLevel(job.experience_level || "fresher");
    setEditSkillsList(Array.isArray(job.skills) ? job.skills : []);

    // Parse structured JSON questions or convert legacy strings
    let parsedQuestions: QuestionItem[] = [];
    if (Array.isArray(job.questions) && job.questions.length > 0) {
      parsedQuestions = job.questions.map((q: any, idx: number) => {
        if (typeof q === "object" && q !== null) {
          return {
            id: q.id || `q_${idx}_${Date.now()}`,
            type: q.type || "text",
            title: q.title || "",
            options:
              Array.isArray(q.options) && q.options.length > 0
                ? q.options
                : [""],
            required: !!q.required,
          };
        }
        return {
          id: `q_${idx}_${Date.now()}`,
          type: "text",
          title: String(q || ""),
          options: [""],
          required: false,
        };
      });
    } else {
      parsedQuestions = [
        {
          id: `q_1_${Date.now()}`,
          type: "text",
          title: "",
          options: [""],
          required: false,
        },
      ];
    }

    setEditQuestions(parsedQuestions);
    setEditAttachment(null);
    setEditAttachmentUrl(job.attachment_url || null);
  };

  const toggleEditMode = () => {
    const nextEditingState = !isEditing;
    setIsEditing(nextEditingState);

    if (nextEditingState) {
      setTimeout(() => {
        if (editEditorRef.current) {
          editEditorRef.current.innerHTML = editDescriptionHtml;
        }
      }, 50);
    }
  };

  const addEditSkill = () => {
    if (
      editSkillInput.trim() &&
      !editSkillsList.includes(editSkillInput.trim().toUpperCase())
    ) {
      setEditSkillsList([
        ...editSkillsList,
        editSkillInput.trim().toUpperCase(),
      ]);
      setEditSkillInput("");
    }
  };

  const removeEditSkill = (skillToRemove: string) => {
    setEditSkillsList(editSkillsList.filter((s) => s !== skillToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setEditAttachment(file);
    } else if (file) {
      showToast("File limit 10MB overflow.", "error");
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSavingJob(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired.");

      let docUrl = editAttachmentUrl;
      if (editAttachment) {
        const fileName = `${user.id}/${Date.now()}-${editAttachment.name.replace(/\s/g, "_")}`;
        const { data, error: uploadError } = await supabase.storage
          .from("job-attachments")
          .upload(fileName, editAttachment);
        if (uploadError) throw uploadError;
        docUrl = data?.path;
      }

      const stipendValue = editIsPaid
        ? `${editCurrency === "INR" ? "₹" : editCurrency === "USD" ? "$" : "€"}${editStipend}`
        : "Unpaid";

      const formattedQuestions = editQuestions
        .filter((q) => q.title.trim() !== "")
        .map((q) => ({
          id: q.id,
          title: q.title,
          type: q.type,
          required: q.required,
          options:
            q.type !== "text"
              ? q.options.filter((opt) => opt.trim() !== "")
              : [],
        }));

      const updatedPayload = {
        title: editTitle,
        description: editDescriptionHtml,
        paid: editIsPaid,
        stipend: stipendValue,
        location: editLocation,
        job_type: editWorkType,
        duration: editWorkType === "internship" ? editDuration : "Full-Time",
        experience_level: editExperienceLevel,
        skills: editSkillsList,
        questions: formattedQuestions,
        attachment_url: docUrl,
      };

      const { error } = await supabase
        .from("jobs")
        .update(updatedPayload)
        .eq("id", selectedJob.id);

      if (error) throw error;

      const updatedJob = {
        ...selectedJob,
        ...updatedPayload,
      };

      setJobs((prev) =>
        prev.map((j) => (j.id === selectedJob.id ? updatedJob : j)),
      );
      setSelectedJob(updatedJob);
      setIsEditing(false);
      showToast("Job updated successfully!");
    } catch (err: any) {
      showToast(`Update failed: ${err.message}`, "error");
    } finally {
      setSavingJob(false);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard/recruiter", icon: LayoutDashboard },
    { name: "Jobs", href: "/dashboard/recruiter/jobs", icon: Briefcase },
    {
      name: "Applications",
      href: "/dashboard/recruiter/applications",
      icon: Users,
    },
  ];

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center text-red-500 font-medium">
        Loading Jobs...
      </div>
    );

  return (
    <div className="bg-white min-h-screen flex p-6 gap-6 text-black relative overflow-x-hidden font-sans">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* DELETE MODAL OVERLAY */}
      <AnimatePresence>
        {deleteTargetJob && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-gray-100 p-8 max-w-sm w-full shadow-[0_30px_70px_rgba(0,0,0,0.15)] text-center space-y-6"
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-100">
                <Trash2 size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  Purge Pipeline Position
                </h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-normal leading-relaxed px-2">
                  Are you absolutely certain you want to delete the{" "}
                  <span className="text-black font-black">
                    "{deleteTargetJob.title}"
                  </span>{" "}
                  track?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setDeleteTargetJob(null)}
                  className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  No, Cancel
                </button>
                <button
                  onClick={executeJobDeletion}
                  className="bg-black text-white text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-red-600 transition-colors shadow-md cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JOB PREVIEW & EDIT DRAWER */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col justify-between border-l border-gray-100 relative overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleEditMode}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                      isEditing
                        ? "bg-gray-200 text-gray-800"
                        : "bg-black text-white hover:bg-red-500"
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Eye size={15} /> View Live Preview
                      </>
                    ) : (
                      <>
                        <Edit3 size={15} /> Edit Full Job
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/recruiter/applications?job=${selectedJob.id}`,
                      )
                    }
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    View Applicants ({selectedJob.stats?.total || 0}){" "}
                    <ArrowRight size={15} />
                  </button>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                {!isEditing ? (
                  /* LIVE PREVIEW */
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border ${
                            selectedJob.status === "open"
                              ? "text-green-600 border-green-100 bg-green-50"
                              : "text-gray-400 border-gray-100 bg-gray-50"
                          }`}
                        >
                          {selectedJob.status}
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                          Posted on{" "}
                          {new Date(
                            selectedJob.created_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                        {selectedJob.title}
                      </h2>
                      <p className="text-sm font-bold text-gray-500 mt-1">
                        {company?.name || "Company"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Job Type
                        </p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">
                          {selectedJob.job_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Tenure
                        </p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">
                          {selectedJob.duration || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Location
                        </p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">
                          {selectedJob.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Stipend / Pay
                        </p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">
                          {selectedJob.stipend || "TBD"}
                        </p>
                      </div>
                    </div>

                    {selectedJob.skills && selectedJob.skills.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-wider">
                          Required Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills.map((skill: string) => (
                            <span
                              key={skill}
                              className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl border border-gray-200/50"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DANGEROUSLY SET INNER HTML PARSER */}
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-wider">
                        Mission Brief / Description
                      </h3>
                      <div
                        className="text-sm text-gray-800 font-medium leading-relaxed
                          [&_h1]:text-2xl [&_h1]:font-black [&_h1]:my-3 [&_h1]:text-black 
                          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_h2]:text-black 
                          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2 [&_h3]:text-black 
                          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 
                          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 
                          [&_li]:my-1 
                          [&_b]:font-black [&_strong]:font-black 
                          [&_u]:underline"
                        dangerouslySetInnerHTML={{
                          __html:
                            selectedJob.description ||
                            "No description provided.",
                        }}
                      />
                    </div>

                    {selectedJob.questions &&
                      selectedJob.questions.length > 0 && (
                        <div className="border-t border-gray-100 pt-6">
                          <h3 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-wider">
                            Screening Questions ({selectedJob.questions.length})
                          </h3>
                          <ul className="space-y-2">
                            {selectedJob.questions.map(
                              (q: any, idx: number) => (
                                <li
                                  key={idx}
                                  className="text-xs font-bold text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100"
                                >
                                  {idx + 1}.{" "}
                                  {typeof q === "string" ? q : q.title}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    {selectedJob.attachment_url && (
                      <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-wider">
                          Attached Dossier Brief
                        </h3>
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 max-w-fit">
                          <FileType size={18} className="text-gray-500" />
                          <span className="text-xs font-bold text-gray-700">
                            Attached Brief Document
                          </span>
                          <a
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/job-attachments/${selectedJob.attachment_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 hover:text-red-500 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* EDIT FORM WITH FULL QUESTIONS & ATTACHMENT BUILDER */
                  <form onSubmit={handleUpdateJob} className="space-y-6">
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-base font-black uppercase tracking-tight text-gray-900">
                        Update Mission Parameters
                      </h3>
                      <p className="text-xs text-gray-400">
                        Edit all posting details live for candidate views.
                      </p>
                    </div>

                    {/* Designation */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <Target size={14} className="text-black" /> Designation
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-[#F8F9FA] px-5 py-3.5 rounded-xl text-sm font-bold placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-black/5 uppercase"
                        required
                      />
                    </div>

                    {/* Mission Brief Native ContentEditable Rich Text Editor */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <Database size={14} className="text-black" /> Mission
                        Brief
                      </label>

                      {/* TOOLBAR */}
                      <div className="flex flex-wrap gap-1 bg-[#F8F9FA] p-2 rounded-t-xl border border-gray-100 border-b-0">
                        <button
                          type="button"
                          onClick={() => formatEditText("bold")}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.bold
                              ? "bg-black text-white"
                              : "hover:bg-white text-gray-600"
                          }`}
                          title="Bold"
                        >
                          <Bold size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatEditText("italic")}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.italic
                              ? "bg-black text-white"
                              : "hover:bg-white text-gray-600"
                          }`}
                          title="Italic"
                        >
                          <Italic size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatEditText("underline")}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.underline
                              ? "bg-black text-white"
                              : "hover:bg-white text-gray-600"
                          }`}
                          title="Underline"
                        >
                          <UnderlineIcon size={14} />
                        </button>

                        <div className="w-[1px] h-4 bg-gray-300 mx-1 self-center" />

                        <button
                          type="button"
                          onClick={() => formatEditText("formatBlock", "<h1>")}
                          className="p-1.5 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors cursor-pointer"
                          title="Heading 1"
                        >
                          <Heading1 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatEditText("formatBlock", "<h2>")}
                          className="p-1.5 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors cursor-pointer"
                          title="Heading 2"
                        >
                          <Heading2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatEditText("formatBlock", "<h3>")}
                          className="p-1.5 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors cursor-pointer"
                          title="Heading 3"
                        >
                          <Heading3 size={14} />
                        </button>

                        <div className="w-[1px] h-4 bg-gray-300 mx-1 self-center" />

                        <button
                          type="button"
                          onClick={() => formatEditText("insertUnorderedList")}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.insertUnorderedList
                              ? "bg-black text-white"
                              : "hover:bg-white text-gray-600"
                          }`}
                          title="Bullet List"
                        >
                          <List size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatEditText("insertOrderedList")}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeFormats.insertOrderedList
                              ? "bg-black text-white"
                              : "hover:bg-white text-gray-600"
                          }`}
                          title="Numbered List"
                        >
                          <ListOrdered size={14} />
                        </button>
                      </div>

                      {/* EDITOR DIV */}
                      <div className="relative border border-gray-100 rounded-b-xl bg-[#F8F9FA] overflow-hidden">
                        {!editDescriptionHtml && (
                          <div className="absolute top-3 left-4 text-xs font-medium text-gray-400 pointer-events-none select-none">
                            Write out job description, responsibilities, and
                            qualifications...
                          </div>
                        )}
                        <div
                          ref={editEditorRef}
                          contentEditable
                          onInput={handleEditEditorInput}
                          onKeyUp={checkActiveFormats}
                          onMouseUp={checkActiveFormats}
                          className="min-h-[200px] p-4 text-xs font-medium leading-relaxed text-gray-800 outline-none
                            [&_h1]:text-xl [&_h1]:font-black [&_h1]:my-2 [&_h1]:text-black 
                            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-2 [&_h2]:text-black 
                            [&_h3]:text-base [&_h3]:font-bold [&_h3]:my-1.5 [&_h3]:text-black 
                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 
                            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 
                            [&_li]:my-1 
                            [&_b]:font-black [&_strong]:font-black 
                            [&_u]:underline"
                        />
                      </div>
                    </div>

                    {/* Budgeting / Stipend */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <CreditCard size={14} className="text-black" />{" "}
                          Budgeting
                        </label>
                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                          <button
                            type="button"
                            onClick={() => setEditIsPaid(true)}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                              editIsPaid
                                ? "bg-black text-white shadow-sm"
                                : "text-gray-400"
                            }`}
                          >
                            Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditIsPaid(false)}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                              !editIsPaid
                                ? "bg-black text-white shadow-sm"
                                : "text-gray-400"
                            }`}
                          >
                            Unpaid
                          </button>
                        </div>
                      </div>

                      <div
                        className={`flex bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 transition-all ${
                          !editIsPaid
                            ? "opacity-30 pointer-events-none"
                            : "focus-within:border-gray-200"
                        }`}
                      >
                        <div className="relative border-r border-gray-200">
                          <select
                            value={editCurrency}
                            onChange={(e) => setEditCurrency(e.target.value)}
                            className="bg-white px-5 py-3.5 text-[10px] font-black appearance-none outline-none cursor-pointer"
                          >
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EURO">EUR</option>
                          </select>
                          <ChevronDown
                            size={10}
                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          placeholder="0.00"
                          value={editIsPaid ? editStipend : ""}
                          onChange={(e) => setEditStipend(e.target.value)}
                          className="flex-1 px-5 py-3.5 bg-transparent text-sm font-black outline-none"
                        />
                      </div>
                    </div>

                    {/* Class & Tenure */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          Class
                        </label>
                        <select
                          value={editWorkType}
                          onChange={(e) => setEditWorkType(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer"
                        >
                          <option value="full-time">Full-Time</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          Tenure
                        </label>
                        <select
                          disabled={editWorkType !== "internship"}
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer ${
                            editWorkType !== "internship" && "opacity-20"
                          }`}
                        >
                          <option value="1 Month">1 Mo</option>
                          <option value="3 Months">3 Mo</option>
                          <option value="3-6 Months">3-6 Mo</option>
                        </select>
                      </div>
                    </div>

                    {/* Location & Experience Level */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            size={14}
                          />
                          <input
                            type="text"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase outline-none"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          Experience Level
                        </label>
                        <div className="relative">
                          <Layers
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            size={14}
                          />
                          <select
                            value={editExperienceLevel}
                            onChange={(e) =>
                              setEditExperienceLevel(e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase outline-none appearance-none cursor-pointer"
                          >
                            <option value="fresher">FRESHER</option>
                            <option value="1-2 years">1-2 YEARS</option>
                            <option value="2-5 years">2-5 YEARS</option>
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tech Stack Skills */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <Zap size={14} className="text-black" /> Core Tech Stack
                      </label>
                      <div className="flex gap-2 bg-[#F8F9FA] p-2 rounded-xl border border-gray-100">
                        <input
                          placeholder="ADD SKILL (ENTER)..."
                          className="flex-1 bg-transparent px-3 py-1.5 outline-none text-xs font-black uppercase"
                          value={editSkillInput}
                          onChange={(e) => setEditSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addEditSkill();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={addEditSkill}
                          className="bg-black text-white p-2 rounded-lg hover:bg-[#FF3B30] transition-all cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {editSkillsList.map((skill) => (
                          <span
                            key={skill}
                            className="bg-white border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black tracking-widest shadow-sm"
                          >
                            {skill}
                            <X
                              size={12}
                              className="cursor-pointer hover:text-red-500 text-gray-400"
                              onClick={() => removeEditSkill(skill)}
                            />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* RESTORED: FULL GOOGLE FORMS QUESTION BUILDER FOR EDIT */}
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                          <ShieldCheck size={14} className="text-black" />{" "}
                          Screening Matrix Questions
                        </label>
                        <button
                          type="button"
                          onClick={addEditQuestion}
                          className="text-[9px] font-black uppercase bg-black text-white px-3 py-1.5 rounded-lg hover:bg-[#FF3B30] transition-all cursor-pointer"
                        >
                          + Add Question
                        </button>
                      </div>

                      <div className="space-y-4">
                        {editQuestions.map((q, i) => (
                          <div
                            key={q.id}
                            className="bg-white border border-gray-200 p-5 rounded-xl space-y-3 shadow-sm"
                          >
                            <div className="flex gap-3 items-center">
                              <span className="text-xs font-black text-gray-300">
                                0{i + 1}
                              </span>
                              <input
                                placeholder="Question Title (e.g. Years of React experience)..."
                                value={q.title}
                                onChange={(e) =>
                                  updateEditQuestion(
                                    q.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                className="flex-1 bg-gray-50 border border-gray-100 p-2.5 rounded-lg text-xs font-bold uppercase outline-none focus:border-black"
                              />
                              <select
                                value={q.type}
                                onChange={(e) =>
                                  updateEditQuestion(
                                    q.id,
                                    "type",
                                    e.target.value,
                                  )
                                }
                                className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg text-[10px] font-black uppercase outline-none cursor-pointer"
                              >
                                <option value="text">Fill in Text</option>
                                <option value="radio">Single Choice</option>
                                <option value="checkbox">
                                  Multiple Choice
                                </option>
                                <option value="dropdown">
                                  Dropdown Choice
                                </option>
                              </select>
                              {editQuestions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeEditQuestion(q.id)}
                                  className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>

                            {q.type !== "text" && (
                              <div className="pl-6 space-y-2 border-l-2 border-gray-100">
                                <p className="text-[9px] font-black uppercase text-gray-400">
                                  Options Matrix
                                </p>
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                                    <input
                                      placeholder={`Option ${optIdx + 1}`}
                                      value={opt}
                                      onChange={(e) =>
                                        updateEditQuestionOption(
                                          q.id,
                                          optIdx,
                                          e.target.value,
                                        )
                                      }
                                      className="flex-1 bg-gray-50 border border-gray-100 p-2 rounded-lg text-xs font-medium outline-none"
                                    />
                                    {q.options.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeEditQuestionOption(q.id, optIdx)
                                        }
                                        className="text-gray-300 hover:text-red-500 cursor-pointer"
                                      >
                                        <X size={14} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addEditQuestionOption(q.id)}
                                  className="text-[9px] font-black uppercase text-black hover:text-[#FF3B30] pt-1 cursor-pointer"
                                >
                                  + Add Option Choice
                                </button>
                              </div>
                            )}

                            <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-50">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">
                                Mandatory Field
                              </label>
                              <input
                                type="checkbox"
                                checked={q.required}
                                onChange={(e) =>
                                  updateEditQuestion(
                                    q.id,
                                    "required",
                                    e.target.checked,
                                  )
                                }
                                className="w-4 h-4 accent-black cursor-pointer"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RESTORED: DOSSIER FILE ATTACHMENT BRIEF UPLOAD */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Attachment Brief Document
                      </label>
                      <label className="flex flex-col items-center justify-center w-full h-28 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-black hover:bg-white transition-all group">
                        {!editAttachment ? (
                          <div className="flex flex-col items-center">
                            <Upload
                              size={18}
                              className="text-gray-300 mb-1 group-hover:text-black transition-colors"
                            />
                            <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400">
                              {editAttachmentUrl
                                ? "Replace Current Dossier Brief"
                                : "Link Dossier Brief"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-black px-4">
                            <FileType size={16} />
                            <span className="text-[10px] font-black truncate max-w-[200px] uppercase">
                              {editAttachment.name}
                            </span>
                            <X
                              size={14}
                              className="hover:text-red-500 transition-colors cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                setEditAttachment(null);
                              }}
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>

                    {/* Save Button */}
                    <button
                      type="submit"
                      disabled={savingJob}
                      className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-gray-200"
                    >
                      <Save size={16} />{" "}
                      {savingJob ? "COMMITTING UPDATES..." : "SAVE ALL UPDATES"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.div
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl p-4 shadow-[0_10px_30px_rgb(0,0,0,0.05)] bg-white border border-gray-50 flex flex-col justify-between h-[calc(100vh-48px)] sticky top-6"
      >
        <div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-6 hover:bg-gray-100 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <Menu />
          </button>

          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  className="w-full h-full object-cover"
                  alt="Company Logo"
                />
              ) : (
                <span className="font-bold text-gray-400">
                  {company?.name?.[0]}
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">
                  {company?.name || "Company"}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-tighter font-semibold">
                  Recruiter
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <a key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      active
                        ? "bg-red-500 text-white shadow-lg shadow-red-200"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon size={18} />
                    {!collapsed && (
                      <span className="font-medium text-sm">{item.name}</span>
                    )}
                  </motion.div>
                </a>
              );
            })}
          </div>
        </div>
        {!collapsed && (
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
              Shortcut
            </p>
            <p className="text-xs text-gray-500">⌘ + B to toggle</p>
          </div>
        )}
      </motion.div>

      {/* MAIN CONTENT */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 italic">
              Job Management<span className="text-red-500">.</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Create and track your hiring pipelines.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 cursor-pointer"
            >
              <RefreshCcw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={() => router.push("/dashboard/recruiter/jobs/create")}
              className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-xl shadow-gray-200 hover:bg-red-500 transition-colors cursor-pointer"
            >
              <Plus size={18} strokeWidth={3} /> Post Job
            </button>
          </div>
        </header>

        {/* JOB CARDS */}
        <div className="grid grid-cols-1 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {jobs.map((job) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key={job.id}
                className={`bg-white border-b-4 ${
                  job.status === "open"
                    ? "border-red-500"
                    : "border-gray-200 opacity-75"
                } rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all group`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => openJobDetails(job)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-black tracking-tight text-gray-900 group-hover:text-red-600 transition-colors">
                        {job.title}
                      </h2>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          job.status === "open"
                            ? "text-green-600 border-green-100 bg-green-50"
                            : "text-gray-400 border-gray-100 bg-gray-50"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-5 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-900" />{" "}
                        {job.job_type}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-900" />{" "}
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-900 font-black text-xs uppercase">
                        {job.stipend || "TBD"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.skills?.slice(0, 5).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-[10px] font-bold bg-gray-50 text-gray-500 px-3 py-1.5 rounded-xl border border-gray-100/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-6">
                    {/* Status Toggle */}
                    <div className="bg-gray-50 border border-gray-100 p-1 rounded-2xl flex items-center w-[140px] relative h-10 shadow-inner">
                      <motion.div
                        animate={{ x: job.status === "open" ? 0 : 66 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                        className="absolute h-8 w-[66px] bg-white rounded-[12px] shadow-md"
                      />
                      <button
                        onClick={() => toggleStatus(job)}
                        className={`relative flex-1 text-[10px] font-black uppercase z-10 cursor-pointer ${
                          job.status === "open"
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => toggleStatus(job)}
                        className={`relative flex-1 text-[10px] font-black uppercase z-10 cursor-pointer ${
                          job.status === "closed"
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        Closed
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteTargetJob(job)}
                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => openJobDetails(job)}
                        className="p-2.5 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200 hover:bg-red-500 transition-all cursor-pointer"
                      >
                        <ArrowRight size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* PIPELINE TRACK */}
                <div className="mt-8 flex items-center gap-2 border-t border-gray-50 pt-6">
                  <PipelineStep label="Applied" val={job.stats.total} />
                  <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden mx-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: job.stats.total > 0 ? "100%" : 0 }}
                      className="h-full bg-gray-200"
                    />
                  </div>
                  <PipelineStep
                    label="Shortlist"
                    val={job.stats.shortlisted}
                    color="text-blue-600"
                  />
                  <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden mx-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: job.stats.shortlisted > 0 ? "100%" : 0,
                      }}
                      className="h-full bg-blue-100"
                    />
                  </div>
                  <PipelineStep
                    label="Interview"
                    val={job.stats.interview}
                    color="text-amber-600"
                  />
                  <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden mx-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: job.stats.interview > 0 ? "100%" : 0 }}
                      className="h-full bg-amber-100"
                    />
                  </div>
                  <PipelineStep
                    label="Hired"
                    val={job.stats.hired}
                    color="text-green-600"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PipelineStep({ label, val, color = "text-gray-900" }: any) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <span className={`text-lg font-black tracking-tighter ${color}`}>
        {val}
      </span>
      <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400">
        {label}
      </span>
    </div>
  );
}

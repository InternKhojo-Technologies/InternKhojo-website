"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
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
import { useRecruiter } from "../layout";

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
    className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[250] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border ${
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
    <span className="text-xs sm:text-sm font-bold tracking-tight">
      {message}
    </span>
    <button
      onClick={onClose}
      className="ml-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
    >
      <X size={14} />
    </button>
  </motion.div>
);

export default function RecruiterJobsPage() {
  const { company } = useRecruiter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  const [editQuestions, setEditQuestions] = useState<QuestionItem[]>([]);
  const [editAttachment, setEditAttachment] = useState<File | null>(null);
  const [editAttachmentUrl, setEditAttachmentUrl] = useState<string | null>(
    null,
  );

  const editEditorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<{
    [key: string]: boolean;
  }>({});

  const router = useRouter();

  useEffect(() => {
    loadData();
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
        if (!statsMap[a.job_id]) {
          statsMap[a.job_id] = {
            total: 0,
            shortlisted: 0,
            interview: 0,
            hired: 0,
          };
        }
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

      const updatedJob = { ...selectedJob, ...updatedPayload };
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

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-red-500 font-medium">
        Loading Jobs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 max-w-sm w-full shadow-[0_30px_70px_rgba(0,0,0,0.15)] text-center space-y-5"
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-100">
                <Trash2 size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  Purge Pipeline Position
                </h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-normal leading-relaxed">
                  Delete{" "}
                  <span className="text-black font-black">
                    "{deleteTargetJob.title}"
                  </span>
                  ?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setDeleteTargetJob(null)}
                  className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeJobDeletion}
                  className="bg-black text-white text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-red-600 transition-colors shadow-md cursor-pointer"
                >
                  Delete
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
              className="bg-white w-full sm:max-w-2xl md:max-w-3xl h-full shadow-2xl flex flex-col justify-between border-l border-gray-100 relative overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={toggleEditMode}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer ${
                      isEditing
                        ? "bg-gray-200 text-gray-800"
                        : "bg-black text-white hover:bg-red-500"
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Eye size={14} /> Preview
                      </>
                    ) : (
                      <>
                        <Edit3 size={14} /> Edit
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/recruiter/applications?jobId=${selectedJob.id}`,
                      )
                    }
                    className="px-3 sm:px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer"
                  >
                    Applicants ({selectedJob.stats?.total || 0}){" "}
                    <ArrowRight size={14} />
                  </button>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
                {!isEditing ? (
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
                          Posted{" "}
                          {new Date(
                            selectedJob.created_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        {selectedJob.title}
                      </h2>
                      <p className="text-sm font-bold text-gray-500 mt-1">
                        {company?.name || "Company"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Job Type
                        </p>
                        <p className="text-xs font-black text-gray-900 mt-0.5 capitalize">
                          {selectedJob.job_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Tenure
                        </p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">
                          {selectedJob.duration || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Location
                        </p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">
                          {selectedJob.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Stipend / Pay
                        </p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">
                          {selectedJob.stipend || "TBD"}
                        </p>
                      </div>
                    </div>

                    {selectedJob.skills && selectedJob.skills.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">
                          Required Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
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
                  </div>
                ) : (
                  <form onSubmit={handleUpdateJob} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-[#F8F9FA] px-4 py-3 rounded-xl text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-black/5 uppercase"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Mission Brief
                      </label>
                      <div className="flex flex-wrap gap-1 bg-[#F8F9FA] p-2 rounded-t-xl border border-gray-100 border-b-0">
                        <button
                          type="button"
                          onClick={() => formatEditText("bold")}
                          className="p-1.5 hover:bg-white rounded-lg text-gray-600 cursor-pointer"
                        >
                          <Bold size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatEditText("italic")}
                          className="p-1.5 hover:bg-white rounded-lg text-gray-600 cursor-pointer"
                        >
                          <Italic size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatEditText("underline")}
                          className="p-1.5 hover:bg-white rounded-lg text-gray-600 cursor-pointer"
                        >
                          <UnderlineIcon size={14} />
                        </button>
                      </div>
                      <div className="border border-gray-100 rounded-b-xl bg-[#F8F9FA]">
                        <div
                          ref={editEditorRef}
                          contentEditable
                          onInput={handleEditEditorInput}
                          className="min-h-[160px] p-3 text-xs font-medium leading-relaxed text-gray-800 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-400">
                          Class
                        </label>
                        <select
                          value={editWorkType}
                          onChange={(e) => setEditWorkType(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold uppercase outline-none"
                        >
                          <option value="full-time">Full-Time</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-400">
                          Location
                        </label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold uppercase outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingJob}
                      className="w-full bg-black text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Save size={16} />{" "}
                      {savingJob ? "COMMITTING..." : "SAVE UPDATES"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 italic">
            Job Management<span className="text-red-500">.</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Create and track your hiring pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
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
            className="bg-black text-white px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-xs sm:text-sm shadow-md hover:bg-red-500 transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} /> Post Job
          </button>
        </div>
      </header>

      {/* JOB CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-16">
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
              } rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all group`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div
                  className="flex-1 cursor-pointer w-full"
                  onClick={() => openJobDetails(job)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 group-hover:text-red-600 transition-colors">
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

                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-900" />{" "}
                      {job.job_type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-gray-900" />{" "}
                      {job.location}
                    </span>
                    <span className="text-gray-900 font-black text-xs uppercase">
                      {job.stipend || "TBD"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.skills?.slice(0, 5).map((skill: string) => (
                      <span
                        key={skill}
                        className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2.5 py-1 rounded-xl border border-gray-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="bg-gray-50 border border-gray-100 p-1 rounded-2xl flex items-center w-[120px] sm:w-[130px] relative h-9 shadow-inner">
                    <motion.div
                      animate={{ x: job.status === "open" ? 0 : 58 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      className="absolute h-7 w-[58px] bg-white rounded-[10px] shadow-sm"
                    />
                    <button
                      onClick={() => toggleStatus(job)}
                      className={`relative flex-1 text-[9px] font-black uppercase z-10 cursor-pointer ${
                        job.status === "open"
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => toggleStatus(job)}
                      className={`relative flex-1 text-[9px] font-black uppercase z-10 cursor-pointer ${
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
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => openJobDetails(job)}
                      className="p-2 bg-gray-900 text-white rounded-xl shadow-md hover:bg-red-500 transition-all cursor-pointer"
                    >
                      <ArrowRight size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>

              {/* PIPELINE TRACK */}
              <div className="mt-6 flex items-center gap-1 sm:gap-2 border-t border-gray-50 pt-4 overflow-x-auto">
                <PipelineStep label="Applied" val={job.stats.total} />
                <div className="h-1 flex-1 min-w-[20px] bg-gray-100 rounded-full" />
                <PipelineStep
                  label="Shortlist"
                  val={job.stats.shortlisted}
                  color="text-blue-600"
                />
                <div className="h-1 flex-1 min-w-[20px] bg-gray-100 rounded-full" />
                <PipelineStep
                  label="Interview"
                  val={job.stats.interview}
                  color="text-amber-600"
                />
                <div className="h-1 flex-1 min-w-[20px] bg-gray-100 rounded-full" />
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
  );
}

function PipelineStep({ label, val, color = "text-gray-900" }: any) {
  return (
    <div className="flex flex-col items-center min-w-[50px] sm:min-w-[60px]">
      <span
        className={`text-base sm:text-lg font-black tracking-tighter ${color}`}
      >
        {val}
      </span>
      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter text-gray-400 truncate">
        {label}
      </span>
    </div>
  );
}

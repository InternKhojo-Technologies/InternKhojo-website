"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Upload,
  FileType,
  Zap,
  X,
  ArrowLeft,
  ChevronDown,
  Rocket,
  ShieldCheck,
  Target,
  Database,
  Layers,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionItem {
  id: string;
  type: "text" | "radio" | "checkbox" | "dropdown";
  title: string;
  options: string[];
  required: boolean;
}

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Core Form States
  const [title, setTitle] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [stipend, setStipend] = useState("");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState("internship");
  const [duration, setDuration] = useState("3-6 Months");
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [deadline, setDeadline] = useState("");

  // Rich Text ContentEditable Ref & Active Toolbar State
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<{
    [key: string]: boolean;
  }>({});

  // Skill & Question Matrices
  const [skillInput, setSkillInput] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: "q_1",
      type: "text",
      title: "",
      options: [""],
      required: false,
    },
  ]);
  const [attachment, setAttachment] = useState<File | null>(null);

  // Identity Profiles
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // CUSTOM TOAST STATES
  const [customToast, setCustomToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    securityCheck();
  }, []);

  const triggerCustomToast = (message: string, type: "success" | "error") => {
    setCustomToast({ show: true, message, type });
    setTimeout(() => {
      setCustomToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const securityCheck = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthorized(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, company_id")
        .eq("id", user.id)
        .single();
      if (!profile || profile.role !== "recruiter") {
        setIsAuthorized(false);
        return;
      }
      setIsAuthorized(true);
      if (profile?.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profile.company_id)
          .single();
        if (companyData) setCompanyProfile(companyData);
      }
    } catch (err) {
      setIsAuthorized(false);
    }
  };

  // --- NATIVE RICH TEXT COMMAND EXECUTION ---
  const formatText = (
    command: string,
    value: string | undefined = undefined,
  ) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescriptionHtml(editorRef.current.innerHTML);
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

  const handleEditorInput = () => {
    if (editorRef.current) {
      setDescriptionHtml(editorRef.current.innerHTML);
      checkActiveFormats();
    }
  };

  // --- QUESTION BUILDER HELPERS ---
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        type: "text",
        title: "",
        options: [""],
        required: false,
      },
    ]);
  };

  const updateQuestion = (id: string, key: keyof QuestionItem, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [key]: value } : q)),
    );
  };

  const addQuestionOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  };

  const updateQuestionOption = (
    questionId: string,
    optIdx: number,
    value: string,
  ) => {
    setQuestions((prev) =>
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

  const removeQuestionOption = (questionId: string, optIdx: number) => {
    setQuestions((prev) =>
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

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const addSkill = () => {
    if (
      skillInput.trim() &&
      !skillsList.includes(skillInput.trim().toUpperCase())
    ) {
      setSkillsList([...skillsList, skillInput.trim().toUpperCase()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const resetForm = () => {
    setTitle("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setDescriptionHtml("");
    setStipend("");
    setLocation("");
    setDeadline("");
    setSkillsList([]);
    setQuestions([
      {
        id: "q_1",
        type: "text",
        title: "",
        options: [""],
        required: false,
      },
    ]);
    setAttachment(null);
    setIsPaid(true);
    setSkillInput("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setAttachment(file);
    } else if (file) {
      triggerCustomToast("File limit 10MB overflow.", "error");
    }
  };

  const handleCreateIntent = () => {
    const cleanText = descriptionHtml.replace(/<[^>]*>/g, "").trim();
    if (!title || !cleanText || (isPaid && !stipend)) {
      triggerCustomToast(
        "Please fill out all necessary structural details.",
        "error",
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const executeDeploymentPipeline = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth session expired.");

      let docUrl = null;
      if (attachment) {
        const fileName = `${user.id}/${Date.now()}-${attachment.name.replace(/\s/g, "_")}`;
        const { data, error: uploadError } = await supabase.storage
          .from("job-attachments")
          .upload(fileName, attachment);
        if (uploadError) throw uploadError;
        docUrl = data?.path;
      }

      const stipendValue = isPaid
        ? `${currency === "INR" ? "₹" : currency === "USD" ? "$" : "€"}${stipend}`
        : "Unpaid";

      const formattedQuestions = questions
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

      const { data: newJob, error: insertError } = await supabase
        .from("jobs")
        .insert({
          title,
          description: descriptionHtml,
          job_mode: "company",
          created_by: user.id,
          recruiter_id: user.id,
          company_id: companyProfile.id,
          paid: isPaid,
          stipend: stipendValue,
          location,
          job_type: workType,
          duration: workType === "internship" ? duration : "Full-Time",
          experience_level: experienceLevel,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          skills: skillsList,
          questions: formattedQuestions,
          attachment_url: docUrl,
          status: "open",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      triggerCustomToast(
        "Job created successfully! Pipeline broadcast active.",
        "success",
      );
      resetForm();
    } catch (err: any) {
      console.error("Post Error:", err);
      triggerCustomToast(`Deployment failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthorized === false)
    return (
      <div className="h-screen flex items-center justify-center font-black text-[10px] uppercase tracking-widest">
        Access_Denied
      </div>
    );
  if (isAuthorized === null)
    return (
      <div className="h-screen flex items-center justify-center font-black text-[10px] animate-pulse uppercase">
        Syncing...
      </div>
    );

  const isCompanyVerified = companyProfile?.verified === true;

  return (
    <div className="bg-[#FBFCFD] min-h-screen text-[#111] font-sans selection:bg-black selection:text-white pb-20 relative overflow-x-hidden">
      {/* CUSTOM TOAST */}
      <AnimatePresence>
        {customToast.show && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 bg-black text-white px-5 py-4 rounded-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] select-none pointer-events-auto"
          >
            {customToast.type === "success" ? (
              <CheckCircle
                size={16}
                className="text-emerald-400 flex-shrink-0"
              />
            ) : (
              <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              {customToast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-gray-100 p-8 max-w-sm w-full shadow-[0_30px_70px_rgba(0,0,0,0.15)] text-center space-y-6"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-black border border-gray-100">
                <Rocket size={20} className="animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  Confirm Transmission
                </h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-normal leading-relaxed px-2">
                  Do you really want to commit this assignment track to live
                  candidate broadcast loops?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  No, Abort
                </button>
                <button
                  onClick={executeDeploymentPipeline}
                  className="bg-black text-white text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#FF3B30] transition-colors shadow-md cursor-pointer"
                >
                  Yes, Commit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOP BAR */}
      <nav className="max-w-[1300px] mx-auto px-8 py-8 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <button
            onClick={() => router.push("/dashboard/recruiter/jobs")}
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase hover:opacity-50 transition-opacity cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Back
          </button>
          <div className="h-4 w-[1px] bg-gray-200" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Editor / v2.4
          </span>
        </div>

        <div className="flex items-center gap-5 bg-white pl-8 pr-3 py-3 rounded-full border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="text-right leading-none">
            <p className="text-[15px] font-black tracking-tighter mb-1.5 text-black">
              {companyProfile?.name || "InternKhojo"}
            </p>
            <div className="flex items-center justify-end gap-2">
              <span
                className={`text-[9px] font-black uppercase tracking-[0.15em] ${
                  isCompanyVerified ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {isCompanyVerified
                  ? "Verified Recruiter"
                  : "Not a Verified Recruiter"}
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isCompanyVerified
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                }`}
              />
            </div>
          </div>

          <div className="relative w-12 h-12 rounded-full p-0.5 bg-white flex items-center justify-center shadow-[0_8px_20px_-5px_rgba(0,0,0,0.15)] border border-gray-50">
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white">
              {companyProfile?.logo_url ? (
                <img
                  src={companyProfile.logo_url}
                  className="w-full h-full object-cover"
                  alt="Logo"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full mb-[-3px] ml-[-4px]" />
                  <span className="text-black text-xl font-black italic leading-none">
                    k
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 px-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10">
            <header className="border-b border-gray-50 pb-6 text-black">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                Establish Mission<span className="text-[#FF3B30]">.</span>
              </h1>
            </header>

            {/* POSITION DESIGNATION */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                <Target size={14} className="text-black" /> Designation{" "}
                <span className="text-[#FF3B30] text-sm">*</span>
              </label>
              <input
                placeholder="E.G. SR. PRODUCT DESIGNER"
                className="w-full bg-[#F8F9FA] px-6 py-4 rounded-xl text-lg font-bold placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-black/5 transition-all uppercase"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* MISSION BRIEF RICH TEXT EDITOR */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                <Database size={14} className="text-black" /> Mission Brief (JD){" "}
                <span className="text-[#FF3B30] text-sm">*</span>
              </label>

              {/* TOOLBAR */}
              <div className="flex flex-wrap gap-1 bg-[#F8F9FA] p-2 rounded-t-2xl border border-gray-100 border-b-0">
                <button
                  type="button"
                  onClick={() => formatText("bold")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    activeFormats.bold
                      ? "bg-black text-white"
                      : "hover:bg-white text-gray-600"
                  }`}
                  title="Bold"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("italic")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    activeFormats.italic
                      ? "bg-black text-white"
                      : "hover:bg-white text-gray-600"
                  }`}
                  title="Italic"
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("underline")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    activeFormats.underline
                      ? "bg-black text-white"
                      : "hover:bg-white text-gray-600"
                  }`}
                  title="Underline"
                >
                  <UnderlineIcon size={15} />
                </button>

                <div className="w-[1px] h-5 bg-gray-300 mx-1 self-center" />

                <button
                  type="button"
                  onClick={() => formatText("formatBlock", "<h1>")}
                  className="p-2 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors cursor-pointer"
                  title="Heading 1"
                >
                  <Heading1 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("formatBlock", "<h2>")}
                  className="p-2 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors cursor-pointer"
                  title="Heading 2"
                >
                  <Heading2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("formatBlock", "<h3>")}
                  className="p-2 hover:bg-white rounded-lg text-gray-600 hover:text-black transition-colors cursor-pointer"
                  title="Heading 3"
                >
                  <Heading3 size={15} />
                </button>

                <div className="w-[1px] h-5 bg-gray-300 mx-1 self-center" />

                <button
                  type="button"
                  onClick={() => formatText("insertUnorderedList")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    activeFormats.insertUnorderedList
                      ? "bg-black text-white"
                      : "hover:bg-white text-gray-600"
                  }`}
                  title="Bullet List"
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("insertOrderedList")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    activeFormats.insertOrderedList
                      ? "bg-black text-white"
                      : "hover:bg-white text-gray-600"
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered size={15} />
                </button>
              </div>

              {/* EDITOR DIV WITH WATERMARK PLACEHOLDER & VISUAL STYLING RULES */}
              <div className="relative border border-gray-100 rounded-b-[1.5rem] bg-[#F8F9FA] overflow-hidden">
                {!descriptionHtml && (
                  <div className="absolute top-4 left-4 text-sm font-medium text-gray-400 pointer-events-none select-none">
                    Write out job description, responsibilities, and
                    qualifications...
                  </div>
                )}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  onKeyUp={checkActiveFormats}
                  onMouseUp={checkActiveFormats}
                  className="min-h-[220px] p-4 text-sm font-medium leading-relaxed text-gray-800 outline-none
                    [&_h1]:text-2xl [&_h1]:font-black [&_h1]:my-3 [&_h1]:text-black 
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_h2]:text-black 
                    [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2 [&_h3]:text-black 
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 
                    [&_li]:my-1 
                    [&_b]:font-black [&_strong]:font-black 
                    [&_u]:underline"
                />
              </div>
            </div>

            {/* TECH STACK */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                <Zap size={14} className="text-black" /> Core Tech Stack
              </label>
              <div className="flex gap-3 bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100">
                <input
                  placeholder="ADD SKILL (ENTER)..."
                  className="flex-1 bg-transparent px-3 py-2 outline-none text-xs font-black uppercase"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-black text-white p-2 rounded-xl hover:bg-[#FF3B30] transition-all cursor-pointer"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <AnimatePresence>
                  {skillsList.map((skill) => (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      key={skill}
                      className="bg-white border border-gray-100 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm"
                    >
                      <span className="text-[10px] font-black tracking-widest">
                        {skill}
                      </span>
                      <X
                        size={12}
                        className="cursor-pointer hover:text-red-500 text-gray-400"
                        onClick={() => removeSkill(skill)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* SCREENING MATRIX */}
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center px-1">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <ShieldCheck size={14} className="text-black" /> Screening
                  Matrix Questions
                </label>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-[9px] font-black uppercase bg-black text-white px-4 py-2 rounded-xl hover:bg-[#FF3B30] transition-all shadow-md cursor-pointer"
                >
                  + Add Question
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="bg-white border border-gray-200 p-6 rounded-2xl space-y-4 shadow-sm"
                  >
                    <div className="flex gap-4 items-center">
                      <span className="text-xs font-black text-gray-300">
                        0{i + 1}
                      </span>
                      <input
                        placeholder="Question Title (e.g. Years of React experience)..."
                        value={q.title}
                        onChange={(e) =>
                          updateQuestion(q.id, "title", e.target.value)
                        }
                        className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-bold uppercase outline-none focus:border-black"
                      />
                      <select
                        value={q.type}
                        onChange={(e) =>
                          updateQuestion(q.id, "type", e.target.value)
                        }
                        className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer"
                      >
                        <option value="text">Fill in Text</option>
                        <option value="radio">Single Choice</option>
                        <option value="checkbox">Multiple Choice</option>
                        <option value="dropdown">Dropdown Choice</option>
                      </select>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(q.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {q.type !== "text" && (
                      <div className="pl-8 space-y-2 border-l-2 border-gray-100">
                        <p className="text-[9px] font-black uppercase text-gray-400">
                          Options Matrix
                        </p>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-300" />
                            <input
                              placeholder={`Option ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) =>
                                updateQuestionOption(
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
                                  removeQuestionOption(q.id, optIdx)
                                }
                                className="text-gray-300 hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addQuestionOption(q.id)}
                          className="text-[9px] font-black uppercase text-black hover:text-[#FF3B30] pt-1"
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
                          updateQuestion(q.id, "required", e.target.checked)
                        }
                        className="w-4 h-4 accent-black cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 sticky top-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 text-center border-b border-gray-50 pb-4">
              Specifications
            </h3>

            <div className="space-y-6">
              {/* BUDGETING */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <CreditCard size={12} /> Budgeting{" "}
                    {isPaid && <span className="text-[#FF3B30]">*</span>}
                  </label>
                  <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsPaid(true)}
                      className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                        isPaid
                          ? "bg-black text-white shadow-sm"
                          : "text-gray-400"
                      }`}
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPaid(false)}
                      className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                        !isPaid
                          ? "bg-black text-white shadow-sm"
                          : "text-gray-400"
                      }`}
                    >
                      Unpaid
                    </button>
                  </div>
                </div>
                <div
                  className={`flex bg-gray-50 rounded-2xl overflow-hidden border border-transparent transition-all ${
                    !isPaid
                      ? "opacity-30 pointer-events-none"
                      : "focus-within:border-gray-200"
                  }`}
                >
                  <div className="relative border-r border-gray-200">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="bg-white px-5 py-4 text-[10px] font-black appearance-none outline-none cursor-pointer"
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
                    placeholder="0.00"
                    type="number"
                    min="0"
                    className="flex-1 px-6 py-4 bg-transparent text-sm font-black outline-none"
                    value={isPaid ? stipend : ""}
                    onChange={(e) =>
                      setStipend(
                        Math.max(0, parseInt(e.target.value) || 0).toString(),
                      )
                    }
                  />
                </div>
              </div>

              {/* CLASS & TENURE */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Class
                  </label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Tenure
                  </label>
                  <select
                    disabled={workType !== "internship"}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className={`w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer ${
                      workType !== "internship" && "opacity-20"
                    }`}
                  >
                    <option value="1 Month">1 Mo</option>
                    <option value="3 Months">3 Mo</option>
                    <option value="3-6 Months">3-6 Mo</option>
                  </select>
                </div>
              </div>

              {/* LOCATION & EXPERIENCE */}
              <div className="space-y-4">
                <div className="relative">
                  <MapPin
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
                    size={14}
                  />
                  <input
                    placeholder="LOCATION..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-gray-200"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Layers
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
                    size={14}
                  />
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase outline-none appearance-none cursor-pointer"
                  >
                    <option value="fresher">FRESHER</option>
                    <option value="1-2 years">1-2 YEARS</option>
                    <option value="2-5 years">2-5 YEARS</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                  />
                </div>
              </div>

              {/* APPLICATION DEADLINE PICKER */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1.5">
                  <Calendar size={12} /> Application Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold uppercase outline-none focus:border-black cursor-pointer"
                />
              </div>

              {/* DOSSIER BRIEF */}
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 cursor-pointer hover:border-black hover:bg-white transition-all group">
                  {!attachment ? (
                    <>
                      <Upload
                        size={18}
                        className="text-gray-300 mb-2 group-hover:text-black transition-colors"
                      />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400">
                        Link Dossier Brief
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 text-black px-4">
                      <FileType size={16} />
                      <span className="text-[10px] font-black truncate max-w-[200px] uppercase">
                        {attachment.name}
                      </span>
                      <X
                        size={14}
                        className="hover:text-[#FF3B30] transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          setAttachment(null);
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
            </div>

            <div className="pt-4">
              <button
                onClick={handleCreateIntent}
                disabled={loading || !companyProfile}
                className="w-full bg-black text-white py-6 rounded-[1.8rem] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] hover:bg-[#FF3B30] transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:bg-gray-200 disabled:shadow-none cursor-pointer"
              >
                {loading ? (
                  "INITIALIZING..."
                ) : (
                  <>
                    COMMIT POST <Rocket size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

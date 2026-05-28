"use client";

import { useEffect, useState } from "react";
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
  DollarSign,
  Clock,
} from "lucide-react";

// --- CUSTOM TOAST NOTIFICATION ---
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
      className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
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

  // 🔥 CUSTOM DELETE DIALOG OVERLAY STATE
  const [deleteTargetJob, setDeleteTargetJob] = useState<any | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadData();
  }, []);

  // Sidebar shortcut logic
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
      showToast(`Job is now ${newStatus.toUpperCase()}`);
    }
  };

  // 🔥 CORE REMOVE EXECUTION PIPELINE
  const executeJobDeletion = async () => {
    if (!deleteTargetJob) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", deleteTargetJob.id);

      if (error) throw error;

      setJobs((prev) => prev.filter((j) => j.id !== deleteTargetJob.id));
      showToast("Job removed successfully");
    } catch (err) {
      showToast("Failed to remove job", "error");
    } finally {
      setDeleteTargetJob(null);
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
    <div className="bg-white min-h-screen flex p-6 gap-6 text-black relative overflow-x-hidden">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* 🔥 DYNAMIC BENTO GUARD DELETE MODAL OVERLAY */}
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
                  track? This matrix operational data branch cannot be
                  recovered.
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

      {/* SIDEBAR - EXACTLY SAME AS DASHBOARD */}
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${active ? "bg-red-500 text-white shadow-lg shadow-red-200" : "hover:bg-gray-100 text-gray-600"}`}
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
                className={`bg-white border-b-4 ${job.status === "open" ? "border-red-500" : "border-gray-200 opacity-75"} rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all group`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/dashboard/recruiter/applications?job=${job.id}`,
                      )
                    }
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-black tracking-tight text-gray-900 group-hover:text-red-600 transition-colors">
                        {job.title}
                      </h2>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${job.status === "open" ? "text-green-600 border-green-100 bg-green-50" : "text-gray-400 border-gray-100 bg-gray-50"}`}
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
                        <DollarSign size={13} /> {job.stipend || "TBD"}
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
                        className={`relative flex-1 text-[10px] font-black uppercase z-10 cursor-pointer ${job.status === "open" ? "text-gray-900" : "text-gray-400"}`}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => toggleStatus(job)}
                        className={`relative flex-1 text-[10px] font-black uppercase z-10 cursor-pointer ${job.status === "closed" ? "text-red-500" : "text-gray-400"}`}
                      >
                        Closed
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteTargetJob(job)} // 🔥 Opens local premium bento modal confirmation
                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/recruiter/applications?job=${job.id}`,
                          )
                        }
                        className="p-2.5 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200 hover:bg-red-500 transition-all cursor-pointer"
                      >
                        <ArrowRight size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* --- PIPELINE TRACK (LINES RETURNING) --- */}
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

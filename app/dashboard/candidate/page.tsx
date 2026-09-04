"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  FileText,
  Eye,
  Upload,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronRight,
  RefreshCcw,
  Briefcase,
  Bookmark,
  Plus,
  Filter,
  Trash2,
  X,
  User,
  Circle,
} from "lucide-react";

// Helper for relative time
function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "now";
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(diff / 3600);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), {
  ssr: false,
});
const Area = dynamic(() => import("recharts").then((m) => m.Area), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});

export default function CandidateDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [dateRange, setDateRange] = useState(7); // 7, 30, or 90 days

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stages = ["pending", "shortlisted", "interview", "hired", "rejected"];

  useEffect(() => {
    setHasMounted(true);
    loadData();
  }, [dateRange]); // Reload data when date range changes

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [profRes, appRes, resumeRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("applications")
          .select(`*, jobs!applications_job_id_fkey (title)`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_resumes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setProfile(profRes.data);
      setApps(appRes.data || []);
      setResumes(resumeRes.data || []);
      const active =
        resumeRes.data?.find((r: any) => r.is_active) || resumeRes.data?.[0];
      setSelectedResume(active);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const uploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (resumes.length >= 4) {
      alert("Vault Limit: Max 4 resumes allowed.");
      return;
    }
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const filePath = `${user?.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resume")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("resume").getPublicUrl(filePath);
      const { data: newResume } = await supabase
        .from("user_resumes")
        .insert({
          user_id: user?.id,
          original_filename: file.name,
          resume_url: publicUrl,
          is_active: true,
        })
        .select()
        .single();

      await supabase
        .from("profiles")
        .update({ resume_url: publicUrl })
        .eq("id", user?.id);
      loadData();
    } catch (error) {
      console.error("Upload Error:", error);
    } finally {
      setUploading(false);
    }
  };

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = dateRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayLabel = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const count = apps.filter(
        (a) => new Date(a.created_at).toDateString() === d.toDateString(),
      ).length;
      data.push({ name: dayLabel, value: count });
    }
    return data;
  }, [apps, dateRange]);

  const filteredApps = useMemo(() => {
    if (!activeFilter) return apps;
    return apps.filter(
      (a) => a.stage?.toLowerCase() === activeFilter.toLowerCase(),
    );
  }, [apps, activeFilter]);

  if (loading) return <SkeletonLoader />;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#111]   antialiased">
      <div className="max-w-[1400px] mx-auto p-4 md:p-10 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter   leading-none">
              COMMAND <span className="text-red-600">CENTER</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
              <Circle size={8} className="fill-green-500 text-green-500" />
              STATUS: SECURE_AUTH / {profile?.name || "AADI"}
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* ANALYTICS */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Applied" value={apps.length} />
              <StatCard
                label="Shortlisted"
                value={apps.filter((a) => a.stage === "shortlisted").length}
                red
              />
              <StatCard
                label="Interview"
                value={apps.filter((a) => a.stage === "interview").length}
              />
              <StatCard
                label="Hired"
                value={apps.filter((a) => a.stage === "hired").length}
              />
            </div>

            <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400  ">
                  Application Velocity
                </h3>

                {/* INTEGRATED CHART CONTROLS */}
                <div className="flex items-center gap-2">
                  <div className="bg-gray-50 border border-gray-100 p-1 rounded-xl flex gap-1">
                    {[7, 30, 90].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDateRange(d)}
                        className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${dateRange === d ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
                      >
                        {d}D
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={loadData}
                    className="p-2 bg-white border border-gray-100 rounded-xl hover:text-red-600 transition-all text-gray-400"
                  >
                    <RefreshCcw size={14} />
                  </button>
                </div>
              </div>

              <div className="h-[300px] w-full min-h-[300px]">
                {hasMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="#EF4444"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#EF4444"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: 800,
                          fill: "#9CA3AF",
                        }}
                        dy={15}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}`, "Posting Applied :"]}
                        separator=" "
                        contentStyle={{
                          borderRadius: "20px",
                          border: "none",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#EF4444"
                        strokeWidth={4}
                        fill="url(#vGrad)"
                        dot={{
                          r: 6,
                          fill: "#FFF",
                          stroke: "#EF4444",
                          strokeWidth: 3,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            {/* QUICK ACTIONS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SidebarAction
                icon={<Briefcase size={18} />}
                label="Job Search"
                href="/find/jobs"
              />
              <SidebarAction
                icon={<Bookmark size={18} />}
                label="Saved Roles"
                href="/dashboard/candidate/saved"
              />
              <SidebarAction
                icon={<User size={18} />}
                label="My Profile"
                href="/profile"
              />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400  ">
                  Resume Vault
                </h3>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={uploadResume}
                  className="hidden"
                  accept=".pdf"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2.5 bg-black text-white rounded-xl hover:bg-red-600 transition-all"
                >
                  {uploading ? (
                    <RefreshCcw size={14} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-2 mb-8 max-h-[280px] overflow-y-auto pr-1">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => setSelectedResume(resume)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${selectedResume?.id === resume.id ? "border-red-100 bg-red-50/40" : "border-gray-50 hover:bg-gray-100  "}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText
                        size={18}
                        className={
                          selectedResume?.id === resume.id
                            ? "text-red-600"
                            : "text-gray-300"
                        }
                      />
                      <p className="text-[10px] font-bold truncate text-gray-700 uppercase tracking-tight">
                        {resume.original_filename}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedResume?.id === resume.id && (
                        <CheckCircle2 size={12} className="text-red-600" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          supabase
                            .from("user_resumes")
                            .delete()
                            .eq("id", resume.id)
                            .then(() => loadData());
                        }}
                        className="p-1.5 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsPreviewOpen(true)}
                className="w-full py-5 bg-gray-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl"
              >
                Preview Selection
              </button>
            </section>

            <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400  ">
                  Applied Roles
                </h3>
                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`p-2 rounded-lg transition-all ${activeFilter ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400 hover:text-black"}`}
                  >
                    <Filter size={14} />
                  </button>
                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            setActiveFilter(null);
                            setIsFilterOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 border-b border-gray-50"
                        >
                          All
                        </button>
                        {stages.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setActiveFilter(s);
                              setIsFilterOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 border-b border-gray-50 last:border-0"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-4">
                {filteredApps.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                      No Applications
                    </p>
                    <p className="text-[9px] mt-2">
                      Nothing found for this filter
                    </p>
                  </div>
                ) : (
                  filteredApps.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-[11px] font-bold uppercase truncate text-gray-800 tracking-tight group-hover:text-red-600 transition-colors">
                          {a.jobs?.title}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 flex items-center gap-1.5">
                          <Clock size={10} /> {timeAgo(a.created_at)}
                        </p>
                      </div>
                      <span
                        className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                          a.stage === "hired"
                            ? "bg-green-50 border-green-200 text-green-600"
                            : "bg-gray-50 border-gray-100 text-gray-400"
                        }`}
                      >
                        {a.stage || "pending"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white w-full max-w-6xl h-[90vh] rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                    <FileText size={28} />
                  </div>
                  <h2 className="font-black uppercase tracking-tight text-xl  ">
                    {selectedResume?.original_filename || "SYSTEM_DOC.pdf"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-3 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 bg-gray-50 p-8">
                {selectedResume?.resume_url && (
                  <iframe
                    src={selectedResume.resume_url}
                    className="w-full h-full rounded-[2.5rem] bg-white border border-gray-100 shadow-inner"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, red }: any) {
  return (
    <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:border-red-100 transition-all group text-center md:text-left">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 group-hover:text-red-500 transition-colors   leading-none">
        {label}
      </p>
      <p
        className={`text-4xl font-black   tracking-tighter leading-none   ${red ? "text-red-600" : "text-black"}`}
      >
        {value}
      </p>
    </div>
  );
}

function SidebarAction({ icon, label, href }: any) {
  return (
    <a
      href={href}
      className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[2rem] transition-all group hover:shadow-[0_20px_40px_-10px_rgba(239,68,68,0.12)]"
    >
      <div className="flex items-center gap-4">
        <span className="text-gray-400 group-hover:text-red-600 transition-colors">
          {icon}
        </span>
        <span className="text-[11px] font-black uppercase tracking-widest text-gray-600 group-hover:text-black  ">
          {label}
        </span>
      </div>
      <ChevronRight
        size={14}
        className="text-gray-200 group-hover:text-red-600 group-hover:translate-x-1 transition-all"
      />
    </a>
  );
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse  ">
        Syncing Portal
      </p>
    </div>
  );
}

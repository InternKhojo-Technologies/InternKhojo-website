"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Menu,
  RefreshCcw,
  ChevronRight,
  User,
  ExternalLink,
  X,
  Search,
  ChevronDown,
  Mail,
  Calendar,
  HelpCircle,
  Inbox,
  CheckCircle2,
  Zap,
  ArrowRight,
  Clock,
  Target,
} from "lucide-react";

/**
 * FINAL BOSS RECRUITER TERMINAL
 * Includes:
 * - Automatic job filtering from URL params
 * - Fixed Sidebar Logo UI
 * - High-density "Opportunity" Table
 * - Detailed Dossier Intelligence Drawer
 */

export default function RecruiterApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center font-black uppercase text-[10px] tracking-[0.8em] text-[#FF3B30] animate-pulse">
          Syncing Terminal...
        </div>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}

function ApplicationsContent() {
  const [loading, setLoading] = useState(true);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // URL Parameter Handling
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "all";
  const [jobFilter, setJobFilter] = useState(initialJobId);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkRoleAndLoad();
  }, []);

  // Update filter if the user clicks a job from another page
  useEffect(() => {
    const jobId = searchParams.get("jobId");
    if (jobId) setJobFilter(jobId);
  }, [searchParams]);

  const checkRoleAndLoad = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, company_id")
        .eq("id", user.id)
        .single();
      if (!profile || profile.role !== "recruiter") {
        router.push("/dashboard/candidate");
        return;
      }
      setIsRecruiter(true);

      if (profile?.company_id) {
        const { data: comp } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profile.company_id)
          .single();
        setCompany(comp);

        const { data: apps, error: appsError } = await supabase
          .from("applications")
          .select(
            `*, profiles:user_id (name, email, avatar_url), jobs:jobs!applications_job_id_fkey (id, title, company_id)`,
          )
          .order("created_at", { ascending: false });

        if (appsError) throw appsError;
        setApplications(apps || []);
      }
    } catch (err: any) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (appId: string, stage: string) => {
    const oldApps = [...applications];
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, stage } : a)),
    );
    if (selectedApp?.id === appId) setSelectedApp({ ...selectedApp, stage });

    const { error } = await supabase
      .from("applications")
      .update({ stage })
      .eq("id", appId);
    if (error) {
      setApplications(oldApps);
      alert("Cloud sync failed.");
    }
  };

  const uniqueJobs = Array.from(
    new Set(
      applications.map((a) =>
        JSON.stringify({ id: a.jobs?.id, title: a.jobs?.title }),
      ),
    ),
  ).map((j) => JSON.parse(j));

  const filteredApps = applications.filter((app) => {
    const nameMatch = app.profiles?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const statusMatch =
      statusFilter === "ALL" || app.stage?.toUpperCase() === statusFilter;
    const jobMatch = jobFilter === "all" || app.jobs?.id === jobFilter;
    return nameMatch && statusMatch && jobMatch;
  });

  const getStatusColor = (stage: string) => {
    const s = stage?.toUpperCase() || "PENDING";
    switch (s) {
      case "HIRED":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "SHORTLISTED":
        return "text-indigo-600 bg-indigo-50 border-indigo-100";
      case "INTERVIEW":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "REJECTED":
        return "text-rose-600 bg-rose-50 border-rose-100";
      default:
        return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-black uppercase text-[10px] tracking-[0.8em] text-[#FF3B30] animate-pulse">
        Establishing Connection...
      </div>
    );

  return (
    <div className="bg-[#FBFCFD] min-h-screen flex p-6 gap-6 text-[#111] font-sans">
      {/* SIDEBAR - LOCKED UI WITH FIXED LOGO */}
      <motion.div
        animate={{ width: collapsed ? 80 : 260 }}
        className="rounded-[2rem] p-6 bg-white border border-gray-100 flex flex-col justify-between h-[calc(100vh-48px)] sticky top-6 shadow-sm"
      >
        <div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-10 hover:bg-gray-50 p-2.5 rounded-xl transition-all text-gray-400"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-4 mb-14 px-1">
            <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 border border-gray-100 rounded-xl opacity-50" />
              <div className="relative z-10 flex flex-col items-center">
                <span className="w-2.5 h-2.5 bg-[#FF3B30] rounded-full mb-0.5 ml-[-4px]" />
                <span className="text-2xl font-black italic leading-none tracking-tighter">
                  k
                </span>
              </div>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-[19px] font-black tracking-tight text-gray-900 leading-none mb-1">
                  InternKhojo
                </p>
                <p className="text-[11px] text-[#94A3B8] font-black uppercase tracking-[0.15em]">
                  RECRUITER
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {[
              {
                name: "Dashboard",
                href: "/dashboard/recruiter",
                icon: LayoutDashboard,
              },
              {
                name: "Jobs",
                href: "/dashboard/recruiter/jobs",
                icon: Briefcase,
              },
              {
                name: "Applications",
                href: "/dashboard/recruiter/applications",
                icon: Users,
              },
            ].map((item) => {
              const active = pathname === item.href;
              return (
                <a key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${active ? "bg-[#FF3B30] text-white shadow-[0_12px_24px_rgba(255,59,48,0.25)]" : "hover:bg-gray-50 text-gray-400 hover:text-black"}`}
                  >
                    <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                    {!collapsed && (
                      <span className="font-bold text-[15px] tracking-tight">
                        {item.name}
                      </span>
                    )}
                  </motion.div>
                </a>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        <header className="mb-8 px-1 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200">
              <Target size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter italic leading-none">
                Applications<span className="text-[#FF3B30]">.</span>
              </h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1.5 px-0.5">
                Talent Acquisition Terminal
              </p>
            </div>
          </div>
          <button
            onClick={checkRoleAndLoad}
            className="p-3.5 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-black transition-all hover:rotate-180 duration-500 shadow-sm"
          >
            <RefreshCcw size={18} />
          </button>
        </header>

        {/* COMMAND CENTER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Scan talent database..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-black uppercase tracking-widest outline-none shadow-sm focus:border-black transition-all"
            />
          </div>

          <div className="bg-white border border-gray-200 p-1.5 rounded-2xl flex items-center shadow-sm">
            <div className="relative border-r border-gray-100 pr-1">
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="appearance-none bg-transparent pl-4 pr-10 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 outline-none cursor-pointer"
              >
                <option value="all">Opportunity Filter</option>
                {uniqueJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              />
            </div>
            <div className="flex items-center gap-1 px-1">
              {["ALL", "SHORTLISTED", "INTERVIEW", "HIRED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${statusFilter === s ? "bg-black text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* HIGH DENSITY TABLE */}
        <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-y-auto scrollbar-hide h-full">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50/80 backdrop-blur-md text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">
                  <th className="pl-10 py-6 text-left border-b border-gray-100">
                    Talent Dossier
                  </th>
                  <th className="px-6 py-6 text-left border-b border-gray-100">
                    Opportunity
                  </th>
                  <th className="px-6 py-6 text-left border-b border-gray-100">
                    Pipeline
                  </th>
                  <th className="pr-10 py-6 text-right border-b border-gray-100">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="group cursor-pointer hover:bg-gray-50/40 transition-all"
                  >
                    <td className="pl-10 py-4 border-r border-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex-shrink-0 overflow-hidden">
                          {app.profiles?.avatar_url ? (
                            <img
                              src={app.profiles.avatar_url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User
                              className="m-auto mt-1.5 text-gray-300"
                              size={16}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-[13px] tracking-tight text-gray-900 leading-none">
                            {app.profiles?.name || "Anonymous"}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tight italic">
                            {app.profiles?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-50/50">
                      <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight">
                        {app.jobs?.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-2 ${getStatusColor(app.stage)}`}
                      >
                        <span className="w-1 h-1 rounded-full bg-current animate-pulse" />{" "}
                        {app.stage || "PENDING"}
                      </span>
                    </td>
                    <td className="pr-10 py-4 text-right">
                      <button className="p-2.5 bg-gray-50 rounded-xl text-gray-300 group-hover:bg-black group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-sm">
                        <ArrowRight size={16} strokeWidth={3} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApps.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center">
                <Inbox size={40} className="text-gray-100 mb-4" />
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest px-1">
                  Zero Results in Pipeline
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INTELLIGENCE DRAWER */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[40]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-2xl z-[50] flex flex-col border-l border-gray-200"
            >
              <div className="flex flex-col h-full">
                <div className="p-10 pb-8 bg-gray-50/30 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-10">
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="p-3.5 hover:bg-white rounded-2xl border border-gray-200 transition-all text-gray-400 hover:text-black"
                    >
                      <X size={20} />
                    </button>
                    {selectedApp.resume_url && (
                      <a
                        href={selectedApp.resume_url}
                        target="_blank"
                        className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#FF3B30] transition-all shadow-xl shadow-red-100/10"
                      >
                        View Resume <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-xl flex-shrink-0 overflow-hidden">
                      {selectedApp.profiles?.avatar_url ? (
                        <img
                          src={selectedApp.profiles.avatar_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={40} className="m-auto mt-6 text-gray-200" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter text-gray-900 italic leading-none">
                        {selectedApp.profiles?.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${getStatusColor(selectedApp.stage)}`}
                        >
                          {selectedApp.stage || "pending"}
                        </span>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                          {selectedApp.jobs?.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-10 scrollbar-hide py-10 space-y-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <Mail size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          Candidate Email
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-gray-700 truncate">
                        {selectedApp.profiles?.email}
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <Clock size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          Applied date
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-gray-700">
                        {new Date(selectedApp.created_at).toLocaleDateString(
                          "en-US",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                      <HelpCircle size={14} className="text-[#FF3B30]" />{" "}
                      Intelligence Report
                    </h4>
                    <div className="space-y-4">
                      {["answer_fit", "answer_experience", "answer_q1"].map(
                        (field) =>
                          selectedApp[field] && (
                            <div
                              key={field}
                              className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50"
                            >
                              <p className="text-[9px] font-black text-gray-400 uppercase mb-3 tracking-widest">
                                {field.replace("_", " ")}
                              </p>
                              <p className="text-[13px] font-bold text-gray-800 leading-relaxed italic">
                                "{selectedApp[field]}"
                              </p>
                            </div>
                          ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-gray-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black px-1">
                      Pipeline Action
                    </h4>
                    <div className="grid grid-cols-2 gap-3 pb-6">
                      {["shortlisted", "interview", "hired", "rejected"].map(
                        (stage) => (
                          <button
                            key={stage}
                            onClick={() => updateStage(selectedApp.id, stage)}
                            className={`group flex items-center justify-between px-6 py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${selectedApp.stage === stage ? "bg-black text-white border-black shadow-2xl scale-[1.02]" : "bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black"}`}
                          >
                            {stage}
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${selectedApp.stage === stage ? "bg-[#FF3B30] shadow-[0_0_12px_#FF3B30]" : "bg-gray-200 group-hover:bg-black"}`}
                            />
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

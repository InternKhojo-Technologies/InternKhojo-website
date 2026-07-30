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
  User,
  ExternalLink,
  X,
  Search,
  ChevronDown,
  Mail,
  HelpCircle,
  Inbox,
  Clock,
  Target,
  ArrowRight,
  Phone,
  GraduationCap,
  FileText,
  Github,
  Linkedin,
  Code2,
  Terminal,
  Globe,
  Copy,
  Check,
} from "lucide-react";

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

  // Drawer & Candidate Profile Modal States
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [selectedCandidateProfile, setSelectedCandidateProfile] =
    useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "all";
  const [jobFilter, setJobFilter] = useState(initialJobId);

  const pathname = usePathname();
  const router = useRouter();

  // 🔥 FREEZE BACKGROUND SCROLL WHEN MODAL OR DRAWER IS OPEN
  useEffect(() => {
    if (selectedApp || selectedCandidateProfile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedApp, selectedCandidateProfile]);

  useEffect(() => {
    checkRoleAndLoad();
  }, []);

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
            `*, profiles:user_id (id, name, email, avatar_url, bio, skills, college, grad_year, contact_number, links), jobs:jobs!applications_job_id_fkey (*)`,
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

  const openCandidateProfile = async (
    candidateId: string,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    setLoadingProfile(true);
    try {
      const { data: fullProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", candidateId)
        .single();

      if (!error && fullProfile) {
        setSelectedCandidateProfile(fullProfile);
      }
    } catch (err) {
      console.error("Failed to load candidate profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const updateStage = async (appId: string, stage: string) => {
    const oldApps = [...applications];

    const currentApp = applications.find((a) => a.id === appId);
    if (!currentApp) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, stage } : a)),
    );
    if (selectedApp?.id === appId) setSelectedApp({ ...selectedApp, stage });

    const { error: updateError } = await supabase
      .from("applications")
      .update({ stage })
      .eq("id", appId);

    if (updateError) {
      setApplications(oldApps);
      alert("Cloud status sync transaction failed.");
      return;
    }

    const targetCandidateId = currentApp.user_id;
    if (!targetCandidateId) return;

    try {
      const jobTitle = currentApp.jobs?.title || "your targeted track";
      const companyName = company?.name || "The Platform Organization";

      let notifyTitle = "Application Pipeline Update";
      let notifyMessage = `Your process status bounds have been updated to ${stage.toUpperCase()}.`;

      switch (stage.toLowerCase()) {
        case "shortlisted":
          notifyTitle = "🚀 Application Shortlisted";
          notifyMessage = `Great news! You have been shortlisted by ${companyName} for the "${jobTitle}" track role.`;
          break;
        case "interview":
          notifyTitle = "📅 Interview Round Scheduled";
          notifyMessage = `${companyName} has pushed your loop to the Interview Track stage for "${jobTitle}". Stay alert.`;
          break;
        case "hired":
          notifyTitle = "🎉 Offer Letter Extended";
          notifyMessage = `Congratulations! You have cleared all interview milestones for "${jobTitle}" at ${companyName} & Now are successfully Hired for the role.`;
          break;
        case "rejected":
          notifyTitle = "Status Update Tracker";
          notifyMessage = `Thank you for your application towards the "${jobTitle}" pipeline at ${companyName}. Unfortunately Recruiters have decided to look elsewhere but they really liked your profile & wish you success for your future endeavors.`;
          break;
      }

      await supabase.from("notifications_website").insert({
        user_id: targetCandidateId,
        title: notifyTitle,
        message: notifyMessage,
        type: "application_stage",
        link: "/dashboard/candidate",
        read: false,
        created_at: new Date().toISOString(),
      });

      if (currentApp.profiles?.email) {
        fetch("/api/send-status-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentApp.profiles.email,
            name: currentApp.profiles.name,
            jobTitle: jobTitle,
            companyName: companyName,
            stage: stage,
          }),
        }).catch((err) =>
          console.error(
            "Network interface connection failure for mails context:",
            err,
          ),
        );
      }
    } catch (notifyErr) {
      console.error(
        "Employee Notification Desk Fatal Core Loop Error:",
        notifyErr,
      );
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

  return (
    <div className="bg-[#FBFCFD] min-h-screen flex p-6 gap-6 text-[#111] font-sans selection:bg-black selection:text-white">
      {/* SIDEBAR CONTAINER */}
      <motion.div
        animate={{ width: collapsed ? 80 : 260 }}
        className="rounded-[2rem] p-6 bg-white border border-gray-100 flex flex-col justify-between h-[calc(100vh-48px)] sticky top-6 shadow-sm z-30 select-none"
      >
        <div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-10 hover:bg-gray-50 p-2.5 rounded-xl transition-all text-gray-400 cursor-pointer"
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

      {/* MAIN VIEW CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="mb-8 px-1 flex justify-between items-center select-none">
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
            className="p-3.5 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-black transition-all hover:rotate-180 duration-500 shadow-sm cursor-pointer"
          >
            <RefreshCcw size={18} />
          </button>
        </header>

        {/* COMMAND CENTER */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 w-full select-none">
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

          <div className="bg-white border border-gray-200 p-1.5 rounded-2xl flex flex-col sm:flex-row items-center shadow-sm gap-2 sm:gap-0">
            <div className="relative border-b sm:border-b-0 sm:border-r border-gray-100 pr-1 w-full sm:w-auto">
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="appearance-none bg-transparent pl-4 pr-10 py-2 w-full text-[10px] font-black uppercase tracking-widest text-gray-500 outline-none cursor-pointer"
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
            <div className="flex flex-wrap items-center gap-1 px-1 justify-center">
              {["ALL", "SHORTLISTED", "INTERVIEW", "HIRED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-[9px] font-black tracking-widest transition-all cursor-pointer ${statusFilter === s ? "bg-black text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* HIGH DENSITY TABLE */}
        <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
          <div className="overflow-x-auto overflow-y-auto scrollbar-hide h-full">
            <table className="w-full border-separate border-spacing-0 min-w-[700px]">
              <thead className="sticky top-0 z-10 select-none">
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
                        <button
                          onClick={(e) => openCandidateProfile(app.user_id, e)}
                          className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-black transition-all cursor-pointer"
                          title="View Full Profile Dossier"
                        >
                          {app.profiles?.avatar_url ? (
                            <img
                              src={app.profiles.avatar_url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <User
                              className="m-auto mt-2 text-gray-300"
                              size={18}
                            />
                          )}
                        </button>
                        <div>
                          <p
                            onClick={(e) =>
                              openCandidateProfile(app.user_id, e)
                            }
                            className="font-black text-[13px] tracking-tight text-gray-900 leading-none hover:underline cursor-pointer"
                          >
                            {app.profiles?.name || "Anonymous"}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tight italic select-text">
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
                      <button className="p-2.5 bg-gray-50 rounded-xl text-gray-300 group-hover:bg-black group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-sm cursor-pointer">
                        <ArrowRight size={16} strokeWidth={3} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApps.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center select-none">
                <Inbox size={40} className="text-gray-100 mb-4" />
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest px-1">
                  Zero Results in Pipeline
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INTELLIGENCE DOSSIER APPLICATION DRAWER */}
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
              className="fixed top-0 right-0 h-full w-full sm:w-[540px] bg-white shadow-2xl z-[50] flex flex-col border-l border-gray-200"
            >
              <div className="flex flex-col h-full">
                <div className="p-10 pb-8 bg-gray-50/30 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-10">
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="p-3.5 hover:bg-white rounded-2xl border border-gray-200 transition-all text-gray-400 hover:text-black cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          openCandidateProfile(selectedApp.user_id)
                        }
                        className="bg-gray-100 text-gray-800 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-gray-200 transition-all cursor-pointer"
                      >
                        <User size={14} /> Full Profile
                      </button>
                      {selectedApp.resume_url && (
                        <a
                          href={selectedApp.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-black text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-[#FF3B30] transition-all shadow-xl shadow-red-100/10 cursor-pointer"
                        >
                          Resume <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => openCandidateProfile(selectedApp.user_id)}
                      className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-xl flex-shrink-0 overflow-hidden hover:opacity-90 cursor-pointer transition-opacity"
                    >
                      {selectedApp.profiles?.avatar_url ? (
                        <img
                          src={selectedApp.profiles.avatar_url}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <User size={40} className="m-auto mt-6 text-gray-200" />
                      )}
                    </button>
                    <div>
                      <h2
                        onClick={() =>
                          openCandidateProfile(selectedApp.user_id)
                        }
                        className="text-3xl font-black tracking-tighter text-gray-900 italic leading-none truncate max-w-[260px] cursor-pointer hover:underline"
                      >
                        {selectedApp.profiles?.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${getStatusColor(selectedApp.stage)}`}
                        >
                          {selectedApp.stage || "pending"}
                        </span>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest truncate max-w-[150px]">
                          {selectedApp.jobs?.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-10 scrollbar-hide py-8 space-y-8">
                  {/* SELECTABLE CONTACT DETAILS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <Mail size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          Candidate Email
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-gray-700 truncate select-text">
                        {selectedApp.profiles?.email || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <Phone size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          Contact Number
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-gray-700 select-text">
                        {selectedApp.profiles?.contact_number || "Not Provided"}
                      </p>
                    </div>
                  </div>

                  {/* PARSED SCREENING QUESTIONS & ANSWERS */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                      <HelpCircle size={14} className="text-[#FF3B30]" />{" "}
                      Screening Questions & Responses
                    </h4>

                    {selectedApp.jobs?.questions &&
                    selectedApp.jobs.questions.length > 0 ? (
                      <div className="space-y-4">
                        {selectedApp.jobs.questions.map((q: any, i: number) => {
                          const isObj = typeof q === "object" && q !== null;
                          const qTitle = isObj ? q.title : q;
                          const rawAns = selectedApp.answers
                            ? selectedApp.answers[i]
                            : null;

                          let displayAns = "No response provided.";
                          if (
                            rawAns !== undefined &&
                            rawAns !== null &&
                            rawAns !== ""
                          ) {
                            displayAns = Array.isArray(rawAns)
                              ? rawAns.join(", ")
                              : String(rawAns);
                          }

                          return (
                            <div
                              key={i}
                              className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100 space-y-2"
                            >
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                {i + 1}. {qTitle}
                              </p>
                              <p className="text-xs font-bold text-gray-800 leading-relaxed italic select-text">
                                "{displayAns}"
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50/40 p-4 rounded-xl border border-gray-100 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          No screening questions mapped to this posting.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* STAGE CHANGE ACTION BUTTONS */}
                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black px-1">
                      Pipeline Action
                    </h4>
                    <div className="grid grid-cols-2 gap-3 pb-6">
                      {["shortlisted", "interview", "hired", "rejected"].map(
                        (stage) => (
                          <button
                            key={stage}
                            onClick={() => updateStage(selectedApp.id, stage)}
                            className={`group flex items-center justify-between px-5 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all cursor-pointer ${selectedApp.stage === stage ? "bg-black text-white border-black shadow-2xl scale-[1.02]" : "bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black"}`}
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

      {/* CANDIDATE FULL PROFILE DOSSIER POPUP MODAL */}
      <AnimatePresence>
        {selectedCandidateProfile && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4"
            onClick={() => setSelectedCandidateProfile(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] border border-gray-100 max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]"
            >
              {/* Dynamic Gradient Banner Header */}
              <div className="h-32 bg-gradient-to-r from-gray-900 via-gray-800 to-black relative p-6 flex justify-end items-start flex-shrink-0">
                <button
                  onClick={() => setSelectedCandidateProfile(null)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Avatar + Primary Header Details */}
              <div className="px-8 pb-6 relative border-b border-gray-100 flex-shrink-0">
                <div className="flex justify-between items-end -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-2xl overflow-hidden flex-shrink-0">
                    {selectedCandidateProfile.avatar_url ? (
                      <img
                        src={selectedCandidateProfile.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={48} className="m-auto mt-6 text-gray-300" />
                    )}
                  </div>
                  {selectedCandidateProfile.resume_url && (
                    <a
                      href={selectedCandidateProfile.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 transition-colors shadow-lg cursor-pointer"
                    >
                      <FileText size={14} /> View Resume
                    </a>
                  )}
                </div>

                <h2 className="text-2xl font-black tracking-tight text-gray-900">
                  {selectedCandidateProfile.name || "Candidate Profile"}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5 select-text">
                  {selectedCandidateProfile.email}
                </p>

                {selectedCandidateProfile.bio && (
                  <p className="text-xs text-gray-600 font-medium leading-relaxed mt-3 bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                    {selectedCandidateProfile.bio}
                  </p>
                )}
              </div>

              {/* Scrollable Inner Profile Dossier Details */}
              <div className="p-8 overflow-y-auto space-y-6 flex-1">
                {/* Academic & Contact Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 mb-1">
                      <GraduationCap size={13} /> College / Institute
                    </p>
                    <p className="text-xs font-bold text-gray-900">
                      {selectedCandidateProfile.college || "Not Specified"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 mb-1">
                      <Clock size={13} /> Graduation Year
                    </p>
                    <p className="text-xs font-bold text-gray-900">
                      {selectedCandidateProfile.grad_year || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 sm:col-span-2">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 mb-1">
                      <Phone size={13} /> Contact Phone
                    </p>
                    <p className="text-xs font-bold text-gray-900 select-text">
                      {selectedCandidateProfile.contact_number ||
                        "Not Provided"}
                    </p>
                  </div>
                </div>

                {/* Tech Stack Skills */}
                {selectedCandidateProfile.skills &&
                  selectedCandidateProfile.skills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Skill Stack Matrix
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidateProfile.skills.map(
                          (skill: string) => (
                            <span
                              key={skill}
                              className="text-[10px] font-bold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-xl border border-gray-200/50"
                            >
                              {skill}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* External Social Links Repo */}
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    External Portfolio Network
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCandidateProfile.links?.linkedin && (
                      <a
                        href={selectedCandidateProfile.links.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-800 transition-colors cursor-pointer"
                      >
                        <Linkedin size={16} className="text-blue-600" />{" "}
                        LinkedIn{" "}
                        <ExternalLink
                          size={12}
                          className="ml-auto text-gray-400"
                        />
                      </a>
                    )}
                    {selectedCandidateProfile.github_url && (
                      <a
                        href={selectedCandidateProfile.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-800 transition-colors cursor-pointer"
                      >
                        <Github size={16} /> GitHub{" "}
                        <ExternalLink
                          size={12}
                          className="ml-auto text-gray-400"
                        />
                      </a>
                    )}
                    {selectedCandidateProfile.leetcode_url && (
                      <a
                        href={selectedCandidateProfile.leetcode_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-800 transition-colors cursor-pointer"
                      >
                        <Code2 size={16} className="text-amber-500" /> LeetCode{" "}
                        <ExternalLink
                          size={12}
                          className="ml-auto text-gray-400"
                        />
                      </a>
                    )}
                    {selectedCandidateProfile.codeforces_url && (
                      <a
                        href={selectedCandidateProfile.codeforces_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-800 transition-colors cursor-pointer"
                      >
                        <Terminal size={16} className="text-red-500" />{" "}
                        Codeforces{" "}
                        <ExternalLink
                          size={12}
                          className="ml-auto text-gray-400"
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

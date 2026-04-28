"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Plus,
  MapPin,
  Building2,
  Search,
  Trash2,
  ChevronRight,
  Inbox,
  Clock,
  ArrowUpRight,
  LogOut,
  User,
} from "lucide-react";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    const { data } = await supabase
      .from("saved_jobs")
      .select(
        `
        jobs (
          id,
          title,
          stipend,
          location,
          companies (name, logo_url)
        )
      `,
      )
      .eq("user_id", user.id);

    const cleaned = data?.map((d: any) => d.jobs).filter(Boolean) || [];
    setJobs(cleaned);
    setLoading(false);
  };

  const handleRemove = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("job_id", jobId)
      .eq("user_id", user?.id);

    if (!error) {
      setJobs(jobs.filter((job) => job.id !== jobId));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Extract initials from email for the Avatar
  const userInitials = useMemo(() => {
    if (!user?.email) return "??";
    return user.email.substring(0, 2).toUpperCase();
  }, [user]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companies?.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, jobs]);

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="bg-[#FDFDFD] min-h-screen font-sans text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
      {/* Precision Header */}
      <nav className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <span className="text-zinc-400">Dashboard</span>
            <ChevronRight size={14} className="text-zinc-300" />
            <span className="text-zinc-900 font-bold tracking-tight">
              Saved Roles
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Search Input */}
          <div className="relative group">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pipeline..."
              className="pl-9 pr-4 py-1.5 bg-zinc-100/50 border border-zinc-200/50 rounded-lg text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 w-48 md:w-64 transition-all"
            />
          </div>

          {/* User Profile Component */}
          <div className="group relative">
            <button className="h-8 w-8 rounded-full border border-zinc-200 bg-zinc-900 flex items-center justify-center text-[10px] font-black text-white hover:ring-4 hover:ring-zinc-100 transition-all">
              {userInitials}
            </button>

            {/* Simple Dropdown on Hover/Click */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-1">
              <div className="px-3 py-2 border-b border-zinc-50">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Account
                </p>
                <p className="text-[12px] font-semibold truncate text-zinc-900">
                  {user?.email}
                </p>
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors">
                <User size={14} /> Profile Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto px-6 py-12">
        <header className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vault</h1>
            <p className="text-[13px] text-zinc-500 mt-1 font-medium">
              Your curated professional opportunities.
            </p>
          </div>
          <button
            onClick={() => router.push("/find")}
            className="h-9 px-4 bg-zinc-900 text-white rounded-lg text-[12px] font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-100"
          >
            <Plus size={14} strokeWidth={3} />
            Browse Jobs
          </button>
        </header>

        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[1fr_200px_140px_100px] px-6 py-3 bg-zinc-50/50 border-b border-zinc-200/60 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <span>Role</span>
            <span>Organization</span>
            <span>Compensation</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {filteredJobs.length === 0 ? (
              <div className="py-24 text-center">
                <Inbox size={24} className="mx-auto text-zinc-200 mb-3" />
                <p className="text-[13px] font-bold text-zinc-400">
                  {searchQuery
                    ? "No matching records."
                    : "No saved opportunities yet."}
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/find/jobs/${job.id}`)}
                  className="group grid grid-cols-[1fr_200px_140px_100px] px-6 py-5 hover:bg-zinc-50 items-center cursor-pointer transition-colors"
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-[14px] font-bold text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </span>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        {job.location || "Remote"}
                      </div>
                      <div className="flex items-center gap-1 border-l border-zinc-200 pl-3">
                        <Clock size={12} />
                        Active
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white border border-zinc-200 rounded-md flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0">
                      {job.companies?.logo_url ? (
                        <img
                          src={job.companies.logo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 size={12} className="text-zinc-300" />
                      )}
                    </div>
                    <span className="text-[13px] font-semibold text-zinc-600 group-hover:text-zinc-900">
                      {job.companies?.name}
                    </span>
                  </div>

                  <div>
                    <span className="px-2 py-0.5 bg-zinc-100 rounded text-[11px] font-black text-zinc-500">
                      {job.stipend || "TBD"}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => handleRemove(e, job.id)}
                      className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="p-2 text-zinc-300 group-hover:text-zinc-900 transition-transform group-hover:translate-x-0.5">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Menu,
  Calendar,
  RefreshCcw,
} from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

// charts
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic(() => import("recharts").then((m) => m.Line), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
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

export default function RecruiterDashboard() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Date States
  const today = new Date().toISOString().split("T")[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [globalRange, setGlobalRange] = useState({
    start: lastWeek,
    end: today,
  });
  const [jobRange, setJobRange] = useState({ start: lastWeek, end: today });
  const [appRange, setAppRange] = useState({ start: lastWeek, end: today });

  const [profile, setProfile] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    loadBaseData();
  }, []);

  // Keyboard shortcut toggle
  useEffect(() => {
    const handler = (e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // 2. Get Company
      if (profileData?.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profileData.company_id)
          .single();
        setCompany(companyData);
      }

      // 3. Get ALL Jobs
      const { data: jobsData, error: jobErr } = await supabase
        .from("jobs")
        .select("*")
        .eq("recruiter_id", user.id);

      if (jobErr) console.error("Job Fetch Error:", jobErr);
      setJobs(jobsData || []);

      // 4. Get ALL Applications
      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map((j) => j.id);
        const { data: appsData, error: appErr } = await supabase
          .from("applications")
          .select(`*, jobs!applications_job_id_fkey(title)`)
          .in("job_id", jobIds);

        if (appErr) console.error("App Fetch Error:", appErr);
        setApps(appsData || []);
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Logic to process data based on specific ranges for charts
  const processChartData = (
    data: any[],
    range: { start: string; end: string },
    dataKey: string,
  ) => {
    const start = new Date(range.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(range.end);
    end.setHours(23, 59, 59, 999);

    const map: any = {};

    // Fill the map with dates in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      map[formatDate(new Date(d))] = 0;
    }

    data.forEach((item) => {
      const itemDate = new Date(item.created_at);
      if (itemDate >= start && itemDate <= end) {
        const k = formatDate(itemDate);
        if (map[k] !== undefined) map[k]++;
      }
    });

    return Object.keys(map).map((k) => ({ date: k, [dataKey]: map[k] }));
  };

  // MEMOIZED DATA
  const jobChartData = useMemo(
    () => processChartData(jobs, jobRange, "jobs"),
    [jobs, jobRange],
  );
  const appChartData = useMemo(
    () => processChartData(apps, appRange, "applications"),
    [apps, appRange],
  );

  const displayStats = useMemo(() => {
    const start = new Date(globalRange.start);
    const end = new Date(globalRange.end);
    end.setHours(23, 59, 59, 999);

    const filteredApps = apps.filter(
      (a) => new Date(a.created_at) >= start && new Date(a.created_at) <= end,
    );

    // Filter applications table stage column
    const hiredCount = apps.filter(
      (a) => a.stage?.toString().trim().toLowerCase() === "hired",
    ).length;

    return {
      totalJobs: jobs.length,
      totalApps: apps.length,
      periodApps: filteredApps.length,
      hired: hiredCount,
      conversion: apps.length
        ? Math.round((hiredCount / apps.length) * 100)
        : 0,
    };
  }, [jobs, apps, globalRange]);

  const topJobs = useMemo(() => {
    const countMap: any = {};
    apps.forEach((a) => {
      const title = a.jobs?.title || "Untitled Position";
      if (!countMap[a.job_id]) {
        countMap[a.job_id] = { title, count: 0 };
      }
      countMap[a.job_id].count++;
    });
    return Object.values(countMap)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);
  }, [apps]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard/recruiter", icon: LayoutDashboard },
    { name: "Jobs", href: "/dashboard/recruiter/jobs", icon: Briefcase },
    {
      name: "Applications",
      href: "/dashboard/recruiter/applications",
      icon: Users,
    },
  ];

  const handleGlobalChange = (newRange: { start: string; end: string }) => {
    setGlobalRange(newRange);
    setJobRange(newRange);
    setAppRange(newRange);
  };

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center text-red-500 font-medium">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="bg-white min-h-screen flex p-6 gap-6 text-black">
      {/* SIDEBAR */}
      <motion.div
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl p-4 shadow-[0_10px_30px_rgb(0,0,0,0.05)] bg-white border border-gray-50 flex flex-col justify-between z-10"
      >
        <div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-6 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <Menu />
          </button>

          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                company?.name?.[0]
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
      <div className="flex-1 space-y-6 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {profile?.name || "Recruiter"}
            </h1>
            <p className="text-gray-400 text-sm">
              Here is what's happening with your job postings.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadBaseData}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <RefreshCcw size={18} />
            </button>
            <div className="h-8 w-[1px] bg-gray-200" />
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Global View
              </span>
              <DateRangePicker
                range={globalRange}
                setRange={handleGlobalChange}
              />
            </div>
          </div>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <Stat label="Total Jobs Posted" value={displayStats.totalJobs} />
          <Stat
            label="Total Applicants"
            value={displayStats.totalApps}
            highlight
          />
          <Stat label="Total Hired" value={displayStats.hired} />
          <Stat label="Success Rate" value={`${displayStats.conversion}%`} />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-2 gap-6">
          <Card
            title="Jobs Published"
            headerAction={
              <DateRangePicker
                range={jobRange}
                setRange={setJobRange}
                size="sm"
              />
            }
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={jobChartData}>
                <XAxis
                  dataKey="date"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="jobs"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title="Application Volume"
            headerAction={
              <DateRangePicker
                range={appRange}
                setRange={setAppRange}
                size="sm"
              />
            }
          >
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={appChartData}>
                <XAxis
                  dataKey="date"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#000"
                  strokeWidth={3}
                  dot={{
                    fill: "#ef4444",
                    strokeWidth: 2,
                    r: 4,
                    stroke: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* LOWER SECTION */}
        <div className="grid grid-cols-2 gap-6 pb-6">
          <Card title="Activity Summary">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">
                  Apps in Selected Period
                </span>
                <span className="text-lg font-bold text-red-500">
                  {displayStats.periodApps}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-gray-100 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Avg per Job
                  </p>
                  <p className="text-lg font-semibold">
                    {displayStats.totalJobs > 0
                      ? (
                          displayStats.totalApps / displayStats.totalJobs
                        ).toFixed(1)
                      : 0}
                  </p>
                </div>
                <div className="p-3 border border-gray-100 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Status
                  </p>
                  <p className="text-lg font-semibold">Active</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Top Performing Roles">
            <div className="space-y-2">
              {topJobs.length > 0 ? (
                topJobs.map((j: any, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-gray-700 truncate max-w-[220px]">
                      {j.title}
                    </span>
                    <span className="bg-red-50 px-3 py-1 rounded-full text-red-600 font-bold text-xs">
                      {j.count} apps
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">
                  No applications found yet.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DateRangePicker({ range, setRange, size = "md" }: any) {
  const [activeTab, setActiveTab] = useState<"start" | "end" | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const selectedRange: DateRange | undefined = {
    from: range.start ? new Date(range.start) : undefined,
    to: range.end ? new Date(range.end) : undefined,
  };

  // Close calendar when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setActiveTab(null);
      }
    };
    if (activeTab) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTab]);

  const handleDayClick = (day: Date) => {
    const clickedStr = format(day, "yyyy-MM-dd");

    if (activeTab === "start") {
      // If start date is picked after end date, adjust end date automatically
      if (range.end && new Date(clickedStr) > new Date(range.end)) {
        setRange({ start: clickedStr, end: clickedStr });
      } else {
        setRange({ ...range, start: clickedStr });
      }
      setActiveTab("end"); // Auto-switch to end date picking
    } else if (activeTab === "end") {
      // If end date picked is before start date, set start date as clicked date
      if (range.start && new Date(clickedStr) < new Date(range.start)) {
        setRange({ start: clickedStr, end: clickedStr });
      } else {
        setRange({ ...range, end: clickedStr });
      }
      setActiveTab(null); // Close popover
    }
  };

  return (
    <div ref={pickerRef} className="relative inline-block text-left">
      {/* SEPARATE START & END SELECTION BOXES */}
      <div
        className={`flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg shadow-sm ${
          size === "sm" ? "p-1 text-[11px]" : "p-1.5 text-xs"
        }`}
      >
        {/* Start Date Button */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "start" ? null : "start")}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
            activeTab === "start"
              ? "bg-red-50 text-red-600 font-bold border border-red-200"
              : "hover:bg-gray-100 text-gray-700 font-medium"
          }`}
        >
          <Calendar
            size={12}
            className={activeTab === "start" ? "text-red-500" : "text-gray-400"}
          />
          <span>
            {range.start
              ? format(new Date(range.start), "dd/MM/yyyy")
              : "Start Date"}
          </span>
        </button>

        <span className="text-gray-300 font-bold text-xs">-</span>

        {/* End Date Button */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "end" ? null : "end")}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
            activeTab === "end"
              ? "bg-red-50 text-red-600 font-bold border border-red-200"
              : "hover:bg-gray-100 text-gray-700 font-medium"
          }`}
        >
          <Calendar
            size={12}
            className={activeTab === "end" ? "text-red-500" : "text-gray-400"}
          />
          <span>
            {range.end ? format(new Date(range.end), "dd/MM/yyyy") : "End Date"}
          </span>
        </button>
      </div>

      {/* HIGHLIGHTED RANGE CALENDAR POPOVER */}
      {activeTab && (
        <div className="absolute right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-1 scale-90 origin-top-right transition-transform">
          <div className="px-3 py-1 bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase text-gray-500 rounded-t-lg">
            Pick {activeTab === "start" ? "Start Date" : "End Date"}
          </div>
          <DayPicker
            mode="range"
            defaultMonth={
              activeTab === "end" && selectedRange?.to
                ? selectedRange.to
                : selectedRange?.from
            }
            selected={selectedRange}
            onDayClick={handleDayClick}
            numberOfMonths={1}
            className={{
              month_caption: "text-xs font-bold text-gray-800",
              head_cell: "text-[11px] font-medium text-gray-400 p-1",
              cell: "p-0.5 text-center",
              day: "h-7 w-7 text-xs font-medium rounded-md hover:bg-gray-100",
            }}
          />
        </div>
      )}
    </div>
  );
}

function Card({ children, title, headerAction }: any) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 tracking-tight">{title}</h3>
        {headerAction}
      </div>
      {children}
    </motion.div>
  );
}

function Stat({ label, value, highlight }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 text-center"
    >
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-black ${highlight ? "text-red-500" : "text-gray-900"}`}
      >
        {value}
      </p>
    </motion.div>
  );
}

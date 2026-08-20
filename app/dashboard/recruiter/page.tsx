"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { RefreshCcw, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useRecruiter } from "./layout";

// dynamic charts
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
  const { profile } = useRecruiter();
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

  const [jobs, setJobs] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    loadPageData();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const loadPageData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: jobsData, error: jobErr } = await supabase
        .from("jobs")
        .select("*")
        .eq("recruiter_id", user.id);

      if (jobErr) console.error("Job Fetch Error:", jobErr);
      setJobs(jobsData || []);

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

  const handleGlobalChange = (newRange: { start: string; end: string }) => {
    setGlobalRange(newRange);
    setJobRange(newRange);
    setAppRange(newRange);
  };

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-red-500 font-medium">
        Loading Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome, {profile?.name || "Recruiter"}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Here is what's happening with your job postings.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={loadPageData}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 cursor-pointer"
            aria-label="Refresh Data"
          >
            <RefreshCcw size={18} />
          </button>
          <div className="h-6 w-[1px] bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:inline">
              Global View
            </span>
            <DateRangePicker
              range={globalRange}
              setRange={handleGlobalChange}
            />
          </div>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat label="Total Jobs" value={displayStats.totalJobs} />
        <Stat
          label="Total Applicants"
          value={displayStats.totalApps}
          highlight
        />
        <Stat label="Total Hired" value={displayStats.hired} />
        <Stat label="Success Rate" value={`${displayStats.conversion}%`} />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <ResponsiveContainer width="100%" height={220}>
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
                barSize={24}
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
          <ResponsiveContainer width="100%" height={220}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <Card title="Activity Summary">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-xs sm:text-sm text-gray-600 font-medium">
                Apps in Selected Period
              </span>
              <span className="text-base sm:text-lg font-bold text-red-500">
                {displayStats.periodApps}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-gray-100 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">
                  Avg per Job
                </p>
                <p className="text-base sm:text-lg font-semibold">
                  {displayStats.totalJobs > 0
                    ? (displayStats.totalApps / displayStats.totalJobs).toFixed(
                        1,
                      )
                    : 0}
                </p>
              </div>
              <div className="p-3 border border-gray-100 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">
                  Status
                </p>
                <p className="text-base sm:text-lg font-semibold">Active</p>
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
                  className="flex justify-between text-xs sm:text-sm items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-700 truncate max-w-[180px] sm:max-w-[240px]">
                    {j.title}
                  </span>
                  <span className="bg-red-50 px-2.5 py-0.5 rounded-full text-red-600 font-bold text-[11px]">
                    {j.count} apps
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-xs sm:text-sm text-center py-8">
                No applications found yet.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DateRangePicker({ range, setRange, size = "md" }: any) {
  const [activeTab, setActiveTab] = useState<"start" | "end" | null>(null);
  const [currentMonth, setCurrentMonth] = useState(
    range.start ? new Date(range.start) : new Date(),
  );
  const pickerRef = useRef<HTMLDivElement>(null);

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

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDayOfMonth; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [year, month, firstDayOfMonth, daysInMonth]);

  const handleDateClick = (date: Date) => {
    const yearStr = date.getFullYear();
    const monthStr = String(date.getMonth() + 1).padStart(2, "0");
    const dayStr = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${yearStr}-${monthStr}-${dayStr}`;

    if (activeTab === "start") {
      if (range.end && new Date(formattedDate) > new Date(range.end)) {
        setRange({ start: formattedDate, end: formattedDate });
      } else {
        setRange({ ...range, start: formattedDate });
      }
      setActiveTab("end");
    } else if (activeTab === "end") {
      if (range.start && new Date(formattedDate) < new Date(range.start)) {
        setRange({ start: formattedDate, end: formattedDate });
      } else {
        setRange({ ...range, end: formattedDate });
      }
      setActiveTab(null);
    }
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div ref={pickerRef} className="relative inline-block text-left">
      <div
        className={`flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-sm ${
          size === "sm" ? "p-1 text-[10px]" : "p-1.5 text-xs"
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "start" ? null : "start")}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
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
            {range.start ? format(new Date(range.start), "dd/MM/yy") : "Start"}
          </span>
        </button>

        <span className="text-gray-300 font-bold text-xs">-</span>

        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "end" ? null : "end")}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
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
            {range.end ? format(new Date(range.end), "dd/MM/yy") : "End"}
          </span>
        </button>
      </div>

      {activeTab && (
        <div className="absolute right-0 mt-1 z-[999] bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 w-[260px] sm:w-[270px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-gray-900">
              {currentMonth.toLocaleString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="h-6 w-6 flex items-center justify-center hover:bg-red-50 rounded-full text-red-600 transition-colors font-extrabold text-sm"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="h-6 w-6 flex items-center justify-center hover:bg-red-50 rounded-full text-red-600 transition-colors font-extrabold text-sm"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0 text-center mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span
                key={day}
                className="text-[9px] font-bold text-gray-400 uppercase"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {daysArray.map((date, idx) => {
              if (!date)
                return <div key={`empty-${idx}`} className="h-6 w-full" />;

              const dStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
              const isStart = dStr === range.start;
              const isEnd = dStr === range.end;
              const inRange =
                range.start &&
                range.end &&
                dStr > range.start &&
                dStr < range.end;

              return (
                <div
                  key={date.toISOString()}
                  className={`relative flex items-center justify-center h-6 w-full ${
                    inRange ? "bg-red-50 text-red-600" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={`h-6 w-6 text-[11px] flex items-center justify-center transition-all ${
                      isStart || isEnd
                        ? "bg-red-500 text-white font-bold rounded-full shadow-sm z-10"
                        : "text-gray-700 hover:bg-gray-100 rounded-full"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ children, title, headerAction }: any) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50"
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-tight">
          {title}
        </h3>
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
      className="bg-white p-4 sm:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 text-center"
    >
      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">
        {label}
      </p>
      <p
        className={`text-xl sm:text-2xl font-black ${
          highlight ? "text-red-500" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </motion.div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Bell,
  Clock,
  Inbox,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Circle,
} from "lucide-react";

function timeAgo(dateString: string) {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

    const days = Math.floor(diff / 86400);
    if (days > 0) return `${days}d ago`;

    const hours = Math.floor(diff / 3600);
    if (hours > 0) return `${hours}h ago`;

    const minutes = Math.floor(diff / 60);
    if (minutes > 0) return `${minutes}m ago`;

    return "Just now";
  } catch {
    return "";
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("notifications_website")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setNotifications(data || []);
    } catch (err) {
      console.error("Notification pipeline fetch exception:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Optional: Is block mein tum notification ko read mark karne ka logic trigger kar sakte ho
    if (!notification.read) {
      await supabase
        .from("notifications_website")
        .update({ read: true })
        .eq("id", notification.id);

      // Local state real-time refresh update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
    }

    // Dynamic routing path check from 'link' column
    if (notification.link) {
      router.push(notification.link);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    );

  return (
    <div className="bg-[#fcfcfc] min-h-screen text-black pb-28 select-none antialiased">
      <div className="max-w-[760px] mx-auto px-6">
        {/* Studio Style Upper Header Controls */}
        <div className="pt-14 mb-12 flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-[1000] tracking-tighter uppercase text-slate-900 leading-none">
                Inbox Hub
              </h1>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1">
                Ecosystem Activity Pipeline Updates
              </p>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
            Total logs // {notifications.length}
          </div>
        </div>

        {/* Dynamic Structural Notifications Rows List */}
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                n.read
                  ? "bg-white border-slate-100 hover:border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                  : "bg-white border-slate-200 hover:border-black shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
              }`}
            >
              {/* Unread Unread Active Pulsing State Indicator Dot */}
              {!n.read && (
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-black" />
              )}

              {/* Status Graphic Box Icon Layout */}
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                  n.read
                    ? "bg-slate-50 border-slate-100 text-slate-400"
                    : "bg-slate-900 border-slate-900 text-white group-hover:bg-black"
                }`}
              >
                <Bell size={15} className={!n.read ? "animate-pulse" : ""} />
              </div>

              {/* Text Context Frame */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={`text-xs uppercase tracking-tight truncate ${
                      n.read
                        ? "font-bold text-slate-700"
                        : "font-[950] text-slate-900"
                    }`}
                  >
                    {n.title}
                  </p>

                  {/* Absolute Time Node Indicator */}
                  {n.created_at && (
                    <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 uppercase flex-shrink-0">
                      <Clock size={10} />
                      {timeAgo(n.created_at)}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed pr-4">
                  {n.message}
                </p>
              </div>

              {/* Forward Chevron Interface Indicator */}
              <div className="self-center text-slate-300 group-hover:text-black group-hover:translate-x-0.5 transition-all pl-2 flex-shrink-0">
                <ChevronRight size={14} />
              </div>
            </div>
          ))}

          {/* Immersive Editorial Aesthetic Empty State Viewport */}
          {notifications.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-[#fafafa]/40 flex flex-col items-center justify-center p-6">
              <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                <Inbox size={20} />
              </div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Workspace Clean
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 max-w-xs leading-normal">
                No active notification pipelines or application status locks
                detected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

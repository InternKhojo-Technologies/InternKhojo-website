"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "./ui/Container";
import { supabase } from "@/lib/supabase";

import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [avatar, setAvatar] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const router = useRouter();

  // 🔥 PROFILE COMPLETION LOGIC
  const getChecklist = (profile: any) => {
    if (!profile) return [];
    const items = [];
    if (!profile.name) items.push("Add your name");

    if (profile.role === "candidate") {
      if (!profile.bio) items.push("Add bio");
      if (!profile.skills?.length) items.push("Add skills");
      if (!profile.resume_url) items.push("Upload resume");
      if (!profile.links) items.push("Add links");
    }

    if (profile.role === "recruiter") {
      if (!profile.company_id) items.push("Create company");
    }
    return items;
  };

  const checklist = getChecklist(profile);
  const total = profile?.role === "candidate" ? 5 : 2;
  const completed = total - checklist.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // auth listener
  useEffect(() => {
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      getUser();
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setProfileOpen(false);
      setOpen(false);
      setNotifOpen(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications_website",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
      if (data?.avatar_url) {
        setAvatar(data.avatar_url);
      } else if (user?.email) {
        const avatarSvg = createAvatar(thumbs, {
          seed: user.email,
        }).toDataUri();
        setAvatar(avatarSvg);
      }
      const { data: notifData } = await supabase
        .from("notifications_website")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setNotifications(notifData || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAvatar("");
  };

  function timeAgo(dateString: string) {
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
  }

  const today: any[] = [];
  const earlier: any[] = [];
  notifications.forEach((n) => {
    const created = new Date(n.created_at);
    if (created.toDateString() === new Date().toDateString()) today.push(n);
    else earlier.push(n);
  });

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-md bg-white/60 shadow-sm" : "backdrop-blur-md bg-white/40"}`}
    >
      <Container>
        <div className="h-20 relative flex items-center">
          {/* LOGO */}
          <div className="flex items-center gap-3 -ml-15">
            <img src="/logo.png" className="w-12 h-12" alt="logo" />
            <div className="text-3xl font-black">InternKhojo</div>
          </div>

          {/* MENU */}
          <div className="absolute left-1/2 -translate-x-1/2 flex gap-8 text-sm font-medium">
            <Link href="/">Home</Link>
            <Link href="/find">Find</Link>
            <Link href="/hire">Hire</Link>
            <Link href="/mentor">Mentor</Link>
            <Link href="/about">About</Link>
          </div>

          {/* RIGHT */}
          <div className="ml-auto">
            {!user ? (
              <div className="flex gap-3">
                <Link href="/login" className="px-4 py-2 text-sm text-gray-600">
                  Login
                </Link>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setOpen(!open)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm"
                  >
                    Sign up
                  </button>
                  {open && (
                    <div className="absolute right-0 mt-2 w-44 backdrop-blur-md bg-white/80 rounded-xl shadow-sm border border-white/20 z-50">
                      <Link
                        href="/signup?role=candidate"
                        className="block px-4 py-2 text-sm hover:bg-white/60 rounded-lg"
                        onClick={() => setOpen(false)}
                      >
                        Find Jobs
                      </Link>
                      <Link
                        href="/signup?role=recruiter"
                        className="block px-4 py-2 text-sm hover:bg-white/60 rounded-lg"
                        onClick={() => setOpen(false)}
                      >
                        Hire Talent
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="relative flex items-center gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 🔔 NOTIFICATIONS */}
                <div className="relative">
                  <button
                    onClick={async () => {
                      const opening = !notifOpen;
                      setNotifOpen(opening);
                      if (opening) setProfileOpen(false); // 🔥 Close profile when opening notifications

                      if (opening) {
                        await supabase
                          .from("notifications_website")
                          .update({ read: true })
                          .eq("user_id", user.id)
                          .eq("read", false);
                        setNotifications((prev) =>
                          prev.map((n) => ({ ...n, read: true })),
                        );
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition"
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                      <path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                    {notifications.some((n) => !n.read) && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>

                  {notifOpen && (
                    <div
                      className="absolute right-0 mt-4 w-[360px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-6 py-4 flex justify-between items-center bg-white shadow-sm">
                        <h2 className="text-lg font-semibold">Notifications</h2>
                        {notifications.length > 0 && (
                          <button
                            onClick={async () => {
                              await supabase
                                .from("notifications_website")
                                .delete()
                                .eq("user_id", user.id);
                              setNotifications([]);
                            }}
                            className="text-xs text-red-500 hover:underline font-medium"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      <div className="p-6 text-center">
                        {notifications.length === 0 ? (
                          <p className="text-gray-400">No notifications yet.</p>
                        ) : (
                          <div className="space-y-4 text-left max-h-[400px] overflow-y-auto">
                            {today.length > 0 && (
                              <p className="text-xs text-gray-400 px-2">
                                Today
                              </p>
                            )}
                            {today.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  if (n.link) router.push(n.link);
                                  setNotifOpen(false);
                                }}
                                className={`p-3 rounded-xl cursor-pointer ${n.read ? "bg-white hover:bg-gray-50" : "bg-blue-50"}`}
                              >
                                <p className="font-medium text-sm">{n.title}</p>
                                <p className="text-xs text-gray-500">
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {timeAgo(n.created_at)}
                                </p>
                              </div>
                            ))}
                            {earlier.length > 0 && (
                              <p className="text-xs text-gray-400 px-2 mt-4">
                                Earlier
                              </p>
                            )}
                            {earlier.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  if (n.link) router.push(n.link);
                                  setNotifOpen(false);
                                }}
                                className={`p-3 rounded-xl cursor-pointer ${n.read ? "bg-white hover:bg-gray-50" : "bg-blue-50"}`}
                              >
                                <p className="font-medium text-sm">{n.title}</p>
                                <p className="text-xs text-gray-500">
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {timeAgo(n.created_at)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 👤 PROFILE */}
                <div className="relative">
                  {avatar ? (
                    <img
                      src={profile?.avatar_url || avatar}
                      onClick={() => {
                        const opening = !profileOpen;
                        setProfileOpen(opening);
                        if (opening) setNotifOpen(false); // 🔥 Close notifications when opening profile
                      }}
                      className="w-9 h-9 rounded-full cursor-pointer object-cover border border-gray-100"
                      alt="avatar"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                  )}

                  {profileOpen && (
                    <div className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-5 py-4">
                        <p className="font-bold text-sm">
                          {profile?.name || "Anonymous User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>

                        {progress < 100 && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                              <span>Profile Strength</span>
                              <span className="text-indigo-600">
                                {progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-500 h-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-indigo-500 mt-1.5 font-medium italic">
                              Next: {checklist[0]}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="h-[1px] w-full bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-1" />

                      <div className="px-2 space-y-0.5">
                        <Link
                          href={
                            profile?.role === "recruiter"
                              ? "/dashboard/recruiter"
                              : "/dashboard/candidate"
                          }
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5 opacity-60"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 11h7v10h-7zM3 15h7v6H3z" />
                          </svg>
                          Dashboard
                        </Link>
                        {profile?.role === "candidate" && (
                          <Link
                            href="/dashboard/candidate/saved"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5 opacity-60"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Saved Items
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5 opacity-60"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Edit Profile
                        </Link>
                      </div>

                      <div className="h-[1px] w-full bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)] my-1" />

                      <div className="px-2">
                        <button
                          onClick={() => {
                            handleLogout();
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

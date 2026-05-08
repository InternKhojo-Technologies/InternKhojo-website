"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "./ui/Container";
import { supabase } from "@/lib/supabase";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Search,
  Briefcase,
  GraduationCap,
  Info,
  LogOut,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  // Navigation Links (Profile removed from here)
  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Find", href: "/find", icon: Search },
    { name: "Hire", href: "/hire", icon: Briefcase },
    { name: "Mentor", href: "/mentor", icon: GraduationCap },
    { name: "About", href: "/about", icon: Info },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => getUser());

    const handleProfileUpdate = () => getUser();
    window.addEventListener("profileUpdated", handleProfileUpdate);

    const handleClickOutside = () => {
      setProfileOpen(false);
      setOpen(false);
      setNotifOpen(false);
    };
    window.addEventListener("click", handleClickOutside);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Notification Listener
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
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      if (profileData?.avatar_url) {
        setAvatar(profileData.avatar_url);
      } else if (user?.email) {
        setAvatar(createAvatar(thumbs, { seed: user.email }).toDataUri());
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
    setAvatar(null);
    router.push("/");
  };

  function timeAgo(dateString: string) {
    const diff = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / 1000,
    );
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  const today = notifications.filter(
    (n) => new Date(n.created_at).toDateString() === new Date().toDateString(),
  );
  const earlier = notifications.filter(
    (n) => new Date(n.created_at).toDateString() !== new Date().toDateString(),
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-md bg-white/70 shadow-sm" : "bg-white md:bg-white/40"}`}
      >
        <Container>
          <div className="h-16 md:h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <img
                src="/NEW LOGO BG REMOVED.png"
                className="w-8 h-8 md:w-12 md:h-12"
                alt="IK logo"
              />
              <div className="text-xl md:text-3xl font-black tracking-tight">
                InternKhojo
              </div>
            </Link>

            {/* Desktop Center Menu */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`hover:text-blue-600 transition ${pathname === link.href ? "text-blue-600" : "text-gray-700"}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {!user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm text-gray-600"
                  >
                    Login
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(!open);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
                  >
                    Sign up
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 md:gap-4">
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const opening = !notifOpen;
                        setNotifOpen(opening);
                        if (opening) setProfileOpen(false);
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
                      className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition"
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
                        className="absolute right-0 mt-4 w-[320px] md:w-[360px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-6 py-4 flex justify-between items-center bg-white shadow-sm">
                          <h2 className="text-lg font-semibold">
                            Notifications
                          </h2>
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
                            <p className="text-gray-400">
                              No notifications yet.
                            </p>
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
                                  <p className="font-medium text-sm">
                                    {n.title}
                                  </p>
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
                                  <p className="font-medium text-sm">
                                    {n.title}
                                  </p>
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

                  {/* Profile Photo (Top Only) */}
                  <div className="relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileOpen(!profileOpen);
                          setNotifOpen(false);
                        }}
                        className="w-9 h-9 rounded-full cursor-pointer object-cover border border-gray-100"
                        alt="avatar"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                    )}
                    {profileOpen && (
                      <div
                        className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="font-bold text-sm">
                            {profile?.name || "Anonymous User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="p-2 space-y-1">
                          <Link
                            href={
                              profile?.role === "recruiter"
                                ? "/dashboard/recruiter"
                                : "/dashboard/candidate"
                            }
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                          >
                            <LayoutDashboard size={16} /> Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                          >
                            <UserCircle size={16} /> Edit Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut size={16} /> Logout
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
      </nav>

      {/* --- MOBILE BOTTOM BAR (Profile Removed) --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-2 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full gap-1 transition-all select-none touch-manipulation ${isActive ? "text-blue-600" : "text-gray-400"}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16 md:hidden" />
    </>
  );
}

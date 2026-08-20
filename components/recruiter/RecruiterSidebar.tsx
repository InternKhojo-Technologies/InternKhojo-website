"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Briefcase, Users, Menu, X } from "lucide-react";

interface RecruiterSidebarProps {
  company?: {
    name?: string;
    logo_url?: string;
  } | null;
  collapsed?: boolean;
  setCollapsed?: (val: boolean | ((prev: boolean) => boolean)) => void;
}

const navItems = [
  { name: "Dashboard", href: "/dashboard/recruiter", icon: LayoutDashboard },
  { name: "Jobs", href: "/dashboard/recruiter/jobs", icon: Briefcase },
  {
    name: "Applications",
    href: "/dashboard/recruiter/applications",
    icon: Users,
  },
];

export default function RecruiterSidebar({
  company,
  collapsed: externalCollapsed,
  setCollapsed: externalSetCollapsed,
}: RecruiterSidebarProps) {
  const pathname = usePathname();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const collapsed =
    externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = externalSetCollapsed || setInternalCollapsed;

  // Keyboard shortcut toggle (Desktop)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((prev: boolean) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCollapsed]);

  // Route change hone par mobile drawer automatically close ho
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const renderNavLinks = (isMobile = false) => (
    <div className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link key={item.name} href={item.href} className="block">
            <motion.div
              whileHover={{ x: 3 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                active
                  ? "bg-red-500 text-white shadow-lg shadow-red-200 font-bold"
                  : "hover:bg-gray-100 text-gray-600 font-medium"
              }`}
            >
              <Icon size={18} />
              {(!collapsed || isMobile) && (
                <span className="text-sm">{item.name}</span>
              )}
            </motion.div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* 1. MOBILE TOP BAR (Phone screen pe yeh dikhega) */}
      <div className="flex md:hidden items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors cursor-pointer border border-gray-100"
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company?.name || "Logo"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-xs text-gray-700 uppercase">
                  {company?.name?.[0] || "C"}
                </span>
              )}
            </div>
            <span className="text-xs font-bold truncate max-w-[150px] text-gray-900">
              {company?.name || "Company"}
            </span>
          </div>
        </div>

        <span className="text-[10px] bg-red-50 text-red-600 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
          Recruiter
        </span>
      </div>

      {/* 2. DESKTOP SIDEBAR (Badi screen pe persistent sidebar) */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.25 }}
        className="hidden md:flex rounded-2xl p-4 shadow-[0_10px_30px_rgb(0,0,0,0.05)] bg-white border border-gray-50 flex-col justify-between h-[calc(100vh-48px)] sticky top-6 z-20 select-none flex-shrink-0"
      >
        <div>
          <button
            type="button"
            onClick={() => setCollapsed((prev: boolean) => !prev)}
            className="mb-6 hover:bg-gray-100 p-2 rounded-lg transition-colors cursor-pointer text-gray-700"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company?.name || "Company Logo"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-gray-700 uppercase">
                  {company?.name?.[0] || "C"}
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-gray-900">
                  {company?.name || "Company"}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-tighter font-semibold">
                  Recruiter
                </p>
              </div>
            )}
          </div>

          {renderNavLinks(false)}
        </div>

        {!collapsed && (
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
              Shortcut
            </p>
            <p className="text-xs text-gray-500">⌘ + B to toggle</p>
          </div>
        )}
      </motion.aside>

      {/* 3. MOBILE SLIDE-OVER DRAWER (Menu click pe slide hoga) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-[999] p-6 flex flex-col justify-between md:hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                      {company?.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company?.name || "Company Logo"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-gray-700 uppercase">
                          {company?.name?.[0] || "C"}
                        </span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold truncate text-gray-900">
                        {company?.name || "Company"}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-tighter font-semibold">
                        Recruiter
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {renderNavLinks(true)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

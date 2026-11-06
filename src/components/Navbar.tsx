"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  Database,
  History,
  LogOut,
  User as UserIcon,
  Shield,
  Layers,
} from "lucide-react";
import { logoutAction } from "@/app/actions/authActions";
import { SessionUser } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  user: SessionUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  if (!user || pathname === "/login") {
    return null;
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/question-bank", label: "Question Bank", icon: BookOpen },
    { href: "/examinations", label: "Examinations", icon: FileSpreadsheet },
    ...(user.role === "SUPERADMIN"
      ? [{ href: "/master-data", label: "Master Data", icon: Database }]
      : []),
    { href: "/audit-logs", label: "Audit History", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#08090a]/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#5e6ad2] text-white shadow-[0_0_12px_rgba(94,106,210,0.5)] transition-transform group-hover:scale-105">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-[#f7f8f8] text-xs tracking-tight font-mono">
                  TRUSKILL
                </span>
                <span className="hidden sm:inline-block text-[#8a8f98] font-mono text-[11px]">
                  / ops
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-200/70 dark:bg-white/[0.08] text-slate-900 dark:text-[#f7f8f8] border border-slate-300/80 dark:border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                      : "text-slate-600 dark:text-[#8a8f98] hover:text-slate-900 dark:hover:text-[#f7f8f8] hover:bg-slate-100 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#5e6ad2]" : "text-[#8a8f98]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Theme Toggle + User Badge + Logout */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200 dark:border-white/[0.08]">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 dark:bg-[#141516] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-[#d0d6e0]">
                <UserIcon className="h-3.5 w-3.5" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-slate-900 dark:text-[#f7f8f8] leading-none">
                  {user.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${
                      user.role === "SUPERADMIN"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40"
                    }`}
                  >
                    {user.role === "SUPERADMIN" && <Shield className="h-2 w-2" />}
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign out"
                className="inline-flex items-center justify-center p-1.5 rounded-md text-[#8a8f98] hover:text-[#eb5757] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Brand Logo & Identifier */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs transition-transform group-hover:scale-105">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-semibold text-zinc-950 dark:text-zinc-50 text-xs tracking-tight">
                  BRIDGE
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
                  / ops
                </span>
              </div>
            </Link>

            {/* Navigation Links — Modern Tab-style */}
            <nav className="hidden md:flex items-center gap-1">
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
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50 font-semibold shadow-2xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        isActive
                          ? "text-zinc-950 dark:text-zinc-50"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Theme Toggle + User Badge + Sign Out */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-200 dark:border-zinc-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                <UserIcon className="h-3.5 w-3.5" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-none">
                  {user.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
                    {user.role === "SUPERADMIN" && (
                      <Shield className="h-2.5 w-2.5 text-zinc-950 dark:text-zinc-100" />
                    )}
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign out"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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

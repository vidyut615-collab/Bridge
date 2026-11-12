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
    { href: "/audit-logs", label: "Audit Ledger", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/90 dark:border-zinc-800/90 bg-white/90 dark:bg-[#0e0e11]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-13 items-center justify-between">
          {/* Brand Identifier & Navigation */}
          <div className="flex items-center gap-7">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-2xs transition-transform group-hover:scale-[1.02]">
                <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="font-semibold text-zinc-950 dark:text-zinc-50 text-xs tracking-tight">
                  BRIDGE
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
                  ops
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
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
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      isActive
                        ? "bg-zinc-100/90 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-medium border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        isActive
                          ? "text-zinc-950 dark:text-zinc-100"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                      strokeWidth={1.75}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Controls & Utility Actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <div className="flex items-center gap-2 pl-2.5 border-l border-zinc-200 dark:border-zinc-800">
              <div className="hidden sm:flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-md px-2.5 py-1">
                <div className="h-5 w-5 rounded-sm bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  <UserIcon className="h-3 w-3" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-medium leading-none text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </span>
                  <span className="text-[9px] font-mono leading-none text-zinc-500 mt-0.5">
                    {user.role}
                  </span>
                </div>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

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
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141415] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Brand Identifier & Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950">
                <Layers className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="font-medium text-zinc-900 dark:text-zinc-100 text-xs tracking-tight">
                  Bridge
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
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors duration-150 ${
                      isActive
                        ? "bg-[#f4f4f5] dark:bg-[#232325] text-zinc-900 dark:text-zinc-100 font-medium border border-black/[0.08] dark:border-white/[0.08]"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                      strokeWidth={1.5}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Controls & Utility Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="flex items-center gap-2 pl-2 border-l border-black/[0.08] dark:border-white/[0.08]">
              <div className="hidden sm:flex items-center gap-2 bg-[#f4f4f5] dark:bg-[#232325] border border-black/[0.08] dark:border-white/[0.08] rounded-md px-2.5 py-1">
                <UserIcon className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                    ({user.role.toLowerCase()})
                  </span>
                </div>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors duration-150"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

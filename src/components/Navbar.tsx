"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  Database,
  History,
  LogOut,
  User as UserIcon,
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
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-hairline)] bg-[var(--bg-card)]/90 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="flex h-14 items-center justify-between">
          {/* Brand Identifier & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-zinc-950 dark:bg-zinc-900 border border-[var(--border-hairline)] transition-transform duration-150 group-hover:scale-[1.02]">
                <Image src="/icon.png" alt="Bridge Logo" width={32} height={32} className="object-cover" priority />
              </div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="font-semibold text-[var(--text-primary)] text-sm tracking-tight">
                  Bridge
                </span>
                <span className="text-[var(--text-muted)] text-[11px] font-normal">
                  ops
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
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
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors duration-150 ${
                      isActive
                        ? "bg-[var(--bg-raised)] text-[var(--text-primary)] font-medium border border-[var(--border-hairline)] shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-muted)]"
                      }`}
                      strokeWidth={1.5}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Controls & Utility Actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <div className="flex items-center gap-2 pl-2.5 border-l border-[var(--border-hairline)]">
              <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-md px-3 py-1">
                <div className="h-5 w-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center text-[10px] font-mono font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors duration-150"
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

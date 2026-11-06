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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 leading-tight tracking-tight text-base">
                  TRUSKILL
                </span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Assessment Ops & Observability
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
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-none">
                  {user.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold tracking-wide ${
                      user.role === "SUPERADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.role === "SUPERADMIN" && <Shield className="h-2.5 w-2.5" />}
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign out"
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

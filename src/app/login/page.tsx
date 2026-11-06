"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/authActions";
import { Layers, Shield, User, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during sign-in.");
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6 bg-white dark:bg-[#0f1011] p-8 rounded-xl shadow-xl dark:shadow-[0_4px_32px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-colors">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#5e6ad2] text-white shadow-[0_0_20px_rgba(94,106,210,0.5)] mb-3">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#f7f8f8]">
            Truskill Operations
          </h2>
          <p className="mt-1 text-xs text-[#8a8f98]">
            Assessment Operations & Observability System
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#8a8f98] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@truskill.com"
              className="w-full px-3 py-2 text-xs rounded-md bg-white dark:bg-[#141516] border border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/50 transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#8a8f98] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-md bg-white dark:bg-[#141516] border border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/50 transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#5e6ad2] text-white font-medium text-xs hover:bg-[#6d78d5] shadow-[0_0_16px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in to Operations"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Quick Demo Logins for Pair Programming */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06]">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#8a8f98] text-center mb-2.5">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@truskill.com", "admin123")}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-purple-200 dark:border-purple-800/40 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition"
            >
              <Shield className="h-3 w-3" />
              Superadmin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("staff@truskill.com", "staff123")}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
            >
              <User className="h-3 w-3" />
              Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

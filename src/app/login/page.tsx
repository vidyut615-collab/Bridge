"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/authActions";
import { Layers, ArrowRight, AlertCircle } from "lucide-react";
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during sign-in.";
      setError(msg);
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl transition-colors">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs mb-3">
            <Layers className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 font-mono">
            Bridge
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Internal Operations Platform • Powered by Truskill
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-medium text-zinc-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@truskill.com"
              className="h-9 w-full px-3 text-xs rounded-lg bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-medium text-zinc-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-9 w-full px-3 text-xs rounded-lg bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in to Bridge"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Authorized personnel only. Contact your administrator if you need access.
          </p>
        </div>

        <div className="pt-2 text-center border-t border-zinc-100 dark:border-zinc-800/80">
          <p className="text-[11px] font-mono text-zinc-400">
            Internal Platform • <span className="text-zinc-600 dark:text-zinc-300 font-medium">Powered by Truskill</span>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/authActions";
import { Layers, Shield, User, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200/80">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md mb-4">
            <Layers className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Truskill Operations
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Assessment Operations & Observability System
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3.5 border border-red-200 text-red-800 flex items-center gap-2.5 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@truskill.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition shadow-xs disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in to Operations"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Demo Logins for Pair Programming */}
        <div className="pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@truskill.com", "admin123")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
            >
              <Shield className="h-3.5 w-3.5" />
              Superadmin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("staff@truskill.com", "staff123")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
            >
              <User className="h-3.5 w-3.5" />
              Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { loginAction } from "@/app/actions/authActions";
import { ArrowRight, AlertCircle } from "lucide-react";
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md craft-card p-8 rounded-2xl shadow-2xl space-y-6 border border-[var(--border-hairline)] transition-colors">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden mb-4 border border-[var(--border-hairline)] bg-[var(--bg-raised)] shadow-sm">
            <Image src="/icon.png" alt="Bridge Logo" width={56} height={56} className="object-cover" priority />
          </div>
          <h2 className="text-xl font-bold tracking-wider text-[var(--text-primary)] font-mono">
            BRIDGE
          </h2>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Assessment Operations & Observability Ledger
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@truskill.com"
              className="h-11 w-full px-4 text-sm rounded-xl bg-[var(--bg-raised)] border border-[var(--border-hairline)] focus:border-indigo-500 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Secure Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full px-4 text-sm rounded-xl bg-[var(--bg-raised)] border border-[var(--border-hairline)] focus:border-indigo-500 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="craft-button-primary w-full h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? "Authenticating Session..." : "Authenticate Session"}
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </form>

        <div className="pt-4 border-t border-[var(--border-hairline)] text-center">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Internal operations terminal. Access is restricted and actively monitored for authorized Truskill operators.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Check saved preference or default to dark (Linear signature)
    const saved = localStorage.getItem("truskill_theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("truskill_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("truskill_theme", "light");
    }
  };

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Linear Light Mode" : "Switch to Linear Dark Mode"}
      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-white/[0.05] dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-300 dark:hover:border-white/[0.08] transition-all"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700" />
      )}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("truskill_theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
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
      title={isDark ? "Switch to Light Canvas" : "Switch to Dark Surface"}
      className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors"
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5 text-zinc-100" />
      ) : (
        <Moon className="h-3.5 w-3.5 text-zinc-900" />
      )}
    </button>
  );
}

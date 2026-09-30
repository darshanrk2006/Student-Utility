"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (t: "light" | "dark" | "system") => {
    const isDark =
      t === "dark" ||
      (t === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("st_theme") as "light" | "dark" | "system") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      const current = (localStorage.getItem("st_theme") as "light" | "dark" | "system") || "system";
      if (current === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const handleToggle = () => {
    // Cycle: Light -> Dark -> System -> Light
    const nextTheme: "light" | "dark" | "system" =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

    setTheme(nextTheme);
    localStorage.setItem("st_theme", nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800" />
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="relative p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
      title={`Current Theme: ${theme.toUpperCase()} (Click to toggle Light / Dark / System)`}
      aria-label="Toggle theme mode"
    >
      {theme === "light" && <Sun className="w-4 h-4 text-amber-500 animate-in zoom-in-50 duration-150" />}
      {theme === "dark" && <Moon className="w-4 h-4 text-indigo-400 animate-in zoom-in-50 duration-150" />}
      {theme === "system" && <Monitor className="w-4 h-4 text-emerald-500 animate-in zoom-in-50 duration-150" />}
    </button>
  );
}

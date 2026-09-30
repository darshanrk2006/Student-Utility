"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  Search,
  Menu,
  X,
  FileText,
  QrCode,
  ArrowLeftRight,
  Apple,
  Shield,
  Command,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { TOOLS, TOOL_CATEGORIES } from "@/lib/tools-data";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  const filteredTools = searchQuery.trim()
    ? TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : TOOLS.slice(0, 6);

  const handleSelectTool = (href: string) => {
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-1.5">
                StudentToolkit
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Free
                </span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
                100% Free · No Login
              </span>
            </div>
          </Link>

          {/* Desktop Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/90 text-slate-500 dark:text-slate-400 text-sm transition-all w-64 lg:w-72 justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search any tool...</span>
            </div>
            <kbd className="hidden lg:flex items-center gap-0.5 text-[10px] font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>

          {/* Category Quick Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link
              href="/#pdf"
              className="px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              PDFs
            </Link>
            <Link
              href="/qr"
              className={`px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 ${
                pathname === "/qr" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40" : ""
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-500" />
              QR Codes
            </Link>
            <Link
              href="/convert"
              className={`px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 ${
                pathname === "/convert" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40" : ""
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-violet-500" />
              Converters
            </Link>
            <Link
              href="/pages-to-pdf"
              className={`px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 ${
                pathname === "/pages-to-pdf" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40" : ""
              }`}
            >
              <Apple className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              Pages
            </Link>
            <Link
              href="/privacy"
              className={`px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 ${
                pathname === "/privacy" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40" : ""
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Privacy
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800"
              aria-label="Search tools"
            >
              <Search className="w-4 h-4" />
            </button>

            <ThemeToggle />

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <Link
                href="/#pdf"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${
                  pathname === "/" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                <FileText className="w-4 h-4 text-blue-500" />
                PDF Suite
              </Link>
              <Link
                href="/qr"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${
                  pathname === "/qr" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                <QrCode className="w-4 h-4 text-indigo-500" />
                QR Code Gen
              </Link>
              <Link
                href="/convert"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${
                  pathname === "/convert" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 text-violet-500" />
                Universal Converters
              </Link>
              <Link
                href="/pages-to-pdf"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${
                  pathname === "/pages-to-pdf" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                <Apple className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                Pages Extractor
              </Link>
              <Link
                href="/word-counter"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${
                  pathname === "/word-counter" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                <FileText className="w-4 h-4 text-amber-500" />
                Word Counter
              </Link>
              <Link
                href="/citation-generator"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${
                  pathname === "/citation-generator" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                <Sparkles className="w-4 h-4 text-pink-500" />
                Citation Maker
              </Link>
              <Link
                href="/gpa-calculator"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${
                  pathname === "/gpa-calculator" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-cyan-500" />
                GPA Calculator
              </Link>
              <Link
                href="/privacy"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${
                  pathname === "/privacy" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-500" />
                Privacy Policy
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Search Modal (Cmd+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-indigo-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name (e.g. merge pdf, qr code, docx, gpa)..."
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-base"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tool Results Grid */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-1.5">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleSelectTool(tool.href)}
                    className="w-full text-left p-3 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors flex items-center justify-between group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                          {tool.name}
                          {tool.badge && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {tool.shortDesc}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      Open &rarr;
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-sm font-medium">No tools found matching &quot;{searchQuery}&quot;</p>
                  <p className="text-xs mt-1 text-slate-400">Try searching for &quot;PDF&quot;, &quot;QR&quot;, &quot;Word&quot;, or &quot;GPA&quot;</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-950/60 px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span>Navigate tools instantly</span>
              </span>
              <span>Press <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">ESC</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

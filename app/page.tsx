"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  Zap,
  GraduationCap,
  ArrowRight,
  Layers,
  Scissors,
  RotateCw,
  Image,
  FileImage,
  Minimize2,
  Hash,
  FileCode,
  FileSpreadsheet,
  FileEdit,
  Presentation,
  Sheet,
  Apple,
  BookOpen,
  FileText,
  Quote,
  Calculator,
  Scale,
  Minimize,
  QrCode,
  Lock,
  Target,
  ArrowLeftRight,
  Clock,
  X,
  LayoutGrid,
  CheckCircle2,
  ChevronRight,
  Star,
  Download,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { TOOLS, TOOL_CATEGORIES, ToolItem } from "@/lib/tools-data";

const ICON_MAP: Record<string, React.ReactNode> = {
  QrCode: <QrCode className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Scissors: <Scissors className="w-5 h-5" />,
  RotateCw: <RotateCw className="w-5 h-5" />,
  Image: <Image className="w-5 h-5" />,
  FileImage: <FileImage className="w-5 h-5" />,
  Minimize2: <Minimize2 className="w-5 h-5" />,
  Hash: <Hash className="w-5 h-5" />,
  FileCode: <FileCode className="w-5 h-5" />,
  FileSpreadsheet: <FileSpreadsheet className="w-5 h-5" />,
  FileEdit: <FileEdit className="w-5 h-5" />,
  Presentation: <Presentation className="w-5 h-5" />,
  Sheet: <Sheet className="w-5 h-5" />,
  Apple: <Apple className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Quote: <Quote className="w-5 h-5" />,
  Calculator: <Calculator className="w-5 h-5" />,
  Scale: <Scale className="w-5 h-5" />,
  Minimize: <Minimize className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  ArrowLeftRight: <ArrowLeftRight className="w-5 h-5" />,
};

// Section metadata for categorized suite display
const SUITE_SECTIONS = [
  {
    id: "academic",
    title: "Student & Academic Utilities",
    shortTitle: "Academic",
    icon: <GraduationCap className="w-5 h-5 text-indigo-500" />,
    badge: "100% Free · Privacy First",
    desc: "GPA / CGPA calculations, exam internal targets, ATS placement resume builder, citations, and essay tools.",
    accentColor: "indigo",
    borderAccent: "border-indigo-200 dark:border-indigo-900/60",
    bgLight: "bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-transparent dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40",
  },
  {
    id: "pdf",
    title: "PDF Powerhouse Suite",
    shortTitle: "PDF Suite",
    icon: <FileText className="w-5 h-5 text-blue-500" />,
    badge: "In-Browser WebAssembly",
    desc: "Merge, split, compress, reorder, number, and extract text/images from PDF documents locally in your browser.",
    accentColor: "blue",
    borderAccent: "border-blue-200 dark:border-blue-900/60",
    bgLight: "bg-gradient-to-r from-blue-50/70 via-sky-50/40 to-transparent dark:from-blue-950/40 dark:via-sky-950/20 dark:to-slate-900/40",
  },
  {
    id: "convert",
    title: "Document Converters",
    shortTitle: "Converters",
    icon: <ArrowLeftRight className="w-5 h-5 text-amber-500" />,
    badge: "100% Client-Side Word to PDF",
    desc: "Convert Word, PowerPoint, Excel, and Apple Pages files to PDF and editable Word formats.",
    accentColor: "amber",
    borderAccent: "border-amber-200 dark:border-amber-900/60",
    bgLight: "bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-transparent dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900/40",
  },
  {
    id: "qr",
    title: "QR Code Studio",
    shortTitle: "QR Codes",
    icon: <QrCode className="w-5 h-5 text-emerald-500" />,
    badge: "Instant SVG & PNG Output",
    desc: "Generate static QR codes with color customization, WiFi links, error correction, and batch ZIP mode.",
    accentColor: "emerald",
    borderAccent: "border-emerald-200 dark:border-emerald-900/60",
    bgLight: "bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900/40",
  },
];

// Top 4 High-Frequency Quick Launch Utilities (With ATS Resume Builder in top spotlight)
const QUICK_LAUNCH_TOOLS = [
  {
    id: "resume-builder",
    name: "ATS Resume Maker",
    badge: "1-Page PDF Export",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    href: "/resume-builder",
    icon: <Briefcase className="w-5 h-5 text-cyan-500" />,
    desc: "Free ATS single-page resume builder with preloaded student profiles & live PDF print.",
    isNew: true,
  },
  {
    id: "gpa-calculator",
    name: "GPA / CGPA Calculator",
    badge: "O Grade (10.0 Scale)",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    href: "/gpa-calculator",
    icon: <Calculator className="w-5 h-5 text-indigo-500" />,
    desc: "Semester 1 on load with official Anna Univ / AICTE & 4.0 GPA formulas.",
  },
  {
    id: "marks-calculator",
    name: "Exam Marks Target",
    badge: "IAT 1 + 2 + Classwork",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    href: "/marks-calculator",
    icon: <Target className="w-5 h-5 text-emerald-500" />,
    desc: "Calculate required final exam marks to secure Grade O, A+, A or Pass cutoff.",
  },
  {
    id: "word-to-pdf",
    name: "Word (.docx) to PDF",
    badge: "100% In-Browser",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    href: "/word-to-pdf",
    icon: <FileCode className="w-5 h-5 text-blue-500" />,
    desc: "Zero-cost client-side Word to PDF converter with instant document preview.",
  },
];

const SEARCH_SUGGESTIONS = [
  { label: "📄 ATS Resume Maker", query: "resume" },
  { label: "🎓 GPA / CGPA (10.0)", query: "gpa" },
  { label: "🎯 Internal Marks Target", query: "marks" },
  { label: "🔄 Word to PDF", query: "word" },
  { label: "📑 Merge PDF", query: "merge" },
  { label: "📱 QR Code", query: "qr" },
  { label: "📖 Citations", query: "citation" },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recently clicked tools from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("studenttoolkit_recent");
      if (saved) {
        setRecentTools(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleToolClick = (toolId: string) => {
    try {
      const updated = [toolId, ...recentTools.filter((id) => id !== toolId)].slice(0, 4);
      setRecentTools(updated);
      localStorage.setItem("studenttoolkit_recent", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.shortDesc.toLowerCase().includes(q) ||
        tool.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const recentToolItems = useMemo(() => {
    return recentTools
      .map((id) => TOOLS.find((t) => t.id === id))
      .filter((t): t is ToolItem => Boolean(t));
  }, [recentTools]);

  // Handle Enter key inside search to navigate to first result
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredTools.length > 0) {
      handleToolClick(filteredTools[0].id);
      router.push(filteredTools[0].href);
    }
    if (e.key === "Escape") {
      setSearchQuery("");
      searchInputRef.current?.blur();
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  // Scroll smoothly to category section
  const scrollToSuite = (suiteId: string) => {
    setSelectedCategory("all");
    const el = document.getElementById(`suite-${suiteId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-full space-y-12 sm:space-y-16">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH ATS RESUME & ACADEMIC HIGHLIGHT */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-12 md:pt-14 md:pb-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950 rounded-3xl">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Trust Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm mb-5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>100% Free · No Sign-Up · 100% In-Browser Privacy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl mx-auto leading-tight md:leading-tight mb-3">
            Everything College Students Need,{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              In One Clean Hub.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-7 leading-relaxed font-medium">
            Build ATS placement resumes, calculate semester GPA & internal marks targets, convert Word to PDF, and organize documents — zero ads, zero logins.
          </p>

          {/* ======================================================================= */}
          {/* SEARCH BAR */}
          {/* ======================================================================= */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative flex items-center group">
              <Search className="w-5 h-5 text-indigo-500 absolute left-4 pointer-events-none transition-transform group-focus-within:scale-110" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search any tool (e.g., Resume, GPA, Internal Marks, Word to PDF, QR)..."
                className={`w-full pl-12 pr-16 py-4 rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base transition-all font-medium focus:outline-none ${
                  isSearching
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl"
                    : "border-slate-300 dark:border-slate-800 shadow-xl shadow-indigo-500/5 focus:ring-2 focus:ring-indigo-500"
                }`}
              />

              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              ) : (
                <span className="hidden sm:flex items-center gap-0.5 absolute right-4 text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  ⌘K /
                </span>
              )}
            </div>

            {/* Quick search suggestion chips */}
            {!isSearching && (
              <div className="flex items-center justify-center gap-1.5 flex-wrap mt-3">
                <span className="text-[11px] font-bold text-slate-400">Popular:</span>
                {SEARCH_SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setSearchQuery(s.query);
                      setSelectedCategory("all");
                    }}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* SEARCH RESULTS OR QUICK LAUNCH DOCK */}
          {/* ======================================================================= */}
          <div className="pt-2 max-w-5xl mx-auto">
            {isSearching ? (
              /* CLEAN IN-PLACE SEARCH RESULTS */
              <div className="space-y-4 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Found {filteredTools.length} {filteredTools.length === 1 ? "utility" : "utilities"} matching &quot;{searchQuery}&quot;
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                      (Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border">Enter ↵</kbd> to launch top match)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>

                {filteredTools.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      No utilities found matching &quot;{searchQuery}&quot;
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try searching &quot;Resume&quot;, &quot;GPA&quot;, &quot;Marks&quot;, &quot;PDF&quot;, or &quot;QR&quot;.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredTools.map((tool, idx) => (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        onClick={() => handleToolClick(tool.id)}
                        className={`group p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg ${
                          idx === 0
                            ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                            : "border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {ICON_MAP[tool.iconName] || <Sparkles className="w-4 h-4" />}
                            </div>
                            {tool.badge && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {tool.shortDesc}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          <span>{idx === 0 ? "Top Match ↵" : "Launch"}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* DEFAULT 4 HIGH-FREQUENCY QUICK LAUNCH CARDS */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left">
                {QUICK_LAUNCH_TOOLS.map((q) => (
                  <Link
                    key={q.id}
                    href={q.href}
                    onClick={() => handleToolClick(q.id)}
                    className="group p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex flex-col justify-between hover:-translate-y-0.5 relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                          {q.icon}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${q.badgeColor}`}>
                          {q.badge}
                        </span>
                      </div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {q.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {q.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Launch Tool</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. RECENTLY ACCESSED TOOLS RIBBON */}
      {/* ========================================================================= */}
      {recentToolItems.length > 0 && !isSearching && selectedCategory === "all" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 sm:p-5 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Recently Visited by You
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Quick access to tools you used recently.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              {recentToolItems.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
                >
                  <span>{ICON_MAP[tool.iconName] || <Sparkles className="w-3.5 h-3.5" />}</span>
                  <span>{tool.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. FLUID CATEGORY DIRECTORY & ENHANCED SUITE EXPLORER */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filter Pills Bar & Jump Anchors */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Explore All Suites & Features
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {TOOLS.length} Free Utilities
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Switch between suites or jump directly to any functional academic or document tool.
              </p>
            </div>

            {/* Suite Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
              {TOOL_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const count =
                  cat.id === "all"
                    ? TOOLS.length
                    : TOOLS.filter((t) => t.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Anchor Jump Links (when All is selected) */}
          {selectedCategory === "all" && (
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="text-[11px] font-bold text-slate-400">Direct Suite Jump:</span>
              <button
                type="button"
                onClick={() => scrollToSuite("academic")}
                className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-indigo-200/50 dark:border-indigo-800/50"
              >
                🎓 Student Utilities ({TOOLS.filter((t) => t.category === "academic").length})
              </button>
              <button
                type="button"
                onClick={() => scrollToSuite("pdf")}
                className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-blue-200/50 dark:border-blue-800/50"
              >
                📑 PDF Suite ({TOOLS.filter((t) => t.category === "pdf").length})
              </button>
              <button
                type="button"
                onClick={() => scrollToSuite("convert")}
                className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-amber-200/50 dark:border-amber-800/50"
              >
                🔄 Document Converters ({TOOLS.filter((t) => t.category === "convert").length})
              </button>
              <button
                type="button"
                onClick={() => scrollToSuite("qr")}
                className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-emerald-200/50 dark:border-emerald-800/50"
              >
                📱 QR Studio ({TOOLS.filter((t) => t.category === "qr").length})
              </button>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* CATEGORIZED SUITE SECTIONS */}
        {/* ======================================================================= */}
        <div className="space-y-12">
          {SUITE_SECTIONS.filter(
            (sec) => selectedCategory === "all" || selectedCategory === sec.id
          ).map((section) => {
            const suiteTools = TOOLS.filter((t) => t.category === section.id);

            return (
              <div
                key={section.id}
                id={`suite-${section.id}`}
                className="space-y-5 scroll-mt-24"
              >
                {/* Suite Header Banner */}
                <div className={`p-5 sm:p-6 rounded-3xl ${section.bgLight} border ${section.borderAccent} flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xs`}>
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 flex-shrink-0 mt-0.5 sm:mt-0">
                      {section.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                          {section.title}
                        </h3>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                          {suiteTools.length} {suiteTools.length === 1 ? "Tool" : "Tools"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {section.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                        {section.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suite Tools Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {suiteTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      onClick={() => handleToolClick(tool.id)}
                      className="group relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Bar with Icon & Badge */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            {ICON_MAP[tool.iconName] || <Sparkles className="w-5 h-5" />}
                          </div>

                          {tool.badge && (
                            <span
                              className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full border ${
                                tool.badgeType === "in-browser"
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : tool.badgeType === "cloud"
                                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                              }`}
                            >
                              {tool.badge}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5">
                          {tool.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                          {tool.shortDesc}
                        </p>

                        {/* Quick Feature Highlights / Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {tool.features.slice(0, 2).map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{feat}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Card Action */}
                      <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <span className="text-[11px] font-medium">
                          {tool.isClientOnly ? "⚡ In-Browser RAM" : "☁️ High-Speed Convert"}
                        </span>
                        <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Open Tool</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY STUDENTS LOVE STUDENTTOOLKIT PILLARS */}
      {/* ========================================================================= */}
      <section className="bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 py-12 md:py-16 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">
              Designed for Speed & Free Flow
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              No paywalls, no email signups, no watermarks, and no annoying timers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1.5">
                100% In-Browser Privacy
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                PDF merging, GPA calculations, marks forecasting, and resume generation execute right inside your device RAM. Your private homework never leaves your browser.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1.5">
                Academic Standard Regulations
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Calculators are pre-configured to standard university regulations (Anna Univ, VTU, AICTE, US GPA) including Grade O (10.0 scale), CIA weightages, and ATS guidelines.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1.5">
                Works Across All Devices
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Fully responsive on iPhone, Android phones, iPads, MacBooks, Windows, and Chromebooks. Instant load speeds with zero bloat.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

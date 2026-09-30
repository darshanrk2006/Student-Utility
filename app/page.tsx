"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ShieldCheck,
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
  CheckCircle2,
  Lock,
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
};

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Trust Banner Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Zero Sign-Up · 100% Free Forever · No Ads</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl mx-auto leading-tight md:leading-tight mb-6">
            The Free, All-in-One Utility Suite for{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              College Students
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Merge & split PDFs, batch generate QR codes, convert Word documents, extract Apple Pages previews, and calculate GPAs with total privacy right in your browser.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-indigo-500 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 15+ student utilities (e.g., merge pdf, qr code, docx, apa citation)..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-xl shadow-indigo-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm sm:text-base transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-3xl mx-auto">
            {TOOL_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Tools Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {selectedCategory === "all"
                ? "All Tools"
                : TOOL_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredTools.length} {filteredTools.length === 1 ? "utility" : "utilities"}
            </p>
          </div>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              No tools matched your search query.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try searching with broader terms like &quot;PDF&quot;, &quot;QR&quot;, or &quot;Word&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      {ICON_MAP[tool.iconName] || <Sparkles className="w-5 h-5" />}
                    </div>

                    {tool.badge && (
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
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
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {tool.shortDesc}
                  </p>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <span>{tool.isClientOnly ? "Runs in browser" : "Cloud conversion"}</span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Use tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Value Pillars Section */}
      <section className="bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
              Built for Students, Without the Nonsense
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No subscriptions, no watermarks, no forced sign-ups, and no hidden limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
                100% In-Browser Privacy
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                PDF merging, splitting, QR creation, and academic tools execute locally in WebAssembly memory. Your homework and confidential papers are never uploaded to foreign servers.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
                No Accounts, No Sign-Up
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We believe students shouldn&apos;t have to sacrifice email addresses or create accounts just to format a citation, compress an image, or turn slides into a PDF.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
                Mobile & Tablet Ready
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Works seamlessly across iPhone, Android phones, iPads, MacBooks, Windows laptops, and Chromebooks. Fast, lightweight, and battery-friendly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

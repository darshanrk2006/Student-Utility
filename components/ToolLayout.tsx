import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Sparkles,
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
} from "lucide-react";
import { ToolItem, TOOLS } from "@/lib/tools-data";

const ICON_MAP: Record<string, React.ReactNode> = {
  QrCode: <QrCode className="w-6 h-6" />,
  Layers: <Layers className="w-6 h-6" />,
  Scissors: <Scissors className="w-6 h-6" />,
  RotateCw: <RotateCw className="w-6 h-6" />,
  Image: <Image className="w-6 h-6" />,
  FileImage: <FileImage className="w-6 h-6" />,
  Minimize2: <Minimize2 className="w-6 h-6" />,
  Hash: <Hash className="w-6 h-6" />,
  FileCode: <FileCode className="w-6 h-6" />,
  FileSpreadsheet: <FileSpreadsheet className="w-6 h-6" />,
  FileEdit: <FileEdit className="w-6 h-6" />,
  Presentation: <Presentation className="w-6 h-6" />,
  Sheet: <Sheet className="w-6 h-6" />,
  Apple: <Apple className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  FileText: <FileText className="w-6 h-6" />,
  Quote: <Quote className="w-6 h-6" />,
  Calculator: <Calculator className="w-6 h-6" />,
  Scale: <Scale className="w-6 h-6" />,
  Minimize: <Minimize className="w-6 h-6" />,
};

export interface ToolLayoutProps {
  tool: ToolItem;
  children: React.ReactNode;
}

export function ToolLayout({ tool, children }: ToolLayoutProps) {
  const relatedTools = TOOLS.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  ).slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <Link
          href={`/#${tool.category}`}
          className="capitalize hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {tool.category}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <span className="text-slate-900 dark:text-slate-200 font-semibold">{tool.name}</span>
      </nav>

      {/* Tool Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 mb-4">
          {ICON_MAP[tool.iconName] || <Sparkles className="w-6 h-6" />}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
          {tool.name}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {tool.description}
        </p>

        {/* Security & Privacy Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
          {tool.isClientOnly ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% In-Browser — Files never leave your device</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-500" />
              <span>High-Fidelity Cloud Convert — Auto-purged immediately</span>
            </>
          )}
        </div>
      </div>

      {/* Main Interactive Tool Workspace */}
      <div className="mb-16">{children}</div>

      {/* How It Works Steps */}
      {tool.steps && tool.steps.length > 0 && (
        <section className="mb-14">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
            How to use {tool.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tool.steps.map((s) => (
              <div
                key={s.step}
                className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center mb-3 border border-indigo-100 dark:border-indigo-900/50">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Frequently Asked Questions */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="mb-14 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {tool.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left"
              >
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2">
                  {faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
            More Related Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((relTool) => (
              <Link
                key={relTool.id}
                href={relTool.href}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {relTool.name}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {relTool.shortDesc}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Open tool</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

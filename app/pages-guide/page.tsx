"use client";

import React from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-data";
import {
  Apple,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  Laptop,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

export default function PagesGuidePage() {
  const tool = TOOLS.find((t) => t.id === "pages-guide")!;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Intro banner */}
        <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Apple className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              The Truth About Apple Pages File Conversions
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Many online conversion sites claim to magically convert between .pages, .docx, and PDF, but often output broken formatting or require shady signups. Here is the official, 100% free, and accurate way to handle Pages files on any platform.
            </p>
          </div>
        </div>

        {/* Section 1: Pages to Word (.docx) & PDF */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                1. How to Convert Apple Pages (.pages) to Word (.docx) or PDF
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export your document with pristine font and layout fidelity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* On Mac */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
                <Apple className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>On Mac or iPad</span>
              </div>
              <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-decimal list-inside leading-relaxed">
                <li>Open your document in the <strong>Pages</strong> app.</li>
                <li>In the top menu bar, click <strong>File</strong> &gt; <strong>Export To</strong>.</li>
                <li>Select <strong>Word</strong> (to get a <code>.docx</code> file) or <strong>PDF</strong>.</li>
                <li>Choose image quality (High or Best) and click <strong>Next...</strong> &gt; <strong>Export</strong>.</li>
              </ol>
            </div>

            {/* On Windows / Web */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
                <Laptop className="w-4 h-4 text-indigo-500" />
                <span>On Windows, Chromebook & Linux</span>
              </div>
              <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-decimal list-inside leading-relaxed">
                <li>First, try our in-browser <Link href="/pages-to-pdf" className="text-indigo-600 dark:text-indigo-400 font-semibold underline">Pages to PDF Extractor</Link>.</li>
                <li>If the preview is omitted, navigate to <a href="https://www.icloud.com/pages" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-semibold underline">iCloud.com/pages</a> in any web browser (free Apple account).</li>
                <li>Drag and drop your <code>.pages</code> file onto iCloud Pages.</li>
                <li>Click the three dots (<strong>...</strong>) on the document card and select <strong>Download a Copy</strong> &gt; <strong>Word</strong> or <strong>PDF</strong>.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Section 2: Word to Apple Pages */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                2. Converting Word (.doc / .docx) to Apple Pages
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Great news: No conversion tool is needed!
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Apple Pages has <strong>built-in native support</strong> for Microsoft Word (.docx and .doc) files.
          </p>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
            Simply right-click your Word file on Mac and choose <strong>Open With &gt; Pages</strong>, or drag the Word file into Pages on Mac or iCloud.com. It will open and preserve formatting automatically.
          </div>
        </section>

        {/* Section 3: PDF to Apple Pages */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                3. Converting PDF to Apple Pages
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The recommended workflow to edit PDF contents inside Pages
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Because PDF is a fixed-layout format, the cleanest way to edit a PDF inside Apple Pages is:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Method A: Convert PDF to Word First
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Use our <Link href="/pdf-to-word" className="text-indigo-600 dark:text-indigo-400 font-semibold underline">PDF to Word Converter</Link> to reconstruct the editable text and layout into a <code>.docx</code>, then open that file directly in Pages.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Method B: Drag PDF Pages into Pages
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                If you just need to insert vector diagrams or slide graphics into an essay, simply drag the PDF file directly onto your Pages document canvas as an image element.
              </p>
            </div>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}

import React from "react";
import { ShieldCheck, Lock, Trash2, EyeOff, Cookie, Server, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy and Security Policy for StudentToolkit - 100% transparent, client-side first.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
          Privacy & Security First
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          StudentToolkit was built with a strict principle: your homework, research papers, resumes, and study materials belong to you alone.
        </p>
      </div>

      <div className="space-y-8">
        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              1. 100% In-Browser Tools
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Most tools on this site (PDF Merge, PDF Split, QR Generation, Organize PDF, Images to PDF, PDF to Text, Apple Pages Preview Extraction, Word Counter, GPA Calculator, and Citations) run <strong>purely in your local browser memory</strong> using WebAssembly and JavaScript. Files are never transferred across any network.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              2. Immediate Server Auto-Deletion
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              For complex document conversions (Word, Excel, PPT to PDF), files sent to our serverless conversion pipeline are processed in isolated temporary memory and <strong>deleted immediately after the conversion completes</strong>. An automated hourly cron job purges any residual staging artifacts.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              3. No Login, No Personal Data
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We do not ask for your name, student ID, university email, or password. There is no account registration database. Everyone has unrestricted, instant access.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Cookie className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              4. Cookie-Free & Non-Intrusive
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We do not use tracking cookies, retargeting pixels, or ad networks. UI preferences (such as light/dark mode) are stored entirely in your local browser storage (<code className="text-indigo-500">localStorage</code>).
            </p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Tool-by-Tool Processing Breakdown
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Tool Name</th>
                  <th className="pb-3">Execution Location</th>
                  <th className="pb-3">Data Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">QR Code Generator</td>
                  <td>100% Client Browser</td>
                  <td>0 seconds (Local RAM only)</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">PDF Merge / Split / Organize</td>
                  <td>100% Client Browser (pdf-lib)</td>
                  <td>0 seconds (Never leaves device)</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">Images to PDF / PDF to Images</td>
                  <td>100% Client Browser</td>
                  <td>0 seconds (Never leaves device)</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">Apple Pages Preview Extractor</td>
                  <td>100% Client Browser (JSZip)</td>
                  <td>0 seconds (Never leaves device)</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">Academic & GPA Calculators</td>
                  <td>100% Client Browser</td>
                  <td>0 seconds (Optional localStorage)</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">Word / PPT / Excel to PDF</td>
                  <td>Serverless Conversion Adapter</td>
                  <td>Deleted immediately (Max 1 hr cron purge)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
          >
            Explore Student Utilities &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

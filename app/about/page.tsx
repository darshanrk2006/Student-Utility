import React from "react";
import { GraduationCap, Heart, Sparkles, Shield, Code, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About StudentToolkit",
  description: "About StudentToolkit: Free, privacy-first utilities for college students worldwide.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
          About StudentToolkit
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          A modern web platform engineered to eliminate paywalls, sign-up friction, and privacy concerns from student digital workflows.
        </p>
      </div>

      {/* Story */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Why We Built This
        </h2>
        <p>
          Every student has experienced the frustration of trying to merge two PDF assignment files 10 minutes before a midnight LMS deadline, only to be blocked by a site demanding a credit card, a monthly subscription, or mandatory account registration.
        </p>
        <p>
          Even worse, uploading confidential research drafts, essays, or personal schedules to obscure conversion sites presents real privacy and academic integrity risks.
        </p>
        <p>
          <strong>StudentToolkit</strong> was created to solve this permanently. By leveraging modern client-side WebAssembly, JavaScript, and privacy-preserving serverless APIs, we provide high-speed, reliable utilities directly in your browser without collecting personal data.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            No Paywalls Ever
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Free forever for students, educators, researchers, and learners everywhere.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Zero Tracking
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            No invasive cookies, no advertising banners, and no accounts required.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Honest Transparency
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            We provide genuine guidance on native workflows rather than promising impossible conversions.
          </p>
        </div>
      </div>
    </div>
  );
}

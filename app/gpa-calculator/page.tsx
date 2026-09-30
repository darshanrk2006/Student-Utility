"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-data";
import {
  Calculator,
  Plus,
  Trash2,
  Award,
  Sparkles,
  RotateCcw,
  GraduationCap,
  TrendingUp,
  Target,
  Copy,
  Check,
  BookOpen,
  Calendar,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";

interface SemesterItem {
  id: string;
  name: string;
  sgpa: number | string;
  credits: number | string;
}

interface CourseItem {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

export default function GpaCalculatorPage() {
  const tool = TOOLS.find((t) => t.id === "gpa-calculator")!;

  // Tab mode: "semesters" (Overall CGPA from all semesters) | "courses" (Single semester course-by-course)
  const [calcMode, setCalcMode] = useState<"semesters" | "courses">("semesters");

  // =========================================================================
  // 1. SEMESTER-BY-SEMESTER STATE (OVERALL CGPA)
  // =========================================================================
  const [semesters, setSemesters] = useState<SemesterItem[]>([
    { id: "1", name: "Semester 1 (Fall)", sgpa: 3.85, credits: 18 },
    { id: "2", name: "Semester 2 (Spring)", sgpa: 3.7, credits: 18 },
    { id: "3", name: "Semester 3 (Fall)", sgpa: 3.9, credits: 16 },
    { id: "4", name: "Semester 4 (Spring)", sgpa: 3.65, credits: 18 },
  ]);

  // Target CGPA Forecaster state
  const [targetCgpa, setTargetCgpa] = useState<string>("3.80");
  const [remainingCredits, setRemainingCredits] = useState<string>("36");
  const [copiedReport, setCopiedReport] = useState(false);

  const handleAddSemester = () => {
    const nextNum = semesters.length + 1;
    setSemesters((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        name: `Semester ${nextNum}`,
        sgpa: 3.5,
        credits: 18,
      },
    ]);
  };

  const handlePopulate8Semesters = () => {
    const newSems: SemesterItem[] = [];
    for (let i = 1; i <= 8; i++) {
      const existing = semesters[i - 1];
      newSems.push({
        id: existing?.id || `${Date.now()}-${i}`,
        name: `Semester ${i}`,
        sgpa: existing?.sgpa || 3.75,
        credits: existing?.credits || 18,
      });
    }
    setSemesters(newSems);
  };

  const handleUpdateSemester = (id: string, key: keyof SemesterItem, val: any) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: val } : s))
    );
  };

  const handleRemoveSemester = (id: string) => {
    if (semesters.length <= 1) return;
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetSemesters = () => {
    setSemesters([
      { id: "1", name: "Semester 1", sgpa: 3.8, credits: 18 },
      { id: "2", name: "Semester 2", sgpa: 3.7, credits: 18 },
    ]);
  };

  // Overall CGPA stats calculated across all semesters
  const cgpaStats = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;

    for (const sem of semesters) {
      const cr = parseFloat(String(sem.credits)) || 0;
      const gpa = parseFloat(String(sem.sgpa)) || 0;
      totalCredits += cr;
      totalPoints += cr * gpa;
    }

    const overallCgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    // Academic standing honors
    let standing = "Good Academic Standing";
    let honors = "Passing";
    if (overallCgpa >= 3.9) {
      standing = "Summa Cum Laude 🌟";
      honors = "Highest Honors (Top Tier)";
    } else if (overallCgpa >= 3.7) {
      standing = "Magna Cum Laude 🎖️";
      honors = "High Honors (Dean's List)";
    } else if (overallCgpa >= 3.5) {
      standing = "Cum Laude 🎓";
      honors = "Honors Standing";
    } else if (overallCgpa >= 3.0) {
      standing = "Good Standing ✅";
      honors = "Satisfactory Progress";
    } else if (overallCgpa < 2.0) {
      standing = "Academic Probation ⚠️";
      honors = "Needs Immediate Improvement";
    }

    // Required future GPA to reach target CGPA
    const tGpa = parseFloat(targetCgpa) || 0;
    const rCredits = parseFloat(remainingCredits) || 0;
    let neededGpa: number | null = null;
    let isTargetAchievable = true;

    if (rCredits > 0 && tGpa > 0) {
      const targetTotalPoints = tGpa * (totalCredits + rCredits);
      const pointsNeeded = targetTotalPoints - totalPoints;
      neededGpa = pointsNeeded / rCredits;
      if (neededGpa > 4.0 || neededGpa < 0) {
        isTargetAchievable = neededGpa <= 4.0;
      }
    }

    return {
      overallCgpa: overallCgpa.toFixed(2),
      totalCredits,
      totalPoints: totalPoints.toFixed(1),
      standing,
      honors,
      neededGpa: neededGpa !== null ? neededGpa.toFixed(2) : null,
      isTargetAchievable,
    };
  }, [semesters, targetCgpa, remainingCredits]);

  // =========================================================================
  // 2. COURSE-BY-COURSE STATE (SINGLE SEMESTER GPA)
  // =========================================================================
  const [courses, setCourses] = useState<CourseItem[]>([
    { id: "1", name: "Computer Science 101", grade: "A", credits: 4 },
    { id: "2", name: "Linear Algebra & Calculus", grade: "A-", credits: 4 },
    { id: "3", name: "University Physics I", grade: "B+", credits: 4 },
    { id: "4", name: "Academic Writing & Ethics", grade: "A", credits: 3 },
  ]);

  const [hasPriorGpa, setHasPriorGpa] = useState(false);
  const [priorGpa, setPriorGpa] = useState("3.65");
  const [priorCredits, setPriorCredits] = useState("45");

  const handleAddCourse = () => {
    setCourses((prev) => [
      ...prev,
      { id: `${Date.now()}`, name: `Course ${prev.length + 1}`, grade: "A", credits: 3 },
    ]);
  };

  const handleUpdateCourse = (id: string, key: keyof CourseItem, val: any) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: val } : c))
    );
  };

  const handleRemoveCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const courseStats = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;

    for (const c of courses) {
      const cr = Number(c.credits) || 0;
      const pt = GRADE_POINTS[c.grade] ?? 0;
      totalCredits += cr;
      totalPoints += cr * pt;
    }

    const semesterGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    let cumulativeGpa = semesterGpa;
    let cumulativeCredits = totalCredits;

    if (hasPriorGpa) {
      const pGpa = parseFloat(priorGpa) || 0;
      const pCr = parseFloat(priorCredits) || 0;
      const combinedCredits = pCr + totalCredits;
      if (combinedCredits > 0) {
        cumulativeGpa = (pGpa * pCr + totalPoints) / combinedCredits;
        cumulativeCredits = combinedCredits;
      }
    }

    let standing = "Good Standing";
    if (cumulativeGpa >= 3.9) standing = "Summa Cum Laude 🌟";
    else if (cumulativeGpa >= 3.7) standing = "Magna Cum Laude 🎖️";
    else if (cumulativeGpa >= 3.5) standing = "Dean's List / Cum Laude 🎓";

    return {
      semesterGpa: semesterGpa.toFixed(2),
      cumulativeGpa: cumulativeGpa.toFixed(2),
      totalCredits,
      cumulativeCredits,
      totalPoints: totalPoints.toFixed(1),
      standing,
    };
  }, [courses, hasPriorGpa, priorGpa, priorCredits]);

  // Copy Summary
  const handleCopyReport = () => {
    if (calcMode === "semesters") {
      const text = `StudentToolkit CGPA Report\n-------------------------\nOverall CGPA: ${cgpaStats.overallCgpa} / 4.0\nTotal Credits: ${cgpaStats.totalCredits}\nAcademic Standing: ${cgpaStats.standing}\nSemesters Calculated: ${semesters.length}\nGenerated on https://studenttoolkit.vercel.app/gpa-calculator`;
      navigator.clipboard.writeText(text);
    } else {
      const text = `StudentToolkit GPA Report\n-------------------------\nSemester GPA: ${courseStats.semesterGpa} / 4.0\nCredits: ${courseStats.totalCredits}\nStanding: ${courseStats.standing}\nGenerated on https://studenttoolkit.vercel.app/gpa-calculator`;
      navigator.clipboard.writeText(text);
    }
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.65 },
      colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"],
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Mode Switcher Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setCalcMode("semesters")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                calcMode === "semesters"
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Overall CGPA (Semester by Semester)
            </button>
            <button
              type="button"
              onClick={() => setCalcMode("courses")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                calcMode === "courses"
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Single Semester (Course by Course)
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERALL CGPA (SEMESTER BY SEMESTER MATRIX) */}
        {/* ========================================================================= */}
        {calcMode === "semesters" ? (
          <div className="space-y-8">
            {/* Top Score Cards Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20 text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-100 flex items-center justify-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    Overall Cumulative CGPA
                  </span>
                  <div className="text-5xl sm:text-6xl font-black mt-2 tracking-tight">
                    {cgpaStats.overallCgpa}
                  </div>
                </div>
                <p className="text-xs text-indigo-100 mt-2 font-medium">
                  Across {semesters.length} Semesters ({cgpaStats.totalCredits} Credits)
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Academic Standing & Honors
                  </span>
                  <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-3">
                    {cgpaStats.standing}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {cgpaStats.honors}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCelebrate}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Celebrate CGPA
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Quality Points
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mt-3">
                    {cgpaStats.totalPoints}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {cgpaStats.totalCredits} Earned Credit Hours
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="mt-3 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedReport ? "Report Copied!" : "Copy Summary"}
                </button>
              </div>
            </div>

            {/* Semester Input Matrix Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Enter Results for Every Semester
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Input your GPA / SGPA and credit hours for each semester to compute your overall weighted CGPA.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePopulate8Semesters}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    Preset 8 Semesters
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSemester}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Semester
                  </button>
                </div>
              </div>

              {/* Semester Rows List */}
              <div className="space-y-3">
                {semesters.map((sem, idx) => (
                  <div
                    key={sem.id}
                    className="grid grid-cols-12 gap-3 items-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                  >
                    {/* Semester Title / Name */}
                    <div className="col-span-12 sm:col-span-5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 sm:hidden">
                        Semester Label
                      </label>
                      <input
                        type="text"
                        value={sem.name}
                        onChange={(e) => handleUpdateSemester(sem.id, "name", e.target.value)}
                        placeholder={`Semester ${idx + 1}`}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Semester SGPA / GPA */}
                    <div className="col-span-5 sm:col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 sm:hidden">
                        Semester GPA (SGPA)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4.0"
                          value={sem.sgpa}
                          onChange={(e) => handleUpdateSemester(sem.id, "sgpa", e.target.value)}
                          placeholder="3.80"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-black text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center"
                        />
                        <span className="hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                          GPA
                        </span>
                      </div>
                    </div>

                    {/* Semester Credits */}
                    <div className="col-span-5 sm:col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 sm:hidden">
                        Credits
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="1"
                          min="1"
                          max="40"
                          value={sem.credits}
                          onChange={(e) => handleUpdateSemester(sem.id, "credits", e.target.value)}
                          placeholder="18"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center"
                        />
                        <span className="hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                          Credits
                        </span>
                      </div>
                    </div>

                    {/* Delete Action */}
                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveSemester(sem.id)}
                        disabled={semesters.length <= 1}
                        title="Remove Semester"
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-20 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddSemester}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-500" />
                  Add Another Semester
                </button>

                <button
                  type="button"
                  onClick={handleResetSemesters}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Semesters
                </button>
              </div>
            </div>

            {/* Target CGPA Forecaster / Goal Planner */}
            <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 dark:from-indigo-950/30 dark:via-slate-900 dark:to-blue-950/30 rounded-3xl border border-indigo-200/80 dark:border-indigo-900 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Graduation Goal Forecaster
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calculate what GPA you need in your upcoming semesters to achieve your target graduation CGPA.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Graduation CGPA (e.g. 3.80)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={targetCgpa}
                    onChange={(e) => setTargetCgpa(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Credits Remaining in Future Semesters
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="120"
                    value={remainingCredits}
                    onChange={(e) => setRemainingCredits(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {cgpaStats.neededGpa && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 flex items-start gap-3 mt-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    To graduate with a <strong className="text-indigo-600 dark:text-indigo-400">{targetCgpa} CGPA</strong>, you need an average GPA of{" "}
                    <strong className="text-base font-black text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80">
                      {cgpaStats.neededGpa}
                    </strong>{" "}
                    across your remaining {remainingCredits} credit hours.
                    {!cgpaStats.isTargetAchievable && (
                      <span className="block text-rose-500 font-semibold mt-1">
                        ⚠️ Note: Required GPA exceeds the standard 4.0 scale. Consider adjusting your target CGPA.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* TAB 2: COURSE-BY-COURSE (SINGLE SEMESTER GPA) */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* Single Semester Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-tr from-indigo-600 to-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20 text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                    Semester GPA
                  </span>
                  <div className="text-5xl font-black mt-2">
                    {courseStats.semesterGpa}
                  </div>
                </div>
                <p className="text-xs text-indigo-200 mt-2">
                  Based on {courseStats.totalCredits} credit hours
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cumulative CGPA
                  </span>
                  <div className="text-5xl font-black text-slate-900 dark:text-slate-100 mt-2">
                    {courseStats.cumulativeGpa}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {courseStats.cumulativeCredits} total cumulative credits
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Academic Standing
                  </span>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-3">
                    {courseStats.standing}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCelebrate}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Celebrate Score
                </button>
              </div>
            </div>

            {/* Course Grade Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Current Semester Subjects & Grades
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select letter grade and credit weighting for each course.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Course
                </button>
              </div>

              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="grid grid-cols-12 gap-3 items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="col-span-12 sm:col-span-6">
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => handleUpdateCourse(course.id, "name", e.target.value)}
                        placeholder="Course name (e.g. Biology 101)"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="col-span-5 sm:col-span-3">
                      <select
                        value={course.grade}
                        onChange={(e) => handleUpdateCourse(course.id, "grade", e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                      >
                        {Object.keys(GRADE_POINTS).map((g) => (
                          <option key={g} value={g}>
                            {g} ({GRADE_POINTS[g].toFixed(1)} pts)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-5 sm:col-span-2">
                      <select
                        value={course.credits}
                        onChange={(e) =>
                          handleUpdateCourse(course.id, "credits", parseInt(e.target.value, 10))
                        }
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6].map((cr) => (
                          <option key={cr} value={cr}>
                            {cr} {cr === 1 ? "Credit" : "Credits"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(course.id)}
                        disabled={courses.length <= 1}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-20 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prior Cumulative GPA Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasPrior"
                  checked={hasPriorGpa}
                  onChange={(e) => setHasPriorGpa(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="hasPrior" className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Include Prior Cumulative GPA / Completed Semesters
                </label>
              </div>

              {hasPriorGpa && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Prior Cumulative GPA (4.0 scale)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={priorGpa}
                      onChange={(e) => setPriorGpa(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Prior Completed Credits
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={priorCredits}
                      onChange={(e) => setPriorCredits(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

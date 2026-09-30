"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-data";
import { Calculator, Plus, Trash2, Award, Sparkles, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

interface Course {
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

  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "Computer Science 101", grade: "A", credits: 4 },
    { id: "2", name: "Linear Algebra & Calculus", grade: "A-", credits: 4 },
    { id: "3", name: "University Physics I", grade: "B+", credits: 4 },
    { id: "4", name: "Academic Writing & Ethics", grade: "A", credits: 3 },
  ]);

  // Prior cumulative values
  const [hasPriorGpa, setHasPriorGpa] = useState(false);
  const [priorGpa, setPriorGpa] = useState("3.65");
  const [priorCredits, setPriorCredits] = useState("45");

  const handleAddCourse = () => {
    setCourses((prev) => [
      ...prev,
      { id: `${Date.now()}`, name: `Course ${prev.length + 1}`, grade: "A", credits: 3 },
    ]);
  };

  const handleUpdateCourse = (id: string, key: keyof Course, val: any) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: val } : c))
    );
  };

  const handleRemoveCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // Calculations
  const stats = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;

    for (const c of courses) {
      const cr = Number(c.credits) || 0;
      const pt = GRADE_POINTS[c.grade] ?? 0;
      totalCredits += cr;
      totalPoints += cr * pt;
    }

    const semesterGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    // Cumulative calculations
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

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899"],
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Results Banner Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-tr from-indigo-600 to-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20 text-center flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                Semester GPA
              </span>
              <div className="text-4xl sm:text-5xl font-black mt-1">
                {stats.semesterGpa}
              </div>
            </div>
            <p className="text-xs text-indigo-200 mt-2">
              Based on {stats.totalCredits} credit hours
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cumulative CGPA
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {stats.cumulativeGpa}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {stats.cumulativeCredits} total cumulative credits
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Academic Standing
              </span>
              <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {stats.standing}
              </div>
            </div>
            <button
              onClick={handleCelebrate}
              className="mt-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Celebrate Score
            </button>
          </div>
        </div>

        {/* Course Grade Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Current Semester Courses
            </h3>
            <button
              onClick={handleAddCourse}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all hover:scale-102"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Course
            </button>
          </div>

          <div className="space-y-3">
            {courses.map((course, idx) => (
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
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
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
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
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
                    onClick={() => handleRemoveCourse(course.id)}
                    disabled={courses.length <= 1}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-20"
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
    </ToolLayout>
  );
}

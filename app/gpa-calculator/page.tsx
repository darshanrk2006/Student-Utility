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
  ChevronRight,
  School,
  FileSpreadsheet,
  Zap,
  Info,
  Sliders,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface CourseItem {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

export interface SemesterData {
  id: string;
  name: string;
  courses: CourseItem[];
}

export type ScaleType = "10-point" | "4-point";

// Standard 10-Point Scale (O, A+, A, B+, B, C, U)
export const GRADE_POINTS_10: Record<
  string,
  { gp: number; label: string; range: string; desc: string }
> = {
  O: { gp: 10.0, label: "O (10.0 pts - Outstanding)", range: "9.1 – 10.0 (91–100%)", desc: "Outstanding" },
  "A+": { gp: 9.0, label: "A+ (9.0 pts - Excellent)", range: "8.1 – 9.0 (81–90%)", desc: "Excellent" },
  A: { gp: 8.0, label: "A (8.0 pts - Very Good)", range: "7.1 – 8.0 (71–80%)", desc: "Very Good" },
  "B+": { gp: 7.0, label: "B+ (7.0 pts - Good)", range: "6.1 – 7.0 (61–70%)", desc: "Good" },
  B: { gp: 6.0, label: "B (6.0 pts - Above Average)", range: "5.1 – 6.0 (51–60%)", desc: "Above Average" },
  C: { gp: 5.0, label: "C (5.0 pts - Pass)", range: "5.0 – 5.4 (50–54%)", desc: "Pass" },
  U: { gp: 0.0, label: "U (0.0 pts - Re-appearance)", range: "< 5.0 (< 50%)", desc: "Re-appearance / Arrear" },
};

// Standard 4.0 Scale (US / International Standard)
export const GRADE_POINTS_4: Record<
  string,
  { gp: number; label: string; range: string; desc: string }
> = {
  O: { gp: 4.0, label: "O (4.0 pts - Outstanding)", range: "3.9 – 4.0", desc: "Outstanding" },
  "A+": { gp: 4.0, label: "A+ (4.0 pts)", range: "3.8 – 4.0", desc: "Excellent" },
  A: { gp: 4.0, label: "A (4.0 pts)", range: "3.5 – 3.7", desc: "Very Good" },
  "A-": { gp: 3.7, label: "A- (3.7 pts)", range: "3.3 – 3.4", desc: "Good" },
  "B+": { gp: 3.3, label: "B+ (3.3 pts)", range: "3.0 – 3.2", desc: "Above Average" },
  B: { gp: 3.0, label: "B (3.0 pts)", range: "2.7 – 2.9", desc: "Average" },
  "B-": { gp: 2.7, label: "B- (2.7 pts)", range: "2.3 – 2.6", desc: "Below Average" },
  "C+": { gp: 2.3, label: "C+ (2.3 pts)", range: "2.0 – 2.2", desc: "Pass" },
  C: { gp: 2.0, label: "C (2.0 pts)", range: "1.7 – 1.9", desc: "Pass" },
  U: { gp: 0.0, label: "U (0.0 pts - Fail)", range: "< 1.0", desc: "Fail / Re-appear" },
};

export default function GpaCalculatorPage() {
  const tool = TOOLS.find((t) => t.id === "gpa-calculator")!;

  // Default to 10-Point Scale (O, A+, A, B+, B, C, U)
  const [scale, setScale] = useState<ScaleType>("10-point");

  // Multi-semester state: starting with Semester 1 alone
  const [semesters, setSemesters] = useState<SemesterData[]>([
    {
      id: "sem-1",
      name: "Semester 1",
      courses: [
        { id: "c1-1", name: "Programming in C / Python", grade: "O", credits: 4 },
        { id: "c1-2", name: "Matrices & Calculus", grade: "A+", credits: 4 },
        { id: "c1-3", name: "Engineering Physics", grade: "A", credits: 3 },
        { id: "c1-4", name: "Professional English", grade: "A+", credits: 3 },
        { id: "c1-5", name: "Physics & Chemistry Lab", grade: "O", credits: 2 },
      ],
    },
  ]);

  // Active semester selected in tab bar
  const [activeSemId, setActiveSemId] = useState<string>("sem-1");

  // Target CGPA Forecaster state
  const [targetCgpa, setTargetCgpa] = useState<string>("9.00");
  const [remainingCredits, setRemainingCredits] = useState<string>("40");
  const [copiedReport, setCopiedReport] = useState(false);

  // Active grade points map
  const gradePointsMap = useMemo(() => {
    return scale === "10-point" ? GRADE_POINTS_10 : GRADE_POINTS_4;
  }, [scale]);

  // Helper to safely get GP
  const getGP = (grade: string) => {
    if (gradePointsMap[grade]) {
      return gradePointsMap[grade].gp;
    }
    return scale === "10-point" ? 8.0 : 3.0;
  };

  // Helper to get letter grade from numeric GPA/CGPA
  const getGradeFromScore = (score: number, scaleMode: ScaleType) => {
    if (scaleMode === "10-point") {
      if (score >= 9.0) return { grade: "O", label: "Grade O (Outstanding)", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" };
      if (score >= 8.0) return { grade: "A+", label: "Grade A+ (Excellent)", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800" };
      if (score >= 7.0) return { grade: "A", label: "Grade A (Very Good)", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800" };
      if (score >= 6.0) return { grade: "B+", label: "Grade B+ (Good)", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800" };
      if (score >= 5.5) return { grade: "B", label: "Grade B (Above Average)", color: "text-teal-600 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800" };
      if (score >= 5.0) return { grade: "C", label: "Grade C (Pass)", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" };
      return { grade: "U", label: "Grade U (Re-appearance)", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800" };
    } else {
      if (score >= 3.8) return { grade: "O / A+", label: "Grade O (Outstanding)", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" };
      if (score >= 3.5) return { grade: "A", label: "Grade A (Very Good)", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800" };
      if (score >= 3.0) return { grade: "B+", label: "Grade B+ (Good)", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800" };
      if (score >= 2.5) return { grade: "B", label: "Grade B (Average)", color: "text-teal-600 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800" };
      if (score >= 2.0) return { grade: "C", label: "Grade C (Pass)", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" };
      return { grade: "U", label: "Grade U (Fail)", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800" };
    }
  };

  // Active semester object
  const activeSemester = useMemo(() => {
    return semesters.find((s) => s.id === activeSemId) || semesters[0];
  }, [semesters, activeSemId]);

  // Semester level calculation helper following the official formula:
  // GPA = ∑ (Ci * GPi) / ∑ Ci
  const calculateSemesterStats = (courses: CourseItem[]) => {
    let creditsSum = 0; // ∑ Ci
    let pointsSum = 0;  // ∑ (Ci * GPi)

    for (const c of courses) {
      const cr = Number(c.credits) || 0;
      const gp = getGP(c.grade);
      creditsSum += cr;
      pointsSum += cr * gp;
    }

    const gpa = creditsSum > 0 ? pointsSum / creditsSum : 0;
    const gradeInfo = getGradeFromScore(gpa, scale);

    return {
      credits: creditsSum,
      points: pointsSum,
      gpa: gpa.toFixed(2),
      gpaNum: gpa,
      gradeInfo,
    };
  };

  // Comprehensive calculations across ALL semesters following the official formula:
  // CGPA = ∑ (Ci * GPi) / ∑ Ci across all semesters
  const overallStats = useMemo(() => {
    let totalCredits = 0; // ∑ Ci (all semesters)
    let totalPoints = 0;  // ∑ (Ci * GPi) (all semesters)

    const semBreakdowns = semesters.map((sem, idx) => {
      const stats = calculateSemesterStats(sem.courses);
      totalCredits += stats.credits;
      totalPoints += stats.points;
      return {
        id: sem.id,
        index: idx + 1,
        name: sem.name,
        gpa: stats.gpa,
        gpaNum: stats.gpaNum,
        credits: stats.credits,
        points: stats.points,
        courseCount: sem.courses.length,
        gradeInfo: stats.gradeInfo,
      };
    });

    const overallCgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const overallGrade = getGradeFromScore(overallCgpa, scale);

    // Classification & Honors
    let standing = "First Class";
    let honors = "Good Academic Progress";
    let percentage = "0.0%";

    if (scale === "10-point") {
      percentage = (overallCgpa * 10).toFixed(1) + "%";
      if (overallCgpa >= 8.5) {
        standing = "First Class with Distinction 🌟";
        honors = "Exemplary Academic Standing";
      } else if (overallCgpa >= 6.5) {
        standing = "First Class 🎖️";
        honors = "Strong Academic Performance";
      } else if (overallCgpa >= 5.0) {
        standing = "Second Class 🎓";
        honors = "Satisfactory Progress";
      } else if (totalCredits > 0) {
        standing = "Re-appearance Required ⚠️";
        honors = "Below 5.0 Minimum Passing Standard";
      }
    } else {
      percentage = (overallCgpa * 25).toFixed(1) + "%";
      if (overallCgpa >= 3.9) {
        standing = "Summa Cum Laude 🌟";
        honors = "Highest Honors (Top 1%)";
      } else if (overallCgpa >= 3.7) {
        standing = "Magna Cum Laude 🎖️";
        honors = "High Honors (Dean's List)";
      } else if (overallCgpa >= 3.5) {
        standing = "Cum Laude 🎓";
        honors = "Honors Distinction";
      } else if (overallCgpa >= 3.0) {
        standing = "Good Standing ✅";
        honors = "Satisfactory Progress";
      } else if (totalCredits > 0) {
        standing = "Academic Probation ⚠️";
        honors = "Below 2.0 Standard";
      }
    }

    // Target CGPA calculation
    const maxScale = scale === "10-point" ? 10.0 : 4.0;
    const tGpa = parseFloat(targetCgpa) || 0;
    const rCredits = parseFloat(remainingCredits) || 0;
    let neededGpa: number | null = null;
    let isTargetAchievable = true;

    if (rCredits > 0 && tGpa > 0) {
      const targetTotalPoints = tGpa * (totalCredits + rCredits);
      const pointsNeeded = targetTotalPoints - totalPoints;
      neededGpa = pointsNeeded / rCredits;
      if (neededGpa > maxScale || neededGpa < 0) {
        isTargetAchievable = neededGpa <= maxScale && neededGpa >= 0;
      }
    }

    const activeSemStats = calculateSemesterStats(activeSemester?.courses || []);

    return {
      overallCgpa: overallCgpa.toFixed(2),
      overallCgpaNum: overallCgpa,
      overallGrade,
      percentage,
      activeGpa: activeSemStats.gpa,
      activeGrade: activeSemStats.gradeInfo,
      activeCredits: activeSemStats.credits,
      activePoints: activeSemStats.points.toFixed(1),
      totalCredits,
      totalPoints: totalPoints.toFixed(1),
      standing,
      honors,
      neededGpa: neededGpa !== null ? neededGpa.toFixed(2) : null,
      isTargetAchievable,
      semBreakdowns,
      maxScale,
    };
  }, [semesters, activeSemester, targetCgpa, remainingCredits, scale, gradePointsMap]);

  // Handle Scale Switch
  const handleScaleToggle = (newScale: ScaleType) => {
    setScale(newScale);
    setTargetCgpa(newScale === "10-point" ? "9.00" : "3.85");
    setSemesters((prev) =>
      prev.map((s) => ({
        ...s,
        courses: s.courses.map((c) => {
          if (newScale === "10-point") {
            const validKeys = Object.keys(GRADE_POINTS_10);
            return { ...c, grade: validKeys.includes(c.grade) ? c.grade : "O" };
          } else {
            const validKeys = Object.keys(GRADE_POINTS_4);
            return { ...c, grade: validKeys.includes(c.grade) ? c.grade : "A" };
          }
        }),
      }))
    );
  };

  // Semester Management
  const handleAddSemester = () => {
    const nextNum = semesters.length + 1;
    const defaultGrade = scale === "10-point" ? "O" : "A";
    const newId = `sem-${Date.now()}`;
    const newSem: SemesterData = {
      id: newId,
      name: `Semester ${nextNum}`,
      courses: [
        { id: `c-${Date.now()}-1`, name: `Subject 1`, grade: defaultGrade, credits: 4 },
        { id: `c-${Date.now()}-2`, name: `Subject 2`, grade: "A+", credits: 4 },
        { id: `c-${Date.now()}-3`, name: `Subject 3`, grade: "A", credits: 3 },
        { id: `c-${Date.now()}-4`, name: `Subject 4`, grade: "B+", credits: 3 },
      ],
    };
    setSemesters((prev) => [...prev, newSem]);
    setActiveSemId(newId);
  };

  const handlePopulatePreset = (count: number) => {
    const newSems: SemesterData[] = [];
    for (let i = 1; i <= count; i++) {
      const existing = semesters[i - 1];
      if (existing) {
        newSems.push(existing);
      } else {
        newSems.push({
          id: `sem-${i}`,
          name: `Semester ${i}`,
          courses: [
            { id: `c${i}-1`, name: `Subject 1`, grade: "O", credits: 4 },
            { id: `c${i}-2`, name: `Subject 2`, grade: "A+", credits: 4 },
            { id: `c${i}-3`, name: `Subject 3`, grade: "A", credits: 3 },
            { id: `c${i}-4`, name: `Subject 4`, grade: "B+", credits: 3 },
          ],
        });
      }
    }
    setSemesters(newSems);
    setActiveSemId(newSems[0].id);
  };

  const handleRemoveSemester = (semId: string) => {
    if (semesters.length <= 1) return;
    const updated = semesters.filter((s) => s.id !== semId);
    setSemesters(updated);
    if (activeSemId === semId) {
      setActiveSemId(updated[0].id);
    }
  };

  const handleUpdateSemesterName = (semId: string, newName: string) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === semId ? { ...s, name: newName } : s))
    );
  };

  // Course Management inside Active Semester
  const handleAddCourseToActive = () => {
    const courseNum = (activeSemester?.courses.length || 0) + 1;
    const defaultGrade = scale === "10-point" ? "O" : "A";
    setSemesters((prev) =>
      prev.map((s) => {
        if (s.id === activeSemId) {
          return {
            ...s,
            courses: [
              ...s.courses,
              {
                id: `${Date.now()}`,
                name: `Subject ${courseNum}`,
                grade: defaultGrade,
                credits: 3,
              },
            ],
          };
        }
        return s;
      })
    );
  };

  const handleUpdateCourseInActive = (courseId: string, key: keyof CourseItem, val: any) => {
    setSemesters((prev) =>
      prev.map((s) => {
        if (s.id === activeSemId) {
          return {
            ...s,
            courses: s.courses.map((c) => (c.id === courseId ? { ...c, [key]: val } : c)),
          };
        }
        return s;
      })
    );
  };

  const handleRemoveCourseFromActive = (courseId: string) => {
    if ((activeSemester?.courses.length || 0) <= 1) return;
    setSemesters((prev) =>
      prev.map((s) => {
        if (s.id === activeSemId) {
          return {
            ...s,
            courses: s.courses.filter((c) => c.id !== courseId),
          };
        }
        return s;
      })
    );
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"],
    });
  };

  const handleCopySummary = () => {
    let report = `🎓 StudentToolkit Official Academic Transcript & CGPA Report\n`;
    report += `==========================================================\n`;
    report += `Grading Scale: ${scale === "10-point" ? "10.0 Scale (O, A+, A, B+, B, C, U)" : "4.0 Scale (US / Standard)"}\n`;
    report += `Overall Cumulative CGPA: ${overallStats.overallCgpa} / ${overallStats.maxScale}.00 (${overallStats.overallGrade.label})\n`;
    report += `Equivalent Percentage: ${overallStats.percentage}\n`;
    report += `Formula Used: CGPA = ∑(Ci * GPi) / ∑Ci = ${overallStats.totalPoints} / ${overallStats.totalCredits}\n`;
    report += `Total Completed Credits (∑Ci): ${overallStats.totalCredits}\n`;
    report += `Total Quality Points ∑(Ci*GPi): ${overallStats.totalPoints}\n`;
    report += `Academic Classification: ${overallStats.standing} (${overallStats.honors})\n\n`;
    report += `Semester-by-Semester Breakdown:\n`;
    overallStats.semBreakdowns.forEach((s) => {
      report += `• ${s.name}: GPA ${s.gpa} (${s.gradeInfo.grade}) | Credits: ${s.credits} | Quality Points: ${s.points.toFixed(1)} | Courses: ${s.courseCount}\n`;
    });
    report += `\nCalculated on StudentToolkit (https://studenttoolkit.vercel.app/gpa-calculator)`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* ========================================================================= */}
        {/* 1. GRADING SCALE SELECTOR TOGGLE */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                Grading System Scale
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Standard 10-Point Scale: <strong>O, A+, A, B+, B, C, U</strong> (Anna Univ / AICTE / VTU)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleScaleToggle("10-point")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                scale === "10-point"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-102"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              10.0 Scale (O, A+, A, B+, B, C, U)
            </button>
            <button
              type="button"
              onClick={() => handleScaleToggle("4-point")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                scale === "4-point"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-102"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              4.0 Scale (US / Standard)
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. OFFICIAL FORMULAE FOR GPA & CGPA BANNER (Matching university syllabus) */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-indigo-950/20 border border-indigo-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3 mb-5">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
              <School className="w-4 h-4 text-indigo-400" />
              FORMULAE FOR GPA & CGPA
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
              {scale === "10-point" ? "10-Point Scale (O – U)" : "4.0 Scale"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* GPA Formula */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <span className="text-xs font-black text-indigo-300 uppercase tracking-wider block mb-2">
                GPA (Semester)
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-white flex items-center justify-center gap-2">
                <span>GPA = </span>
                <span className="inline-flex flex-col items-center justify-center text-sm sm:text-base">
                  <span className="border-b border-white/80 pb-0.5 px-2">
                    ∑<sub>i=1</sub><sup>n</sup> C<sub>i</sub> GP<sub>i</sub>
                  </span>
                  <span className="pt-0.5 px-2">
                    ∑<sub>i=1</sub><sup>n</sup> C<sub>i</sub>
                  </span>
                </span>
              </div>
              <div className="mt-2 text-[11px] text-indigo-200/80 font-mono">
                {activeSemester?.name}: {overallStats.activePoints} / {overallStats.activeCredits} ={" "}
                <strong className="text-emerald-400 font-bold">{overallStats.activeGpa}</strong> ({overallStats.activeGrade.grade})
              </div>
            </div>

            {/* CGPA Formula */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <span className="text-xs font-black text-cyan-300 uppercase tracking-wider block mb-2">
                CGPA (Cumulative)
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-white flex items-center justify-center gap-2">
                <span>CGPA = </span>
                <span className="inline-flex flex-col items-center justify-center text-sm sm:text-base">
                  <span className="border-b border-white/80 pb-0.5 px-2">
                    ∑<sub>i=1</sub><sup>n</sup> C<sub>i</sub> GP<sub>i</sub>
                  </span>
                  <span className="pt-0.5 px-2">
                    ∑<sub>i=1</sub><sup>n</sup> C<sub>i</sub>
                  </span>
                </span>
              </div>
              <div className="mt-2 text-[11px] text-cyan-200/80 font-mono">
                All {semesters.length} Sems: {overallStats.totalPoints} / {overallStats.totalCredits} ={" "}
                <strong className="text-cyan-300 font-bold">{overallStats.overallCgpa}</strong> ({overallStats.overallGrade.grade})
              </div>
            </div>
          </div>

          {/* Formula Legend */}
          <div className="mt-5 pt-4 border-t border-indigo-900/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-indigo-200/90 leading-snug">
            <div>
              <strong className="text-white">C<sub>i</sub></strong> — credits assigned to the course
            </div>
            <div>
              <strong className="text-white">GP<sub>i</sub></strong> — grade point corresponding to the letter grade obtained
            </div>
            <div>
              <strong className="text-white">n</strong> — number of all Courses successfully cleared during the semester (GPA) or all semesters (CGPA)
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TOP LIVE CGPA SCOREBOARD BANNER */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Overall CGPA Card */}
          <div className="bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20 text-center flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-100 flex items-center justify-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                Overall Cumulative CGPA
              </span>
              <div className="text-5xl sm:text-6xl font-black mt-2 tracking-tight drop-shadow-sm">
                {overallStats.overallCgpa}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black">
                <span>Awarded:</span>
                <span className="underline decoration-white/50">{overallStats.overallGrade.label}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-indigo-100 font-semibold px-2">
              <span>{semesters.length} Semesters Total</span>
              <span>{overallStats.totalCredits} Total Credits (∑C<sub>i</sub>)</span>
            </div>
          </div>

          {/* Active Semester GPA Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                {activeSemester?.name || "Selected Semester"} GPA
              </span>
              <div className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                {overallStats.activeGpa}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                {overallStats.activeGrade.label}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {overallStats.activeCredits} Credits in {activeSemester?.name} (∑C<sub>i</sub> = {overallStats.activeCredits})
            </p>
          </div>

          {/* Academic Standing & Classification Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Degree Classification / Standing
              </span>
              <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {overallStats.standing}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {overallStats.honors} · Equivalent: {overallStats.percentage}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCelebrate}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Celebrate Score
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. SEMESTER TABS: Sem 1, Sem 2, Sem 3, Sem 4, etc. (ABOVE COURSES TABLE) */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Semesters (Sem 1, Sem 2, Sem 3, Sem 4...)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any semester to edit courses. Overall CGPA automatically aggregates data across all semesters.
              </p>
            </div>

            {/* Quick Presets & Export Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Presets:</span>
              <button
                type="button"
                onClick={() => handlePopulatePreset(4)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer transition-colors"
                title="Populate 4 Semesters (2 Years / Diploma / Masters)"
              >
                4 Sems
              </button>
              <button
                type="button"
                onClick={() => handlePopulatePreset(6)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer transition-colors"
                title="Populate 6 Semesters (3-Year Degree: B.Sc / BCA / B.Com)"
              >
                6 Sems
              </button>
              <button
                type="button"
                onClick={() => handlePopulatePreset(8)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 cursor-pointer transition-colors"
                title="Populate 8 Semesters (4-Year Engineering: B.E / B.Tech)"
              >
                8 Sems (4 Years)
              </button>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                {copiedReport ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedReport ? "Copied!" : "Copy Report"}
              </button>
            </div>
          </div>

          {/* Prominent Semester Pills Bar (Sem 1, Sem 2, Sem 3, Sem 4, etc.) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {semesters.map((sem, idx) => {
              const semStats = calculateSemesterStats(sem.courses);
              const isActive = sem.id === activeSemId;

              return (
                <button
                  key={sem.id}
                  type="button"
                  onClick={() => setActiveSemId(sem.id)}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 whitespace-nowrap cursor-pointer flex-shrink-0 relative ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/40 scale-102"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                      isActive ? "bg-white/20 text-white" : "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="text-left">
                    <span className="block font-black text-xs leading-tight">
                      {sem.name || `Sem ${idx + 1}`}
                    </span>
                    <span
                      className={`text-[10px] block mt-0.5 ${
                        isActive ? "text-indigo-100 font-medium" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      GPA: <strong className={isActive ? "text-white" : "text-indigo-600 dark:text-indigo-400"}>{semStats.gpa}</strong> ({semStats.gradeInfo.grade}) · {semStats.credits} cr
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Add Semester Button */}
            <button
              type="button"
              onClick={handleAddSemester}
              className="px-4 py-3 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              Add Sem {semesters.length + 1}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. CURRENT SEMESTER COURSES & SUBJECTS TABLE */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header of Active Semester */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                    Current Semester Courses:
                  </h3>
                  <input
                    type="text"
                    value={activeSemester?.name || ""}
                    onChange={(e) => handleUpdateSemesterName(activeSemId, e.target.value)}
                    className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 bg-transparent border-b border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 focus:outline-none focus:border-indigo-500 pb-0.5"
                    title="Click to rename semester"
                  />
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    GPA: {overallStats.activeGpa} ({overallStats.activeGrade.grade})
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select letter grades (O, A+, A, B+, B, C, U) and credits (C<sub>i</sub>) for {activeSemester?.name}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddCourseToActive}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Course
              </button>

              {semesters.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSemester(activeSemId)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete this entire semester"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table Header Labels (Desktop) */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <div className="col-span-5">Course / Subject Name</div>
            <div className="col-span-3">Letter Grade (GP<sub>i</sub>)</div>
            <div className="col-span-2">Credits (C<sub>i</sub>)</div>
            <div className="col-span-1 text-center">C<sub>i</sub> × GP<sub>i</sub></div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {/* Courses List */}
          <div className="space-y-3">
            {activeSemester?.courses.map((course, idx) => {
              const gp = getGP(course.grade);
              const cr = Number(course.credits) || 0;
              const product = (cr * gp).toFixed(1);

              return (
                <div
                  key={course.id}
                  className="grid grid-cols-12 gap-3 items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                >
                  {/* Course Name */}
                  <div className="col-span-12 sm:col-span-5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 sm:hidden">
                      Course Name
                    </label>
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => handleUpdateCourseInActive(course.id, "name", e.target.value)}
                      placeholder={`Subject ${idx + 1}`}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Grade Selector (O, A+, A, B+, B, C, U) */}
                  <div className="col-span-5 sm:col-span-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 sm:hidden">
                      Letter Grade (GP<sub>i</sub>)
                    </label>
                    <select
                      value={course.grade}
                      onChange={(e) => handleUpdateCourseInActive(course.id, "grade", e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-black text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      {Object.entries(gradePointsMap).map(([g, val]) => (
                        <option key={g} value={g}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Credits Selector */}
                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 sm:hidden">
                      Credits (C<sub>i</sub>)
                    </label>
                    <select
                      value={course.credits}
                      onChange={(e) =>
                        handleUpdateCourseInActive(course.id, "credits", parseInt(e.target.value, 10))
                      }
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((cr) => (
                        <option key={cr} value={cr}>
                          {cr} {cr === 1 ? "Credit" : "Credits"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Calculated Points Product */}
                  <div className="col-span-2 sm:col-span-1 text-center font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    <span className="sm:hidden text-[10px] text-slate-400 block font-sans">Pts:</span>
                    {product}
                  </div>

                  {/* Delete Course Button */}
                  <div className="col-span-1 sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveCourseFromActive(course.id)}
                      disabled={activeSemester.courses.length <= 1}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-20 cursor-pointer"
                      title="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Course Bottom Action */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleAddCourseToActive}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer self-start"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-500" />
              Add Course to {activeSemester?.name}
            </button>

            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-3">
              <span>
                ∑C<sub>i</sub> = <strong>{overallStats.activeCredits} Credits</strong>
              </span>
              <span>·</span>
              <span>
                ∑(C<sub>i</sub>·GP<sub>i</sub>) = <strong>{overallStats.activePoints}</strong>
              </span>
              <span>·</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                GPA = {overallStats.activeGpa} ({overallStats.activeGrade.grade})
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. OFFICIAL GRADE SYSTEM REFERENCE MATRIX TABLE */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Official Grading Scale Reference (O, A+, A, B+, B, C, U)
            </h4>
            <span className="text-[11px] font-bold text-slate-400">10-Point Scale Matrix</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {Object.entries(GRADE_POINTS_10).map(([grd, info]) => {
              const isSelected = overallStats.overallGrade.grade === grd;
              return (
                <div
                  key={grd}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/20"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <span className="text-base font-black text-slate-900 dark:text-slate-100 block">
                    {grd}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                    {info.gp.toFixed(1)} GP
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                    {info.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. ALL SEMESTERS PERFORMANCE BREAKDOWN MATRIX */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              All Semesters CGPA Performance Breakdown
            </h4>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
              Cumulative CGPA: {overallStats.overallCgpa} / {overallStats.maxScale}.00 ({overallStats.totalCredits} Total Credits)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {overallStats.semBreakdowns.map((sem) => (
              <button
                key={sem.id}
                type="button"
                onClick={() => setActiveSemId(sem.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  sem.id === activeSemId
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                    {sem.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    Sem {sem.index}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {sem.gpa} <span className="text-[10px] font-normal text-slate-400">GPA</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                  <span>Grade: <strong className="text-indigo-600 dark:text-indigo-400">{sem.gradeInfo.grade}</strong></span>
                  <span>{sem.credits} cr</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 8. TARGET CGPA FORECASTER / GOAL PLANNER */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 dark:from-indigo-950/30 dark:via-slate-900 dark:to-blue-950/30 rounded-3xl border border-indigo-200/80 dark:border-indigo-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Graduation CGPA Target Forecaster
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculate what GPA you need in upcoming semesters to graduate with your desired CGPA.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Graduation CGPA ({overallStats.maxScale}.00 Scale)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={overallStats.maxScale}
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
                max="200"
                value={remainingCredits}
                onChange={(e) => setRemainingCredits(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {overallStats.neededGpa && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 flex items-start gap-3 mt-3">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                To graduate with <strong className="text-indigo-600 dark:text-indigo-400">{targetCgpa} CGPA</strong>, you must maintain an average GPA of{" "}
                <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80">
                  {overallStats.neededGpa}
                </strong>{" "}
                across your remaining {remainingCredits} credit hours.
                {!overallStats.isTargetAchievable && (
                  <span className="block text-rose-500 font-semibold mt-1">
                    ⚠️ Note: Required GPA exceeds {overallStats.maxScale}.00. You may need more credit hours or a revised target.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

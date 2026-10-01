"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-data";
import {
  Target,
  Calculator,
  Plus,
  Trash2,
  Sparkles,
  Award,
  BookOpen,
  Check,
  Copy,
  Layers,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Percent,
  Sliders,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Scale,
  School,
  Split,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface ComponentBreakdown {
  iat1Scored: number;
  iat1Max: number;
  iat1Weight: number; // Converted marks (e.g. 15)

  iat2Scored: number;
  iat2Max: number;
  iat2Weight: number; // Converted marks (e.g. 15)

  classworkScored: number;
  classworkMax: number;
  classworkWeight: number; // Converted marks (e.g. 10)
}

export interface SubjectItem {
  id: string;
  name: string;
  calcMode: "components" | "direct";
  // Direct mode
  internalScored: number;
  internalMax: number;
  // Components mode
  iat1Scored: number;
  iat1Max: number;
  iat2Scored: number;
  iat2Max: number;
  classworkScored: number;
  classworkMax: number;
  externalMax: number;
}

export interface WeightScheme {
  id: string;
  name: string;
  internalWeight: number; // e.g. 40
  externalWeight: number; // e.g. 60
  minExternalPassPercent: number; // e.g. 45% (45 out of 100 in external exam)
  minTotalPassPercent: number; // e.g. 50%
  defaultIat1Weight: number;
  defaultIat2Weight: number;
  defaultClassworkWeight: number;
}

const PRESET_SCHEMES: WeightScheme[] = [
  {
    id: "40-60",
    name: "40% Internals + 60% External (Anna Univ / Engineering)",
    internalWeight: 40,
    externalWeight: 60,
    minExternalPassPercent: 45,
    minTotalPassPercent: 50,
    defaultIat1Weight: 15,
    defaultIat2Weight: 15,
    defaultClassworkWeight: 10,
  },
  {
    id: "50-50",
    name: "50% Internals + 50% External (Autonomous / AICTE)",
    internalWeight: 50,
    externalWeight: 50,
    minExternalPassPercent: 45,
    minTotalPassPercent: 50,
    defaultIat1Weight: 20,
    defaultIat2Weight: 20,
    defaultClassworkWeight: 10,
  },
  {
    id: "20-80",
    name: "20% Internals + 80% External (State Universities)",
    internalWeight: 20,
    externalWeight: 80,
    minExternalPassPercent: 40,
    minTotalPassPercent: 40,
    defaultIat1Weight: 8,
    defaultIat2Weight: 8,
    defaultClassworkWeight: 4,
  },
  {
    id: "30-70",
    name: "30% Internals + 70% External (Central Universities)",
    internalWeight: 30,
    externalWeight: 70,
    minExternalPassPercent: 40,
    minTotalPassPercent: 40,
    defaultIat1Weight: 10,
    defaultIat2Weight: 10,
    defaultClassworkWeight: 10,
  },
];

const GRADE_TARGETS = [
  { grade: "O", targetPercent: 91, label: "Grade O (Outstanding)", minRange: "91% – 100%" },
  { grade: "A+", targetPercent: 81, label: "Grade A+ (Excellent)", minRange: "81% – 90%" },
  { grade: "A", targetPercent: 71, label: "Grade A (Very Good)", minRange: "71% – 80%" },
  { grade: "B+", targetPercent: 61, label: "Grade B+ (Good)", minRange: "61% – 70%" },
  { grade: "B", targetPercent: 50, label: "Grade B / Pass", minRange: "50% – 60%" },
];

export default function MarksCalculatorPage() {
  const tool = TOOLS.find((t) => t.id === "marks-calculator")!;

  // Active university scheme
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("40-60");
  const [customInternalWeight, setCustomInternalWeight] = useState<number>(40);
  const [customExternalWeight, setCustomExternalWeight] = useState<number>(60);
  const [customMinExternal, setCustomMinExternal] = useState<number>(45);

  // Calculation Mode: "components" (Internal 1 + Internal 2 + Classwork) vs "direct"
  const [calcMode, setCalcMode] = useState<"components" | "direct">("components");

  // Single Subject Fast Calculator Inputs
  const [subjectName, setSubjectName] = useState<string>("Data Structures & Algorithms");

  // Component breakdown inputs:
  // Internal 1 (IAT 1 / Mid-term 1)
  const [iat1Scored, setIat1Scored] = useState<number>(42);
  const [iat1Max, setIat1Max] = useState<number>(50);
  const [iat1Weight, setIat1Weight] = useState<number>(15);

  // Internal 2 (IAT 2 / Model Exam)
  const [iat2Scored, setIat2Scored] = useState<number>(45);
  const [iat2Max, setIat2Max] = useState<number>(50);
  const [iat2Weight, setIat2Weight] = useState<number>(15);

  // Classwork (Assignments, Quizzes, Attendance, Lab, Mini-project)
  const [classworkScored, setClassworkScored] = useState<number>(9);
  const [classworkMax, setClassworkMax] = useState<number>(10);
  const [classworkWeight, setClassworkWeight] = useState<number>(10);

  // Direct Internal Score (if student already knows final total)
  const [directInternalScored, setDirectInternalScored] = useState<number>(34);
  const [directInternalMax, setDirectInternalMax] = useState<number>(40);

  // Final Semester University Exam Max Marks
  const [externalMax, setExternalMax] = useState<number>(100);

  // Multi-Subject Mode
  const [multiSubjects, setMultiSubjects] = useState<SubjectItem[]>([
    {
      id: "s1",
      name: "Data Structures & Algorithms",
      calcMode: "components",
      internalScored: 34,
      internalMax: 40,
      iat1Scored: 42,
      iat1Max: 50,
      iat2Scored: 45,
      iat2Max: 50,
      classworkScored: 9,
      classworkMax: 10,
      externalMax: 100,
    },
    {
      id: "s2",
      name: "Operating Systems",
      calcMode: "components",
      internalScored: 36,
      internalMax: 40,
      iat1Scored: 46,
      iat1Max: 50,
      iat2Scored: 44,
      iat2Max: 50,
      classworkScored: 10,
      classworkMax: 10,
      externalMax: 100,
    },
    {
      id: "s3",
      name: "Computer Networks",
      calcMode: "components",
      internalScored: 30,
      internalMax: 40,
      iat1Scored: 35,
      iat1Max: 50,
      iat2Scored: 38,
      iat2Max: 50,
      classworkScored: 8,
      classworkMax: 10,
      externalMax: 100,
    },
    {
      id: "s4",
      name: "Discrete Mathematics",
      calcMode: "components",
      internalScored: 32,
      internalMax: 40,
      iat1Scored: 40,
      iat1Max: 50,
      iat2Scored: 41,
      iat2Max: 50,
      classworkScored: 9,
      classworkMax: 10,
      externalMax: 100,
    },
  ]);

  const [copiedPlan, setCopiedPlan] = useState(false);

  // Active Scheme Object
  const currentScheme = useMemo(() => {
    if (selectedSchemeId === "custom") {
      return {
        id: "custom",
        name: `Custom (${customInternalWeight}% Internals + ${customExternalWeight}% External)`,
        internalWeight: customInternalWeight,
        externalWeight: customExternalWeight,
        minExternalPassPercent: customMinExternal,
        minTotalPassPercent: 50,
        defaultIat1Weight: Math.round(customInternalWeight * 0.375),
        defaultIat2Weight: Math.round(customInternalWeight * 0.375),
        defaultClassworkWeight: Math.round(customInternalWeight * 0.25),
      };
    }
    const found = PRESET_SCHEMES.find((s) => s.id === selectedSchemeId) || PRESET_SCHEMES[0];
    return found;
  }, [selectedSchemeId, customInternalWeight, customExternalWeight, customMinExternal]);

  // Sync default weights when scheme changes
  const handleSchemeSelect = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    const found = PRESET_SCHEMES.find((s) => s.id === schemeId);
    if (found) {
      setIat1Weight(found.defaultIat1Weight);
      setIat2Weight(found.defaultIat2Weight);
      setClassworkWeight(found.defaultClassworkWeight);
      setDirectInternalMax(found.internalWeight);
    }
  };

  // Helper to compute effective Internal Total (out of currentScheme.internalWeight)
  const computeEffectiveInternal = (
    mode: "components" | "direct",
    i1Scored: number,
    i1Max: number,
    i1W: number,
    i2Scored: number,
    i2Max: number,
    i2W: number,
    cwScored: number,
    cwMax: number,
    cwW: number,
    dirScored: number,
    dirMax: number,
    scheme: WeightScheme
  ) => {
    if (mode === "direct") {
      const pct = dirMax > 0 ? (dirScored / dirMax) * 100 : 0;
      const weightedPoints = (pct / 100) * scheme.internalWeight;
      return {
        totalInternalScored: dirScored,
        totalInternalMax: dirMax,
        effectiveWeightedPoints: weightedPoints,
        percentage: pct,
        i1Converted: 0,
        i2Converted: 0,
        cwConverted: 0,
      };
    }

    // Component calculation:
    // IAT1 converted = (i1Scored / i1Max) * i1W
    const i1Converted = i1Max > 0 ? (i1Scored / i1Max) * i1W : 0;
    // IAT2 converted = (i2Scored / i2Max) * i2W
    const i2Converted = i2Max > 0 ? (i2Scored / i2Max) * i2W : 0;
    // Classwork converted = (cwMax > 0 ? (cwScored / cwMax) * cwW : 0
    const cwConverted = cwMax > 0 ? (cwScored / cwMax) * cwW : 0;

    const totalInternalScored = i1Converted + i2Converted + cwConverted;
    const totalInternalMax = i1W + i2W + cwW;
    const pct = totalInternalMax > 0 ? (totalInternalScored / totalInternalMax) * 100 : 0;
    const effectiveWeightedPoints = (pct / 100) * scheme.internalWeight;

    return {
      totalInternalScored,
      totalInternalMax,
      effectiveWeightedPoints,
      percentage: pct,
      i1Converted,
      i2Converted,
      cwConverted,
    };
  };

  // Calculate required marks for a given target percentage
  const calculateRequiredMarks = (
    effectiveInternalWeightedPts: number,
    maxExt: number,
    targetPct: number,
    scheme: WeightScheme
  ) => {
    if (maxExt <= 0) return { marksNeeded: 0, percentageNeeded: 0, status: "impossible" };

    // Remaining weighted points needed:
    const pointsNeeded = targetPct - effectiveInternalWeightedPts;

    if (pointsNeeded <= 0) {
      // Internal alone achieves target (still need minimum external pass cutoff)
      const minRequiredMarks = Math.ceil((scheme.minExternalPassPercent / 100) * maxExt);
      return {
        marksNeeded: minRequiredMarks,
        percentageNeeded: scheme.minExternalPassPercent,
        status: "secured" as const,
        note: `Internal already qualifies. Only need ${minRequiredMarks} (${scheme.minExternalPassPercent}%) min pass cutoff.`,
      };
    }

    // Required external percentage:
    // (externalPercentage / 100) * scheme.externalWeight = pointsNeeded
    const externalPercentageNeeded = (pointsNeeded / scheme.externalWeight) * 100;
    let rawMarksNeeded = (externalPercentageNeeded / 100) * maxExt;

    // Ensure minimum external pass cutoff is also satisfied
    const minExternalCutoffMarks = (scheme.minExternalPassPercent / 100) * maxExt;
    if (rawMarksNeeded < minExternalCutoffMarks) {
      rawMarksNeeded = minExternalCutoffMarks;
    }

    const roundedMarksNeeded = Math.ceil(rawMarksNeeded);
    const finalPercentageNeeded = (roundedMarksNeeded / maxExt) * 100;

    let status: "easy" | "achievable" | "challenging" | "impossible" | "secured" = "achievable";
    if (roundedMarksNeeded > maxExt) {
      status = "impossible";
    } else if (finalPercentageNeeded > 85) {
      status = "challenging";
    } else if (finalPercentageNeeded < 60) {
      status = "easy";
    }

    return {
      marksNeeded: roundedMarksNeeded,
      percentageNeeded: Math.round(finalPercentageNeeded),
      status,
      note: status === "impossible" ? "Mathematically impossible with current internals." : undefined,
    };
  };

  // Primary Single Subject Calculations
  const singleSubjectResults = useMemo(() => {
    const internalDetails = computeEffectiveInternal(
      calcMode,
      iat1Scored,
      iat1Max,
      iat1Weight,
      iat2Scored,
      iat2Max,
      iat2Weight,
      classworkScored,
      classworkMax,
      classworkWeight,
      directInternalScored,
      directInternalMax,
      currentScheme
    );

    const targets = GRADE_TARGETS.map((g) => {
      const calc = calculateRequiredMarks(
        internalDetails.effectiveWeightedPoints,
        externalMax,
        g.targetPercent,
        currentScheme
      );
      return {
        ...g,
        ...calc,
      };
    });

    return {
      internalDetails,
      targets,
    };
  }, [
    calcMode,
    iat1Scored,
    iat1Max,
    iat1Weight,
    iat2Scored,
    iat2Max,
    iat2Weight,
    classworkScored,
    classworkMax,
    classworkWeight,
    directInternalScored,
    directInternalMax,
    externalMax,
    currentScheme,
  ]);

  // Multi-Subject Management
  const handleAddMultiSubject = () => {
    const nextIdx = multiSubjects.length + 1;
    setMultiSubjects((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        name: `Subject ${nextIdx}`,
        calcMode: "components",
        internalScored: 34,
        internalMax: currentScheme.internalWeight,
        iat1Scored: 42,
        iat1Max: 50,
        iat2Scored: 44,
        iat2Max: 50,
        classworkScored: 9,
        classworkMax: 10,
        externalMax: 100,
      },
    ]);
  };

  const handleUpdateMultiSubject = (id: string, key: keyof SubjectItem, val: any) => {
    setMultiSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: val } : s))
    );
  };

  const handleRemoveMultiSubject = (id: string) => {
    if (multiSubjects.length <= 1) return;
    setMultiSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCopyTargetReport = () => {
    let report = `🎯 StudentToolkit Semester Exam Marks Target Report\n`;
    report += `=================================================\n`;
    report += `Weightage Scheme: ${currentScheme.name}\n`;
    report += `Evaluation Mode: ${calcMode === "components" ? "Internal 1 + Internal 2 + Classwork Breakdown" : "Direct Score"}\n\n`;
    report += `SUBJECT: ${subjectName}\n`;
    if (calcMode === "components") {
      report += `• Internal 1 (CIA 1): ${iat1Scored} / ${iat1Max} -> ${singleSubjectResults.internalDetails.i1Converted.toFixed(1)} / ${iat1Weight} pts\n`;
      report += `• Internal 2 (CIA 2 / Model): ${iat2Scored} / ${iat2Max} -> ${singleSubjectResults.internalDetails.i2Converted.toFixed(1)} / ${iat2Weight} pts\n`;
      report += `• Classwork / Assignments: ${classworkScored} / ${classworkMax} -> ${singleSubjectResults.internalDetails.cwConverted.toFixed(1)} / ${classworkWeight} pts\n`;
      report += `• Total Continuous Internal Assessment (CIA): ${singleSubjectResults.internalDetails.totalInternalScored.toFixed(1)} / ${singleSubjectResults.internalDetails.totalInternalMax} (${singleSubjectResults.internalDetails.percentage.toFixed(1)}%)\n\n`;
    } else {
      report += `• Internal Score: ${directInternalScored} / ${directInternalMax} (${singleSubjectResults.internalDetails.percentage.toFixed(1)}%)\n\n`;
    }

    report += `REQUIRED FINAL SEMESTER EXAM MARKS (Out of ${externalMax}):\n`;
    singleSubjectResults.targets.forEach((t) => {
      if (t.status === "impossible") {
        report += `• ${t.label}: Not possible with current internal score\n`;
      } else {
        report += `• ${t.label}: Score ${t.marksNeeded} / ${externalMax} (${t.percentageNeeded}%)\n`;
      }
    });
    report += `\nCalculated on StudentToolkit (https://studenttoolkit.vercel.app/marks-calculator)`;

    navigator.clipboard.writeText(report);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#10b981", "#f59e0b", "#3b82f6"],
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* ========================================================================= */}
        {/* 1. UNIVERSITY WEIGHTAGE SCHEME SELECTOR */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Select University Evaluation & Weightage Scheme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose the Continuous Internal Assessment (CIA) and Semester End Exam (SEE) weightage ratio.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 self-start sm:self-auto">
              {currentScheme.internalWeight}% Internal + {currentScheme.externalWeight}% External
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRESET_SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                type="button"
                onClick={() => handleSchemeSelect(scheme.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedSchemeId === scheme.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {scheme.name}
                  </span>
                  {selectedSchemeId === scheme.id && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span>IAT1: {scheme.defaultIat1Weight}m</span>
                  <span>•</span>
                  <span>IAT2: {scheme.defaultIat2Weight}m</span>
                  <span>•</span>
                  <span>Classwork: {scheme.defaultClassworkWeight}m</span>
                  <span>•</span>
                  <span>Min Ext Pass: {scheme.minExternalPassPercent}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN INTERACTIVE SUBJECT EXAM TARGET CALCULATOR */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  Target Marks Calculator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculate required final university exam marks from <strong>Internal 1, Internal 2 & Classwork</strong> scores.
                </p>
              </div>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setCalcMode("components")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  calcMode === "components"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                ✨ Internal 1 + 2 + Classwork
              </button>
              <button
                type="button"
                onClick={() => setCalcMode("direct")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  calcMode === "direct"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Direct Total
              </button>
            </div>
          </div>

          {/* Subject Name Input */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Subject Name
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Data Structures / Operating Systems / Mathematics"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Semester Exam Total Max
              </label>
              <select
                value={externalMax}
                onChange={(e) => setExternalMax(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {[100, 75, 60, 50, 80].map((m) => (
                  <option key={m} value={m}>
                    /{m} Marks (Theory Exam)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. INTERNAL 1, INTERNAL 2, CLASSWORK COMPONENTS INPUT SECTION */}
          {/* ========================================================================= */}
          {calcMode === "components" ? (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Split className="w-4 h-4 text-indigo-500" />
                  Internal Marks Assessment Breakdown (CIA)
                </span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  Target Weight: {currentScheme.internalWeight} Marks
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Internal Assessment 1 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                      1. Internal 1 (IAT 1 / Mid 1)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Weight: {iat1Weight}m
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Scored
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={iat1Max}
                        value={iat1Scored}
                        onChange={(e) => setIat1Scored(Number(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-black text-indigo-600 dark:text-indigo-400 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Out of
                      </label>
                      <select
                        value={iat1Max}
                        onChange={(e) => setIat1Max(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-center cursor-pointer"
                      >
                        {[50, 100, 25, 30, 40, 60, 20].map((m) => (
                          <option key={m} value={m}>
                            /{m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>Converted:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">
                      {singleSubjectResults.internalDetails.i1Converted.toFixed(1)} / {iat1Weight} pts
                    </strong>
                  </div>
                </div>

                {/* 2. Internal Assessment 2 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                      2. Internal 2 (IAT 2 / Model)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Weight: {iat2Weight}m
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Scored
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={iat2Max}
                        value={iat2Scored}
                        onChange={(e) => setIat2Scored(Number(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-black text-indigo-600 dark:text-indigo-400 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Out of
                      </label>
                      <select
                        value={iat2Max}
                        onChange={(e) => setIat2Max(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-center cursor-pointer"
                      >
                        {[50, 100, 25, 30, 40, 60, 20].map((m) => (
                          <option key={m} value={m}>
                            /{m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>Converted:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">
                      {singleSubjectResults.internalDetails.i2Converted.toFixed(1)} / {iat2Weight} pts
                    </strong>
                  </div>
                </div>

                {/* 3. Classwork / Continuous Assessment */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                      3. Classwork & Assignments
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Weight: {classworkWeight}m
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Scored
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={classworkMax}
                        value={classworkScored}
                        onChange={(e) => setClassworkScored(Number(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-black text-emerald-600 dark:text-emerald-400 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Out of
                      </label>
                      <select
                        value={classworkMax}
                        onChange={(e) => setClassworkMax(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-center cursor-pointer"
                      >
                        {[50, 100, 10, 15, 20, 25, 30, 40, 60, 75, 5].map((m) => (
                          <option key={m} value={m}>
                            /{m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>Converted:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">
                      {singleSubjectResults.internalDetails.cwConverted.toFixed(1)} / {classworkWeight} pts
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Direct Mode Input */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Direct Internal Scored
                </label>
                <input
                  type="number"
                  min="0"
                  max={directInternalMax}
                  value={directInternalScored}
                  onChange={(e) => setDirectInternalScored(Number(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-black text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Direct Internal Max Marks
                </label>
                <select
                  value={directInternalMax}
                  onChange={(e) => setDirectInternalMax(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  {[40, 50, 20, 30, 25, 100].map((m) => (
                    <option key={m} value={m}>
                      /{m} Marks Total
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Internal Standing Score Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-indigo-50/80 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-500/20">
                CIA
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                  Total Internal Standing: {singleSubjectResults.internalDetails.totalInternalScored.toFixed(1)} / {singleSubjectResults.internalDetails.totalInternalMax} ({singleSubjectResults.internalDetails.percentage.toFixed(1)}%)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Secured <strong>{singleSubjectResults.internalDetails.effectiveWeightedPoints.toFixed(1)}</strong> out of {currentScheme.internalWeight} weighted points towards final course grade
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleCopyTargetReport}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedPlan ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
                {copiedPlan ? "Copied Target Sheet!" : "Copy Targets"}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. LIVE SEMESTER EXAM TARGET GRID */}
          {/* ========================================================================= */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Required Semester University Exam Score for Each Letter Grade
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {singleSubjectResults.targets.map((t) => {
                let badgeColor = "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200";
                let statusBadge = "Achievable 🎯";
                if (t.status === "secured") {
                  badgeColor = "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200";
                  statusBadge = "Guaranteed ✨";
                } else if (t.status === "easy") {
                  badgeColor = "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200";
                  statusBadge = "High Feasibility ✅";
                } else if (t.status === "challenging") {
                  badgeColor = "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200";
                  statusBadge = "Challenging 🔥";
                } else if (t.status === "impossible") {
                  badgeColor = "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200";
                  statusBadge = "Out of Reach ❌";
                }

                return (
                  <div
                    key={t.grade}
                    className={`p-4 rounded-2xl border transition-all ${
                      t.status === "impossible"
                        ? "bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 opacity-80"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                          {t.grade}
                        </span>
                        {t.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {statusBadge}
                      </span>
                    </div>

                    <div className="my-2">
                      {t.status === "impossible" ? (
                        <div className="text-base font-bold text-rose-600 dark:text-rose-400">
                          Not Possible
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                            {t.marksNeeded}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            / {externalMax} marks ({t.percentageNeeded}%)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span>Target Band: {t.minRange}</span>
                      {t.status !== "impossible" && (
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Need {t.marksNeeded}+
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. MULTI-SUBJECT SEMESTER EXAM STRATEGY SHEET */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                All Semester Subjects Target Sheet (With Internal 1, 2 & Classwork)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Input your Internal 1, Internal 2, and Classwork scores per subject to track target final exam marks.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMultiSubject}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subject
            </button>
          </div>

          <div className="space-y-3.5">
            {multiSubjects.map((sub, idx) => {
              const internalDetails = computeEffectiveInternal(
                sub.calcMode,
                sub.iat1Scored,
                sub.iat1Max,
                currentScheme.defaultIat1Weight,
                sub.iat2Scored,
                sub.iat2Max,
                currentScheme.defaultIat2Weight,
                sub.classworkScored,
                sub.classworkMax,
                currentScheme.defaultClassworkWeight,
                sub.internalScored,
                sub.internalMax,
                currentScheme
              );

              const oTarget = calculateRequiredMarks(internalDetails.effectiveWeightedPoints, sub.externalMax, 91, currentScheme);
              const aPlusTarget = calculateRequiredMarks(internalDetails.effectiveWeightedPoints, sub.externalMax, 81, currentScheme);
              const passTarget = calculateRequiredMarks(internalDetails.effectiveWeightedPoints, sub.externalMax, 50, currentScheme);

              return (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => handleUpdateMultiSubject(sub.id, "name", e.target.value)}
                        placeholder={`Subject ${idx + 1}`}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        CIA: {internalDetails.totalInternalScored.toFixed(1)} / {internalDetails.totalInternalMax} ({internalDetails.percentage.toFixed(0)}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMultiSubject(sub.id)}
                        disabled={multiSubjects.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-20 cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Components Row (Internal 1, Internal 2, Classwork) & Results */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Inputs */}
                    <div className="sm:col-span-6 grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">Internal 1</span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <input
                            type="number"
                            value={sub.iat1Scored}
                            onChange={(e) => handleUpdateMultiSubject(sub.id, "iat1Scored", Number(e.target.value) || 0)}
                            className="w-10 p-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-center"
                          />
                          <select
                            value={sub.iat1Max}
                            onChange={(e) => handleUpdateMultiSubject(sub.id, "iat1Max", Number(e.target.value))}
                            className="text-[10px] text-slate-500 bg-transparent border-none p-0 cursor-pointer"
                          >
                            {[50, 100, 25, 30, 40, 20].map((m) => (
                              <option key={m} value={m}>/{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">Internal 2</span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <input
                            type="number"
                            value={sub.iat2Scored}
                            onChange={(e) => handleUpdateMultiSubject(sub.id, "iat2Scored", Number(e.target.value) || 0)}
                            className="w-10 p-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-center"
                          />
                          <select
                            value={sub.iat2Max}
                            onChange={(e) => handleUpdateMultiSubject(sub.id, "iat2Max", Number(e.target.value))}
                            className="text-[10px] text-slate-500 bg-transparent border-none p-0 cursor-pointer"
                          >
                            {[50, 100, 25, 30, 40, 20].map((m) => (
                              <option key={m} value={m}>/{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">Classwork</span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <input
                            type="number"
                            value={sub.classworkScored}
                            onChange={(e) => handleUpdateMultiSubject(sub.id, "classworkScored", Number(e.target.value) || 0)}
                            className="w-10 p-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-center"
                          />
                          <select
                            value={sub.classworkMax}
                            onChange={(e) => handleUpdateMultiSubject(sub.id, "classworkMax", Number(e.target.value))}
                            className="text-[10px] text-slate-500 bg-transparent border-none p-0 cursor-pointer"
                          >
                            {[50, 100, 10, 15, 20, 25, 30, 40, 5].map((m) => (
                              <option key={m} value={m}>/{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Targets */}
                    <div className="sm:col-span-6 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="block text-[9px] font-bold text-amber-500 uppercase">O Target (91+)</span>
                        <strong className="text-xs text-slate-900 dark:text-slate-100">
                          {oTarget.status === "impossible" ? "—" : `${oTarget.marksNeeded}`}
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="block text-[9px] font-bold text-indigo-500 uppercase">A+ Target (81+)</span>
                        <strong className="text-xs text-slate-900 dark:text-slate-100">
                          {aPlusTarget.status === "impossible" ? "—" : `${aPlusTarget.marksNeeded}`}
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="block text-[9px] font-bold text-emerald-500 uppercase">Pass Cutoff</span>
                        <strong className="text-xs text-emerald-600 dark:text-emerald-400">
                          {passTarget.marksNeeded}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

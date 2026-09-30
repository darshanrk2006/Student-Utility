"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-data";
import {
  FileText,
  Clock,
  Mic,
  BarChart2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function WordCounterPage() {
  const tool = TOOLS.find((t) => t.id === "word-counter")!;
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  // Real-time analysis calculations
  const stats = useMemo(() => {
    const raw = text.trim();
    if (!raw) {
      return {
        words: 0,
        charsWithSpaces: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMinutes: 0,
        speakingTimeMinutes: 0,
        topKeywords: [],
      };
    }

    const wordsArray = raw.split(/\s+/).filter(Boolean);
    const words = wordsArray.length;
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;

    // Sentences: match by ., !, ?
    const sentences = (text.match(/[.!?]+(?:\s+|$)/g) || []).length || (words > 0 ? 1 : 0);

    // Paragraphs: split by double newlines or single newlines with content
    const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean).length || 1;

    // Speeds: Reading ~ 225 WPM, Speaking ~ 130 WPM
    const readingTimeMinutes = Math.ceil(words / 225);
    const speakingTimeMinutes = Math.ceil(words / 130);

    // Keyword density calculation (filter short stop words)
    const stopWords = new Set([
      "the", "and", "a", "an", "in", "on", "of", "to", "for", "with", "at", "by", "from", "is", "are", "was", "were", "it", "this", "that", "be", "as", "or"
    ]);
    const wordFreq: Record<string, number> = {};
    for (const w of wordsArray) {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (clean.length > 2 && !stopWords.has(clean)) {
        wordFreq[clean] = (wordFreq[clean] || 0) + 1;
      }
    }

    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / words) * 100),
      }));

    return {
      words,
      charsWithSpaces,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTimeMinutes,
      speakingTimeMinutes,
      topKeywords,
    };
  }, [text]);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSampleText = () => {
    setText(
      "Higher education empowers students to think critically, collaborate across disciplines, and develop innovative solutions to global challenges. Writing structured essays requires careful attention to word limits, coherent paragraph transitions, and precise academic vocabulary. Utilizing automated formatting and proofreading tools allows learners to focus on deep conceptual comprehension while maintaining strict citation standards."
    );
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {stats.words.toLocaleString()}
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              Words
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {stats.charsWithSpaces.toLocaleString()}
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              Characters
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {stats.sentences.toLocaleString()}
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              Sentences
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.paragraphs.toLocaleString()}
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              Paragraphs
            </p>
          </div>
        </div>

        {/* Text Area Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Essay / Assignment Text
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSampleText}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold transition-colors"
              >
                Load Sample
              </button>

              <button
                onClick={handleCopy}
                disabled={!text}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={() => setText("")}
                disabled={!text}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-40"
                title="Clear Text"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your academic paper, discussion post, or essay here..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
          />

          {/* Timing & Density Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Reading Time</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ~{stats.readingTimeMinutes} {stats.readingTimeMinutes === 1 ? "minute" : "minutes"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Speaking Time</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ~{stats.speakingTimeMinutes} {stats.speakingTimeMinutes === 1 ? "minute" : "minutes"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">No-Space Chars</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {stats.charsNoSpaces.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Top Keywords */}
          {stats.topKeywords.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Top Academic Keywords
              </span>
              <div className="flex flex-wrap gap-2">
                {stats.topKeywords.map((k) => (
                  <span
                    key={k.word}
                    className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60"
                  >
                    {k.word} ({k.count}x · {k.density}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

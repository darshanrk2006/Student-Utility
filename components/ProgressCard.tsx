"use client";

import React from "react";
import { Loader2, CheckCircle2, AlertTriangle, Download, RotateCcw, File } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import confetti from "canvas-confetti";

export interface ProgressCardProps {
  filename: string;
  filesize?: number;
  status: "idle" | "processing" | "success" | "error";
  statusText?: string;
  progressPercent?: number;
  errorMessage?: string;
  downloadLabel?: string;
  onDownload?: () => void;
  onReset?: () => void;
}

export function ProgressCard({
  filename,
  filesize,
  status,
  statusText,
  progressPercent = 0,
  errorMessage,
  downloadLabel = "Download File",
  onDownload,
  onReset,
}: ProgressCardProps) {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#6366f1", "#3b82f6", "#10b981", "#ec4899"],
    });
  };

  const handleDownload = () => {
    triggerConfetti();
    if (onDownload) onDownload();
  };

  if (status === "idle") return null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 animate-in fade-in zoom-in-95 duration-200">
      {/* File Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              status === "success"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                : status === "error"
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                : "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
            }`}
          >
            {status === "processing" && <Loader2 className="w-6 h-6 animate-spin" />}
            {status === "success" && <CheckCircle2 className="w-6 h-6" />}
            {status === "error" && <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="truncate">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {filename}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filesize ? formatBytes(filesize) : "Document"} ·{" "}
              {status === "processing" && (statusText || "Processing...")}
              {status === "success" && "Ready to download"}
              {status === "error" && "Action failed"}
            </p>
          </div>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Start over"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {status === "processing" && (
        <div className="space-y-2 mb-4">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(15, Math.min(100, progressPercent || 45))}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>{statusText || "Working on your file..."}</span>
            {progressPercent > 0 && <span>{progressPercent}%</span>}
          </div>
        </div>
      )}

      {/* Error Message */}
      {status === "error" && errorMessage && (
        <div className="mb-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold mb-0.5">Error:</p>
          {errorMessage}
        </div>
      )}

      {/* Success Download Bar */}
      {status === "success" && (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Download className="w-5 h-5" />
            {downloadLabel}
          </button>

          {onReset && (
            <button
              onClick={onReset}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
            >
              Convert Another File
            </button>
          )}
        </div>
      )}
    </div>
  );
}

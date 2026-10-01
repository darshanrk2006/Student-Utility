"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { TOOLS } from "@/lib/tools-data";
import { extractTextFromPdf } from "@/lib/pdf-utils";
import { generateDocxBlobFromPages } from "@/lib/docx-builder";
import { downloadBlob, formatBytes } from "@/lib/utils";
import {
  FileEdit,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PdfToWordPage() {
  const tool = TOOLS.find((t) => t.id === "pdf-to-word")!;

  const [file, setFile] = useState<File | null>(null);
  const [extractedPages, setExtractedPages] = useState<{ pageNumber: number; text: string }[]>([]);
  const [fullText, setFullText] = useState<string>("");
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileSelect = async (files: File[]) => {
    if (!files[0]) return;
    const selectedFile = files[0];

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      setErrorMessage("Please select a valid PDF document.");
      return;
    }

    setFile(selectedFile);
    setStatus("processing");
    setErrorMessage("");
    setExtractedPages([]);
    setFullText("");
    setDocxBlob(null);

    try {
      // 1. Extract text and pages 100% in-browser using PDF.js
      const extraction = await extractTextFromPdf(selectedFile);

      if (!extraction.fullText && extraction.pages.every((p) => !p.text.trim())) {
        throw new Error(
          "This PDF appears to contain only scanned photos or images without a selectable text layer. Please use an OCR-enabled PDF or copy text directly."
        );
      }

      setExtractedPages(extraction.pages);
      setFullText(extraction.fullText);

      // 2. Generate a valid Microsoft Word (.docx) file directly in browser RAM
      const docx = await generateDocxBlobFromPages(extraction.pages);
      setDocxBlob(docx);
      setStatus("success");

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error("PDF to Word error:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to convert PDF to Word. Please ensure the file is a valid PDF."
      );
    }
  };

  const handleDownloadDocx = () => {
    if (!docxBlob || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    downloadBlob(docxBlob, `${baseName}.docx`);
  };

  const handleCopyText = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedPages([]);
    setFullText("");
    setDocxBlob(null);
    setStatus("idle");
    setErrorMessage("");
  };

  const wordCount = fullText ? fullText.split(/\s+/).filter(Boolean).length : 0;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Trust Notice */}
        <div className="p-4 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                100% In-Browser Conversion ($0 Cost · Zero Uploads)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Converts PDF directly into an editable Microsoft Word (.docx) document inside your device memory with zero third-party API dependencies.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
            No API Keys Needed
          </span>
        </div>

        {/* Error Notification */}
        {!file && status === "error" && errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                setStatus("idle");
                setErrorMessage("");
              }}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dropzone or Conversion View */}
        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelect}
            accept=".pdf,application/pdf"
            title="Drop PDF to convert to Word (.docx)"
            description="Only .PDF files accepted (assignments, research papers, syllabus PDFs)"
            icon={<FileEdit className="w-8 h-8 text-indigo-500" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* File Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatBytes(file.size)} · {extractedPages.length} {extractedPages.length === 1 ? "Page" : "Pages"} · {wordCount.toLocaleString()} words
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Convert Another
                </button>
              </div>
            </div>

            {/* Status State */}
            {status === "processing" && (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Parsing PDF & Generating Word (.docx)...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Processing structure and paragraphs in client memory.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>Conversion Error</span>
                </div>
                <p className="text-xs">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-2 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Try Again
                </button>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-6">
                {/* Success Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold">
                      Conversion Complete! Your Word (.docx) is ready to edit.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadDocx}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download Word (.docx)
                  </button>
                </div>

                {/* Document Preview Box */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-500" />
                      Extracted Text Preview
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy Text"}
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 max-h-72 overflow-y-auto font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {fullText || "No text preview available."}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

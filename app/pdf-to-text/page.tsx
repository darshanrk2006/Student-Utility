"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { extractTextFromPdf } from "@/lib/pdf-utils";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { FileCode, Copy, Check, Download, FileText, Sparkles, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";

export default function PdfToTextPage() {
  const tool = TOOLS.find((t) => t.id === "pdf-to-text")!;
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [pages, setPages] = useState<{ pageNumber: number; text: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);
    setStatus("processing");
    setExtractedText("");
    setPages([]);
    setErrorMessage("");

    try {
      const result = await extractTextFromPdf(uploadedFile);
      if (!result.fullText) {
        throw new Error(
          "No selectable text found in this PDF. If this is a scanned image/photo document, an OCR text layer is required."
        );
      }
      setExtractedText(result.fullText);
      setPages(result.pages);
      setStatus("success");
    } catch (err: any) {
      console.error("PDF to text error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Could not extract text from this PDF.");
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText || !file) return;
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    const baseName = file.name.replace(/\.pdf$/i, "");
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${baseName}_extracted.txt`);
  };

  const handleDownloadMarkdown = () => {
    if (!extractedText || !file) return;
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    const baseName = file.name.replace(/\.pdf$/i, "");
    const blob = new Blob([`# Extracted Text: ${file.name}\n\n${extractedText}`], {
      type: "text/markdown;charset=utf-8",
    });
    downloadBlob(blob, `${baseName}_extracted.md`);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedText("");
    setPages([]);
    setStatus("idle");
    setErrorMessage("");
  };

  const wordCount = extractedText ? extractedText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = extractedText.length;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept=".pdf,application/pdf"
            title="Drop PDF to extract text"
            description="Extract text transcripts from research papers, slides, and syllabus documents"
            icon={<FileCode className="w-8 h-8" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {pages.length} {pages.length === 1 ? "page" : "pages"} · {wordCount.toLocaleString()} words · {charCount.toLocaleString()} characters
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!extractedText}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy All
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 text-xs font-semibold"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Extracted Text Area */}
            {status === "processing" ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-xs font-medium">Extracting textual content page by page...</p>
              </div>
            ) : (
              extractedText && (
                <div className="space-y-4">
                  <textarea
                    rows={12}
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Export Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleDownloadTxt}
                      className="py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all hover:scale-102"
                    >
                      <Download className="w-4 h-4" />
                      Download as Plain Text (.txt)
                    </button>
                    <button
                      onClick={handleDownloadMarkdown}
                      className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-102"
                    >
                      <Download className="w-4 h-4" />
                      Download as Markdown (.md)
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {status === "error" && (
          <ProgressCard
            filename={file?.name || "document.pdf"}
            status="error"
            errorMessage={errorMessage}
            onReset={handleReset}
          />
        )}
      </div>
    </ToolLayout>
  );
}

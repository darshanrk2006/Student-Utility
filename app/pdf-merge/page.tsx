"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { mergePdfFiles } from "@/lib/pdf-utils";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { FileText, ArrowUp, ArrowDown, Trash2, Plus, Sparkles, Layers } from "lucide-react";

export default function PdfMergePage() {
  const tool = TOOLS.find((t) => t.id === "pdf-merge")!;
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [mergedPdfData, setMergedPdfData] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFilesSelected = (newFiles: File[]) => {
    const pdfOnly = newFiles.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    setFiles((prev) => [...prev, ...pdfOnly]);
    setStatus("idle");
    setMergedPdfData(null);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newFiles = [...files];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIndex];
    newFiles[targetIndex] = temp;
    setFiles(newFiles);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setStatus("idle");
    setMergedPdfData(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const mergedBytes = await mergePdfFiles(files);
      setMergedPdfData(mergedBytes);
      setStatus("success");
    } catch (err: any) {
      console.error("Merge error:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Could not merge PDF files. Please verify the files are not password-protected."
      );
    }
  };

  const handleDownload = () => {
    if (!mergedPdfData) return;
    const blob = new Blob([mergedPdfData as unknown as BlobPart], { type: "application/pdf" });
    downloadBlob(blob, "merged_document.pdf");
  };

  const handleReset = () => {
    setFiles([]);
    setStatus("idle");
    setMergedPdfData(null);
    setErrorMessage("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {files.length === 0 ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept=".pdf,application/pdf"
            multiple={true}
            title="Drop two or more PDF files here"
            description="Combine homework, lecture notes, or syllabus docs in your preferred order"
            icon={<Layers className="w-8 h-8" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Arrange Files to Merge
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {files.length} {files.length === 1 ? "file selected" : "files selected"} (drag or use arrows to order)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Add More PDFs
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* File List */}
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <div className="truncate">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400">{formatBytes(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === files.length - 1}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {files.length === 1 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Add at least one more PDF file to perform a merge.
              </p>
            )}

            {/* Merge Button */}
            {status !== "success" && (
              <button
                onClick={handleMerge}
                disabled={files.length < 2 || status === "processing"}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98"
              >
                <Layers className="w-4 h-4" />
                Merge {files.length} PDFs Now
              </button>
            )}
          </div>
        )}

        {/* Progress and Download State */}
        <ProgressCard
          filename="merged_document.pdf"
          status={status}
          statusText="Combining PDF pages locally in browser..."
          errorMessage={errorMessage}
          downloadLabel="Download Merged PDF"
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </div>
    </ToolLayout>
  );
}

"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { compressPdfClient } from "@/lib/pdf-utils";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { Minimize2, FileText, CheckCircle2, Sparkles, Sliders } from "lucide-react";

export default function PdfCompressPage() {
  const tool = TOOLS.find((t) => t.id === "pdf-compress")!;
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<"balanced" | "high">("balanced");

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [compressedBytes, setCompressedBytes] = useState<Uint8Array | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelected = (files: File[]) => {
    if (!files[0]) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);
    setOriginalSize(uploadedFile.size);
    setStatus("idle");
    setCompressedBytes(null);
    setErrorMessage("");
  };

  const handleCompress = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const bytes = await compressPdfClient(file, level);
      setCompressedBytes(bytes);
      setCompressedSize(bytes.length);
      setStatus("success");
    } catch (err: any) {
      console.error("PDF compress error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to compress PDF.");
    }
  };

  const handleDownload = () => {
    if (!compressedBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    const blob = new Blob([compressedBytes as unknown as BlobPart], { type: "application/pdf" });
    downloadBlob(blob, `${baseName}_compressed.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setCompressedBytes(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setErrorMessage("");
  };

  const percentSaved =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept=".pdf,application/pdf"
            title="Drop PDF to reduce file size"
            description="Optimize streams and purge redundant metadata for Canvas, Blackboard, and portal uploads"
            icon={<Minimize2 className="w-8 h-8" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* File Info */}
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
                    Original size: {formatBytes(file.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors self-start sm:self-auto"
              >
                Change File
              </button>
            </div>

            {/* Compression Level Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLevel("balanced")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  level === "balanced"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Balanced Compression
                  </h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Best balance between size reduction and visual clarity. Preserves crisp vector text.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLevel("high")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  level === "high"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Maximum Compression
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Maximizes file size reduction for strict email and college assignment upload limits.
                </p>
              </button>
            </div>

            {/* Results Comparison Box */}
            {status === "success" && (
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">
                      Compression Complete!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {formatBytes(originalSize)} &rarr; {formatBytes(compressedSize)}
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm shadow-sm">
                  {percentSaved > 0 ? `${percentSaved}% Saved` : "Optimized Streams"}
                </div>
              </div>
            )}

            {/* Action Compress Button */}
            {status !== "success" && (
              <button
                onClick={handleCompress}
                disabled={status === "processing"}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98"
              >
                <Minimize2 className="w-4 h-4" />
                Compress PDF Now
              </button>
            )}
          </div>
        )}

        {/* Progress and Download State */}
        <ProgressCard
          filename={`${file?.name.replace(/\.pdf$/i, "") || "document"}_compressed.pdf`}
          status={status}
          statusText="Compressing PDF data streams locally on your device..."
          errorMessage={errorMessage}
          downloadLabel="Download Compressed PDF"
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </div>
    </ToolLayout>
  );
}

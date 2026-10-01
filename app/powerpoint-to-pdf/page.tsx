"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { TOOLS } from "@/lib/tools-data";
import { parsePptxToSlides, convertSlidesToPdf } from "@/lib/office-parsers";
import { downloadBlob, formatBytes } from "@/lib/utils";
import {
  Presentation,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  Layers,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PowerPointToPdfPage() {
  const tool = TOOLS.find((t) => t.id === "powerpoint-to-pdf")!;

  const [file, setFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<{ slideNumber: number; title: string; lines: string[] }[]>([]);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const selectedFile = files[0];

    const validExtensions = [".pptx", ".ppt", ".odp", ".key"];
    const isSupported = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!isSupported) {
      setStatus("error");
      setErrorMessage("Please select a valid PowerPoint presentation (.pptx, .ppt, .odp).");
      return;
    }

    setFile(selectedFile);
    setStatus("processing");
    setErrorMessage("");
    setSlides([]);
    setPdfBytes(null);

    try {
      // 1. Parse slides client-side
      const parsedSlides = await parsePptxToSlides(selectedFile);

      if (parsedSlides.length === 0) {
        throw new Error("No readable slides found in this presentation.");
      }

      setSlides(parsedSlides);

      // 2. Render 16:9 PDF slide deck
      const generatedBytes = await convertSlidesToPdf(parsedSlides, selectedFile.name);
      setPdfBytes(generatedBytes);
      setStatus("success");

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error("PowerPoint to PDF error:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to convert PowerPoint presentation to PDF in the browser."
      );
    }
  };

  const handleDownload = () => {
    if (!pdfBytes || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
    downloadBlob(blob, `${baseName}.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setSlides([]);
    setPdfBytes(null);
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Trust Notice */}
        <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                100% In-Browser PowerPoint (.pptx) to PDF
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                $0 Cost · Zero Uploads · Compiles into a landscape 16:9 presentation slide deck.
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
            onFilesSelected={handleFileSelected}
            accept=".pptx,.ppt,.odp,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
            title="Drop PowerPoint (.pptx) to convert to PDF"
            description="Only .PPTX, .PPT, and .ODP presentation slides are accepted"
            icon={<Presentation className="w-8 h-8 text-amber-600" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">
                  <Presentation className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatBytes(file.size)} · {slides.length} {slides.length === 1 ? "Slide" : "Slides"} Extracted
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

            {/* Processing state */}
            {status === "processing" && (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Parsing Slides & Generating PDF Deck...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compiling slide titles and bullet hierarchy in client memory.
                </p>
              </div>
            )}

            {/* Error state */}
            {status === "error" && (
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>Presentation Conversion Error</span>
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

            {/* Success State */}
            {status === "success" && (
              <div className="space-y-6">
                {/* Download Card */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold">
                      Conversion Complete! Presentation PDF slide deck ready.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Slide Deck
                  </button>
                </div>

                {/* Slides Preview Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      Extracted Slide Deck Cards
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {slides.length} {slides.length === 1 ? "Slide" : "Slides"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                    {slides.map((slide) => (
                      <div
                        key={slide.slideNumber}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate pr-2">
                            {slide.title}
                          </h5>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0">
                            Slide {slide.slideNumber}
                          </span>
                        </div>

                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                          {slide.lines.slice(0, 4).map((line, lIdx) => (
                            <li key={lIdx} className="truncate">
                              {line}
                            </li>
                          ))}
                          {slide.lines.length > 4 && (
                            <li className="text-[11px] text-slate-400 italic list-none">
                              +{slide.lines.length - 4} more points...
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
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

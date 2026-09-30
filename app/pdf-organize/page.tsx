"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { organizePdf, renderPdfPagesToImages } from "@/lib/pdf-utils";
import { downloadBlob, formatBytes } from "@/lib/utils";
import {
  RotateCw,
  RotateCcw,
  Trash2,
  ArrowLeft,
  ArrowRight,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PageItem {
  id: string;
  originalIndex: number;
  rotation: number;
  dataUrl?: string;
}

export default function PdfOrganizePage() {
  const tool = TOOLS.find((t) => t.id === "pdf-organize")!;
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [outputPdfBytes, setOutputPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);
    setStatus("idle");
    setOutputPdfBytes(null);
    setErrorMessage("");
    setIsLoadingPreviews(true);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();

      // Initial page items
      const initialPages: PageItem[] = Array.from({ length: count }, (_, i) => ({
        id: `page_${i}_${Date.now()}`,
        originalIndex: i,
        rotation: 0,
      }));
      setPages(initialPages);

      // Attempt to load visual thumbnails
      try {
        const rendered = await renderPdfPagesToImages(uploadedFile, Math.min(count, 30), 1.0);
        setPages((prev) =>
          prev.map((p, idx) => ({
            ...p,
            dataUrl: rendered[idx]?.dataUrl,
          }))
        );
      } catch (renderErr) {
        console.warn("Thumbnail rendering skipped:", renderErr);
      }
    } catch (err: any) {
      console.error("PDF load error:", err);
      setErrorMessage("Could not load PDF. Please make sure it is not password protected.");
    } finally {
      setIsLoadingPreviews(false);
    }
  };

  const handleRotate = (index: number, angle: number) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        rotation: (copy[index].rotation + angle + 360) % 360,
      };
      return copy;
    });
  };

  const handleRotateAll = (angle: number) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + angle + 360) % 360,
      }))
    );
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;
    const copy = [...pages];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setPages(copy);
  };

  const handleDelete = (index: number) => {
    if (pages.length <= 1) {
      alert("A PDF must contain at least one page.");
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!file || pages.length === 0) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const pageOps = pages.map((p) => ({
        originalIndex: p.originalIndex,
        rotation: p.rotation,
      }));

      const outputBytes = await organizePdf(file, pageOps);
      setOutputPdfBytes(outputBytes);
      setStatus("success");
    } catch (err: any) {
      console.error("Organize error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to organize PDF.");
    }
  };

  const handleDownload = () => {
    if (!outputPdfBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    const blob = new Blob([outputPdfBytes as unknown as BlobPart], { type: "application/pdf" });
    downloadBlob(blob, `${baseName}_organized.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setStatus("idle");
    setOutputPdfBytes(null);
    setErrorMessage("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept=".pdf,application/pdf"
            title="Drop your PDF to reorder, rotate, and delete pages"
            description="Visual page editor: rotate scanned pages, reorder slides, or remove blank pages"
            icon={<RotateCw className="w-8 h-8" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pages.length} {pages.length === 1 ? "page" : "pages remaining"} · {formatBytes(file.size)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleRotateAll(90)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:border-indigo-400"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Rotate All 90°
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-rose-600 text-xs font-semibold"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Visual Page Grid */}
            {isLoadingPreviews && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating high-resolution page previews...</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                >
                  {/* Page Preview Container */}
                  <div className="relative aspect-[3/4] bg-white dark:bg-slate-900 rounded-xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <div
                      className="w-full h-full flex items-center justify-center transition-transform duration-200"
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                    >
                      {p.dataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.dataUrl}
                          alt={`Page ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <FileText className="w-8 h-8" />
                          <span className="text-[10px] font-bold">P. {p.originalIndex + 1}</span>
                        </div>
                      )}
                    </div>

                    <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                      #{idx + 1}
                    </span>

                    {p.rotation > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-indigo-600 text-white text-[9px] font-bold px-1 rounded">
                        {p.rotation}°
                      </span>
                    )}
                  </div>

                  {/* Actions for page */}
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(idx, "left")}
                        disabled={idx === 0}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, "right")}
                        disabled={idx === pages.length - 1}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRotate(idx, 90)}
                        className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400"
                        title="Rotate 90° Clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(idx)}
                        className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/80 text-rose-500"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            {status !== "success" && (
              <button
                onClick={handleSave}
                disabled={status === "processing" || pages.length === 0}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                Save Organized PDF ({pages.length} Pages)
              </button>
            )}
          </div>
        )}

        {/* Progress and Download State */}
        <ProgressCard
          filename={`${file?.name.replace(/\.pdf$/i, "") || "document"}_organized.pdf`}
          status={status}
          statusText="Rendering and restructuring your PDF..."
          errorMessage={errorMessage}
          downloadLabel="Download Organized PDF"
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </div>
    </ToolLayout>
  );
}

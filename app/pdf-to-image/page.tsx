"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { renderPdfPagesToImages } from "@/lib/pdf-utils";
import { createZipArchive } from "@/lib/jszip-utils";
import { downloadBlob, downloadDataUrl, formatBytes } from "@/lib/utils";
import { FileImage, Download, FileArchive, RefreshCw, Sparkles, FileText } from "lucide-react";
import confetti from "canvas-confetti";

interface RenderedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export default function PdfToImagePage() {
  const tool = TOOLS.find((t) => t.id === "pdf-to-image")!;
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [format, setFormat] = useState<"png" | "jpeg">("png");

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [zipBlobData, setZipBlobData] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);
    setStatus("processing");
    setZipBlobData(null);
    setErrorMessage("");

    try {
      const rendered = await renderPdfPagesToImages(uploadedFile, 50, 1.5);
      if (rendered.length === 0) {
        throw new Error("Could not extract any pages from this PDF.");
      }
      setPages(rendered);
      setStatus("success");
    } catch (err: any) {
      console.error("PDF to image error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to render PDF pages as images.");
    }
  };

  const handleDownloadSingle = (page: RenderedPage) => {
    if (!file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    downloadDataUrl(page.dataUrl, `${baseName}_page_${page.pageNumber}.${format}`);
  };

  const handleDownloadAllZip = async () => {
    if (!file || pages.length === 0) return;
    const baseName = file.name.replace(/\.pdf$/i, "");

    const zipFiles = pages.map((p) => ({
      filename: `${baseName}_page_${p.pageNumber}.${format}`,
      data: p.dataUrl,
      isBase64: true,
    }));

    const zip = await createZipArchive(zipFiles);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
    downloadBlob(zip, `${baseName}_all_images.zip`);
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setStatus("idle");
    setZipBlobData(null);
    setErrorMessage("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept=".pdf,application/pdf"
            title="Drop your PDF to export as images"
            description="Render every page into high-resolution PNG or JPG images with batch ZIP download"
            icon={<FileImage className="w-8 h-8" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header with quick download all */}
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
                    {pages.length} {pages.length === 1 ? "page rendered" : "pages rendered"} · {formatBytes(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pages.length > 0 && (
                  <button
                    onClick={handleDownloadAllZip}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all hover:scale-102"
                  >
                    <FileArchive className="w-4 h-4" />
                    Download All as ZIP ({pages.length})
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 text-xs font-semibold"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Rendered Images Gallery */}
            {pages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((p) => (
                  <div
                    key={p.pageNumber}
                    className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                  >
                    <div className="relative aspect-[3/4] bg-white dark:bg-slate-900 rounded-xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-xs font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                        Page {p.pageNumber}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDownloadSingle(p)}
                      className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-500" />
                      Save Page {p.pageNumber} ({format.toUpperCase()})
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress Card for processing */}
        {status === "processing" && (
          <ProgressCard
            filename={file?.name || "document.pdf"}
            status="processing"
            statusText="Rendering PDF pages at high-resolution 2x retina DPI..."
          />
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

"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { splitPdfByRange, splitPdfAllPages } from "@/lib/pdf-utils";
import { createZipArchive } from "@/lib/jszip-utils";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { Scissors, FileText, FileArchive, CheckSquare, Square } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function PdfSplitPage() {
  const tool = TOOLS.find((t) => t.id === "pdf-split")!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<"range" | "all" | "select">("range");
  const [pageRange, setPageRange] = useState("1-2");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [downloadBlobData, setDownloadBlobData] = useState<Blob | null>(null);
  const [downloadFilename, setDownloadFilename] = useState("split_pages.pdf");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);
    setStatus("idle");
    setDownloadBlobData(null);
    setErrorMessage("");

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setPageCount(count);
      setPageRange(count > 1 ? `1-${Math.min(count, 3)}` : "1");
      setSelectedPages([1]);
    } catch (err: any) {
      console.error("PDF load error:", err);
      setErrorMessage("Could not load PDF. Please ensure the document is not password protected.");
    }
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const handleSelectAll = () => {
    if (selectedPages.length === pageCount) {
      setSelectedPages([]);
    } else {
      setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1));
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const baseName = file.name.replace(/\.pdf$/i, "");

      if (splitMode === "all") {
        const pages = await splitPdfAllPages(file);
        const zipFiles = pages.map((p) => ({
          filename: `${baseName}_page_${p.pageNum}.pdf`,
          data: p.data,
        }));
        const zipBlob = await createZipArchive(zipFiles);
        setDownloadBlobData(zipBlob);
        setDownloadFilename(`${baseName}_all_pages.zip`);
      } else if (splitMode === "select") {
        if (selectedPages.length === 0) {
          throw new Error("Please select at least one page to extract.");
        }
        const rangeStr = selectedPages.join(",");
        const pdfBytes = await splitPdfByRange(file, rangeStr);
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        setDownloadBlobData(blob);
        setDownloadFilename(`${baseName}_extracted_pages.pdf`);
      } else {
        const pdfBytes = await splitPdfByRange(file, pageRange);
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        setDownloadBlobData(blob);
        setDownloadFilename(`${baseName}_range_${pageRange.replace(/[^0-9-]/g, "_")}.pdf`);
      }

      setStatus("success");
    } catch (err: any) {
      console.error("Split error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to split PDF.");
    }
  };

  const handleDownload = () => {
    if (!downloadBlobData) return;
    downloadBlob(downloadBlobData, downloadFilename);
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setStatus("idle");
    setDownloadBlobData(null);
    setErrorMessage("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept=".pdf,application/pdf"
            title="Drop your PDF to split or extract pages"
            description="Extract specific pages, page ranges (e.g. 1-5, 8), or split all pages into a ZIP"
            icon={<Scissors className="w-8 h-8" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* File Info Card */}
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
                    {pageCount} {pageCount === 1 ? "page" : "total pages"} · {formatBytes(file.size)}
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

            {/* Split Mode Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "range", title: "Custom Range", desc: "e.g. 1-3, 5, 8" },
                { id: "select", title: "Select Pages", desc: "Pick specific pages visually" },
                { id: "all", title: "Extract All Pages", desc: "Every page in a ZIP" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSplitMode(opt.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    splitMode === opt.id
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950"
                  }`}
                >
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-0.5">
                    {opt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Range Input Mode */}
            {splitMode === "range" && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Page Range Expression (1 to {pageCount})
                </label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400">
                  Example: <code className="text-indigo-500">1-4, 7</code> will extract pages 1, 2, 3, 4, and 7 into a single PDF.
                </p>
              </div>
            )}

            {/* Select Pages Grid Mode */}
            {splitMode === "select" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Selected: {selectedPages.length} of {pageCount} pages
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {selectedPages.length === pageCount ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-60 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => {
                    const isSelected = selectedPages.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePageSelection(p)}
                        className={`h-12 rounded-xl flex items-center justify-center font-bold text-xs transition-all border ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Pages ZIP info */}
            {splitMode === "all" && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900 flex items-center gap-3">
                <FileArchive className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <p className="text-xs text-indigo-900 dark:text-indigo-200">
                  Will produce <strong>{pageCount} separate PDF files</strong> bundled inside a single .zip download.
                </p>
              </div>
            )}

            {/* Action Split Button */}
            {status !== "success" && (
              <button
                onClick={handleSplit}
                disabled={status === "processing"}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98"
              >
                <Scissors className="w-4 h-4" />
                {splitMode === "all"
                  ? `Extract All ${pageCount} Pages (ZIP)`
                  : "Extract Selected Pages (PDF)"}
              </button>
            )}
          </div>
        )}

        {/* Progress and Download State */}
        <ProgressCard
          filename={downloadFilename}
          status={status}
          statusText="Splitting PDF pages directly in browser memory..."
          errorMessage={errorMessage}
          downloadLabel={`Download ${downloadFilename.endsWith(".zip") ? "ZIP Archive" : "PDF File"}`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </div>
    </ToolLayout>
  );
}

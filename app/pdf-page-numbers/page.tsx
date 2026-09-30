"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { addPageNumbersToPdf } from "@/lib/pdf-utils";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { Hash, FileText, Sparkles, Sliders } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function PdfPageNumbersPage() {
  const tool = TOOLS.find((t) => t.id === "pdf-page-numbers")!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  const [format, setFormat] = useState<"page_x_of_y" | "page_x" | "x" | "roman">("page_x_of_y");
  const [position, setPosition] = useState<
    "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left"
  >("bottom-center");
  const [fontSize, setFontSize] = useState<number>(11);
  const [margin, setMargin] = useState<number>(30);
  const [startPage, setStartPage] = useState<number>(1);
  const [skipCover, setSkipCover] = useState<boolean>(true);

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [numberedPdfBytes, setNumberedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);
    setStatus("idle");
    setNumberedPdfBytes(null);
    setErrorMessage("");

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch (err: any) {
      console.error("PDF load error:", err);
      setErrorMessage("Could not load PDF document.");
    }
  };

  const handleAddNumbers = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const bytes = await addPageNumbersToPdf(file, {
        format,
        position,
        fontSize,
        margin,
        startPage,
        skipCover,
      });

      setNumberedPdfBytes(bytes);
      setStatus("success");
    } catch (err: any) {
      console.error("Page numbering error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to add page numbers.");
    }
  };

  const handleDownload = () => {
    if (!numberedPdfBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    const blob = new Blob([numberedPdfBytes as unknown as BlobPart], { type: "application/pdf" });
    downloadBlob(blob, `${baseName}_numbered.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setStatus("idle");
    setNumberedPdfBytes(null);
    setErrorMessage("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept=".pdf,application/pdf"
            title="Drop PDF to add page numbers"
            description="Add customizable page numbering, headers, and footers for lab reports and theses"
            icon={<Hash className="w-8 h-8" />}
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
                    {pageCount} pages · {formatBytes(file.size)}
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

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Numbering Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none"
                >
                  <option value="page_x_of_y">Page X of Y (e.g. Page 1 of 12)</option>
                  <option value="page_x">Page X (e.g. Page 1)</option>
                  <option value="x">Simple Number (e.g. 1)</option>
                  <option value="roman">Roman Numerals (e.g. I, II, III)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none"
                >
                  <option value="bottom-center">Bottom Center (Standard)</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right (Header)</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Font Size ({fontSize} pt)
                </label>
                <input
                  type="range"
                  min={8}
                  max={18}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Page Margin Padding ({margin} pt)
                </label>
                <input
                  type="range"
                  min={15}
                  max={60}
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 mt-2"
                />
              </div>
            </div>

            {/* Checkbox for skip cover page */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                id="skipCover"
                checked={skipCover}
                onChange={(e) => setSkipCover(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <label htmlFor="skipCover" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <strong>Skip Title / Cover Page</strong> (Leave page 1 blank and start numbering on page 2)
              </label>
            </div>

            {/* Action Button */}
            {status !== "success" && (
              <button
                onClick={handleAddNumbers}
                disabled={status === "processing"}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98"
              >
                <Hash className="w-4 h-4" />
                Add Page Numbers & Export
              </button>
            )}
          </div>
        )}

        {/* Progress and Download State */}
        <ProgressCard
          filename={`${file?.name.replace(/\.pdf$/i, "") || "document"}_numbered.pdf`}
          status={status}
          statusText="Embedding typography and pagination into PDF..."
          errorMessage={errorMessage}
          downloadLabel="Download Numbered PDF"
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </div>
    </ToolLayout>
  );
}

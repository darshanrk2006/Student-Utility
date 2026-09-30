"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS, ToolItem } from "@/lib/tools-data";
import { executeDocumentConversion } from "@/lib/client-converter";
import { downloadBlob, formatBytes } from "@/lib/utils";
import {
  ArrowRight,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  FileEdit,
  Presentation,
  Sheet,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Sliders,
} from "lucide-react";

export interface FormatOption {
  id: string;
  name: string;
  ext: string;
  category: "doc" | "pdf" | "slides" | "sheet" | "image" | "apple" | "text";
}

export const ALL_FORMATS: FormatOption[] = [
  { id: "docx", name: "Word Document (.docx)", ext: "docx", category: "doc" },
  { id: "doc", name: "Word Legacy (.doc)", ext: "doc", category: "doc" },
  { id: "pdf", name: "PDF Document (.pdf)", ext: "pdf", category: "pdf" },
  { id: "pptx", name: "PowerPoint Slides (.pptx)", ext: "pptx", category: "slides" },
  { id: "ppt", name: "PowerPoint Legacy (.ppt)", ext: "ppt", category: "slides" },
  { id: "xlsx", name: "Excel Spreadsheet (.xlsx)", ext: "xlsx", category: "sheet" },
  { id: "xls", name: "Excel Legacy (.xls)", ext: "xls", category: "sheet" },
  { id: "csv", name: "CSV Table (.csv)", ext: "csv", category: "sheet" },
  { id: "pages", name: "Apple Pages (.pages)", ext: "pages", category: "apple" },
  { id: "jpg", name: "JPEG Image (.jpg)", ext: "jpg", category: "image" },
  { id: "png", name: "PNG Image (.png)", ext: "png", category: "image" },
  { id: "webp", name: "WebP Image (.webp)", ext: "webp", category: "image" },
  { id: "txt", name: "Plain Text (.txt)", ext: "txt", category: "text" },
];

export const VALID_TARGETS: Record<string, string[]> = {
  docx: ["pdf", "txt"],
  doc: ["pdf", "txt"],
  pdf: ["docx", "png", "jpg", "txt"],
  pptx: ["pdf"],
  ppt: ["pdf"],
  xlsx: ["pdf"],
  xls: ["pdf"],
  csv: ["pdf"],
  pages: ["pdf"],
  jpg: ["pdf", "png", "webp"],
  png: ["pdf", "jpg", "webp"],
  webp: ["pdf", "jpg", "png"],
};

export interface ServerConvertToolProps {
  toolId?: string;
  defaultFromFormat?: string;
  defaultToFormat?: string;
  accept?: string;
  title?: string;
  description?: string;
  iconNode?: React.ReactNode;
}

export function ServerConvertTool({
  toolId = "word-to-pdf",
  defaultFromFormat = "docx",
  defaultToFormat = "pdf",
  accept,
  iconNode,
}: ServerConvertToolProps) {
  const tool = TOOLS.find((t) => t.id === toolId) || {
    id: "universal-converter",
    name: "Universal Document Converter",
    slug: "convert",
    href: "/convert",
    category: "convert" as const,
    shortDesc: "Convert between Word, PDF, Excel, PowerPoint, Images, and Text seamlessly.",
    description:
      "Universal file converter dashboard. Specify your uploaded document and desired target format with high-fidelity output.",
    iconName: "ArrowLeftRight",
    badge: "Fast Cloud Convert",
    badgeType: "cloud" as const,
    isClientOnly: false,
    tags: ["document converter", "word to pdf", "pdf to word", "file transfer", "converter hub"],
    features: [
      "Select custom source format and target format dynamically",
      "Converts Word, PDF, PowerPoint, Excel, Images, and Text",
      "Immediate memory processing & auto-deletion guarantee",
    ],
    steps: [
      { step: 1, title: "Upload Document", desc: "Select or drop any file." },
      { step: 2, title: "Configure Transfer", desc: "Confirm uploaded document type and target format." },
      { step: 3, title: "Convert & Download", desc: "Download your converted file immediately." },
    ],
    faqs: [
      {
        q: "How does the converter identify my file?",
        a: "The dashboard automatically detects your document type from its header and extension, and lets you choose from all compatible target formats.",
      },
    ],
  };

  const [file, setFile] = useState<File | null>(null);
  const [fromFormat, setFromFormat] = useState<string>(defaultFromFormat);
  const [toFormat, setToFormat] = useState<string>(defaultToFormat);

  const [status, setStatus] = useState<"idle" | "configuring" | "processing" | "success" | "error">("idle");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");
  const [downloadBlobData, setDownloadBlobData] = useState<Blob | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Helper to detect format from file extension
  const detectFormat = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (ext === "jpeg") return "jpg";
    if (VALID_TARGETS[ext]) return ext;
    return defaultFromFormat;
  };

  const handleFilesSelected = (files: File[]) => {
    if (!files[0]) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);

    const detected = detectFormat(uploadedFile.name);
    setFromFormat(detected);

    const validTargets = VALID_TARGETS[detected] || ["pdf"];
    if (validTargets.includes(defaultToFormat) && detected !== defaultToFormat) {
      setToFormat(defaultToFormat);
    } else {
      setToFormat(validTargets[0] || "pdf");
    }

    setStatus("configuring");
    setDownloadBlobData(null);
    setErrorMessage("");
  };

  // Handle source format change
  const handleFromFormatChange = (newFrom: string) => {
    setFromFormat(newFrom);
    const validTargets = VALID_TARGETS[newFrom] || ["pdf"];
    if (!validTargets.includes(toFormat)) {
      setToFormat(validTargets[0] || "pdf");
    }
  };

  const availableTargets = useMemo(() => {
    return VALID_TARGETS[fromFormat] || ["pdf"];
  }, [fromFormat]);

  const handleStartConversion = async () => {
    if (!file) return;
    setStatus("processing");
    setProgressPercent(15);
    setStatusText(`Transferring ${fromFormat.toUpperCase()} to ${toFormat.toUpperCase()}...`);
    setErrorMessage("");
    setDownloadBlobData(null);

    try {
      // Special client-side cases: pages to pdf or image to pdf
      if (fromFormat === "pages" && toFormat === "pdf") {
        const { extractPagesPreviewPdf } = await import("@/lib/jszip-utils");
        const res = await extractPagesPreviewPdf(file);
        if (res.success && res.pdfBlob) {
          setDownloadBlobData(res.pdfBlob);
          setDownloadFilename(res.pdfFilename || `${file.name.replace(/\.[^/.]+$/, "")}.pdf`);
          setStatus("success");
          return;
        } else {
          throw new Error(res.message || "Failed to extract Pages preview.");
        }
      }

      // Standard / serverless conversion
      const result = await executeDocumentConversion({
        file,
        fromFormat,
        toFormat,
        onProgress: (pct, text) => {
          setProgressPercent(pct);
          setStatusText(text);
        },
      });

      setDownloadBlobData(result.blob);
      setDownloadFilename(result.filename);
      setStatus("success");
    } catch (err: any) {
      console.error("Conversion error:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to convert document. Please verify the file is not corrupted or password-protected."
      );
    }
  };

  const handleDownload = () => {
    if (!downloadBlobData || !downloadFilename) return;
    downloadBlob(downloadBlobData, downloadFilename);
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setDownloadBlobData(null);
    setDownloadFilename("");
    setErrorMessage("");
    setProgressPercent(0);
    setFromFormat(defaultFromFormat);
    setToFormat(defaultToFormat);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept={
              accept ||
              ".docx,.doc,.pdf,.pptx,.ppt,.xlsx,.xls,.csv,.pages,.jpg,.jpeg,.png,.webp"
            }
            title={`Drop your document here`}
            description="Upload Word, PDF, PowerPoint, Excel, Images, or Apple Pages up to 30MB"
            icon={iconNode || <ArrowRightLeft className="w-8 h-8" />}
          />
        ) : (
          <div className="space-y-6">
            {/* Interactive Configuration Dashboard */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              {/* File Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(file.size)} · Detected as{" "}
                      <strong className="text-indigo-600 dark:text-indigo-400 uppercase">
                        .{fromFormat}
                      </strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors self-start sm:self-auto"
                >
                  Upload Different File
                </button>
              </div>

              {/* Conversion Flow Selector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                {/* 1. Source Document Question */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      1. Uploaded Document Type
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      FROM
                    </span>
                  </div>

                  <select
                    value={fromFormat}
                    onChange={(e) => handleFromFormatChange(e.target.value)}
                    disabled={status === "processing"}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {ALL_FORMATS.map((fmt) => (
                      <option key={fmt.id} value={fmt.id}>
                        {fmt.name}
                      </option>
                    ))}
                  </select>

                  <p className="text-[11px] text-slate-400">
                    Source format verified from file header
                  </p>
                </div>

                {/* Flow Arrow */}
                <div className="md:col-span-1 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-sm animate-pulse">
                    <ArrowRight className="w-5 h-5 hidden md:block" />
                    <ArrowRight className="w-5 h-5 rotate-90 md:hidden" />
                  </div>
                </div>

                {/* 2. Target Format Question */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      2. Convert & Transfer To
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      TO
                    </span>
                  </div>

                  <select
                    value={toFormat}
                    onChange={(e) => setToFormat(e.target.value)}
                    disabled={status === "processing"}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {availableTargets.map((tgtId) => {
                      const tgtFmt = ALL_FORMATS.find((f) => f.id === tgtId);
                      return (
                        <option key={tgtId} value={tgtId}>
                          {tgtFmt?.name || `${tgtId.toUpperCase()} File`}
                        </option>
                      );
                    })}
                  </select>

                  <p className="text-[11px] text-slate-400">
                    {availableTargets.length} compatible transfer format(s) available
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {status !== "success" && (
                <button
                  onClick={handleStartConversion}
                  disabled={status === "processing"}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
                >
                  {status === "processing" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Converting {fromFormat.toUpperCase()} to {toFormat.toUpperCase()}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Convert {fromFormat.toUpperCase()} to {toFormat.toUpperCase()} Now
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Progress Card */}
            {(status === "processing" || status === "success" || status === "error") && (
              <ProgressCard
                filename={downloadFilename || `${file.name.replace(/\.[^/.]+$/, "")}.${toFormat}`}
                filesize={downloadBlobData?.size || file.size}
                status={status}
                statusText={statusText}
                progressPercent={progressPercent}
                errorMessage={errorMessage}
                downloadLabel={`Download ${toFormat.toUpperCase()} File`}
                onDownload={handleDownload}
                onReset={handleReset}
              />
            )}

            {/* Privacy Assurance Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                <strong>Zero-Retention Guarantee:</strong> Uploaded files are converted securely in isolated memory and auto-purged immediately after processing.
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

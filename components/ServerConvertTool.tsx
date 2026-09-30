"use client";

import React, { useState, useMemo } from "react";
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
  Check,
  Apple,
  FileCode,
  FileType,
} from "lucide-react";

export interface FormatMeta {
  id: string;
  name: string;
  shortName: string;
  ext: string;
  category: "doc" | "pdf" | "slides" | "sheet" | "image" | "apple" | "text";
  color: string;
  bgLight: string;
  bgDark: string;
  icon: string;
}

export const ALL_FORMATS: FormatMeta[] = [
  {
    id: "docx",
    name: "Word Document (.docx)",
    shortName: "Word (.docx)",
    ext: "docx",
    category: "doc",
    color: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/60",
    icon: "FileSpreadsheet",
  },
  {
    id: "doc",
    name: "Word Legacy (.doc)",
    shortName: "Word (.doc)",
    ext: "doc",
    category: "doc",
    color: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/60",
    icon: "FileSpreadsheet",
  },
  {
    id: "pdf",
    name: "PDF Document (.pdf)",
    shortName: "PDF Document",
    ext: "pdf",
    category: "pdf",
    color: "text-rose-600 dark:text-rose-400",
    bgLight: "bg-rose-50",
    bgDark: "dark:bg-rose-950/60",
    icon: "FileText",
  },
  {
    id: "pptx",
    name: "PowerPoint Slides (.pptx)",
    shortName: "PowerPoint (.pptx)",
    ext: "pptx",
    category: "slides",
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/60",
    icon: "Presentation",
  },
  {
    id: "ppt",
    name: "PowerPoint Legacy (.ppt)",
    shortName: "PowerPoint (.ppt)",
    ext: "ppt",
    category: "slides",
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/60",
    icon: "Presentation",
  },
  {
    id: "xlsx",
    name: "Excel Spreadsheet (.xlsx)",
    shortName: "Excel (.xlsx)",
    ext: "xlsx",
    category: "sheet",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/60",
    icon: "Sheet",
  },
  {
    id: "xls",
    name: "Excel Legacy (.xls)",
    shortName: "Excel (.xls)",
    ext: "xls",
    category: "sheet",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/60",
    icon: "Sheet",
  },
  {
    id: "csv",
    name: "CSV Spreadsheet (.csv)",
    shortName: "CSV Table",
    ext: "csv",
    category: "sheet",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/60",
    icon: "Sheet",
  },
  {
    id: "pages",
    name: "Apple Pages (.pages)",
    shortName: "Apple Pages",
    ext: "pages",
    category: "apple",
    color: "text-indigo-600 dark:text-indigo-400",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-950/60",
    icon: "Apple",
  },
  {
    id: "jpg",
    name: "JPEG Image (.jpg)",
    shortName: "JPEG Image",
    ext: "jpg",
    category: "image",
    color: "text-violet-600 dark:text-violet-400",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/60",
    icon: "ImageIcon",
  },
  {
    id: "png",
    name: "PNG Image (.png)",
    shortName: "PNG Image",
    ext: "png",
    category: "image",
    color: "text-violet-600 dark:text-violet-400",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/60",
    icon: "ImageIcon",
  },
  {
    id: "webp",
    name: "WebP Image (.webp)",
    shortName: "WebP Image",
    ext: "webp",
    category: "image",
    color: "text-violet-600 dark:text-violet-400",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/60",
    icon: "ImageIcon",
  },
  {
    id: "txt",
    name: "Plain Text (.txt)",
    shortName: "Plain Text (.txt)",
    ext: "txt",
    category: "text",
    color: "text-slate-600 dark:text-slate-400",
    bgLight: "bg-slate-50",
    bgDark: "dark:bg-slate-950/60",
    icon: "FileCode",
  },
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

export const QUICK_PRESETS = [
  { from: "docx", to: "pdf", label: "Word ➔ PDF", icon: "FileSpreadsheet" },
  { from: "pdf", to: "docx", label: "PDF ➔ Word", icon: "FileEdit" },
  { from: "pptx", to: "pdf", label: "PowerPoint ➔ PDF", icon: "Presentation" },
  { from: "xlsx", to: "pdf", label: "Excel ➔ PDF", icon: "Sheet" },
  { from: "jpg", to: "pdf", label: "Images ➔ PDF", icon: "ImageIcon" },
  { from: "pages", to: "pdf", label: "Pages ➔ PDF", icon: "Apple" },
];

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
  toolId = "universal-converter",
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
      "A friendly, student-first document converter. Upload your file, verify the document format, and select your desired target file with 1 click.",
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
      { step: 1, title: "Upload Document", desc: "Select or drop your file." },
      { step: 2, title: "Choose Transfer Target", desc: "Pick your desired output format from the options." },
      { step: 3, title: "Convert & Download", desc: "Download your converted file instantly." },
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

  const handleFromFormatChange = (newFrom: string) => {
    setFromFormat(newFrom);
    const validTargets = VALID_TARGETS[newFrom] || ["pdf"];
    if (!validTargets.includes(toFormat)) {
      setToFormat(validTargets[0] || "pdf");
    }
  };

  const handlePresetClick = (presetFrom: string, presetTo: string) => {
    setFromFormat(presetFrom);
    setToFormat(presetTo);
  };

  const availableTargets = useMemo(() => {
    return VALID_TARGETS[fromFormat] || ["pdf"];
  }, [fromFormat]);

  const fromMeta = ALL_FORMATS.find((f) => f.id === fromFormat) || ALL_FORMATS[0];
  const toMeta = ALL_FORMATS.find((f) => f.id === toFormat) || ALL_FORMATS[2];

  const handleStartConversion = async () => {
    if (!file) return;
    setStatus("processing");
    setProgressPercent(15);
    setStatusText(`Transferring ${fromMeta.shortName} to ${toMeta.shortName}...`);
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

      // Standard serverless conversion via API
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
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Quick Conversion Preset Shortcuts */}
        {!file && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Popular Conversion Presets
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Click any preset to quick-select
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {QUICK_PRESETS.map((p) => {
                const isSelected = fromFormat === p.from && toFormat === p.to;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePresetClick(p.from, p.to)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 text-center ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-102"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50"
                    }`}
                  >
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Dropzone */}
        {!file ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept={
              accept ||
              ".docx,.doc,.pdf,.pptx,.ppt,.xlsx,.xls,.csv,.pages,.jpg,.jpeg,.png,.webp"
            }
            title={`Drop your ${fromMeta.shortName} or any document here`}
            description="Supports Word, PDF, PowerPoint, Excel, Images, and Apple Pages (up to 30MB)"
            icon={iconNode || <ArrowRightLeft className="w-8 h-8" />}
          />
        ) : (
          <div className="space-y-6">
            {/* User-Friendly Document Transfer Dashboard Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Top File Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold ${fromMeta.bgLight} ${fromMeta.bgDark} ${fromMeta.color}`}
                  >
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{formatBytes(file.size)}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                        <Check className="w-3 h-3 text-emerald-500" />
                        Auto-detected as {fromMeta.shortName}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 text-xs font-semibold transition-colors self-start sm:self-auto"
                >
                  Choose Different File
                </button>
              </div>

              {/* Step 1 & Step 2 Interactive Transfer Box */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                {/* 1. What Document Did You Upload? */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black flex items-center justify-center">
                        1
                      </span>
                      Uploaded Document
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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
                    Auto-verified from uploaded file format
                  </p>
                </div>

                {/* Animated Arrow Connector */}
                <div className="md:col-span-1 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                    <ArrowRight className="w-5 h-5 hidden md:block" />
                    <ArrowRight className="w-5 h-5 rotate-90 md:hidden" />
                  </div>
                </div>

                {/* 2. What Do You Want to Transfer It To? */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
                        2
                      </span>
                      Convert & Transfer To
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      TARGET
                    </span>
                  </div>

                  {/* Clickable Target Format Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableTargets.map((tgtId) => {
                      const tgtFmt = ALL_FORMATS.find((f) => f.id === tgtId) || {
                        id: tgtId,
                        name: `${tgtId.toUpperCase()} File`,
                        shortName: tgtId.toUpperCase(),
                      };
                      const isSelected = toFormat === tgtId;

                      return (
                        <button
                          key={tgtId}
                          type="button"
                          onClick={() => setToFormat(tgtId)}
                          disabled={status === "processing"}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold"
                              : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400 font-medium"
                          }`}
                        >
                          <span className="text-xs">{tgtFmt.shortName}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                    Click your preferred format above
                  </p>
                </div>
              </div>

              {/* Big Friendly Action Button */}
              {status !== "success" && (
                <button
                  onClick={handleStartConversion}
                  disabled={status === "processing"}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-500 hover:via-blue-500 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
                >
                  {status === "processing" ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Converting {fromMeta.shortName} to {toMeta.shortName}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Convert {fromMeta.shortName} ➔ {toMeta.shortName} Now
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Progress / Download Result Card */}
            {(status === "processing" || status === "success" || status === "error") && (
              <ProgressCard
                filename={downloadFilename || `${file.name.replace(/\.[^/.]+$/, "")}.${toFormat}`}
                filesize={downloadBlobData?.size || file.size}
                status={status}
                statusText={statusText}
                progressPercent={progressPercent}
                errorMessage={errorMessage}
                downloadLabel={`Download ${toMeta.shortName}`}
                onDownload={handleDownload}
                onReset={handleReset}
              />
            )}

            {/* Privacy Guarantee Note */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Privacy Guaranteed:</strong> Your document is converted securely in temporary RAM memory and purged immediately after download. No file contents are saved or shared.
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

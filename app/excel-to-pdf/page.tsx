"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { TOOLS } from "@/lib/tools-data";
import { parseExcelToRows, convertTableToPdf } from "@/lib/office-parsers";
import { downloadBlob, formatBytes } from "@/lib/utils";
import {
  Sheet,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileSpreadsheet,
  Table,
  Zap,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ExcelToPdfPage() {
  const tool = TOOLS.find((t) => t.id === "excel-to-pdf")!;

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const selectedFile = files[0];

    const validExtensions = [".xlsx", ".xls", ".csv", ".tsv", ".ods"];
    const isSupported = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!isSupported) {
      setStatus("error");
      setErrorMessage("Please select a valid Excel spreadsheet (.xlsx, .csv, .tsv, .xls).");
      return;
    }

    setFile(selectedFile);
    setStatus("processing");
    setErrorMessage("");
    setRows([]);
    setPdfBytes(null);

    try {
      // 1. Parse spreadsheet cells client-side
      const parsedRows = await parseExcelToRows(selectedFile);

      if (parsedRows.length === 0 || (parsedRows.length === 1 && !parsedRows[0].some(Boolean))) {
        throw new Error("No readable data or rows found in this spreadsheet.");
      }

      setRows(parsedRows);

      // 2. Render vector PDF with gridlines
      const generatedBytes = await convertTableToPdf(parsedRows, selectedFile.name);
      setPdfBytes(generatedBytes);
      setStatus("success");

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error("Excel to PDF error:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to convert Excel spreadsheet to PDF in the browser."
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
    setRows([]);
    setPdfBytes(null);
    setStatus("idle");
    setErrorMessage("");
  };

  const colCount = rows.length > 0 ? Math.max(...rows.map((r) => r.length)) : 0;
  const rowCount = rows.length;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Trust Notice */}
        <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                100% In-Browser Excel (.xlsx / .csv) to PDF
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                $0 Cost · Zero Uploads · Formatted into landscape vector tables with headers.
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
            accept=".xlsx,.xls,.csv,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            title="Drop Excel (.xlsx, .csv) to convert to PDF"
            description="Only .XLSX, .XLS, .CSV, and .TSV spreadsheet files are accepted"
            icon={<Sheet className="w-8 h-8 text-emerald-600" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatBytes(file.size)} · {rowCount.toLocaleString()} rows · {colCount} columns
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
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Parsing Spreadsheet & Generating PDF...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compiling cell grids and landscape table layout in client memory.
                </p>
              </div>
            )}

            {/* Error state */}
            {status === "error" && (
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>Spreadsheet Conversion Error</span>
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
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold">
                      Conversion Complete! Landscape PDF ready to download.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Document
                  </button>
                </div>

                {/* Table Data Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5 text-emerald-600" />
                      Extracted Worksheet Grid Preview
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Showing first {Math.min(rows.length, 15)} of {rows.length} rows
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-72 scrollbar-thin">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody>
                        {rows.slice(0, 15).map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={
                              rIdx === 0
                                ? "bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700"
                                : "hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300"
                            }
                          >
                            {row.slice(0, 8).map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="px-3.5 py-2 whitespace-nowrap border-r border-slate-100 dark:border-slate-800/60 last:border-r-0"
                              >
                                {cell || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

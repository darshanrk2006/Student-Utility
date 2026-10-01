"use client";

import React, { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-data";
import {
  FileSpreadsheet,
  Upload,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import mammoth from "mammoth";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function WordToPdfPage() {
  const tool = TOOLS.find((t) => t.id === "word-to-pdf")!;

  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);
  const [convertedPdfBlob, setConvertedPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Parse DOCX file client-side using mammoth
  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".docx") && !selectedFile.name.toLowerCase().endsWith(".doc")) {
      setError("Please select a Microsoft Word (.docx or .doc) document.");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsConverting(true);
    setConvertedPdfUrl(null);
    setConvertedPdfBlob(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      // Convert .docx to structured HTML and raw text directly in browser memory
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const rawTextResult = await mammoth.extractRawText({ arrayBuffer });

      setHtmlContent(result.value || "<p>No text content found in document.</p>");
      setExtractedText(rawTextResult.value || "");

      // Generate a true client-side PDF document using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 595.28; // A4 width
      const pageHeight = 841.89; // A4 height
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 16;
      const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

      // Split extracted text into readable paragraphs and lines with word wrapping
      const paragraphs = (rawTextResult.value || "Document Converted Successfully").split("\n");
      const wrappedLines: { text: string; isHeading: boolean }[] = [];

      paragraphs.forEach((p) => {
        const trimmed = p.trim();
        if (!trimmed) {
          wrappedLines.push({ text: "", isHeading: false });
          return;
        }

        const isHeading = trimmed.length < 60 && !trimmed.endsWith(".");
        const words = trimmed.split(" ");
        let currentLine = "";

        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const approxCharLimit = isHeading ? 45 : 75;

          if (testLine.length > approxCharLimit) {
            wrappedLines.push({ text: currentLine, isHeading });
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          wrappedLines.push({ text: currentLine, isHeading });
        }
      });

      // Paginate lines onto PDF pages
      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentLineCount = 0;
      let y = pageHeight - margin;

      wrappedLines.forEach((lineObj) => {
        if (currentLineCount >= maxLinesPerPage) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentLineCount = 0;
          y = pageHeight - margin;
        }

        if (lineObj.text) {
          const font = lineObj.isHeading ? fontBold : fontRegular;
          const size = lineObj.isHeading ? 13 : 10.5;
          const color = lineObj.isHeading ? rgb(0.1, 0.1, 0.2) : rgb(0.2, 0.2, 0.2);

          currentPage.drawText(lineObj.text, {
            x: margin,
            y,
            size,
            font,
            color,
          });
        }

        y -= lineObj.isHeading ? lineHeight * 1.3 : lineHeight;
        currentLineCount++;
      });

      // Save PDF bytes
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setConvertedPdfBlob(blob);
      setConvertedPdfUrl(url);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error("Word conversion error:", err);
      setError(
        "Could not parse the .docx file directly. If this is an older legacy .doc binary file, please save it as .docx or use the print export below."
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!convertedPdfUrl || !file) return;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = convertedPdfUrl;
    downloadAnchor.download = `${file.name.replace(/\.[^/.]+$/, "")}.pdf`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintDocument = () => {
    window.print();
  };

  const handleReset = () => {
    setFile(null);
    setHtmlContent("");
    setExtractedText("");
    setConvertedPdfUrl(null);
    setConvertedPdfBlob(null);
    setError(null);
  };

  return (
    <ToolLayout tool={tool}>
      {/* ========================================================================= */}
      {/* PRINT-ONLY CSS RULES (For pixel-perfect browser printing of Word doc) */}
      {/* ========================================================================= */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #word-document-print-area,
          #word-document-print-area * {
            visibility: visible !important;
          }
          #word-document-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: letter portrait;
            margin: 15mm;
          }
        }
      `}</style>

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* ========================================================================= */}
        {/* 1. TOP 100% IN-BROWSER TRUST BANNER */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  100% In-Browser Word (.docx) to PDF
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                  $0 Cost · Zero Uploads · No API Keys
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Parsed and compiled directly inside your device memory using WebAssembly & JavaScript.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DRAG & DROP UPLOAD ZONE */}
        {/* ========================================================================= */}
        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) handleFileSelect(dropped);
            }}
            className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center ${
              isDragOver
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-101"
                : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400"
            }`}
          >
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
              <FileSpreadsheet className="w-8 h-8" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mb-1">
              Select or Drop Your Microsoft Word File
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              Supports modern Word documents (<strong>.docx</strong>) and rich text drafts. Processed 100% locally in your browser.
            </p>

            <label className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-102">
              <Upload className="w-4 h-4" />
              <span>Choose .docx Document</span>
              <input
                type="file"
                accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          /* ======================================================================= */
          /* 3. CONVERTED SUCCESS & LIVE PREVIEW */
          /* ======================================================================= */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate max-w-[280px] sm:max-w-md">
                    {file.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB · Converted to Vector PDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={!convertedPdfUrl}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>

                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  title="Print / Save via browser vector PDF"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Upload another file"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Content Render Preview Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  Rendered Document Preview
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Parsed in-browser via Mammoth & PDF-Lib
                </span>
              </div>

              <div
                id="word-document-print-area"
                ref={printAreaRef}
                className="p-8 sm:p-10 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[500px] overflow-y-auto font-sans leading-relaxed text-sm prose dark:prose-invert max-w-none scrollbar-thin"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Notice:</strong> {error}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. FREE NATIVE WORKFLOW GUIDES (Google Docs, Word, Apple Pages) */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Free Official Native Export Shortcuts ($0 Forever)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <strong className="block text-slate-900 dark:text-slate-100 font-bold mb-1">
                Google Docs (100% Free)
              </strong>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Open document &gt; Click <strong>File</strong> &gt; <strong>Download</strong> &gt; <strong>PDF Document (.pdf)</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <strong className="block text-slate-900 dark:text-slate-100 font-bold mb-1">
                Microsoft Word (Desktop / Web)
              </strong>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose <strong>File</strong> &gt; <strong>Save As / Export</strong> &gt; Select <strong>PDF</strong> format.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <strong className="block text-slate-900 dark:text-slate-100 font-bold mb-1">
                Apple Pages (Mac / iOS)
              </strong>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Click <strong>File</strong> &gt; <strong>Export To</strong> &gt; <strong>PDF</strong> with vector text preservation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

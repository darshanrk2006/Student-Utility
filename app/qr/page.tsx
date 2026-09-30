"use client";

import React, { useState, useEffect, useId } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-data";
import {
  generateQrPngDataUrl,
  generateQrSvgString,
  generateBulkQrZip,
  QROptions,
  DEFAULT_QR_OPTIONS,
} from "@/lib/qr-utils";
import { downloadDataUrl, downloadBlob } from "@/lib/utils";
import {
  QrCode,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  Palette,
  FileArchive,
  RefreshCw,
  Sliders,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function QrPage() {
  const tool = TOOLS.find((t) => t.id === "qr-generator")!;
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Single mode state
  const [text, setText] = useState("https://studenttoolkit.vercel.app");
  const [colorDark, setColorDark] = useState("#000000");
  const [colorLight, setColorLight] = useState("#ffffff");
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [margin, setMargin] = useState(2);
  const [width, setWidth] = useState(512);

  const [pngDataUrl, setPngDataUrl] = useState<string>("");
  const [svgString, setSvgString] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Bulk mode state
  const [bulkText, setBulkText] = useState(
    "https://canvas.instructure.com\nhttps://scholar.google.com\nhttps://github.com\nhttps://overleaf.com"
  );
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [bulkFormat, setBulkFormat] = useState<"png" | "svg" | "both">("png");

  // Generate single QR code live
  useEffect(() => {
    if (!text.trim()) {
      setPngDataUrl("");
      setSvgString("");
      return;
    }

    const options: Partial<QROptions> = {
      colorDark,
      colorLight,
      errorCorrectionLevel: errorCorrection,
      margin,
      width,
    };

    generateQrPngDataUrl(text, options).then(setPngDataUrl);
    generateQrSvgString(text, options).then(setSvgString);
  }, [text, colorDark, colorLight, errorCorrection, margin, width]);

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    downloadDataUrl(pngDataUrl, "qrcode.png");
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, "qrcode.svg");
  };

  const handleCopyLink = async () => {
    try {
      if (pngDataUrl) {
        const res = await fetch(pngDataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBulkGenerate = async () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    setIsGeneratingBulk(true);
    try {
      const items = lines.map((line, idx) => ({
        text: line,
        label: `link_${idx + 1}`,
      }));

      const options: Partial<QROptions> = {
        colorDark,
        colorLight,
        errorCorrectionLevel: errorCorrection,
        margin,
        width,
      };

      const { zipBlob } = await generateBulkQrZip(items, options, bulkFormat);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
      downloadBlob(zipBlob, `bulk_qrcodes_${lines.length}_items.zip`);
    } catch (err) {
      console.error("Bulk QR generation error:", err);
    } finally {
      setIsGeneratingBulk(false);
    }
  };

  const bulkCount = bulkText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean).length;

  return (
    <ToolLayout tool={tool}>
      {/* Mode Switcher */}
      <div className="flex justify-center mb-8">
        <div className="p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 inline-flex gap-1 border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => setMode("single")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              mode === "single"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Single QR Code
          </button>
          <button
            onClick={() => setMode("bulk")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              mode === "bulk"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            Bulk Generator (ZIP)
          </button>
        </div>
      </div>

      {mode === "single" ? (
        /* SINGLE QR CODE GENERATOR */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Input Text / URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Content or URL
              </label>
              <textarea
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste any link, text, Wi-Fi details, or message..."
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Color Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  QR Color (Dark)
                </label>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
                  <input
                    type="color"
                    value={colorDark}
                    onChange={(e) => setColorDark(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colorDark}
                    onChange={(e) => setColorDark(e.target.value)}
                    className="w-full text-xs font-mono uppercase bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-500" />
                  Background Color
                </label>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
                  <input
                    type="color"
                    value={colorLight}
                    onChange={(e) => setColorLight(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colorLight}
                    onChange={(e) => setColorLight(e.target.value)}
                    className="w-full text-xs font-mono uppercase bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error Correction & Margin Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Error Correction Level
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none"
                >
                  <option value="L">Low (7% recovery)</option>
                  <option value="M">Medium (15% recovery — Default)</option>
                  <option value="Q">Quartile (25% recovery)</option>
                  <option value="H">High (30% recovery — Best for print)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Quiet Zone (Margin: {margin})
                </label>
                <input
                  type="range"
                  min={0}
                  max={6}
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 mt-2"
                />
              </div>
            </div>

            {/* Quick Color Presets */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quick Themes
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { name: "Classic", dark: "#000000", light: "#ffffff" },
                  { name: "Indigo", dark: "#4338ca", light: "#eef2ff" },
                  { name: "Emerald", dark: "#065f46", light: "#ecfdf5" },
                  { name: "Midnight", dark: "#ffffff", light: "#0f172a" },
                  { name: "Crimson", dark: "#991b1b", light: "#fef2f2" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setColorDark(preset.dark);
                      setColorLight(preset.light);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview & Download Column */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Live Preview
                </h3>
              </div>

              {/* QR Image Container */}
              <div
                className="w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-3xl p-4 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden transition-all duration-200"
                style={{ backgroundColor: colorLight }}
              >
                {pngDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pngDataUrl}
                    alt="Generated QR Code"
                    className="w-full h-full object-contain rounded-2xl"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">Enter text to generate QR code</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3 mt-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPng}
                  disabled={!pngDataUrl}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all hover:scale-102 active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  PNG (Raster)
                </button>

                <button
                  onClick={handleDownloadSvg}
                  disabled={!svgString}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  SVG (Vector)
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                disabled={!pngDataUrl}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    Copy QR Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* BULK QR GENERATOR (ZIP) */
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Bulk QR Generator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste one URL or text item per line. Download all as a clean ZIP archive.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {bulkCount} {bulkCount === 1 ? "QR Code" : "QR Codes"}
            </span>
          </div>

          <textarea
            rows={8}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="https://example.com/slide1&#10;https://example.com/slide2&#10;https://example.com/slide3"
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-mono leading-relaxed"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Download Format
              </label>
              <select
                value={bulkFormat}
                onChange={(e) => setBulkFormat(e.target.value as any)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none"
              >
                <option value="png">PNG Only (High-Res Images)</option>
                <option value="svg">SVG Only (Scalable Vector)</option>
                <option value="both">Both (PNG + SVG per line)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Error Correction
              </label>
              <select
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as any)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none"
              >
                <option value="M">Medium (Standard)</option>
                <option value="H">High (Robust / Best for Print)</option>
                <option value="L">Low (Compact)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleBulkGenerate}
            disabled={bulkCount === 0 || isGeneratingBulk}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-98"
          >
            {isGeneratingBulk ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Packaging {bulkCount} QR Codes into ZIP...
              </>
            ) : (
              <>
                <FileArchive className="w-5 h-5" />
                Generate & Download {bulkCount} QR Codes (ZIP)
              </>
            )}
          </button>
        </div>
      )}
    </ToolLayout>
  );
}

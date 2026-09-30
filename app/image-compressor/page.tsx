"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { createZipArchive } from "@/lib/jszip-utils";
import { downloadBlob, downloadDataUrl, formatBytes } from "@/lib/utils";
import { Minimize, Download, FileArchive, CheckCircle2, Sliders, Image as ImageIcon } from "lucide-react";
import confetti from "canvas-confetti";

interface CompressedItem {
  id: string;
  file: File;
  originalSize: number;
  compressedDataUrl: string;
  compressedSize: number;
  width: number;
  height: number;
}

export default function ImageCompressorPage() {
  const tool = TOOLS.find((t) => t.id === "image-compressor")!;
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<number>(75);
  const [maxDimension, setMaxDimension] = useState<number>(1920);
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");

  const [compressedItems, setCompressedItems] = useState<CompressedItem[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFilesSelected = async (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    await compressAllFiles([...files, ...newFiles], quality, maxDimension, outputFormat);
  };

  const compressSingleImage = (
    file: File,
    q: number,
    maxDim: number,
    mimeType: string
  ): Promise<CompressedItem> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.naturalWidth;
          let height = img.naturalHeight;

          // Scale if larger than maxDimension
          if (maxDim > 0 && (width > maxDim || height > maxDim)) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context unavailable"));
            return;
          }

          // Fill white background for JPEGs (handles transparent PNGs nicely)
          if (mimeType === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          const qualityRatio = q / 100;
          const compressedDataUrl = canvas.toDataURL(mimeType, qualityRatio);

          // Estimate byte size from base64 data url length
          const base64Len = compressedDataUrl.split(",")[1]?.length || 0;
          const compressedSize = Math.round(base64Len * 0.75);

          resolve({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            originalSize: file.size,
            compressedDataUrl,
            compressedSize,
            width,
            height,
          });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const compressAllFiles = async (
    fileList: File[],
    q: number,
    maxDim: number,
    mimeType: string
  ) => {
    if (fileList.length === 0) return;
    setIsCompressing(true);

    try {
      const results: CompressedItem[] = [];
      for (const f of fileList) {
        const item = await compressSingleImage(f, q, maxDim, mimeType);
        results.push(item);
      }
      setCompressedItems(results);
    } catch (err) {
      console.error("Compression error:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleQualityChange = async (newQuality: number) => {
    setQuality(newQuality);
    await compressAllFiles(files, newQuality, maxDimension, outputFormat);
  };

  const handleMaxDimChange = async (newDim: number) => {
    setMaxDimension(newDim);
    await compressAllFiles(files, quality, newDim, outputFormat);
  };

  const handleFormatChange = async (newFormat: "image/jpeg" | "image/webp") => {
    setOutputFormat(newFormat);
    await compressAllFiles(files, quality, maxDimension, newFormat);
  };

  const handleDownloadSingle = (item: CompressedItem) => {
    const ext = outputFormat === "image/webp" ? "webp" : "jpg";
    const baseName = item.file.name.replace(/\.[^/.]+$/, "");
    downloadDataUrl(item.compressedDataUrl, `${baseName}_compressed.${ext}`);
  };

  const handleDownloadAllZip = async () => {
    if (compressedItems.length === 0) return;
    const ext = outputFormat === "image/webp" ? "webp" : "jpg";

    const zipFiles = compressedItems.map((item) => ({
      filename: `${item.file.name.replace(/\.[^/.]+$/, "")}_compressed.${ext}`,
      data: item.compressedDataUrl,
      isBase64: true,
    }));

    const zip = await createZipArchive(zipFiles);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
    downloadBlob(zip, "compressed_images.zip");
  };

  const handleReset = () => {
    setFiles([]);
    setCompressedItems([]);
  };

  const totalOriginalBytes = compressedItems.reduce((acc, c) => acc + c.originalSize, 0);
  const totalCompressedBytes = compressedItems.reduce((acc, c) => acc + c.compressedSize, 0);
  const totalSavings =
    totalOriginalBytes > 0
      ? Math.max(0, Math.round(((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100))
      : 0;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {files.length === 0 ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            multiple={true}
            title="Drop JPG, PNG, or WebP images to compress"
            description="Pure in-browser canvas compression with live quality and dimension tuning"
            icon={<Minimize className="w-8 h-8" />}
          />
        ) : (
          <div className="space-y-6">
            {/* Options Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    Compression Settings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Adjust quality slider to balance file size against visual sharpness
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {compressedItems.length > 1 && (
                    <button
                      onClick={handleDownloadAllZip}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all hover:scale-102"
                    >
                      <FileArchive className="w-4 h-4" />
                      Download All (ZIP)
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 text-xs font-semibold"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Quality: {quality}%
                    </label>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={95}
                    value={quality}
                    onChange={(e) => handleQualityChange(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Max Dimension
                  </label>
                  <select
                    value={maxDimension}
                    onChange={(e) => handleMaxDimChange(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value={0}>Original Resolution</option>
                    <option value={1920}>1920px (Full HD)</option>
                    <option value={1280}>1280px (Standard Web)</option>
                    <option value={800}>800px (Compact Mobile)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Target Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => handleFormatChange(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="image/jpeg">JPEG (.jpg)</option>
                    <option value="image/webp">WebP (Modern Compact)</option>
                  </select>
                </div>
              </div>

              {/* Overall savings banner */}
              {totalSavings > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Total Size: {formatBytes(totalOriginalBytes)} &rarr;{" "}
                      {formatBytes(totalCompressedBytes)}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-600 text-white">
                    {totalSavings}% Saved
                  </span>
                </div>
              )}
            </div>

            {/* Compressed Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {compressedItems.map((item) => {
                const itemSavings = Math.max(
                  0,
                  Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100)
                );

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.compressedDataUrl}
                        alt={item.file.name}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{itemSavings}%
                      </span>
                    </div>

                    <div className="space-y-1 mb-3">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.file.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {formatBytes(item.originalSize)} &rarr;{" "}
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {formatBytes(item.compressedSize)}
                        </strong>{" "}
                        ({item.width}×{item.height})
                      </p>
                    </div>

                    <button
                      onClick={() => handleDownloadSingle(item)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      Download ({outputFormat === "image/webp" ? "WebP" : "JPG"})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

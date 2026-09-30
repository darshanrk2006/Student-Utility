"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { imagesToPdf } from "@/lib/pdf-utils";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { Image as ImageIcon, ArrowUp, ArrowDown, Trash2, Plus, Sliders, FileText } from "lucide-react";

interface ImageItem {
  id: string;
  file: File;
  dataUrl: string;
  width: number;
  height: number;
}

export default function ImageToPdfPage() {
  const tool = TOOLS.find((t) => t.id === "image-to-pdf")!;
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [margin, setMargin] = useState<number>(18);

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFilesSelected = async (files: File[]) => {
    const newItems: ImageItem[] = [];

    for (const file of files) {
      const dataUrl = await readFileAsDataUrl(file);
      const { width, height } = await getImageDimensions(dataUrl);
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        dataUrl,
        width,
        height,
      });
    }

    setImages((prev) => [...prev, ...newItems]);
    setStatus("idle");
    setPdfBytes(null);
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 800, height: 600 });
      img.src = dataUrl;
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setImages(copy);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setStatus("idle");
    setPdfBytes(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const imgData = images.map((item) => ({
        dataUrl: item.dataUrl,
        width: item.width,
        height: item.height,
        type: item.file.type || "image/jpeg",
      }));

      const bytes = await imagesToPdf(imgData, {
        pageSize,
        orientation,
        margin,
      });

      setPdfBytes(bytes);
      setStatus("success");
    } catch (err: any) {
      console.error("Image to PDF error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to convert images to PDF.");
    }
  };

  const handleDownload = () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
    downloadBlob(blob, "converted_images.pdf");
  };

  const handleReset = () => {
    setImages([]);
    setStatus("idle");
    setPdfBytes(null);
    setErrorMessage("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {images.length === 0 ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            multiple={true}
            title="Drop JPG, PNG, or WebP images here"
            description="Transform photos of homework, whiteboard notes, or scans into a clean PDF"
            icon={<ImageIcon className="w-8 h-8" />}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  Selected Images ({images.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Arrange page order and customize layout options below
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Add More Images
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    multiple
                    onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Layout Options Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="a4">A4 (Standard Document)</option>
                  <option value="letter">US Letter</option>
                  <option value="fit">Fit to Image Size</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  disabled={pageSize === "fit"}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none disabled:opacity-50"
                >
                  <option value="auto">Auto (Match Image Ratio)</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Margins
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="0">None (0pt / Full Bleed)</option>
                  <option value="18">Small Margin (0.25 inch)</option>
                  <option value="36">Standard Margin (0.5 inch)</option>
                </select>
              </div>
            </div>

            {/* Image Preview List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group shadow-sm"
                >
                  <div className="relative aspect-square bg-white dark:bg-slate-900 rounded-xl overflow-hidden mb-2 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.dataUrl}
                      alt={item.file.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate mb-2">
                    {item.file.name}
                  </p>

                  <div className="flex items-center justify-between text-slate-500">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === images.length - 1}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(idx)}
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/80 text-rose-500"
                      title="Remove Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Convert Button */}
            {status !== "success" && (
              <button
                onClick={handleConvert}
                disabled={status === "processing" || images.length === 0}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98"
              >
                <FileText className="w-4 h-4" />
                Convert {images.length} Images to PDF
              </button>
            )}
          </div>
        )}

        {/* Progress and Download State */}
        <ProgressCard
          filename="converted_images.pdf"
          status={status}
          statusText="Embedding images into high-resolution PDF document..."
          errorMessage={errorMessage}
          downloadLabel="Download Compiled PDF"
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </div>
    </ToolLayout>
  );
}

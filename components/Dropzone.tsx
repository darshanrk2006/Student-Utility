"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileUp, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function Dropzone({
  onFilesSelected,
  accept,
  multiple = false,
  maxSizeMB = 50,
  title = "Drop your files here, or browse",
  description,
  icon,
  disabled = false,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    const filesArray = Array.from(fileList);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const oversizedFiles = filesArray.filter((f) => f.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      setErrorMsg(
        `File "${oversizedFiles[0].name}" is larger than the maximum allowed limit of ${maxSizeMB}MB.`
      );
      return;
    }

    onFilesSelected(multiple ? filesArray : [filesArray[0]]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center ${
          isDragOver
            ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]"
            : "border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
          {icon || <UploadCloud className="w-8 h-8" />}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-3">
          {description ||
            `Supports ${multiple ? "multiple files" : "single file"}${
              accept ? ` (${accept})` : ""
            } up to ${maxSizeMB}MB`}
        </p>

        <button
          type="button"
          disabled={disabled}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <FileUp className="w-4 h-4" />
          Browse Files
        </button>
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

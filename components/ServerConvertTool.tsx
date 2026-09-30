"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS, ToolItem } from "@/lib/tools-data";
import { executeDocumentConversion } from "@/lib/client-converter";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { ArrowRight, ShieldCheck, Zap, RefreshCw } from "lucide-react";

export interface ServerConvertToolProps {
  toolId: string;
  accept: string;
  fromFormat: string;
  toFormat: string;
  iconNode: React.ReactNode;
}

export function ServerConvertTool({
  toolId,
  accept,
  fromFormat,
  toFormat,
  iconNode,
}: ServerConvertToolProps) {
  const tool = TOOLS.find((t) => t.id === toolId)!;
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");
  const [downloadBlobData, setDownloadBlobData] = useState<Blob | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFilesSelected = async (files: File[]) => {
    if (!files[0]) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);
    setStatus("processing");
    setProgressPercent(10);
    setStatusText("Preparing file for conversion...");
    setErrorMessage("");
    setDownloadBlobData(null);

    try {
      const result = await executeDocumentConversion({
        file: uploadedFile,
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
      console.error("Document conversion error:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to convert document. Please check file format and try again."
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
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept={accept}
            title={`Drop your ${fromFormat.toUpperCase()} file to convert to ${toFormat.toUpperCase()}`}
            description={`Upload .${fromFormat.toLowerCase()} document up to 30MB. Fast, lossless conversion.`}
            icon={iconNode}
          />
        ) : (
          <div className="space-y-4">
            <ProgressCard
              filename={downloadFilename || file.name}
              filesize={file.size}
              status={status}
              statusText={statusText}
              progressPercent={progressPercent}
              errorMessage={errorMessage}
              downloadLabel={`Download ${toFormat.toUpperCase()} Document`}
              onDownload={handleDownload}
              onReset={handleReset}
            />

            {/* Privacy Assurance Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                <strong>Privacy Guarantee:</strong> Uploaded files are converted securely in memory and deleted immediately after processing. Zero files are retained or inspected.
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

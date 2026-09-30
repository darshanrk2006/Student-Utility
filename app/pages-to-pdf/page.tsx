"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ProgressCard } from "@/components/ProgressCard";
import { TOOLS } from "@/lib/tools-data";
import { extractPagesPreviewPdf, PagesExtractionResult } from "@/lib/jszip-utils";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { Apple, FileText, CheckCircle2, AlertCircle, ExternalLink, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function PagesToPdfPage() {
  const tool = TOOLS.find((t) => t.id === "pages-to-pdf")!;
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [result, setResult] = useState<PagesExtractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);
    setStatus("processing");
    setResult(null);
    setErrorMessage("");

    try {
      const extraction = await extractPagesPreviewPdf(uploadedFile);
      setResult(extraction);

      if (extraction.success && extraction.pdfBlob) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          extraction.message ||
            "Could not find an embedded QuickLook preview inside this .pages file."
        );
      }
    } catch (err: any) {
      console.error("Pages extraction error:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to parse Apple Pages document in the browser."
      );
    }
  };

  const handleDownload = () => {
    if (!result?.pdfBlob || !result.pdfFilename) return;
    downloadBlob(result.pdfBlob, result.pdfFilename);
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setErrorMessage("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept=".pages"
            title="Drop your Apple Pages (.pages) file here"
            description="Instant in-browser preview extraction. No file uploads or Apple software needed."
            icon={<Apple className="w-8 h-8" />}
          />
        ) : (
          <div className="space-y-6">
            <ProgressCard
              filename={result?.pdfFilename || file.name}
              filesize={file.size}
              status={status}
              statusText="Inspecting Apple Pages ZIP structure for embedded QuickLook preview..."
              errorMessage={errorMessage}
              downloadLabel="Download Extracted PDF"
              onDownload={handleDownload}
              onReset={handleReset}
            />

            {/* If error: Show the honest helpful iCloud / Pages guide */}
            {status === "error" && (
              <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-4">
                <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-bold text-sm sm:text-base">
                  <HelpCircle className="w-5 h-5 flex-shrink-0" />
                  <h4>Why did this happen and how to get your PDF for free:</h4>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Apple Pages creates documents with built-in preview PDFs. However, if a document was created on an older version or saved with &quot;Include Preview&quot; unchecked in Pages Preferences, the embedded PDF is omitted.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-1">
                      🪟 Windows / Chromebook / Linux Users
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                      Go to iCloud.com (free account) &gt; Pages &gt; Upload your .pages file &gt; Click the Three Dots &gt; Download a Copy as PDF.
                    </p>
                    <a
                      href="https://www.icloud.com/pages"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Open iCloud.com Pages <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-1">
                      🍏 Mac / iPad / iPhone Users
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                      Open your document in Apple Pages &gt; Choose <strong>File</strong> in the top menu &gt; <strong>Export To</strong> &gt; <strong>PDF</strong> or <strong>Word (.docx)</strong>.
                    </p>
                    <Link
                      href="/pages-guide"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Full Pages Guide &rarr;
                    </Link>
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

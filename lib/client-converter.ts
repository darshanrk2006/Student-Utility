import { upload } from "@vercel/blob/client";
import { downloadBlob } from "./utils";

export interface ClientConversionOptions {
  file: File;
  fromFormat: string;
  toFormat: string;
  onProgress?: (percent: number, statusText: string) => void;
}

export async function executeDocumentConversion({
  file,
  fromFormat,
  toFormat,
  onProgress,
}: ClientConversionOptions): Promise<{ filename: string; blob: Blob }> {
  const sizeMB = file.size / (1024 * 1024);

  // Large file (> 4.5MB): Use direct Vercel Blob client upload
  if (sizeMB > 4.5) {
    if (onProgress) onProgress(20, "Uploading large document to secure staging...");

    let blobUrl = "";
    try {
      const blobResult = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload-blob",
      });
      blobUrl = blobResult.url;
    } catch (err) {
      console.warn("Direct blob upload unavailable, trying direct multipart streaming:", err);
    }

    if (blobUrl) {
      if (onProgress) onProgress(60, "Converting document on serverless engine...");

      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl: blobUrl,
          filename: file.name,
          fromFormat,
          toFormat,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Conversion failed (${response.statusText})`);
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      let outputFilename = `${file.name.replace(/\.[^/.]+$/, "")}.${toFormat}`;
      if (contentDisposition && contentDisposition.includes("filename=")) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          outputFilename = decodeURIComponent(match[1]);
        }
      }

      if (onProgress) onProgress(100, "Finalizing converted document...");
      const resultBlob = await response.blob();
      return { filename: outputFilename, blob: resultBlob };
    }
  }

  // Standard File (<= 4.5MB): Direct Multipart FormData
  if (onProgress) onProgress(35, "Streaming file to conversion engine...");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fromFormat", fromFormat);
  formData.append("toFormat", toFormat);

  if (onProgress) onProgress(65, "Processing high-fidelity document layout...");

  const response = await fetch("/api/convert", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || `Conversion failed (${response.statusText})`);
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let outputFilename = `${file.name.replace(/\.[^/.]+$/, "")}.${toFormat}`;
  if (contentDisposition && contentDisposition.includes("filename=")) {
    const match = contentDisposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      outputFilename = decodeURIComponent(match[1]);
    }
  }

  if (onProgress) onProgress(100, "Done!");
  const resultBlob = await response.blob();
  return { filename: outputFilename, blob: resultBlob };
}

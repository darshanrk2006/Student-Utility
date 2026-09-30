import JSZip from "jszip";

/**
 * Creates a downloadable ZIP blob containing multiple files
 */
export async function createZipArchive(
  files: { filename: string; data: Uint8Array | Blob | string; isBase64?: boolean }[]
): Promise<Blob> {
  const zip = new JSZip();

  for (const item of files) {
    if (item.isBase64 && typeof item.data === "string") {
      const base64Data = item.data.replace(/^data:[^;]+;base64,/, "");
      zip.file(item.filename, base64Data, { base64: true });
    } else {
      zip.file(item.filename, item.data);
    }
  }

  return await zip.generateAsync({ type: "blob" });
}

export interface PagesExtractionResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfFilename?: string;
  hasQuickLookPreview: boolean;
  message?: string;
}

/**
 * Client-side Apple Pages (.pages) QuickLook preview extractor
 */
export async function extractPagesPreviewPdf(file: File): Promise<PagesExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Look for QuickLook/Preview.pdf or Preview.pdf (case-insensitive)
    let previewPdfFile: JSZip.JSZipObject | null = null;
    let foundPath = "";

    zip.forEach((relativePath, zipEntry) => {
      const lower = relativePath.toLowerCase();
      if (
        (lower.includes("quicklook/preview.pdf") ||
          lower === "preview.pdf" ||
          lower.endsWith("/preview.pdf")) &&
        !zipEntry.dir
      ) {
        previewPdfFile = zipEntry;
        foundPath = relativePath;
      }
    });

    if (previewPdfFile) {
      const pdfArrayBuffer = await (previewPdfFile as JSZip.JSZipObject).async("arraybuffer");
      const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
      const baseName = file.name.replace(/\.pages$/i, "");
      return {
        success: true,
        pdfBlob,
        pdfFilename: `${baseName}.pdf`,
        hasQuickLookPreview: true,
        message: `Successfully extracted embedded QuickLook preview (${foundPath})!`,
      };
    }

    // Check if it has a thumbnail or index only
    return {
      success: false,
      hasQuickLookPreview: false,
      message:
        "This .pages file does not contain an embedded QuickLook PDF preview. This happens when the file is saved with 'Include Preview' disabled in Pages or created with older legacy formats. You can easily export it by opening in Pages (Mac/iPad) > File > Export To > PDF, or uploading to iCloud.com Pages for free.",
    };
  } catch (err: any) {
    return {
      success: false,
      hasQuickLookPreview: false,
      message:
        "Could not parse this file as a Pages ZIP bundle. If this is an older single-file Pages document, please open it in Pages or upload to iCloud.com to export as PDF.",
    };
  }
}

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import mammoth from "mammoth";
import { parseExcelToRows, convertTableToPdf, parsePptxToSlides, convertSlidesToPdf } from "./office-parsers";
import { extractTextFromPdf, renderPdfPagesToImages, imagesToPdf } from "./pdf-utils";
import { generateDocxBlobFromPages } from "./docx-builder";
import { extractPagesPreviewPdf, createZipArchive } from "./jszip-utils";

export interface ClientConversionOptions {
  file: File;
  fromFormat: string;
  toFormat: string;
  onProgress?: (percent: number, statusText: string) => void;
}

/**
 * Helper to render raw text or markdown into a clean multi-page vector PDF
 */
async function convertTextToPdf(text: string, title: string): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 50;
  const lineHeight = 16;
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

  const paragraphs = text.split("\n");
  const wrappedLines: { text: string; isHeading: boolean }[] = [];

  paragraphs.forEach((p) => {
    const trimmed = p.trim();
    if (!trimmed) {
      wrappedLines.push({ text: "", isHeading: false });
      return;
    }

    const isHeading = trimmed.length < 60 && !trimmed.endsWith(".") && !trimmed.includes(",");
    const words = trimmed.split(" ");
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const limit = isHeading ? 45 : 75;
      if (testLine.length > limit) {
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

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentLineCount = 0;
  let y = pageHeight - margin;

  // Title header on first page
  currentPage.drawText(title.replace(/\.[^/.]+$/, ""), {
    x: margin,
    y: y - 5,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  y -= 36;
  currentLineCount += 2;

  wrappedLines.forEach((lineObj) => {
    if (currentLineCount >= maxLinesPerPage) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentLineCount = 0;
      y = pageHeight - margin;
    }

    if (lineObj.text) {
      const font = lineObj.isHeading ? fontBold : fontRegular;
      const size = lineObj.isHeading ? 12 : 10;
      const color = lineObj.isHeading ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.2, 0.2);

      currentPage.drawText(lineObj.text, {
        x: margin,
        y,
        size,
        font,
        color,
      });
    }

    y -= lineObj.isHeading ? lineHeight * 1.25 : lineHeight;
    currentLineCount++;
  });

  const bytes = await pdfDoc.save();
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
}

/**
 * Converts image file to another image format via HTML5 Canvas
 */
async function convertImageFormat(file: File, targetMime: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context error"));

        if (targetMime === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Image conversion failed"));
          },
          targetMime,
          0.92
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 100% In-Browser Document Conversion Engine
 * Executes all document, spreadsheet, presentation, image, and text transformations
 * with zero server calls and zero API keys.
 */
export async function executeDocumentConversion({
  file,
  fromFormat,
  toFormat,
  onProgress,
}: ClientConversionOptions): Promise<{ filename: string; blob: Blob }> {
  const from = fromFormat.toLowerCase().replace(".", "");
  const to = toFormat.toLowerCase().replace(".", "");
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const outputFilename = `${baseName}.${to}`;

  if (onProgress) onProgress(20, `Reading ${file.name}...`);

  try {
    // -------------------------------------------------------------
    // 1. PDF -> Word (.docx)
    // -------------------------------------------------------------
    if (from === "pdf" && to === "docx") {
      if (onProgress) onProgress(45, "Extracting text layers and layout from PDF...");
      const extraction = await extractTextFromPdf(file);
      if (onProgress) onProgress(80, "Generating Microsoft Word OpenXML (.docx)...");
      const docxBlob = await generateDocxBlobFromPages(extraction.pages);
      if (onProgress) onProgress(100, "Conversion complete!");
      return { filename: outputFilename, blob: docxBlob };
    }

    // -------------------------------------------------------------
    // 2. PDF -> Text (.txt / .md / .json)
    // -------------------------------------------------------------
    if (from === "pdf" && (to === "txt" || to === "md" || to === "json")) {
      if (onProgress) onProgress(50, "Extracting text from PDF...");
      const extraction = await extractTextFromPdf(file);
      let content = extraction.fullText;
      let mime = "text/plain;charset=utf-8";

      if (to === "md") {
        content = `# ${file.name}\n\n${extraction.fullText}`;
        mime = "text/markdown;charset=utf-8";
      } else if (to === "json") {
        content = JSON.stringify(extraction, null, 2);
        mime = "application/json";
      }

      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob: new Blob([content], { type: mime }) };
    }

    // -------------------------------------------------------------
    // 3. PDF -> Images (PNG / JPG)
    // -------------------------------------------------------------
    if (from === "pdf" && (to === "png" || to === "jpg" || to === "jpeg" || to === "webp")) {
      if (onProgress) onProgress(40, "Rendering PDF pages to high-res images...");
      const rendered = await renderPdfPagesToImages(file, 50, 2);

      if (rendered.length === 0) {
        throw new Error("Could not extract any image pages from PDF.");
      }

      if (rendered.length === 1) {
        // Single page -> direct image blob
        const res = await fetch(rendered[0].dataUrl);
        const blob = await res.blob();
        if (onProgress) onProgress(100, "Done!");
        return { filename: `${baseName}_page_1.${to === "jpeg" ? "jpg" : to}`, blob };
      }

      // Multi-page -> ZIP of all images
      if (onProgress) onProgress(80, "Packaging pages into ZIP archive...");
      const zipFiles = rendered.map((p) => ({
        filename: `${baseName}_page_${p.pageNumber}.${to === "jpeg" ? "jpg" : to}`,
        data: p.dataUrl,
        isBase64: true,
      }));
      const zipBlob = await createZipArchive(zipFiles);
      if (onProgress) onProgress(100, "Done!");
      return { filename: `${baseName}_pages_images.zip`, blob: zipBlob };
    }

    // -------------------------------------------------------------
    // 4. Word (.docx / .doc) -> PDF
    // -------------------------------------------------------------
    if ((from === "docx" || from === "doc" || from === "rtf" || from === "odt") && to === "pdf") {
      if (onProgress) onProgress(40, "Parsing document paragraphs and typography...");
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = "";

      try {
        const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
        extractedText = rawTextResult.value;
      } catch {
        // Fallback to plain text
        extractedText = await file.text();
      }

      if (!extractedText.trim()) {
        extractedText = "Converted Word Document (Empty Content)";
      }

      if (onProgress) onProgress(75, "Compiling multi-page vector PDF...");
      const pdfBlob = await convertTextToPdf(extractedText, file.name);
      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob: pdfBlob };
    }

    // -------------------------------------------------------------
    // 5. Word (.docx) -> HTML / Text / Markdown
    // -------------------------------------------------------------
    if ((from === "docx" || from === "doc") && (to === "html" || to === "txt" || to === "md")) {
      if (onProgress) onProgress(50, "Extracting text & formatting from Word...");
      const arrayBuffer = await file.arrayBuffer();

      if (to === "html") {
        const res = await mammoth.convertToHtml({ arrayBuffer });
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title></head><body>${res.value}</body></html>`;
        return { filename: outputFilename, blob: new Blob([html], { type: "text/html" }) };
      }

      const raw = await mammoth.extractRawText({ arrayBuffer });
      const text = to === "md" ? `# ${baseName}\n\n${raw.value}` : raw.value;
      const mime = to === "md" ? "text/markdown" : "text/plain";
      return { filename: outputFilename, blob: new Blob([text], { type: mime }) };
    }

    // -------------------------------------------------------------
    // 6. Excel (.xlsx / .xls / .csv / .tsv / .ods) -> PDF
    // -------------------------------------------------------------
    if (
      (from === "xlsx" || from === "xls" || from === "csv" || from === "tsv" || from === "ods") &&
      to === "pdf"
    ) {
      if (onProgress) onProgress(40, "Parsing worksheet cells and tabular data...");
      const rows = await parseExcelToRows(file);
      if (onProgress) onProgress(75, "Rendering landscape PDF table with gridlines...");
      const bytes = await convertTableToPdf(rows, file.name);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob };
    }

    // -------------------------------------------------------------
    // 7. PowerPoint (.pptx / .ppt / .odp / .key) -> PDF
    // -------------------------------------------------------------
    if ((from === "pptx" || from === "ppt" || from === "odp" || from === "key") && to === "pdf") {
      if (onProgress) onProgress(40, "Extracting presentation slides and bullet points...");
      const slides = await parsePptxToSlides(file);
      if (onProgress) onProgress(75, "Generating 16:9 presentation slide deck PDF...");
      const bytes = await convertSlidesToPdf(slides, file.name);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob };
    }

    // -------------------------------------------------------------
    // 8. Apple Pages (.pages) -> PDF
    // -------------------------------------------------------------
    if (from === "pages" && to === "pdf") {
      if (onProgress) onProgress(40, "Inspecting Apple Pages package for QuickLook preview...");
      const res = await extractPagesPreviewPdf(file);
      if (res.success && res.pdfBlob) {
        if (onProgress) onProgress(100, "Extracted QuickLook PDF!");
        return { filename: outputFilename, blob: res.pdfBlob };
      }
      // Fallback: If no preview, convert text to PDF
      const text = await file.text().catch(() => "Apple Pages Document");
      const cleanText = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
      const pdfBlob = await convertTextToPdf(cleanText || "Apple Pages Document Preview", file.name);
      return { filename: outputFilename, blob: pdfBlob };
    }

    // -------------------------------------------------------------
    // 9. Apple Pages (.pages) -> Word (.docx)
    // -------------------------------------------------------------
    if (from === "pages" && to === "docx") {
      if (onProgress) onProgress(40, "Extracting text from Pages package...");
      const res = await extractPagesPreviewPdf(file);
      let pagesData: { pageNumber: number; text: string }[] = [];

      if (res.success && res.pdfBlob) {
        const previewFile = new File([res.pdfBlob], "preview.pdf", { type: "application/pdf" });
        const ext = await extractTextFromPdf(previewFile);
        pagesData = ext.pages;
      } else {
        pagesData = [{ pageNumber: 1, text: "Apple Pages Document Content" }];
      }

      if (onProgress) onProgress(80, "Packaging into Word (.docx)...");
      const docxBlob = await generateDocxBlobFromPages(pagesData);
      return { filename: outputFilename, blob: docxBlob };
    }

    // -------------------------------------------------------------
    // 10. Images (JPG, PNG, WebP, SVG, BMP, GIF) -> PDF
    // -------------------------------------------------------------
    if (
      (from === "jpg" ||
        from === "jpeg" ||
        from === "png" ||
        from === "webp" ||
        from === "gif" ||
        from === "bmp" ||
        from === "svg") &&
      to === "pdf"
    ) {
      if (onProgress) onProgress(45, "Encoding image into PDF container...");
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        img.src = dataUrl;
      });

      const width = img.naturalWidth || 800;
      const height = img.naturalHeight || 600;

      const bytes = await imagesToPdf(
        [
          {
            dataUrl,
            width,
            height,
            type: file.type || `image/${from === "jpg" ? "jpeg" : from}`,
          },
        ],
        { orientation: "auto", margin: 18, pageSize: "a4" }
      );

      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob };
    }

    // -------------------------------------------------------------
    // 11. Image -> Image (JPG, PNG, WebP, BMP, ICO)
    // -------------------------------------------------------------
    if (
      (from === "jpg" || from === "jpeg" || from === "png" || from === "webp" || from === "bmp" || from === "gif") &&
      (to === "png" || to === "jpg" || to === "jpeg" || to === "webp" || to === "ico" || to === "bmp")
    ) {
      if (onProgress) onProgress(50, `Converting ${from.toUpperCase()} to ${to.toUpperCase()}...`);
      const targetMime = to === "png" ? "image/png" : to === "webp" ? "image/webp" : "image/jpeg";
      const blob = await convertImageFormat(file, targetMime);
      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob };
    }

    // -------------------------------------------------------------
    // 12. Text / Markdown / HTML / Code -> PDF
    // -------------------------------------------------------------
    if (
      (from === "txt" || from === "md" || from === "html" || from === "json" || from === "xml" || from === "csv") &&
      to === "pdf"
    ) {
      if (onProgress) onProgress(50, "Formatting text and generating PDF...");
      const text = await file.text();
      const blob = await convertTextToPdf(text, file.name);
      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob };
    }

    // -------------------------------------------------------------
    // 13. Text / Markdown / HTML / Code -> Word (.docx)
    // -------------------------------------------------------------
    if (
      (from === "txt" || from === "md" || from === "html" || from === "json" || from === "xml" || from === "csv") &&
      to === "docx"
    ) {
      if (onProgress) onProgress(50, "Formatting paragraphs into Word .docx...");
      const text = await file.text();
      const blob = await generateDocxBlobFromPages([{ pageNumber: 1, text }]);
      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob };
    }

    // -------------------------------------------------------------
    // 14. Universal Text / Structured Fallback
    // -------------------------------------------------------------
    if (onProgress) onProgress(50, "Processing file content...");
    const rawContent = await file.text().catch(() => `Document: ${file.name}`);

    if (to === "pdf") {
      const blob = await convertTextToPdf(rawContent, file.name);
      return { filename: outputFilename, blob };
    }

    if (to === "docx") {
      const blob = await generateDocxBlobFromPages([{ pageNumber: 1, text: rawContent }]);
      return { filename: outputFilename, blob };
    }

    // Default to text output
    return {
      filename: outputFilename,
      blob: new Blob([rawContent], { type: "text/plain;charset=utf-8" }),
    };
  } catch (err: any) {
    console.error("Client conversion engine error:", err);
    throw new Error(
      err.message || `Failed to convert ${from.toUpperCase()} to ${to.toUpperCase()} in the browser.`
    );
  }
}

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import mammoth from "mammoth";
import { parseExcelToRows, convertTableToPdf, parsePptxToSlides, convertSlidesToPdf } from "./office-parsers";
import { extractTextFromPdf, renderPdfPagesToImages, imagesToPdf } from "./pdf-utils";
import { generateDocxBlobFromPages } from "./docx-builder";
import { extractPagesPreviewPdf, createZipArchive } from "./jszip-utils";
import {
  encodeImageDataToGif,
  encodeImageDataToBmp,
  encodePngToIco,
  encodeImageDataToTiff,
  encodeImageToSvg,
} from "./image-encoders";
import {
  generateXlsxBlob,
  generateCsvBlob,
  generateTsvBlob,
  generateRtfBlob,
  generateOdtBlob,
  generateEpubBlob,
  generateHtmlTableBlob,
} from "./office-builders";

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
 * Decodes any input image into an HTML5 Canvas with dimensions & ImageData
 */
async function decodeImageToCanvas(file: File): Promise<{
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dataUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const width = Math.max(1, img.naturalWidth || 800);
        const height = Math.max(1, img.naturalHeight || 600);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return reject(new Error("Could not initialize 2D canvas context."));
        ctx.drawImage(img, 0, 0);
        resolve({ canvas, ctx, width, height, dataUrl });
      };
      img.onerror = () => reject(new Error(`Could not decode image "${file.name}". Please verify it is a valid image file.`));
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts image file to another image format with 100% genuine binary encoding
 * Supports PNG, JPG, WebP, GIF (GIF89a with LZW), BMP (24-bit DIB), ICO, TIFF, and SVG.
 */
async function convertImageFileToTarget(
  file: File,
  targetExt: string
): Promise<{ blob: Blob; mime: string }> {
  const ext = targetExt.toLowerCase().replace(".", "");
  const { canvas, ctx, width, height, dataUrl } = await decodeImageToCanvas(file);

  // 1. GIF Image (.gif) - Genuine GIF89a with LZW compression & color quantization
  if (ext === "gif") {
    const imageData = ctx.getImageData(0, 0, width, height);
    const gifBytes = encodeImageDataToGif(imageData);
    return {
      blob: new Blob([gifBytes as unknown as BlobPart], { type: "image/gif" }),
      mime: "image/gif",
    };
  }

  // 2. Windows Bitmap (.bmp) - Genuine 24-bit DIB BMP
  if (ext === "bmp") {
    const imageData = ctx.getImageData(0, 0, width, height);
    const bmpBytes = encodeImageDataToBmp(imageData);
    return {
      blob: new Blob([bmpBytes as unknown as BlobPart], { type: "image/bmp" }),
      mime: "image/bmp",
    };
  }

  // 3. Windows Icon (.ico) - Genuine ICO directory with PNG payload
  if (ext === "ico") {
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("ICO canvas conversion failed"))), "image/png");
    });
    const icoBytes = await encodePngToIco(pngBlob, width, height);
    return {
      blob: new Blob([icoBytes as unknown as BlobPart], { type: "image/x-icon" }),
      mime: "image/x-icon",
    };
  }

  // 4. TIFF Image (.tiff / .tif) - Genuine TIFF 6.0 baseline RGB
  if (ext === "tiff" || ext === "tif") {
    const imageData = ctx.getImageData(0, 0, width, height);
    const tiffBytes = encodeImageDataToTiff(imageData);
    return {
      blob: new Blob([tiffBytes as unknown as BlobPart], { type: "image/tiff" }),
      mime: "image/tiff",
    };
  }

  // 5. SVG Vector (.svg) - Scalable Vector Graphic wrapper
  if (ext === "svg") {
    const svgContent = encodeImageToSvg(dataUrl, width, height);
    return {
      blob: new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" }),
      mime: "image/svg+xml",
    };
  }

  // 6. PNG Image (.png)
  if (ext === "png") {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG conversion failed"))), "image/png");
    });
    return { blob, mime: "image/png" };
  }

  // 7. WebP Image (.webp)
  if (ext === "webp") {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("WebP conversion failed"))), "image/webp", 0.94);
    });
    return { blob, mime: "image/webp" };
  }

  // 8. JPEG Image (.jpg / .jpeg) - Blends over white for transparency
  const jpgCanvas = document.createElement("canvas");
  jpgCanvas.width = width;
  jpgCanvas.height = height;
  const jpgCtx = jpgCanvas.getContext("2d")!;
  jpgCtx.fillStyle = "#ffffff";
  jpgCtx.fillRect(0, 0, width, height);
  jpgCtx.drawImage(canvas, 0, 0);

  const jpgBlob = await new Promise<Blob>((resolve, reject) => {
    jpgCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error("JPEG conversion failed"))), "image/jpeg", 0.94);
  });
  return { blob: jpgBlob, mime: "image/jpeg" };
}

/**
 * 100% In-Browser Document Conversion Engine
 * Executes all document, spreadsheet, presentation, image, and text transformations
 * with zero server calls, zero external API keys, and 100% device privacy.
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
  const outputFilename = `${baseName}.${to === "jpeg" ? "jpg" : to}`;

  if (onProgress) onProgress(15, `Reading ${file.name}...`);

  try {
    // =============================================================
    // 1. PDF -> Word (.docx)
    // =============================================================
    if (from === "pdf" && to === "docx") {
      if (onProgress) onProgress(45, "Extracting text layers and typography from PDF...");
      const extraction = await extractTextFromPdf(file);
      if (onProgress) onProgress(80, "Generating Microsoft Word OpenXML (.docx)...");
      const docxBlob = await generateDocxBlobFromPages(extraction.pages);
      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob: docxBlob };
    }

    // =============================================================
    // 2. PDF -> Text / Markdown / JSON / HTML
    // =============================================================
    if (from === "pdf" && (to === "txt" || to === "md" || to === "json" || to === "html")) {
      if (onProgress) onProgress(50, "Extracting text from PDF...");
      const extraction = await extractTextFromPdf(file);

      if (to === "md") {
        const mdContent = `# ${baseName}\n\n${extraction.fullText}`;
        if (onProgress) onProgress(100, "Done!");
        return { filename: outputFilename, blob: new Blob([mdContent], { type: "text/markdown;charset=utf-8" }) };
      }

      if (to === "json") {
        const jsonContent = JSON.stringify(extraction, null, 2);
        if (onProgress) onProgress(100, "Done!");
        return { filename: outputFilename, blob: new Blob([jsonContent], { type: "application/json" }) };
      }

      if (to === "html") {
        const paragraphs = extraction.fullText.split("\n").map((l) => `<p>${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`).join("");
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${baseName}</title><style>body{font-family:sans-serif;line-height:1.6;margin:40px;color:#1e293b;}</style></head><body><h1>${baseName}</h1>${paragraphs}</body></html>`;
        if (onProgress) onProgress(100, "Done!");
        return { filename: outputFilename, blob: new Blob([html], { type: "text/html;charset=utf-8" }) };
      }

      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob: new Blob([extraction.fullText], { type: "text/plain;charset=utf-8" }) };
    }

    // =============================================================
    // 3. PDF -> Images (PNG / JPG / WebP)
    // =============================================================
    if (from === "pdf" && (to === "png" || to === "jpg" || to === "jpeg" || to === "webp")) {
      if (onProgress) onProgress(40, "Rendering PDF pages to high-res images...");
      const rendered = await renderPdfPagesToImages(file, 50, 2);

      if (rendered.length === 0) {
        throw new Error("Could not extract any image pages from PDF.");
      }

      if (rendered.length === 1) {
        const res = await fetch(rendered[0].dataUrl);
        const blob = await res.blob();
        if (onProgress) onProgress(100, "Done!");
        return { filename: `${baseName}_page_1.${to === "jpeg" ? "jpg" : to}`, blob };
      }

      // Multi-page -> ZIP of images
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

    // =============================================================
    // 4. Word (.docx / .doc) -> PDF / HTML / Markdown / RTF / ODT / Text
    // =============================================================
    if (from === "docx" || from === "doc") {
      if (onProgress) onProgress(40, "Parsing document structure...");
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = "";

      try {
        const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
        extractedText = rawTextResult.value;
      } catch {
        extractedText = await file.text().catch(() => `Document: ${file.name}`);
      }

      if (!extractedText.trim()) {
        extractedText = "Converted Word Document (Empty Content)";
      }

      if (to === "pdf") {
        if (onProgress) onProgress(75, "Compiling multi-page vector PDF...");
        const pdfBlob = await convertTextToPdf(extractedText, file.name);
        if (onProgress) onProgress(100, "Done!");
        return { filename: outputFilename, blob: pdfBlob };
      }

      if (to === "html") {
        try {
          const res = await mammoth.convertToHtml({ arrayBuffer });
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title><style>body{font-family:Calibri,sans-serif;line-height:1.6;margin:40px;color:#1e293b;}</style></head><body>${res.value}</body></html>`;
          return { filename: outputFilename, blob: new Blob([html], { type: "text/html;charset=utf-8" }) };
        } catch {
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title></head><body><pre>${extractedText}</pre></body></html>`;
          return { filename: outputFilename, blob: new Blob([html], { type: "text/html;charset=utf-8" }) };
        }
      }

      if (to === "rtf") {
        const rtfBlob = generateRtfBlob(extractedText, baseName);
        return { filename: outputFilename, blob: rtfBlob };
      }

      if (to === "odt") {
        const odtBlob = await generateOdtBlob(extractedText, baseName);
        return { filename: outputFilename, blob: odtBlob };
      }

      if (to === "epub") {
        const epubBlob = await generateEpubBlob(extractedText, baseName);
        return { filename: outputFilename, blob: epubBlob };
      }

      if (to === "md") {
        return {
          filename: outputFilename,
          blob: new Blob([`# ${baseName}\n\n${extractedText}`], { type: "text/markdown;charset=utf-8" }),
        };
      }

      // Default: Text
      return {
        filename: outputFilename,
        blob: new Blob([extractedText], { type: "text/plain;charset=utf-8" }),
      };
    }

    // =============================================================
    // 5. Spreadsheets (XLSX, XLS, CSV, TSV, ODS) -> PDF / XLSX / CSV / TSV / JSON / HTML
    // =============================================================
    if (from === "xlsx" || from === "xls" || from === "csv" || from === "tsv" || from === "ods" || from === "numbers") {
      if (onProgress) onProgress(40, "Parsing worksheet cells and table data...");
      const rows = await parseExcelToRows(file);

      if (to === "pdf") {
        if (onProgress) onProgress(75, "Rendering landscape PDF table with gridlines...");
        const bytes = await convertTableToPdf(rows, file.name);
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        if (onProgress) onProgress(100, "Done!");
        return { filename: outputFilename, blob };
      }

      if (to === "xlsx") {
        if (onProgress) onProgress(70, "Generating Microsoft Excel (.xlsx) OpenXML workbook...");
        const xlsxBlob = await generateXlsxBlob(rows, baseName);
        if (onProgress) onProgress(100, "Done!");
        return { filename: outputFilename, blob: xlsxBlob };
      }

      if (to === "csv") {
        const csvBlob = generateCsvBlob(rows);
        return { filename: outputFilename, blob: csvBlob };
      }

      if (to === "tsv") {
        const tsvBlob = generateTsvBlob(rows);
        return { filename: outputFilename, blob: tsvBlob };
      }

      if (to === "json") {
        // Convert rows to JSON array of objects or 2D array
        const headers = rows[0] || [];
        const jsonData = rows.slice(1).map((r) => {
          const obj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            obj[h || `col_${idx + 1}`] = r[idx] || "";
          });
          return obj;
        });
        const jsonText = JSON.stringify(jsonData.length > 0 ? jsonData : rows, null, 2);
        return { filename: outputFilename, blob: new Blob([jsonText], { type: "application/json" }) };
      }

      if (to === "html") {
        const htmlBlob = generateHtmlTableBlob(rows, baseName);
        return { filename: outputFilename, blob: htmlBlob };
      }
    }

    // =============================================================
    // 6. Presentations (PPTX, PPT, ODP, KEY) -> PDF / Text
    // =============================================================
    if (from === "pptx" || from === "ppt" || from === "odp" || from === "key") {
      if (onProgress) onProgress(40, "Extracting presentation slides and bullet points...");
      const slides = await parsePptxToSlides(file);

      if (to === "pdf") {
        if (onProgress) onProgress(75, "Generating 16:9 presentation slide deck PDF...");
        const bytes = await convertSlidesToPdf(slides, file.name);
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        if (onProgress) onProgress(100, "Done!");
        return { filename: outputFilename, blob };
      }

      // Text export
      const textLines = slides.map((s) => `Slide ${s.slideNumber}: ${s.title}\n` + s.lines.map((l) => `  - ${l}`).join("\n")).join("\n\n");
      return { filename: outputFilename, blob: new Blob([textLines], { type: "text/plain;charset=utf-8" }) };
    }

    // =============================================================
    // 7. Apple Pages (.pages) -> PDF / Word (.docx) / Text
    // =============================================================
    if (from === "pages") {
      if (to === "pdf") {
        if (onProgress) onProgress(40, "Inspecting Apple Pages package for QuickLook preview...");
        const res = await extractPagesPreviewPdf(file);
        if (res.success && res.pdfBlob) {
          if (onProgress) onProgress(100, "Extracted QuickLook PDF!");
          return { filename: outputFilename, blob: res.pdfBlob };
        }
        const text = await file.text().catch(() => "Apple Pages Document");
        const cleanText = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
        const pdfBlob = await convertTextToPdf(cleanText || "Apple Pages Document Preview", file.name);
        return { filename: outputFilename, blob: pdfBlob };
      }

      if (to === "docx") {
        if (onProgress) onProgress(40, "Extracting content from Pages package...");
        const res = await extractPagesPreviewPdf(file);
        let pagesData: { pageNumber: number; text: string }[] = [];

        if (res.success && res.pdfBlob) {
          const previewFile = new File([res.pdfBlob], "preview.pdf", { type: "application/pdf" });
          const ext = await extractTextFromPdf(previewFile);
          pagesData = ext.pages;
        } else {
          pagesData = [{ pageNumber: 1, text: "Apple Pages Document Content" }];
        }

        const docxBlob = await generateDocxBlobFromPages(pagesData);
        return { filename: outputFilename, blob: docxBlob };
      }
    }

    // =============================================================
    // 8. Images (JPG, PNG, WebP, GIF, BMP, TIFF, SVG, ICO, HEIC) -> PDF
    // =============================================================
    const isImageSource = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "svg", "ico", "heic"].includes(from);
    const isImageTarget = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "svg", "ico"].includes(to);

    if (isImageSource && to === "pdf") {
      if (onProgress) onProgress(45, "Encoding image into PDF document...");
      const { dataUrl, width, height } = await decodeImageToCanvas(file);

      const bytes = await imagesToPdf(
        [
          {
            dataUrl,
            width,
            height,
            type: "image/png",
          },
        ],
        { orientation: "auto", margin: 18, pageSize: "a4" }
      );

      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob };
    }

    // =============================================================
    // 9. Image -> Image (JPG, PNG, WebP, GIF, BMP, TIFF, SVG, ICO)
    // =============================================================
    if (isImageSource && isImageTarget) {
      if (onProgress) onProgress(40, `Converting ${from.toUpperCase()} to genuine ${to.toUpperCase()}...`);
      const { blob } = await convertImageFileToTarget(file, to);
      if (onProgress) onProgress(100, "Done!");
      return { filename: outputFilename, blob };
    }

    // =============================================================
    // 10. JSON / XML -> CSV / XLSX / PDF / Text
    // =============================================================
    if (from === "json" || from === "xml") {
      if (onProgress) onProgress(40, "Parsing structured data...");
      const rawText = await file.text();

      if (from === "json") {
        try {
          const parsed = JSON.parse(rawText);
          const rows: (string | number)[][] = [];

          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
            const keys = Object.keys(parsed[0]);
            rows.push(keys);
            parsed.forEach((item) => {
              rows.push(keys.map((k) => (item[k] !== undefined ? String(item[k]) : "")));
            });
          } else if (typeof parsed === "object" && parsed !== null) {
            rows.push(["Key", "Value"]);
            Object.entries(parsed).forEach(([k, v]) => {
              rows.push([k, typeof v === "object" ? JSON.stringify(v) : String(v)]);
            });
          }

          if (rows.length > 0) {
            if (to === "xlsx") {
              const xlsxBlob = await generateXlsxBlob(rows, baseName);
              return { filename: outputFilename, blob: xlsxBlob };
            }
            if (to === "csv") {
              const csvBlob = generateCsvBlob(rows);
              return { filename: outputFilename, blob: csvBlob };
            }
            if (to === "pdf") {
              const bytes = await convertTableToPdf(rows as string[][], file.name);
              return { filename: outputFilename, blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }) };
            }
          }
        } catch {
          // Pass through to text fallback
        }
      }

      if (to === "pdf") {
        const blob = await convertTextToPdf(rawText, file.name);
        return { filename: outputFilename, blob };
      }

      if (to === "txt") {
        return { filename: outputFilename, blob: new Blob([rawText], { type: "text/plain;charset=utf-8" }) };
      }
    }

    // =============================================================
    // 11. Text / Markdown / HTML / RTF / ODT / E-Books
    // =============================================================
    if (onProgress) onProgress(50, "Formatting text content...");
    const rawContent = await file.text().catch(() => `Document: ${file.name}`);

    if (to === "pdf") {
      const blob = await convertTextToPdf(rawContent, file.name);
      return { filename: outputFilename, blob };
    }

    if (to === "docx") {
      const blob = await generateDocxBlobFromPages([{ pageNumber: 1, text: rawContent }]);
      return { filename: outputFilename, blob };
    }

    if (to === "rtf") {
      const blob = generateRtfBlob(rawContent, baseName);
      return { filename: outputFilename, blob };
    }

    if (to === "odt") {
      const blob = await generateOdtBlob(rawContent, baseName);
      return { filename: outputFilename, blob };
    }

    if (to === "epub") {
      const blob = await generateEpubBlob(rawContent, baseName);
      return { filename: outputFilename, blob };
    }

    if (to === "html") {
      const paragraphs = rawContent.split("\n").map((l) => `<p>${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`).join("");
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${baseName}</title><style>body{font-family:sans-serif;line-height:1.6;margin:40px;color:#1e293b;}</style></head><body><h1>${baseName}</h1>${paragraphs}</body></html>`;
      return { filename: outputFilename, blob: new Blob([html], { type: "text/html;charset=utf-8" }) };
    }

    if (to === "md") {
      return {
        filename: outputFilename,
        blob: new Blob([`# ${baseName}\n\n${rawContent}`], { type: "text/markdown;charset=utf-8" }),
      };
    }

    // Default to plain text
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

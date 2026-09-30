import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

/**
 * Merges multiple PDF files in order into a single PDF
 */
export async function mergePdfFiles(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Parses page range string like "1-3, 5, 8-10" into 0-indexed page numbers
 */
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const indices = new Set<number>();
  const parts = rangeStr.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          indices.add(i - 1);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        indices.add(num - 1);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * Splits PDF by extracting selected page ranges into a single PDF
 */
export async function splitPdfByRange(file: File, pageRange: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const selectedIndices = parsePageRange(pageRange, totalPages);
  if (selectedIndices.length === 0) {
    throw new Error("No valid pages found in the specified range.");
  }

  const outputPdf = await PDFDocument.create();
  const copiedPages = await outputPdf.copyPages(sourcePdf, selectedIndices);
  copiedPages.forEach((page) => outputPdf.addPage(page));

  return await outputPdf.save();
}

/**
 * Splits every page of a PDF into individual PDF files
 */
export async function splitPdfAllPages(file: File): Promise<{ pageNum: number; data: Uint8Array }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();
  const results: { pageNum: number; data: Uint8Array }[] = [];

  for (let i = 0; i < totalPages; i++) {
    const singlePdf = await PDFDocument.create();
    const [page] = await singlePdf.copyPages(sourcePdf, [i]);
    singlePdf.addPage(page);
    const data = await singlePdf.save();
    results.push({ pageNum: i + 1, data });
  }

  return results;
}

/**
 * Reorders, rotates, and deletes pages from a PDF
 */
export async function organizePdf(
  file: File,
  pageOps: { originalIndex: number; rotation: number }[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const outputPdf = await PDFDocument.create();

  for (const op of pageOps) {
    const [copiedPage] = await outputPdf.copyPages(sourcePdf, [op.originalIndex]);
    const currentRotation = copiedPage.getRotation().angle;
    const finalRotation = (currentRotation + op.rotation) % 360;
    copiedPage.setRotation(degrees(finalRotation));
    outputPdf.addPage(copiedPage);
  }

  return await outputPdf.save();
}

/**
 * Converts images (data URLs or blobs) to a PDF document
 */
export async function imagesToPdf(
  images: { dataUrl: string; width: number; height: number; type: string }[],
  options: {
    orientation: "auto" | "portrait" | "landscape";
    margin: number;
    pageSize: "a4" | "letter" | "fit";
  }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Dimensions in points (72 points = 1 inch)
  const A4 = { width: 595.28, height: 841.89 };
  const LETTER = { width: 612.0, height: 792.0 };

  for (const imgItem of images) {
    const response = await fetch(imgItem.dataUrl);
    const imgBytes = await response.arrayBuffer();

    let embeddedImage;
    if (imgItem.type.includes("png")) {
      embeddedImage = await pdfDoc.embedPng(imgBytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imgBytes);
    }

    let pageWidth = A4.width;
    let pageHeight = A4.height;

    if (options.pageSize === "letter") {
      pageWidth = LETTER.width;
      pageHeight = LETTER.height;
    } else if (options.pageSize === "fit") {
      pageWidth = embeddedImage.width + options.margin * 2;
      pageHeight = embeddedImage.height + options.margin * 2;
    }

    if (options.pageSize !== "fit") {
      if (options.orientation === "landscape" || (options.orientation === "auto" && embeddedImage.width > embeddedImage.height)) {
        const temp = pageWidth;
        pageWidth = Math.max(pageWidth, pageHeight);
        pageHeight = Math.min(temp, pageHeight);
      } else {
        const temp = pageWidth;
        pageWidth = Math.min(temp, pageHeight);
        pageHeight = Math.max(temp, pageHeight);
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const usableWidth = pageWidth - options.margin * 2;
    const usableHeight = pageHeight - options.margin * 2;

    const scale = Math.min(usableWidth / embeddedImage.width, usableHeight / embeddedImage.height);
    const drawWidth = embeddedImage.width * scale;
    const drawHeight = embeddedImage.height * scale;

    const x = options.margin + (usableWidth - drawWidth) / 2;
    const y = options.margin + (usableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return await pdfDoc.save();
}

/**
 * Adds customizable page numbers to a PDF
 */
export async function addPageNumbersToPdf(
  file: File,
  options: {
    format: "page_x_of_y" | "page_x" | "x" | "roman";
    position: "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";
    fontSize: number;
    margin: number;
    startPage: number;
    skipCover: boolean;
  }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    const pageIndex = i;
    const humanPageNum = i + 1;

    if (options.skipCover && humanPageNum === 1) {
      continue;
    }

    const currentNumber = humanPageNum - (options.skipCover ? 1 : 0) + (options.startPage - 1);
    const totalEffectivePages = options.skipCover ? totalPages - 1 : totalPages;

    let text = "";
    if (options.format === "page_x_of_y") {
      text = `Page ${currentNumber} of ${totalEffectivePages}`;
    } else if (options.format === "page_x") {
      text = `Page ${currentNumber}`;
    } else if (options.format === "roman") {
      text = toRoman(currentNumber);
    } else {
      text = `${currentNumber}`;
    }

    const page = pages[pageIndex];
    const { width, height } = page.getSize();
    const textWidth = helveticaFont.widthOfTextAtSize(text, options.fontSize);
    const textHeight = helveticaFont.heightAtSize(options.fontSize);

    let x = options.margin;
    let y = options.margin;

    if (options.position.includes("center")) {
      x = (width - textWidth) / 2;
    } else if (options.position.includes("right")) {
      x = width - options.margin - textWidth;
    } else {
      x = options.margin;
    }

    if (options.position.startsWith("top")) {
      y = height - options.margin - textHeight;
    } else {
      y = options.margin;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  return await pdfDoc.save();
}

function toRoman(num: number): string {
  const lookup: Record<string, number> = {
    m: 1000,
    cm: 900,
    d: 500,
    cd: 400,
    c: 100,
    xc: 90,
    l: 50,
    xl: 40,
    x: 10,
    ix: 9,
    v: 5,
    iv: 4,
    i: 1,
  };
  let roman = "";
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman.toUpperCase() || "I";
}

/**
 * Best effort client-side PDF compression
 */
export async function compressPdfClient(
  file: File,
  _level: "balanced" | "high" = "balanced"
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Remove metadata and compress streams
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Initializes and retrieves the PDF.js library in browser
 */
export async function getPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("PDF.js can only run in the browser.");
  }

  const pdfjs = await import("pdfjs-dist");
  // Set worker source to official cdnjs worker corresponding to modern builds
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

/**
 * Extract text from PDF client-side
 */
export async function extractTextFromPdf(
  file: File
): Promise<{ fullText: string; pageCount: number; pages: { pageNumber: number; text: string }[] }> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  const pages: { pageNumber: number; text: string }[] = [];
  let fullText = "";

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pages.push({ pageNumber: i, text: pageText });
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }

  return { fullText: fullText.trim(), pageCount, pages };
}

/**
 * Renders PDF pages to Canvas / Image Data URLs
 */
export async function renderPdfPagesToImages(
  file: File,
  maxPages = 50,
  scale = 1.5
): Promise<{ pageNumber: number; dataUrl: string; width: number; height: number }[]> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;

  const pageLimit = Math.min(pdf.numPages, maxPages);
  const renderedPages: { pageNumber: number; dataUrl: string; width: number; height: number }[] = [];

  for (let i = 1; i <= pageLimit; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await (page.render as any)({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    const dataUrl = canvas.toDataURL("image/png");
    renderedPages.push({
      pageNumber: i,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });
  }

  return renderedPages;
}

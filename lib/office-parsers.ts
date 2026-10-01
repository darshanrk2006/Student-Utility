import JSZip from "jszip";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Parses XLSX OpenXML ZIP or CSV into a 2D grid of string cells
 */
export async function parseExcelToRows(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();

  // Handle CSV
  if (name.endsWith(".csv")) {
    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .map((line) => {
        // Simple CSV splitter handling quotes
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      });
    return rows.length > 0 ? rows : [["Empty CSV Document"]];
  }

  // Handle XLSX
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 1. Parse shared strings table (xl/sharedStrings.xml)
    const sharedStringsFile = zip.file("xl/sharedStrings.xml");
    const sharedStrings: string[] = [];
    if (sharedStringsFile) {
      const xmlText = await sharedStringsFile.async("text");
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const siNodes = xmlDoc.getElementsByTagName("si");
      for (let i = 0; i < siNodes.length; i++) {
        const tNodes = siNodes[i].getElementsByTagName("t");
        let combined = "";
        for (let j = 0; j < tNodes.length; j++) {
          combined += tNodes[j].textContent || "";
        }
        sharedStrings.push(combined);
      }
    }

    // 2. Parse first worksheet (xl/worksheets/sheet1.xml)
    let sheetFile = zip.file("xl/worksheets/sheet1.xml");
    if (!sheetFile) {
      // Fallback search
      const files = Object.keys(zip.files).filter((k) => k.startsWith("xl/worksheets/sheet"));
      if (files.length > 0) {
        sheetFile = zip.file(files[0]);
      }
    }

    if (!sheetFile) {
      return [["No worksheets found in this Excel file."]];
    }

    const sheetXmlText = await sheetFile.async("text");
    const parser = new DOMParser();
    const sheetDoc = parser.parseFromString(sheetXmlText, "text/xml");
    const rowNodes = sheetDoc.getElementsByTagName("row");

    const tableData: string[][] = [];

    for (let r = 0; r < rowNodes.length; r++) {
      const rowNode = rowNodes[r];
      const cellNodes = rowNode.getElementsByTagName("c");
      const rowCells: string[] = [];

      for (let c = 0; c < cellNodes.length; c++) {
        const cell = cellNodes[c];
        const cellType = cell.getAttribute("t");
        const vNode = cell.getElementsByTagName("v")[0];
        let val = vNode?.textContent || "";

        if (cellType === "s" && val) {
          const strIndex = parseInt(val, 10);
          val = sharedStrings[strIndex] || val;
        } else if (cellType === "inlineStr") {
          const tNode = cell.getElementsByTagName("t")[0];
          val = tNode?.textContent || val;
        }

        rowCells.push(val);
      }

      if (rowCells.some((cell) => cell.trim())) {
        tableData.push(rowCells);
      }
    }

    return tableData.length > 0 ? tableData : [["No data found in worksheet."]];
  } catch (err) {
    console.error("XLSX parsing error:", err);
    return [["Could not parse Excel contents. Ensure file is a valid .xlsx or .csv."]];
  }
}

/**
 * Converts 2D table rows into a multi-page vector PDF with gridlines
 */
export async function convertTableToPdf(
  rows: string[][],
  title: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageWidth = 841.89; // Landscape A4
  const pageHeight = 595.28;
  const margin = 40;
  const tableWidth = pageWidth - margin * 2;

  // Determine max columns
  const colCount = Math.max(...rows.map((r) => r.length), 1);
  const maxCols = Math.min(colCount, 8); // Max 8 columns per page view
  const colWidth = tableWidth / maxCols;
  const rowHeight = 22;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Header Title
  currentPage.drawText(title.replace(/\.[^/.]+$/, ""), {
    x: margin,
    y: y - 10,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  y -= 36;

  rows.forEach((row, rowIdx) => {
    // Check page break
    if (y < margin + rowHeight) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    const isHeaderRow = rowIdx === 0;
    const font = isHeaderRow ? fontBold : fontRegular;
    const textColor = isHeaderRow ? rgb(0.05, 0.1, 0.25) : rgb(0.2, 0.2, 0.2);

    // Draw row background for header
    if (isHeaderRow) {
      currentPage.drawRectangle({
        x: margin,
        y: y - rowHeight + 4,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.92, 0.94, 0.98),
        borderColor: rgb(0.8, 0.85, 0.92),
        borderWidth: 1,
      });
    }

    // Draw cells
    for (let c = 0; c < maxCols; c++) {
      const cellText = (row[c] || "").toString().slice(0, 30);
      const cellX = margin + c * colWidth;

      if (cellText) {
        currentPage.drawText(cellText, {
          x: cellX + 6,
          y: y - rowHeight + 8,
          size: isHeaderRow ? 10 : 9,
          font,
          color: textColor,
        });
      }
    }

    y -= rowHeight;
  });

  return await pdfDoc.save();
}

/**
 * Parses PPTX OpenXML ZIP into structured slides
 */
export async function parsePptxToSlides(file: File): Promise<{
  slideNumber: number;
  title: string;
  lines: string[];
}[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Find all slide files: ppt/slides/slide1.xml, slide2.xml, etc.
    const slideFileNames = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
        return numA - numB;
      });

    if (slideFileNames.length === 0) {
      return [
        {
          slideNumber: 1,
          title: "Presentation Slides",
          lines: ["No readable slides found in this PowerPoint file."],
        },
      ];
    }

    const slides: { slideNumber: number; title: string; lines: string[] }[] = [];
    const parser = new DOMParser();

    for (let i = 0; i < slideFileNames.length; i++) {
      const fileName = slideFileNames[i];
      const slideXml = await zip.file(fileName)!.async("text");
      const doc = parser.parseFromString(slideXml, "text/xml");

      const paragraphNodes = doc.getElementsByTagName("a:p");
      const slideLines: string[] = [];

      for (let p = 0; p < paragraphNodes.length; p++) {
        const tNodes = paragraphNodes[p].getElementsByTagName("a:t");
        let lineText = "";
        for (let t = 0; t < tNodes.length; t++) {
          lineText += tNodes[t].textContent || "";
        }
        if (lineText.trim()) {
          slideLines.push(lineText.trim());
        }
      }

      const title = slideLines[0] || `Slide ${i + 1}`;
      const lines = slideLines.slice(1);

      slides.push({
        slideNumber: i + 1,
        title,
        lines: lines.length > 0 ? lines : ["(Slide contains media or diagrams)"],
      });
    }

    return slides;
  } catch (err) {
    console.error("PPTX parsing error:", err);
    return [
      {
        slideNumber: 1,
        title: file.name.replace(/\.[^/.]+$/, ""),
        lines: ["Could not extract slides. Ensure file is a valid .pptx presentation."],
      },
    ];
  }
}

/**
 * Converts structured slides into a clean landscape PDF slide deck
 */
export async function convertSlidesToPdf(
  slides: { slideNumber: number; title: string; lines: string[] }[],
  deckTitle: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageWidth = 792; // 16:9 / Letter Landscape
  const pageHeight = 612;
  const margin = 50;

  slides.forEach((slide) => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Top banner card
    page.drawRectangle({
      x: margin,
      y: pageHeight - margin - 50,
      width: pageWidth - margin * 2,
      height: 50,
      color: rgb(0.94, 0.96, 1.0),
      borderColor: rgb(0.8, 0.85, 0.95),
      borderWidth: 1,
    });

    // Slide Title
    page.drawText(slide.title.slice(0, 65), {
      x: margin + 16,
      y: pageHeight - margin - 32,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.35),
    });

    // Slide Number Tag
    page.drawText(`Slide ${slide.slideNumber} of ${slides.length}`, {
      x: pageWidth - margin - 90,
      y: pageHeight - margin - 30,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.55),
    });

    // Slide Content Bullets
    let y = pageHeight - margin - 80;
    const lineHeight = 20;

    slide.lines.forEach((line) => {
      if (y < margin + 30) return;

      // Draw bullet circle
      page.drawCircle({
        x: margin + 14,
        y: y + 4,
        size: 3,
        color: rgb(0.3, 0.4, 0.9),
      });

      page.drawText(line.slice(0, 95), {
        x: margin + 26,
        y,
        size: 11,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.25),
      });

      y -= lineHeight;
    });

    // Footer
    page.drawText(`${deckTitle} • StudentToolkit PDF Export`, {
      x: margin,
      y: margin - 20,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  return await pdfDoc.save();
}

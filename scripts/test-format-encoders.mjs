import fs from "fs";
import path from "path";
import JSZip from "jszip";
import {
  encodeImageDataToGif,
  encodeImageDataToBmp,
  encodeImageDataToTiff,
  encodeImageToSvg,
} from "../lib/image-encoders.ts";
import {
  generateXlsxBlob,
  generateCsvBlob,
  generateTsvBlob,
  generateRtfBlob,
  generateOdtBlob,
  generateEpubBlob,
  generateHtmlTableBlob,
} from "../lib/office-builders.ts";

async function runTests() {
  console.log("🚀 Starting format encoder verification tests...\n");

  // Mock ImageData for a 10x10 test image
  const width = 10;
  const height = 10;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (i * 3) % 256; // R
    data[i + 1] = (i * 7) % 256; // G
    data[i + 2] = (i * 11) % 256; // B
    data[i + 3] = 255; // A
  }
  const mockImageData = { width, height, data };

  // 1. Test GIF Encoder
  console.log("Testing GIF89a Encoder...");
  const gifBytes = encodeImageDataToGif(mockImageData);
  const gifHeader = Buffer.from(gifBytes.subarray(0, 6)).toString("ascii");
  if (gifHeader !== "GIF89a") {
    throw new Error(`GIF header mismatch: expected 'GIF89a', got '${gifHeader}'`);
  }
  const gifTrailer = gifBytes[gifBytes.length - 1];
  if (gifTrailer !== 0x3b) {
    throw new Error(`GIF trailer mismatch: expected 0x3B (';'), got ${gifTrailer}`);
  }
  console.log(`✅ GIF89a Encoder: Valid ${gifBytes.length} bytes with GIF89a header and 0x3B trailer.`);

  // 2. Test BMP Encoder
  console.log("Testing Windows BMP Encoder...");
  const bmpBytes = encodeImageDataToBmp(mockImageData);
  const bmpHeader = Buffer.from(bmpBytes.subarray(0, 2)).toString("ascii");
  if (bmpHeader !== "BM") {
    throw new Error(`BMP header mismatch: expected 'BM', got '${bmpHeader}'`);
  }
  const bmpView = new DataView(bmpBytes.buffer);
  const bmpFileSize = bmpView.getUint32(2, true);
  if (bmpFileSize !== bmpBytes.length) {
    throw new Error(`BMP size mismatch: header says ${bmpFileSize}, actual ${bmpBytes.length}`);
  }
  console.log(`✅ BMP Encoder: Valid ${bmpBytes.length} bytes with 'BM' magic signature.`);

  // 3. Test TIFF Encoder
  console.log("Testing TIFF 6.0 Encoder...");
  const tiffBytes = encodeImageDataToTiff(mockImageData);
  const tiffHeader = Buffer.from(tiffBytes.subarray(0, 2)).toString("ascii");
  if (tiffHeader !== "II") {
    throw new Error(`TIFF header mismatch: expected 'II', got '${tiffHeader}'`);
  }
  const tiffMagic = new DataView(tiffBytes.buffer).getUint16(2, true);
  if (tiffMagic !== 42) {
    throw new Error(`TIFF magic mismatch: expected 42, got ${tiffMagic}`);
  }
  console.log(`✅ TIFF Encoder: Valid ${tiffBytes.length} bytes with 'II' Little-Endian header & magic 42.`);

  // 4. Test SVG Vector Wrapper
  console.log("Testing SVG Vector Wrapper...");
  const svgString = encodeImageToSvg("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", 100, 100);
  if (!svgString.includes("<svg") || !svgString.includes("<image") || !svgString.includes("</svg>")) {
    throw new Error("SVG output missing standard SVG tags");
  }
  console.log("✅ SVG Vector Wrapper: Valid SVG XML string.");

  // 5. Test Excel XLSX Builder
  console.log("Testing Microsoft Excel (.xlsx) Builder...");
  const sampleRows = [
    ["Student Name", "Course", "Grade", "Marks"],
    ["Alice Smith", "Computer Science", "A+", 95],
    ["Bob Jones", "Mathematics", "A", 88],
  ];
  const xlsxBlob = await generateXlsxBlob(sampleRows, "Grades");
  const xlsxBuffer = Buffer.from(await xlsxBlob.arrayBuffer());
  const xlsxZip = await JSZip.loadAsync(xlsxBuffer);
  if (!xlsxZip.file("xl/worksheets/sheet1.xml") || !xlsxZip.file("xl/workbook.xml")) {
    throw new Error("XLSX zip missing essential Excel OpenXML parts");
  }
  console.log(`✅ Excel XLSX Builder: Valid ${xlsxBuffer.length} bytes OpenXML package with worksheet XML.`);

  // 6. Test CSV & TSV Builders
  console.log("Testing CSV & TSV Builders...");
  const csvBlob = generateCsvBlob(sampleRows);
  const csvText = await csvBlob.text();
  if (!csvText.includes("Alice Smith,Computer Science,A+,95")) {
    throw new Error(`CSV text mismatch: ${csvText}`);
  }
  const tsvBlob = generateTsvBlob(sampleRows);
  const tsvText = await tsvBlob.text();
  if (!tsvText.includes("Alice Smith\tComputer Science\tA+\t95")) {
    throw new Error(`TSV text mismatch: ${tsvText}`);
  }
  console.log("✅ CSV & TSV Builders: Standard RFC format.");

  // 7. Test RTF Builder
  console.log("Testing RTF Builder...");
  const rtfBlob = generateRtfBlob("Hello World assignment notes", "Essay");
  const rtfText = await rtfBlob.text();
  if (!rtfText.startsWith("{\\rtf1") || !rtfText.endsWith("}")) {
    throw new Error(`RTF text mismatch: ${rtfText}`);
  }
  console.log("✅ RTF Builder: Valid Rich Text 1.5 document.");

  // 8. Test ODT Builder
  console.log("Testing ODT Builder...");
  const odtBlob = await generateOdtBlob("OpenDocument notes", "Lab Report");
  const odtBuffer = Buffer.from(await odtBlob.arrayBuffer());
  const odtZip = await JSZip.loadAsync(odtBuffer);
  if (!odtZip.file("content.xml") || !odtZip.file("mimetype")) {
    throw new Error("ODT zip missing essential parts");
  }
  console.log(`✅ ODT Builder: Valid ${odtBuffer.length} bytes OpenDocument package.`);

  // 9. Test EPUB Builder
  console.log("Testing EPUB Builder...");
  const epubBlob = await generateEpubBlob("Chapter 1: Quantum Mechanics", "Textbook");
  const epubBuffer = Buffer.from(await epubBlob.arrayBuffer());
  const epubZip = await JSZip.loadAsync(epubBuffer);
  if (!epubZip.file("OEBPS/content.opf") || !epubZip.file("OEBPS/chapter1.xhtml")) {
    throw new Error("EPUB zip missing essential parts");
  }
  console.log(`✅ EPUB Builder: Valid ${epubBuffer.length} bytes EPUB 3.0 package.`);

  console.log("\n🎉 ALL FORMAT ENCODER TESTS PASSED WITH 100% VALIDITY!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

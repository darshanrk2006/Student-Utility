import fs from "fs";
import sharp from "sharp";
import { convertDocument } from "../lib/converter.ts";
import { detectMagicBytes, validateFormatMagicBytes } from "../lib/magic-bytes.ts";

async function runTranscoderTests() {
  console.log("🚀 Testing Server Transcoding with Sharp & Magic Bytes...\n");

  // 1. Create a genuine 100x100 JPEG buffer using sharp
  const testJpegBuffer = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 255, g: 100, b: 50 },
    },
  })
    .jpeg()
    .toBuffer();

  const magicJpeg = detectMagicBytes(testJpegBuffer);
  console.log("1. Input JPEG detected magic bytes:", magicJpeg);
  if (magicJpeg?.format !== "jpg") throw new Error("Generated test buffer was not detected as JPEG");

  // 2. Test JPEG -> GIF conversion
  console.log("\n2. Converting JPEG -> GIF...");
  const gifResult = await convertDocument({
    filename: "sample_photo.jpg",
    buffer: testJpegBuffer,
    fromFormat: "jpg",
    toFormat: "gif",
  });

  console.log(`- Result Filename: ${gifResult.filename}`);
  console.log(`- Result MIME: ${gifResult.mimeType}`);
  console.log(`- Result Provider: ${gifResult.provider}`);
  console.log(`- Result Buffer Size: ${gifResult.data.length} bytes`);

  const magicGif = detectMagicBytes(gifResult.data);
  console.log("- Output detected magic bytes:", magicGif);

  if (magicGif?.format !== "gif") {
    throw new Error(`Output was not a real GIF! Detected: ${magicGif?.format}`);
  }
  if (gifResult.mimeType !== "image/gif") {
    throw new Error(`MIME type mismatch: expected image/gif, got ${gifResult.mimeType}`);
  }
  if (gifResult.filename !== "sample_photo.gif") {
    throw new Error(`Filename mismatch: expected sample_photo.gif, got ${gifResult.filename}`);
  }
  console.log("✅ JPEG -> GIF transcode SUCCESS: 100% genuine GIF89a output.");

  // 3. Test JPEG -> WebP conversion
  console.log("\n3. Converting JPEG -> WebP...");
  const webpResult = await convertDocument({
    filename: "sample_photo.jpg",
    buffer: testJpegBuffer,
    fromFormat: "jpg",
    toFormat: "webp",
  });

  const magicWebp = detectMagicBytes(webpResult.data);
  if (magicWebp?.format !== "webp") {
    throw new Error(`Output was not a real WebP! Detected: ${magicWebp?.format}`);
  }
  console.log("✅ JPEG -> WebP transcode SUCCESS: 100% genuine WebP output.");

  // 4. Test JPEG -> PDF conversion
  console.log("\n4. Converting JPEG -> PDF...");
  const pdfResult = await convertDocument({
    filename: "sample_photo.jpg",
    buffer: testJpegBuffer,
    fromFormat: "jpg",
    toFormat: "pdf",
  });

  const magicPdf = detectMagicBytes(pdfResult.data);
  if (magicPdf?.format !== "pdf") {
    throw new Error(`Output was not a real PDF! Detected: ${magicPdf?.format}`);
  }
  console.log("✅ JPEG -> PDF transcode SUCCESS: 100% genuine PDF output.");

  // 5. Test Magic Byte Validation (Mismatch Detection)
  console.log("\n5. Testing Mismatch Validation (PNG buffer claiming to be JPEG)...");
  const testPngBuffer = await sharp({
    create: {
      width: 10,
      height: 10,
      channels: 4,
      background: { r: 0, g: 255, b: 0, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const mismatchCheck = validateFormatMagicBytes(testPngBuffer, "jpg");
  console.log("- Validation outcome:", mismatchCheck);
  if (mismatchCheck.valid !== false) {
    throw new Error("Magic bytes validator failed to reject mismatched PNG file claiming to be JPG");
  }
  console.log("✅ Magic Byte Validation SUCCESS: Correctly rejected mismatched file with clear error.");

  console.log("\n🎉 ALL TRANSCODER & MAGIC BYTE TESTS PASSED 100%!");
}

runTranscoderTests().catch((err) => {
  console.error("❌ Transcoder test failed:", err);
  process.exit(1);
});

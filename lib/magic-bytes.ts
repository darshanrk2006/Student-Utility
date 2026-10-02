/**
 * Magic Bytes Detection & File Validation
 * Validates actual binary headers to prevent corrupt files and format mismatches.
 */

export interface MagicDetectionResult {
  format: string;
  mime: string;
  label: string;
}

/**
 * Detects binary file format from initial header magic bytes
 */
export function detectMagicBytes(bytes: Uint8Array | Buffer): MagicDetectionResult | null {
  if (!bytes || bytes.length < 4) return null;

  // 1. JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { format: "jpg", mime: "image/jpeg", label: "JPEG Image" };
  }

  // 2. PNG: 89 50 4E 47 (0x89 'P' 'N' 'G')
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { format: "png", mime: "image/png", label: "PNG Image" };
  }

  // 3. GIF: 47 49 46 38 ('G' 'I' 'F' '8')
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { format: "gif", mime: "image/gif", label: "GIF Image" };
  }

  // 4. WebP: RIFF (bytes 0..3) ... WEBP (bytes 8..11)
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { format: "webp", mime: "image/webp", label: "WebP Image" };
  }

  // 5. PDF: 25 50 44 46 ('%' 'P' 'D' 'F')
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { format: "pdf", mime: "application/pdf", label: "PDF Document" };
  }

  // 6. Windows BMP: 42 4D ('B' 'M')
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return { format: "bmp", mime: "image/bmp", label: "Windows Bitmap" };
  }

  // 7. TIFF: 49 49 2A 00 ('I' 'I' * \0) or 4D 4D 00 2A ('M' 'M' \0 *)
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
    (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a)
  ) {
    return { format: "tiff", mime: "image/tiff", label: "TIFF Image" };
  }

  // 8. ZIP / OpenXML (DOCX, XLSX, PPTX, ODT, EPUB, Pages): 50 4B 03 04 ('P' 'K' 0x03 0x04)
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return { format: "zip", mime: "application/zip", label: "ZIP Package / Office XML" };
  }

  return null;
}

/**
 * Validates that the input bytes match the expected format based on magic bytes
 */
export function validateFormatMagicBytes(
  bytes: Uint8Array | Buffer,
  expectedFormat: string
): { valid: boolean; actualFormat?: string; message?: string } {
  const detected = detectMagicBytes(bytes);
  const normalizedExpected = expectedFormat.toLowerCase().replace(".", "");

  if (!detected) {
    // Text-based formats don't have binary magic bytes
    if (["txt", "csv", "tsv", "md", "html", "json", "xml", "rtf"].includes(normalizedExpected)) {
      return { valid: true };
    }
    return { valid: true };
  }

  // JPG / JPEG aliases
  if (
    (normalizedExpected === "jpg" || normalizedExpected === "jpeg") &&
    (detected.format === "jpg" || detected.format === "jpeg")
  ) {
    return { valid: true };
  }

  // Office ZIP packages (DOCX, XLSX, PPTX, ODT, EPUB, Pages)
  if (
    detected.format === "zip" &&
    ["docx", "xlsx", "pptx", "odt", "epub", "pages", "zip"].includes(normalizedExpected)
  ) {
    return { valid: true };
  }

  // TIFF aliases
  if (
    (normalizedExpected === "tiff" || normalizedExpected === "tif") &&
    detected.format === "tiff"
  ) {
    return { valid: true };
  }

  if (detected.format !== normalizedExpected) {
    return {
      valid: false,
      actualFormat: detected.format,
      message: `Selected format is .${normalizedExpected.toUpperCase()}, but file contents start with ${detected.label} signature (.${detected.format.toUpperCase()}). Please select .${detected.format.toUpperCase()} in the FROM panel or upload a valid .${normalizedExpected.toUpperCase()} file.`,
    };
  }

  return { valid: true };
}

import QRCode from "qrcode";
import { createZipArchive } from "./jszip-utils";

export interface QROptions {
  colorDark: string;
  colorLight: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  margin: number;
  width: number;
}

export const DEFAULT_QR_OPTIONS: QROptions = {
  colorDark: "#000000",
  colorLight: "#ffffff",
  errorCorrectionLevel: "M",
  margin: 2,
  width: 512,
};

/**
 * Generates PNG Data URL for a given string
 */
export async function generateQrPngDataUrl(
  text: string,
  options: Partial<QROptions> = {}
): Promise<string> {
  const opts = { ...DEFAULT_QR_OPTIONS, ...options };
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    width: opts.width,
    color: {
      dark: opts.colorDark,
      light: opts.colorLight,
    },
  });
}

/**
 * Generates SVG string for a given string
 */
export async function generateQrSvgString(
  text: string,
  options: Partial<QROptions> = {}
): Promise<string> {
  const opts = { ...DEFAULT_QR_OPTIONS, ...options };
  return await QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    width: opts.width,
    color: {
      dark: opts.colorDark,
      light: opts.colorLight,
    },
  });
}

/**
 * Generates multiple QR codes and bundles them into a ZIP archive
 */
export async function generateBulkQrZip(
  items: { text: string; label?: string }[],
  options: Partial<QROptions> = {},
  format: "png" | "svg" | "both" = "png"
): Promise<{ zipBlob: Blob; count: number }> {
  const files: { filename: string; data: string; isBase64?: boolean }[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const cleanLabel = (item.label || item.text.slice(0, 25))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const indexStr = String(i + 1).padStart(3, "0");
    const baseName = `qr_${indexStr}_${cleanLabel || "item"}`;

    if (format === "png" || format === "both") {
      const pngDataUrl = await generateQrPngDataUrl(item.text, options);
      files.push({
        filename: `${baseName}.png`,
        data: pngDataUrl,
        isBase64: true,
      });
    }

    if (format === "svg" || format === "both") {
      const svgString = await generateQrSvgString(item.text, options);
      files.push({
        filename: `${baseName}.svg`,
        data: svgString,
        isBase64: false,
      });
    }
  }

  const zipBlob = await createZipArchive(files);
  return { zipBlob, count: items.length };
}

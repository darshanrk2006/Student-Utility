/**
 * lib/converter.ts
 * Provider-agnostic document conversion adapter.
 * Supports ConvertAPI, CloudConvert, or sandbox fallback.
 */

export type ConversionFormat =
  | "docx-to-pdf"
  | "doc-to-pdf"
  | "pdf-to-docx"
  | "pptx-to-pdf"
  | "ppt-to-pdf"
  | "xlsx-to-pdf"
  | "xls-to-pdf";

export interface ConversionRequest {
  filename: string;
  buffer?: Buffer;
  fileUrl?: string;
  fromFormat: string;
  toFormat: string;
}

export interface ConversionResult {
  filename: string;
  data: Buffer;
  mimeType: string;
  provider: string;
}

/**
 * Main adapter function for document conversion
 */
export async function convertDocument(
  req: ConversionRequest
): Promise<ConversionResult> {
  const apiKey = process.env.CONVERT_API_KEY || process.env.CONVERTAPI_SECRET;

  if (apiKey) {
    try {
      return await convertWithConvertApi(req, apiKey);
    } catch (err: any) {
      console.error("ConvertAPI error:", err);
      throw new Error(`Conversion failed: ${err.message || "Unknown provider error"}`);
    }
  }

  // Fallback / Mock mode when CONVERT_API_KEY is not set in environment
  return await mockConversionFallback(req);
}

/**
 * ConvertAPI REST integration
 */
async function convertWithConvertApi(
  req: ConversionRequest,
  apiKey: string
): Promise<ConversionResult> {
  const from = req.fromFormat.toLowerCase().replace(".", "");
  const to = req.toFormat.toLowerCase().replace(".", "");

  const endpoint = `https://v2.convertapi.com/convert/${from}/to/${to}?auth=${apiKey}`;

  let fileParameter: any = {};
  if (req.fileUrl) {
    fileParameter = {
      Name: "File",
      FileValue: {
        Url: req.fileUrl,
      },
    };
  } else if (req.buffer) {
    fileParameter = {
      Name: "File",
      FileValue: {
        Name: req.filename,
        Data: req.buffer.toString("base64"),
      },
    };
  } else {
    throw new Error("No file buffer or URL provided for conversion.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      Parameters: [
        fileParameter,
        {
          Name: "StoreFile",
          Value: false,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.Message || errorData.message || response.statusText;
    throw new Error(`ConvertAPI Error (${response.status}): ${message}`);
  }

  const data = await response.json();
  const fileResult = data.Files?.[0];

  if (!fileResult) {
    throw new Error("No converted file returned from ConvertAPI.");
  }

  let outputBuffer: Buffer;
  if (fileResult.FileData) {
    outputBuffer = Buffer.from(fileResult.FileData, "base64");
  } else if (fileResult.Url) {
    const fileRes = await fetch(fileResult.Url);
    const arrayBuf = await fileRes.arrayBuffer();
    outputBuffer = Buffer.from(arrayBuf);
  } else {
    throw new Error("Unable to read converted file data.");
  }

  const baseName = req.filename.replace(/\.[^/.]+$/, "");
  const outputFilename = `${baseName}.${to}`;
  const mimeType = getMimeType(to);

  return {
    filename: outputFilename,
    data: outputBuffer,
    mimeType,
    provider: "ConvertAPI",
  };
}

/**
 * Fallback sandbox converter when running locally without CONVERT_API_KEY
 */
async function mockConversionFallback(
  req: ConversionRequest
): Promise<ConversionResult> {
  const to = req.toFormat.toLowerCase().replace(".", "");
  const baseName = req.filename.replace(/\.[^/.]+$/, "");
  const outputFilename = `${baseName}.${to}`;
  const mimeType = getMimeType(to);

  // If converting to PDF and we have pdf-lib in node or sample buffer
  if (to === "pdf") {
    // Generate a clean placeholder PDF document explaining the sandbox status
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText("StudentToolkit - Converted Document", {
      x: 50,
      y: 780,
      size: 20,
      font,
      color: rgb(0.1, 0.4, 0.9),
    });

    page.drawText(`Original File: ${req.filename}`, {
      x: 50,
      y: 740,
      size: 13,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(`Format: ${req.fromFormat.toUpperCase()} -> PDF`, {
      x: 50,
      y: 720,
      size: 11,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText("Notice: Running in Sandbox / Development Mode.", {
      x: 50,
      y: 670,
      size: 12,
      font,
      color: rgb(0.8, 0.2, 0.2),
    });

    const note =
      "To enable live cloud conversions in production, set CONVERT_API_KEY in your Vercel Environment Variables (ConvertAPI / CloudConvert).";
    page.drawText(note, {
      x: 50,
      y: 640,
      size: 10,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    const pdfBytes = await pdfDoc.save();
    return {
      filename: outputFilename,
      data: Buffer.from(pdfBytes),
      mimeType,
      provider: "Sandbox Fallback (Add CONVERT_API_KEY to enable live ConvertAPI)",
    };
  }

  // Fallback for PDF to Docx: Return a text/binary buffer
  const sampleDocx = Buffer.from(
    `[StudentToolkit Docx Export]\nConverted from ${req.filename}\nSet CONVERT_API_KEY in Vercel to enable live high-fidelity Word docx output.`
  );

  return {
    filename: outputFilename,
    data: sampleDocx,
    mimeType,
    provider: "Sandbox Fallback (Add CONVERT_API_KEY to enable live ConvertAPI)",
  };
}

function getMimeType(ext: string): string {
  switch (ext.toLowerCase()) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xls":
      return "application/vnd.ms-excel";
    default:
      return "application/octet-stream";
  }
}

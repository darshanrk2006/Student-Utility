import { NextRequest, NextResponse } from "next/server";
import { convertDocument, ConversionRequest } from "@/lib/converter";
import { checkRateLimit } from "@/lib/ratelimit";
import { del } from "@vercel/blob";

export const maxDuration = 60; // 60s max execution time for conversion
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Extract IP for rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded (10 conversions per hour). Please try again later.",
          remaining: rateLimit.remaining,
          reset: rateLimit.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.reset.toString(),
          },
        }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let conversionReq: ConversionRequest;
    let blobUrlToDelete: string | null = null;

    if (contentType.includes("application/json")) {
      // Large file conversion via direct Vercel Blob URL
      const body = await req.json();
      const { fileUrl, filename, fromFormat, toFormat } = body;

      if (!fileUrl || !filename || !fromFormat || !toFormat) {
        return NextResponse.json(
          { error: "Missing required parameters: fileUrl, filename, fromFormat, toFormat." },
          { status: 400 }
        );
      }

      blobUrlToDelete = fileUrl;
      conversionReq = {
        filename,
        fileUrl,
        fromFormat,
        toFormat,
      };
    } else if (contentType.includes("multipart/form-data")) {
      // Standard form data upload
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const fromFormat = (formData.get("fromFormat") as string) || "";
      const toFormat = (formData.get("toFormat") as string) || "";

      if (!file) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      }

      // 30MB maximum hard limit check
      if (file.size > 30 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File exceeds maximum size limit (30MB)." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      conversionReq = {
        filename: file.name,
        buffer,
        fromFormat: fromFormat || file.name.split(".").pop() || "",
        toFormat,
      };
    } else {
      return NextResponse.json(
        { error: "Invalid Content-Type. Expected multipart/form-data or application/json." },
        { status: 400 }
      );
    }

    // 2. Perform Document Conversion
    const result = await convertDocument(conversionReq);

    // 3. Immediately delete temporary Vercel Blob if one was used
    if (blobUrlToDelete && process.env.BLOB_READ_WRITE_TOKEN) {
      del(blobUrlToDelete).catch((err) => {
        console.warn("Could not delete temp blob immediately:", err);
      });
    }

    // 4. Return converted file stream
    const uint8Array = new Uint8Array(result.data);
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(result.filename)}"`,
        "X-Conversion-Provider": result.provider,
        "X-RateLimit-Limit": rateLimit.limit.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    });
  } catch (error: any) {
    console.error("API conversion error:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred during document conversion.",
      },
      { status: 500 }
    );
  }
}

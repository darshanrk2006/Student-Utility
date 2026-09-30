import { list, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Hourly cron endpoint to clean up orphaned temporary conversion files
 * Configured in vercel.json
 */
export async function GET(req: NextRequest) {
  // Check authorization header for Vercel Cron or secret if configured
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({
      message: "Vercel Blob storage not configured. No files to cleanup.",
      deletedCount: 0,
    });
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { blobs } = await list();

    const expiredBlobs = blobs.filter((blob) => {
      return new Date(blob.uploadedAt) < oneHourAgo;
    });

    if (expiredBlobs.length > 0) {
      const urlsToDelete = expiredBlobs.map((b) => b.url);
      await del(urlsToDelete);
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${expiredBlobs.length} expired temporary files.`,
      deletedCount: expiredBlobs.length,
    });
  } catch (error: any) {
    console.error("Cron cleanup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute cleanup cron." },
      { status: 500 }
    );
  }
}

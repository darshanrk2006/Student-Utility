import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const { prompt, systemInstruction } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "No server GEMINI_API_KEY configured. Fallback to smart engine.",
          useFallback: true,
        },
        { status: 200 }
      );
    }

    // Call Google Gemini 2.0 Flash / 1.5 Flash endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const body: any = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: err.error?.message || response.statusText,
          useFallback: true,
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({
      success: true,
      text: text.trim(),
      provider: "Google Gemini Flash",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error", useFallback: true },
      { status: 200 }
    );
  }
}

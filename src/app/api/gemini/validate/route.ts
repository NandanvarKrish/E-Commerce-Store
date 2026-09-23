import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      return NextResponse.json(
        { valid: false, error: "Please provide a valid API key." },
        { status: 400 }
      );
    }

    const trimmedKey = apiKey.trim();

    // Validate key against Google Gemini API models endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        trimmedKey
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.error?.message ||
        "Invalid Gemini API key. Please check your key from Google AI Studio.";
      return NextResponse.json({ valid: false, error: message }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      message: "Gemini API key is verified and operational!",
    });
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to Google Gemini service.",
      },
      { status: 500 }
    );
  }
}

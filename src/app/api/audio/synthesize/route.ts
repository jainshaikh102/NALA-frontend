import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, username } = body;

    // Validate required fields
    if (!text || !username) {
      return NextResponse.json(
        { error: "Text and username are required" },
        { status: 400 }
      );
    }

    // Validate text length
    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text is too long. Maximum 5000 characters allowed." },
        { status: 400 }
      );
    }

    // Make request to backend audio synthesis API
    const response = await fetch(`${API_BASE_URL}/audio/synthesize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.trim(),
        username: username,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Audio synthesis API error:", response.status, errorText);

      return NextResponse.json(
        {
          error: `Audio synthesis failed: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Check if response is JSON or audio data
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("audio/")) {

      const audioBuffer = await response.arrayBuffer();

      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": audioBuffer.byteLength.toString(),
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else if (contentType?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.byteLength.toString(),
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch (error) {
    console.error("Audio synthesis error:", error);

    return NextResponse.json(
      {
        error: "Internal server error during audio synthesis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

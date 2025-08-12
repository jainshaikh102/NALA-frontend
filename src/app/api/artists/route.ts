import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.nalabot.com";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/artists`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch artists" },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Artists API route - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

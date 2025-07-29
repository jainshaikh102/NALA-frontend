import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.nalabot.com";

export async function GET(request: NextRequest) {
  try {
    console.log("Artists API route - API_BASE_URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/artists`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Artists API route - Response status:", response.status);

    const data = await response.json();
    console.log("Artists API route - Response data:", data);

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

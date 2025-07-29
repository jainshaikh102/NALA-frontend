import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.nalabot.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Artists Select API route - POST - Body:", body);
    console.log("Artists Select API route - API_BASE_URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/artists/select`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Artists Select API route - POST - Response status:", response.status);

    const data = await response.json();
    console.log("Artists Select API route - POST - Response data:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to select artist" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Artists Select API route - POST - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

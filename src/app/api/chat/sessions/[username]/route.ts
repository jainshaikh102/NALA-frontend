import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.nalabot.com";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    console.log("Get Sessions API route - GET - Username:", username);
    console.log("Get Sessions API route - API_BASE_URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/chat/sessions/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Get Sessions API route - GET - Response status:", response.status);

    const data = await response.json();
    console.log("Get Sessions API route - GET - Response data:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.detail || "Failed to fetch chat sessions" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Get Sessions API route - GET - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

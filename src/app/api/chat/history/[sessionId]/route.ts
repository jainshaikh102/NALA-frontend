import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.nalabot.com";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    console.log("Get History API route - GET - Session ID:", sessionId);
    console.log("Get History API route - API_BASE_URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/history/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Get History API route - GET - Response status:", response.status);

    const data = await response.json();
    console.log("Get History API route - GET - Response data:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.detail || "Failed to fetch chat history" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Get History API route - GET - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

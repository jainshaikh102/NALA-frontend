import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.nalabot.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential } = body;
    if (!credential) {
      return NextResponse.json(
        { error: "Google credential is required" },
        { status: 400 }
      );
    }
    // Mock response for testing (remove this when backend is ready)
    const mockResponse = {
      user: {
        username: "google_user_" + Date.now(),
        full_name: "Google User",
        email: "user@example.com",
        payment_plan: "free",
        created_at: new Date().toISOString(),
      },
      access_token: "mock_token_" + Date.now(),
      token_type: "bearer",
    };
    return NextResponse.json(mockResponse, { status: 200 });
  } catch (error) {
    console.error("Google Auth API route - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

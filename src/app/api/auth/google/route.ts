import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.nalabot.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential } = body;

    console.log("Google Auth API route - Credential received");
    console.log("Google Auth API route - API_BASE_URL:", API_BASE_URL);

    if (!credential) {
      return NextResponse.json(
        { error: "Google credential is required" },
        { status: 400 }
      );
    }

    // TODO: Remove this mock response once backend endpoint is implemented
    console.log(
      "MOCK: Backend endpoint not implemented yet, using mock response"
    );

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

    console.log("Google Auth API route - Mock response:", mockResponse);
    return NextResponse.json(mockResponse, { status: 200 });

    // Uncomment this when your backend endpoint is ready:
    /*
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    });

    console.log("Google Auth API route - Backend response status:", response.status);

    const data = await response.json();
    console.log("Google Auth API route - Backend response data:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.detail || "Google authentication failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
    */
  } catch (error) {
    console.error("Google Auth API route - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

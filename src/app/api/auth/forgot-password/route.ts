import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.nalabot.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("Forgot Password API route - Request body:", body);
    console.log("Forgot Password API route - API_BASE_URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Forgot Password API route - Response status:", response.status);

    const data = await response.json();
    console.log("Forgot Password API route - Response data:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to send OTP" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Forgot Password API route - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

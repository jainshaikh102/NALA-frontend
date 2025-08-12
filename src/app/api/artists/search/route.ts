import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.nalabot.com";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Build query parameters for the backend
    const queryParams = new URLSearchParams();
    
    // Add search parameters
    const name = searchParams.get('name');
    const offset = searchParams.get('offset') || '0';
    const limit = searchParams.get('limit') || '50';
    
    if (name) {
      queryParams.append('name', name);
    }
    queryParams.append('offset', offset);
    queryParams.append('limit', limit);

    const response = await fetch(`${API_BASE_URL}/artists/search?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.detail || "Failed to fetch artists" },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Artists Search API route - GET - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

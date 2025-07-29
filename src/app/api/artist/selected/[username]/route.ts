import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.nalabot.com";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    console.log("Selected Artists API route - GET - Username:", username);
    console.log("Selected Artists API route - API_BASE_URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/artist/selected/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Selected Artists API route - GET - Response status:", response.status);

    const data = await response.json();
    console.log("Selected Artists API route - GET - Response data:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch selected artists" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Selected Artists API route - GET - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const body = await request.json();
    console.log("Selected Artists API route - DELETE - Username:", username);
    console.log("Selected Artists API route - DELETE - Body:", body);
    console.log("Selected Artists API route - API_BASE_URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/artist/selected/${username}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Selected Artists API route - DELETE - Response status:", response.status);

    const data = await response.json();
    console.log("Selected Artists API route - DELETE - Response data:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to remove artist" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Selected Artists API route - DELETE - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const body = await request.json();
    console.log("Selected Artists API route - POST - Username:", username);
    console.log("Selected Artists API route - POST - Body:", body);
    console.log("Selected Artists API route - API_BASE_URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/artist/selected/${username}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Selected Artists API route - POST - Response status:", response.status);

    const data = await response.json();
    console.log("Selected Artists API route - POST - Response data:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to add artist" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Selected Artists API route - POST - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

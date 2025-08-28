import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, session_id, username } = body;

    // Validate required fields
    if (!query || !session_id || !username) {
      return NextResponse.json(
        { error: "Query, session_id, and username are required" },
        { status: 400 }
      );
    }

    // Validate query length
    if (query.length > 2000) {
      return NextResponse.json(
        { error: "Query is too long. Maximum 2000 characters allowed." },
        { status: 400 }
      );
    }

    // Make request to backend execute query API
    const response = await fetch(`${API_BASE_URL}/chat/execute-query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: query.trim(),
        chat_session_id: session_id,
        username: username,
        model_name: "gemini-2.0-flash-001",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Execute query API error:", response.status, errorText);

      return NextResponse.json(
        {
          error: `Query execution failed: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Parse response
    const data = await response.json();

    // Validate response structure
    if (!data.answer_str && !data.error) {
      console.warn("Unexpected response structure:", data);
      return NextResponse.json(
        {
          error: "Invalid response from query execution service",
          details: "Missing answer_str field",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Execute query error:", error);

    return NextResponse.json(
      {
        error: "Internal server error during query execution",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Mock authentication - accept any email/password for testing
    if (email && password) {
      // Mock successful response matching backend format
      const mockResponse = {
        access_token: "mock_access_token_12345",
        token_type: "bearer",
        user: {
          username: email.split('@')[0],
          full_name: "Test User",
          email: email,
          payment_plan: "free",
          created_at: new Date().toISOString()
        }
      };

      return NextResponse.json(mockResponse);
    } else {
      return NextResponse.json(
        { detail: "Email and password are required" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { detail: "Invalid request" },
      { status: 400 }
    );
  }
}

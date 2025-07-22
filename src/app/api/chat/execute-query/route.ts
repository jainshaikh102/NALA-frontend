import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.question || !body.username || !body.model_name) {
      return NextResponse.json(
        { error: 'Missing required fields: question, username, model_name' },
        { status: 400 }
      );
    }

    // Forward the request to the NALA API
    const response = await fetch('http://35.209.131.186:8002/execute_query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: body.question,
        username: body.username,
        model_name: body.model_name,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NALA API Error:', errorText);
      return NextResponse.json(
        { error: `NALA API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Proxy API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

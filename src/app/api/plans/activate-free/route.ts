import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId } = body;

    // Validate the request
    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Validate that it's actually the free plan
    if (planId !== "starter") {
      return NextResponse.json(
        { error: "Invalid plan for free activation" },
        { status: 400 }
      );
    }

    // TODO: In a real application, you would:
    // 1. Get the user from the session/token
    // 2. Update the user's plan in the database
    // 3. Set up any necessary permissions/features
    // 4. Send welcome email, etc.

    // For now, we'll just simulate a successful activation
    console.log(`Activating free plan for user with planId: ${planId}`);

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: "Free plan activated successfully",
      plan: {
        id: planId,
        name: "Starter",
        price: 0,
        features: [
          "5 daily chat conversations",
          "Basic music analysis",
          "Standard audio quality",
          "Community support",
          "Basic virality insights"
        ]
      }
    });

  } catch (error) {
    console.error("Error activating free plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";

function PaymentConfirmationContent() {
  const [isConfirming, setIsConfirming] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();

  const plan = searchParams.get("plan") || "";
  const amount = searchParams.get("amount") || "0";
  const isFree = plan === "free";

  useEffect(() => {
    // Simulate payment confirmation process
    const confirmPayment = async () => {
      try {
        if (isFree) {
          // For free plan, confirm immediately
          setTimeout(() => {
            setIsConfirming(false);
            setIsConfirmed(true);
          }, 1000);
        } else {
          // For paid plans, simulate payment verification
          // TODO: Replace with actual payment verification API
          const response = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              plan,
              amount,
            }),
          });

          // Simulate processing time (2-3 seconds)
          setTimeout(() => {
            setIsConfirming(false);
            setIsConfirmed(response.ok);
          }, 2500);
        }
      } catch (error) {
        console.error("Payment confirmation error:", error);
        setTimeout(() => {
          setIsConfirming(false);
          setIsConfirmed(false);
        }, 2500);
      }
    };

    confirmPayment();
  }, [plan, amount, isFree]);

  useEffect(() => {
    // Start countdown when payment is confirmed
    if (isConfirmed && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isConfirmed && countdown === 0) {
      // Redirect to dashboard
      router.push("/dashboard");
    }
  }, [isConfirmed, countdown, router]);

  const handleContinueNow = () => {
    router.push("/dashboard");
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case "starter":
      case "free":
        return "Starter";
      case "pro":
        return "Pro";
      case "enterprise":
        return "Enterprise";
      default:
        return "Plan";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image
              src="/svgs/Golden-Paw.svg"
              alt="Nala Logo"
              width={32}
              height={32}
              className="text-primary"
            />
            <h1 className="text-2xl font-bold text-foreground">NALA</h1>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">
              {isConfirming
                ? "Processing..."
                : isConfirmed
                ? "Payment Confirmed!"
                : "Payment Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {isConfirming ? (
              // Processing State
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {isFree
                      ? "Setting up your free plan..."
                      : "Confirming your payment..."}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please wait while we process your request.
                  </p>
                </div>
              </div>
            ) : isConfirmed ? (
              // Success State
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-500 rounded-full p-3">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {isFree
                      ? "Welcome to NALA!"
                      : "Thank You for Your Payment!"}
                  </h3>
                  <p className="text-muted-foreground">
                    Your {getPlanName(plan)} plan is now active.
                    {!isFree &&
                      ` Payment of $${amount} has been processed successfully.`}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Redirecting to dashboard in{" "}
                    <span className="font-semibold text-primary">
                      {countdown}
                    </span>{" "}
                    seconds...
                  </p>
                </div>

                <Button
                  onClick={handleContinueNow}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Continue to Dashboard
                </Button>
              </div>
            ) : (
              // Error State
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-red-500 rounded-full p-3">
                    <span className="text-white text-xl">✕</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Payment Failed
                  </h3>
                  <p className="text-muted-foreground">
                    We couldn't process your payment. Please try again or
                    contact support.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/payments")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/support")}
                    className="w-full"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentConfirmationContent />
    </Suspense>
  );
}

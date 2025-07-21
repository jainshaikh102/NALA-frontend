"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import { useVerifyOTP } from "@/hooks/use-auth";

// Zod validation schema
const verifyOTPSchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>;

export default function VerifyOTPPage() {
  const [email, setEmail] = useState<string>("");
  const searchParams = useSearchParams();
  const verifyOTPMutation = useVerifyOTP();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOTPSchema),
  });

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const onSubmit = (data: VerifyOTPFormData) => {
    if (!email) {
      return;
    }
    
    verifyOTPMutation.mutate({
      email,
      otp: data.otp,
    });
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--container)" }}
    >
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Verify OTP
            </h1>
            <p className="text-muted-foreground">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* OTP Field */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Verification Code
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    {...register("otp")}
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className={`pl-10 bg-input border-border text-center text-2xl font-mono tracking-widest ${
                      errors.otp
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                </div>
                {errors.otp && (
                  <p className="text-sm text-destructive">
                    {errors.otp.message}
                  </p>
                )}
              </div>
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={verifyOTPMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {verifyOTPMutation.isPending ? "Verifying..." : "Verify OTP"}
            </Button>

            {/* Resend Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{" "}
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Resend OTP
                </Link>
              </p>
            </div>

            {/* Back to Sign In */}
            <div className="text-center">
              <Link
                href="/sign-in"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-primary/5 items-center justify-center p-8">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Secure Verification
            </h2>
            <p className="text-muted-foreground max-w-md">
              We've sent a secure verification code to your email address. 
              Enter it above to proceed with your password reset.
            </p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Code expires in 10 minutes</p>
            <p>• Check your spam folder if you don't see it</p>
            <p>• Contact support if you need help</p>
          </div>
        </div>
      </div>
    </div>
  );
}

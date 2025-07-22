"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyOTP, useForgotPassword } from "@/hooks/use-auth";
import { Shield } from "lucide-react";

// Zod validation schema
const verifyEmailSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

function VerifyEmailContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = searchParams.get("email") || "";

  // Use the proper hooks
  const verifyOTPMutation = useVerifyOTP();
  const forgotPasswordMutation = useForgotPassword();

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Update form value
    setValue("otp", newOtp.join(""));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
    setValue("otp", newOtp.join(""));

    // Focus the last filled input or the next empty one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const onSubmit = (data: VerifyEmailFormData) => {
    // Use the hook to verify OTP
    verifyOTPMutation.mutate({
      email,
      otp: data.otp,
    });
  };

  const handleResendOtp = () => {
    // Use the forgot password hook to resend OTP
    forgotPasswordMutation.mutate({ email });
    setCountdown(60);
    setCanResend(false);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--container)" }}
    >
      <div className="flex-1 flex flex-row items-center w-full justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-background rounded-3xl">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Image
                  src="/svgs/Golden-Paw.svg"
                  alt="Nala Logo"
                  width={32}
                  height={32}
                  className="text-primary"
                />
                <h1 className="text-3xl font-bold text-foreground">NALA</h1>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-2">
                  Verify Your Email
                </h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a 6-digit verification code to
                  <br />
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`w-12 h-12 text-center text-lg font-semibold bg-input border-border ${
                        errors.otp
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-sm text-destructive text-center">
                    {errors.otp.message}
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={
                  verifyOTPMutation.isPending || otp.join("").length !== 6
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {verifyOTPMutation.isPending ? "Verifying..." : "Verify Email"}
              </Button>

              {/* Resend OTP */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn&apos;t receive the code?
                </p>
                {canResend ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOtp}
                    disabled={forgotPasswordMutation.isPending}
                    className="text-primary hover:text-primary/80"
                  >
                    {forgotPasswordMutation.isPending
                      ? "Sending..."
                      : "Resend OTP"}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Resend OTP in {countdown}s
                  </p>
                )}
              </div>

              {/* Back Link */}
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Back to Forgot Password
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Mascot */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="relative">
            <Image
              src="/svgs/Bot-Lion.svg"
              alt="Nala Mascot"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";

// Zod validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send reset email");
      }

      const result = await response.json();

      // Success
      toast.success("Reset email sent! Check your inbox for the OTP.");

      // Redirect to verify email page with email parameter
      router.push(
        `/verify-email?email=${encodeURIComponent(data.email)}&type=reset`
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
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
                  Forgot Password?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we&apos;ll send you an OTP
                  <br />
                  to reset your password
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="username@gmail.com"
                    className={`pl-10 bg-input border-border ${
                      errors.email
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Send OTP Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>

              {/* Back to Sign In Link */}
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                </span>
                <Link
                  href="/sign-in"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Back to Sign In
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

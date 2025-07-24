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
import { Lock, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Zod validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password");
      }

      const result = await response.json();

      // Success
      toast.success(
        "Password reset successfully! You can now sign in with your new password."
      );

      // Redirect to sign in page
      router.push("/sign-in?reset=success");
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      console.error("Reset password error:", error);
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
                  Create New Password
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your new password must be different from
                  <br />
                  previously used passwords
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className={`pl-10 pr-10 bg-input border-border ${
                      errors.password
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className={`pl-10 pr-10 bg-input border-border ${
                      errors.confirmPassword
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-card/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Password must contain:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• At least 6 characters</li>
                  <li>• One uppercase letter (A-Z)</li>
                  <li>• One lowercase letter (a-z)</li>
                  <li>• One number (0-9)</li>
                </ul>
              </div>

              {/* Reset Password Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>

              {/* Back to Sign In Link */}
              <div className="text-center">
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

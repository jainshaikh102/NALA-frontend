"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRegister } from "@/hooks/use-auth";

// Zod validation schema
const signUpSchema = z
  .object({
    full_name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = (data: SignUpFormData) => {
    const registerData = {
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
      full_name: data.full_name,
    };
    console.log("Register data:", registerData);
    registerMutation.mutate(registerData);
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`${provider} login coming soon!`);
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
                  Welcome
                </h2>
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account with us? Signup to your NALA
                  account
                  <br />
                  with your email
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name Field */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    {...register("full_name")}
                    type="text"
                    placeholder="John Doe"
                    className={`pl-10 bg-input border-border ${
                      errors.full_name
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                </div>
                {errors.full_name && (
                  <p className="text-sm text-destructive">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

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

              {/* Password Fields - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
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
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className={`pl-10 pr-10 bg-input border-border ${
                        errors.confirmPassword
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {registerMutation.isPending ? "Creating Account..." : "Sign Up"}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("Facebook")}
                  className="flex-1 bg-card border-border hover:bg-accent"
                >
                  <Image
                    src="/svgs/Facebook-Icon.svg"
                    alt="Facebook"
                    width={10}
                    height={10}
                  />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("Google")}
                  className="flex-1 bg-card border-border hover:bg-accent"
                >
                  <Image
                    src="/svgs/Google-Icon.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("Apple")}
                  className="flex-1 bg-card border-border hover:bg-accent"
                >
                  <Image
                    src="/svgs/Apple-Icon.svg"
                    alt="Apple"
                    width={20}
                    height={20}
                  />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("Spotify")}
                  className="flex-1 bg-card border-border hover:bg-accent"
                >
                  <Image
                    src="/svgs/Spotify-Icon.svg"
                    alt="Spotify"
                    width={20}
                    height={20}
                  />
                </Button>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Already Have An Account?{" "}
                </span>
                <Link
                  href="/sign-in"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Login Now
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

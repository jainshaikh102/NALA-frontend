"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    username: z.string(),
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
      username: data.username,
      password: data.password,
      confirm_password: data.confirmPassword,
      full_name: data.full_name,
    };
    registerMutation.mutate(registerData);
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`${provider} login coming soon!`);
  };

  return (
    <div
      className="min-h-screen flex bg-background p-10"
      // style={{ backgroundColor: "var(--container)" }}
    >
      <div className="flex-1 flex flex-row items-center w-full justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-[#222C41] rounded-3xl">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-2xl space-y-8">
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
              <div className="grid grid-cols-2 gap-4">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <div
                    className={`flex items-center gap-2 p-4 border border-[#FFFFFF4D] rounded-xl bg-transparent min-h-[4rem] ${
                      errors.full_name
                        ? "border-destructive focus-within:ring-2 focus-within:ring-destructive"
                        : "focus-within:ring-2 focus-within:ring-primary"
                    }`}
                  >
                    {/* Icon */}
                    {/* <User className="text-primary h-5 w-5" /> */}

                    <Image
                      alt=""
                      src={"/svgs/UserIcon.svg"}
                      width={20}
                      height={20}
                      className="text-primary h-5 w-5"
                    />

                    {/* Divider */}
                    <div className="w-px h-8 bg-primary"></div>

                    {/* Label + Input */}
                    <div className="flex flex-col flex-1 justify-center">
                      <Label
                        htmlFor="full_name"
                        className="text-sm text-muted-foreground px-2"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="full_name"
                        {...register("full_name")}
                        type="text"
                        placeholder="John Doe"
                        className="border-none bg-transparent focus-visible:ring-0 focus:outline-none px-2"
                      />
                    </div>
                  </div>

                  {errors.full_name && (
                    <p className="text-sm text-destructive">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Username Field */}
                <div className="space-y-2">
                  <div
                    className={`flex items-center gap-2 p-4 border border-[#FFFFFF4D] rounded-xl bg-transparent min-h-[4rem] ${
                      errors.username
                        ? "border-destructive focus-within:ring-2 focus-within:ring-destructive"
                        : "focus-within:ring-2 focus-within:ring-primary"
                    }`}
                  >
                    {/* Icon */}
                    {/* <User className="text-primary h-5 w-5" /> */}

                    <Image
                      alt=""
                      src={"/svgs/UserIcon.svg"}
                      width={20}
                      height={20}
                      className="text-primary h-5 w-5"
                    />

                    {/* Divider */}
                    <div className="w-px h-8 bg-primary"></div>

                    {/* Label + Input */}
                    <div className="flex flex-col flex-1 justify-center">
                      <Label
                        htmlFor="username"
                        className="text-sm text-muted-foreground px-2"
                      >
                        Username
                      </Label>
                      <Input
                        id="username"
                        {...register("username")}
                        type="text"
                        placeholder="johndoe"
                        className="border-none bg-transparent focus-visible:ring-0 focus:outline-none px-2"
                      />
                    </div>
                  </div>

                  {errors.username && (
                    <p className="text-sm text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-2 p-4 border border-[#FFFFFF4D] rounded-xl bg-transparent min-h-[4rem] ${
                    errors.email
                      ? "border-destructive focus-within:ring-2 focus-within:ring-destructive"
                      : "focus-within:ring-2 focus-within:ring-primary"
                  }`}
                >
                  {/* Icon */}
                  <Image
                    alt=""
                    src={"/svgs/EmailIcon.svg"}
                    width={20}
                    height={20}
                    className="text-primary h-5 w-5"
                  />

                  {/* Divider */}
                  <div className="w-px h-8 bg-primary"></div>

                  {/* Label + Input */}
                  <div className="flex flex-col flex-1 justify-center">
                    <Label
                      htmlFor="email"
                      className="text-sm text-muted-foreground px-2"
                    >
                      Email Address / Username
                    </Label>
                    <Input
                      id="email"
                      {...register("email")}
                      type="email"
                      placeholder="username@gmail.com"
                      className="border-none bg-transparent focus-visible:ring-0 focus:outline-none px-2"
                    />
                  </div>
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
                  <div
                    className={`flex items-center gap-2 p-4 border border-[#FFFFFF4D] rounded-xl bg-transparent min-h-[4rem] ${
                      errors.password
                        ? "border-destructive focus-within:ring-2 focus-within:ring-destructive"
                        : "focus-within:ring-2 focus-within:ring-primary"
                    }`}
                  >
                    {/* Icon */}
                    {/* <Lock className="text-primary h-5 w-5" /> */}
                    <Image
                      alt=""
                      src={"/svgs/PassIcon.svg"}
                      width={20}
                      height={20}
                      className="text-primary h-5 w-5"
                    />

                    {/* Divider */}
                    <div className="w-px h-8 bg-primary"></div>

                    {/* Label + Input */}
                    <div className="flex flex-col flex-1 justify-center">
                      <Label
                        htmlFor="password"
                        className="text-sm text-muted-foreground px-2"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          {...register("password")}
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="border-none bg-transparent focus-visible:ring-0 focus:outline-none px-2 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <div
                    className={`flex items-center gap-2 p-4 border border-[#FFFFFF4D] rounded-xl bg-transparent min-h-[4rem] ${
                      errors.confirmPassword
                        ? "border-destructive focus-within:ring-2 focus-within:ring-destructive"
                        : "focus-within:ring-2 focus-within:ring-primary"
                    }`}
                  >
                    {/* Icon */}
                    {/* <Lock className="text-primary h-5 w-5" /> */}
                    <Image
                      alt=""
                      src={"/svgs/PassIcon.svg"}
                      width={20}
                      height={20}
                      className="text-primary h-5 w-5"
                    />

                    {/* Divider */}
                    <div className="w-px h-8 bg-primary"></div>

                    {/* Label + Input */}
                    <div className="flex flex-col flex-1 justify-center">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm text-muted-foreground px-2"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          {...register("confirmPassword")}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          className="border-none bg-transparent focus-visible:ring-0 focus:outline-none px-2 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
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
                  <span className="text-white bg-[#222C41] px-4">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="flex space-x-4 items-center justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("Facebook")}
                  className="bg-[#5E5F61] border-border hover:bg-accent h-12 w-12"
                >
                  <Image
                    src="/svgs/Facebook-Icon.svg"
                    alt="Facebook"
                    width={24}
                    height={24}
                  />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("Google")}
                  className="bg-[#5E5F61] border-border hover:bg-accent h-12 w-12"
                >
                  <Image
                    src="/svgs/Google-Icon.svg"
                    alt="Google"
                    width={24}
                    height={24}
                  />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("Apple")}
                  className="bg-[#5E5F61] border-border hover:bg-accent h-12 w-12"
                >
                  <Image
                    src="/svgs/Apple-Icon.svg"
                    alt="Apple"
                    width={24}
                    height={24}
                  />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("Spotify")}
                  className="bg-[#5E5F61] border-border hover:bg-accent h-12 w-12"
                >
                  <Image
                    src="/svgs/Spotify-Icon.svg"
                    alt="Spotify"
                    width={24}
                    height={24}
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
              width={550}
              height={550}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

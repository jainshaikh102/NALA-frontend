"use client";
import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-config";
import { useAuthStore, User } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

// Auth API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    username: string;
    full_name: string;
    email: string;
    payment_plan: string;
    created_at?: string;
  };
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
}

export interface RegisterResponse {
  message: string;
  username: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  reset_token: string;
}

export interface ResetPasswordRequest {
  reset_token: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: User;
}

// Custom authentication hooks
export function useLogin() {
  const { setAuth, setLoading } = useAuthStore();
  const router = useRouter();

  return useMutation<{ data: LoginResponse }, ApiError, LoginRequest>({
    mutationFn: async (data: LoginRequest) => {
      try {
        console.log("useLogin - Making request to:", "/api/auth/login");
        console.log("useLogin - Request data:", data);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Login failed");
        }

        const responseData = await response.json();
        console.log("useLogin - Response:", responseData);
        return { data: responseData };
      } catch (error) {
        console.error("useLogin - Error:", error);
        throw error;
      }
    },
    onMutate: () => {
      console.log("Login mutation started");
      setLoading(true);
    },
    onSuccess: (response) => {
      console.log("Login response:", response);
      const { user: backendUser, access_token } = response.data;

      // Transform backend user format to frontend User format
      const user: User = {
        id: backendUser.username, // Use username as ID since backend doesn't provide separate ID
        email: backendUser.email,
        username: backendUser.username,
        firstName: backendUser.full_name?.split(" ")[0] || "",
        lastName: backendUser.full_name?.split(" ").slice(1).join(" ") || "",
        createdAt: backendUser.created_at,
      };

      console.log("Transformed user:", user);
      setAuth(user, access_token); // No refresh token from backend
      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Login error:", error);
      setLoading(false);
      toast.error(error.message || "Login failed");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation<{ data: RegisterResponse }, ApiError, RegisterRequest>({
    mutationFn: async (data: RegisterRequest) => {
      try {
        console.log("useRegister - Making request to:", "/api/auth/signup");
        console.log("useRegister - Request data:", data);
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Registration failed");
        }

        const responseData = await response.json();
        console.log("useRegister - Response:", responseData);
        return { data: responseData };
      } catch (error) {
        console.error("useRegister - Error:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      toast.success(
        response.data.message ||
          "Registration successful! Please check your email to verify your account."
      );
      router.push("/sign-in");
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });
}

export function useForgotPassword() {
  const router = useRouter();

  return useMutation<
    { data: ForgotPasswordResponse },
    ApiError,
    ForgotPasswordRequest
  >({
    mutationFn: async (data: ForgotPasswordRequest) => {
      try {
        console.log(
          "useForgotPassword - Making request to:",
          "/api/auth/forgot-password"
        );
        console.log("useForgotPassword - Request data:", data);
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send OTP");
        }

        const responseData = await response.json();
        console.log("useForgotPassword - Response:", responseData);
        return { data: responseData };
      } catch (error) {
        console.error("useForgotPassword - Error:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      toast.success(response.data.message || "OTP sent to your email!");
      // Redirect to OTP verification page with email
      router.push(
        `/verify-otp?email=${encodeURIComponent(response.data.email)}`
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send OTP");
    },
  });
}

export function useVerifyOTP() {
  const router = useRouter();

  return useMutation<{ data: VerifyOTPResponse }, ApiError, VerifyOTPRequest>({
    mutationFn: async (data: VerifyOTPRequest) => {
      try {
        console.log(
          "useVerifyOTP - Making request to:",
          "/api/auth/verify-otp"
        );
        console.log("useVerifyOTP - Request data:", data);
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Invalid or expired OTP");
        }

        const responseData = await response.json();
        console.log("useVerifyOTP - Response:", responseData);
        return { data: responseData };
      } catch (error) {
        console.error("useVerifyOTP - Error:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log("response", response);
      toast.success(response.data.message || "OTP verified successfully!");
      // Store reset token temporarily and redirect to reset password page
      sessionStorage.setItem("reset_token", response.data.reset_token);
      router.push("/reset-password");
    },
    onError: (error) => {
      console.log("error", error);
      toast.error(error.message || "Invalid or expired OTP");
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation<
    { data: ResetPasswordResponse },
    ApiError,
    ResetPasswordRequest
  >({
    mutationFn: async (data: ResetPasswordRequest) => {
      try {
        console.log(
          "useResetPassword - Making request to:",
          "/api/auth/reset-password"
        );
        console.log("useResetPassword - Request data:", data);
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to reset password");
        }

        const responseData = await response.json();
        console.log("useResetPassword - Response:", responseData);
        return { data: responseData };
      } catch (error) {
        console.error("useResetPassword - Error:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      toast.success(response.data.message || "Password reset successfully!");
      // Clear reset token and redirect to login
      sessionStorage.removeItem("reset_token");
      router.push("/sign-in");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
}

export function useVerifyEmail() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation<
    { data: VerifyEmailResponse },
    ApiError,
    VerifyEmailRequest
  >({
    mutationFn: async (data: VerifyEmailRequest) => {
      try {
        console.log(
          "useVerifyEmail - Making request to:",
          "/api/auth/verify-email"
        );
        console.log("useVerifyEmail - Request data:", data);
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Email verification failed");
        }

        const responseData = await response.json();
        console.log("useVerifyEmail - Response:", responseData);
        return { data: responseData };
      } catch (error) {
        console.error("useVerifyEmail - Error:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      const { user, message } = response.data;
      setUser(user);
      toast.success(message || "Email verified successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Email verification failed");
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return {
    logout: () => {
      Cookies.remove("accessToken");
      // Cookies.remove("refreshToken");
      clearAuth();
      toast.success("Logged out successfully");
      router.push("/sign-in");
    },
  };
}

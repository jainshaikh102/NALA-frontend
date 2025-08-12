"use client";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore, User } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Google OAuth types
export interface GoogleAuthResponse {
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

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

// Declare global google object
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function useGoogleAuth() {
  const { setAuth, setLoading } = useAuthStore();
  const router = useRouter();

  const googleLoginMutation = useMutation<
    { data: GoogleAuthResponse },
    Error,
    string
  >({
    mutationFn: async (credential: string) => {
      try {
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credential }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Google authentication failed");
        }

        const responseData = await response.json();
        return { data: responseData };
      } catch (error) {
        console.error("Google Auth - Error:", error);
        throw error;
      }
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (response) => {
      const { user: backendUser, access_token } = response.data;

      // Transform backend user format to frontend User format
      const user: User = {
        id: backendUser.username,
        email: backendUser.email,
        username: backendUser.username,
        firstName: backendUser.full_name?.split(" ")[0] || "",
        lastName: backendUser.full_name?.split(" ").slice(1).join(" ") || "",
        createdAt: backendUser.created_at,
      };
      setAuth(user, access_token);
      toast.success("Google login successful!");
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setLoading(false);
      toast.error(error.message || "Google login failed");
    },
  });

  const initializeGoogleAuth = () => {
    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (response: GoogleCredentialResponse) => {
          googleLoginMutation.mutate(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  };

  const renderGoogleButton = (element: HTMLElement) => {
    if (typeof window !== "undefined" && window.google && element) {
      window.google.accounts.id.renderButton(element, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "signin_with",
        shape: "rectangular",
      });
    }
  };

  return {
    initializeGoogleAuth,
    renderGoogleButton,
    isLoading: googleLoginMutation.isPending,
  };
}

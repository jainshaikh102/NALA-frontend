"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useGoogleLogin } from "@/hooks/use-auth";
import GoogleIcon from "@/public/svgs/Google-Icon.svg";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              type?: "standard" | "icon";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              logo_alignment?: "left" | "center";
              width?: string;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  className = "",
}: GoogleSignInButtonProps) {
  const buttonRef = useRef(null);
  const googleLoginMutation = useGoogleLogin();

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && buttonRef.current) {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!clientId) {
          onError?.("Google Client ID not configured");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear any existing content
        buttonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "signin_with",
          logo_alignment: "left",
          width: "100%",
        });
      }
    };

    const handleCredentialResponse = (response: { credential: string }) => {
      googleLoginMutation.mutate(
        { credential: response.credential },
        {
          onSuccess: () => {
            console.log("Google login successful!");
            onSuccess?.();
          },
          onError: (error) => {
            console.error("Google login error:", error);
            onError?.(error.message || "Google login failed");
          },
        }
      );
    };

    // Check if Google script is loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google script to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkGoogleLoaded), 10000);
    }
  }, [googleLoginMutation, onSuccess, onError]);

  return (
    <>
      <div className={`w-full ${className}`} ref={buttonRef}>
        <Button
          type="button"
          variant="outline"
          className="flex w-full bg-card border-border hover:bg-accent"
        >
          <img
            src="/svgs/Google-Icon.svg"
            alt="Google"
            width={20}
            height={20}
          />
        </Button>
      </div>
      {/* <div className={`w-full ${className}`}>
        <div
          ref={buttonRef}
          className={`w-full ${
            disabled ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {" "}
          <Image
            src="/svgs/Google-Icon.svg"
            alt="Google"
            width={20}
            height={20}
          />
        </div>

        {googleLoginMutation.isPending && (
          <div className="flex items-center justify-center mt-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">
              Signing in with Google...
            </span>
          </div>
        )}
      </div> */}
    </>
  );
}

// Fallback button component if Google script fails to load
export function GoogleSignInFallback({
  onClick,
  disabled = false,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-card border-border hover:bg-accent ${className}`}
    >
      <Image
        src="/svgs/Google-Icon.svg"
        alt="Google"
        width={20}
        height={20}
        className="mr-2"
      />
      Continue with Google
    </Button>
  );
}

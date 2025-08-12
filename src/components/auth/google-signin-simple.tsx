"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useGoogleLogin } from "@/hooks/use-auth";

interface GoogleSignInSimpleProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

declare global {
  interface Window {
    handleGoogleSignIn: (response: any) => void;
  }
}

export function GoogleSignInSimple({
  onSuccess,
  onError,
  disabled = false,
  className = "",
}: GoogleSignInSimpleProps) {
  const googleLoginMutation = useGoogleLogin();

  useEffect(() => {
    // Create global callback function
    window.handleGoogleSignIn = (response: any) => {
      console.log("Google Sign-In Response:", response);

      if (response.credential) {
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
      } else {
        console.error("No credential received from Google");
        onError?.("No credential received from Google");
      }
    };

    // Wait for Google to be ready and initialize
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max wait time

    const initializeGoogle = () => {
      retryCount++;
      console.log(
        `Checking for Google Identity Services... (attempt ${retryCount})`
      );

      if (typeof window !== "undefined" && window.google) {
        console.log("✅ Google Identity Services loaded successfully");
        console.log("Google object:", window.google);

        // Try to initialize Google Sign-In
        if (clientId) {
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: window.handleGoogleSignIn,
            });
            console.log("✅ Google Sign-In initialized successfully");
          } catch (error) {
            console.error("❌ Failed to initialize Google Sign-In:", error);
          }
        } else {
          console.error("❌ Google Client ID not found");
        }
      } else if (retryCount < maxRetries) {
        // Retry after a short delay
        setTimeout(initializeGoogle, 100);
      } else {
        console.error(
          "❌ Google Identity Services failed to load after 5 seconds"
        );
        onError?.("Google Sign-In failed to load");
      }
    };

    initializeGoogle();

    // Cleanup
    return () => {
      (window as any).handleGoogleSignIn = undefined;
    };
  }, [googleLoginMutation, onSuccess, onError]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error("Google Client ID not found in environment variables");
    return (
      <Button disabled className={`w-full ${className}`}>
        Google Client ID not configured
      </Button>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden Google Sign-In elements */}
      <div
        id="g_id_onload"
        data-client_id={clientId}
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleGoogleSignIn"
        data-auto_prompt="false"
        style={{ display: "none" }}
      ></div>

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
        data-width="100%"
        style={{ display: "none" }}
      ></div>

      {/* Your custom button design */}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          console.log("Custom Google button clicked");

          // First check if Google is loaded
          if (!window.google) {
            console.error("Google Identity Services not loaded");
            onError?.("Google Sign-In is not available");
            return;
          }

          // Try multiple approaches to trigger Google Sign-In
          try {
            // Method 1: Try to find and click the hidden Google button
            const googleButton = document.querySelector(
              '.g_id_signin div[role="button"]'
            ) as HTMLElement;

            if (googleButton) {
              console.log("Found Google button, clicking it");
              googleButton.click();
              return;
            }

            // Method 2: Try using Google's prompt method
            console.log("Google button not found, trying prompt method");
            if (window.google.accounts?.id?.prompt) {
              try {
                console.log("Calling Google prompt...");
                window.google.accounts.id.prompt();
                console.log("Google prompt called successfully");
                return;
              } catch (promptError) {
                console.error("Google prompt failed:", promptError);
              }
            } else {
              console.log("Google prompt method not available");
            }

            // Method 3: Initialize and render a temporary button
            console.log(
              "Prompt method not available, creating temporary button"
            );
            const tempContainer = document.createElement("div");
            tempContainer.style.position = "absolute";
            tempContainer.style.left = "-9999px";
            document.body.appendChild(tempContainer);

            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: window.handleGoogleSignIn,
            });

            window.google.accounts.id.renderButton(tempContainer, {
              theme: "outline",
              size: "large",
            });

            setTimeout(() => {
              const tempButton = tempContainer.querySelector(
                'div[role="button"]'
              ) as HTMLElement;
              if (tempButton) {
                tempButton.click();
              }
              document.body.removeChild(tempContainer);
            }, 100);
          } catch (error) {
            console.error("All Google Sign-In methods failed:", error);
            onError?.("Google Sign-In failed to initialize");
          }
        }}
        disabled={disabled || googleLoginMutation.isPending}
        className="flex-1 bg-card border-border hover:bg-accent"
      >
        {googleLoginMutation.isPending ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        ) : (
          <Image
            src="/svgs/Google-Icon.svg"
            alt="Google"
            width={20}
            height={20}
          />
        )}
      </Button>
    </div>
  );
}

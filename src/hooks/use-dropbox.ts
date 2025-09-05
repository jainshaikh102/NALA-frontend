"use client";
import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Dropbox API types
export interface DropboxFile {
  id: string;
  name: string;
  path_lower: string;
  path_display: string;
  size: number;
  server_modified: string;
  content_hash?: string;
  is_downloadable: boolean;
}

export interface DropboxAuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

// Safe storage utility
const safeStorage = {
  getItem: (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};

export function useDropbox() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Connect to Dropbox using OAuth 2.0 PKCE flow
  const connectDropbox = useMutation({
    mutationFn: async () => {
      const clientId = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY;

      if (!clientId) {
        throw new Error("Dropbox App Key not configured");
      }

      console.log("Dropbox Debug Info:", {
        clientId,
        origin: window.location.origin,
        redirectUri: `${window.location.origin}/api/auth/dropbox/callback`
      });

      // Generate code verifier and challenge for PKCE
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Store code verifier for later use
      safeStorage.setItem("dropbox_code_verifier", codeVerifier);

      const authUrl = new URL("https://www.dropbox.com/oauth2/authorize");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      authUrl.searchParams.set("redirect_uri", `${window.location.origin}/api/auth/dropbox/callback`);
      authUrl.searchParams.set("scope", "files.metadata.read files.content.read");

      console.log("Dropbox Auth URL:", authUrl.toString());

      // Open popup window for OAuth
      const popup = window.open(
        authUrl.toString(),
        "dropbox-auth",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Check if we got the token
            const token = safeStorage.getItem("dropbox_access_token");
            if (token) {
              setAccessToken(token);
              setIsConnected(true);
              resolve({ access_token: token });
            } else {
              reject(new Error("Authentication cancelled or failed"));
            }
          }
        }, 1000);

        // Listen for messages from popup
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === "DROPBOX_AUTH_SUCCESS") {
            clearInterval(checkClosed);
            popup?.close();
            setAccessToken(event.data.token);
            setIsConnected(true);
            safeStorage.setItem("dropbox_access_token", event.data.token);
            window.removeEventListener("message", messageHandler);
            resolve({ access_token: event.data.token });
          } else if (event.data.type === "DROPBOX_AUTH_ERROR") {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener("message", messageHandler);
            reject(new Error(event.data.error || "Authentication failed"));
          }
        };

        window.addEventListener("message", messageHandler);
      });
    },
  });

  // Fetch Dropbox files
  const fetchDropboxFiles = useQuery({
    queryKey: ["dropbox-files", accessToken],
    queryFn: async (): Promise<DropboxFile[]> => {
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "",
          recursive: false,
          include_media_info: false,
          include_deleted: false,
          include_has_explicit_shared_members: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Dropbox files");
      }

      const data = await response.json();
      return data.entries?.filter((entry: any) => entry[".tag"] === "file") || [];
    },
    enabled: !!accessToken && isConnected,
  });

  // Download file from Dropbox
  const downloadDropboxFile = useMutation({
    mutationFn: async (file: DropboxFile): Promise<File> => {
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await fetch("https://content.dropboxapi.com/2/files/download", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Dropbox-API-Arg": JSON.stringify({ path: file.path_lower }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadedFile = new File([blob], file.name, {
        type: blob.type || "application/octet-stream",
        lastModified: new Date(file.server_modified).getTime(),
      });

      return downloadedFile;
    },
  });

  // Download multiple files from Dropbox
  const downloadMultipleDropboxFiles = useMutation({
    mutationFn: async (files: DropboxFile[]): Promise<File[]> => {
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const downloadPromises = files.map(async (file) => {
        try {
          const response = await fetch("https://content.dropboxapi.com/2/files/download", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Dropbox-API-Arg": JSON.stringify({ path: file.path_lower }),
            },
          });

          if (!response.ok) {
            if (response.status === 403) {
              throw new Error(`Access denied for ${file.name}. Please ensure you have permission to download this file.`);
            } else if (response.status === 404) {
              throw new Error(`File ${file.name} not found or has been deleted.`);
            } else {
              throw new Error(`Failed to download ${file.name}: ${response.status} ${response.statusText}`);
            }
          }

          const blob = await response.blob();
          return new File([blob], file.name, {
            type: blob.type || "application/octet-stream",
            lastModified: new Date(file.server_modified).getTime(),
          });
        } catch (error) {
          console.error(`Error downloading ${file.name}:`, error);
          throw error;
        }
      });

      const results = await Promise.allSettled(downloadPromises);
      const successfulDownloads: File[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulDownloads.push(result.value);
        } else {
          errors.push(`${files[index].name}: ${result.reason.message}`);
        }
      });

      if (errors.length > 0 && successfulDownloads.length === 0) {
        throw new Error(`All downloads failed: ${errors.join(", ")}`);
      }

      if (errors.length > 0) {
        console.warn("Some downloads failed:", errors);
      }

      return successfulDownloads;
    },
  });

  // Disconnect Dropbox
  const disconnectDropbox = useCallback(() => {
    setAccessToken(null);
    setIsConnected(false);
    safeStorage.removeItem("dropbox_access_token");
    safeStorage.removeItem("dropbox_code_verifier");
    toast.success("Dropbox disconnected");
  }, []);

  // Check if already connected on mount
  const checkExistingConnection = useCallback(() => {
    const storedToken = safeStorage.getItem("dropbox_access_token");
    if (storedToken) {
      setAccessToken(storedToken);
      setIsConnected(true);
    }
  }, []);

  // Force re-authentication
  const forceReconnect = useMutation({
    mutationFn: async () => {
      safeStorage.removeItem("dropbox_access_token");
      safeStorage.removeItem("dropbox_code_verifier");
      setAccessToken(null);
      setIsConnected(false);
      await connectDropbox.mutateAsync();
    },
  });

  return {
    isConnected,
    accessToken,
    connectDropbox,
    disconnectDropbox,
    fetchDropboxFiles,
    checkExistingConnection,
    downloadDropboxFile,
    downloadMultipleDropboxFiles,
    forceReconnect,
    isConnecting: connectDropbox.isPending,
    dropboxFiles: fetchDropboxFiles.data || [],
    isLoadingFiles: fetchDropboxFiles.isLoading,
    isDownloading: downloadDropboxFile.isPending || downloadMultipleDropboxFiles.isPending,
  };
}

// PKCE helper functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
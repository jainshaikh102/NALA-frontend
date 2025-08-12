"use client";
import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Google Drive API types
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink: string;
  iconLink?: string;
  parents?: string[];
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
  files: GoogleDriveFile[];
}

export interface DriveAuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
}

// Google Drive OAuth scopes
const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.file",
].join(" ");

// Extend Window interface for Google APIs
declare global {
  interface Window {
    google: {
      accounts: {
        id: any;
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

// Safe storage utility
const safeStorage = {
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== "undefined") {
        if (window.localStorage) {
          localStorage.setItem(key, value);
        } else if (window.sessionStorage) {
          sessionStorage.setItem(key, value);
        }
      }
    } catch (error) {
      console.warn("Storage not available:", error);
    }
  },
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined") {
        if (window.localStorage) {
          return localStorage.getItem(key);
        } else if (window.sessionStorage) {
          return sessionStorage.getItem(key);
        }
      }
    } catch (error) {
      console.warn("Storage not available:", error);
    }
    return null;
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== "undefined") {
        if (window.localStorage) {
          localStorage.removeItem(key);
        } else if (window.sessionStorage) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn("Storage not available:", error);
    }
  },
};

export function useGoogleDrive() {
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Initialize Google Drive OAuth
  const initializeDriveAuth = useCallback(() => {
    if (typeof window !== "undefined" && window.google) {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        toast.error("Google Client ID not configured");
        return;
      }

      // Initialize Google OAuth for Drive
      window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: DRIVE_SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            setAccessToken(response.access_token);
            setIsConnected(true);
            toast.success("Google Drive connected successfully!");

            // Store token for API calls
            localStorage.setItem("google_drive_token", response.access_token);
          } else {
            toast.error("Failed to connect Google Drive");
          }
        },
      });
    }
  }, []);

  // Connect to Google Drive
  const connectDrive = useMutation({
    mutationFn: async () => {
      if (typeof window !== "undefined" && window.google) {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!clientId) {
          throw new Error("Google Client ID not configured");
        }

        return new Promise((resolve, reject) => {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: DRIVE_SCOPES,
            callback: (response: any) => {
              if (response.access_token) {
                setAccessToken(response.access_token);
                setIsConnected(true);

                // Safely store token
                safeStorage.setItem(
                  "google_drive_token",
                  response.access_token
                );

                resolve(response);
              } else {
                reject(new Error("Failed to get access token"));
              }
            },
          });

          tokenClient.requestAccessToken();
        });
      } else {
        throw new Error("Google API not loaded");
      }
    },
    onSuccess: () => {
      toast.success("Google Drive connected successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to connect Google Drive");
    },
  });

  // Fetch Drive files
  const fetchDriveFiles = useQuery({
    queryKey: ["drive-files", accessToken],
    queryFn: async (): Promise<GoogleDriveFile[]> => {
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,parents)",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Drive files");
      }

      const data = await response.json();
      return data.files || [];
    },
    enabled: !!accessToken && isConnected,
  });

  // Disconnect Drive
  const disconnectDrive = useCallback(() => {
    setAccessToken(null);
    setIsConnected(false);
    safeStorage.removeItem("google_drive_token");
    toast.success("Google Drive disconnected");
  }, []);

  // Check if already connected on mount
  const checkExistingConnection = useCallback(() => {
    const storedToken = safeStorage.getItem("google_drive_token");
    if (storedToken) {
      setAccessToken(storedToken);
      setIsConnected(true);
    }
  }, []);

  return {
    isConnected,
    accessToken,
    connectDrive,
    disconnectDrive,
    fetchDriveFiles,
    initializeDriveAuth,
    checkExistingConnection,
    isConnecting: connectDrive.isPending,
    driveFiles: fetchDriveFiles.data || [],
    isLoadingFiles: fetchDriveFiles.isLoading,
  };
}

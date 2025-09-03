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
  "https://www.googleapis.com/auth/drive",
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

  // Force re-authentication with updated scopes
  const forceReconnect = useMutation({
    mutationFn: async () => {
      // Clear existing token
      safeStorage.removeItem("google_drive_token");
      setAccessToken(null);
      setIsConnected(false);

      // Force new authentication
      await connectDrive.mutateAsync();
    },
  });

  // Download file from Google Drive
  const downloadDriveFile = useMutation({
    mutationFn: async (file: GoogleDriveFile): Promise<File> => {
      if (!accessToken) {
        throw new Error("No access token available");
      }

      // Get file content from Google Drive
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create File object with proper mime type
      const downloadedFile = new File([blob], file.name, {
        type: file.mimeType || "application/octet-stream",
        lastModified: new Date(file.modifiedTime).getTime(),
      });

      return downloadedFile;
    },
  });

  // Download multiple files from Google Drive
  const downloadMultipleDriveFiles = useMutation({
    mutationFn: async (files: GoogleDriveFile[]): Promise<File[]> => {
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const downloadPromises = files.map(async (file) => {
        try {
          // Check if file is a Google Workspace document that needs export
          let downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
          let exportMimeType = file.mimeType;

          // Handle Google Workspace documents
          if (file.mimeType?.startsWith("application/vnd.google-apps.")) {
            // Export Google Docs as PDF or other formats
            if (file.mimeType === "application/vnd.google-apps.document") {
              downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`;
              exportMimeType = "application/pdf";
            } else if (
              file.mimeType === "application/vnd.google-apps.spreadsheet"
            ) {
              downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
              exportMimeType =
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else if (
              file.mimeType === "application/vnd.google-apps.presentation"
            ) {
              downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`;
              exportMimeType = "application/pdf";
            } else {
              throw new Error(
                `Unsupported Google Workspace file type: ${file.mimeType}`
              );
            }
          }

          const response = await fetch(downloadUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            if (response.status === 403) {
              throw new Error(
                `Access denied for ${file.name}. Please ensure you have permission to download this file and try reconnecting to Google Drive.`
              );
            } else if (response.status === 404) {
              throw new Error(
                `File ${file.name} not found or has been deleted.`
              );
            } else {
              throw new Error(
                `Failed to download ${file.name}: ${response.status} ${response.statusText}`
              );
            }
          }

          const blob = await response.blob();

          // Use export mime type for Google Workspace documents
          const finalMimeType = exportMimeType || "application/octet-stream";

          return new File([blob], file.name, {
            type: finalMimeType,
            lastModified: new Date(file.modifiedTime).getTime(),
          });
        } catch (error) {
          console.error(`Error downloading ${file.name}:`, error);
          throw error;
        }
      });

      return Promise.all(downloadPromises);
    },
  });

  return {
    isConnected,
    accessToken,
    connectDrive,
    disconnectDrive,
    fetchDriveFiles,
    initializeDriveAuth,
    checkExistingConnection,
    downloadDriveFile,
    downloadMultipleDriveFiles,
    forceReconnect,
    isConnecting: connectDrive.isPending,
    driveFiles: fetchDriveFiles.data || [],
    isLoadingFiles: fetchDriveFiles.isLoading,
    isDownloading:
      downloadDriveFile.isPending || downloadMultipleDriveFiles.isPending,
  };
}

"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGoogleDrive, GoogleDriveFile } from "./use-google-drive";
import { useAuthStore } from "@/store/auth-store";

export interface GoogleDriveUploadResult {
  success: boolean;
  fileName: string;
  gcsUrl: string;
  ragResponse?: any;
}

export interface GoogleDriveUploadProgress {
  fileName: string;
  stage: "downloading" | "uploading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

export function useGoogleDriveUpload(
  googleDriveHook?: ReturnType<typeof useGoogleDrive>
) {
  const defaultGoogleDriveHook = useGoogleDrive();
  const actualGoogleDriveHook = googleDriveHook || defaultGoogleDriveHook;
  const {
    downloadMultipleDriveFiles,
    accessToken,
    isConnected,
    forceReconnect,
  } = actualGoogleDriveHook;
  const { user } = useAuthStore();
  const [uploadProgress, setUploadProgress] = useState<
    GoogleDriveUploadProgress[]
  >([]);

  // Upload a single file from Google Drive to GCS and then to RAG
  const uploadGoogleDriveFile = async (
    file: GoogleDriveFile,
    chatSessionId: string
  ): Promise<GoogleDriveUploadResult> => {
    if (!user?.username) {
      throw new Error("User not authenticated");
    }

    if (!isConnected || !accessToken) {
      throw new Error(
        "Google Drive not connected. Please reconnect and try again."
      );
    }

    // Update progress - downloading
    setUploadProgress((prev) => [
      ...prev.filter((p) => p.fileName !== file.name),
      { fileName: file.name, stage: "downloading", progress: 0 },
    ]);

    try {
      // Step 1: Download single file from Google Drive
      const downloadedFiles = await downloadMultipleDriveFiles.mutateAsync([
        file,
      ]);
      const downloadedFile = downloadedFiles[0];

      if (!downloadedFile) {
        throw new Error(`Failed to download file: ${file.name}`);
      }

      // Update progress - uploading to GCS
      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name
            ? { ...p, stage: "uploading", progress: 30 }
            : p
        )
      );

      // Step 2: Upload to Google Cloud Storage
      const formData = new FormData();
      formData.append("file", downloadedFile);
      formData.append("username", user.username);
      formData.append("chat_session_id", chatSessionId);

      const gcsResponse = await fetch("/api/googleStorage/upload", {
        method: "POST",
        body: formData,
      });

      if (!gcsResponse.ok) {
        const errorText = await gcsResponse.text();
        throw new Error(`GCS upload failed: ${errorText}`);
      }

      const { success, gcsUrl, fileName } = await gcsResponse.json();
      if (!success) {
        throw new Error("GCS upload failed");
      }

      // Update progress - processing with RAG
      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name
            ? { ...p, stage: "processing", progress: 70 }
            : p
        )
      );

      // Step 3: Send to RAG API
      const ragResponse = await fetch("/api/rag/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gcs_url: gcsUrl,
          username: user.username,
          chat_session_id: chatSessionId,
          file_name: fileName,
        }),
      });

      if (!ragResponse.ok) {
        const errorData = await ragResponse.json();
        throw new Error(
          `RAG upload failed: ${errorData.error || "Unknown error"}`
        );
      }

      const ragData = await ragResponse.json();

      // Update progress - complete
      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name
            ? { ...p, stage: "complete", progress: 100 }
            : p
        )
      );

      return {
        success: true,
        fileName,
        gcsUrl,
        ragResponse: ragData,
      };
    } catch (error) {
      // Update progress - error
      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name
            ? { ...p, stage: "error", progress: 0, error: error.message }
            : p
        )
      );
      throw error;
    }
  };

  // Upload multiple files from Google Drive
  const uploadMultipleGoogleDriveFiles = useMutation({
    mutationFn: async ({
      files,
      chatSessionId,
    }: {
      files: GoogleDriveFile[];
      chatSessionId: string;
    }): Promise<GoogleDriveUploadResult[]> => {
      if (!user?.username) {
        throw new Error("User not authenticated");
      }

      if (!isConnected || !accessToken) {
        throw new Error(
          "Google Drive not connected. Please reconnect and try again."
        );
      }

      // Initialize progress for all files
      setUploadProgress(
        files.map((file) => ({
          fileName: file.name,
          stage: "downloading" as const,
          progress: 0,
        }))
      );

      const results: GoogleDriveUploadResult[] = [];
      const errors: string[] = [];

      // Process files sequentially to avoid overwhelming the APIs
      for (const file of files) {
        try {
          const result = await uploadGoogleDriveFile(file, chatSessionId);
          results.push(result);
          toast.success(`Successfully uploaded ${file.name}`);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          errors.push(`${file.name}: ${errorMessage}`);

          // Check if it's a permission error and suggest re-authentication
          if (
            errorMessage.includes("Access denied") ||
            errorMessage.includes("403")
          ) {
            toast.error(
              `Permission denied for ${file.name}. Try reconnecting to Google Drive with updated permissions.`,
              {
                action: {
                  label: "Reconnect",
                  onClick: () => forceReconnect.mutate(),
                },
              }
            );
          } else {
            toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
          }
        }
      }

      if (errors.length > 0 && results.length === 0) {
        throw new Error(`All uploads failed: ${errors.join(", ")}`);
      }

      if (errors.length > 0) {
        toast.warning(
          `${results.length} files uploaded successfully, ${errors.length} failed`
        );
      } else {
        toast.success(`All ${results.length} files uploaded successfully!`);
      }

      return results;
    },
  });

  // Clear progress
  const clearProgress = () => {
    setUploadProgress([]);
  };

  return {
    uploadMultipleGoogleDriveFiles,
    uploadProgress,
    clearProgress,
    isUploading: uploadMultipleGoogleDriveFiles.isPending,
  };
}

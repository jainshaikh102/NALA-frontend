"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDropbox, DropboxFile } from "./use-dropbox";
import { useAuthStore } from "@/store/auth-store";

export interface DropboxUploadResult {
  success: boolean;
  fileName: string;
  gcsUrl: string;
  ragResponse?: any;
}

export interface DropboxUploadProgress {
  fileName: string;
  stage: "downloading" | "uploading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

export function useDropboxUpload(
  dropboxHook?: ReturnType<typeof useDropbox>
) {
  const defaultDropboxHook = useDropbox();
  const actualDropboxHook = dropboxHook || defaultDropboxHook;
  const {
    downloadMultipleDropboxFiles,
    accessToken,
    isConnected,
    forceReconnect,
  } = actualDropboxHook;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<DropboxUploadProgress[]>([]);

  // Upload a single file from Dropbox to GCS and then to RAG
  const uploadDropboxFile = async (
    file: DropboxFile,
    chatSessionId: string
  ): Promise<DropboxUploadResult> => {
    if (!user?.username) {
      throw new Error("User not authenticated");
    }

    if (!isConnected || !accessToken) {
      throw new Error("Dropbox not connected. Please reconnect and try again.");
    }

    // Update progress - downloading
    setUploadProgress((prev) => [
      ...prev.filter((p) => p.fileName !== file.name),
      { fileName: file.name, stage: "downloading", progress: 0 },
    ]);

    try {
      // Step 1: Download single file from Dropbox
      const downloadedFiles = await downloadMultipleDropboxFiles.mutateAsync([file]);
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
        throw new Error(`RAG upload failed: ${errorData.error || "Unknown error"}`);
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
 // Invalidate and refetch sources after successful upload
      queryClient.invalidateQueries({ queryKey: ['rag-sources', chatSessionId] });
      

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

  // Upload multiple files from Dropbox
  const uploadMultipleDropboxFiles = useMutation({
    mutationFn: async ({
      files,
      chatSessionId,
    }: {
      files: DropboxFile[];
      chatSessionId: string;
    }): Promise<DropboxUploadResult[]> => {
      if (!user?.username) {
        throw new Error("User not authenticated");
      }

      if (!isConnected || !accessToken) {
        throw new Error("Dropbox not connected. Please reconnect and try again.");
      }

      // Initialize progress for all files
      setUploadProgress(
        files.map((file) => ({
          fileName: file.name,
          stage: "downloading" as const,
          progress: 0,
        }))
      );

      const results: DropboxUploadResult[] = [];
      const errors: string[] = [];

      // Process files sequentially to avoid overwhelming the APIs
      for (const file of files) {
        try {
          const result = await uploadDropboxFile(file, chatSessionId);
          results.push(result);
          toast.success(`Successfully uploaded ${file.name}`);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push(`${file.name}: ${errorMessage}`);

          // Check if it's a permission error and suggest re-authentication
          if (errorMessage.includes("Access denied") || errorMessage.includes("403")) {
            toast.error(
              `Permission denied for ${file.name}. Try reconnecting to Dropbox with updated permissions.`,
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
        toast.warning(`${results.length} files uploaded successfully, ${errors.length} failed`);
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
    uploadMultipleDropboxFiles,
    uploadProgress,
    clearProgress,
    isUploading: uploadMultipleDropboxFiles.isPending,
  };
}
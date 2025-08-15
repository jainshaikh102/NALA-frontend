"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// Types for generation functionality
export interface GenerateImageRequest {
  prompt: string;
  chat_session_id?: string;
  username: string;
}

export interface GenerateImageResponse {
  success: boolean;
  message: string;
  request_id: string;
  base64_image: string;
  error?: string;
}

export interface ShowImageRequest {
  base64_image: string;
}

export interface GenerateVideoRequest {
  prompt: string;
  duration_seconds?: number;
  chat_session_id?: string;
  username: string;
}

export interface GenerateVideoResponse {
  status: string;
  video_url: string;
  duration: string;
  generated_at: string;
  request_id: string;
}

// Hook for image generation
export function useImageGeneration(
  onImageGenerated?: (imageData: GenerateImageResponse) => void
) {
  const generateImageMutation = useMutation<
    GenerateImageResponse,
    Error,
    GenerateImageRequest
  >({
    mutationFn: async (data: GenerateImageRequest) => {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.base64_image) {
        toast.success("Image generated successfully!");
        // Call the callback to add bot message
        if (onImageGenerated) {
          onImageGenerated(data);
        }
      } else if (data.error) {
        toast.error(data.error);
      }
    },
    onError: (error) => {
      console.error("Failed to generate image:", error);
      toast.error(error.message || "Failed to generate image");
    },
  });

  const showImageMutation = useMutation<any, Error, ShowImageRequest>({
    mutationFn: async (data: ShowImageRequest) => {
      const response = await fetch("/api/show-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to show image");
      }

      return response.json();
    },
    onError: (error) => {
      console.error("Failed to show image:", error);
      toast.error(error.message || "Failed to display image");
    },
  });

  return {
    generateImage: generateImageMutation.mutate,
    showImage: showImageMutation.mutate,
    isGeneratingImage: generateImageMutation.isPending,
    isShowingImage: showImageMutation.isPending,
    imageGenerationError: generateImageMutation.error,
    showImageError: showImageMutation.error,
    generatedImageData: generateImageMutation.data,
    showImageData: showImageMutation.data,
  };
}

// Hook for video generation
export function useVideoGeneration(
  onVideoGenerated?: (videoData: GenerateVideoResponse) => void
) {
  const generateVideoMutation = useMutation<
    GenerateVideoResponse,
    Error,
    GenerateVideoRequest
  >({
    mutationFn: async (data: GenerateVideoRequest) => {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          duration_seconds: data.duration_seconds || 8, // Default to 8 seconds
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate video");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.status === "success" || data.video_url) {
        toast.success("Video generated successfully!");
        // Call the callback to add bot message
        if (onVideoGenerated) {
          onVideoGenerated(data);
        }
      }
    },
    onError: (error) => {
      console.error("Failed to generate video:", error);
      toast.error(error.message || "Failed to generate video");
    },
  });

  return {
    generateVideo: generateVideoMutation.mutate,
    isGeneratingVideo: generateVideoMutation.isPending,
    videoGenerationError: generateVideoMutation.error,
    generatedVideoData: generateVideoMutation.data,
  };
}

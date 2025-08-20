"use client";
import { useState } from "react";
import { toast } from "sonner";

// Types for file upload
export interface FileUploadResult {
  gcs_url: string;
  file_name: string;
}

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'video/mp4': '.mp4',
  'video/avi': '.avi',
  'video/quicktime': '.mov',
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Hook for file upload functionality
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Validate file type and size
  const validateFile = (file: File): boolean => {
    // Check file type
    if (!Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)) {
      toast.error(`Unsupported file type: ${file.type}. Supported types: PDF, TXT, Markdown, Audio (MP3, WAV), Video (MP4, AVI, MOV)`);
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 100MB`);
      return false;
    }

    return true;
  };

  // Upload file to Google Cloud Storage
  const uploadToGCS = async (file: File): Promise<FileUploadResult> => {
    if (!validateFile(file)) {
      throw new Error("File validation failed");
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      // Simulate upload progress (replace with actual GCS upload logic)
      const uploadPromise = new Promise<FileUploadResult>((resolve, reject) => {
        // Simulate progress updates
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress > 90) progress = 90;
          setUploadProgress(progress);
        }, 200);

        // Simulate upload completion after 2-3 seconds
        setTimeout(() => {
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          // Mock GCS URL (replace with actual GCS upload)
          const mockGcsUrl = `gs://nala-bucket/${Date.now()}-${file.name}`;
          
          resolve({
            gcs_url: mockGcsUrl,
            file_name: file.name,
          });
        }, 2000 + Math.random() * 1000);
      });

      const result = await uploadPromise;
      toast.success(`File uploaded successfully: ${file.name}`);
      return result;

    } catch (error) {
      console.error("File upload failed:", error);
      toast.error("Failed to upload file to cloud storage");
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (
    e: React.DragEvent,
    onUploadComplete: (result: FileUploadResult) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0]; // Handle single file for now
    try {
      const result = await uploadToGCS(file);
      onUploadComplete(result);
    } catch (error) {
      console.error("Drop upload failed:", error);
    }
  };

  // Handle file input change
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploadComplete: (result: FileUploadResult) => void
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Handle single file for now
    try {
      const result = await uploadToGCS(file);
      onUploadComplete(result);
    } catch (error) {
      console.error("File select upload failed:", error);
    }

    // Clear the input
    e.target.value = '';
  };

  // Get file type icon
  const getFileTypeIcon = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'txt':
      case 'md':
        return '📝';
      case 'mp3':
      case 'wav':
        return '🎵';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎬';
      default:
        return '📁';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    isUploading,
    uploadProgress,
    uploadToGCS,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    validateFile,
    getFileTypeIcon,
    formatFileSize,
    supportedTypes: Object.values(SUPPORTED_FILE_TYPES).join(', '),
  };
}

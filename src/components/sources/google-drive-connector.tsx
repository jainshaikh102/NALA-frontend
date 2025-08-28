"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useGoogleDrive } from "@/hooks/use-google-drive";
import {
  Loader2,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
} from "lucide-react";
import Image from "next/image";

interface GoogleDriveConnectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (files: any[]) => void;
  isUploading?: boolean;
  uploadProgress?: Array<{
    fileName: string;
    stage: "downloading" | "uploading" | "processing" | "complete" | "error";
    progress: number;
    error?: string;
  }>;
  googleDriveHook?: ReturnType<typeof useGoogleDrive>;
}

export function GoogleDriveConnector({
  isOpen,
  onClose,
  onConnect,
  isUploading = false,
  uploadProgress = [],
  googleDriveHook,
}: GoogleDriveConnectorProps) {
  const defaultGoogleDriveHook = useGoogleDrive();
  const actualGoogleDriveHook = googleDriveHook || defaultGoogleDriveHook;
  const {
    isConnected,
    connectDrive,
    disconnectDrive,
    fetchDriveFiles,
    checkExistingConnection,
    isConnecting,
    driveFiles,
    isLoadingFiles,
    forceReconnect,
  } = actualGoogleDriveHook;

  // State for selected file (single selection only)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Add a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        checkExistingConnection();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, checkExistingConnection]);

  const handleConnect = async () => {
    try {
      await connectDrive.mutateAsync();
    } catch (error) {
      console.error("Failed to connect Google Drive:", error);
    }
  };

  // Handle single file selection
  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId === selectedFileId ? null : fileId);
  };

  // Handle submitting selected file
  const handleSelectFile = () => {
    if (!selectedFileId) return;

    const selectedFile = driveFiles.find((file) => file.id === selectedFileId);
    if (selectedFile) {
      onConnect([selectedFile]); // Still pass as array for compatibility
      onClose();
      // Reset selection for next time
      setSelectedFileId(null);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("folder")) return <FolderOpen className="h-4 w-4" />;
    if (mimeType.includes("image")) return <ImageIcon className="h-4 w-4" />;
    if (mimeType.includes("video")) return <Video className="h-4 w-4" />;
    if (mimeType.includes("audio")) return <Music className="h-4 w-4" />;
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return <Archive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: string) => {
    if (!bytes) return "Unknown size";
    const size = parseInt(bytes);
    if (size === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-[#222C41] border-none text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Image
              src="/svgs/GoogleDrive-WhiteIcon.svg"
              alt="Google Drive"
              width={24}
              height={24}
            />
            Connect Google Drive
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!isConnected ? (
            // Connection Screen
            <div className="text-center py-8">
              <div className="mb-6">
                <Image
                  src="/svgs/GoogleDrive-WhiteIcon.svg"
                  alt="Google Drive"
                  width={80}
                  height={80}
                  className="mx-auto mb-4 opacity-70"
                />
                <h3 className="text-lg font-semibold mb-2">
                  Connect Your Google Drive
                </h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Link your Google Drive to access your files and folders. We'll
                  only access files you explicitly share with NALA.
                </p>
              </div>

              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 px-8 py-2 "
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Image
                      src="/svgs/GoogleDrive-WhiteIcon.svg"
                      alt="Google Drive"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    Connect Google Drive
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Files Browser Screen
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-400">
                    Connected to Google Drive
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => forceReconnect.mutate()}
                    disabled={forceReconnect.isPending}
                    className="text-blue-400 border-blue-600 hover:bg-blue-700/20"
                  >
                    {forceReconnect.isPending ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Reconnecting...
                      </>
                    ) : (
                      "Reconnect"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectDrive}
                    className="text-gray-400 border-gray-600 hover:bg-gray-700"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>

              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading your files...</span>
                </div>
              ) : (
                <>
                  <div className="bg-[#151E31] rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Your Google Drive Files</h4>
                      <p className="text-sm text-gray-400">
                        Click to select a file
                      </p>
                    </div>
                    <div className="space-y-2">
                      {driveFiles.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">
                          No files found in your Google Drive
                        </p>
                      ) : (
                        driveFiles.slice(0, 20).map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center gap-3 p-3 rounded transition-colors cursor-pointer border ${
                              selectedFileId === file.id
                                ? "bg-[#E55351]/20 border-[#E55351] hover:bg-[#E55351]/30"
                                : "bg-[#1a2332] border-transparent hover:bg-[#2a3442]"
                            }`}
                            onClick={() => handleFileSelect(file.id)}
                          >
                            {getFileIcon(file.mimeType)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {file.size
                                  ? formatFileSize(file.size)
                                  : "Folder"}{" "}
                                •
                                {new Date(
                                  file.modifiedTime
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            {selectedFileId === file.id && (
                              <div className="text-[#E55351] text-sm font-medium">
                                Selected
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Upload Progress Section */}
                  {uploadProgress.length > 0 && (
                    <div className="bg-[#151E31] rounded-lg p-4 mt-4">
                      <h4 className="font-medium mb-3 text-white">
                        Upload Progress
                      </h4>
                      <div className="space-y-3">
                        {uploadProgress.map((progress) => (
                          <div key={progress.fileName} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white truncate flex-1 mr-2">
                                {progress.fileName}
                              </span>
                              <span className="text-xs text-gray-400 capitalize">
                                {progress.stage}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  progress.stage === "error"
                                    ? "bg-red-500"
                                    : progress.stage === "complete"
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${progress.progress}%` }}
                              />
                            </div>
                            {progress.error && (
                              <p className="text-xs text-red-400">
                                {progress.error}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <p className="text-sm text-gray-400">
                      {selectedFileId
                        ? `1 file selected from ${driveFiles.length} files`
                        : `${driveFiles.length} files found`}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-600 text-gray-400 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSelectFile}
                        className="bg-[#E55351] hover:bg-[#E55351]/90 text-white"
                        disabled={!selectedFileId || isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          "Add Selected File"
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDropbox } from "@/hooks/use-dropbox";
import {
  Loader2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface DropboxConnectorProps {
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
  dropboxHook?: ReturnType<typeof useDropbox>;
}

export function DropboxConnector({
  isOpen,
  onClose,
  onConnect,
  isUploading = false,
  uploadProgress = [],
  dropboxHook,
}: DropboxConnectorProps) {
  const defaultDropboxHook = useDropbox();
  const actualDropboxHook = dropboxHook || defaultDropboxHook;
  const {
    isConnected,
    connectDropbox,
    disconnectDropbox,
    fetchDropboxFiles,
    checkExistingConnection,
    isConnecting,
    dropboxFiles,
    isLoadingFiles,
    forceReconnect,
  } = actualDropboxHook;

  // State for selected files (multiple selection)
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        checkExistingConnection();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, checkExistingConnection]);

  const handleConnect = async () => {
    try {
      await connectDropbox.mutateAsync();
    } catch (error) {
      console.error("Failed to connect Dropbox:", error);
    }
  };

  // Handle file selection (multiple)
  const handleFileSelect = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  // Handle submitting selected files
  const handleSelectFiles = () => {
    if (selectedFileIds.size === 0) return;

    const selectedFiles = dropboxFiles.filter((file) =>
      selectedFileIds.has(file.id)
    );
    if (selectedFiles.length > 0) {
      onConnect(selectedFiles);
      onClose();
      setSelectedFileIds(new Set());
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
      case "md":
        return <FileText className="h-4 w-4" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <ImageIcon className="h-4 w-4" />;
      case "mp4":
      case "avi":
      case "mov":
      case "mkv":
        return <Video className="h-4 w-4" />;
      case "mp3":
      case "wav":
      case "flac":
        return <Music className="h-4 w-4" />;
      case "zip":
      case "rar":
      case "7z":
        return <Archive className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get progress for a specific file
  const getFileProgress = (fileName: string) => {
    return uploadProgress.find((p) => p.fileName === fileName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-[#1A2332] border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.5L2 7.5v9l10 5 10-5v-9L12 2.5zM12 4.5l7.5 3.75L12 12 4.5 8.25 12 4.5zM4 9.5l7 3.5v7l-7-3.5v-7zm16 0v7l-7 3.5v-7l7-3.5z"/>
            </svg>
            Connect to Dropbox
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="h-16 w-16 mx-auto text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.5L2 7.5v9l10 5 10-5v-9L12 2.5zM12 4.5l7.5 3.75L12 12 4.5 8.25 12 4.5zM4 9.5l7 3.5v7l-7-3.5v-7zm16 0v7l-7 3.5v-7l7-3.5z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Connect your Dropbox account
              </h3>
              <p className="text-gray-400 mb-6">
                Access and upload files from your Dropbox storage
              </p>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  "Connect Dropbox"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  Select files from Dropbox
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectDropbox}
                  className="border-gray-600 text-gray-400 hover:bg-gray-700"
                >
                  Disconnect
                </Button>
              </div>

              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                  <span className="text-gray-400">Loading files...</span>
                </div>
              ) : (
                <>
                  <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-700 rounded-lg p-4">
                    {dropboxFiles.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No files found in your Dropbox
                      </div>
                    ) : (
                      dropboxFiles.map((file) => {
                        const isSelected = selectedFileIds.has(file.id);
                        const progress = getFileProgress(file.name);

                        return (
                          <div
                            key={file.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
                            }`}
                            onClick={() => handleFileSelect(file.id)}
                          >
                            <div className="flex-shrink-0">
                              {isSelected ? (
                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                              ) : (
                                <div className="h-5 w-5 border-2 border-gray-400 rounded-full" />
                              )}
                            </div>

                            <div className="flex-shrink-0 text-gray-400">
                              {getFileIcon(file.name)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatBytes(file.size)} • Modified{" "}
                                {new Date(file.server_modified).toLocaleDateString()}
                              </p>
                            </div>

                            {progress && (
                              <div className="flex-shrink-0">
                                {progress.stage === "complete" ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : progress.stage === "error" ? (
                                  <div className="text-red-500 text-xs">Error</div>
                                ) : (
                                  <div className="text-blue-500 text-xs">
                                    {progress.stage}...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <p className="text-sm text-gray-400">
                      {selectedFileIds.size > 0
                        ? `${selectedFileIds.size} file(s) selected from ${dropboxFiles.length} files`
                        : `${dropboxFiles.length} files found`}
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
                        onClick={handleSelectFiles}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={selectedFileIds.size === 0 || isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          `Add Selected File`
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
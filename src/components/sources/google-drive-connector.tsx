"use client";
import { useEffect } from "react";
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
}

export function GoogleDriveConnector({
  isOpen,
  onClose,
  onConnect,
}: GoogleDriveConnectorProps) {
  const {
    isConnected,
    connectDrive,
    disconnectDrive,
    fetchDriveFiles,
    checkExistingConnection,
    isConnecting,
    driveFiles,
    isLoadingFiles,
  } = useGoogleDrive();

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

  const handleSelectFiles = () => {
    onConnect(driveFiles);
    onClose();
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectDrive}
                  className="text-gray-400 border-gray-600 hover:bg-gray-700"
                >
                  Disconnect
                </Button>
              </div>

              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading your files...</span>
                </div>
              ) : (
                <>
                  <div className="bg-[#151E31] rounded-lg p-4 max-h-96 overflow-y-auto">
                    <h4 className="font-medium mb-3">
                      Your Google Drive Files
                    </h4>
                    <div className="space-y-2">
                      {driveFiles.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">
                          No files found in your Google Drive
                        </p>
                      ) : (
                        driveFiles.slice(0, 20).map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 p-2 hover:bg-[#1a2332] rounded transition-colors"
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
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <p className="text-sm text-gray-400">
                      {driveFiles.length} files found
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
                        className="bg-[#E55351] hover:bg-[#E55351]/90 text-white"
                        disabled={driveFiles.length === 0}
                      >
                        Add as Source
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

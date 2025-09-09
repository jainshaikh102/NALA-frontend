"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageCircleMore,
  MoreHorizontal,
  Loader2,
  Trash2,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useChatSessions } from "@/hooks/use-chat-sessions";
import { useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();

  // Get user data from Zustand store
  const { user } = useAuthStore();

  // Fetch user's chat sessions
  const {
    chatSessions,
    isLoadingSessions,
    endSession,
    isEndingSession,
    isEndingSpecificSession,
    refetchSessions,
  } = useChatSessions(user?.username);

  // Delete confirmation dialog state
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<{
    isOpen: boolean;
    sessionId: string;
    preview: string;
  }>({ isOpen: false, sessionId: "", preview: "" });

  // Local loading state for when refreshing after delete
  const [isRefreshingAfterDelete, setIsRefreshingAfterDelete] = useState(false);

  // Get latest 4 chats sorted by creation date
  const getLatestChats = () => {
    if (!chatSessions || chatSessions.length === 0) return [];

    // Sort by created_at in descending order (newest first) and take first 4
    return [...chatSessions]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 4);
  };

  const latestChats = getLatestChats();

  // Handle chat card click
  const handleChatClick = (sessionId: string) => {
    router.push(`/chat/${sessionId}`);
  };

  // Handle delete chat session
  const handleDeleteSession = (sessionId: string, preview: string) => {
    setConfirmDeleteDialog({
      isOpen: true,
      sessionId,
      preview,
    });
  };

  // Confirm delete session
  const handleConfirmDeleteSession = async () => {
    if (confirmDeleteDialog.sessionId) {
      // Close the dialog first
      setConfirmDeleteDialog({
        isOpen: false,
        sessionId: "",
        preview: "",
      });

      // Show loading state while deleting and refreshing
      setIsRefreshingAfterDelete(true);

      try {
        // Delete the session
        endSession({ chat_session_id: confirmDeleteDialog.sessionId });

        // Wait a bit for the deletion to complete, then refetch
        setTimeout(async () => {
          try {
            await refetchSessions();
            setIsRefreshingAfterDelete(false);
          } catch (error) {
            console.error("Error refreshing sessions:", error);
            setIsRefreshingAfterDelete(false);
          }
        }, 1000); // Wait 1 second for deletion to complete
      } catch (error) {
        console.error("Error deleting chat:", error);
        setIsRefreshingAfterDelete(false);
      }
    }
  };

  // Cancel delete session
  const handleCancelDeleteSession = () => {
    setConfirmDeleteDialog({
      isOpen: false,
      sessionId: "",
      preview: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#222C41] text-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-[#FFFFFF3B]">
      <div className="w-full mx-auto p-4 sm:p-8 lg:p-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-8 lg:gap-0 bg-transparent border-b border-b-[#FFFFFF4D] min-h-[300px] lg:min-h-[460px] relative py-8">
          {/* Left Content */}
          <div className="flex flex-col w-full lg:w-7/12 h-full space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-start gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center">
                  <Image
                    src="/svgs/Golden-Paw.svg"
                    alt="Paw"
                    width={68}
                    height={68}
                    className="w-full h-full"
                  />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold italic">
                  NALA
                </h1>
              </div>

              <p className="text-xl sm:text-2xl lg:text-4xl text-[#FFFFFF]">
                Your AI-powered music assistant.🎧
              </p>

              <p className="text-lg sm:text-xl lg:text-2xl text-[#FFFFFF] italic">
                Tracks analytics, catalog valuation, and investor insights - in
                real time
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 space-y-4">
              <Button
                variant="default"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-6 rounded-full w-full sm:w-60"
                onClick={() => router.push("/chat")}
              >
                START NEW CHAT
              </Button>

              {/* <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 rounded-full"
                >
                  Explore Valuation Engine
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 rounded-full"
                >
                  Join Our App
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 rounded-full"
                >
                  Get Weekly Score for your Catalog
                </Button>
              </div> */}
            </div>

            <p className="text-lg sm:text-xl lg:text-2xl text-[#FFFFFF] tracking-widest">
              Audience Growth | Streaming Trends | Deal Readiness
            </p>
          </div>

          {/* Right Content with Lion and Divider */}
          <div className="hidden lg:flex lg:w-5/12 h-full relative">
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/svgs/Bot-Lion.svg"
                alt="NALA Bot Lion"
                width={550}
                height={500}
                className="object-contain max-w-full h-auto"
              />
            </div>

            {/* Divider line at bottom */}
            {/* <div className="absolute bottom-0 left-0 right-0 border-t-4 border-black"></div> */}
          </div>
        </div>

        {/* My Chats Section */}
        <div className="mt-8 lg:mt-12">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
            Recent Chats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {isLoadingSessions || isRefreshingAfterDelete ? (
              // Loading state - show 4 skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={`loading-${index}`}
                  className="bg-background h-full rounded-xl flex flex-col justify-between min-h-[140px] sm:min-h-[160px]"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                      <Skeleton className="w-5 h-5" />
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex-1">
                        <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
                        <Skeleton className="h-3 sm:h-4 w-1/2" />
                      </div>
                      <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full ml-2 sm:ml-4 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : latestChats.length > 0 ? (
              // Show actual chat sessions
              latestChats.map((chat) => (
                <Card
                  key={chat.session_id}
                  className={`bg-background h-full rounded-xl flex flex-col justify-between min-h-[140px] sm:min-h-[160px] transition-colors ${
                    isRefreshingAfterDelete
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:bg-background/80"
                  }`}
                  onClick={() =>
                    !isRefreshingAfterDelete && handleChatClick(chat.session_id)
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <Image
                          src={"/svgs/Text-Icon.svg"}
                          alt={"textIcon"}
                          width={16}
                          height={16}
                          className={"opacity-70 sm:w-5 sm:h-5"}
                        />
                      </div>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white p-1 h-auto w-auto flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                            }}
                            disabled={isRefreshingAfterDelete}
                          >
                            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-2 bg-[#222C41] border-[#FFFFFF3B]">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(
                                chat.session_id,
                                chat.preview
                              );
                            }}
                            disabled={
                              isEndingSpecificSession(chat.session_id) ||
                              isRefreshingAfterDelete
                            }
                          >
                            {isEndingSpecificSession(chat.session_id) ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete Chat
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg sm:text-xl mb-1 truncate">
                          {chat.preview || "New Chat"}
                        </h3>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          {new Date(chat.created_at).toLocaleDateString(
                            "en-US",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center ml-2 sm:ml-4 flex-shrink-0">
                        <Image
                          src="/svgs/Golden-Paw.svg"
                          alt="Paw"
                          width={60}
                          height={60}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // No chats state
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <MessageCircleMore className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No chats yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start your first conversation with NALA
                </p>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white px-4 rounded-full"
                  onClick={() => router.push("/chat/new")}
                >
                  Start New Chat
                </Button>
              </div>
            )}
            {/* <div className="w-full min-h-[100px] sm:min-h-[100px] lg:min-h-[120px] bg-[url('/svgs/FileContainer.svg')] bg-no-repeat bg-center bg-contain p-4 sm:p-6 lg:p-6 xl:px-20 xl:py-10">
              <div className="p-4 sm:p-6 lg:p-8 xl:p-12 bg-background h-full rounded-xl flex flex-col justify-between min-h-[140px] sm:min-h-[200px]">
                <div className="flex items-start justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white p-1 h-auto w-auto"
                  >
                    <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full flex items-center justify-center">
                      <Image
                        src={"/svgs/Text-Icon.svg"}
                        alt={"textIcon"}
                        width={16}
                        height={16}
                        className={"opacity-70 sm:w-5 sm:h-5"}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg sm:text-xl mb-1">
                        Daily Chat
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        01 Jan 2025
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center ml-2 sm:ml-4">
                    <Image
                      src="/svgs/Golden-Paw.svg"
                      alt="Paw"
                      width={60}
                      height={60}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelDeleteSession();
        }}
      >
        <DialogContent className="bg-[#222C41] border-none text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Delete Chat Session
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to delete this chat session? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-[#151E31] rounded-lg p-3">
              <p className="text-sm text-gray-300 truncate">
                {confirmDeleteDialog.preview || "Chat session"}
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDeleteSession}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDeleteSession}
              disabled={isEndingSession}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isEndingSession ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

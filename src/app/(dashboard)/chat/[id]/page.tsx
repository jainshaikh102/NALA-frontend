"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResponseRenderer } from "@/components/chat/ResponseRenderer";
import {
  Plus,
  MoreHorizontal,
  Send,
  Paperclip,
  PanelRight,
  Loader2,
  Info,
  Upload,
  Mic,
  X,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-primary";
import {
  TabsBB,
  TabsContentBB,
  TabsListBB,
  TabsTriggerBB,
} from "@/components/ui/tabs-primary-border-bottom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth-store";
import { useGet, usePost } from "@/hooks/use-api";
import { GoogleDriveConnector } from "@/components/sources/google-drive-connector";

import {
  useChatSessions,
  useChatHistory,
  type ChatSession,
  type ChatHistoryMessage,
} from "@/hooks/use-chat-sessions";
import { useChatRoster } from "@/hooks/use-chat-roster";
import { useUserRoster, type Artist } from "@/hooks/use-artists";
import {
  downloadMessageAsPDF,
  downloadMessageAsExcel,
  downloadImageFromBase64,
  downloadVideoFromUrl,
} from "@/utils/downloadUtils";
import { useImageGeneration, useVideoGeneration } from "@/hooks/use-generation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useRAGSources, useNotes } from "@/hooks/use-sources-notes";
import { useGoogleDriveUpload } from "@/hooks/use-google-drive-upload";
import { useGoogleDrive } from "@/hooks/use-google-drive";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { useVoiceChat } from "@/hooks/use-voice-chat";
interface ChatMessage {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: string;
  displayData?: unknown;
  dataType?: string;
  queryStr?: string;
  status?: boolean;
  isThinking?: boolean;
}

const ChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  const [inputText, setInputText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true); // Start with loading state
  const [isSwitchingChat, setIsSwitchingChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [invalidChatId, setInvalidChatId] = useState(false);

  // Refs for auto-scrolling
  const desktopChatRef = useRef<HTMLDivElement>(null);
  const mobileChatRef = useRef<HTMLDivElement>(null);

  // Tab state management
  const [desktopActiveTab, setDesktopActiveTab] = useState("chats");
  const [mobileActiveTab, setMobileActiveTab] = useState("allchats");

  // Function to scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      if (desktopChatRef.current) {
        desktopChatRef.current.scrollTop = desktopChatRef.current.scrollHeight;
      }
      if (mobileChatRef.current) {
        // For mobile, try smooth scroll first, fallback to instant
        try {
          mobileChatRef.current.scrollTo({
            top: mobileChatRef.current.scrollHeight,
            behavior: "smooth",
          });
        } catch (error) {
          // Fallback for older browsers
          mobileChatRef.current.scrollTop = mobileChatRef.current.scrollHeight;
        }
      }
    }, 150); // Slightly longer delay for mobile
  };

  const [isAddSourceDialogOpen, setIsAddSourceDialogOpen] = useState(false);
  const [isMobileAddSourceDialogOpen, setIsMobileAddSourceDialogOpen] =
    useState(false);
  const [isGoogleDriveDialogOpen, setIsGoogleDriveDialogOpen] = useState(false);
  const [isLiveChatDialogOpen, setIsLiveChatDialogOpen] = useState(false);
  const [selectedGenerateItem, setSelectedGenerateItem] = useState<
    string | null
  >(null);
  const [confirmRemoveDialog, setConfirmRemoveDialog] = useState<{
    isOpen: boolean;
    artistName: string;
  }>({ isOpen: false, artistName: "" });

  // Chat session management state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [confirmDeleteSessionDialog, setConfirmDeleteSessionDialog] = useState<{
    isOpen: boolean;
    sessionId: string;
    preview: string;
  }>({ isOpen: false, sessionId: "", preview: "" });

  // Roster management state
  const [isAddRosterDialogOpen, setIsAddRosterDialogOpen] = useState(false);
  const [tempSelectedRosterArtists, setTempSelectedRosterArtists] = useState<
    Artist[]
  >([]);
  const [confirmRemoveRosterDialog, setConfirmRemoveRosterDialog] = useState<{
    isOpen: boolean;
    artistName: string;
  }>({ isOpen: false, artistName: "" });

  // FAQ visibility state - track complete message cycles
  const [hasCompletedMessageCycle, setHasCompletedMessageCycle] =
    useState(false);
  // Add Sources modal states
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);
  const [isLinkInputDialogOpen, setIsLinkInputDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const { user } = useAuthStore();

  // Shared Google Drive hook instance
  const googleDriveHook = useGoogleDrive();

  // Google Drive upload hook with shared instance
  const {
    uploadMultipleGoogleDriveFiles,
    uploadProgress,
    clearProgress,
    isUploading: isUploadingGoogleDriveFiles,
  } = useGoogleDriveUpload(googleDriveHook);

  // Speech-to-text hook
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: isSpeechSupported,
    toggleListening,
    clearTranscript,
  } = useSpeechToText({
    language: "en-US",
    continuous: true,
    interimResults: true,
  });

  // Update input text when speech transcript changes
  useEffect(() => {
    if (transcript) {
      setInputText((prev) => {
        // If there's existing text, add a space before the new transcript
        const newText = prev ? `${prev} ${transcript}` : transcript;
        return newText;
      });
      // Clear the transcript after adding it to input
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  // Handle microphone click
  const handleMicClick = () => {
    if (!isSpeechSupported) {
      toast.error("Speech recognition is not supported in this browser");
      return;
    }
    toggleListening();
  };

  // Voice chat hook for live chat dialog
  const voiceChat = useVoiceChat({
    username: user?.username || "",
    sessionId: params.id as string,
    onError: (error) => {
      console.error("Voice chat error:", error);
      toast.error(error);
    },
  });

  // Chat session management hooks
  const {
    chatSessions,
    isLoadingSessions,
    startSession,
    endSession,
    isStartingSession,
    isEndingSession,
    isEndingSpecificSession,
  } = useChatSessions(user?.username);

  // Chat history hook for current session
  const { data: chatHistory, isLoading: isLoadingHistory } = useChatHistory(
    currentSessionId || undefined
  );

  // Chat roster management hooks
  const {
    selectedArtists: chatSelectedArtists,
    isLoadingSelected,
    selectArtists,
    deselectArtist,
    isSelectingArtists,
    isDeselectingArtist,
  } = useChatRoster(currentSessionId || undefined);

  // User roster hook for adding artists to chat
  const { userRoster, isLoadingRoster } = useUserRoster(user?.username);

  // Sources and notes management hooks
  const {
    sources,
    isLoadingSources,
    uploadSource,
    deleteSource,
    isUploadingSource,
    isDeletingSource,
  } = useRAGSources(currentSessionId || undefined);

  const {
    notes,
    isLoadingNotes,
    addNote,
    removeNote,
    isAddingNote,
    isRemovingNote,
  } = useNotes(currentSessionId || undefined);
  // File type icon helper

  const getFileTypeIcon = (fileName: string): string => {
    const extension = fileName.toLowerCase().split(".").pop();

    switch (extension) {
      case "pdf":
        return "📄";
      case "txt":
        return "📄";
      case "md":
        return "📝";
      case "mp3":
        return "🎵";
      case "mp4":
        return "🎵";
      default:
        return "📄";
    }
  };
  const getCombinedSourcesAndNotes = () => {
    const combinedItems: Array<{
      id: string;
      type: "source" | "note";
      name: string;
      icon: string;
      data: any;
    }> = [];

    // Add sources (assuming sources is an object with documents array)
    if (sources && typeof sources === "object" && "documents" in sources) {
      const sourcesData = sources as any;
      if (sourcesData.documents && Array.isArray(sourcesData.documents)) {
        sourcesData.documents.forEach((source: any, index: number) => {
          combinedItems.push({
            id: `source-${source?.document_id || index}`,
            type: "source",
            name: source?.file_name || "Unknown file",
            icon: getFileTypeIcon(source?.file_name || ""),
            data: source,
          });
        });
      }
    }

    // Add notes
    if (notes && Array.isArray(notes)) {
      notes.forEach((note: string, index: number) => {
        combinedItems.push({
          id: `note-${index}`,
          type: "note",
          name: note.length > 50 ? `${note.substring(0, 50)}...` : note,
          icon: "📝",
          data: note,
        });
      });
    }
    return combinedItems;
  };
  // Generation hooks with callbacks to create bot messages
  const {
    generateImage,
    showImage,
    isGeneratingImage,
    isShowingImage,
    generatedImageData,
    showImageData,
  } = useImageGeneration((imageData) => {
    // Remove thinking message and add actual response
    setMessages((prev) => {
      const withoutThinking = prev.filter((msg) => !msg.isThinking);
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: imageData.message || "Image generated successfully!",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        displayData: imageData.base64_image,
        dataType: "image_base64",
      };
      return [...withoutThinking, botMessage];
    });
    setHasCompletedMessageCycle(true);
    scrollToBottom();
  });

  const { generateVideo, isGeneratingVideo, generatedVideoData } =
    useVideoGeneration((videoData) => {
      // Remove thinking message and add actual response
      setMessages((prev) => {
        const withoutThinking = prev.filter((msg) => !msg.isThinking);
        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: `Video generated successfully! Duration: ${videoData.duration}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          displayData: videoData.video_url,
          dataType: "video_url",
        };
        return [...withoutThinking, botMessage];
      });
      setHasCompletedMessageCycle(true);
      scrollToBottom();
    });

  // Fetch selected artists from API
  const {
    data: selectedArtistsData,
    isLoading: isLoadingSelectedArtists,
    refetch: refetchSelectedArtists,
  } = useGet<string[]>(`artists/selected/${user?.username}`, {
    enabled: !!user?.username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete artist mutation (using POST to /artists/deselect)
  const deleteArtistMutation = usePost(`artists/deselect`, {
    onSuccess: () => {
      refetchSelectedArtists();
      setConfirmRemoveDialog({ isOpen: false, artistName: "" });
    },
    onError: (error) => {
      console.error("Error removing artist:", error);
    },
  });

  // FAQ questions
  const preQuestions = [
    { id: 1, query: "Discover Top Performing Tracks" },
    { id: 2, query: "Music Market Trends" },
    { id: 3, query: "Music Investment & Growth" },
    { id: 4, query: "Find Investment Opportunities" },
    { id: 5, query: "View Music Industry Insights" },
  ];

  // API Integration
  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user" as const,
      content: question,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsSendingMessage(true);
    scrollToBottom();

    // Add NALA thinking indicator
    const thinkingMessage = {
      id: Date.now() + 0.5,
      type: "bot" as const,
      content: "NALA is thinking...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);
    scrollToBottom();

    try {
      // If this is a new chat (no session ID), create a session first
      let sessionIdToUse = currentSessionId;

      if (!currentSessionId && chatId === "new") {
        // Create a new session for the first message
        const sessionResponse = await fetch("/api/chat/start-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: user?.username }),
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          sessionIdToUse = sessionData.chat_session_id;
          setCurrentSessionId(sessionIdToUse);

          // Update the URL to reflect the new session
          router.replace(`/chat/${sessionIdToUse}`);
        }
      }

      const payload = {
        question: question,
        username: user?.username,
        model_name: "gemini-2.0-flash-001",
        ...(sessionIdToUse && { chat_session_id: sessionIdToUse }),
      };

      const response = await fetch("/api/chat/execute-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();

      // Remove thinking message and add actual response
      setMessages((prev) => {
        const withoutThinking = prev.filter((msg) => !msg.isThinking);
        const botMessage = {
          id: Date.now() + 1,
          type: "bot" as const,
          content: data.answer_str || "Sorry, I couldn't process your request.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          displayData: data.display_data,
          dataType: data.data_type || "text",
          queryStr: data.query_str,
          status: data.status_bool,
        };
        return [...withoutThinking, botMessage];
      });
      scrollToBottom();

      // Mark that we've completed a message cycle (user message + bot response)
      setHasCompletedMessageCycle(true);
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove thinking message and add error message
      setMessages((prev) => {
        const withoutThinking = prev.filter((msg) => !msg.isThinking);
        const errorMessage = {
          id: Date.now() + 1,
          type: "bot" as const,
          content:
            "Sorry, there was an error processing your request. Please try again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return [...withoutThinking, errorMessage];
      });
      scrollToBottom();
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) {
      toast.error("Please enter a message or prompt");
      return;
    }

    // Determine generation type based on selected item
    let generationType: "none" | "image" | "video" = "none";
    if (selectedGenerateItem === "image") {
      generationType = "image";
    } else if (selectedGenerateItem === "video") {
      generationType = "video";
    }

    // Handle generation or regular chat
    if (generationType === "image") {
      // Add user message to chat for image generation
      const userMessage: ChatMessage = {
        id: Date.now(),
        type: "user",
        content: inputText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Use callback to ensure proper ordering
      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        // Trigger image generation after state update
        setTimeout(() => handleImageGeneration(inputText), 0);
        return newMessages;
      });

      setInputText(""); // Clear input after generation
      setSelectedGenerateItem(null); // Clear selection
    } else if (generationType === "video") {
      // Add user message to chat for video generation
      const userMessage: ChatMessage = {
        id: Date.now(),
        type: "user",
        content: inputText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Use callback to ensure proper ordering
      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        // Trigger video generation after state update
        setTimeout(() => handleVideoGeneration(inputText), 0);
        return newMessages;
      });

      setInputText(""); // Clear input after generation
      setSelectedGenerateItem(null); // Clear selection
    } else {
      // Default chat behavior
      sendMessage(inputText);
    }
  };

  // Load chat history when session changes
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const convertedMessages: ChatMessage[] = chatHistory.map(
        (msg, index) => ({
          id: Date.now() + index,
          type: msg.role === "user" ? "user" : "bot",
          content: msg.content,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          displayData: msg.display_data,
          dataType: msg.data_type || "text",
          queryStr: msg.query,
        })
      );
      setMessages(convertedMessages);
      // Don't hide loading here - wait for both APIs to complete
    } else if (currentSessionId && (!chatHistory || chatHistory.length === 0)) {
      // Clear messages if we have a session but no history (new session)
      setMessages([]);
      // Don't hide loading here - wait for both APIs to complete
    }
  }, [chatHistory, currentSessionId]);

  // Auto-scroll when messages change and hide loading when both APIs are complete
  useEffect(() => {
    if (messages.length > 0) {
      // Wait for messages to render in DOM before scrolling
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } else {
      // Just scroll if no messages
      scrollToBottom();
    }
  }, [messages]);

  // Hide loading only when messages are actually rendered in the UI
  useEffect(() => {
    // Only hide loading if we're currently switching chats
    if (!isSwitchingChat) return;

    // Check if both APIs have finished loading
    const bothAPIsComplete = !isLoadingHistory && !isLoadingSelected;

    if (currentSessionId && bothAPIsComplete && messages.length > 0) {
      // Wait for messages to actually render in the DOM
      setTimeout(() => {
        setIsLoadingChats(false);
        setIsSwitchingChat(false);
      }, 800); // Longer delay to ensure complete rendering
    } else if (
      currentSessionId &&
      bothAPIsComplete &&
      (!chatHistory || chatHistory.length === 0)
    ) {
      // Handle empty chat sessions (no messages)
      setTimeout(() => {
        setIsLoadingChats(false);
        setIsSwitchingChat(false);
      }, 500);
    }
  }, [
    isLoadingHistory,
    isLoadingSelected,
    currentSessionId,
    messages,
    chatHistory,
    isSwitchingChat,
  ]);

  // Load chat session based on URL parameter
  useEffect(() => {
    // Don't do anything if sessions are still loading
    if (isLoadingSessions) return;

    if (chatId === "new") {
      // New chat - don't create session yet, just show empty chat interface
      setIsLoadingChats(false);
      setIsSwitchingChat(false);
      setCurrentSessionId(null);
      setMessages([]);
      setInvalidChatId(false);
    } else if (chatSessions && chatSessions.length > 0) {
      // If we have a chatId from URL, try to load that specific chat
      if (chatId && chatId !== "undefined") {
        const targetSession = chatSessions.find(
          (session) => session.session_id === chatId
        );

        if (targetSession && currentSessionId !== chatId) {
          // Valid chat ID from URL - load this specific chat
          setInvalidChatId(false);
          setIsLoadingChats(true);
          setIsSwitchingChat(true);
          setMessages([]);
          setCurrentSessionId(chatId);
          // Auto-switch to Sources tab to show sources/rosters for this chat
          setDesktopActiveTab("sources");
          setMobileActiveTab("sources");
        } else if (!targetSession) {
          // Invalid chat ID from URL - show error and redirect to most recent chat
          setInvalidChatId(true);
          const sortedSessions = [...chatSessions].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          const mostRecentSession = sortedSessions[0];
          if (mostRecentSession) {
            // Show error briefly before redirecting
            setTimeout(() => {
              setInvalidChatId(false);
              router.replace(`/chat/${mostRecentSession.session_id}`);
            }, 2000);
          }
        }
      } else if (!currentSessionId) {
        // No chat ID in URL - redirect to most recent chat
        const sortedSessions = [...chatSessions].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const mostRecentSession = sortedSessions[0];
        if (mostRecentSession) {
          router.replace(`/chat/${mostRecentSession.session_id}`);
        }
      }
    } else if (chatSessions && chatSessions.length === 0 && chatId !== "new") {
      // No chat sessions available and not a new chat, redirect to new
      router.replace("/chat/new");
    } else if (chatId !== "new") {
      // Still loading or other edge case, hide loading
      setIsLoadingChats(false);
      setIsSwitchingChat(false);
    }
  }, [chatSessions, currentSessionId, isLoadingSessions, chatId, router]);

  // Confirm artist removal
  const handleConfirmRemoveArtist = () => {
    if (confirmRemoveDialog.artistName && user?.username) {
      deleteArtistMutation.mutate({
        username: user.username,
        artist_name: confirmRemoveDialog.artistName,
      });
    }
  };

  // Cancel artist removal
  const handleCancelRemoveArtist = () => {
    setConfirmRemoveDialog({ isOpen: false, artistName: "" });
  };

  // Handle Google Drive connection
  const handleGoogleDriveConnect = async (files: any[]) => {
    if (!files || files.length === 0) {
      toast.error("No files selected");
      return;
    }

    if (!chatId) {
      toast.error("No active chat session");
      return;
    }

    try {
      toast.info(
        `Starting upload of ${files.length} file(s) from Google Drive...`
      );

      // Clear any previous progress
      clearProgress();

      // Upload files to GCS and then to RAG
      await uploadMultipleGoogleDriveFiles.mutateAsync({
        files,
        chatSessionId: chatId,
      });
    } catch (error) {
      console.error("Google Drive upload failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Upload failed: ${errorMessage}`);
    }
  };

  // Chat session management functions
  const handleCreateNewSession = () => {
    // Navigate to new chat interface without creating session
    router.push("/chat/new");
  };

  const handleLoadChatSession = (sessionId: string) => {
    // Only load if it's a different session (prevent deselection)
    if (currentSessionId !== sessionId) {
      // Navigate to the specific chat URL
      router.push(`/chat/${sessionId}`);
    }
  };

  const handleDeleteSession = (sessionId: string, preview: string) => {
    setConfirmDeleteSessionDialog({
      isOpen: true,
      sessionId,
      preview,
    });
  };

  const handleConfirmDeleteSession = () => {
    if (confirmDeleteSessionDialog.sessionId) {
      endSession({ chat_session_id: confirmDeleteSessionDialog.sessionId });

      // If we're deleting the current session, clear it
      if (currentSessionId === confirmDeleteSessionDialog.sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    }
    setConfirmDeleteSessionDialog({
      isOpen: false,
      sessionId: "",
      preview: "",
    });
  };

  const handleCancelDeleteSession = () => {
    setConfirmDeleteSessionDialog({
      isOpen: false,
      sessionId: "",
      preview: "",
    });
  };

  // Roster management functions
  const handleOpenAddRosterDialog = () => {
    setIsAddRosterDialogOpen(true);
    setTempSelectedRosterArtists([]);
  };

  const handleToggleRosterArtist = (artist: Artist) => {
    setTempSelectedRosterArtists((prev) => {
      const isSelected = prev.some((a) => a.id === artist.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== artist.id);
      } else {
        return [...prev, artist];
      }
    });
  };

  const handleAddRosterArtists = () => {
    if (tempSelectedRosterArtists.length > 0 && currentSessionId) {
      const artistNames = tempSelectedRosterArtists.map(
        (artist) => artist.name
      );
      selectArtists({
        chat_session_id: currentSessionId,
        artist_names: artistNames,
      });
      setTempSelectedRosterArtists([]);
      setIsAddRosterDialogOpen(false);
    }
  };

  const handleRemoveRosterArtist = (artistName: string) => {
    setConfirmRemoveRosterDialog({ isOpen: true, artistName });
  };

  const handleConfirmRemoveRosterArtist = () => {
    if (confirmRemoveRosterDialog.artistName && currentSessionId) {
      deselectArtist({
        chat_session_id: currentSessionId,
        artist_name: confirmRemoveRosterDialog.artistName,
      });
      setConfirmRemoveRosterDialog({ isOpen: false, artistName: "" });
    }
  };

  const handleCancelRemoveRosterArtist = () => {
    setConfirmRemoveRosterDialog({ isOpen: false, artistName: "" });
  };

  // Add Sources handler functions - Mobile
  const handleMobileFileUploadOption = () => {
    setIsMobileAddSourceDialogOpen(false);
    setIsFileUploadDialogOpen(true);
  };

  const handleMobileLinkInputOption = () => {
    setIsMobileAddSourceDialogOpen(false);
    setIsLinkInputDialogOpen(true);
    setLinkInput("");
  };

  const handleMobileNotesOption = () => {
    setIsMobileAddSourceDialogOpen(false);
    setIsNotesDialogOpen(true);
    setNoteInput("");
  };

  // File upload handler
  const handleFileUpload = async (file: File) => {
    if (!user?.username || !currentSessionId) {
      toast.error("Please log in and select a chat session");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "audio/mpeg",
      "audio/wav",
      "video/mp4",
      "video/avi",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(`Unsupported file type: ${file.type}`);
      return;
    }

    // Validate file size (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 100MB`
      );
      return;
    }

    try {
      // Create FormData to send file to API route
      const formData = new FormData();
      formData.append("file", file);
      formData.append("username", user.username);
      formData.append("chat_session_id", currentSessionId);
      // Send file to API route for GCS upload
      const response = await fetch("/api/googleStorage/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      const { success, gcsUrl, fileName } = await response.json();
      if (!success) {
        throw new Error("Upload failed");
      }

      // Upload to RAG system
      uploadSource({
        gcs_url: gcsUrl,
        file_name: file.name,
        username: user.username,
        chat_session_id: currentSessionId,
      });
      setIsFileUploadDialogOpen(false);
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error("Failed to upload file");
    }
  };

  const handleLinkSubmit = () => {
    if (!linkInput.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }
    // Basic URL validation
    try {
      new URL(linkInput);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    if (!user?.username || !currentSessionId) {
      toast.error("Please log in and select a chat session");
      return;
    }
    // Extract filename from URL or use a default
    const fileName = linkInput.split("/").pop() || "website-link";
    uploadSource({
      gcs_url: linkInput,
      file_name: fileName,
      username: user.username,
      chat_session_id: currentSessionId,
    });
    setIsLinkInputDialogOpen(false);
    setLinkInput("");
  };

  const handleNoteSubmit = () => {
    if (!noteInput.trim()) {
      toast.error("Please enter some text");
      return;
    }

    if (!currentSessionId) {
      toast.error("Please select a chat session");
      return;
    }

    addNote({
      chat_session_id: currentSessionId,
      note_item: noteInput,
    });
    setIsNotesDialogOpen(false);
    setNoteInput("");
  };

  // Generation handler functions
  const handleImageGeneration = async (prompt: string) => {
    if (!user?.username) {
      toast.error("Please log in to generate images");
      return;
    }
    // Add NALA thinking indicator for image generation
    const thinkingMessage = {
      id: Date.now() + 0.5,
      type: "bot" as const,
      content: "NALA is generating your image...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);
    scrollToBottom();
    generateImage({
      prompt,
      chat_session_id: currentSessionId || undefined,
      username: user.username,
    });
    setTimeout(() => {
      setHasCompletedMessageCycle(true);
    }, 1000); // Small delay to ensure generation starts
  };

  const handleVideoGeneration = async (prompt: string) => {
    if (!user?.username) {
      toast.error("Please log in to generate videos");
      return;
    }

    // Add NALA thinking indicator for video generation
    const thinkingMessage = {
      id: Date.now() + 0.5,
      type: "bot" as const,
      content: "NALA is generating your video...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);
    scrollToBottom();
    generateVideo({
      prompt,
      duration_seconds: 8,
      chat_session_id: currentSessionId || undefined,
      username: user.username,
    });
    setTimeout(() => {
      setHasCompletedMessageCycle(true);
    }, 1000); // Small delay to ensure generation starts
  };

  // Handle adding generate item (only one at a time)
  const handleAddGenerateItem = (item: string) => {
    setSelectedGenerateItem(item);
  };

  // Handle removing generate item
  const handleRemoveGenerateItem = () => {
    setSelectedGenerateItem(null);
  };

  // Get icon for generate item
  const getGenerateItemIcon = (item: string) => {
    switch (item) {
      case "image":
        return "/svgs/GanerateImage-WhitIcon.svg";
      case "video":
        return "/svgs/GanerateVideo-WhiteIcon.svg";
      default:
        return "/svgs/StickwithStart-WhiteIcon.svg";
    }
  };

  // Handle pre-question click
  const handlePreQuestionClick = (question: string) => {
    setInputText(question);
  };

  // Get download options based on message data type
  const getDownloadOptions = (message: ChatMessage) => {
    const dataType = message.dataType;

    switch (dataType) {
      case "image_base64":
        return [
          {
            label: "Download Image",
            icon: Download,
            action: () =>
              downloadImageFromBase64(
                message.displayData as string,
                message.id
              ),
          },
        ];

      case "video_url":
        return [
          {
            label: "Download Video",
            icon: Download,
            action: () =>
              downloadVideoFromUrl(message.displayData as string, message.id),
          },
        ];

      default:
        // For other data types, show PDF/Excel options
        return [
          {
            label: "PDF",
            icon: FileText,
            action: () => downloadMessageAsPDF(message, message.id),
          },
          {
            label: "Excel",
            icon: FileSpreadsheet,
            action: () => downloadMessageAsExcel(message, message.id),
          },
        ];
    }
  };

  return (
    <div className="h-screen bg-[#222C41] flex flex-col lg:flex-row gap-4 p-4 sm:p-4 lg:p-4 overflow-hidden scrollbar-hide rounded-2xl border border-[#FFFFFF3B]">
      {/* Invalid Chat ID Error */}
      {invalidChatId && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span>Chat not found. Redirecting to most recent chat...</span>
          </div>
        </div>
      )}

      {/* Desktop: Left Panel - Sources, Rosters, Queries */}
      <div className="hidden lg:block w-80 transition-all duration-300 ease-in-out bg-background rounded-lg overflow-auto scrollbar-hide flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-foreground">Source</h1>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <PanelRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Current Chat Indicator - Always Visible */}
          {(currentSessionId || chatId === "new") && (
            <div className="mx-4 mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary">
                  Current Chat:
                </span>
              </div>
              <p className="text-sm text-foreground mt-1 truncate">
                {chatId === "new"
                  ? "New conversation - start by asking a question"
                  : chatSessions.find((s) => s.session_id === currentSessionId)
                      ?.preview || "New chat session"}
              </p>
            </div>
          )}

          {/* Tabs */}
          <Tabs
            value={desktopActiveTab}
            onValueChange={setDesktopActiveTab}
            className="flex-1 flex flex-col"
          >
            <div className="px-4 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="chats" className="flex-1">
                  All Chats
                </TabsTrigger>
                <TabsTrigger value="sources" className="flex-1">
                  Sources
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="sources" className="flex-1 overflow-auto">
              {/* Sources Content */}

              <div className="p-4 space-y-3">
                <Dialog
                  open={isAddSourceDialogOpen}
                  onOpenChange={setIsAddSourceDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full bg-[secondary] hover:bg-primary/90 text-primary-foreground border-solid border-[1px] border-[#ffffff]/50 rounded-full">
                      <Plus className="h-4 w-4 mr-2" />
                      ADD SOURCE
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-full lg:max-w-5xl max-h-[90vh] overflow-auto bg-[#222C41] border-none p-0 rounded-t-3xl scrollbar-hide">
                    {/* Header with Bot Lion */}
                    <div className="flex items-center justify-center flex-col relative overflow-hidden bg-[#293650] rounded-t-3xl">
                      <Image
                        src="/svgs/Bot-Lion.svg"
                        alt="Bot Lion"
                        width={110}
                        height={100}
                        className="object-contain absolute -top-1"
                      />
                      <Separator className="mt-15 z-50" />
                    </div>

                    {/* Title and Description */}
                    <div className="px-8 pb-4 text-start">
                      <h2 className="text-2xl font-semibold text-white mb-2">
                        ADD SOURCES
                      </h2>
                      <p className="text-gray-300 text-sm">
                        Sources let NALA tailor its insights based on the data
                        that matters most to your music journey.
                      </p>
                    </div>

                    {/* File Upload Area */}
                    <div className="px-8 pb-4">
                      <div className="border-2 border-dashed border-background rounded-lg p-12 text-center bg-[#151E31] hover:bg-[#FFFFFF]/5 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-12 h-12 rounded-full bg-[#FFFFFF]/20 hover:bg-[#ffffff]/10 flex items-center justify-center">
                            <Upload className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-white text-lg font-medium mb-2">
                              DRAG AND DROP
                            </h3>
                            <p className="text-gray-400 mb-4">Or</p>
                            <Button
                              className="bg-[#6B7280] hover:bg-[#FFFFFF]/5 text-white px-8 py-2 rounded-full"
                              onClick={() => setIsFileUploadDialogOpen(true)}
                            >
                              Upload File
                            </Button>
                          </div>
                          <p className="text-gray-400 text-sm">
                            Supported file types: PDF, txt, Markdown, Audio,
                            Video (e.g. mp3)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Source Options */}
                    <div className="px-8 pb-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Google Drive */}
                        <div
                          className="bg-[#151E31] rounded-lg p-6 text-center hover:bg-[#FFFFFF]/5 transition-colors cursor-pointer"
                          onClick={() => {
                            setIsAddSourceDialogOpen(false);
                            setIsGoogleDriveDialogOpen(true);
                          }}
                        >
                          <div className="flex flex-col items-start space-y-10">
                            <h3 className="text-white font-bold text-xl">
                              Storage
                            </h3>
                            <div className="flex items-center space-x-4">
                              <span
                                onClick={() => {
                                  setIsAddSourceDialogOpen(false);
                                  setIsGoogleDriveDialogOpen(true);
                                }}
                              >
                                <Image
                                  src="/svgs/GoogleDrive-WhiteIcon.svg"
                                  alt="Google Drive"
                                  width={60}
                                  height={52}
                                  className="opacity-50 hover:opacity-100"
                                />
                              </span>
                              <Image
                                src="/svgs/DropBox-WhiteIcon.svg"
                                alt="Dropbox"
                                width={60}
                                height={60}
                                className="opacity-50 hover:opacity-100"
                              />
                              <Image
                                src="/svgs/Cloud-WhiteIcon.svg"
                                alt="Dropbox"
                                width={60}
                                height={60}
                                className="opacity-50 hover:opacity-100"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Link */}
                        <div className="bg-[#151E31] rounded-lg p-6 text-center hover:bg-[#FFFFFF]/5 transition-colors cursor-pointer">
                          <div
                            className="flex flex-col items-start space-y-10"
                            onClick={() => setIsLinkInputDialogOpen(true)}
                          >
                            <h3 className="text-white font-bold text-xl">
                              Link
                            </h3>
                            <div className="flex items-center space-x-4">
                              <Image
                                src="/svgs/Chain-WhiteIcon.svg"
                                alt="Google Drive"
                                width={60}
                                height={60}
                                className="opacity-50 hover:opacity-100"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Copy & Paste */}
                        <div className="bg-[#151E31] rounded-lg p-6 text-center hover:bg-[#FFFFFF]/5 transition-colors cursor-pointer">
                          <div
                            className="flex flex-col items-start space-y-10"
                            onClick={() => setIsNotesDialogOpen(true)}
                          >
                            <h3 className="text-white font-bold text-xl">
                              Copy Paste
                            </h3>
                            <div className="flex items-center space-x-4">
                              <Image
                                src="/svgs/File-WhiteIcon.svg"
                                alt="Google Drive"
                                width={60}
                                height={52}
                                className="opacity-50 hover:opacity-100"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Sources List */}
              {/* <div className="p-4 space-y-3 border-b border-border">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-3 bg-secondary/50  hover:bg-secondary/80 transition-colors cursor-pointer rounded-full"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-[#FFFFFF4D] rounded-full flex items-center justify-center">
                        <Image
                          src={source.icon}
                          alt={source.name}
                          width={12}
                          height={12}
                          className="opacity-70"
                        />
                      </div>
                      <span className="text-sm text-foreground">
                        {source.name}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div> */}
              <div className="p-4 space-y-3 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Sources{" "}
                    <span className="text-sm text-muted-foreground">
                      ({getCombinedSourcesAndNotes().length})
                    </span>
                  </h2>
                </div>

                {isLoadingSources || isLoadingNotes ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading sources and notes...
                    </span>
                  </div>
                ) : getCombinedSourcesAndNotes().length > 0 ? (
                  getCombinedSourcesAndNotes().map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 hover:bg-secondary/80 transition-colors cursor-pointer rounded-full"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#FFFFFF4D] rounded-full flex items-center justify-center">
                          <span className="text-xs">{item.icon}</span>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm text-foreground truncate">
                            {item.name.slice(0, 10)}...
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.type === "source" ? "Source" : "Note"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (item.type === "source") {
                            deleteSource({
                              document_id: item.data?.document_id,
                            });
                          } else {
                            removeNote({
                              chat_session_id: currentSessionId!,
                              note_item: item.data,
                            });
                          }
                        }}
                        disabled={isDeletingSource || isRemovingNote}
                      >
                        {isDeletingSource || isRemovingNote ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {currentSessionId
                      ? "No sources or notes added to this chat"
                      : "Select a chat session to manage sources and notes"}
                  </div>
                )}
              </div>

              {/* Rosters Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Rosters{" "}
                    <span className="text-sm text-muted-foreground">
                      ({chatSelectedArtists.length})
                    </span>
                  </h2>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-transparent border-solid border-[1px] border-[#ffffff]/50"
                    onClick={handleOpenAddRosterDialog}
                    disabled={!currentSessionId || isSelectingArtists}
                  >
                    {isSelectingArtists ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  {isLoadingSelected ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Loading rosters...
                      </span>
                    </div>
                  ) : chatSelectedArtists.length > 0 ? (
                    chatSelectedArtists.map((artist, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-4 bg-secondary/30 rounded-full hover:bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <div className="text-sm font-medium text-foreground">
                          {artist}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveRosterArtist(artist)}
                          disabled={isDeselectingArtist}
                        >
                          {isDeselectingArtist ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "×"
                          )}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      {currentSessionId
                        ? "No artists selected for this chat"
                        : "Select a chat session to manage rosters"}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chats" className="flex-1 overflow-auto">
              {/* All Chats Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between ">
                  <h2 className="text-lg font-semibold text-foreground">
                    Recent Chats
                  </h2>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-transparent border-solid border-[1px] border-[#ffffff]/50"
                    onClick={handleCreateNewSession}
                    disabled={isStartingSession}
                  >
                    {isStartingSession ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  {isLoadingSessions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">
                        Loading chats...
                      </span>
                    </div>
                  ) : chatSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No chat sessions yet. Click + to create your first chat.
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <div
                        key={session.session_id}
                        className={`flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer border border-border/50 group ${
                          currentSessionId === session.session_id
                            ? "bg-primary/20 border-primary/30"
                            : "bg-secondary/30"
                        }`}
                        onClick={() =>
                          handleLoadChatSession(session.session_id)
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            {session.preview || "New chat session"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(
                              session.session_id,
                              session.preview
                            );
                          }}
                          disabled={isEndingSpecificSession(session.session_id)}
                        >
                          {isEndingSpecificSession(session.session_id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3 text-white" />
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile/Tablet: Combined Container with Tabs */}
      <div className="flex-1 lg:hidden flex flex-col bg-background rounded-lg overflow-hidden">
        {/* Current Chat Indicator - Always Visible on Mobile */}
        {(currentSessionId || chatId === "new") && (
          <div className="mx-4 mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">
                Current Chat:
              </span>
            </div>
            <p className="text-sm text-foreground mt-1 truncate">
              {chatId === "new"
                ? "New conversation - start by asking a question"
                : chatSessions.find((s) => s.session_id === currentSessionId)
                    ?.preview || "New chat session"}
            </p>
          </div>
        )}

        <TabsBB
          value={mobileActiveTab}
          onValueChange={setMobileActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="p-4 border-b border-border">
            <TabsListBB className="w-full">
              <TabsTriggerBB value="allchats" className="flex-1">
                All Chats
              </TabsTriggerBB>
              <TabsTriggerBB value="sources" className="flex-1">
                Sources
              </TabsTriggerBB>
              <TabsTriggerBB value="chat" className="flex-1">
                Chat
              </TabsTriggerBB>
            </TabsListBB>
          </div>

          <TabsContentBB value="allchats" className="flex-1 overflow-auto">
            {/* Mobile All Chats Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Chats
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-transparent border-solid border-[1px] border-[#ffffff]/50"
                  onClick={handleCreateNewSession}
                  disabled={isStartingSession}
                >
                  {isStartingSession ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading chats...
                    </span>
                  </div>
                ) : chatSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No chat sessions yet. Click + to create your first chat.
                  </div>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.session_id}
                      className={`flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer border border-border/50 group ${
                        currentSessionId === session.session_id
                          ? "bg-primary/20 border-primary/30"
                          : "bg-secondary/30"
                      }`}
                      onClick={() => handleLoadChatSession(session.session_id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {session.preview || "New chat session"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(
                            session.session_id,
                            session.preview
                          );
                        }}
                        disabled={isEndingSpecificSession(session.session_id)}
                      >
                        {isEndingSpecificSession(session.session_id) ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3 text-white" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContentBB>

          <TabsContentBB value="sources" className="flex-1 overflow-auto">
            {/* Mobile Sources Content - No Nested Tabs */}
            <div className="flex-1 flex flex-col">
              {/* Sources Section */}
              <div className="p-4 space-y-3">
                <Dialog
                  open={isMobileAddSourceDialogOpen}
                  onOpenChange={setIsMobileAddSourceDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full bg-[secondary] hover:bg-primary/90 text-primary-foreground border-solid border-[1px] border-[#ffffff]/50 rounded-full">
                      <Plus className="h-4 w-4 mr-2" />
                      ADD SOURCE
                    </Button>
                  </DialogTrigger>
                  {/* Add Source Dialog Content - Same as desktop */}
                  <DialogContent className="w-full max-w-5xl max-h-[90vh] overflow-auto bg-[#222C41] border-none p-0 rounded-t-3xl">
                    <div className="relative">
                      <div className="sticky top-0 bg-[#222C41] z-10 px-8 py-6 border-b border-[#ffffff]/10">
                        <h2 className="text-2xl font-bold text-white text-center">
                          Add Source
                        </h2>
                      </div>

                      {/* Source Options */}
                      <div className="px-8 pb-4">
                        <div className="grid grid-cols-2 gap-6">
                          {/* File Upload */}
                          <div
                            className="flex flex-col items-center p-6 bg-[#2A3441] rounded-xl hover:bg-[#3A4451] transition-colors cursor-pointer border border-[#ffffff]/10"
                            onClick={handleMobileFileUploadOption}
                          >
                            <Upload className="w-12 h-12 text-white mb-4" />
                            <h3 className="text-white font-medium text-center mb-2">
                              File Upload
                            </h3>
                            <p className="text-gray-400 text-xs text-center">
                              Upload PDF, TXT, Audio, Video
                            </p>
                          </div>
                          {/* Google Drive */}
                          <div
                            className="flex flex-col items-center p-6 bg-[#2A3441] rounded-xl hover:bg-[#3A4451] transition-colors cursor-pointer border border-[#ffffff]/10"
                            onClick={() => {
                              setIsMobileAddSourceDialogOpen(false);
                              setIsGoogleDriveDialogOpen(true);
                            }}
                          >
                            <Image
                              src="/svgs/GoogleDrive-WhiteIcon.svg"
                              alt="Google Drive"
                              width={48}
                              height={48}
                              className="mb-4"
                            />
                            <h3 className="text-white font-medium text-center mb-2">
                              Google Drive
                            </h3>
                            <p className="text-gray-400 text-xs text-center">
                              Select from your Drive
                            </p>
                          </div>
                          {/* Link Input */}
                          <div
                            className="flex flex-col items-center p-6 bg-[#2A3441] rounded-xl hover:bg-[#3A4451] transition-colors cursor-pointer border border-[#ffffff]/10"
                            onClick={handleMobileLinkInputOption}
                          >
                            <Image
                              src="/svgs/Chain-WhiteIcon.svg"
                              alt="Link"
                              width={48}
                              height={48}
                              className="mb-4"
                            />
                            <h3 className="text-white font-medium text-center mb-2">
                              Link
                            </h3>
                            <p className="text-gray-400 text-xs text-center">
                              Paste a website URL
                            </p>
                          </div>
                          {/* Copy-Paste Text */}
                          <div
                            className="flex flex-col items-center p-6 bg-[#2A3441] rounded-xl hover:bg-[#3A4451] transition-colors cursor-pointer border border-[#ffffff]/10"
                            onClick={handleMobileNotesOption}
                          >
                            <Paperclip className="w-12 h-12 text-white mb-4" />
                            <h3 className="text-white font-medium text-center mb-2">
                              Notes
                            </h3>
                            <p className="text-gray-400 text-xs text-center">
                              Add text notes
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Sources List */}
              <div className="p-4 space-y-3 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Sources{" "}
                    <span className="text-sm text-muted-foreground">
                      ({getCombinedSourcesAndNotes().length})
                    </span>
                  </h2>
                </div>
                {isLoadingSources || isLoadingNotes ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading sources and notes...
                    </span>
                  </div>
                ) : getCombinedSourcesAndNotes().length > 0 ? (
                  getCombinedSourcesAndNotes().map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 hover:bg-secondary/80 transition-colors cursor-pointer rounded-full"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#FFFFFF4D] rounded-full flex items-center justify-center">
                          <span className="text-xs">{item.icon}</span>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm text-foreground truncate">
                            {item.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.type === "source" ? "Source" : "Note"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (item.type === "source") {
                            deleteSource({
                              document_id: item.data?.document_id,
                            });
                          } else {
                            removeNote({
                              chat_session_id: currentSessionId!,
                              note_item: item.data,
                            });
                          }
                        }}
                        disabled={isDeletingSource || isRemovingNote}
                      >
                        {isDeletingSource || isRemovingNote ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {currentSessionId
                      ? "No sources or notes added to this chat"
                      : "Select a chat session to manage sources and notes"}
                  </div>
                )}
              </div>

              {/* Rosters Section */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Rosters{" "}
                    <span className="text-sm text-muted-foreground">
                      ({chatSelectedArtists.length})
                    </span>
                  </h2>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-transparent border-solid border-[1px] border-[#ffffff]/50"
                    onClick={handleOpenAddRosterDialog}
                    disabled={!currentSessionId || isSelectingArtists}
                  >
                    {isSelectingArtists ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  {isLoadingSelected ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Loading rosters...
                      </span>
                    </div>
                  ) : chatSelectedArtists.length > 0 ? (
                    chatSelectedArtists.map((artist, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-foreground">
                            {artist}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveRosterArtist(artist)}
                          disabled={isDeselectingArtist}
                        >
                          {isDeselectingArtist ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      {currentSessionId
                        ? "No artists selected for this chat"
                        : "Select a chat session to manage rosters"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContentBB>

          <TabsContentBB value="chat" className="flex-1 flex flex-col">
            {/* Mobile Chat Content */}
            <div
              ref={mobileChatRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              {/* Loading overlay for chat loading */}
              {(isLoadingChats || isLoadingSessions) && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {isLoadingSessions
                        ? "Loading chats..."
                        : "Loading chat..."}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className="space-y-2">
                    {message.type === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg p-3">
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] bg-muted rounded-lg p-3 relative group">
                          {/* Download Options for Mobile - Top Right */}
                          {!message.isThinking && message.displayData && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-32"
                                >
                                  {getDownloadOptions(message).map(
                                    (option, index) => (
                                      <DropdownMenuItem
                                        key={index}
                                        onClick={option.action}
                                      >
                                        <option.icon className="mr-2 h-3 w-3" />
                                        {option.label}
                                      </DropdownMenuItem>
                                    )
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}

                          {message.isThinking ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                              <span className="text-sm text-primary font-medium">
                                {message.content}
                              </span>
                            </div>
                          ) : (
                            <ResponseRenderer
                              answerStr={message.content}
                              displayData={message.displayData}
                              dataType={message.dataType || "text"}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pre-question badges - show only when chat is empty and no complete cycle */}
              {messages.length === 0 && !hasCompletedMessageCycle && (
                <div className="absolute bottom-28 left-0 h-20 flex items-center justify-center w-full p-8">
                  <div className="flex items-center justify-center flex-wrap gap-6">
                    {preQuestions.map((question) => (
                      <Badge
                        key={question.id}
                        className="bg-secondary rounded-full px-4 py-2 cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => handlePreQuestionClick(question.query)}
                      >
                        {question.query}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Chat Input */}
            <div className="p-4 border-t border-border">
              <div className="relative w-full">
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="flex w-full items-center space-x-2 border-[1px] border-[#FFFFFF4D] rounded-xl p-3">
                    {/* Left side buttons */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        type="button"
                        onClick={() => setIsMobileAddSourceDialogOpen(true)}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>

                      {/* StickWithStart Icon with Popover OR Selected Item Badge */}
                      {selectedGenerateItem ? (
                        // Show badge when item is selected
                        <div className="flex items-center space-x-2 bg-secondary/50 border border-border rounded-full px-3 py-1.5">
                          <Image
                            src={getGenerateItemIcon(selectedGenerateItem)}
                            alt={selectedGenerateItem}
                            width={14}
                            height={14}
                          />
                          <span className="text-sm text-foreground capitalize">
                            {selectedGenerateItem}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-destructive/20"
                            onClick={handleRemoveGenerateItem}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        // Show popover when no item is selected
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              type="button"
                            >
                              <Image
                                src="/svgs/StickwithStart-WhiteIcon.svg"
                                alt="Generate Options"
                                width={16}
                                height={16}
                              />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-48 p-2"
                            align="start"
                            side="top"
                          >
                            <div className="space-y-1">
                              <Button
                                variant="ghost"
                                className="w-full justify-start h-10 px-3"
                                onClick={() => {
                                  handleAddGenerateItem("image");
                                }}
                              >
                                <Image
                                  src="/svgs/GanerateImage-WhitIcon.svg"
                                  alt="Generate Image"
                                  width={16}
                                  height={16}
                                  className="mr-3"
                                />
                                Generate Image
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start h-10 px-3"
                                onClick={() => {
                                  handleAddGenerateItem("video");
                                }}
                              >
                                <Image
                                  src="/svgs/GanerateVideo-WhiteIcon.svg"
                                  alt="Generate Video"
                                  width={16}
                                  height={16}
                                  className="mr-3"
                                />
                                Generate Video
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder={
                          isListening
                            ? "Listening... Speak now!"
                            : "Ask or search anything..."
                        }
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={
                          isSendingMessage ||
                          isGeneratingImage ||
                          isGeneratingVideo
                        }
                        className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                      />
                      {/* Interim transcript indicator */}
                      {interimTranscript && (
                        <div className="absolute bottom-0 left-0 text-xs text-gray-400 italic bg-gray-800 px-2 py-1 rounded">
                          {interimTranscript}...
                        </div>
                      )}
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          isListening
                            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                            : "hover:bg-gray-700"
                        }`}
                        type="button"
                        onClick={handleMicClick}
                        disabled={!isSpeechSupported}
                        title={
                          !isSpeechSupported
                            ? "Speech recognition not supported"
                            : isListening
                            ? "Stop listening"
                            : "Start voice input"
                        }
                      >
                        <Mic
                          className={`h-4 w-4 ${
                            isListening ? "animate-pulse" : ""
                          }`}
                        />
                      </Button>

                      {/* Conditional button - Live Chat or Send */}
                      {inputText.trim() ? (
                        <Button
                          type="submit"
                          size="icon"
                          disabled={
                            isSendingMessage ||
                            isGeneratingImage ||
                            isGeneratingVideo
                          }
                          className="h-8 w-8 bg-primary hover:bg-primary/90 disabled:opacity-50"
                        >
                          {isSendingMessage ||
                          isGeneratingImage ||
                          isGeneratingVideo ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          type="button"
                          onClick={() => setIsLiveChatDialogOpen(true)}
                        >
                          <Image
                            src="/svgs/AudioImage.svg"
                            alt="Live Chat"
                            width={16}
                            height={16}
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </TabsContentBB>
        </TabsBB>
      </div>

      {/* Desktop: Center Panel - Chat */}
      <div className="hidden lg:flex flex-1 flex-col bg-background  rounded-lg  overflow-hidden min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-center flex-col relative overflow-hidden bg-transparent rounded-t-lg">
          <h3 className="absolute top-1/2 left-12 transform -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-foreground">
            Chat
          </h3>

          <Image
            src="/svgs/Bot-Lion.svg"
            alt="Bot Lion"
            width={110}
            height={100}
            className="object-contain absolute -top-1"
          />
          <Separator className="mt-15 z-50" />
        </div>

        {/* Chat Messages */}
        <div
          ref={desktopChatRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 relative scrollbar-thin scroll-smooth"
        >
          {/* Loading overlay for chat loading */}
          {(isLoadingChats || isLoadingSessions) && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {isLoadingSessions ? "Loading chats..." : "Loading chat..."}
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "user" ? (
                <div className="max-w-[70%] bg-primary text-primary-foreground rounded-lg p-4">
                  <p className="text-sm">{message.content}</p>
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-primary-foreground/70">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-background text-secondary-foreground rounded-lg p-4 max-w-full relative group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Image
                        src="/svgs/Golden-Paw.svg"
                        alt="Paw"
                        width={16}
                        height={16}
                        className={message.isThinking ? "animate-pulse" : ""}
                      />
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp}
                      </span>
                    </div>

                    {/* Download Options - Show only for bot messages with data */}
                    {!message.isThinking && message.displayData && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {getDownloadOptions(message).map(
                              (option, index) => (
                                <DropdownMenuItem
                                  key={index}
                                  onClick={option.action}
                                >
                                  <option.icon className="mr-2 h-3 w-3" />
                                  {option.label}
                                </DropdownMenuItem>
                              )
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    {message.isThinking ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-primary font-medium">
                          {message.content}
                        </span>
                      </div>
                    ) : (
                      <ResponseRenderer
                        answerStr={message.content}
                        displayData={message.displayData}
                        dataType={message.dataType || "text"}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pre-question badges - show only when chat is empty and no complete cycle */}
          {messages.length === 0 && !hasCompletedMessageCycle && (
            <div className="absolute bottom-20 left-0 h-20 flex items-center justify-center w-full p-8">
              <div className="flex items-center justify-center flex-wrap gap-6">
                {preQuestions.map((question) => (
                  <Badge
                    key={question.id}
                    className="bg-secondary rounded-full px-4 py-2 cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => handlePreQuestionClick(question.query)}
                  >
                    {question.query}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Models Selection */}
        <div className="p-4 border-t border-border">
          {/* Chat Input */}
          <div className="relative">
            <form onSubmit={handleSubmit}>
              <div className="flex w-full items-center flex-col space-x-2 border-[1px] border-[#FFFFFF4D] rounded-xl p-3">
                {/* Left side buttons */}
                <div className="flex-1 w-full relative">
                  <input
                    type="text"
                    placeholder={
                      isListening
                        ? "Listening... Speak now!"
                        : "Ask or search anything..."
                    }
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={
                      isSendingMessage || isGeneratingImage || isGeneratingVideo
                    }
                    className="w-full bg-transparent p-2 border-none outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                  />
                  {/* Interim transcript indicator */}
                  {interimTranscript && (
                    <div className="absolute bottom-0 left-2 text-xs text-gray-400 italic bg-gray-800 px-2 py-1 rounded">
                      {interimTranscript}...
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between w-full space-x-2">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      type="button"
                      onClick={() => setIsAddSourceDialogOpen(true)}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>

                    {/* StickWithStart Icon with Popover OR Selected Item Badge */}
                    {selectedGenerateItem ? (
                      // Show badge when item is selected
                      <div className="flex items-center space-x-2 bg-secondary/50 border border-border rounded-full px-3 py-1.5">
                        <Image
                          src={getGenerateItemIcon(selectedGenerateItem)}
                          alt={selectedGenerateItem}
                          width={14}
                          height={14}
                        />
                        <span className="text-sm text-foreground capitalize">
                          {selectedGenerateItem}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-destructive/20"
                          onClick={handleRemoveGenerateItem}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      // Show popover when no item is selected
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            type="button"
                          >
                            <Image
                              src="/svgs/StickwithStart-WhiteIcon.svg"
                              alt="Generate Options"
                              width={16}
                              height={16}
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-48 p-2"
                          align="start"
                          side="top"
                        >
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-10 px-3"
                              onClick={() => {
                                handleAddGenerateItem("image");
                              }}
                            >
                              <Image
                                src="/svgs/GanerateImage-WhitIcon.svg"
                                alt="Generate Image"
                                width={16}
                                height={16}
                                className="mr-3"
                              />
                              Generate Image
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-10 px-3"
                              onClick={() => {
                                handleAddGenerateItem("video");
                              }}
                            >
                              <Image
                                src="/svgs/GanerateVideo-WhiteIcon.svg"
                                alt="Generate Video"
                                width={16}
                                height={16}
                                className="mr-3"
                              />
                              Generate Video
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>

                  {/* Right side buttons */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                          : "hover:bg-gray-700"
                      }`}
                      type="button"
                      onClick={handleMicClick}
                      disabled={!isSpeechSupported}
                      title={
                        !isSpeechSupported
                          ? "Speech recognition not supported"
                          : isListening
                          ? "Stop listening"
                          : "Start voice input"
                      }
                    >
                      <Mic
                        className={`h-4 w-4 ${
                          isListening ? "animate-pulse" : ""
                        }`}
                      />
                    </Button>

                    {/* Conditional button - Live Chat or Send */}
                    {inputText.trim() ? (
                      <Button
                        type="submit"
                        size="icon"
                        disabled={
                          isSendingMessage ||
                          isGeneratingImage ||
                          isGeneratingVideo
                        }
                        className="h-8 w-8 bg-primary hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isSendingMessage ||
                        isGeneratingImage ||
                        isGeneratingVideo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        type="button"
                        onClick={() => setIsLiveChatDialogOpen(true)}
                      >
                        <Image
                          src="/svgs/SpeakIcon.svg"
                          alt="Live Chat"
                          width={16}
                          height={16}
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Remove Artist Confirmation Dialog */}
      <Dialog
        open={confirmRemoveDialog.isOpen}
        onOpenChange={(open) =>
          !open && setConfirmRemoveDialog({ isOpen: false, artistName: "" })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Artist</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">
                {confirmRemoveDialog.artistName}
              </span>{" "}
              from your roster? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancelRemoveArtist}
              disabled={deleteArtistMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRemoveArtist}
              disabled={deleteArtistMutation.isPending}
            >
              {deleteArtistMutation.isPending ? "Removing..." : "Yes, Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Session Confirmation Dialog */}
      <Dialog
        open={confirmDeleteSessionDialog.isOpen}
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
                {confirmDeleteSessionDialog.preview || "Chat session"}
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

      {/* Add Roster Dialog */}
      <Dialog
        open={isAddRosterDialogOpen}
        onOpenChange={setIsAddRosterDialogOpen}
      >
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-[#222C41] border-none p-0 rounded-t-3xl">
          {/* Header with Bot Lion */}
          <div className="flex items-center justify-center flex-col relative overflow-hidden bg-[#293650] rounded-t-3xl">
            <Image
              src="/svgs/Bot-Lion.svg"
              alt="Bot Lion"
              width={110}
              height={100}
              className="object-contain absolute -top-1"
            />
            <Separator className="mt-15 z-50" />
          </div>

          <div className="px-8 pb-4 text-start">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Add Artists to Chat
            </h2>
            <p className="text-gray-300 text-sm">
              Select artists from your roster to add to this chat session.
            </p>
          </div>

          {/* Artists List */}
          <div className="px-8 pb-4">
            <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-hide">
              {isLoadingRoster ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                  <span className="ml-2 text-white">
                    Loading your artists...
                  </span>
                </div>
              ) : userRoster.length > 0 ? (
                userRoster.map((artist, index) => {
                  const isSelected = tempSelectedRosterArtists.some(
                    (a) => a.id === artist.id
                  );
                  const isAlreadyInChat = chatSelectedArtists.includes(
                    artist.name
                  );

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                        isAlreadyInChat
                          ? "bg-green-600/20 border border-green-600/30"
                          : isSelected
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-[#4A5A6C] hover:bg-[#5A6A7C]"
                      }`}
                      onClick={() =>
                        !isAlreadyInChat && handleToggleRosterArtist(artist)
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isAlreadyInChat
                              ? "bg-green-600 border-green-600"
                              : isSelected
                              ? "bg-primary border-primary"
                              : "border-white"
                          }`}
                        >
                          {(isSelected || isAlreadyInChat) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <img
                            src={artist.picture_url || "/api/placeholder/32/32"}
                            alt={artist.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {artist.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {artist.country} •{" "}
                              {artist.listenership.toLocaleString()} listeners
                            </div>
                          </div>
                        </div>
                      </div>
                      {isAlreadyInChat && (
                        <span className="text-xs text-green-400">In Chat</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-white text-sm mb-2">
                    No artists in your roster
                  </span>
                  <span className="text-gray-400 text-xs">
                    Add artists to your roster in the My Artists page first.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Add to Chat Button */}
          <div className="flex justify-between items-center px-8 pb-6">
            <div className="text-sm text-gray-400">
              {tempSelectedRosterArtists.length > 0 && (
                <span>
                  {tempSelectedRosterArtists.length} artist
                  {tempSelectedRosterArtists.length !== 1 ? "s" : ""} selected
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTempSelectedRosterArtists([]);
                  setIsAddRosterDialogOpen(false);
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                className="bg-[#E55351] hover:bg-[#E55351]/90 text-white px-8"
                onClick={handleAddRosterArtists}
                disabled={
                  tempSelectedRosterArtists.length === 0 || isSelectingArtists
                }
              >
                {isSelectingArtists ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add to Chat{" "}
                    {tempSelectedRosterArtists.length > 0 &&
                      `(${tempSelectedRosterArtists.length})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Roster Confirmation Dialog */}
      <Dialog
        open={confirmRemoveRosterDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelRemoveRosterArtist();
        }}
      >
        <DialogContent className="bg-[#222C41] border-none text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Remove Artist from Chat
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to remove{" "}
              <span className="font-semibold">
                {confirmRemoveRosterDialog.artistName}
              </span>{" "}
              from this chat session?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelRemoveRosterArtist}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemoveRosterArtist}
              disabled={isDeselectingArtist}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeselectingArtist ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                "Remove Artist"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* File Upload Dialog */}

      <Dialog
        open={isFileUploadDialogOpen}
        onOpenChange={setIsFileUploadDialogOpen}
      >
        <DialogContent className="w-full max-w-md bg-background border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Upload File
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload PDF, TXT, Markdown, Audio, or Video files (Max: 100MB)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-muted/30"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  handleFileUpload(files[0]);
                }
              }}
            >
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-foreground">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported: PDF, TXT, MD, MP3, WAV, MP4, AVI, MOV
                </p>
              </div>
            </div>

            {/* File Input */}
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.txt,.md,.mp3,.wav,.mp4,.avi,.mov"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
                e.target.value = "";
              }}
            />
            <label
              htmlFor="file-upload"
              className="block w-full p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-center cursor-pointer transition-colors"
            >
              Choose File
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFileUploadDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Input Dialog */}
      <Dialog
        open={isLinkInputDialogOpen}
        onOpenChange={setIsLinkInputDialogOpen}
      >
        <DialogContent className="w-full max-w-md bg-background border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Add Link
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter a website URL to add as a source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Website URL
              </label>
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLinkInputDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkSubmit}
              disabled={!linkInput.trim() || isUploadingSource}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isUploadingSource ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Link"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="w-full max-w-md bg-background border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Add Note
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a text note to this chat session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Note Text
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Enter your note here..."
                rows={4}
                className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNotesDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNoteSubmit}
              disabled={!noteInput.trim() || isAddingNote}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isAddingNote ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Note"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Drive Connector Dialog */}
      <GoogleDriveConnector
        isOpen={isGoogleDriveDialogOpen}
        onClose={() => setIsGoogleDriveDialogOpen(false)}
        onConnect={handleGoogleDriveConnect}
        isUploading={isUploadingGoogleDriveFiles}
        uploadProgress={uploadProgress}
        googleDriveHook={googleDriveHook}
      />

      {/* Live Chat Dialog */}
      <Dialog
        open={isLiveChatDialogOpen}
        onOpenChange={setIsLiveChatDialogOpen}
      >
        <DialogContent className="max-w-full max-h-full w-screen h-[80vh] p-0 border-none bg-gradient-to-b from-[#2A3441] to-[#1A2332]">
          <div className="flex flex-col items-center justify-center h-full relative">
            {/* Bot Lion Image */}
            <div className="mb-8">
              <Image
                src="/svgs/Bot-Lion.svg"
                alt="Bot Lion"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>

            {/* Audio Visualization */}
            <div className="mb-8 relative">
              <Image
                src="/svgs/AudioImage.svg"
                alt="Audio Visualization"
                width={300}
                height={80}
                className={`object-contain transition-all duration-300 ${
                  voiceChat.isListening
                    ? "animate-pulse opacity-100 scale-110"
                    : voiceChat.isPlaying
                    ? "animate-pulse opacity-90 scale-105"
                    : "opacity-60"
                }`}
              />
            </div>

            {/* Response Text */}
            <div className="mb-12 text-center max-w-md px-4">
              <p className="text-white text-lg mb-2">
                {voiceChat.getStatusMessage()}
              </p>
              {voiceChat.currentTranscript && (
                <p className="text-gray-300 text-sm italic">
                  "{voiceChat.currentTranscript}"
                </p>
              )}
              {voiceChat.interimTranscript && (
                <p className="text-gray-400 text-sm italic opacity-70">
                  {voiceChat.interimTranscript}...
                </p>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="icon"
                className={`h-16 w-16 rounded-full text-white transition-all duration-200 ${
                  voiceChat.isListening
                    ? "bg-red-600 hover:bg-red-700 animate-pulse shadow-lg shadow-red-500/50"
                    : voiceChat.isProcessing
                    ? "bg-yellow-600 hover:bg-yellow-700 animate-pulse"
                    : voiceChat.isPlaying
                    ? "bg-[#4A5568]"
                    : "bg-[#E53E3E] hover:bg-[#C53030]"
                }`}
                onClick={voiceChat.toggleVoiceRecording}
                disabled={!voiceChat.isSupported || voiceChat.isProcessing}
                title={
                  !voiceChat.isSupported
                    ? "Voice chat not supported in this browser"
                    : voiceChat.isListening
                    ? "Stop recording"
                    : voiceChat.isProcessing
                    ? "Processing..."
                    : voiceChat.isPlaying
                    ? "Playing response"
                    : "Start voice chat"
                }
              >
                <Mic
                  className={`h-8 w-8 ${
                    voiceChat.isListening ||
                    voiceChat.isProcessing ||
                    voiceChat.isPlaying
                      ? "animate-pulse"
                      : ""
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-[#4A5568] hover:bg-[#5A6578] text-white"
                onClick={() => {
                  scrollToBottom();
                  voiceChat.stopAllVoiceActivities();
                  setIsLiveChatDialogOpen(false);
                }}
                title="Close voice chat and return to chat history"
              >
                <X className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;

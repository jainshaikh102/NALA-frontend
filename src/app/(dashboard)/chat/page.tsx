"use client";

import React, { useState } from "react";
import Image from "next/image";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthStore } from "@/store/auth-store";
import { useGet, usePost } from "@/hooks/use-api";
import { GoogleDriveConnector } from "@/components/sources/google-drive-connector";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: string;
  displayData?: unknown;
  dataType?: string;
  queryStr?: string;
  status?: boolean;
}

const ChatPage = () => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRosterDialogOpen, setIsRosterDialogOpen] = useState(false);
  const [allArtists, setAllArtists] = useState<string[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [tempSelectedArtists, setTempSelectedArtists] = useState<string[]>([]);
  const [isAddSourceDialogOpen, setIsAddSourceDialogOpen] = useState(false);
  const [isGoogleDriveDialogOpen, setIsGoogleDriveDialogOpen] = useState(false);
  const [isLiveChatDialogOpen, setIsLiveChatDialogOpen] = useState(false);
  const [selectedGenerateItem, setSelectedGenerateItem] = useState<
    string | null
  >(null);
  const [confirmRemoveDialog, setConfirmRemoveDialog] = useState<{
    isOpen: boolean;
    artistName: string;
  }>({ isOpen: false, artistName: "" });
  const [confirmDeleteChatDialog, setConfirmDeleteChatDialog] = useState<{
    isOpen: boolean;
    chatId: number;
    chatTitle: string;
  }>({ isOpen: false, chatId: 0, chatTitle: "" });

  const { user } = useAuthStore();

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

  // Add artist mutation (using POST to /artists/select)
  const addArtistMutation = usePost(`artists/select`, {
    onSuccess: () => {
      refetchSelectedArtists();
      setTempSelectedArtists([]);
      setIsRosterDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error adding artists:", error);
    },
  });

  // Mock data for sources
  const sources = [
    {
      id: 1,
      name: "Explore management...",
      type: "folder",
      icon: "/svgs/GoogleDrive-WhiteIcon.svg",
    },
    {
      id: 2,
      name: "Domain: blacklionapp.com",
      type: "website",
      icon: "/svgs/Chain-WhiteIcon.svg",
    },
    {
      id: 3,
      name: "Dropbox folder",
      type: "folder",
      icon: "/svgs/DropBox-WhiteIcon.svg",
    },
  ];

  const preQuestions = [
    { id: 1, query: "Discover Top Performing Tracks" },
    { id: 2, query: "Music Market Trends" },
    { id: 3, query: "Music Investment & Growth" },
    { id: 4, query: "Find Investment Opportunities" },
    { id: 5, query: "View Music Industry Insights" },
  ];

  // Mock data for recent chats
  const [recentChats, setRecentChats] = useState([
    {
      id: 1,
      firstMessage: "Compare monthly earnings for selected artists",
    },
    {
      id: 2,
      firstMessage: "Which artist has more followers on Instagram?",
    },
    {
      id: 3,
      firstMessage: "What's the latest news on the music industry?",
    },
    {
      id: 4,
      firstMessage: "Analyze streaming performance across platforms",
    },
    {
      id: 5,
      firstMessage: "Show me the top trending songs this week",
    },
  ]);

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
    setIsLoading(true);

    try {
      const payload = {
        question: question,
        username: user?.username,
        model_name: "gemini-2.0-flash-001",
      };

      console.log("Sending payload:", payload);

      const response = await fetch("/api/chat/execute-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Response data:", data);

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

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
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
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  // Update selected artists when API data changes
  React.useEffect(() => {
    if (selectedArtistsData?.length > 0) {
      setSelectedArtists(selectedArtistsData);
    } else {
      setSelectedArtists([]);
    }
  }, [selectedArtistsData]);
  console.log("eeeee", selectedArtistsData);
  // Fetch all artists from API
  const fetchAllArtists = async () => {
    setIsLoadingArtists(true);
    try {
      const response = await fetch("/api/artists", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const artists = await response.json();
      setAllArtists(artists);
      setFilteredArtists(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      // Show empty state instead of mock data
      setAllArtists([]);
      setFilteredArtists([]);
    } finally {
      setIsLoadingArtists(false);
    }
  };

  // Handle search in artists list
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredArtists(allArtists);
    } else {
      const filtered = allArtists.filter((artist) =>
        artist.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredArtists(filtered);
    }
  };

  // Toggle artist selection in dialog
  const handleToggleArtist = (artistName: string) => {
    setTempSelectedArtists((prev) => {
      if (prev.includes(artistName)) {
        return prev.filter((artist) => artist !== artistName);
      } else {
        return [...prev, artistName];
      }
    });
  };

  // Add selected artists to the main list
  const handleAddSelectedArtists = async () => {
    const newArtists = tempSelectedArtists.filter(
      (artist) => !selectedArtists.includes(artist)
    );

    if (newArtists.length > 0 && user?.username) {
      // Add each artist individually since API expects one artist per request
      for (const artist of newArtists) {
        try {
          await addArtistMutation.mutateAsync({
            username: user.username,
            artist_name: artist,
          });
        } catch (error) {
          console.error(`Error adding artist ${artist}:`, error);
          // Continue with other artists even if one fails
        }
      }
      // Refetch data after all additions
      refetchSelectedArtists();
      setTempSelectedArtists([]);
      setIsRosterDialogOpen(false);
    } else {
      setTempSelectedArtists([]);
      setIsRosterDialogOpen(false);
    }
  };

  // Show confirmation dialog for removing artist
  const handleRemoveArtist = (artistName: string) => {
    setConfirmRemoveDialog({ isOpen: true, artistName });
  };

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
  const handleGoogleDriveConnect = (files: any[]) => {
    console.log("Google Drive files connected:", files);
    // Here you can add the files to your sources
    // For now, we'll just show a success message
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

  // Handle delete chat
  const handleDeleteChat = (chatId: number) => {
    setRecentChats((prev) => prev.filter((chat) => chat.id !== chatId));
    setConfirmDeleteChatDialog({ isOpen: false, chatId: 0, chatTitle: "" });
  };

  // Handle chat selection
  const handleSelectChat = (chatId: number) => {
    // Load chat history for the selected chat
    console.log("Load chat:", chatId);
    // Here you would typically load the chat messages and switch to chat tab
  };

  // Handle pre-question click
  const handlePreQuestionClick = (question: string) => {
    setInputText(question);
  };

  // Open roster dialog and fetch artists
  const handleOpenRosterDialog = () => {
    setIsRosterDialogOpen(true);
    setTempSelectedArtists([]); // Clear temporary selections when opening dialog
    if (allArtists.length === 0) {
      fetchAllArtists();
    }
  };

  return (
    <div className="h-screen bg-secondary flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
      {/* Desktop: Left Panel - Sources, Rosters, Queries */}
      <div className="hidden lg:block w-80 transition-all duration-300 ease-in-out bg-background border border-border rounded-lg overflow-auto scrollbar-hide flex-shrink-0">
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

          {/* Tabs */}
          <Tabs defaultValue="sources" className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="sources" className="flex-1">
                  Sources
                </TabsTrigger>
                <TabsTrigger value="chats" className="flex-1">
                  All Chats
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
                            <Button className="bg-[#6B7280] hover:bg-[#FFFFFF]/5 text-white px-8 py-2 rounded-full">
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
                              Google Drive
                            </h3>
                            <div className="flex items-center space-x-4">
                              <Image
                                src="/svgs/GoogleDrive-WhiteIcon.svg"
                                alt="Google Drive"
                                width={60}
                                height={52}
                                className="opacity-50 hover:opacity-100"
                              />
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
                          <div className="flex flex-col items-start space-y-10">
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
                          <div className="flex flex-col items-start space-y-10">
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
              <div className="p-4 space-y-3 border-b border-border">
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

                {/* <div className="flex items-center justify-center space-x-2 pt-2">
                  {SocialMedia.map((social) => (
                    <div
                      key={social.id}
                      className={`w-8 h-8 ${social.bgColor} rounded-full flex items-center justify-center`}
                    >
                      <Image
                        key={social.id}
                        src={social.icon}
                        alt={social.name}
                        width={20}
                        height={20}
                        className=""
                      />
                    </div>
                  ))}
                </div> */}
              </div>

              {/* Rosters Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Rosters{" "}
                    <span className="text-sm text-muted-foreground">
                      ({selectedArtists.length})
                    </span>
                  </h2>
                  <Dialog
                    open={isRosterDialogOpen}
                    onOpenChange={setIsRosterDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full bg-transparent border-solid border-[1px] border-[#ffffff]/50"
                        onClick={handleOpenRosterDialog}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
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
                          Add New Artist
                        </h2>
                      </div>

                      {/* Search Input */}
                      <div className="relative rounded-full overflow-hidden px-8 pb-4">
                        <Input
                          placeholder="Search artists..."
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="pr-10 bg-background border-border text-white placeholder:text-border rounded-full"
                        />
                        <div className="absolute right-12 top-4.5 transform -translate-y-1/2">
                          <Image
                            src="/svgs/Golden-Paw.svg"
                            alt="Paw"
                            width={16}
                            height={16}
                          />
                        </div>
                      </div>

                      <div className="space-y-4 px-8 pb-4">
                        {/* Select All / Clear All */}
                        {filteredArtists.length > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-600">
                            <span className="text-sm text-gray-400">
                              {filteredArtists.length} artist
                              {filteredArtists.length !== 1 ? "s" : ""}{" "}
                              available
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const availableArtists =
                                    filteredArtists.filter(
                                      (artist) =>
                                        !selectedArtists.includes(artist)
                                    );
                                  setTempSelectedArtists(availableArtists);
                                }}
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                Select All
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTempSelectedArtists([])}
                                className="text-xs text-gray-400 hover:text-gray-300"
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Artists List */}
                        <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-hide">
                          {isLoadingArtists ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                              <span className="ml-2 text-white">
                                Loading artists...
                              </span>
                            </div>
                          ) : filteredArtists.length > 0 ? (
                            filteredArtists.map((artist, index) => {
                              const isSelected =
                                tempSelectedArtists.includes(artist);
                              const isAlreadyAdded =
                                selectedArtists.includes(artist);

                              return (
                                <div
                                  key={index}
                                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                                    isAlreadyAdded
                                      ? "bg-primary/20 border border-primary/30"
                                      : isSelected
                                      ? "bg-primary/20 border border-primary/30"
                                      : "bg-[#4A5A6C] hover:bg-[#5A6A7C]"
                                  }`}
                                  onClick={() =>
                                    !isAlreadyAdded &&
                                    handleToggleArtist(artist)
                                  }
                                >
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                        isAlreadyAdded
                                          ? "bg-primary border-primary"
                                          : isSelected
                                          ? "bg-primary border-primary"
                                          : "border-white"
                                      }`}
                                    >
                                      {(isSelected || isAlreadyAdded) && (
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
                                    <div
                                      className={`text-sm font-medium ${
                                        isAlreadyAdded
                                          ? "text-white"
                                          : "text-white"
                                      }`}
                                    >
                                      {artist}
                                    </div>
                                  </div>
                                  {isAlreadyAdded && (
                                    <span className="text-xs text-green-400">
                                      Added
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <span className="text-white text-sm mb-2">
                                No artists found
                              </span>
                              <span className="text-gray-400 text-xs">
                                {allArtists.length === 0
                                  ? "Failed to load artists from API"
                                  : "Try adjusting your search"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Add to Source Button */}
                        <div className="flex justify-between items-center pt-4">
                          <div className="text-sm text-gray-400">
                            {tempSelectedArtists.length > 0 && (
                              <span>
                                {tempSelectedArtists.length} artist
                                {tempSelectedArtists.length !== 1
                                  ? "s"
                                  : ""}{" "}
                                selected
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setTempSelectedArtists([]);
                                setIsRosterDialogOpen(false);
                              }}
                              className="px-6"
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-[#E55351] hover:bg-[#E55351]/90 text-white px-8"
                              onClick={handleAddSelectedArtists}
                              disabled={
                                tempSelectedArtists.length === 0 ||
                                addArtistMutation.isPending
                              }
                            >
                              {addArtistMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  Add To Source{" "}
                                  {tempSelectedArtists.length > 0 &&
                                    `(${tempSelectedArtists.length})`}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  {isLoadingSelectedArtists ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Loading artists...
                      </span>
                    </div>
                  ) : selectedArtists.length > 0 ? (
                    selectedArtists.map((artist, index) => (
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
                          onClick={() => handleRemoveArtist(artist)}
                          disabled={deleteArtistMutation.isPending}
                        >
                          ×
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No artists selected. Click + to add artists to your
                      roster.
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
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {recentChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer border border-border/50 group"
                      onClick={() => handleSelectChat(chat.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {chat.firstMessage}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0 "
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteChatDialog({
                            isOpen: true,
                            chatId: chat.id,
                            chatTitle: chat.firstMessage,
                          });
                        }}
                      >
                        <X className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile/Tablet: Combined Container with Tabs */}
      <div className="flex-1 lg:hidden flex flex-col bg-background border border-border rounded-lg overflow-hidden">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border">
            <TabsList className="w-full">
              <TabsTrigger value="sources" className="flex-1">
                Sources
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex-1">
                Chat
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sources" className="flex-1 overflow-auto">
            {/* Mobile Sources Content with Nested Tabs */}
            <Tabs defaultValue="sources" className="flex-1 flex flex-col">
              <div className="p-4 border-b border-border">
                <TabsList className="w-full">
                  <TabsTrigger value="sources" className="flex-1">
                    Source
                  </TabsTrigger>
                  <TabsTrigger value="allchats" className="flex-1">
                    All Chats
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="sources" className="flex-1 overflow-auto">
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
                          <div className="grid grid-cols-3 gap-6">
                            {sources.map((source) => (
                              <div
                                key={source.id}
                                className="flex flex-col items-center p-6 bg-[#2A3441] rounded-xl hover:bg-[#3A4451] transition-colors cursor-pointer border border-[#ffffff]/10"
                                onClick={() => {
                                  if (source.name === "Google Drive") {
                                    setIsAddSourceDialogOpen(false);
                                    setIsGoogleDriveDialogOpen(true);
                                  }
                                }}
                              >
                                <Image
                                  src={source.icon}
                                  alt={source.name}
                                  width={48}
                                  height={48}
                                  className="mb-4"
                                />
                                <h3 className="text-white font-medium text-center">
                                  {source.name}
                                </h3>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Sources List */}
                  <div className="space-y-2">
                    {sources.map((source) => (
                      <div
                        key={source.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Image
                            src={source.icon}
                            alt={source.name}
                            width={20}
                            height={20}
                          />
                          <span className="text-sm font-medium text-foreground">
                            {source.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="allchats" className="flex-1 overflow-auto">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between ">
                    <h2 className="text-lg font-semibold text-foreground">
                      Recent Chats
                    </h2>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-transparent border-solid border-[1px] border-[#ffffff]/50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {recentChats.map((chat) => (
                      <div
                        key={chat.id}
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer border border-border/50 group"
                        onClick={() => handleSelectChat(chat.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            {chat.firstMessage}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteChatDialog({
                              isOpen: true,
                              chatId: chat.id,
                              chatTitle: chat.firstMessage,
                            });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 flex flex-col">
            {/* Mobile Chat Content */}
            <div className="flex-1 overflow-auto p-4 relative">
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
                        <div className="max-w-[80%] bg-muted rounded-lg p-3">
                          <ResponseRenderer
                            answerStr={message.content}
                            displayData={message.displayData}
                            dataType={message.dataType || "text"}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Pre-question badges - show only when chat is empty */}
              {messages.length === 0 && (
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

                    <input
                      type="text"
                      placeholder="Ask or search anything..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                    />

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        type="button"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>

                      {/* Conditional button - Live Chat or Send */}
                      {inputText.trim() ? (
                        <Button
                          type="submit"
                          size="icon"
                          disabled={isLoading}
                          className="h-8 w-8 bg-primary hover:bg-primary/90 disabled:opacity-50"
                        >
                          {isLoading ? (
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Center Panel - Chat */}

      {/* Desktop: Center Panel - Chat */}
      <div className="hidden lg:flex flex-1 flex-col bg-background border border-border rounded-lg  overflow-hidden min-w-0">
        {/* Chat Header */}
        {/* <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">Chat</h1>
            </div>
          </div>
        </div> */}
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
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
                <div className="w-full bg-secondary text-secondary-foreground rounded-lg p-4 max-w-full">
                  <div className="flex items-center space-x-2 mb-3">
                    <Image
                      src="/svgs/Golden-Paw.svg"
                      alt="Paw"
                      width={16}
                      height={16}
                    />
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp}
                    </span>
                  </div>
                  <div className="w-full">
                    <ResponseRenderer
                      answerStr={message.content}
                      displayData={message.displayData}
                      dataType={message.dataType || "text"}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pre-question badges - show only when chat is empty */}
          {messages.length === 0 && (
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
                <input
                  type="text"
                  placeholder="Ask or search anything..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent w-full p-2 border-none outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
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
                  {/* Selected Generate Items Badges */}

                  {/* Right side buttons */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      type="button"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>

                    {/* Conditional button - Live Chat or Send */}
                    {inputText.trim() ? (
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading}
                        className="h-8 w-8 bg-primary hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isLoading ? (
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

      {/* Google Drive Connector Dialog */}
      <GoogleDriveConnector
        isOpen={isGoogleDriveDialogOpen}
        onClose={() => setIsGoogleDriveDialogOpen(false)}
        onConnect={handleGoogleDriveConnect}
      />

      {/* Live Chat Dialog */}
      <Dialog
        open={isLiveChatDialogOpen}
        onOpenChange={setIsLiveChatDialogOpen}
      >
        <DialogContent className="max-w-full max-h-full w-screen h-[80vh] p-0 border-none bg-gradient-to-b from-[#2A3441] to-[#1A2332]">
          <div className="flex flex-col items-center justify-center h-full relative">
            {/* Close button */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 h-12 w-12 rounded-full bg-[#4A5568] hover:bg-[#5A6578] text-white"
              onClick={() => setIsLiveChatDialogOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button> */}

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
            <div className="mb-8">
              <Image
                src="/svgs/AudioImage.svg"
                alt="Audio Visualization"
                width={300}
                height={80}
                className="object-contain"
              />
            </div>

            {/* Response Text */}
            <div className="mb-12 text-center max-w-md">
              <p className="text-white text-lg">
                I have generated the comprehensive valuation report for Cailboy
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-[#E53E3E] hover:bg-[#C53030] text-white"
              >
                <Mic className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-[#4A5568] hover:bg-[#5A6578] text-white"
                onClick={() => setIsLiveChatDialogOpen(false)}
              >
                <X className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Confirmation Dialog */}
      <Dialog
        open={confirmDeleteChatDialog.isOpen}
        onOpenChange={(open) =>
          !open &&
          setConfirmDeleteChatDialog({
            isOpen: false,
            chatId: 0,
            chatTitle: "",
          })
        }
      >
        <DialogContent className="max-w-md">
          <div className="p-6">
            {/* <h2 className="text-lg font-semibold text-foreground mb-4">
              Delete Chat
            </h2> */}
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this chat?
            </p>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmDeleteChatDialog({
                    isOpen: false,
                    chatId: 0,
                    chatTitle: "",
                  })
                }
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteChat(confirmDeleteChatDialog.chatId)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;

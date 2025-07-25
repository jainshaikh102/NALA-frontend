"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResponseRenderer } from "@/components/chat/ResponseRenderer";

import {
  Plus,
  MoreHorizontal,
  Send,
  Paperclip,
  Volume2,
  Users,
  FileText,
  Settings,
  Lightbulb,
  Zap,
  Globe,
  PanelRight,
  Loader2,
  Search,
  X,
  Play,
  Image as ImageIcon,
  Info,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

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
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState(
    "deepseek-r1-distill-llama-70b"
  );
  const [isRosterDialogOpen, setIsRosterDialogOpen] = useState(false);
  const [allArtists, setAllArtists] = useState<string[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [tempSelectedArtists, setTempSelectedArtists] = useState<string[]>([]);

  const { user, isAuthenticated, accessToken, isLoading } = useAuthStore();

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

  // Mock data for queries
  const queries = [
    "What's the latest news on the music industry?",
    "Compare the monthly earnings for all the selected artists",
    "Which of the selected artists has more followers on Instagram?",
  ];

  // Chat models with API model names
  const chatModels = [
    {
      id: 1,
      name: "Deep Seek",
      apiName: "deepseek-r1-distill-llama-70b",
      active: selectedModel === "deepseek-r1-distill-llama-70b",
      color: "bg-red-500",
      icon: "/svgs/DeepSeek-Icon.svg",
      bgColor: "bg-white",
    },
    {
      id: 2,
      name: "Chat GPT",
      apiName: "gpt-4.1",
      active: selectedModel === "gpt-4.1",
      color: "bg-green-500",
      icon: "/svgs/ChatGPT-Icon.svg",
      bgColor: "bg-black",
    },
    {
      id: 3,
      name: "LLAMA",
      apiName: "llama-3.1-8b-instant",
      active: selectedModel === "llama-3.1-8b-instant",
      color: "bg-blue-500",
      icon: "/svgs/LLAMA-Icon.svg",
      bgColor: "bg-white",
    },
    {
      id: 4,
      name: "GEMINI",
      apiName: "gemini-2.0-flash-001",
      active: selectedModel === "gemini-2.0-flash-001",
      color: "bg-gray-500",
      icon: "/svgs/GEMINI-Icon.svg",
      bgColor: "bg-white",
    },
    {
      id: 5,
      name: "MIXTRAL",
      apiName: "mixtral-8x7b-32768",
      active: selectedModel === "mixtral-8x7b-32768",
      color: "bg-gray-500",
      icon: "/svgs/MIXTRAL-Icon.svg",
      bgColor: "bg-red-500",
    },
  ];

  const SocialMedia = [
    {
      id: 1,
      name: "YouTube",
      icon: "/svgs/Youtube-WhiteIcon.svg",
      bgColor: "bg-red-500",
    },
    {
      id: 2,
      name: "Spotify",
      icon: "/svgs/Spotify-WhiteIcon.svg",
      bgColor: "bg-green-500",
    },
    {
      id: 3,
      name: "SoundCloud",
      icon: "/svgs/SoundCloud-WhiteIcon.svg",
      bgColor: "bg-[#F37422]",
    },
    {
      id: 4,
      name: "Deezer",
      icon: "/svgs/Deezer-Icon.svg",
      bgColor: "bg-black",
    },
    {
      id: 5,
      name: "Apple Music",
      icon: "/svgs/AppleMusic-WhiteIcon.svg",
      bgColor: "bg-[#FB5971]",
    },
  ];
  console.log("User", user);
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
    // setIsLoading(true);

    try {
      const payload = {
        question: question,
        username: user?.username,
        model_name: selectedModel,
      };

      console.log("Sending payload:", payload);

      const response = await fetch(
        "https://backend.nalabot.com/execute_query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

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
      // setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleModelSelect = (apiName: string) => {
    setSelectedModel(apiName);
  };

  // Load selected artists from localStorage on component mount
  React.useEffect(() => {
    const savedArtists = localStorage.getItem("selectedArtists");
    if (savedArtists) {
      setSelectedArtists(JSON.parse(savedArtists));
    }
  }, []);

  // Fetch all artists from API
  const fetchAllArtists = async () => {
    setIsLoadingArtists(true);
    try {
      const response = await fetch("https://backend.nalabot.com/artists", {
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
  const handleAddSelectedArtists = () => {
    const newArtists = tempSelectedArtists.filter(
      (artist) => !selectedArtists.includes(artist)
    );
    if (newArtists.length > 0) {
      const updatedArtists = [...selectedArtists, ...newArtists];
      setSelectedArtists(updatedArtists);
      localStorage.setItem("selectedArtists", JSON.stringify(updatedArtists));
    }
    setTempSelectedArtists([]);
    setIsRosterDialogOpen(false);
  };

  // Remove artist from selected list
  const handleRemoveArtist = (artistName: string) => {
    const updatedArtists = selectedArtists.filter(
      (artist) => artist !== artistName
    );
    setSelectedArtists(updatedArtists);
    localStorage.setItem("selectedArtists", JSON.stringify(updatedArtists));
  };

  // Open roster dialog and fetch artists
  const handleOpenRosterDialog = () => {
    setIsRosterDialogOpen(true);
    setTempSelectedArtists([]); // Clear temporary selections when opening dialog
    if (allArtists.length === 0) {
      fetchAllArtists();
    }
  };

  // Right panel tools
  const rightPanelTools = [
    { icon: Volume2, label: "Audio" },
    { icon: FileText, label: "Documents" },
    { icon: Users, label: "Collaborators" },
    { icon: Settings, label: "Settings" },
    { icon: Lightbulb, label: "Ideas" },
    { icon: Zap, label: "Quick Actions" },
    { icon: Globe, label: "Web Search" },
    { icon: Plus, label: "Add Tool" },
  ];

  return (
    <div className="h-screen bg-secondary flex flex-col lg:flex-row gap-2 lg:gap-4 p-2 lg:p-4 overflow-hidden">
      {/* Left Panel - Sources, Rosters, Queries */}
      <div
        className={`${
          leftPanelOpen
            ? "w-full lg:w-60 xl:w-72 2xl:w-96 h-64 lg:h-auto"
            : "hidden lg:block lg:w-16"
        } transition-all duration-300 ease-in-out bg-background border border-border rounded-lg overflow-auto scrollbar-hide flex-shrink-0`}
      >
        <div className="h-full flex flex-col">
          {leftPanelOpen ? (
            <>
              {/* Mobile Close Button */}
              <div className="lg:hidden p-2 border-b border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftPanelOpen(false)}
                  className="h-8 w-8 ml-auto"
                >
                  ×
                </Button>
              </div>

              {/* Sources Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Sources
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLeftPanelOpen(false)}
                    className="h-8 w-8"
                  >
                    <PanelRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="w-full bg-secondary hover:bg-primary/90 text-primary-foreground border-solid border-[1px] border-[#ffffff]/50 rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  ADD SOURCE
                </Button>
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

                <div className="flex items-center justify-center space-x-2 pt-2">
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
                </div>
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
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden bg-background">
                      <div className="flex items-center justify-center flex-col relative overflow-hidden bg-background rounded-t-3xl">
                        <Image
                          src="/svgs/Bot-Lion.svg"
                          alt="Paw"
                          width={110}
                          height={100}
                          className="object-contain absolute -top-1 "
                        />
                        <Separator className="mt-15 z-50 " />
                      </div>

                      <div className="space-y-4 ">
                        {/* Search Input */}
                        <div className="relative rounded-full overflow-hidden">
                          <Input
                            placeholder="Search artists..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pr-10 bg-background border-border text-white placeholder:text-border"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Image
                              src="/svgs/Golden-Paw.svg"
                              alt="Paw"
                              width={16}
                              height={16}
                            />
                          </div>
                        </div>

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
                              disabled={tempSelectedArtists.length === 0}
                            >
                              Add To Source{" "}
                              {tempSelectedArtists.length > 0 &&
                                `(${tempSelectedArtists.length})`}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  {selectedArtists.length > 0 ? (
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

              {/* Queries Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Queries{" "}
                    <span className="text-sm text-muted-foreground">(5+)</span>
                  </h2>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-secondary border-solid border-[1px] border-[#ffffff]/50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {queries.slice(0, 2).map((query, index) => (
                    <div
                      key={index}
                      className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <span className="text-sm text-foreground">{query}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="flex-1 p-4 ">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-2 bg-[#707070]/30 rounded-lg">
                  {queries.map((query, index) => (
                    <div
                      key={index}
                      className="flex items-start  space-x-2 p-2 hover:bg-secondary/30 rounded transition-colors cursor-pointer"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-foreground">{query}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center py-4 space-y-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftPanelOpen(true)}
                className="h-10 w-10"
              >
                <PanelRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Plus className="h-4 w-4" />
              </Button>
              {sources.slice(0, 3).map((source) => (
                <Button
                  key={source.id}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                >
                  <Image
                    src={source.icon}
                    alt={source.name}
                    width={16}
                    height={16}
                    className="opacity-70"
                  />
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Panel - Chat */}
      <div className="flex-1 flex flex-col bg-background border border-border rounded-lg overflow-hidden min-w-0 w-full lg:w-auto">
        {/* Chat Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Buttons */}
              <div className="flex lg:hidden space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                  className="h-8 w-8"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  className="h-8 w-8"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              </div>
              <h1 className="text-xl font-semibold text-foreground">Chat</h1>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
        </div>

        {/* Chat Models Selection */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-center space-x-2 mb-4 flex-wrap gap-2">
            {chatModels.map((model) => (
              <div key={model.id} className="relative">
                {/* Mobile/Tablet: Icon Only */}
                <Button
                  variant={model.active ? "default" : "outline"}
                  size="icon"
                  className={`2xl:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    model.active
                      ? "bg-primary text-primary-foreground border-primary border-2 shadow-lg scale-110"
                      : `bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border hover:scale-105 ${model.bgColor}`
                  }`}
                  onClick={() => handleModelSelect(model.apiName)}
                >
                  <Image
                    src={model.icon}
                    alt={model.name}
                    width={20}
                    height={20}
                    className={model.active ? "brightness-0 invert" : ""}
                  />
                </Button>

                {/* Desktop: Full Badge */}
                <Badge
                  variant={model.active ? "default" : "secondary"}
                  className={`hidden 2xl:flex cursor-pointer transition-all rounded-full px-4 py-2 items-center justify-center gap-2 ${
                    model.active
                      ? "bg-primary text-primary-foreground border-primary border-2 shadow-lg"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105"
                  }`}
                  onClick={() => handleModelSelect(model.apiName)}
                >
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-none ${
                      model.active
                        ? "bg-white"
                        : `hover:${model.bgColor} ${model.bgColor}`
                    }`}
                  >
                    <Image
                      src={model.icon}
                      alt={model.name}
                      width={20}
                      height={20}
                      className={model.active ? "" : ""}
                    />
                  </Button>
                  {model.name}
                </Badge>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="relative">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center space-x-2 bg-secondary rounded-lg p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  type="button"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  type="text"
                  placeholder="Ask or search anything..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !inputText.trim()}
                  className="h-8 w-8 bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel - Studio/Note */}
      <div
        className={`${
          rightPanelOpen
            ? "w-full lg:w-60 xl:w-72 2xl:w-96 h-64 lg:h-auto"
            : "hidden lg:block lg:w-16"
        } transition-all duration-300 ease-in-out bg-background border border-border rounded-lg flex-shrink-0`}
      >
        <div className="h-full flex flex-col">
          {rightPanelOpen ? (
            <div className="h-full overflow-y-auto">
              {/* Mobile Close Button */}
              <div className="lg:hidden p-2 border-b border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelOpen(false)}
                  className="h-8 w-8 ml-auto"
                >
                  ×
                </Button>
              </div>

              {/* Studio Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Studio
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRightPanelOpen(false)}
                    className="h-6 w-6 hidden lg:block"
                  >
                    <PanelRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Audio Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Audio
                  </h2>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-start flex-col space-y-2 mb-3 bg-[#222c41] p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      className="bg-[#FFFFFF4D] rounded-full"
                    >
                      {/* <Volume2 className="h-4 w-4 text-blue-400" /> */}
                      <Image
                        src={"/svgs/Speaker-WhiteIcon.svg"}
                        alt="Google Drive"
                        width={16}
                        height={16}
                      />
                    </Button>
                    <span className="text-[14px] text-muted-foreground">
                      Deep Dive Conversation
                    </span>
                  </div>

                  <Button className="w-full bg-secondary hover:bg-secondary/80 text-foreground rounded-full">
                    Generate
                  </Button>
                </div>
              </div>

              {/* Video Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Video
                  </h2>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-start flex-col space-y-2 mb-3 bg-[#222c41] p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      className="bg-[#FFFFFF4D] rounded-full"
                    >
                      {/* <Volume2 className="h-4 w-4 text-blue-400" /> */}
                      <Image
                        src={"/svgs/Video-WhiteIcon.svg"}
                        alt="Google Drive"
                        width={16}
                        height={16}
                      />
                    </Button>
                    <span className="text-[14px] text-muted-foreground">
                      Deep Dive Conversation
                    </span>
                  </div>

                  <Button className="w-full bg-secondary hover:bg-secondary/80 text-foreground rounded-full">
                    Generate
                  </Button>
                </div>
              </div>

              {/* Image Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Image
                  </h2>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-start flex-col space-y-2 mb-3 bg-[#222c41] p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      className="bg-[#FFFFFF4D] rounded-full"
                    >
                      {/* <Volume2 className="h-4 w-4 text-blue-400" /> */}
                      <Image
                        src={"/svgs/Image-WhiteIcon.svg"}
                        alt="Google Drive"
                        width={16}
                        height={16}
                      />
                    </Button>
                    <span className="text-[14px] text-muted-foreground">
                      Deep Dive Conversation
                    </span>
                  </div>

                  <Button className="w-full bg-secondary hover:bg-secondary/80 text-foreground rounded-full">
                    Generate
                  </Button>
                </div>
              </div>

              {/* Notes Section */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Notes
                  </h2>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add Note Button */}
                <Button className="w-full bg-secondary hover:bg-secondary/80 text-foreground mb-4 justify-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>

                {/* Notes List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-sm text-foreground">Note 1</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-sm text-foreground">Note 1</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-sm text-foreground">Note 1</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center py-4 space-y-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightPanelOpen(true)}
                className="h-10 w-10"
              >
                <PanelRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Lightbulb className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Zap className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Globe className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

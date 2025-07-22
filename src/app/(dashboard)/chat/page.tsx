"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState(
    "deepseek-r1-distill-llama-70b"
  );

  // Mock data for sources
  const sources = [
    {
      id: 1,
      name: "Explore management...",
      type: "folder",
      icon: "/svgs/Text-Icon.svg",
    },
    {
      id: 2,
      name: "blacklionapp.xyz",
      type: "website",
      icon: "/svgs/Text-Icon.svg",
    },
    {
      id: 3,
      name: "Dropbox folder",
      type: "folder",
      icon: "/svgs/Text-Icon.svg",
    },
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
      bgColor: "bg-white",
    },
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
    setIsLoading(true);

    try {
      const payload = {
        question: question,
        username: "jainshaikh",
        model_name: selectedModel,
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

  const handleModelSelect = (apiName: string) => {
    setSelectedModel(apiName);
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
    <div className="h-screen bg-secondary flex gap-4 p-4">
      {/* Left Panel - Sources */}
      <div
        className={`${
          leftPanelOpen ? "w-80" : "w-16"
        } transition-all duration-300 ease-in-out bg-background border border-border rounded-lg`}
      >
        <div className="h-full flex flex-col">
          {leftPanelOpen ? (
            <>
              {/* Left Panel Header */}
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
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  ADD SOURCE
                </Button>
              </div>

              {/* Sources List */}
              <div className="flex-1 p-4 space-y-3">
                {sources.map((source) => (
                  <Card
                    key={source.id}
                    className="bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer border-border"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center">
                            <Image
                              src={source.icon}
                              alt={source.name}
                              width={16}
                              height={16}
                              className="opacity-70"
                            />
                          </div>
                          <span className="text-sm text-foreground font-medium">
                            {source.name}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
      <div className="flex-1 flex flex-col bg-background border border-border rounded-lg">
        {/* Chat Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
                <div className="w-full bg-secondary text-secondary-foreground rounded-lg p-4">
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
                  <ResponseRenderer
                    answerStr={message.content}
                    displayData={message.displayData}
                    dataType={message.dataType || "text"}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat Models Selection */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {chatModels.map((model) => (
              <Badge
                key={model.id}
                variant={model.active ? "default" : "secondary"}
                className={`cursor-pointer transition-all rounded-full px-4 py-2 flex items-center justify-center gap-2 ${
                  model.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={() => handleModelSelect(model.apiName)}
              >
                <Button
                  variant={"outline"}
                  size={"icon"}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-none hover:${model.bgColor} ${model.bgColor}`}
                >
                  <Image
                    src={model.icon}
                    alt={model.name}
                    width={20}
                    height={20}
                  />
                </Button>
                {model.name}
              </Badge>
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
          rightPanelOpen ? "w-80" : "w-16"
        } transition-all duration-300 ease-in-out bg-background border border-border rounded-lg`}
      >
        <div className="h-full flex flex-col">
          {rightPanelOpen ? (
            <>
              {/* Right Panel Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Studio / Note
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRightPanelOpen(false)}
                    className="h-8 w-8"
                  >
                    <PanelRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Note Content */}
              <div className="flex-1 p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Note Title"
                    className="w-full bg-transparent border-none outline-none text-lg font-semibold text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Toolbar */}
                <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-border">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="text-sm font-bold">B</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="text-sm italic">I</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="text-sm underline">U</span>
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Note Text Area */}
                <textarea
                  placeholder="Start writing your notes here..."
                  className="w-full h-64 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Right Panel Tools */}
              <div className="p-4 border-t border-border">
                <div className="grid grid-cols-2 gap-2">
                  {rightPanelTools.map((tool, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="justify-start h-10 text-muted-foreground hover:text-foreground"
                    >
                      <tool.icon className="h-4 w-4 mr-2" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </>
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

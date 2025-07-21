"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react";

const ChatPage = () => {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

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

  // Mock chat models
  const chatModels = [
    { id: 1, name: "Deep Seek", active: true, color: "bg-red-500" },
    { id: 2, name: "Chat GPT", active: false, color: "bg-green-500" },
    { id: 3, name: "LLAMA", active: false, color: "bg-blue-500" },
    { id: 4, name: "More", active: false, color: "bg-gray-500" },
  ];

  // Mock chat messages
  const messages = [
    {
      id: 1,
      type: "bot",
      content: "Hey there! How can I help you today?",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      type: "user",
      content: "what information we can get from this website",
      timestamp: "10:31 AM",
    },
    {
      id: 3,
      type: "bot",
      content:
        "Blacklionapp.xyz appears to be the website for Black Lion Innovation Group, a music company focused on discovering and promoting new talent. They seem to offer a platform for artists to showcase their work and connect with a wider audience.",
      timestamp: "10:32 AM",
    },
  ];

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
              {!leftPanelOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftPanelOpen(true)}
                  className="h-8 w-8"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              )}
              <h1 className="text-xl font-semibold text-foreground">Chat</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Image
                  src="/svgs/Bot-Lion.svg"
                  alt="Bot Lion"
                  width={24}
                  height={24}
                />
              </div>

              {!rightPanelOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelOpen(true)}
                  className="h-8 w-8"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Badge
              variant="secondary"
              className="bg-secondary text-secondary-foreground"
            >
              Auto Pilot
            </Badge>
            <Badge
              variant="secondary"
              className="bg-secondary text-secondary-foreground"
            >
              Console
            </Badge>
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
              <div
                className={`max-w-[70%] ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                } rounded-lg p-4`}
              >
                {message.type === "bot" && (
                  <div className="flex items-center space-x-2 mb-2">
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
                )}
                <p className="text-sm">{message.content}</p>
                {message.type === "user" && (
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-primary-foreground/70">
                      {message.timestamp}
                    </span>
                  </div>
                )}
              </div>
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
                className={`cursor-pointer transition-all ${
                  model.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${model.color} mr-2`}
                ></div>
                {model.name}
              </Badge>
            ))}
          </div>

          {/* Chat Input */}
          <div className="relative">
            <div className="flex items-center space-x-2 bg-secondary rounded-lg p-3">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="text"
                placeholder="Ask or search anything..."
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
              />
              <Button
                size="icon"
                className="h-8 w-8 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
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

"use client";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const page = () => {
  const notifications = [
    {
      id: 1,
      user: "Ashwin Bose",
      action: "is requesting access to",
      target: "Design File - Final Project",
      time: "11h",
      type: "access_request",
    },
    {
      id: 2,
      user: "Patrick",
      action: "added a comment on",
      target: "Design Assets - Smart Tags file:",
      description: "Looks perfect, send it for technical review tomorrow!",
      time: "16h",
      type: "comment",
    },
    {
      id: 3,
      user: "New Feature Alert!",
      action: "",
      target: "",
      description:
        "We're pleased to introduce the latest enhancements in our templating experience.",
      time: "16h",
      type: "feature_alert",
    },
    {
      id: 4,
      user: "Samantha",
      action: "shared a file with you",
      target: "",
      description: "Demo File.pdf",
      time: "11h",
      type: "file_share",
      fileSize: "2.2 MB",
    },
    {
      id: 5,
      user: "Steve and 8 others",
      action: "added comments on",
      target: "Design Assets - Smart Tags file",
      time: "14h",
      type: "comment",
    },
  ];

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8">
      {/* Bot Lion Header - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex items-center justify-center flex-col relative overflow-hidden bg-background rounded-t-3xl">
        <Image
          src="/svgs/Bot-Lion.svg"
          alt="Bot Lion"
          width={110}
          height={100}
          className="object-contain absolute -top-1"
        />
        <Separator className="mt-15 z-50" />
      </div>

      <div className="w-full p-4 sm:p-6 lg:p-8 bg-background rounded-3xl lg:rounded-t-none lg:rounded-b-3xl min-h-[80vh]">
        <div className="">
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              Notifications
            </h1>
            <Button
              variant="link"
              className="text-primary hover:text-primary/80 p-0 h-auto text-sm sm:text-base self-start sm:self-auto"
            >
              Mark all as read
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-[#222C41] rounded-lg p-4 sm:p-6 transition-all duration-200 hover:bg-[#2A3441] border border-border/20"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Avatar */}
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm font-medium">
                      {notification.type === "feature_alert"
                        ? "!"
                        : notification.user.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Main Content and Time/Menu Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm sm:text-base leading-relaxed">
                          <span className="font-medium">
                            {notification.user}
                          </span>
                          {notification.action && (
                            <>
                              <span className="text-muted-foreground">
                                {" "}
                                {notification.action}{" "}
                              </span>
                              {notification.target && (
                                <span className="font-medium">
                                  {notification.target}
                                </span>
                              )}
                            </>
                          )}
                        </p>

                        {notification.description && (
                          <div className="mt-2">
                            {notification.type === "file_share" ? (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground text-sm">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 flex-shrink-0" />
                                  <span className="break-all">
                                    {notification.description}
                                  </span>
                                </div>
                                {notification.fileSize && (
                                  <span className="text-xs text-muted-foreground/70">
                                    ({notification.fileSize})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-sm italic break-words">
                                "{notification.description}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Time and Menu - Mobile: Stacked, Desktop: Horizontal */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ml-2 sm:ml-4 flex-shrink-0">
                        <span className="text-muted-foreground text-xs whitespace-nowrap text-right sm:text-left">
                          {notification.time}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 sm:w-8 sm:h-8 p-0 text-muted-foreground hover:text-foreground self-end sm:self-auto"
                            >
                              <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-secondary border-border"
                          >
                            <DropdownMenuItem className="text-foreground hover:bg-accent text-sm">
                              Mark as read
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-foreground hover:bg-accent text-sm">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

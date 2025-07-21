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
    <div className="min-h-screen text-white p-8">
      <div className="flex items-center justify-center flex-col relative overflow-hidden bg-background rounded-t-3xl">
        <Image
          src="/svgs/Bot-Lion.svg"
          alt="Paw"
          width={110}
          height={100}
          className="object-contain absolute -top-1"
        />
        <Separator className="mt-15 z-50" />
      </div>

      <div className="w-full p-8 bg-background rounded-b-3xl min-h-[80vh]">
        <div className="flex items-center justify-between p-4 rounded-lg bg-[#222C41] w-3/4 h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 w-full">
            <h1 className="text-2xl font-bold text-foreground">
              Notifications
            </h1>
            <Button
              variant="link"
              className="text-primary hover:text-primary/80 p-0 h-auto text-sm"
            >
              Mark all as read
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4 w-full">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-4 p-4 rounded transition-colors border-b border-border/50 w-full"
              >
                {/* Avatar */}
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {notification.type === "feature_alert"
                      ? "!"
                      : notification.user.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-foreground text-sm leading-relaxed">
                        <span className="font-medium">{notification.user}</span>
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
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <FileText className="w-4 h-4" />
                              <span>{notification.description}</span>
                              {notification.fileSize && (
                                <span className="text-xs">
                                  ({notification.fileSize})
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm italic">
                              "{notification.description}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Time and Menu */}
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {notification.time}
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-secondary border-border"
                        >
                          <DropdownMenuItem className="text-foreground hover:bg-accent">
                            Mark as read
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-foreground hover:bg-accent">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

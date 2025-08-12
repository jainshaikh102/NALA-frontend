"use client";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Check,
  X,
  Send,
  Download,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProfilePage = () => {
  const [showFeatures, setShowFeatures] = useState(false);

  const [isXL, setIsXL] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1280px)");
    const onChange = (e: MediaQueryListEvent) => setIsXL(e.matches);

    // Set initial value
    setIsXL(mql.matches);

    // Subscribe to changes
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const subscriptionInvoices = [
    {
      id: "001092",
      type: "Starter",
      amount: "$200",
      createdDate: "20-12-2024",
      expiringDate: "21-01-2025",
    },
    {
      id: "001092",
      type: "Starter",
      amount: "$200",
      createdDate: "20-12-2024",
      expiringDate: "21-01-2025",
    },
    {
      id: "001092",
      type: "Starter",
      amount: "$200",
      createdDate: "20-12-2024",
      expiringDate: "21-01-2025",
    },
    {
      id: "001092",
      type: "Starter",
      amount: "$200",
      createdDate: "20-12-2024",
      expiringDate: "21-01-2025",
    },
    {
      id: "001092",
      type: "Starter",
      amount: "$200",
      createdDate: "20-12-2024",
      expiringDate: "21-01-2025",
    },
  ];

  const freePlanFeatures = [
    "5 daily chat conversations",
    "Basic music analysis",
    "Standard audio quality",
    "Community support",
    "Basic virality insights",
  ];

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
        <div className="flex gap-8">
          <div className="bg-[#222C41] rounded-lg p-4 sm:p-6 lg:p-8 flex-1">
            <div className="flex flex-col space-y-6 sm:space-y-8 w-full">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start w-full gap-4 sm:gap-6">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                    Alexa Rawles
                  </h1>
                  <p className="text-sm sm:text-base font-light text-muted-foreground">
                    alexarawles@gmail.com
                  </p>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="flex gap-4">
                <div className="w-full xl:w-3/4 order-2 xl:order-1">
                  <Tabs
                    defaultValue="general"
                    onValueChange={(value) => {
                      if (value === "general") {
                        setShowFeatures(false);
                      }
                    }}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="general" className="flex-1">
                        General
                      </TabsTrigger>
                      <TabsTrigger value="connectors" className="flex-1">
                        Connectors
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="flex-1">
                        Notifications
                      </TabsTrigger>
                      <TabsTrigger value="subscription" className="flex-1">
                        Subscription
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                      <div className="space-y-6 sm:space-y-8 w-full flex flex-col pt-6 sm:pt-8">
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base">
                            Full Name
                          </Label>
                          <Input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-background text-sm sm:text-base"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base">
                            Email Address
                          </Label>
                          <Input
                            type="text"
                            placeholder="Email Address"
                            className="w-full bg-background text-sm sm:text-base"
                          />
                        </div>

                        <div>
                          <Button
                            variant="secondary"
                            size="lg"
                            className="bg-muted hover:bg-muted/05 text-primary w-full sm:w-auto"
                          >
                            Reset Password
                          </Button>
                        </div>

                        <div className="space-y-2 flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <p className="font-normal text-[16px]">
                              Connectors
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button variant={"default"}>
                              Enabled Connectors
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="connectors">
                      <div className="space-y-6 sm:space-y-8 w-full flex flex-col pt-6 sm:pt-8">
                        {/* {Header} */}
                        <div className="space-y-2">
                          <h4 className="text-sm sm:text-base font-bold">
                            Enabled Connectors
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            NALA can access information from your connected
                            apps.
                          </p>
                        </div>

                        {/* {Connectors Section} */}
                        <div className="space-y-6 sm:space-y-8">
                          {/* {Microsoft One Drive Connector} */}
                          <div className="space-y-2 flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <Image
                                src="/svgs/MicrosoftOneDriveIcon.svg"
                                alt="Google Drive"
                                width={34}
                                height={31}
                              />
                              <p>Microsoft One Drive</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center bg-[#293650] rounded-lg px-2 py-2 gap-16">
                                <p className="font-normal text-[12px]">
                                  mywork@xyz.com
                                </p>
                                <p className="font-normal text-[12px]">
                                  Connected since: Jul 25, 2025
                                </p>
                              </div>
                              <Button variant={"default"}>Connect</Button>
                            </div>
                          </div>

                          {/* {Google Drive Connector} */}
                          <div className="space-y-2 flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <Image
                                src="/svgs/GoogleDriveIcon.svg"
                                alt="Google Drive"
                                width={34}
                                height={31}
                              />
                              <p>Google Drive</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center bg-[#293650] rounded-lg px-2 py-2 gap-16">
                                <p className="font-normal text-[12px]">
                                  mywork@xyz.com
                                </p>
                                <p className="font-normal text-[12px]">
                                  Connected since: Jul 25, 2025
                                </p>
                              </div>
                              <Button variant={"default"}>Connect</Button>
                            </div>
                          </div>

                          {/* {Dropbox Connector} */}
                          <div className="space-y-2 flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <Image
                                src="/svgs/DropBoxIcon.svg"
                                alt="Google Drive"
                                width={34}
                                height={31}
                              />
                              <p>Dropbox</p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center bg-[#293650] rounded-lg px-2 py-2 gap-16">
                                <p className="font-normal text-[12px]">
                                  mywork@xyz.com
                                </p>
                                <p className="font-normal text-[12px]">
                                  Connected since: Jul 25, 2025
                                </p>
                              </div>
                              <Button variant={"default"}>Connect</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="notifications">
                      <div className="w-full p-4 sm:p-6 lg:p-8 bg-transparent rounded-3xl lg:rounded-t-none lg:rounded-b-3xl min-h-[80vh]">
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
                                            {notification.type ===
                                            "file_share" ? (
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
                                                {notification.description}
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
                    </TabsContent>
                    <TabsContent value="subscription">
                      <div className="pt-6 sm:pt-8 space-y-6 sm:space-y-8">
                        {/* Subscription Card */}
                        <Card className="bg-secondary border-border relative overflow-hidden">
                          <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
                            {/* Free Trial Badge */}
                            <div>
                              <h4 className="text-primary text-sm sm:text-base font-medium">
                                FREE TRIAL
                              </h4>
                            </div>

                            {/* Price and plan info */}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-2xl sm:text-4xl font-bold text-foreground">
                                  $
                                </span>
                                <span className="text-4xl sm:text-6xl font-bold text-foreground">
                                  0
                                </span>
                                <span className="text-sm sm:text-lg text-muted-foreground">
                                  /month
                                </span>
                              </div>
                              {/* Paper plane icon */}
                              <div>
                                <Send className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <p className="text-muted-foreground text-sm order-2 sm:order-1">
                                Current Plan
                              </p>
                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2">
                                <Button
                                  variant="link"
                                  className="border-border text-primary hover:bg-accent w-full sm:w-auto"
                                  onClick={() => setShowFeatures(!showFeatures)}
                                >
                                  View Features
                                </Button>
                                <Button
                                  variant="outline"
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                                >
                                  Upgrade Account
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Subscription Invoices */}
                        <div className="space-y-4">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">
                            Subscription Invoices
                          </h3>

                          {/* Mobile Cards View (lg and below) */}
                          <div className="block lg:hidden space-y-3">
                            {subscriptionInvoices.map((invoice, index) => (
                              <Card
                                key={index}
                                className="bg-secondary border-border"
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-xs text-primary font-medium">
                                          INVOICE
                                        </p>
                                        <p className="text-foreground font-medium">
                                          {invoice.id}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-primary font-medium">
                                          TYPE
                                        </p>
                                        <p className="text-foreground">
                                          {invoice.type}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-xs text-primary font-medium">
                                          AMOUNT
                                        </p>
                                        <p className="text-foreground font-medium">
                                          {invoice.amount}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-primary font-medium">
                                          ACTION
                                        </p>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="w-8 h-8 p-0 bg-primary hover:bg-primary/90 rounded-full mt-1"
                                        >
                                          <Download className="w-4 h-4 text-white" />
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                                      <div>
                                        <p className="text-xs text-primary font-medium">
                                          CREATED DATE
                                        </p>
                                        <p className="text-foreground text-sm">
                                          {invoice.createdDate}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-primary font-medium">
                                          EXPIRING DATE
                                        </p>
                                        <p className="text-foreground text-sm">
                                          {invoice.expiringDate}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {/* Desktop Table View (lg and above) */}
                          <div className="hidden lg:block">
                            <Card className="bg-secondary border-border">
                              <CardContent className="p-0">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-border hover:bg-transparent">
                                      <TableHead className="text-primary text-xs font-medium">
                                        INVOICE
                                      </TableHead>
                                      <TableHead className="text-primary text-xs font-medium">
                                        TYPE
                                      </TableHead>
                                      <TableHead className="text-primary text-xs font-medium">
                                        AMOUNT
                                      </TableHead>
                                      <TableHead className="text-primary text-xs font-medium">
                                        CREATED DATE
                                      </TableHead>
                                      <TableHead className="text-primary text-xs font-medium">
                                        EXPIRING DATE
                                      </TableHead>
                                      <TableHead className="text-primary text-xs font-medium">
                                        ACTION
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {subscriptionInvoices.map(
                                      (invoice, index) => (
                                        <TableRow
                                          key={index}
                                          className="border-border hover:bg-accent/50"
                                        >
                                          <TableCell className="text-foreground font-medium">
                                            {invoice.id}
                                          </TableCell>
                                          <TableCell className="text-foreground">
                                            {invoice.type}
                                          </TableCell>
                                          <TableCell className="text-foreground">
                                            {invoice.amount}
                                          </TableCell>
                                          <TableCell className="text-foreground">
                                            {invoice.createdDate}
                                          </TableCell>
                                          <TableCell className="text-foreground">
                                            {invoice.expiringDate}
                                          </TableCell>
                                          <TableCell>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="w-8 h-8 p-0 bg-primary hover:bg-primary/90 rounded-full"
                                            >
                                              <Download className="w-4 h-4 text-white" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {showFeatures && (
                  <div className="hidden xl:block xl:w-1/4 xl:order-2">
                    <Card className="bg-background border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-primary text-sm font-medium">
                            FREE PLAN FEATURES INCLUDE
                          </h3>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-6 h-6 p-0 text-muted-foreground hover:text-foreground rounded-full border-[1px] border-solid border-primary"
                            onClick={() => setShowFeatures(false)}
                          >
                            <X className="w-4 h-4 text-primary" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {freePlanFeatures.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-foreground text-sm">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Dialog for Features */}
          {!isXL && (
            <Dialog open={showFeatures} onOpenChange={setShowFeatures}>
              <DialogContent className="w-full max-w-full">
                <DialogHeader>
                  <DialogTitle className="text-primary text-sm font-medium">
                    FREE PLAN FEATURES INCLUDE
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {freePlanFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-foreground text-sm">{feature}</span>

                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

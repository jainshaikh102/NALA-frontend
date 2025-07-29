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
import { Check, Send, Download } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProfilePage = () => {
  const [showFeatures, setShowFeatures] = useState(false);

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
              <div className="w-full">
                <Tabs
                  className="w-full"
                  defaultValue="general"
                  onValueChange={(value) => {
                    if (value === "general") {
                      setShowFeatures(false);
                    }
                  }}
                >
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger
                      value="general"
                      className="flex-1 sm:flex-none"
                    >
                      General
                    </TabsTrigger>
                    <TabsTrigger
                      value="subscription"
                      className="flex-1 sm:flex-none"
                    >
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
                          className="bg-[#4182F9]/10 hover:bg-[#4182F9]/05 text-[#4182F9] w-full sm:w-auto"
                        >
                          Reset Password
                        </Button>
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
            </div>
          </div>

          {/* Dialog for Features - Shows on all screen sizes, centered properly */}
          <Dialog open={showFeatures} onOpenChange={setShowFeatures}>
            <DialogContent className="sm:max-w-md lg:max-w-lg">
              <DialogHeader>
                {/* <DialogTitle className="text-primary text-sm font-medium">
                  FREE PLAN FEATURES INCLUDE
                </DialogTitle> */}
              </DialogHeader>
              <div className="space-y-4 py-4">
                <h1 className="text-primary text-sm font-medium mb-4">
                  FREE PLAN FEATURES INCLUDE
                </h1>
                {freePlanFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                      {/* <Check className="w-3 h-3 text-white" /> */}

                      <Image
                        alt="Check Icon"
                        src={"/svgs/CheckCircle-PrimaryIcon.svg"}
                        width={20}
                        height={20}
                      />
                    </div>
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

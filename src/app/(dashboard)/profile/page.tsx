"use client";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Send, Download } from "lucide-react";
import { useState } from "react";

const page = () => {
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
    <div className="min-h-screen text-white p-8 ">
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
      <div className="w-full p-8 bg-background rounded-b-3xl min-h-[80vh] flex flex-row gap-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-[#222C41] w-3/4 h-full">
          <div className="flex items-center gap-1 flex-col space-y-8 w-full">
            {/* {Container Header} */}
            <div className="flex items-center w-full gap-4">
              <Avatar className="h-24	w-24">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-xl font-bold">Alexa Rawles</h1>
                <p className="text-base font-light text-muted-foreground">
                  alexarawles@gmail.com
                </p>
              </div>
            </div>
            {/* {Container Tab} */}
            <div className="flex items-center gap-4 w-full">
              <Tabs
                className="w-full h-full"
                defaultValue="ganeral"
                onValueChange={(value) => {
                  if (value === "ganeral") {
                    setShowFeatures(false);
                  }
                }}
              >
                <TabsList>
                  <TabsTrigger value="ganeral">Ganeral</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                </TabsList>
                <TabsContent value="ganeral">
                  <div className="space-y-8 w-full flex flex-col pt-8">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        type="text"
                        placeholder="Full Name"
                        className="w-full bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="text"
                        placeholder="Email Address"
                        className="w-full bg-background"
                      />
                    </div>

                    <div>
                      <Button
                        variant={"secondary"}
                        size={"lg"}
                        className="bg-[#4182F9]/10 hover:bg-[#4182F9]/05 text-[#4182F9]"
                      >
                        Reset Password
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="subscription">
                  <div className="flex gap-8 pt-8">
                    {/* Left side - Subscription content */}
                    <div className="flex-1 space-y-8">
                      {/* Subscription Card */}
                      <Card className="bg-secondary border-border relative overflow-hidden">
                        <CardContent className="space-y-8">
                          {/* Free Trial Badge */}
                          <div className="">
                            <h4 className="text-primary text-base	font-medium">
                              FREE TRIAL
                            </h4>
                          </div>

                          {/* Price and plan info */}
                          <div className="flex items-center justify-between">
                            <div className="">
                              <span className="text-4xl font-bold text-foreground">
                                $
                              </span>
                              <span className="text-6xl font-bold text-foreground">
                                0
                              </span>
                              <span className="text-lg text-muted-foreground">
                                /month
                              </span>
                            </div>
                            {/* Paper plane icon */}
                            <div className="">
                              <Send className="w-16 h-16 text-white" />
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center justify-between">
                            <p className="text-muted-foreground text-sm">
                              Current Plan
                            </p>
                            <div className="flex gap-4">
                              <Button
                                variant="link"
                                className="border-border text-primary hover:bg-accent"
                                onClick={() => setShowFeatures(!showFeatures)}
                              >
                                View Features
                              </Button>
                              <Button
                                variant="outline"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                Upgrade Account
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Subscription Invoices */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          Subscription Invoices
                        </h3>
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
                                {subscriptionInvoices.map((invoice, index) => (
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
                                        className="w-8 h-8 p-0 text-destructive hover:text-destructive bg-primary hover:bg-primary/90 rounded-full"
                                      >
                                        <Download className="w-4 h-4 text-white" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
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
        {/* Right side - Features panel */}
        {showFeatures && (
          <div className="w-1/4">
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
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;

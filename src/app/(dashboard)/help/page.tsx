"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HelpPage() {
  const [helpText, setHelpText] = useState("");

  const handleSubmit = () => {
    // Handle form submission
    console.log("Help request submitted:", helpText);
  };

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
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold text-foreground">Need Help</h1>
          </div>

          <div className="flex items-center justify-center">
            <Image
              src="/svgs/Bot-Lion.svg"
              alt="Help Character"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>

          <div className="text-center ">
            <h2 className="text-xl text-foreground">How can we help?</h2>
          </div>

          <div className="w-full space-y-2">
            {/* Form Label */}
            <div>
              <Label className="text-primary text-sm font-medium">
                Tell Us How We Can Help
              </Label>
            </div>

            {/* Text Area */}
            <div>
              <Textarea
                placeholder="Tell us what went wrong..."
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                className="min-h-[200px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 w-full items-end">
              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-2 rounded-lg text-base font-medium"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

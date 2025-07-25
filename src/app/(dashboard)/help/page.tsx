"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function HelpPage() {
  const [helpText, setHelpText] = useState("");

  const handleSubmit = () => {
    // Handle form submission
    console.log("Help request submitted:", helpText);
  };

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
          <div className="bg-[#222C41] rounded-lg p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                Need Help
              </h1>
            </div>

            {/* Bot Lion Image - Responsive sizing */}
            <div className="flex items-center justify-center py-4 sm:py-6">
              <Image
                src="/svgs/Bot-Lion.svg"
                alt="Help Character"
                width={200}
                height={200}
                className="object-contain w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
              />
            </div>

            {/* Subtitle */}
            <div className="text-center">
              <h2 className="text-lg sm:text-xl lg:text-2xl text-foreground font-medium">
                How can we help?
              </h2>
            </div>

            {/* Help Form */}
            <div className="space-y-4 sm:space-y-6">
              {/* Form Label */}
              <div>
                <Label className="text-primary text-sm sm:text-base font-medium">
                  Tell Us How We Can Help
                </Label>
              </div>

              {/* Text Area */}
              <div>
                <Textarea
                  placeholder="Tell us what went wrong..."
                  value={helpText}
                  onChange={(e) => setHelpText(e.target.value)}
                  className="min-h-[150px] sm:min-h-[200px] lg:min-h-[250px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none text-sm sm:text-base"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center sm:justify-end pt-4 sm:pt-6">
                <Button
                  onClick={handleSubmit}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-12 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium w-full sm:w-auto"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircleMore, MoreHorizontal } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

export default function DashboardPage() {
  const chats = [
    { id: 1, title: "Daily Chat", date: "04 Jan 2025" },
    { id: 2, title: "Daily Chat", date: "04 Jan 2025" },
    { id: 3, title: "Daily Chat", date: "04 Jan 2025" },
    { id: 4, title: "Daily Chat", date: "01 Jan 2025" },
  ];
  const router = useRouter();

  // Get user data from Zustand store
  const { user, isAuthenticated, accessToken, isLoading } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#222C41] text-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-[#FFFFFF3B]">
      <div className="w-full mx-auto p-4 sm:p-8 lg:p-16">
        {/* Header Section */}

        {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-8 lg:gap-0 bg-transparent border-b-[1px] border-b-[#FFFFFF4D] h-[460px] relative">
          <div className="flex flex-col w-full lg:w-7/12 h-full space-y-4">
            <div>
              <div className="flex items-center justify-start gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center">
                  <Image
                    src="/svgs/Golden-Paw.svg"
                    alt="Paw"
                    width={68}
                    height={68}
                    className="w-full h-full"
                  />
                </div>
                <h1 className="text-[48px] font-bold italic">NALA</h1>
              </div>
              <p className="text-[40px] text-[#FFFFFF]">
                Your AI-powered music assistant.🎧
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:mb-8 mt-12">
              <Button
                variant="default"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full w-full sm:w-60"
                onClick={() => router.push("/chat")}
              >
                START NEW CHAT
              </Button>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-6 lg:mb-8 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 rounded-full"
                >
                  Explore Valuation Engine
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 rounded-full"
                >
                  Join Our App
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 rounded-full"
                >
                  Get Weekly Score for your Catalog
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex lg:w-5/12 h-full relative ">
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/svgs/Bot-Lion.svg"
                alt="NALA Bot Lion"
                width={550}
                height={500}
                className="object-contain max-w-full h-auto"
              />
            </div>
          </div>
        </div> */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-8 lg:gap-0 bg-transparent border-b border-b-[#FFFFFF4D] min-h-[300px] lg:min-h-[460px] relative py-8">
          {/* Left Content */}
          <div className="flex flex-col w-full lg:w-7/12 h-full space-y-4">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-start gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center">
                  <Image
                    src="/svgs/Golden-Paw.svg"
                    alt="Paw"
                    width={68}
                    height={68}
                    className="w-full h-full"
                  />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold italic">
                  NALA
                </h1>
              </div>
              <p className="text-xl sm:text-2xl lg:text-4xl text-[#FFFFFF]">
                Your AI-powered music assistant.🎧
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 lg:mb-8 mt-8 sm:mt-12">
              <Button
                variant="default"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full w-full sm:w-60"
                onClick={() => router.push("/chat")}
              >
                START NEW CHAT
              </Button>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-6 lg:mb-8 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 rounded-full"
                >
                  Explore Valuation Engine
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 rounded-full"
                >
                  Join Our App
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 rounded-full"
                >
                  Get Weekly Score for your Catalog
                </Button>
              </div>
            </div>
          </div>

          {/* Right Content with Lion and Divider */}
          <div className="hidden lg:flex lg:w-5/12 h-full relative">
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/svgs/Bot-Lion.svg"
                alt="NALA Bot Lion"
                width={550}
                height={500}
                className="object-contain max-w-full h-auto"
              />
            </div>

            {/* Divider line at bottom */}
            {/* <div className="absolute bottom-0 left-0 right-0 border-t-4 border-black"></div> */}
          </div>
        </div>

        {/* My Chats Section */}
        <div className="mt-8 lg:mt-12">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
            My Chats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {chats.map((chat) => (
              <Card
                key={chat.id}
                className="bg-secondary transition-all duration-200 cursor-pointer hover:scale-105 overflow-hidden"
              >
                <CardContent className="p-4 sm:p-6 bg-background h-full mx-2 sm:mx-4 rounded-xl flex flex-col justify-between min-h-[140px] sm:min-h-[160px]">
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white p-1 h-auto w-auto"
                      >
                        <Image
                          src={"/svgs/Text-Icon.svg"}
                          alt={"textIcon"}
                          width={16}
                          height={16}
                          className={"opacity-70 sm:w-5 sm:h-5"}
                        />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg sm:text-xl mb-1">
                        {chat.title}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {chat.date}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center ml-2 sm:ml-4">
                      <Image
                        src="/svgs/Golden-Paw.svg"
                        alt="Paw"
                        width={60}
                        height={60}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

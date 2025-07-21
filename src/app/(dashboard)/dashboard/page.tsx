import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircleMore, MoreHorizontal } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const chats = [
    { id: 1, title: "Daily Chat", date: "04 Jan 2025" },
    { id: 2, title: "Daily Chat", date: "04 Jan 2025" },
    { id: 3, title: "Daily Chat", date: "04 Jan 2025" },
    { id: 4, title: "Daily Chat", date: "01 Jan 2025" },
  ];

  return (
    <div className="min-h-screen bg-[#222C41] text-white p-8">
      <div className="w-full mx-auto p-16">
        {/* Header Section */}
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col w-2/4">
            <div className="flex items-center justify-start gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image
                  src="/svgs/Golden-Paw.svg"
                  alt="Paw"
                  width={68}
                  height={68}
                  className="text-white"
                />
              </div>
              <h1 className="text-5xl font-bold">NALA</h1>
            </div>

            <p className="text-4xl text-gray-300 mb-8 flex items-center gap-2 ">
              Your AI-powered music assistant. 🎧
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap flex-col gap-4 mb-8">
              <Button
                variant={"default"}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full w-60"
              >
                START NEW CHAT
              </Button>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  variant="outline"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 px-6 py-3 rounded-full"
                >
                  Explore Valuation Engine
                </Button>
                <Button
                  variant="outline"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 px-6 py-3 rounded-full"
                >
                  Join Our App
                </Button>
                <Button
                  variant="outline"
                  className="bg-secondary border-gray-500 text-gray-300 hover:bg-gray-700 px-6 py-3 rounded-full"
                >
                  Get Weekly Score for your Catalog
                </Button>
              </div>
            </div>

            <Separator className="my-4" orientation="horizontal" />
          </div>

          <div className="flex-shrink-0 ml-8 w-2/4">
            <div className="w-1/2 h-auto flex items-center justify-center">
              <Image
                src="/svgs/Bot-Lion.svg"
                alt="NALA Bot Lion"
                width={498}
                height={509}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6">My Chats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {chats.map((chat) => (
              <Card
                key={chat.id}
                className="bg-secondary transition-colors cursor-pointer w-[304px] h-[217px] overflow-hidden"
              >
                <CardContent className="p-6 bg-background h-full mx-4 rounded-xl flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-3 h-3 bg-secondary p-4 rounded-full flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white p-1 h-auto"
                      >
                        <Image
                          src={"/svgs/Text-Icon.svg"}
                          alt={"textIcon"}
                          width={20}
                          height={20}
                          className={"opacity-70"}
                        />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-xl mb-1">
                        {chat.title}
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        {chat.date}
                      </p>
                    </div>
                    <div className="w-14 h-14 flex items-center justify-center ml-4">
                      <Image
                        src="/svgs/Golden-Paw.svg"
                        alt="Paw"
                        width={60}
                        height={60}
                        className=""
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

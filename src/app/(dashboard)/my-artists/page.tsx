import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  Share2,
  Trash2,
  Mail,
  MessageSquareMore,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export default function MyArtistsPage() {
  const artists = [
    {
      id: 1,
      name: "Kanye West",
      avatar: "/api/placeholder/32/32",
      country: "American",
      countryFlag: "🇺🇸",
      email: "verified",
      revenueEstimate: { master: "M", publishing: "P" },
    },
    {
      id: 2,
      name: "Kanye West",
      avatar: "/api/placeholder/32/32",
      country: "American",
      countryFlag: "🇺🇸",
      email: "pending",
      revenueEstimate: { master: "", publishing: "P" },
    },
    {
      id: 3,
      name: "Kanye West",
      avatar: "/api/placeholder/32/32",
      country: "American",
      countryFlag: "🇺🇸",
      email: "pending",
      revenueEstimate: { master: "", publishing: "P" },
    },
    {
      id: 4,
      name: "Kanye West",
      avatar: "/api/placeholder/32/32",
      country: "American",
      countryFlag: "🇺🇸",
      email: "pending",
      revenueEstimate: { master: "", publishing: "P" },
    },
    {
      id: 5,
      name: "Kanye West",
      avatar: "/api/placeholder/32/32",
      country: "American",
      countryFlag: "🇺🇸",
      email: "pending",
      revenueEstimate: { master: "", publishing: "P" },
    },
    {
      id: 6,
      name: "Kanye West",
      avatar: "/api/placeholder/32/32",
      country: "American",
      countryFlag: "🇺🇸",
      email: "pending",
      revenueEstimate: { master: "", publishing: "P" },
    },
    {
      id: 7,
      name: "Kanye West",
      avatar: "/api/placeholder/32/32",
      country: "American",
      countryFlag: "🇺🇸",
      email: "pending",
      revenueEstimate: { master: "", publishing: "P" },
    },
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
      <div className="w-full p-16 bg-background rounded-b-3xl">
        {/* Header */}

        <div className="flex items-center justify-between p-4 rounded-lg">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold">My Artists</h1>
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/svgs/UserMusic-Icon.svg"
                alt="Paw"
                width={20}
                height={20}
                className=""
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full">
              ADD ARTIST
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-500 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-full"
                >
                  SORT BY
                  <ChevronDown className="w-4 h-4 ml-2 text-primary font-bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  Country
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  Revenue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#222C41] border-none rounded-2xl overflow-hidden">
                <TableHead className="text-gray-300 font-medium py-4 px-6">
                  ARTIST NAME
                </TableHead>
                <TableHead className="text-gray-300 font-medium py-4 px-6">
                  COUNTRY
                </TableHead>
                <TableHead className="text-gray-300 font-medium py-4 px-6">
                  EMAIL
                </TableHead>
                <TableHead className="text-gray-300 font-medium py-4 px-6">
                  LTM REVENUE ESTIMATE
                  <br />
                  <span className="text-xs text-gray-400">
                    MASTER | PUBLISHING
                  </span>
                </TableHead>
                <TableHead className="text-gray-300 font-medium py-4 px-6">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.map((artist) => (
                <TableRow
                  key={artist.id}
                  className=" hover:bg-[#404F61] transition-colors border-none"
                >
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                        <Users className="w-4 h-4 text-gray-300" />
                      </div>
                      <span className="text-white font-medium">
                        {artist.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{artist.countryFlag}</span>
                      <span className="text-gray-300">{artist.country}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center">
                      <Button
                        size={"icon"}
                        variant={"outline"}
                        className="rounded-full"
                      >
                        <Mail className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white font-bold">
                        M
                      </div>

                      <span className="font-extralight text-border">|</span>

                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ffffff] text-primary font-bold">
                        P
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        size={"icon"}
                        variant={"outline"}
                        className="rounded-full bg-white"
                      >
                        <Eye className="w-4 h-4 text-primary" />
                      </Button>

                      <Button
                        size={"icon"}
                        variant={"outline"}
                        className="rounded-full bg-white"
                      >
                        <MessageSquareMore className="w-4 h-4 text-primary" />
                      </Button>

                      <Button
                        size={"icon"}
                        variant={"outline"}
                        className="rounded-full bg-primary"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-gray-400 text-sm">
            ROWS PER PAGE: <span className="text-white">10</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">1-5 OF 13</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

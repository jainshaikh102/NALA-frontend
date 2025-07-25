import Image from "next/image";
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

      <div className="w-full p-4 sm:p-8 lg:p-16 bg-background rounded-3xl lg:rounded-t-none lg:rounded-b-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-2 sm:p-4 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
              My Artists
            </h1>
            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
              <Image
                src="/svgs/UserMusic-Icon.svg"
                alt="User Music Icon"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base">
              ADD ARTIST
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-500 text-gray-300 hover:bg-gray-700 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base"
                >
                  SORT BY
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-primary font-bold" />
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

        {/* Mobile Cards View (sm and below) */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {artists.map((artist) => (
              <Card
                key={artist.id}
                className="bg-[#222C41] border-none hover:bg-[#404F61] transition-all duration-200"
              >
                <CardContent className="p-4 sm:p-6">
                  {/* Artist Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm sm:text-base">
                        {artist.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base sm:text-lg">
                          {artist.countryFlag}
                        </span>
                        <span className="text-gray-300 text-xs sm:text-sm">
                          {artist.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Estimate */}
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs sm:text-sm mb-2">
                      LTM REVENUE ESTIMATE
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-primary text-white font-bold text-xs sm:text-sm">
                        M
                      </div>
                      <span className="font-extralight text-border">|</span>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white text-primary font-bold text-xs sm:text-sm">
                        P
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full p-2"
                    >
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full bg-white p-2"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full bg-white p-2"
                      >
                        <MessageSquareMore className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full bg-primary p-2"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Desktop Table View (lg and above) */}
        <div className="hidden lg:block rounded-lg overflow-hidden">
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
                  className="hover:bg-[#404F61] transition-colors border-none"
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
                        size="icon"
                        variant="outline"
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
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-primary font-bold">
                        P
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full bg-white"
                      >
                        <Eye className="w-4 h-4 text-primary" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full bg-white"
                      >
                        <MessageSquareMore className="w-4 h-4 text-primary" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
          <div className="text-gray-400 text-xs sm:text-sm order-2 sm:order-1">
            ROWS PER PAGE: <span className="text-white">10</span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 order-1 sm:order-2">
            <span className="text-gray-400 text-xs sm:text-sm">1-5 OF 13</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

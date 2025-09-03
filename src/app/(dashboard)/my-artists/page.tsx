"use client";

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
  Trash2,
  Mail,
  MessageSquareMore,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  useSearchArtists,
  useUserRoster,
  type Artist,
} from "@/hooks/use-artists";
import ReactCountryFlag from "react-country-flag";
import { formatListenersWithoutSuffix } from "@/helpers/numberUtils";

// Country code to country name mapping
const getCountryName = (countryCode: string): string => {
  const countryNames: { [key: string]: string } = {
    us: "United States",
    gb: "United Kingdom",
    ca: "Canada",
    ng: "Nigeria",
    nl: "Netherlands",
    cr: "Costa Rica",
    au: "Australia",
    de: "Germany",
    fr: "France",
    it: "Italy",
    es: "Spain",
    br: "Brazil",
    mx: "Mexico",
    ar: "Argentina",
    jp: "Japan",
    kr: "South Korea",
    cn: "China",
    in: "India",
    ru: "Russia",
    za: "South Africa",
    eg: "Egypt",
    ma: "Morocco",
    ke: "Kenya",
    gh: "Ghana",
    se: "Sweden",
    no: "Norway",
    dk: "Denmark",
    fi: "Finland",
    pl: "Poland",
    cz: "Czech Republic",
    hu: "Hungary",
    ro: "Romania",
    bg: "Bulgaria",
    hr: "Croatia",
    si: "Slovenia",
    sk: "Slovakia",
    lt: "Lithuania",
    lv: "Latvia",
    ee: "Estonia",
    ie: "Ireland",
    pt: "Portugal",
    ch: "Switzerland",
    at: "Austria",
    be: "Belgium",
    lu: "Luxembourg",
    mt: "Malta",
    cy: "Cyprus",
    gr: "Greece",
    tr: "Turkey",
    il: "Israel",
    ae: "United Arab Emirates",
    sa: "Saudi Arabia",
    qa: "Qatar",
    kw: "Kuwait",
    bh: "Bahrain",
    om: "Oman",
    jo: "Jordan",
    lb: "Lebanon",
    sy: "Syria",
    iq: "Iraq",
    ir: "Iran",
    af: "Afghanistan",
    pk: "Pakistan",
    bd: "Bangladesh",
    lk: "Sri Lanka",
    mv: "Maldives",
    np: "Nepal",
    bt: "Bhutan",
    mm: "Myanmar",
    th: "Thailand",
    la: "Laos",
    kh: "Cambodia",
    vn: "Vietnam",
    my: "Malaysia",
    sg: "Singapore",
    id: "Indonesia",
    ph: "Philippines",
    tw: "Taiwan",
    hk: "Hong Kong",
    mo: "Macau",
    mn: "Mongolia",
    kz: "Kazakhstan",
    kg: "Kyrgyzstan",
    tj: "Tajikistan",
    tm: "Turkmenistan",
    uz: "Uzbekistan",
    other: "Other Countries",
  };

  return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase();
};

// Component to render country flag using react-country-flag
const CountryFlag: React.FC<{ countryCode: string }> = ({ countryCode }) => {
  // Handle special case for "other"
  if (countryCode.toLowerCase() === "other") {
    return <span className="text-sm">🌍</span>;
  }

  return (
    <ReactCountryFlag
      countryCode={countryCode.toUpperCase()}
      svg
      style={{
        width: "1.2em",
        height: "1.2em",
      }}
      title={countryCode.toUpperCase()}
    />
  );
};

export default function MyArtistsPage() {
  // State for dialog and artist management
  const [isRosterDialogOpen, setIsRosterDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedArtists, setTempSelectedArtists] = useState<Artist[]>([]);
  const [confirmRemoveDialog, setConfirmRemoveDialog] = useState<{
    isOpen: boolean;
    artist: Artist | null;
  }>({
    isOpen: false,
    artist: null,
  });

  const { user } = useAuthStore();

  // API hooks
  const {
    userRoster,
    isLoadingRoster,
    addArtists,
    removeArtist,
    isAddingArtists,
    isRemovingArtist,
  } = useUserRoster(user?.username);

  const { data: searchResults, isLoading: isLoadingSearch } = useSearchArtists({
    name: searchQuery || undefined,
    offset: 0,
    limit: 100,
  });

  // Get filtered search results
  const filteredArtists = searchResults || [];

  // Handle search in artists list
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Toggle artist selection in dialog
  const handleToggleArtist = (artist: Artist) => {
    setTempSelectedArtists((prev) => {
      const isSelected = prev.some((a) => a.id === artist.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== artist.id);
      } else {
        return [...prev, artist];
      }
    });
  };

  // Add selected artists to the main list
  const handleAddSelectedArtists = () => {
    if (tempSelectedArtists.length > 0 && user?.username) {
      addArtists({
        username: user.username,
        selected_artists: tempSelectedArtists,
      });
      setTempSelectedArtists([]);
      setIsRosterDialogOpen(false);
    }
  };

  // Show confirmation dialog for removing artist
  const handleRemoveArtist = (artist: Artist) => {
    setConfirmRemoveDialog({ isOpen: true, artist });
  };

  // Confirm artist removal
  const handleConfirmRemoveArtist = () => {
    if (confirmRemoveDialog.artist && user?.username) {
      removeArtist({
        username: user.username,
        artist: confirmRemoveDialog.artist,
      });
      setConfirmRemoveDialog({ isOpen: false, artist: null });
    }
  };

  // Cancel artist removal
  const handleCancelRemoveArtist = () => {
    setConfirmRemoveDialog({ isOpen: false, artist: null });
  };

  // Open roster dialog
  const handleOpenRosterDialog = () => {
    setIsRosterDialogOpen(true);
    setTempSelectedArtists([]); // Clear temporary selections when opening dialog
  };

  // Use the user roster directly from API
  const artists = userRoster;

  return (
    <div className="min-h-screen bg-[#222C41] text-white p-4 sm:p-4 lg:p-4 rounded-2xl border border-[#FFFFFF3B]">
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

      <div className="w-full p-4 bg-background rounded-3xl lg:rounded-t-none lg:rounded-b-3xl">
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
            <AddNewArtistDialog
              isRosterDialogOpen={isRosterDialogOpen}
              setIsRosterDialogOpen={setIsRosterDialogOpen}
              handleOpenRosterDialog={handleOpenRosterDialog}
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              filteredArtists={filteredArtists}
              isLoadingArtists={isLoadingSearch}
              userRoster={userRoster}
              tempSelectedArtists={tempSelectedArtists}
              setTempSelectedArtists={setTempSelectedArtists}
              handleToggleArtist={handleToggleArtist}
              handleAddSelectedArtists={handleAddSelectedArtists}
              isAddingArtists={isAddingArtists}
            />

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
          {isLoadingRoster ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
              <span className="ml-2 text-white">Loading artists...</span>
            </div>
          ) : artists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {artists.map((artist) => (
                <Card
                  key={artist.id}
                  className="bg-[#222C41] border-none hover:bg-[#404F61] transition-all duration-200"
                >
                  <CardContent className="p-4 sm:p-6">
                    {/* Artist Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                        {artist?.picture_url ? (
                          <Image
                            src={artist?.picture_url}
                            alt={artist.name}
                            width={60}
                            height={60}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm sm:text-base">
                          {artist.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {artist.country && (
                            <>
                              <CountryFlag
                                countryCode={
                                  typeof artist.country === "string"
                                    ? artist.country
                                    : artist.country?.code ||
                                      artist.country?.name ||
                                      "other"
                                }
                              />
                              <span className="text-gray-300 text-xs sm:text-sm">
                                {getCountryName(
                                  typeof artist.country === "string"
                                    ? artist.country
                                    : artist.country?.code ||
                                        artist.country?.name ||
                                        "other"
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Listenership */}
                    <div className="mb-4">
                      <p className="text-gray-400 text-xs sm:text-sm mb-2">
                        LISTENERSHIP
                      </p>
                      <span className="text-white font-medium text-sm">
                        {artist?.listenership
                          ? formatListenersWithoutSuffix(artist.listenership)
                          : "No data"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full bg-primary p-2"
                        onClick={() => handleRemoveArtist(artist)}
                        disabled={isRemovingArtist}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Artists Added
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Start by adding artists to your roster to manage them here.
              </p>
            </div>
          )}
        </div>

        {/* Desktop Table View (lg and above) */}
        <div className="hidden lg:block  overflow-hidden">
          {isLoadingRoster ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
              <span className="ml-2 text-white">Loading artists...</span>
            </div>
          ) : artists.length > 0 ? (
            <Table>
              <TableHeader className="[&_tr]:border-0">
                <TableRow className="bg-[#222C41] border-none overflow-hidden rounded-2xl">
                  <TableHead className="text-gray-300 font-medium py-4 px-6 rounded-l-2xl">
                    ARTIST NAME
                  </TableHead>
                  <TableHead className="text-gray-300 font-medium py-4 px-6">
                    COUNTRY
                  </TableHead>
                  <TableHead className="text-gray-300 font-medium py-4 px-6">
                    LISTENERSHIP
                  </TableHead>
                  <TableHead className="text-gray-300 font-medium py-4 px-6 rounded-r-2xl">
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
                          {artist?.picture_url ? (
                            <img
                              src={artist?.picture_url}
                              alt={artist.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <span className="text-white font-medium">
                          {artist.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      {artist.country ? (
                        <div className="flex items-center gap-2">
                          <CountryFlag
                            countryCode={
                              typeof artist.country === "string"
                                ? artist.country
                                : artist.country?.code ||
                                  artist.country?.name ||
                                  "other"
                            }
                          />
                          <span className="text-white">
                            {getCountryName(
                              typeof artist.country === "string"
                                ? artist.country
                                : artist.country?.code ||
                                    artist.country?.name ||
                                    "other"
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <span className="text-white">
                        {artist?.listenership
                          ? formatListenersWithoutSuffix(artist.listenership)
                          : "No data"}
                      </span>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full bg-primary"
                        onClick={() => handleRemoveArtist(artist)}
                        disabled={isRemovingArtist}
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Artists Added
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Start by adding artists to your roster to manage them here.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {artists.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            <div className="text-gray-400 text-xs sm:text-sm order-2 sm:order-1">
              ROWS PER PAGE: <span className="text-white">10</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 order-1 sm:order-2">
              <span className="text-gray-400 text-xs sm:text-sm">
                1-{Math.min(artists.length, 10)} OF {artists.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  disabled={true}
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  disabled={true}
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog for Removing Artist */}
        <Dialog
          open={confirmRemoveDialog.isOpen}
          onOpenChange={(open) =>
            setConfirmRemoveDialog({ isOpen: open, artist: null })
          }
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Remove Artist</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove{" "}
                <span className="font-semibold">
                  {confirmRemoveDialog.artist?.name}
                </span>{" "}
                from your roster? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelRemoveArtist}
                disabled={isRemovingArtist}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmRemoveArtist}
                disabled={isRemovingArtist}
              >
                {isRemovingArtist ? "Removing..." : "Yes, Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

interface AddNewArtistDialogProps {
  isRosterDialogOpen: boolean;
  setIsRosterDialogOpen: (open: boolean) => void;
  handleOpenRosterDialog: () => void;
  searchQuery: string;
  handleSearchChange: (query: string) => void;
  filteredArtists: Artist[];
  isLoadingArtists: boolean;
  userRoster: Artist[];
  tempSelectedArtists: Artist[];
  setTempSelectedArtists: (artists: Artist[]) => void;
  handleToggleArtist: (artist: Artist) => void;
  handleAddSelectedArtists: () => void;
  isAddingArtists: boolean;
}

const AddNewArtistDialog = ({
  isRosterDialogOpen,
  setIsRosterDialogOpen,
  handleOpenRosterDialog,
  searchQuery,
  handleSearchChange,
  filteredArtists,
  isLoadingArtists,
  userRoster,
  tempSelectedArtists,
  setTempSelectedArtists,
  handleToggleArtist,
  handleAddSelectedArtists,
  isAddingArtists,
}: AddNewArtistDialogProps) => {
  return (
    <Dialog open={isRosterDialogOpen} onOpenChange={setIsRosterDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base"
          onClick={handleOpenRosterDialog}
        >
          ADD ARTIST
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-[#222C41] border-none p-0 rounded-t-3xl">
        {/* Header with Bot Lion */}
        <div className="flex items-center justify-center flex-col relative overflow-hidden bg-[#293650] rounded-t-3xl">
          <Image
            src="/svgs/Bot-Lion.svg"
            alt="Bot Lion"
            width={110}
            height={100}
            className="object-contain absolute -top-1"
          />
          <Separator className="mt-15 z-50" />
        </div>

        <div className="px-8 pb-4 text-start">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Add New Artist
          </h2>
        </div>

        {/* Search Input */}
        <div className="relative rounded-full overflow-hidden px-8 pb-4">
          <Input
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-10 bg-background border-border text-white placeholder:text-border rounded-full"
          />
          <div className="absolute right-12 top-4.5 transform -translate-y-1/2">
            <Image
              src="/svgs/Golden-Paw.svg"
              alt="Paw"
              width={16}
              height={16}
            />
          </div>
        </div>

        <div className="space-y-4 px-8 pb-4">
          {/* Select All / Clear All */}
          {filteredArtists?.results?.length > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-600">
              <span className="text-sm text-gray-400">
                {filteredArtists?.total} artist
                {filteredArtists?.total !== 1 ? "s" : ""} available
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const availableArtists = filteredArtists?.results.filter(
                      (artist) => !userRoster.some((r) => r.id === artist.id)
                    );
                    setTempSelectedArtists(availableArtists);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempSelectedArtists([])}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Artists List */}
          <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-hide">
            {isLoadingArtists ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <span className="ml-2 text-white">Loading artists...</span>
              </div>
            ) : filteredArtists?.results.length > 0 ? (
              filteredArtists?.results.map((artist, index) => {
                const isSelected = tempSelectedArtists.some(
                  (a) => a.id === artist.id
                );
                const isAlreadyAdded = userRoster.some(
                  (r) => r.id === artist.id
                );

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                      isAlreadyAdded
                        ? "bg-primary/20 border border-primary/30"
                        : isSelected
                        ? "bg-primary/20 border border-primary/30"
                        : "bg-[#4A5A6C] hover:bg-[#5A6A7C]"
                    }`}
                    onClick={() =>
                      !isAlreadyAdded && handleToggleArtist(artist)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isAlreadyAdded
                            ? "bg-primary border-primary"
                            : isSelected
                            ? "bg-primary border-primary"
                            : "border-white"
                        }`}
                      >
                        {(isSelected || isAlreadyAdded) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Artist Picture */}
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                        {artist?.picture_url ? (
                          <Image
                            src={artist.picture_url}
                            alt={artist.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs font-medium">
                            {artist.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Artist Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {artist.name}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-300">
                          {artist.country && (
                            <>
                              <span className="flex items-center space-x-1">
                                <CountryFlag
                                  countryCode={
                                    typeof artist.country === "string"
                                      ? artist.country
                                      : artist.country?.code ||
                                        artist.country?.name ||
                                        "other"
                                  }
                                />
                                <span>
                                  {getCountryName(
                                    typeof artist.country === "string"
                                      ? artist.country
                                      : artist.country?.code ||
                                          artist.country?.name ||
                                          "other"
                                  )}
                                </span>
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span>
                            {artist.listenership
                              ? formatListenersWithoutSuffix(
                                  artist.listenership
                                )
                              : "No data"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isAlreadyAdded && (
                      <span className="text-xs text-green-400">Added</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-white text-sm mb-2">
                  No artists found
                </span>
                <span className="text-gray-400 text-xs">
                  Try adjusting your search
                </span>
              </div>
            )}
          </div>

          {/* Add to Source Button */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-400">
              {tempSelectedArtists.length > 0 && (
                <span>
                  {tempSelectedArtists.length} artist
                  {tempSelectedArtists.length !== 1 ? "s" : ""} selected
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTempSelectedArtists([]);
                  setIsRosterDialogOpen(false);
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                className="bg-[#E55351] hover:bg-[#E55351]/90 text-white px-8"
                onClick={handleAddSelectedArtists}
                disabled={tempSelectedArtists.length === 0 || isAddingArtists}
              >
                {isAddingArtists ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add Artist{" "}
                    {tempSelectedArtists.length > 0 &&
                      `(${tempSelectedArtists.length})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

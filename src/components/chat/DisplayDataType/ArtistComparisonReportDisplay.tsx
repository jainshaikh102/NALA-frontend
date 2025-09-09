import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatCurrencyCompact,
  formatNumberCompact,
} from "@/helpers/formatters";
import { Music, Play, Eye, ExternalLink } from "lucide-react";
import Image from "next/image";

interface Artist {
  id: number;
  name: string;
  images: {
    primary: string;
    thumb: string;
  };
  platform_presence: Array<{
    platform: string;
    icon: string;
    link: string | null;
  }>;
  spotify: {
    streams: {
      lifetime: number;
    };
    earnings: {
      lifetime: number;
    };
  };
  youtube: {
    views: {
      lifetime: number;
    };
    earnings: {
      lifetime: number;
    };
  };
  artist_total_earnings: {
    l30d: number;
    l12m: number;
    lifetime: number;
  };
  top_tracks: Array<{
    rank: number;
    id: string;
    title: string;
    image: string | null;
    earnings: {
      l30d: number;
    };
  }>;
}

interface ArtistComparisonReportData {
  artists: Artist[];
}

interface ArtistComparisonReportDisplayProps {
  data: ArtistComparisonReportData;
}

// Component for rendering track images with fallback
const TrackImage: React.FC<{
  track: { image: string | null; title: string };
}> = ({ track }) => {
  const [imageError, setImageError] = React.useState(false);

  if (!track.image || imageError) {
    return (
      <div className="w-8 h-8 bg-[#FF7B79] rounded flex items-center justify-center flex-shrink-0">
        <Music className="h-4 w-4 text-white" />
      </div>
    );
  }

  return (
    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
      <Image
        src={track.image}
        alt={track.title}
        width={32}
        height={32}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

// Component for rendering platform badges with clickable links
const PlatformBadge: React.FC<{
  platform: { platform: string; icon: string; link: string | null };
}> = ({ platform }) => {
  const [iconError, setIconError] = React.useState(false);

  const badgeContent = (
    <Badge
      variant="secondary"
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium h-12 cursor-pointer hover:bg-secondary/80 transition-colors"
    >
      {/* Platform Icon */}
      {platform.icon && !iconError ? (
        <Image
          src={platform.icon}
          alt={`${platform.platform} icon`}
          width={20}
          height={20}
          className="w-5 h-5 object-contain"
          onError={() => setIconError(true)}
        />
      ) : (
        // Fallback icon for platforms without icon or failed loads
        <div className="w-5 h-5 bg-muted-foreground/20 rounded-sm flex items-center justify-center">
          <span className="text-xs text-muted-foreground">
            {platform.platform.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Platform Name */}
      <span className="capitalize">{platform.platform}</span>

      {/* External Link Icon if link exists */}
      {platform.link && (
        <ExternalLink className="h-3 w-3 text-muted-foreground" />
      )}
    </Badge>
  );

  // If platform has a link, make it clickable
  if (platform.link) {
    return (
      <a
        href={platform.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        {badgeContent}
      </a>
    );
  }

  // If no link, just return the badge
  return badgeContent;
};

// Component for Spotify icon with fallback
const SpotifyIcon: React.FC = () => {
  const [iconError, setIconError] = React.useState(false);

  if (iconError) {
    return (
      <div className="w-6 h-6 bg-[#1DB954] rounded flex items-center justify-center">
        <Play className="h-3 w-3 text-white" />
      </div>
    );
  }

  return (
    <Image
      src="https://blacklion-public-s3.s3.us-east-2.amazonaws.com/spotify.png"
      alt="Spotify icon"
      width={24}
      height={24}
      className="w-6 h-6 object-contain"
      onError={() => setIconError(true)}
    />
  );
};

// Component for YouTube icon with fallback
const YouTubeIcon: React.FC = () => {
  const [iconError, setIconError] = React.useState(false);

  if (iconError) {
    return (
      <div className="w-6 h-6 bg-[#FF0000] rounded flex items-center justify-center">
        <Eye className="h-3 w-3 text-white" />
      </div>
    );
  }

  return (
    <Image
      src="https://blacklion-public-s3.s3.us-east-2.amazonaws.com/youtube.png"
      alt="YouTube icon"
      width={24}
      height={24}
      className="w-6 h-6 object-contain"
      onError={() => setIconError(true)}
    />
  );
};

const ArtistComparisonReportDisplay: React.FC<
  ArtistComparisonReportDisplayProps
> = ({ data }) => {
  const { artists } = data;

  if (!artists || artists.length === 0) {
    return (
      <div className="p-4 bg-muted/20 rounded border border-dashed border-muted-foreground/30">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Music className="h-4 w-4" />
          <span className="text-sm">No artist data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Total Earnings Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Total Earnings Comparison
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {artists.map((artist, index) => (
            <Card
              key={`earnings-${artist.id}-${index}`}
              className="bg-[#FF7B79C7] border-none rounded-2xl p-4"
            >
              <CardContent className="p-0 space-y-3">
                {/* Artist Avatar and Name */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={artist.images.thumb}
                      alt={artist.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-white/20 text-white">
                      {artist.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white font-semibold text-lg truncate">
                    {artist.name}
                  </span>
                </div>

                {/* Total Earnings */}
                <div className="space-y-2">
                  <div className="text-white text-2xl font-bold">
                    {formatCurrencyCompact(
                      artist.artist_total_earnings.lifetime
                    )}
                  </div>
                  <div className="text-white/80 text-sm">
                    Last 12 Months{" "}
                    {formatCurrencyCompact(artist.artist_total_earnings.l12m)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Analysis Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Platform Analysis
        </h3>
        {artists.map((artist, index) => (
          <div key={`platform-${artist.id}-${index}`} className="space-y-4 ">
            {/* Artist Strip */}
            <div className="bg-[#222C41] rounded-lg p-2 flex items-center gap-3 border-border border-[1px]">
              <Avatar className="h-7 w-7">
                <AvatarImage
                  src={artist.images.thumb}
                  alt={artist.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-white/20 text-white">
                  {artist.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-white text-base truncate">
                {artist.name}
              </span>
            </div>

            {/* Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Spotify Card */}
              <Card className="bg-[#5E6470] border-none rounded-lg">
                <CardHeader className="">
                  <div className="flex items-center gap-2">
                    <SpotifyIcon />
                    <span className="text-white font-medium text-base">
                      Spotify
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-base">Plays</span>
                    <span className="text-white font-semibold text-2xl">
                      {formatNumberCompact(artist.spotify.streams.lifetime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Earnings</span>
                    <span className="text-white font-semibold text-2xl">
                      {formatCurrencyCompact(artist.spotify.earnings.lifetime)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* YouTube Card */}
              <Card className="bg-[#5E6470] border-none rounded-lg">
                <CardHeader className="">
                  <div className="flex items-center gap-2">
                    <YouTubeIcon />
                    <span className="text-white font-medium text-base">
                      YouTube
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-base">Views</span>
                    <span className="text-white font-semibold text-2xl">
                      {formatNumberCompact(artist.youtube.views.lifetime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-base">Earnings</span>
                    <span className="text-white font-semibold text-2xl">
                      {formatCurrencyCompact(artist.youtube.earnings.lifetime)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performance Tracks Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Top Performance Tracks
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {artists.map((artist, index) => (
            <Card
              key={`tracks-${artist.id}-${index}`}
              className="bg-[#222C41] border-none rounded-lg"
            >
              <CardHeader className="">
                <div className="flex items-center gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={artist.images.thumb}
                      alt={artist.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-white/20 text-white">
                      {artist.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white font-semibold text-xl">
                    {artist.name} Top Tracks
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {artist.top_tracks.slice(0, 5).map((track, trackIndex) => (
                  <div
                    key={`${artist.id}-track-${track.id}-${trackIndex}`}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <TrackImage track={track} />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-white font-[400] text-base truncate max-w-[200px] cursor-help capitalize">
                              {track.title}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs capitalize">{track.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-white font-bold text-base">
                      {formatCurrencyCompact(track.earnings.l30d)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Presence Section */}
    </div>
  );
};

export default ArtistComparisonReportDisplay;

// <div className="space-y-6">
//   <h3 className="text-lg font-semibold text-foreground">
//     Platform Presence
//   </h3>
//   {artists.map((artist) => (
//     <div key={`presence-${artist.id}`} className="space-y-4">
//       {/* Artist Strip */}
//       <div className="bg-[#2C3E50] rounded-lg p-4 flex items-center gap-3">
//         <Avatar className="h-10 w-10">
//           <AvatarImage
//             src={artist.images.thumb}
//             alt={artist.name}
//             className="object-cover"
//           />
//           <AvatarFallback className="bg-white/20 text-white">
//             {artist.name.charAt(0)}
//           </AvatarFallback>
//         </Avatar>
//         <span className="text-white font-semibold text-lg truncate">
//           {artist.name}
//         </span>
//       </div>

//       {/* Platform Badges */}
//       <div className="flex flex-wrap gap-3">
//         {artist.platform_presence.map((platform, index) => (
//           <PlatformBadge
//             key={`${artist.id}-${platform.platform}-${index}`}
//             platform={platform}
//           />
//         ))}
//       </div>
//     </div>
//   ))}
// </div>

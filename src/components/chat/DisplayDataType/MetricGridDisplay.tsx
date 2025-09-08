import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import {
  formatCurrencyCompact,
  formatNumberCompact,
  validateDataStructure,
} from "@/helpers/formatters";

interface PlatformData {
  [key: string]: string | number;
}

interface MetricGridData {
  data: {
    [platformName: string]: PlatformData;
  };
  title?: string;
}

// Platform configuration mapping
interface PlatformConfig {
  displayName: string;
  iconKey: string;
  primaryMetricKey?: string;
  primaryMetricLabel?: string;
  earningsKeys: {
    min: string;
    max: string;
  };
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  youtube: {
    displayName: "YouTube",
    iconKey: "YOUTUBE_URL",
    primaryMetricKey: "YOUTUBE_VIEWS",
    primaryMetricLabel: "Views",
    earningsKeys: { min: "min_youtube_earnings", max: "max_youtube_earnings" },
  },
  spotify: {
    displayName: "Spotify",
    iconKey: "SPOTIFY_URL",
    primaryMetricKey: "SPOTIFY_PLAYS",
    primaryMetricLabel: "Plays",
    earningsKeys: { min: "min_spotify_earnings", max: "max_spotify_earnings" },
  },
  lineMusic: {
    displayName: "LINE Music",
    iconKey: "LINE_MUSIC_URL",
    primaryMetricKey: "LINE_MUSIC_LIKES",
    primaryMetricLabel: "Likes",
    earningsKeys: {
      min: "min_line_music_earnings",
      max: "max_line_music_earnings",
    },
  },
  tiktok: {
    displayName: "TikTok",
    iconKey: "TIKTOK_URL",
    primaryMetricKey: "TIKTOK_TOP_VIDEOS_AVG_ENGAGEMENT",
    primaryMetricLabel: "Avg Engagement",
    earningsKeys: {
      min: "min_tiktok_views_earnings",
      max: "max_tiktok_views_earnings",
    },
  },
  appleMusic: {
    displayName: "Apple Music",
    iconKey: "APPLEMUSIC_URL",
    earningsKeys: { min: "max_apple_earnings", max: "max_apple_earnings" },
  },
  amazon: {
    displayName: "Amazon Music",
    iconKey: "AMAZON_URL",
    earningsKeys: { min: "max_amazon_earnings", max: "max_amazon_earnings" },
  },
  soundcloud: {
    displayName: "SoundCloud",
    iconKey: "SOUNDCLOUD_URL",
    earningsKeys: {
      min: "min_soundcloud_earnings",
      max: "max_soundcloud_earnings",
    },
  },
  shazam: {
    displayName: "Shazam",
    iconKey: "SHAZAM_URL",
    earningsKeys: { min: "min_shazam_earnings", max: "max_shazam_earnings" },
  },
  lastfm: {
    displayName: "Last.fm",
    iconKey: "LASTFM_URL",
    earningsKeys: {
      min: "min_lastfm_plays_earnings",
      max: "max_lastfm_plays_earnings",
    },
  },
  genius: {
    displayName: "Genius",
    iconKey: "GENIUS_URL",
    earningsKeys: { min: "min_genius_earnings", max: "max_genius_earnings" },
  },
  pandora: {
    displayName: "Pandora",
    iconKey: "PANDORA_URL",
    earningsKeys: {
      min: "min_pandora_streams_earnings",
      max: "max_pandora_streams_earnings",
    },
  },
  airplay: {
    displayName: "AirPlay",
    iconKey: "AIRPLAY_URL",
    earningsKeys: { min: "min_airplay_earnings", max: "max_airplay_earnings" },
  },
  siriusxm: {
    displayName: "SiriusXM",
    iconKey: "SIRIUSXM_URL",
    earningsKeys: {
      min: "min_siriusxm_earnings",
      max: "max_siriusxm_earnings",
    },
  },
  earnings: {
    displayName: "Total Earnings",
    iconKey: "",
    earningsKeys: { min: "min_Total_earnings", max: "max_Total_earnings" },
  },
};

// Local Error Handling Utilities
const createDataUnavailablePlaceholder = (
  message: string = "Data unavailable"
) => (
  <div className="p-4 bg-muted/20 rounded border border-dashed border-muted-foreground/30">
    <div className="flex items-center gap-2 text-muted-foreground">
      <AlertTriangle className="h-4 w-4" />
      <span className="text-sm">{message}</span>
    </div>
  </div>
);

const createMalformedDataFallback = (data: unknown) => {
  return (
    <div className="p-4 bg-orange-50/50 border border-orange-200 rounded">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <span className="text-sm font-medium text-orange-800">
          Data Structure Issue
        </span>
      </div>
      <p className="text-sm text-orange-700 mb-3">
        The data received does&apos;t match the expected format. Raw data is
        shown below:
      </p>
      <details className="group">
        <summary className="cursor-pointer text-sm text-orange-600 hover:text-orange-800 flex items-center gap-1">
          View Raw Data
        </summary>
        <pre className="mt-2 p-2 bg-orange-100 rounded text-xs overflow-auto max-h-40 text-orange-900">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
};

interface MetricGridDisplayProps {
  data: MetricGridData;
  title?: string;
  hideTitle?: boolean;
}

// Helper function to format earnings range
const formatEarningsRange = (
  minValue: number | string,
  maxValue: number | string
): string => {
  const min =
    typeof minValue === "number" ? minValue : parseFloat(String(minValue));
  const max =
    typeof maxValue === "number" ? maxValue : parseFloat(String(maxValue));

  if (isNaN(min) || isNaN(max)) {
    return "N/A";
  }

  // If min and max are the same, show single value
  if (min === max) {
    return formatCurrencyCompact(min);
  }

  return `${formatCurrencyCompact(min)} - ${formatCurrencyCompact(max)}`;
};

// Helper function to get platform icon URL
const getPlatformIconUrl = (
  platformData: PlatformData,
  iconKey: string
): string | null => {
  if (!iconKey || !platformData[iconKey]) {
    return null;
  }
  return String(platformData[iconKey]);
};

// Helper function to get primary metric value
const getPrimaryMetricValue = (
  platformData: PlatformData,
  metricKey?: string
): string | null => {
  if (!metricKey || !platformData[metricKey]) {
    return null;
  }

  const value = platformData[metricKey];
  const numValue =
    typeof value === "number" ? value : parseFloat(String(value));

  if (isNaN(numValue)) {
    return null;
  }

  return formatNumberCompact(numValue);
};

// Helper function to get earnings values
const getEarningsValues = (
  platformData: PlatformData,
  earningsKeys: { min: string; max: string }
) => {
  const minValue = platformData[earningsKeys.min];
  const maxValue = platformData[earningsKeys.max];

  return {
    min: minValue,
    max: maxValue,
    hasEarnings: minValue !== undefined || maxValue !== undefined,
  };
};

// Helper function to check if platform has any non-zero values (excluding URL fields)
const hasNonZeroValues = (platformData: PlatformData): boolean => {
  return Object.entries(platformData).some(([key, value]) => {
    // Skip URL fields as they are just logos
    if (key.includes("_URL") || key.includes("URL")) {
      return false;
    }

    // Check if value is non-zero
    const numValue =
      typeof value === "number" ? value : parseFloat(String(value));
    return !isNaN(numValue) && numValue > 0;
  });
};

const MetricGridDisplay: React.FC<MetricGridDisplayProps> = ({
  data,
  title,
  hideTitle = false,
}) => {
  // Handle both new format with title and legacy format
  const actualTitle = !hideTitle ? title || data?.title : null;
  const platformsData = data.data || data; // Handle both new and legacy data structures

  // Validate data structure
  if (!validateDataStructure(data, ["data"]) && !data) {
    return createMalformedDataFallback(data);
  }

  // Additional validation for platforms data
  if (!platformsData || typeof platformsData !== "object") {
    return createDataUnavailablePlaceholder(
      "Platform data is missing or invalid"
    );
  }

  const platformEntries = Object.entries(platformsData);
  if (platformEntries.length === 0) {
    return createDataUnavailablePlaceholder("No platform data available");
  }

  // Separate total earnings from other platforms
  const totalEarningsEntry = platformEntries.find(
    ([key]) => key === "earnings"
  );
  const otherPlatformEntries = platformEntries.filter(
    ([key]) => key !== "earnings"
  );

  return (
    <div className="space-y-6">
      {/* Section Title */}
      {actualTitle && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {actualTitle}
          </h3>
          <div className="h-px bg-border mt-2"></div>
        </div>
      )}

      {/* Total Earnings Card - Full Width at Top */}
      {totalEarningsEntry &&
        (() => {
          const [platformKey, platformData] = totalEarningsEntry;
          const config = PLATFORM_CONFIGS[platformKey];
          const typedPlatformData = platformData as PlatformData;

          if (config && hasNonZeroValues(typedPlatformData)) {
            const earnings = getEarningsValues(
              typedPlatformData,
              config.earningsKeys
            );

            return (
              <Card className="bg-[#FF7B79C7] border-border p-6 rounded-xl w-full lg:w-2/3 xl:w-1/2 mx-auto">
                <CardContent className="p-0">
                  <div className="flex justify-between items-center flex-col gap-4">
                    <h4 className="text-white font-bold text-2xl">
                      {config.displayName}
                    </h4>
                    <span className="text-white font-bold text-3xl">
                      {formatEarningsRange(
                        earnings.min || 0,
                        earnings.max || 0
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          }
          return null;
        })()}

      {/* Platform Earnings Section Heading */}
      {otherPlatformEntries.some(([platformKey, platformData]) => {
        const config = PLATFORM_CONFIGS[platformKey];
        return config && hasNonZeroValues(platformData as PlatformData);
      }) && (
        <div className="mt-8 mb-4">
          <h3 className="text-3xl font-semibold text-foreground">
            Platform Earnings
          </h3>
          <div className="h-px bg-primary mt-2"></div>
        </div>
      )}

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {otherPlatformEntries.map(([platformKey, platformData]) => {
          if (!platformData || typeof platformData !== "object") {
            return null;
          }

          // Get platform configuration
          const config = PLATFORM_CONFIGS[platformKey];
          if (!config) {
            return null; // Skip unknown platforms
          }

          const typedPlatformData = platformData as PlatformData;

          // Skip platforms with all zero values (except URLs)
          if (!hasNonZeroValues(typedPlatformData)) {
            return null;
          }

          // Get platform icon URL
          const iconUrl = getPlatformIconUrl(typedPlatformData, config.iconKey);

          // Get primary metric value (plays, views, likes, etc.)
          const primaryMetricValue = getPrimaryMetricValue(
            typedPlatformData,
            config.primaryMetricKey
          );

          // Get earnings values
          const earnings = getEarningsValues(
            typedPlatformData,
            config.earningsKeys
          );

          return (
            <Card
              key={platformKey}
              className="bg-[#5E6470] border-slate-600 p-4 rounded-xl"
            >
              <CardContent className="p-0 space-y-4">
                {/* Platform Header with Icon and Name */}
                <div className="flex items-center gap-3">
                  {iconUrl && (
                    <div className="w-8 h-8 flex-shrink-0">
                      <Image
                        src={iconUrl}
                        alt={`${config.displayName} icon`}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        unoptimized={true}
                      />
                    </div>
                  )}
                  <h4 className="text-white font-semibold text-lg">
                    {config.displayName}
                  </h4>
                </div>

                {/* Primary Metric (Plays/Views/Likes) */}
                {primaryMetricValue && config.primaryMetricLabel && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">
                      {config.primaryMetricLabel}
                    </span>
                    <span className="text-white font-bold text-xl">
                      {primaryMetricValue}
                    </span>
                  </div>
                )}

                {/* Earnings Range */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Earnings</span>
                  <span className="text-white font-bold text-lg">
                    {formatEarningsRange(earnings.min || 0, earnings.max || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MetricGridDisplay;

// LastFM
// "min_lastfm_listeners_earnings": 179.72000000000003,
//                             "max_lastfm_listeners_earnings": 195.40999999999997,

// "pandora": {
//                             "min_pandora_streams_earnings": 18.55000000000001,
//                             "max_pandora_streams_earnings": 20.14000000000002,
//                             "PANDORA_URL": "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/pandora.png"
//                         },

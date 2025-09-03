import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ExternalLink } from "lucide-react";
import {
  formatSmartValue,
  convertSnakeCaseToTitleCase,
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

// Helper function to get platform display name
const getPlatformDisplayName = (platformKey: string): string => {
  const platformNames: { [key: string]: string } = {
    youtube: "YouTube",
    spotify: "Spotify",
    lineMusic: "LINE Music",
    tiktok: "TikTok",
    apple: "Apple Music",
    amazon: "Amazon Music",
    soundcloud: "SoundCloud",
    shazam: "Shazam",
    lastfm: "Last.fm",
    genius: "Genius",
    pandora: "Pandora",
    airplay: "AirPlay",
    siriusxm: "SiriusXM",
    earnings: "Total Earnings",
  };
  return platformNames[platformKey] || convertSnakeCaseToTitleCase(platformKey);
};

// Helper function to get platform URL
const getPlatformUrl = (platformData: PlatformData): string | null => {
  const urlKeys = Object.keys(platformData).find((key) => key.includes("_URL"));
  return urlKeys ? String(platformData[urlKeys]) : null;
};

// Helper function to filter out URL keys from metrics
const getMetricsOnly = (platformData: PlatformData): PlatformData => {
  const filtered: PlatformData = {};
  Object.entries(platformData).forEach(([key, value]) => {
    if (!key.includes("_URL")) {
      filtered[key] = value;
    }
  });
  return filtered;
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

      {/* Platform Grids */}
      <div className="space-y-6">
        {platformEntries.map(([platformKey, platformData]) => {
          if (!platformData || typeof platformData !== "object") {
            return null;
          }

          const platformDisplayName = getPlatformDisplayName(platformKey);
          const platformUrl = getPlatformUrl(platformData as PlatformData);
          const metricsData = getMetricsOnly(platformData as PlatformData);
          const metricsEntries = Object.entries(metricsData);

          if (metricsEntries.length === 0) {
            return null;
          }

          return (
            <div key={platformKey} className="space-y-3">
              {/* Platform Header */}
              <div className="flex items-center gap-2">
                <h4 className="text-base font-medium text-foreground">
                  {platformDisplayName}
                </h4>
                {platformUrl && (
                  <a
                    href={platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Platform Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {metricsEntries.map(([key, value], index) => {
                  const formattedLabel = convertSnakeCaseToTitleCase(key);
                  const formattedValue = formatSmartValue(key, value);

                  return (
                    <Card key={index} className="bg-[#5E6470]">
                      <CardContent className="p-4">
                        <div className="text-center flex flex-col justify-center">
                          <p className="text-xl font-bold text-[#E55351]">
                            {formattedValue}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formattedLabel}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricGridDisplay;

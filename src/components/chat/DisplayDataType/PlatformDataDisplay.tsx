import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { validateDataStructure } from "@/helpers/formatters";

interface PlatformItem {
  name: string;
  icon_url: string | null;
}

interface PlatformDataDisplayProps {
  data: PlatformItem[];
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
        The data received doesn&apos;t match the expected format. Raw data is
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

const PlatformDataDisplay: React.FC<PlatformDataDisplayProps> = ({
  data,
  title,
}) => {
  // Validate data structure
  if (!Array.isArray(data)) {
    return createMalformedDataFallback(data);
  }

  if (data.length === 0) {
    return createDataUnavailablePlaceholder("No platform data available");
  }

  // Validate each platform item structure
  const isValidPlatformData = data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.name === "string" &&
      (item.icon_url === null || typeof item.icon_url === "string")
  );

  if (!isValidPlatformData) {
    return createMalformedDataFallback(data);
  }

  return (
    <div className="space-y-4">
      {/* Platform Badges */}
      <div className="flex flex-wrap gap-3">
        {data.map((platform, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-2 px-3 py-2 text-xl font-medium w-40	h-14"
          >
            {/* Platform Icon */}
            {platform.icon_url ? (
              <img
                src={platform.icon_url}
                alt={`${platform.name} icon`}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              // Fallback icon for platforms without icon_url
              <div className="w-4 h-4 bg-muted-foreground/20 rounded-sm flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  {platform.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Platform Name */}
            <span>{platform.name}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PlatformDataDisplay;

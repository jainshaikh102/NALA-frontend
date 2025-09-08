import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import {
  formatSmartValue,
  convertSnakeCaseToTitleCase,
  validateDataStructure,
} from "@/helpers/formatters";

interface KeyValueData {
  data: {
    [key: string]: string | number;
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

interface KeyValueDisplayProps {
  data: KeyValueData;
  title?: string;
  hideTitle?: boolean;
}

const KeyValueDisplay: React.FC<KeyValueDisplayProps> = ({
  data,
  title,
  hideTitle = false,
}) => {
  // Handle both new format with title and legacy format
  const actualTitle = !hideTitle ? title || data?.title : null;
  const metricsData = data.data || data; // Handle both new and legacy data structures

  // Validate data structure
  if (!validateDataStructure(data, ["data"]) && !data) {
    return createMalformedDataFallback(data);
  }

  // Additional validation for metrics data
  if (!metricsData || typeof metricsData !== "object") {
    return createDataUnavailablePlaceholder(
      "Metrics data is missing or invalid"
    );
  }

  const entries = Object.entries(metricsData);
  if (entries.length === 0) {
    return createDataUnavailablePlaceholder("No metrics data available");
  }

  return (
    <div className="space-y-4">
      {/* Section Title */}
      {actualTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {actualTitle}
          </h3>
          <div className="h-px bg-border mt-2"></div>
        </div>
      )}

      {/* Single Earnings Summary Card */}
      <Card className="bg-[#FF7B79C7] border-none rounded-2xl p-6 w-full lg:w-2/3 xl:w-1/2">
        <CardContent className="p-0 space-y-4">
          {entries.map(([key, value], index) => {
            const formattedLabel = convertSnakeCaseToTitleCase(key);
            const formattedValue = formatSmartValue(key, value);

            return (
              <div key={index} className="flex justify-between items-center">
                <span className="text-white font-medium text-lg">
                  {formattedLabel}
                </span>
                <span className="text-white font-bold text-xl">
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyValueDisplay;

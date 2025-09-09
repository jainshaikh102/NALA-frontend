import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ChevronDown } from "lucide-react";
import {
  TextDisplay,
  ErrorDisplay,
  DataFrameDisplay,
  KeyValueDisplay,
  MetricGridDisplay,
  ViralityReportDisplay,
  ForecastChartDisplay,
  PlaylistRecommendationDisplay,
  MultiForecastDisplay,
  MultiSectionReportDisplay,
  PlatformDataDisplay,
  CountryListenershipDisplay,
  ArtistComparisonReportDisplay,
} from "./DataDisplayComponents";

interface ResponseRendererProps {
  answerStr: string;
  displayData?: unknown;
  dataType: string;
}

// Enhanced interface for handling multiple data sections
interface MultiDataResponse {
  sections: Array<{
    type: string;
    data: unknown;
    title?: string;
  }>;
}

// Helper function to detect if displayData contains multiple sections
const isMultiDataResponse = (
  displayData: unknown
): displayData is MultiDataResponse => {
  return (
    typeof displayData === "object" &&
    displayData !== null &&
    "sections" in displayData &&
    Array.isArray((displayData as any).sections)
  );
};

// Helper function to detect if displayData is an array of different data types
const isArrayOfDataSections = (displayData: unknown): boolean => {
  return Array.isArray(displayData) && displayData.length > 0;
};

// Helper function to detect if displayData is a multi-section report array
const isMultiSectionReportArray = (displayData: unknown): boolean => {
  return (
    Array.isArray(displayData) &&
    displayData.length > 0 &&
    displayData.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "section_type" in item &&
        "content" in item
    )
  );
};

// Helper function to detect if displayData is platform data array
const isPlatformDataArray = (displayData: unknown): boolean => {
  return (
    Array.isArray(displayData) &&
    displayData.length > 0 &&
    displayData.every(
      (item) =>
        item && typeof item === "object" && "name" in item && "icon_url" in item
    )
  );
};

// Helper function to detect if displayData is country listenership data array
const isCountryListenershipDataArray = (displayData: unknown): boolean => {
  return (
    Array.isArray(displayData) &&
    displayData.length > 0 &&
    displayData.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "countryCode" in item &&
        "percentage" in item
    )
  );
};

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({
  answerStr,
  displayData,
  dataType,
}) => {
  // Helper function to render individual data sections
  const renderDataSection = (type: string, data: unknown, title?: string) => {
    const sectionContent = (() => {
      switch (type) {
        case "dataframe":
          return <DataFrameDisplay data={data as any} />;
        case "key_value":
          return <KeyValueDisplay data={data as any} />;
        case "metric_grid":
          return <MetricGridDisplay data={data as any} />;
        case "virality_report":
          return <ViralityReportDisplay data={data as any} />;
        case "forecast_chart":
          return <ForecastChartDisplay data={data as any} />;
        case "playlist_recommendation_report":
          return <PlaylistRecommendationDisplay data={data as any} />;
        case "multi_forecast_display":
          return <MultiForecastDisplay data={data as any} />;
        case "platform_data":
          // Handle both direct array format and nested content format
          const platformData = (data as any)?.data || data;
          const platformTitle = (data as any)?.title || title;
          return (
            <PlatformDataDisplay data={platformData} title={platformTitle} />
          );
        case "country_listenership_data":
          // Handle both direct array format and nested content format
          const countryData = (data as any)?.data || data;
          const countryTitle = (data as any)?.title || title;
          return (
            <CountryListenershipDisplay
              data={countryData}
              title={countryTitle}
            />
          );
        case "artist_comparison_report":
          return <ArtistComparisonReportDisplay data={data as any} />;
        case "text":
          return <TextDisplay content={data as string} />;
        case "error":
          return <ErrorDisplay content={data as string} />;
        case "image_base64":
          return (
            <div className="w-full">
              {data && typeof data === "string" ? (
                <img
                  src={`data:image/png;base64,${data}`}
                  alt="Generated content"
                  className="max-w-full h-auto rounded-lg border"
                  onError={(e) => {
                    console.error("Failed to load base64 image");
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="p-4 bg-muted/30 rounded border-dashed border-2">
                  <p className="text-sm text-muted-foreground">
                    Invalid or missing image data
                  </p>
                </div>
              )}
            </div>
          );
        case "video_url":
          return (
            <div className="w-full">
              {data && typeof data === "string" ? (
                <video
                  src={data}
                  controls
                  className="max-w-full h-auto rounded-lg border"
                  onError={(e) => {
                    console.error("Failed to load video from URL:", data);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="p-4 bg-muted/30 rounded border-dashed border-2">
                  <p className="text-sm text-muted-foreground">
                    Invalid or missing video URL
                  </p>
                </div>
              )}
            </div>
          );
        default:
          return (
            <div className="p-4 bg-muted/30 rounded">
              <p className="text-sm text-muted-foreground mb-2">
                Unknown section type: {type}
              </p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          );
      }
    })();

    return (
      <div key={`${type}-${title || "section"}`} className="space-y-2">
        {title && (
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        )}
        {sectionContent}
      </div>
    );
  };

  const renderContent = () => {
    // Check if displayData contains multiple sections
    if (isMultiDataResponse(displayData)) {
      return (
        <div className="space-y-6">
          {/* Show the answer text first if available */}
          {answerStr && <TextDisplay content={answerStr} />}
          {/* Render each section */}
          {displayData.sections.map((section, index) =>
            renderDataSection(section.type, section.data, section.title)
          )}
        </div>
      );
    }

    // Check if displayData is platform data array (prioritize this over generic array detection)
    if (isPlatformDataArray(displayData)) {
      return (
        <div className="space-y-4">
          {answerStr ? <TextDisplay content={answerStr} /> : null}
          <PlatformDataDisplay data={displayData as any} />
        </div>
      );
    }

    // Check if displayData is country listenership data array (prioritize this over generic array detection)
    if (isCountryListenershipDataArray(displayData)) {
      return (
        <div className="space-y-4">
          {answerStr ? <TextDisplay content={answerStr} /> : null}
          <CountryListenershipDisplay data={displayData as any} />
        </div>
      );
    }

    // Check if displayData is a multi-section report array (prioritize this over generic array detection)
    if (isMultiSectionReportArray(displayData)) {
      return (
        <div className="space-y-4">
          {answerStr ? <TextDisplay content={answerStr} /> : null}
          <MultiSectionReportDisplay
            data={{ sections: displayData as any[] }}
          />
        </div>
      );
    }

    // Check if displayData is an array of different data sections
    if (isArrayOfDataSections(displayData)) {
      const dataArray = displayData as any[];
      return (
        <div className="space-y-6">
          {/* Show the answer text first if available */}
          {answerStr && <TextDisplay content={answerStr} />}
          {/* Render each item in the array */}
          {dataArray.map((item, index) => {
            // Try to detect the type of each item
            if (item && typeof item === "object") {
              // Check for dataframe structure (new format with dataframe property)
              if (
                item.dataframe &&
                item.dataframe.index &&
                item.dataframe.columns &&
                item.dataframe.data
              ) {
                return renderDataSection(
                  "dataframe",
                  item,
                  `Data Table ${index + 1}`
                );
              }
              // Check for legacy dataframe structure (direct properties)
              if (item.index && item.columns && item.data) {
                return renderDataSection(
                  "dataframe",
                  { dataframe: item },
                  `Data Table ${index + 1}`
                );
              }
              // Check for key-value structure (new format with data property)
              if (item.data && typeof item.data === "object") {
                const keyValueData = item.data;
                if (
                  Object.keys(keyValueData).every(
                    (key) =>
                      typeof keyValueData[key] === "string" ||
                      typeof keyValueData[key] === "number"
                  )
                ) {
                  return renderDataSection(
                    "key_value",
                    item,
                    `Metrics ${index + 1}`
                  );
                }
              }
              // Check for legacy key-value structure (direct key-value pairs)
              if (
                Object.keys(item).every(
                  (key) =>
                    typeof item[key] === "string" ||
                    typeof item[key] === "number"
                )
              ) {
                return renderDataSection(
                  "key_value",
                  { data: item },
                  `Metrics ${index + 1}`
                );
              }
              // Check for virality report structure
              if (
                item.final_score !== undefined &&
                item.verdict !== undefined
              ) {
                return renderDataSection(
                  "virality_report",
                  item,
                  `Report ${index + 1}`
                );
              }
            }
            // Fallback to generic display
            return (
              <div key={index} className="p-4 bg-muted/30 rounded">
                <p className="text-sm text-muted-foreground mb-2">
                  Data Section {index + 1}
                </p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            );
          })}
        </div>
      );
    }

    // Original single data type handling
    switch (dataType) {
      case "text":
        return <TextDisplay content={answerStr} />;

      case "error":
        return <ErrorDisplay content={answerStr} />;

      case "image_base64":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData && typeof displayData === "string" ? (
              <div className="w-full">
                <img
                  src={`data:image/png;base64,${displayData}`}
                  alt="Generated content"
                  className="max-w-full h-auto rounded-lg border"
                  onError={(e) => {
                    console.error("Failed to load base64 image");
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded border-dashed border-2">
                <p className="text-sm text-muted-foreground">
                  Invalid or missing image data
                </p>
              </div>
            )}
          </div>
        );

      case "video_url":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData && typeof displayData === "string" ? (
              <div className="w-full">
                <video
                  src={displayData}
                  controls
                  className="max-w-full h-auto rounded-lg border"
                  // onError={(e) => {
                  //   console.error(
                  //     "Failed to load video from URL:",
                  //     displayData
                  //   );
                  // }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded border-dashed border-2">
                <p className="text-sm text-muted-foreground">
                  Invalid or missing video URL
                </p>
              </div>
            )}
          </div>
        );

      case "dataframe":
        return (
          <div className="space-y-4">
            {/* Show the answer text first */}
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {/* Then show the data table */}
            {displayData ? (
              <DataFrameDisplay data={displayData as any} />
            ) : null}
          </div>
        );

      case "key_value":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? <KeyValueDisplay data={displayData as any} /> : null}
          </div>
        );

      case "metric_grid":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? (
              <MetricGridDisplay data={displayData as any} />
            ) : null}
          </div>
        );

      case "virality_report":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? (
              <ViralityReportDisplay data={displayData as any} />
            ) : null}
          </div>
        );

      case "forecast_chart":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? (
              <ForecastChartDisplay data={displayData as any} />
            ) : null}
          </div>
        );

      case "playlist_recommendation_report":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? (
              <PlaylistRecommendationDisplay data={displayData as any} />
            ) : null}
          </div>
        );

      case "multi_forecast_display":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? (
              <MultiForecastDisplay data={displayData as any} />
            ) : null}
          </div>
        );

      case "multi_section_report":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? (
              <MultiSectionReportDisplay
                data={
                  Array.isArray(displayData)
                    ? { sections: displayData as any[] }
                    : (displayData as any)
                }
              />
            ) : null}
          </div>
        );

      case "platform_data":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? (
              <PlatformDataDisplay data={displayData as any} />
            ) : null}
          </div>
        );

      case "country_listenership_data":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? (
              <CountryListenershipDisplay data={displayData as any} />
            ) : null}
          </div>
        );

      case "artist_comparison_report":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? (
              <ArtistComparisonReportDisplay data={displayData as any} />
            ) : null}
          </div>
        );

      case "mixed_content":
        return (
          <div className="space-y-4">
            {answerStr ? <TextDisplay content={answerStr} /> : null}
            {displayData ? (
              <div className="text-muted-foreground">
                Mixed content display not implemented
              </div>
            ) : null}
          </div>
        );

      default:
        // Enhanced fallback for unknown data types according to specification
        console.warn(`[ResponseRenderer] Unhandled data_type: ${dataType}`);

        return (
          <div className="space-y-4">
            {/* Display answer_str as primary content */}
            {answerStr ? <TextDisplay content={answerStr} /> : null}

            {/* Show raw JSON in expandable/collapsible section */}
            {displayData ? (
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Unknown Data Type: {dataType}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    This data type is not yet supported. The raw response data
                    is shown below:
                  </p>
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-yellow-600 hover:text-yellow-800 flex items-center gap-1">
                      <ChevronDown className="h-3 w-3 group-open:rotate-180 transition-transform" />
                      View Raw Response Data
                    </summary>
                    <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto max-h-60 text-yellow-900">
                      {JSON.stringify(displayData, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            ) : null}
          </div>
        );
    }
  };

  return <div className="w-full">{renderContent()}</div>;
};

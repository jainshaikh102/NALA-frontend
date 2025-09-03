import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";
import KeyValueDisplay from "./KeyValueDisplay";
import MetricGridDisplay from "./MetricGridDisplay";
import DataFrameDisplay from "./DataFrameDisplay";
import ForecastChartDisplay from "./ForecastChartDisplay";
import ViralityReportDisplay from "./ViralityReportDisplay";
import PlaylistRecommendationDisplay from "./PlaylistRecommendationDisplay";
import MultiForecastDisplay from "./MultiForecastDisplay";
import TextDisplay from "./TextDisplay";
import ErrorDisplay from "./ErrorDisplay";
import PlatformDataDisplay from "./PlatformDataDisplay";
import CountryListenershipDisplay from "./CountryListenershipDisplay";

// Type definitions for different section content types
interface KeyValueContent {
  data?: { [key: string]: string | number };
  title?: string;
}

interface LegacyKeyValueContent {
  [key: string]: string | number;
}

interface DataFrameContent {
  dataframe?: {
    index: number[];
    columns: string[];
    data: (string | number)[][];
  };
  index?: number[];
  columns?: string[];
  data?: (string | number)[][];
}

interface LegacyDataFrameContent {
  index: number[];
  columns: string[];
  data: (string | number)[][];
}

interface PlatformContent {
  title?: string;
  data?: Array<{
    name: string;
    icon_url: string | null;
  }>;
}

interface CountryListenershipContent {
  title?: string;
  data?: Array<{
    countryCode: string;
    percentage: number;
  }>;
}

interface SectionContentWithTitle {
  title?: string;
}

interface ViralityReportContent {
  artist_name: string;
  audience_growth_percentage: number;
  engagement_growth_percentage: number;
  final_score: number;
  verdict: string;
  summary: string;
  detailed_metrics: {
    [key: string]: {
      status: "calculated" | "unavailable" | "data_error";
      growth?: number;
      baseline_avg?: number;
      recent_avg?: number;
    };
  };
}

interface ForecastChartContent {
  title: string;
  y_axis_label: string;
  historical_data: {
    data: [string, number][];
    columns: string[];
  };
  forecast_data: {
    data: [string, number, number?, number?][];
    columns: string[];
  };
}

interface PlaylistRecommendationContent {
  track_name: string;
  artist_name: string;
  summary: string;
  recommendations: Array<{
    playlist_name: string;
    curator_name: string;
    platform: string;
    playlist_followers: number;
    playlist_url: string;
    recommendation_score: number;
    reasoning: {
      [key: string]: string;
    };
  }>;
}

interface MultiForecastContent {
  forecasts: Array<{
    title: string;
    y_axis_label: string;
    historical_data: {
      data: [string, number][];
      columns: string[];
    };
    forecast_data: {
      data: [string, number, number?, number?][];
      columns: string[];
    };
  }>;
}

interface ReportSection {
  section_type: string;
  content: unknown;
  title?: string;
}

interface MultiSectionReportData {
  sections: ReportSection[];
}

interface MultiSectionReportDisplayProps {
  data: MultiSectionReportData;
}

const MultiSectionReportDisplay: React.FC<MultiSectionReportDisplayProps> = ({
  data,
}) => {
  const renderSection = (section: ReportSection, index: number) => {
    switch (section.section_type) {
      case "metric_grid":
        // Handle both new and legacy data structures for metric_grid
        const metricGridData = section.content as
          | KeyValueContent
          | LegacyKeyValueContent;
        const processedMetricGridData = (metricGridData as KeyValueContent)
          ?.data
          ? (metricGridData as KeyValueContent)
          : { data: metricGridData as LegacyKeyValueContent };
        return (
          <MetricGridDisplay
            key={index}
            data={
              processedMetricGridData as {
                data: { [key: string]: string | number };
              }
            }
            hideTitle={true} // Hide title since we show it at section level
          />
        );

      case "key_value":
        // Handle both new and legacy data structures for key_value
        const keyValueData = section.content as
          | KeyValueContent
          | LegacyKeyValueContent;
        const processedKeyValueData = (keyValueData as KeyValueContent)?.data
          ? (keyValueData as KeyValueContent)
          : { data: keyValueData as LegacyKeyValueContent };
        return (
          <KeyValueDisplay
            key={index}
            data={
              processedKeyValueData as {
                data: { [key: string]: string | number };
              }
            }
            hideTitle={true} // Hide title since we show it at section level
          />
        );

      case "dataframe":
      case "table":
        // Handle both new and legacy data structures for dataframe
        const dataFrameData = section.content as
          | DataFrameContent
          | LegacyDataFrameContent;
        const processedDataFrameData = (dataFrameData as DataFrameContent)
          ?.dataframe
          ? (dataFrameData as DataFrameContent)
          : { dataframe: dataFrameData as LegacyDataFrameContent };
        return (
          <DataFrameDisplay
            key={index}
            data={
              processedDataFrameData as {
                dataframe: {
                  index: number[];
                  columns: string[];
                  data: (string | number)[][];
                };
              }
            }
          />
        );

      case "text":
        return <TextDisplay key={index} content={section.content as string} />;

      case "virality_report":
        return (
          <ViralityReportDisplay
            key={index}
            data={section.content as ViralityReportContent}
          />
        );

      case "forecast_chart":
        return (
          <ForecastChartDisplay
            key={index}
            data={section.content as ForecastChartContent}
          />
        );

      case "playlist_recommendation_report":
        return (
          <PlaylistRecommendationDisplay
            key={index}
            data={section.content as PlaylistRecommendationContent}
          />
        );

      case "multi_forecast_display":
        return (
          <MultiForecastDisplay
            key={index}
            data={section.content as MultiForecastContent}
          />
        );

      case "error":
        return <ErrorDisplay key={index} content={section.content as string} />;

      case "platform_data":
        // Handle platform data using PlatformDataDisplay component
        const platformContent = section.content as PlatformContent;
        const platformData = platformContent?.data || [];
        const platformTitle = platformContent?.title;

        return (
          <PlatformDataDisplay
            key={index}
            data={platformData}
            title={platformTitle}
          />
        );

      case "country_listenership_data":
        // Handle country listenership data using CountryListenershipDisplay component
        const countryContent = section.content as CountryListenershipContent;
        const countryData = countryContent?.data || [];
        const countryTitle = countryContent?.title;

        return (
          <CountryListenershipDisplay
            key={index}
            data={countryData}
            title={countryTitle}
          />
        );

      default:
        // Enhanced fallback - try to auto-detect the data type based on content structure
        const content = section.content as Record<string, unknown>;

        // Try to detect dataframe structure
        if (content && typeof content === "object") {
          // Check for dataframe structure (new format with dataframe property)
          const dataFrameContent = content as DataFrameContent;
          if (
            dataFrameContent.dataframe &&
            dataFrameContent.dataframe.index &&
            dataFrameContent.dataframe.columns &&
            dataFrameContent.dataframe.data
          ) {
            return (
              <DataFrameDisplay
                key={index}
                data={
                  dataFrameContent as {
                    dataframe: {
                      index: number[];
                      columns: string[];
                      data: (string | number)[][];
                    };
                  }
                }
              />
            );
          }

          // Check for legacy dataframe structure (direct properties)
          const legacyDataFrame = content as unknown as LegacyDataFrameContent;
          if (
            legacyDataFrame.index &&
            legacyDataFrame.columns &&
            legacyDataFrame.data
          ) {
            return (
              <DataFrameDisplay
                key={index}
                data={{ dataframe: legacyDataFrame }}
              />
            );
          }

          // Check for key-value structure (new format with data property)
          const keyValueContent = content as KeyValueContent;
          if (
            keyValueContent.data &&
            typeof keyValueContent.data === "object"
          ) {
            const keyValueData = keyValueContent.data;
            if (
              Object.keys(keyValueData).every(
                (key) =>
                  typeof keyValueData[key] === "string" ||
                  typeof keyValueData[key] === "number"
              )
            ) {
              return (
                <KeyValueDisplay
                  key={index}
                  data={
                    keyValueContent as {
                      data: { [key: string]: string | number };
                    }
                  }
                />
              );
            }
          }

          // Check for legacy key-value structure (direct key-value pairs)
          const legacyKeyValue = content as LegacyKeyValueContent;
          if (
            Object.keys(legacyKeyValue).every(
              (key) =>
                typeof legacyKeyValue[key] === "string" ||
                typeof legacyKeyValue[key] === "number"
            )
          ) {
            return (
              <KeyValueDisplay key={index} data={{ data: legacyKeyValue }} />
            );
          }
        }

        // If it's a string, treat as text
        if (typeof content === "string") {
          return <TextDisplay key={index} content={content} />;
        }

        // Final fallback - show unknown section type with better formatting
        console.warn(
          `[MultiSectionReportDisplay] Unknown section type: ${section.section_type}`,
          section.content
        );
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <p className="text-muted-foreground">
                  Unknown section type:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {section.section_type}
                  </code>
                </p>
              </div>
              <details className="cursor-pointer">
                <summary className="text-sm font-medium mb-2">
                  View raw data
                </summary>
                <pre className="text-xs overflow-auto bg-muted/50 p-3 rounded">
                  {JSON.stringify(section.content, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      {data.sections?.map((section, index) => {
        // Extract title from section.content.title or fallback to section.title
        const sectionTitle =
          (section.content as SectionContentWithTitle)?.title || section.title;

        return (
          <div key={index}>
            {/* Section Title - Big Bold Heading */}
            {sectionTitle && (
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {sectionTitle}
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-primary to-primary/20 rounded-full"></div>
              </div>
            )}

            {/* Section Content */}
            <div className="mb-8">{renderSection(section, index)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default MultiSectionReportDisplay;

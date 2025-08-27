import React from "react";
import {
  TextDisplay,
  ErrorDisplay,
  KeyValueDisplay,
  DataFrameDisplay,
  ForecastChartDisplay,
  ViralityReportDisplay,
  PlaylistRecommendationDisplay,
  MultiSectionReportDisplay,
  MultiForecastDisplay,
  PlatformDataDisplay,
  CountryListenershipDisplay,
} from "./DisplayDataType";

// Interface for the main response renderer
interface ResponseRendererProps {
  data: {
    answer_str: string;
    display_data: any;
    data_type: string;
    query_str: string;
    status_bool: boolean;
  };
}

// Main component that routes to appropriate display components
export const ResponseRenderer: React.FC<ResponseRendererProps> = ({ data }) => {
  const { answer_str, display_data, data_type, status_bool } = data;

  // Handle error states
  if (!status_bool) {
    return <ErrorDisplay content={answer_str || "An error occurred"} />;
  }

  // Route to appropriate display component based on data_type
  switch (data_type) {
    case "text":
      return <TextDisplay content={answer_str} />;

    case "key_value":
      return <KeyValueDisplay data={display_data} />;

    case "dataframe":
      return <DataFrameDisplay data={display_data} />;

    case "forecast_chart":
      return <ForecastChartDisplay data={display_data} />;

    case "virality_report":
      return <ViralityReportDisplay data={display_data} />;

    case "playlist_recommendation_report":
      return <PlaylistRecommendationDisplay data={display_data} />;

    case "multi_section_report":
      // Transform the display_data array into the expected format
      const multiSectionData = Array.isArray(display_data)
        ? {
            sections: display_data.map((item) => ({
              section_type: item.section_type,
              content: item.content,
              title: item.content?.title,
            })),
          }
        : display_data;
      return <MultiSectionReportDisplay data={multiSectionData} />;

    case "multi_forecast_display":
      return <MultiForecastDisplay data={display_data} />;

    case "platform_data":
      return <PlatformDataDisplay data={display_data} />;

    case "country_listenership_data":
      return <CountryListenershipDisplay data={display_data} />;

    default:
      // Fallback for unknown data types
      return (
        <div className="p-4 bg-orange-50/50 border border-orange-200 rounded">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-orange-800">
              Unknown Data Type: {data_type}
            </span>
          </div>
          <p className="text-sm text-orange-700 mb-3">
            This data type is not yet supported. Showing raw data:
          </p>
          <details className="group">
            <summary className="cursor-pointer text-sm text-orange-600 hover:text-orange-800">
              View Raw Data
            </summary>
            <pre className="mt-2 p-2 bg-orange-100 rounded text-xs overflow-auto max-h-40 text-orange-900">
              {JSON.stringify({ answer_str, display_data, data_type }, null, 2)}
            </pre>
          </details>
        </div>
      );
  }
};

// Legacy exports for backward compatibility
export {
  TextDisplay,
  ErrorDisplay,
  KeyValueDisplay,
  DataFrameDisplay,
  ForecastChartDisplay,
  ViralityReportDisplay,
  PlaylistRecommendationDisplay,
  MultiSectionReportDisplay,
  MultiForecastDisplay,
  PlatformDataDisplay,
  CountryListenershipDisplay,
};

// Default export
export default ResponseRenderer;

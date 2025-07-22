import React from "react";
import {
  TextDisplay,
  ErrorDisplay,
  DataFrameDisplay,
  KeyValueDisplay,
  ViralityReportDisplay,
  ForecastChartDisplay,
  MultiSectionReportDisplay,
} from "./DataDisplayComponents";

interface ResponseRendererProps {
  answerStr: string;
  displayData?: unknown;
  dataType: string;
}

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({
  answerStr,
  displayData,
  dataType,
}) => {
  const renderContent = () => {
    switch (dataType) {
      case "text":
        return <TextDisplay content={answerStr} />;

      case "error":
        return <ErrorDisplay content={answerStr} />;

      case "dataframe":
        return (
          <div className="space-y-4">
            {/* Show the answer text first */}
            <TextDisplay content={answerStr} />
            {/* Then show the data table */}
            {displayData && <DataFrameDisplay data={displayData as any} />}
          </div>
        );

      case "key_value":
        return (
          <div className="space-y-4">
            {answerStr && <TextDisplay content={answerStr} />}
            {displayData && <KeyValueDisplay data={displayData as any} />}
          </div>
        );

      case "virality_report":
        return (
          <div className="space-y-4">
            {answerStr && <TextDisplay content={answerStr} />}
            {displayData && <ViralityReportDisplay data={displayData as any} />}
          </div>
        );

      case "forecast_chart":
        return (
          <div className="space-y-4">
            {answerStr && <TextDisplay content={answerStr} />}
            {displayData && <ForecastChartDisplay data={displayData as any} />}
          </div>
        );

      case "multi_section_report":
        return (
          <div className="space-y-4">
            {answerStr && <TextDisplay content={answerStr} />}
            {displayData && (
              <MultiSectionReportDisplay data={displayData as any} />
            )}
          </div>
        );

      default:
        // Fallback to text display for unknown types
        return (
          <div className="space-y-4">
            <TextDisplay content={answerStr} />
            {displayData && (
              <div className="p-4 bg-muted/30 rounded">
                <p className="text-sm text-muted-foreground mb-2">
                  Unknown data type: {dataType}
                </p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(displayData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
    }
  };

  return <div className="w-full">{renderContent()}</div>;
};

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// Interface definitions
interface DataFrameData {
  index: number[];
  columns: string[];
  data: (string | number)[][];
}

interface KeyValueData {
  [key: string]: string | number;
}

interface ViralityReportData {
  final_score: number;
  verdict: string;
  audience_growth_percentage: number;
  engagement_growth_percentage: number;
  detailed_metrics: {
    [key: string]: string | number | boolean;
  };
}

interface ForecastChartData {
  historical_data: Record<string, unknown>[];
  forecast_data: Record<string, unknown>[];
  confidence_interval_lower_bound?: Record<string, unknown>[];
  prediction_interval_upper_bound?: Record<string, unknown>[];
}

interface ReportSection {
  section_type: string;
  content: unknown;
  title?: string;
}

interface MultiSectionReportData {
  sections: ReportSection[];
}

// Text Display Component with Markdown Support
export const TextDisplay: React.FC<{ content: string }> = ({ content }) => {
  const parseMarkdown = (text: string) => {
    // Split text by lines to handle line breaks properly
    const lines = text.split("\n");

    return lines.map((line, lineIndex) => {
      // Parse bold text (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);

      const parsedLine = parts.map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          // Remove the ** and make it bold
          const boldText = part.slice(2, -2);
          return (
            <strong key={`${lineIndex}-${partIndex}`} className="font-semibold">
              {boldText}
            </strong>
          );
        }
        return part;
      });

      return (
        <span key={lineIndex}>
          {parsedLine}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="prose prose-sm max-w-none">
      <div className="text-foreground">{parseMarkdown(content)}</div>
    </div>
  );
};

// Error Display Component
export const ErrorDisplay: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Card className="border-destructive bg-destructive/10">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-destructive rounded-full"></div>
          <p className="text-destructive font-medium">Error</p>
        </div>
        <p className="text-destructive/80 mt-2">{content}</p>
      </CardContent>
    </Card>
  );
};

// DataFrame Display Component (Table)
export const DataFrameDisplay: React.FC<{ data: DataFrameData }> = ({
  data,
}) => {
  const formatNumber = (value: any) => {
    if (typeof value === "number" && value > 1000000) {
      return (value / 1000000).toFixed(2) + "M";
    }
    if (typeof value === "number" && value > 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {data.columns.map((column, index) => (
                  <th
                    key={index}
                    className="text-left p-3 font-medium text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-3">
                      {cellIndex === 0 ? (
                        <span className="font-medium">{cell}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {formatNumber(cell)}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Key-Value Display Component (Metrics)
export const KeyValueDisplay: React.FC<{ data: KeyValueData }> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(data).map(([key, value], index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{key}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Virality Report Display Component
export const ViralityReportDisplay: React.FC<{ data: ViralityReportData }> = ({
  data,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Virality Report</span>
          <Badge variant={data.final_score >= 70 ? "default" : "secondary"}>
            {data.verdict}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Final Score */}
        <div className="text-center">
          <div
            className={`text-4xl font-bold ${getScoreColor(data.final_score)}`}
          >
            {data.final_score}
          </div>
          <p className="text-muted-foreground">Virality Score</p>
        </div>

        <Separator />

        {/* Growth Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.audience_growth_percentage}%
              </div>
              <p className="text-sm text-muted-foreground">Audience Growth</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.engagement_growth_percentage}%
              </div>
              <p className="text-sm text-muted-foreground">Engagement Growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics (Expandable) */}
        {data.detailed_metrics &&
          Object.keys(data.detailed_metrics).length > 0 && (
            <div>
              <Button
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full justify-between"
              >
                Detailed Metrics
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {showDetails && (
                <div className="mt-4 space-y-2">
                  {Object.entries(data.detailed_metrics || {}).map(
                    ([key, value], index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-muted/30 rounded"
                      >
                        <span className="text-sm">{key}</span>
                        <span className="text-sm font-medium">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
};

// Forecast Chart Display Component (Placeholder for now)
export const ForecastChartDisplay: React.FC<{ data: ForecastChartData }> = ({
  data,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted/30 rounded flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">
              Chart visualization would go here
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Historical data points: {data.historical_data?.length || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Forecast data points: {data.forecast_data?.length || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Multi-Section Report Display Component
export const MultiSectionReportDisplay: React.FC<{
  data: MultiSectionReportData;
}> = ({ data }) => {
  const renderSection = (section: ReportSection, index: number) => {
    switch (section.section_type) {
      case "metric_grid":
      case "key_value":
        return (
          <KeyValueDisplay key={index} data={section.content as KeyValueData} />
        );
      case "dataframe":
        return (
          <DataFrameDisplay
            key={index}
            data={section.content as DataFrameData}
          />
        );
      case "text":
        return <TextDisplay key={index} content={section.content as string} />;
      default:
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <p className="text-muted-foreground">
                Unknown section type: {section.section_type}
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {data.sections?.map((section, index) => (
        <div key={index}>
          {section.title && (
            <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
          )}
          {renderSection(section, index)}
        </div>
      ))}
    </div>
  );
};

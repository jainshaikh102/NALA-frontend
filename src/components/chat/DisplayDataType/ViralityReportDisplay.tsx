import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatSmartValue,
  convertSnakeCaseToTitleCase,
} from "@/helpers/formatters";
import { Separator } from "@/components/ui/separator";

interface ViralityReportData {
  artist_name: string;
  audience_growth_percentage: number;
  engagement_growth_percentage: number;
  final_score: number;
  verdict: string;
  summary: string;
  audience_analysis?: string;
  engagement_analysis?: string;
  detailed_metrics: {
    [key: string]: {
      status: "calculated" | "unavailable" | "data_error";
      growth?: number;
      baseline_avg?: number;
      recent_avg?: number;
    };
  };
}

interface ViralityReportDisplayProps {
  data: ViralityReportData;
}

const ViralityReportDisplay: React.FC<ViralityReportDisplayProps> = ({
  data,
}) => {
  // Helper function to get growth color
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-400";
    if (growth < 0) return "text-red-400";
    return "text-gray-400";
  };

  // Helper function to calculate progress percentage for metrics
  const getProgressPercentage = (baseline: number, recent: number) => {
    if (baseline === 0) return 50; // Default for unavailable data
    const ratio = recent / baseline;
    return Math.min(Math.max(ratio * 50, 0), 100); // Scale to 0-100
  };

  // Render platform metric card
  const renderPlatformMetric = (key: string, metric: any) => {
    const formattedKey = convertSnakeCaseToTitleCase(key);
    const progressPercentage =
      metric.baseline_avg && metric.recent_avg
        ? getProgressPercentage(metric.baseline_avg, metric.recent_avg)
        : 50;

    return (
      <Card key={key} className="bg-[#5E6470] border-slate-600 p-4">
        <div className="space-y-3">
          {/* Header with title and growth */}
          <div className="flex justify-between items-start">
            <h4 className="text-white font-medium text-sm">{formattedKey}</h4>
            {metric.status === "calculated" && metric.growth !== undefined && (
              <span
                className={`text-sm font-medium ${getGrowthColor(
                  metric.growth
                )}`}
              >
                {metric.growth > 0 ? "+" : ""}
                {metric.growth.toFixed(2)}%
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            {/* Baseline and Recent values */}
            <div className="flex justify-between text-xs text-white">
              <span>
                Baseline:{" "}
                {metric.baseline_avg
                  ? formatSmartValue(key, metric.baseline_avg)
                  : "N/A"}
              </span>
              <span>
                Recent:{" "}
                {metric.recent_avg
                  ? formatSmartValue(key, metric.recent_avg)
                  : "N/A"}
              </span>
            </div>

            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className=" text-white space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-gray-300 text-sm">
          I have generated the comprehensive valuation report for{" "}
          {data.artist_name}.
        </p>
        <h1 className="text-2xl font-bold">
          Virality Analysis - {data.artist_name}
        </h1>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Virality Score */}
        <Card className="bg-[#FF7B79C7] border-border p-4">
          <CardContent className="p-0">
            <div className="space-y-2">
              <h3 className="text-white text-base font-medium">
                Virality Score
              </h3>
              <div className="flex items-end gap-2 justify-between">
                <span className="text-white text-2xl font-bold">
                  {data.final_score}
                </span>
                <span className="text-red-200 text-sm mb-1">out of 100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audience Growth */}
        <Card className="bg-[#FF7B79C7] border-border p-4">
          <CardContent className="p-0">
            <div className="space-y-2">
              <h3 className="text-white text-base font-medium">
                Audience Growth
              </h3>
              <div className="text-white text-2xl font-bold">
                <span
                  className={getGrowthColor(data.audience_growth_percentage)}
                >
                  {data.audience_growth_percentage > 0 ? "+" : ""}
                  {data.audience_growth_percentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Growth */}
        <Card className="bg-[#FF7B79C7] border-border p-4">
          <CardContent className="p-0">
            <div className="space-y-2">
              <h3 className="text-white text-base font-medium">
                Engagement Growth
              </h3>
              <div className="text-white text-2xl font-bold">
                <span
                  className={getGrowthColor(data.engagement_growth_percentage)}
                >
                  {data.engagement_growth_percentage > 0 ? "+" : ""}
                  {data.engagement_growth_percentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Analysis Sections */}
      {data.audience_analysis && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Audience Analysis</h2>
          <p className="text-gray-300">{data.audience_analysis}</p>
        </div>
      )}

      <Separator />

      {data.engagement_analysis && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Engagement Analysis</h2>
          <p className="text-gray-300">{data.engagement_analysis}</p>
        </div>
      )}

      <Separator />

      {/* Platform Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Platform Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data.detailed_metrics || {}).map(([key, metric]) =>
            renderPlatformMetric(key, metric)
          )}
        </div>
      </div>
    </div>
  );
};

export default ViralityReportDisplay;

import React from "react";
import ViralityReportData from "./data";
import {
  formatSmartValue,
  convertSnakeCaseToTitleCase,
} from "@/helpers/formatters";

const ViralityReportPdfDownloadDesignTesting = () => {
  const data = ViralityReportData.display_data;

  // Helper function to get growth color for PDF (using dark theme colors)
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "#22C55E"; // Green
    if (growth < 0) return "#EF4444"; // Red
    return "#9CA3AF"; // Gray
  };

  // Render platform metric card matching the design for PDF
  const renderPlatformMetric = (key: string, metric: any) => {
    const formattedKey = convertSnakeCaseToTitleCase(key);

    return (
      <div key={key} className="rounded-lg p-4 space-y-3 border border-border">
        <div className="flex justify-between items-center">
          {/* Platform name */}
          <div className="text-white font-medium text-base">{formattedKey}</div>

          {/* Growth percentage */}
          {metric.status === "calculated" && metric.growth !== undefined && (
            <div
              className="text-xl font-bold"
              style={{ color: getGrowthColor(metric.growth) }}
            >
              {metric.growth > 0 ? "+" : ""}
              {metric.growth.toFixed(2)}%
            </div>
          )}
        </div>

        {/* Baseline and Recent values */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-white">
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

          {/* Progress bar */}
          <div className="w-full bg-gray-600 rounded-full h-1.5">
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${
                  metric.baseline_avg && metric.recent_avg
                    ? Math.min(
                        Math.max(
                          (metric.recent_avg / metric.baseline_avg) * 100,
                          0
                        ),
                        100
                      )
                    : 50
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#192233] text-white p-8">
      {/* PDF Design Container */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with gray background matching design */}
        <div className="bg-[#D9D9D9] text-center py-3 px-4 ">
          <h1 className="text-lg font-semibold text-black">
            Virality Analysis - {data.artist_name}
          </h1>
        </div>

        {/* Main container with dark background */}
        <div className="rounded-b-lg space-y-6">
          {/* Virality Score - Full width at top */}
          <div className="text-center space-y-2 border-border border-[2px] p-10 rounded-2xl">
            <div className="text-sm text-gray-300">
              Virality Score (out of 100)
            </div>
            <div className="text-4xl font-bold text-white">
              {data.final_score}
            </div>
          </div>

          {/* Growth Cards - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audience Growth */}
            <div className="rounded-lg p-4 space-y-2 border-border border-[2px]">
              <div className="text-[16px] font-[500] ">Audience Growth</div>
              <div
                className="text-2xl font-bold"
                style={{
                  color: getGrowthColor(data.audience_growth_percentage),
                }}
              >
                {data.audience_growth_percentage > 0 ? "+" : ""}
                {data.audience_growth_percentage.toFixed(1)}%
              </div>
            </div>

            {/* Engagement Growth */}
            <div className="rounded-lg p-4 space-y-2 border-border border-[2px]">
              <div className="text-[16px] font-[500] ">Engagement Growth</div>
              <div
                className="text-2xl font-bold"
                style={{
                  color: getGrowthColor(data.engagement_growth_percentage),
                }}
              >
                {data.engagement_growth_percentage > 0 ? "+" : ""}
                {data.engagement_growth_percentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Analysis Sections */}
          {data.audience_analysis && (
            <div className="space-y-2 bg-[#FFFFFF1A] p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">
                Audience Analysis
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {data.audience_analysis}
              </p>
            </div>
          )}

          {data.engagement_analysis && (
            <div className="space-y-2 bg-[#FFFFFF1A] p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">
                Engagement Analysis
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {data.engagement_analysis}
              </p>
            </div>
          )}

          {/* Platform Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Platform Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
              {Object.entries(data.detailed_metrics || {}).map(
                ([key, metric]) => renderPlatformMetric(key, metric)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViralityReportPdfDownloadDesignTesting;

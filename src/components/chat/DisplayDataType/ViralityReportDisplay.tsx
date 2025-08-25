import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  formatSmartValue,
  convertSnakeCaseToTitleCase,
} from "@/helpers/formatters";

interface ViralityReportData {
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

interface ViralityReportDisplayProps {
  data: ViralityReportData;
}

const ViralityReportDisplay: React.FC<ViralityReportDisplayProps> = ({
  data,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  // Helper functions for color coding based on specification
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "calculated":
        return "text-green-600";
      case "unavailable":
        return "text-orange-600";
      case "data_error":
        return "text-gray-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "calculated":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "unavailable":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "data_error":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Group metrics by category for better organization
  const audienceMetrics = Object.entries(data.detailed_metrics || {}).filter(
    ([key]) =>
      key.toLowerCase().includes("follower") ||
      key.toLowerCase().includes("subscriber") ||
      key.toLowerCase().includes("audience")
  );

  const engagementMetrics = Object.entries(data.detailed_metrics || {}).filter(
    ([key]) =>
      key.toLowerCase().includes("like") ||
      key.toLowerCase().includes("comment") ||
      key.toLowerCase().includes("share") ||
      key.toLowerCase().includes("engagement") ||
      key.toLowerCase().includes("view")
  );

  const renderMetricCard = (key: string, metric: any) => {
    const formattedKey = convertSnakeCaseToTitleCase(key);

    return (
      <Card key={key} className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(metric.status)}
              <span className="text-sm font-medium">{formattedKey}</span>
            </div>

            {metric.status === "calculated" && metric.growth !== undefined && (
              <div className="flex items-center gap-2">
                {getGrowthIcon(metric.growth)}
                <span
                  className={`text-lg font-bold ${getGrowthColor(
                    metric.growth
                  )}`}
                >
                  {metric.growth > 0 ? "+" : ""}
                  {metric.growth.toFixed(1)}%
                </span>
              </div>
            )}

            {metric.status === "unavailable" &&
              metric.recent_avg !== undefined && (
                <div>
                  <div className="text-lg font-bold text-orange-600">
                    {formatSmartValue(key, metric.recent_avg)}
                  </div>
                  <div className="text-xs text-orange-600">
                    Historical data missing
                  </div>
                </div>
              )}

            {metric.status === "data_error" && (
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Data unavailable
              </div>
            )}
          </div>
        </div>

        {metric.status === "calculated" &&
          (metric.baseline_avg !== undefined ||
            metric.recent_avg !== undefined) && (
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              {metric.baseline_avg !== undefined && (
                <div>
                  Baseline: {formatSmartValue(key, metric.baseline_avg)}
                </div>
              )}
              {metric.recent_avg !== undefined && (
                <div>Recent: {formatSmartValue(key, metric.recent_avg)}</div>
              )}
            </div>
          )}
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">{data.artist_name}</div>
            <div className="text-sm text-muted-foreground">
              Virality Analysis Report
            </div>
          </div>
          <Badge variant={data.final_score >= 70 ? "default" : "secondary"}>
            {data.verdict}
          </Badge>
        </CardTitle>

        {/* Methodology Explanation */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMethodology(!showMethodology)}
            className="text-xs text-muted-foreground"
          >
            <Info className="h-3 w-3 mr-1" />
            Methodology
            {showMethodology ? (
              <ChevronUp className="h-3 w-3 ml-1" />
            ) : (
              <ChevronDown className="h-3 w-3 ml-1" />
            )}
          </Button>

          {showMethodology && (
            <div className="mt-2 p-3 bg-muted/30 rounded text-xs text-muted-foreground">
              <p>
                Virality score is calculated based on audience growth and
                engagement metrics. Metrics are compared against historical
                baselines to determine growth percentages. Status indicators: ✓
                Calculated (green), ⚠ Unavailable (orange), ✗ Error (gray).
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        {data.summary && (
          <div className="p-4 bg-muted/20 rounded">
            <h4 className="font-semibold mb-2">Analysis Summary</h4>
            <p className="text-sm text-muted-foreground">{data.summary}</p>
          </div>
        )}

        {/* Final Score */}
        <div className="text-center">
          <div
            className={`text-5xl font-bold ${getScoreColor(data.final_score)}`}
          >
            {data.final_score}
          </div>
          <p className="text-muted-foreground">Virality Score</p>
          <p className="text-xs text-muted-foreground mt-1">
            Score formula: (Audience Growth × 0.4) + (Engagement Growth × 0.6)
          </p>
        </div>

        <Separator />

        {/* Overall Growth Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getGrowthIcon(data.audience_growth_percentage)}
                <span className="text-sm font-medium">Audience Growth</span>
              </div>
              <div
                className={`text-3xl font-bold ${getGrowthColor(
                  data.audience_growth_percentage
                )}`}
              >
                {data.audience_growth_percentage > 0 ? "+" : ""}
                {data.audience_growth_percentage.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getGrowthIcon(data.engagement_growth_percentage)}
                <span className="text-sm font-medium">Engagement Growth</span>
              </div>
              <div
                className={`text-3xl font-bold ${getGrowthColor(
                  data.engagement_growth_percentage
                )}`}
              >
                {data.engagement_growth_percentage > 0 ? "+" : ""}
                {data.engagement_growth_percentage.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics Sections */}
        {(audienceMetrics.length > 0 || engagementMetrics.length > 0) && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-between"
            >
              Detailed Metrics Breakdown
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showDetails && (
              <div className="mt-4 space-y-6">
                {/* Audience Growth Section */}
                {audienceMetrics.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Audience Growth Metrics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {audienceMetrics.map(([key, metric]) =>
                        renderMetricCard(key, metric)
                      )}
                    </div>
                  </div>
                )}

                {/* Engagement Growth Section */}
                {engagementMetrics.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Engagement Growth Metrics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {engagementMetrics.map(([key, metric]) =>
                        renderMetricCard(key, metric)
                      )}
                    </div>
                  </div>
                )}

                {/* Other Metrics */}
                {Object.entries(data.detailed_metrics || {}).filter(
                  ([key]) =>
                    !audienceMetrics.some(([aKey]) => aKey === key) &&
                    !engagementMetrics.some(([eKey]) => eKey === key)
                ).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Other Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(data.detailed_metrics || {})
                        .filter(
                          ([key]) =>
                            !audienceMetrics.some(([aKey]) => aKey === key) &&
                            !engagementMetrics.some(([eKey]) => eKey === key)
                        )
                        .map(([key, metric]) => renderMetricCard(key, metric))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ViralityReportDisplay;

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Target,
} from "lucide-react";
import ForecastChartDisplay from "./ForecastChartDisplay";

interface MultiForecastData {
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

interface MultiForecastDisplayProps {
  data: MultiForecastData;
}

const MultiForecastDisplay: React.FC<MultiForecastDisplayProps> = ({
  data,
}) => {
  const [selectedForecast, setSelectedForecast] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");
  const [expandedForecasts, setExpandedForecasts] = useState<Set<number>>(
    new Set([0])
  );

  const toggleForecast = (index: number) => {
    const newExpanded = new Set(expandedForecasts);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedForecasts(newExpanded);
  };

  const expandAll = () => {
    setExpandedForecasts(new Set(data.forecasts.map((_, index) => index)));
  };

  const collapseAll = () => {
    setExpandedForecasts(new Set());
  };

  // Calculate summary metrics for each forecast
  const forecastSummaries = data.forecasts.map((forecast, index) => {
    const historicalData = forecast.historical_data?.data || [];
    const forecastData = forecast.forecast_data?.data || [];

    const historicalAverage =
      historicalData.length > 0
        ? historicalData.reduce((sum, [, value]) => sum + value, 0) /
          historicalData.length
        : 0;

    const forecastAverage =
      forecastData.length > 0
        ? forecastData.reduce((sum, [, value]) => sum + value, 0) /
          forecastData.length
        : 0;

    const projectedChange =
      forecastData.length > 1
        ? ((forecastData[forecastData.length - 1][1] - forecastData[0][1]) /
            forecastData[0][1]) *
          100
        : 0;

    return {
      index,
      title: forecast.title,
      historicalPoints: historicalData.length,
      forecastPoints: forecastData.length,
      historicalAverage,
      forecastAverage,
      projectedChange,
      trend: projectedChange > 0 ? "up" : projectedChange < 0 ? "down" : "flat",
    };
  });

  if (!data.forecasts || data.forecasts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No forecasts available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Multi-Forecast Analysis
          </h2>
          <p className="text-muted-foreground">
            {data.forecasts.length} forecast
            {data.forecasts.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={viewMode}
            onValueChange={(value: "single" | "grid") => setViewMode(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single View</SelectItem>
              <SelectItem value="grid">Grid View</SelectItem>
            </SelectContent>
          </Select>
          {viewMode === "grid" && (
            <>
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Forecasts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forecastSummaries.map((summary) => (
          <Card
            key={summary.index}
            className={`cursor-pointer transition-all ${
              viewMode === "single" && selectedForecast === summary.index
                ? "ring-2 ring-primary shadow-md"
                : "hover:shadow-md"
            }`}
            onClick={() => {
              if (viewMode === "single") {
                setSelectedForecast(summary.index);
              } else {
                toggleForecast(summary.index);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium text-sm">{summary.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {summary.trend === "up" && (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  )}
                  {summary.trend === "down" && (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  {summary.trend === "flat" && (
                    <Target className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Historical</span>
                  <span className="font-medium">
                    {summary.historicalPoints} points
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Forecast</span>
                  <span className="font-medium">
                    {summary.forecastPoints} points
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Change</span>
                  <span
                    className={`font-medium ${
                      summary.projectedChange > 0
                        ? "text-green-600"
                        : summary.projectedChange < 0
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {summary.projectedChange > 0 ? "+" : ""}
                    {summary.projectedChange.toFixed(1)}%
                  </span>
                </div>
              </div>

              {viewMode === "single" && selectedForecast === summary.index && (
                <Badge variant="default" className="mt-2 text-xs">
                  Selected
                </Badge>
              )}

              {viewMode === "grid" && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {expandedForecasts.has(summary.index)
                      ? "Expanded"
                      : "Collapsed"}
                  </span>
                  {expandedForecasts.has(summary.index) ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Forecast Content */}
      {viewMode === "single" ? (
        /* Single View Mode */
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedForecast.toString()}
              onValueChange={(value) => setSelectedForecast(parseInt(value))}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.forecasts.map((forecast, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {forecast.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ForecastChartDisplay data={data.forecasts[selectedForecast]} />
        </div>
      ) : (
        /* Grid View Mode */
        <div className="space-y-8">
          {data.forecasts.map((forecast, index) => (
            <div key={index} className="space-y-4">
              {/* Forecast Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {forecast.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Forecast {index + 1}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {forecastSummaries[index].historicalPoints} historical +{" "}
                        {forecastSummaries[index].forecastPoints} forecast
                        points
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleForecast(index)}
                >
                  {expandedForecasts.has(index) ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Expand
                    </>
                  )}
                </Button>
              </div>

              {/* Forecast Content */}
              {expandedForecasts.has(index) && (
                <div className="pl-7 border-l-2 border-muted">
                  <ForecastChartDisplay data={forecast} />
                </div>
              )}

              {/* Separator between forecasts (except last) */}
              {index < data.forecasts.length - 1 && (
                <Separator className="mt-8" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Analysis Summary</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {viewMode === "single" ? "1" : expandedForecasts.size} of{" "}
                {data.forecasts.length} forecast
                {data.forecasts.length !== 1 ? "s" : ""} displayed
              </span>
              <span>•</span>
              <span>
                {forecastSummaries.filter((f) => f.trend === "up").length}{" "}
                trending up,{" "}
                {forecastSummaries.filter((f) => f.trend === "down").length}{" "}
                trending down
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiForecastDisplay;

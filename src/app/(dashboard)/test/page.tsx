"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Database,
  Activity,
  Sparkles,
  Calendar,
  Target,
} from "lucide-react";
import testForecastData from "@/components/foreCast";

export default function TestForecast() {
  // Time period selector state
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  // Time period options
  const timePeriodOptions = [
    { value: "all", label: "All Time" },
    { value: "1year", label: "Last Year" },
    { value: "6months", label: "Last 6 Months" },
    { value: "3months", label: "Last 3 Months" },
    { value: "1month", label: "Last Month" },
    { value: "2weeks", label: "Last 2 Weeks" },
  ];

  // Function to filter data based on selected period
  const filterDataByPeriod = (data: any[], period: string) => {
    if (period === "all") return data;

    const now = new Date();
    const cutoffDate = new Date();

    switch (period) {
      case "1year":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "6months":
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case "3months":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "1month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "2weeks":
        cutoffDate.setDate(now.getDate() - 14);
        break;
      default:
        return data;
    }

    return data.filter((item) => new Date(item.date) >= cutoffDate);
  };

  // Process historical data with additional calculations
  const processedHistoricalData =
    testForecastData.display_data.historical_data.data.map((row, index) => {
      const timestamp = row[0];
      const value = parseFloat(row[1] as string);
      const prevValue =
        index > 0
          ? parseFloat(
              testForecastData.display_data.historical_data.data[
                index - 1
              ][1] as string
            )
          : value;
      const changePercent =
        index > 0 ? ((value - prevValue) / prevValue) * 100 : 0;

      return {
        timestamp: new Date(timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "2-digit",
        }),
        date: new Date(timestamp),
        value: value,
        changePercent: changePercent,
        formattedValue:
          value >= 1e9
            ? `${(value / 1e9).toFixed(1)}B`
            : `${(value / 1e6).toFixed(1)}M`,
        isPositive: changePercent >= 0,
      };
    });

  // Apply time period filtering to historical data
  const filteredHistoricalData = filterDataByPeriod(
    processedHistoricalData,
    selectedPeriod
  );

  // Calculate average for reference line (based on filtered data)
  const historicalAverage =
    filteredHistoricalData.reduce((sum, item) => sum + item.value, 0) /
    filteredHistoricalData.length;

  // Process forecast data with additional calculations
  const processedForecastData =
    testForecastData.display_data.forecast_data.data.map((row, index) => {
      const timestamp = row[0] as string;
      const value = row[1] as number;
      const lowerBound = row[2] as number;
      const upperBound = row[3] as number;

      // Calculate confidence interval width
      const confidenceWidth = upperBound - lowerBound;
      const confidencePercent = (confidenceWidth / value) * 100;

      // Calculate trend from previous point
      const prevValue =
        index > 0
          ? (testForecastData.display_data.forecast_data.data[
              index - 1
            ][1] as number)
          : value;
      const trendPercent =
        index > 0 ? ((value - prevValue) / prevValue) * 100 : 0;

      return {
        timestamp: new Date(timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "2-digit",
        }),
        date: new Date(timestamp),
        value: value,
        forecast_lower_bound: lowerBound,
        forecast_upper_bound: upperBound,
        confidenceWidth: confidenceWidth,
        confidencePercent: confidencePercent,
        trendPercent: trendPercent,
        isUptrend: trendPercent > 0,
        formattedValue:
          value >= 1e9
            ? `${(value / 1e9).toFixed(1)}B`
            : `${(value / 1e6).toFixed(1)}M`,
      };
    });

  // Calculate forecast metrics
  const hasConfidenceInterval = processedForecastData.some(
    (point) =>
      point.forecast_lower_bound !== null && point.forecast_upper_bound !== null
  );

  const projectedChange =
    processedForecastData.length > 1
      ? ((processedForecastData[processedForecastData.length - 1]?.value -
          processedForecastData[0]?.value) /
          processedForecastData[0]?.value) *
        100
      : 0;

  // Calculate average confidence interval coverage (percentage of points with confidence bounds)
  const confidenceIntervalCoverage =
    (processedForecastData.filter(
      (point) =>
        point.forecast_lower_bound !== null &&
        point.forecast_upper_bound !== null
    ).length /
      processedForecastData.length) *
    100;

  // Calculate average forecast value
  const forecastAverage =
    processedForecastData.reduce((sum, item) => sum + item.value, 0) /
    processedForecastData.length;

  // Chart configurations
  const historicalChartConfig = {
    value: {
      label: "Historical Plays",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const forecastChartConfig = {
    value: {
      label: "Value",
      color: "hsl(var(--chart-1))",
    },
    forecast_upper_bound: {
      label: "Upper",
      color: "hsl(var(--chart-2))",
    },
    forecast_lower_bound: {
      label: "Lower",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Forecast Chart Test
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Testing forecast chart components with real data structure and
            enhanced visualizations
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Database className="w-4 h-4 mr-1" />
              Historical Data
            </Badge>
            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
              <TrendingUp className="w-4 h-4 mr-1" />
              Forecast Analysis
            </Badge>
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
              <Activity className="w-4 h-4 mr-1" />
              Real-time Charts
            </Badge>
          </div>
        </div>

        {/* Debug Data Display */}
        {/* <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-800">
              Raw Data Structure
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <BarChart3 className="w-5 h-5" />
                  Historical Data Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                  <pre className="text-xs overflow-auto text-slate-700 font-mono">
                    {JSON.stringify(
                      testForecastData.display_data.historical_data,
                      null,
                      2
                    )}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <TrendingUp className="w-5 h-5" />
                  Forecast Data Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-indigo-200">
                  <pre className="text-xs overflow-auto text-slate-700 font-mono">
                    {JSON.stringify(
                      testForecastData.display_data.forecast_data,
                      null,
                      2
                    )}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div> */}

        {/* Processed Data Display */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Processed Historical Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(processedHistoricalData, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processed Forecast Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(processedForecastData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div> */}

        {/* Charts Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-800">
              Chart Visualizations
            </h2>
          </div>

          {/* Historical Chart */}
          <Card className="border-0 shadow-xl bg-background hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-col items-stretch border-b space-y-4">
              {/* Enhanced Title and Period Selector Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-primary">
                      Historical Data Analysis
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Showing {filteredHistoricalData.length} data points over{" "}
                      {selectedPeriod === "all"
                        ? "all time"
                        : timePeriodOptions
                            .find((opt) => opt.value === selectedPeriod)
                            ?.label.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Enhanced Period Selector */}
                <div className="flex items-center gap-3 bg-background rounded-lg px-4 py-2 border border-primary">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Time Period:
                  </span>
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger className="w-36 border-0 bg-secondary shadow-sm">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {timePeriodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="flex">
                <div className="flex flex-1 flex-col justify-center gap-2 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground text-xs font-medium">
                      Average Value
                    </span>
                  </div>
                  <span className="text-lg leading-none font-bold sm:text-2xl text-primary">
                    {historicalAverage >= 1e9
                      ? `${(historicalAverage / 1e9).toFixed(1)}B`
                      : historicalAverage >= 1e6
                      ? `${(historicalAverage / 1e6).toFixed(1)}M`
                      : historicalAverage >= 1e3
                      ? `${(historicalAverage / 1e3).toFixed(1)}K`
                      : historicalAverage.toFixed(0)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-center gap-2 border-t border-l px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground text-xs font-medium">
                      Data Points
                    </span>
                  </div>
                  <span className="text-lg leading-none font-bold sm:text-2xl text-primary">
                    {filteredHistoricalData.length}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={historicalChartConfig}
                className="aspect-auto h-[300px] w-full"
              >
                <AreaChart data={filteredHistoricalData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="timestamp"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    fontSize={12}
                  />
                  <YAxis
                    domain={[0, "dataMax + 5000000000"]}
                    tickFormatter={(value) => {
                      const absValue = Math.abs(value);
                      const sign = value < 0 ? "-" : "";

                      if (absValue >= 1e9)
                        return `${sign}${(absValue / 1e9).toFixed(1)}B`;
                      if (absValue >= 1e6)
                        return `${sign}${(absValue / 1e6).toFixed(1)}M`;
                      if (absValue >= 1e3)
                        return `${sign}${(absValue / 1e3).toFixed(1)}K`;
                      return value.toString();
                    }}
                    fontSize={12}
                  />

                  {/* Average reference line */}
                  <ReferenceLine
                    y={historicalAverage}
                    stroke="#64748b"
                    strokeDasharray="5 5"
                    label={{ value: "Avg", position: "top", fontSize: 10 }}
                  />

                  <ChartTooltip
                    cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value: any, name: any) => {
                          if (typeof value === "number") {
                            const absValue = Math.abs(value);
                            const sign = value < 0 ? "-" : "";

                            if (absValue >= 1e9)
                              return [
                                `${sign}${(absValue / 1e9).toFixed(2)}B`,
                                name,
                              ];
                            if (absValue >= 1e6)
                              return [
                                `${sign}${(absValue / 1e6).toFixed(2)}M`,
                                name,
                              ];
                            return [value.toLocaleString(), name];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="var(--chart-1)"
                    fillOpacity={0.1}
                    dot={false}
                    activeDot={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Forecast Chart */}
          <Card className="border-0 shadow-xl bg-background hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-col items-stretch border-b space-y-4">
              {/* Enhanced Title and Forecast Type Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-primary">
                      Forecast Data Analysis
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Showing {processedForecastData.length} forecast points
                      with{" "}
                      <span className="font-semibold text-primary">
                        {hasConfidenceInterval
                          ? "confidence intervals"
                          : "trend analysis"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Forecast Type Indicator */}
                <div className="flex items-center gap-3 bg-secondary rounded-lg px-4 py-2 border">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Forecast Type:
                  </span>
                  <div className="text-sm font-semibold text-primary">
                    {hasConfidenceInterval ? "With Bounds" : "Trend Only"}
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="flex">
                <div className="flex flex-1 flex-col justify-center gap-2 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground text-xs font-medium">
                      Average Forecast
                    </span>
                  </div>
                  <span className="text-lg leading-none font-bold sm:text-2xl text-primary">
                    {forecastAverage >= 1e9
                      ? `${(forecastAverage / 1e9).toFixed(1)}B`
                      : forecastAverage >= 1e6
                      ? `${(forecastAverage / 1e6).toFixed(1)}M`
                      : forecastAverage >= 1e3
                      ? `${(forecastAverage / 1e3).toFixed(1)}K`
                      : forecastAverage.toFixed(0)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-center gap-2 border-t border-l px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground text-xs font-medium">
                      Confidence
                    </span>
                  </div>
                  <span className="text-lg leading-none font-bold sm:text-2xl text-primary">
                    {confidenceIntervalCoverage.toFixed(0)}%
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-center gap-2 border-t border-l px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground text-xs font-medium">
                      Projected Change
                    </span>
                  </div>
                  <div
                    className={`text-lg leading-none font-bold sm:text-2xl flex items-center gap-1 ${
                      projectedChange >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {projectedChange >= 0 ? "↗" : "↘"}{" "}
                    {Math.abs(projectedChange).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={forecastChartConfig}
                className="aspect-auto h-[300px] w-full"
              >
                <AreaChart data={processedForecastData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                  />
                  <YAxis
                    domain={[0, "dataMax + 5000000000"]}
                    tickFormatter={(value) => {
                      const absValue = Math.abs(value);
                      const sign = value < 0 ? "-" : "";

                      if (absValue >= 1e9)
                        return `${sign}${(absValue / 1e9).toFixed(1)}B`;
                      if (absValue >= 1e6)
                        return `${sign}${(absValue / 1e6).toFixed(1)}M`;
                      if (absValue >= 1e3)
                        return `${sign}${(absValue / 1e3).toFixed(1)}K`;
                      return value.toString();
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value: any, name: any) => {
                          // Format the value with negative support
                          let formattedValue;
                          if (typeof value === "number") {
                            const absValue = Math.abs(value);
                            const sign = value < 0 ? "-" : "";

                            if (absValue >= 1e9) {
                              formattedValue = `${sign}${(
                                absValue / 1e9
                              ).toFixed(2)}B`;
                            } else if (absValue >= 1e6) {
                              formattedValue = `${sign}${(
                                absValue / 1e6
                              ).toFixed(2)}M`;
                            } else {
                              formattedValue = value.toLocaleString();
                            }
                          } else {
                            formattedValue = value;
                          }

                          // Convert technical names to user-friendly labels
                          let displayName = name;
                          if (name === "value") displayName = " Value";
                          else if (name === "forecast_upper_bound")
                            displayName = " Upper";
                          else if (name === "forecast_lower_bound")
                            displayName = " Lower";

                          return [formattedValue, displayName];
                        }}
                      />
                    }
                  />

                  {/* Upper bound area (lightest) */}
                  <Area
                    dataKey="forecast_upper_bound"
                    type="monotone"
                    fill="var(--chart-3)"
                    fillOpacity={0.3}
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />

                  {/* Lower bound area */}
                  <Area
                    dataKey="forecast_lower_bound"
                    type="monotone"
                    fill="var(--chart-2)"
                    fillOpacity={0.3}
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />

                  {/* Main forecast value (most prominent) */}
                  <Area
                    dataKey="value"
                    type="monotone"
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

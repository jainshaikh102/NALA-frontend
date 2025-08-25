import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Database,
  Calendar,
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface ForecastChartData {
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

interface ChartDataPoint {
  date: Date;
  timestamp: string;
  value: number;
  formattedValue: string;
}

interface ForecastChartDisplayProps {
  data: ForecastChartData;
}

const ForecastChartDisplay: React.FC<ForecastChartDisplayProps> = ({
  data,
}) => {
  const [showDetails, setShowDetails] = useState(false);
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
  const filterDataByPeriod = (data: ChartDataPoint[], period: string) => {
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

  // Process historical and forecast data separately using the working logic from test page
  const { historicalData, forecastData, filteredHistoricalData } =
    useMemo(() => {
      // Process historical data
      const processedHistorical = (data.historical_data?.data || [])
        .map(([timestamp, value]) => {
          const numValue =
            typeof value === "number" ? value : parseFloat(String(value));
          return {
            timestamp: new Date(timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "2-digit",
            }),
            date: new Date(timestamp),
            value: numValue,
            formattedValue:
              numValue >= 1e9
                ? `${(numValue / 1e9).toFixed(1)}B`
                : numValue >= 1e6
                ? `${(numValue / 1e6).toFixed(1)}M`
                : numValue >= 1e3
                ? `${(numValue / 1e3).toFixed(1)}K`
                : numValue.toFixed(0),
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Process forecast data using the working logic from test page
      const processedForecast = (data.forecast_data?.data || [])
        .map(([timestamp, value, lowerBound, upperBound]) => {
          const numValue =
            typeof value === "number" ? value : parseFloat(String(value));
          const numLowerBound =
            typeof lowerBound === "number"
              ? lowerBound
              : lowerBound
              ? parseFloat(String(lowerBound))
              : null;
          const numUpperBound =
            typeof upperBound === "number"
              ? upperBound
              : upperBound
              ? parseFloat(String(upperBound))
              : null;

          return {
            timestamp: new Date(timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "2-digit",
            }),
            date: new Date(timestamp),
            value: numValue,
            forecast_lower_bound: numLowerBound,
            forecast_upper_bound: numUpperBound,
            formattedValue:
              numValue >= 1e9
                ? `${(numValue / 1e9).toFixed(1)}B`
                : numValue >= 1e6
                ? `${(numValue / 1e6).toFixed(1)}M`
                : numValue >= 1e3
                ? `${(numValue / 1e3).toFixed(1)}K`
                : numValue.toFixed(0),
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Apply time period filtering to historical data
      const filteredHistorical = filterDataByPeriod(
        processedHistorical,
        selectedPeriod
      );

      return {
        historicalData: processedHistorical,
        forecastData: processedForecast,
        filteredHistoricalData: filteredHistorical,
      };
    }, [data, selectedPeriod]);

  // Calculate metrics for display using filtered data
  const historicalAverage =
    filteredHistoricalData.length > 0
      ? filteredHistoricalData.reduce((sum, item) => sum + item.value, 0) /
        filteredHistoricalData.length
      : 0;

  const forecastAverage =
    forecastData.length > 0
      ? forecastData.reduce((sum, item) => sum + item.value, 0) /
        forecastData.length
      : 0;

  const hasConfidenceInterval = forecastData.some(
    (point) =>
      point.forecast_lower_bound !== null && point.forecast_upper_bound !== null
  );

  const projectedChange =
    forecastData.length > 1
      ? ((forecastData[forecastData.length - 1]?.value -
          forecastData[0]?.value) /
          forecastData[0]?.value) *
        100
      : 0;

  // Chart configurations using the working logic from test page
  const historicalChartConfig = {
    value: {
      label: data.y_axis_label || "Historical Value",
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

  // Render historical data chart using the working logic from test page
  const renderHistoricalChart = () => {
    if (historicalData.length === 0) return null;

    return (
      <Card className="border-0 shadow-xl bg-background hover:shadow-2xl transition-all duration-500">
        <CardHeader className="flex flex-col items-stretch border-b space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl text-primary">
                  Historical Data Analysis
                </CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={historicalChartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart
              data={filteredHistoricalData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                className="text-xs fill-white"
                angle={-45}
                textAnchor="end"
                height={60}
                tickMargin={8}
                minTickGap={32}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => {
                  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
                  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                  return value.toString();
                }}
                fontSize={12}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[200px]"
                    nameKey="value"
                    labelFormatter={(value) => `Date: ${value}`}
                    formatter={(value, name) => [
                      typeof value === "number"
                        ? value >= 1e9
                          ? `${(value / 1e9).toFixed(2)}B`
                          : value >= 1e6
                          ? `${(value / 1e6).toFixed(2)}M`
                          : value >= 1e3
                          ? `${(value / 1e3).toFixed(2)}K`
                          : value.toLocaleString()
                        : value,
                      data.y_axis_label || "Value",
                    ]}
                  />
                }
              />
              <Area
                dataKey="value"
                type="monotone"
                fill="var(--chart-1)"
                fillOpacity={0.1}
                stroke="var(--chart-1)"
                strokeWidth={1}
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{data.title}</h2>
          <p className="text-muted-foreground">
            Forecast analysis with historical context
          </p>
        </div>

        <div className="flex items-center gap-3 bg-secondary rounded-lg px-4 py-2 border">
          <Calendar className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">Time Period:</span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredHistoricalData.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Historical Points
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {forecastData.length}
            </div>
            <div className="text-sm text-muted-foreground">Forecast Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {historicalAverage >= 1e9
                ? `${(historicalAverage / 1e9).toFixed(1)}B`
                : historicalAverage >= 1e6
                ? `${(historicalAverage / 1e6).toFixed(1)}M`
                : historicalAverage >= 1e3
                ? `${(historicalAverage / 1e3).toFixed(1)}K`
                : historicalAverage.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">Historical Avg</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              {projectedChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : projectedChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : null}
              <span
                className={`text-2xl font-bold ${
                  projectedChange > 0
                    ? "text-green-600"
                    : projectedChange < 0
                    ? "text-red-600"
                    : "text-primary"
                }`}
              >
                {projectedChange > 0 ? "+" : ""}
                {projectedChange.toFixed(1)}%
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Projected Change
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Historical Chart */}
        {renderHistoricalChart()}

        {/* Forecast Chart */}
        {forecastData.length > 0 && (
          <Card className="border-0 shadow-xl bg-background hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-col items-stretch border-b space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-primary">
                      Forecast Data Analysis
                    </CardTitle>
                  </div>
                </div>
              </div>

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
                      Data Points
                    </span>
                  </div>
                  <span className="text-lg leading-none font-bold sm:text-2xl text-primary">
                    {forecastData.length}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-center gap-2 border-t border-l px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
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
                className="h-[300px] w-full"
              >
                <AreaChart
                  data={forecastData}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="timestamp"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tickMargin={8}
                    minTickGap={32}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                    tickFormatter={(value) => {
                      if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
                      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                      return value.toString();
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[250px]"
                        labelFormatter={(value) => `Date: ${value}`}
                        formatter={(value: unknown, name: unknown) => {
                          let formattedValue: string;
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
                            formattedValue = String(value);
                          }

                          let displayName: string = String(name);
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

                  <ChartLegend content={<ChartLegendContent />} />

                  {/* Upper bound area (lightest) */}
                  <Area
                    dataKey="forecast_upper_bound"
                    type="monotone"
                    fill="var(--chart-3)"
                    fillOpacity={0.1}
                    stroke="var(--chart-3)"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />

                  {/* Lower bound area */}
                  <Area
                    dataKey="forecast_lower_bound"
                    type="monotone"
                    fill="var(--chart-2)"
                    fillOpacity={0.1}
                    stroke="var(--chart-2)"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />

                  {/* Main forecast value (most prominent) */}
                  <Area
                    dataKey="value"
                    type="monotone"
                    fill="var(--chart-1)"
                    fillOpacity={0.001}
                    stroke="var(--chart-1)"
                    strokeWidth={3}
                    dot={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Details Section */}
      <div>
        <Button
          variant="ghost"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full justify-between"
        >
          Technical Details
          {showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {showDetails && (
          <div className="mt-4 p-4 bg-muted/20 rounded space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">Historical Data</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Total data points: {historicalData.length}</li>
                  <li>• Filtered points: {filteredHistoricalData.length}</li>
                  <li>• Average value: {historicalAverage.toLocaleString()}</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Forecast Data</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Forecast points: {forecastData.length}</li>
                  <li>
                    • Average forecast: {forecastAverage.toLocaleString()}
                  </li>
                  <li>
                    • Confidence interval:{" "}
                    {hasConfidenceInterval ? "Available" : "Not available"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastChartDisplay;

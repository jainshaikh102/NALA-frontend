import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  Music,
  Users,
  Star,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatNumber,
  formatNumberCompact,
  convertSnakeCaseToTitleCase,
  parseTimestamp,
  formatTimestamp,
  validateDataStructure,
  logError,
  logWarning,
  getStatusColor,
  getGrowthColor,
  openInNewTab,
  formatPlatformName,
} from "@/helpers/formatters";

// Local Error Handling Utilities (UI-specific)

const createDataUnavailablePlaceholder = (
  message: string = "Data unavailable"
) => (
  <div className="p-4 bg-muted/20 rounded border border-dashed border-muted-foreground/30">
    <div className="flex items-center gap-2 text-muted-foreground">
      <AlertTriangle className="h-4 w-4" />
      <span className="text-sm">{message}</span>
    </div>
  </div>
);

const createMalformedDataFallback = (data: any, context: string) => {
  logError(
    "Malformed data detected",
    `Invalid data structure in ${context}`,
    data
  );

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">
            Data Structure Issue
          </span>
        </div>
        <p className="text-sm text-orange-700 mb-3">
          The data received doesn't match the expected format. Raw data is shown
          below:
        </p>
        <details className="group">
          <summary className="cursor-pointer text-sm text-orange-600 hover:text-orange-800 flex items-center gap-1">
            <ChevronDown className="h-3 w-3 group-open:rotate-180 transition-transform" />
            View Raw Data
          </summary>
          <pre className="mt-2 p-2 bg-orange-100 rounded text-xs overflow-auto max-h-40 text-orange-900">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

// Interface definitions
interface DataFrameData {
  dataframe: {
    index: number[];
    columns: string[];
    data: (string | number)[][];
  };
}

interface KeyValueData {
  data: {
    [key: string]: string | number;
  };
}

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

interface PlaylistRecommendationData {
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

interface MultiForecastDisplayData {
  forecasts: Array<{
    platform: string;
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

// Enhanced interface for complex responses with multiple data types
interface ComplexResponseData {
  primary_data?: unknown;
  secondary_data?: unknown[];
  metadata?: {
    data_types: string[];
    section_titles?: string[];
  };
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
// Implements specification: sortable/searchable table, number formatting, responsive design
export const DataFrameDisplay: React.FC<{ data: DataFrameData }> = ({
  data,
}) => {
  // Validate data structure
  if (
    !validateDataStructure(data, ["dataframe.columns", "dataframe.data"]) &&
    !validateDataStructure(data, ["columns", "data"])
  ) {
    return createMalformedDataFallback(data, "DataFrameDisplay");
  }

  const tableData = data.dataframe || data; // Handle both new and legacy data structures

  // Additional validation for table data
  if (
    !tableData.columns ||
    !Array.isArray(tableData.columns) ||
    !tableData.data ||
    !Array.isArray(tableData.data)
  ) {
    return createDataUnavailablePlaceholder("Table data is missing or invalid");
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: number;
    direction: "asc" | "desc";
  } | null>(null);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filteredData = tableData.data;

    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter((row) =>
        row.some((cell) =>
          String(cell).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig) {
      filteredData = [...filteredData].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        // Handle numeric sorting
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        // Handle string sorting
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  }, [tableData.data, searchTerm, sortConfig]);

  const handleSort = (columnIndex: number) => {
    setSortConfig((current) => {
      if (current?.key === columnIndex) {
        // Toggle direction or clear sort
        if (current.direction === "asc") {
          return { key: columnIndex, direction: "desc" };
        } else {
          return null; // Clear sort
        }
      } else {
        // New column sort
        return { key: columnIndex, direction: "asc" };
      }
    });
  };

  const getSortIcon = (columnIndex: number) => {
    if (sortConfig?.key === columnIndex) {
      return sortConfig.direction === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      );
    }
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search table..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="w-full max-w-[90vw] lg:max-w-[55vw] overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="w-full bg-background">
          <div className="p-0 bg-background">
            <div className="min-w-fit bg-background">
              <Table className="w-full bg-background">
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-b bg-muted/50">
                    {tableData.columns.map((column, index) => (
                      <TableHead
                        key={index}
                        className="text-left p-2 font-medium text-muted-foreground whitespace-nowrap min-w-[100px] max-w-[150px] bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                        style={{ width: index === 0 ? "120px" : "100px" }}
                        onClick={() => handleSort(index)}
                      >
                        <div
                          className="flex items-center gap-2 truncate"
                          title={column}
                        >
                          <span className="truncate">{column}</span>
                          {getSortIcon(index)}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-background">
                  {processedData.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className="border-b bg-background hover:bg-muted/30 transition-colors"
                    >
                      {row.map((cell, cellIndex) => (
                        <TableCell
                          key={cellIndex}
                          className="p-2 whitespace-nowrap min-w-[100px] max-w-[150px] bg-background"
                          style={{ width: cellIndex === 0 ? "120px" : "100px" }}
                        >
                          <div className="truncate" title={String(cell)}>
                            {cellIndex === 0 ? (
                              <span className="font-medium">{cell}</span>
                            ) : (
                              <span className="text-muted-foreground">
                                {formatNumber(cell)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          Showing {processedData.length} of {tableData.data.length} rows
        </div>
      )}
    </div>
  );
};

// Key-Value Display Component (Metrics)
// Implements specification: responsive grid (5 columns/row), number formatting, snake_case to Title Case
export const KeyValueDisplay: React.FC<{ data: KeyValueData }> = ({ data }) => {
  // Validate data structure
  if (!validateDataStructure(data, ["data"]) && !data) {
    return createMalformedDataFallback(data, "KeyValueDisplay");
  }

  const metricsData = data.data || data; // Handle both new and legacy data structures

  // Additional validation for metrics data
  if (!metricsData || typeof metricsData !== "object") {
    return createDataUnavailablePlaceholder(
      "Metrics data is missing or invalid"
    );
  }

  const entries = Object.entries(metricsData);
  if (entries.length === 0) {
    return createDataUnavailablePlaceholder("No metrics data available");
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {entries.map(([key, value], index) => {
        const formattedLabel = convertSnakeCaseToTitleCase(key);
        const formattedValue = formatNumber(value);

        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {formattedValue}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formattedLabel}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Virality Report Display Component
// Implements specification: artist header, methodology, audience/engagement growth, detailed metrics with status handling, color coding
export const ViralityReportDisplay: React.FC<{ data: ViralityReportData }> = ({
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
                    {formatNumber(metric.recent_avg)}
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
                <div>Baseline: {formatNumber(metric.baseline_avg)}</div>
              )}
              {metric.recent_avg !== undefined && (
                <div>Recent: {formatNumber(metric.recent_avg)}</div>
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

// Playlist Recommendation Display Component
// Implements specification: track/artist header, summary, expandable cards, follower formatting, score badges, clickable URLs, reasoning bullets
export const PlaylistRecommendationDisplay: React.FC<{
  data: PlaylistRecommendationData;
}> = ({ data }) => {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default"; // High score
    if (score >= 70) return "secondary"; // Medium score
    return "outline"; // Lower score
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-orange-600";
  };

  const getPlatformIcon = (platform: string) => {
    // You could add specific platform icons here
    return <Music className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          <div>
            <div className="text-xl font-bold">{data.track_name}</div>
            <div className="text-sm text-muted-foreground">
              by {data.artist_name}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        {data.summary && (
          <div className="p-4 bg-muted/20 rounded">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Analysis Summary
            </h4>
            <p className="text-sm text-muted-foreground">{data.summary}</p>
          </div>
        )}

        {/* Recommendations Overview */}
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Playlist Recommendations</h4>
          <Badge variant="outline">
            {data.recommendations.length} playlists found
          </Badge>
        </div>

        {/* Recommendation Cards */}
        <div className="space-y-4">
          {data.recommendations.map((rec, index) => (
            <Card
              key={index}
              className="transition-all duration-200 hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getPlatformIcon(rec.platform)}
                      <h5 className="font-semibold text-lg">
                        {rec.playlist_name}
                      </h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Curated by {rec.curator_name} • {rec.platform}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatNumber(rec.playlist_followers)} followers
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={getScoreBadgeVariant(rec.recommendation_score)}
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3" />
                      <span className={getScoreColor(rec.recommendation_score)}>
                        {rec.recommendation_score.toFixed(1)}
                      </span>
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(rec.playlist_url, "_blank")}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Playlist
                    </Button>
                  </div>
                </div>

                {/* Reasoning Section (Expandable) */}
                {rec.reasoning && Object.keys(rec.reasoning).length > 0 && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCard(index)}
                      className="w-full justify-between text-sm"
                    >
                      <span>Why this playlist?</span>
                      {expandedCards.has(index) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>

                    {expandedCards.has(index) && (
                      <div className="mt-3 p-3 bg-muted/30 rounded">
                        <h6 className="font-medium text-sm mb-2">
                          Recommendation Reasoning:
                        </h6>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {Object.entries(rec.reasoning).map(
                            ([factor, explanation], reasonIndex) => (
                              <li
                                key={reasonIndex}
                                className="flex items-start gap-2"
                              >
                                <span className="text-primary mt-1">•</span>
                                <div>
                                  <span className="font-medium text-foreground">
                                    {convertSnakeCaseToTitleCase(factor)}:
                                  </span>{" "}
                                  {explanation}
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        {data.recommendations.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {data.recommendations.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Playlists
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatNumber(
                  data.recommendations.reduce(
                    (sum, rec) => sum + rec.playlist_followers,
                    0
                  )
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Reach</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {(
                  data.recommendations.reduce(
                    (sum, rec) => sum + rec.recommendation_score,
                    0
                  ) / data.recommendations.length
                ).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Multi-Forecast Display Component
// Implements specification: multiple platform forecasts, platform subtitles, forecast_chart rendering, visual dividers
export const MultiForecastDisplay: React.FC<{
  data: MultiForecastDisplayData;
}> = ({ data }) => {
  const getPlatformIcon = (platform: string) => {
    // You could add specific platform icons here based on platform name
    switch (platform.toLowerCase()) {
      case "spotify":
        return <Music className="h-5 w-5 text-green-600" />;
      case "youtube":
        return <Music className="h-5 w-5 text-red-600" />;
      case "apple":
      case "apple music":
        return <Music className="h-5 w-5 text-gray-600" />;
      case "soundcloud":
        return <Music className="h-5 w-5 text-orange-600" />;
      default:
        return <Music className="h-5 w-5 text-primary" />;
    }
  };

  const formatPlatformName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Multi-Platform Forecast Analysis
        </h2>
        <p className="text-muted-foreground">
          Comparative forecasts across {data.forecasts.length} platforms
        </p>
      </div>

      {/* Platform Forecasts */}
      <div className="space-y-10">
        {data.forecasts.map((forecast, index) => (
          <div key={index}>
            {/* Platform Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {getPlatformIcon(forecast.platform)}
                <h3 className="text-xl font-semibold text-foreground">
                  {formatPlatformName(forecast.platform)} Forecast
                </h3>
              </div>
              <div className="h-px bg-border"></div>
            </div>

            {/* Forecast Chart */}
            <div className="mb-6">
              <ForecastChartDisplay
                data={
                  {
                    title: forecast.title,
                    y_axis_label: forecast.y_axis_label,
                    historical_data: forecast.historical_data,
                    forecast_data: forecast.forecast_data,
                  } as ForecastChartData
                }
              />
            </div>

            {/* Visual Divider (except for last forecast) */}
            {index < data.forecasts.length - 1 && (
              <div className="flex items-center justify-center py-6">
                <Separator className="flex-1" />
                <div className="px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
                    <div className="w-2 h-2 bg-muted-foreground/20 rounded-full"></div>
                    <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
                  </div>
                </div>
                <Separator className="flex-1" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      {data.forecasts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cross-Platform Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {data.forecasts.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Platforms Analyzed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {data.forecasts.reduce(
                    (sum, forecast) =>
                      sum + (forecast.historical_data?.data?.length || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Historical Points
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {data.forecasts.reduce(
                    (sum, forecast) =>
                      sum + (forecast.forecast_data?.data?.length || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Forecast Points
                </div>
              </div>
            </div>

            {/* Platform List */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-3">Platforms Included:</h4>
              <div className="flex flex-wrap gap-2">
                {data.forecasts.map((forecast, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {getPlatformIcon(forecast.platform)}
                    {formatPlatformName(forecast.platform)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Forecast Chart Display Component
// Implements specification: time-series visualization with historical/forecast data and confidence intervals
export const ForecastChartDisplay: React.FC<{ data: ForecastChartData }> = ({
  data,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Process and format the data
  const processedData = useMemo(() => {
    const historical = data.historical_data?.data || [];
    const forecast = data.forecast_data?.data || [];

    // Convert timestamps and prepare data points
    const historicalPoints = historical.map(([timestamp, value]) => ({
      timestamp: new Date(timestamp).toLocaleDateString(),
      value: typeof value === "number" ? value : parseFloat(String(value)),
      type: "historical" as const,
    }));

    const forecastPoints = forecast.map(
      ([timestamp, value, predLow, predHigh]) => ({
        timestamp: new Date(timestamp).toLocaleDateString(),
        value: typeof value === "number" ? value : parseFloat(String(value)),
        predLow: predLow
          ? typeof predLow === "number"
            ? predLow
            : parseFloat(String(predLow))
          : undefined,
        predHigh: predHigh
          ? typeof predHigh === "number"
            ? predHigh
            : parseFloat(String(predHigh))
          : undefined,
        type: "forecast" as const,
      })
    );

    // Calculate min/max for scaling
    const allValues = [
      ...historicalPoints.map((p) => p.value),
      ...forecastPoints.map((p) => p.value),
      ...forecastPoints.filter((p) => p.predLow).map((p) => p.predLow!),
      ...forecastPoints.filter((p) => p.predHigh).map((p) => p.predHigh!),
    ].filter((v) => !isNaN(v));

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue;
    const padding = range * 0.1;

    return {
      historical: historicalPoints,
      forecast: forecastPoints,
      minValue: minValue - padding,
      maxValue: maxValue + padding,
      hasConfidenceInterval: forecastPoints.some(
        (p) => p.predLow !== undefined && p.predHigh !== undefined
      ),
    };
  }, [data]);

  // Simple SVG-based chart visualization
  const renderChart = () => {
    const chartWidth = 600;
    const chartHeight = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const plotWidth = chartWidth - margin.left - margin.right;
    const plotHeight = chartHeight - margin.top - margin.bottom;

    const allPoints = [...processedData.historical, ...processedData.forecast];
    const xScale = (index: number) =>
      (index / (allPoints.length - 1)) * plotWidth;
    const yScale = (value: number) =>
      plotHeight -
      ((value - processedData.minValue) /
        (processedData.maxValue - processedData.minValue)) *
        plotHeight;

    return (
      <div className="w-full overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="border rounded">
          {/* Background */}
          <rect
            width={chartWidth}
            height={chartHeight}
            fill="hsl(var(--background))"
          />

          {/* Chart area */}
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <g key={ratio}>
                <line
                  x1={0}
                  y1={ratio * plotHeight}
                  x2={plotWidth}
                  y2={ratio * plotHeight}
                  stroke="hsl(var(--muted))"
                  strokeWidth={0.5}
                />
              </g>
            ))}

            {/* Confidence interval (shaded area) */}
            {processedData.hasConfidenceInterval && (
              <path
                d={
                  processedData.forecast
                    .filter(
                      (p) => p.predLow !== undefined && p.predHigh !== undefined
                    )
                    .map((point, index) => {
                      const x = xScale(processedData.historical.length + index);
                      const yLow = yScale(point.predLow!);
                      const yHigh = yScale(point.predHigh!);
                      return index === 0
                        ? `M ${x} ${yLow} L ${x} ${yHigh}`
                        : `L ${x} ${yHigh}`;
                    })
                    .join(" ") +
                  processedData.forecast
                    .filter(
                      (p) => p.predLow !== undefined && p.predHigh !== undefined
                    )
                    .reverse()
                    .map((point, index) => {
                      const x = xScale(
                        processedData.historical.length +
                          processedData.forecast.length -
                          1 -
                          index
                      );
                      const yLow = yScale(point.predLow!);
                      return `L ${x} ${yLow}`;
                    })
                    .join(" ") +
                  " Z"
                }
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            )}

            {/* Historical data line (gray) */}
            <path
              d={processedData.historical
                .map((point, index) => {
                  const x = xScale(index);
                  const y = yScale(point.value);
                  return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                })
                .join(" ")}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              fill="none"
            />

            {/* Forecast data line (blue) */}
            <path
              d={processedData.forecast
                .map((point, index) => {
                  const x = xScale(processedData.historical.length + index);
                  const y = yScale(point.value);
                  return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                })
                .join(" ")}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="none"
            />

            {/* Data points */}
            {allPoints.map((point, index) => (
              <circle
                key={index}
                cx={xScale(index)}
                cy={yScale(point.value)}
                r={3}
                fill={
                  point.type === "historical"
                    ? "hsl(var(--muted-foreground))"
                    : "hsl(var(--primary))"
                }
              />
            ))}
          </g>

          {/* Y-axis label */}
          <text
            x={20}
            y={chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 20, ${chartHeight / 2})`}
            className="text-sm fill-muted-foreground"
          >
            {data.y_axis_label}
          </text>

          {/* X-axis label */}
          <text
            x={chartWidth / 2}
            y={chartHeight - 10}
            textAnchor="middle"
            className="text-sm fill-muted-foreground"
          >
            Time
          </text>
        </svg>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{data.title || "Forecast Chart"}</span>
          <div className="flex items-center gap-4 text-sm">
            {/* Legend */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-muted-foreground"></div>
              <span className="text-muted-foreground">Historical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-primary"></div>
              <span className="text-muted-foreground">Forecast</span>
            </div>
            {processedData.hasConfidenceInterval && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-primary/20 border border-primary/40"></div>
                <span className="text-muted-foreground">Confidence</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        {renderChart()}

        {/* Data Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-muted-foreground">
              Historical Points
            </div>
            <div className="text-lg font-bold">
              {processedData.historical.length}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-muted-foreground">
              Forecast Points
            </div>
            <div className="text-lg font-bold">
              {processedData.forecast.length}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-muted-foreground">Min Value</div>
            <div className="text-lg font-bold">
              {formatNumber(processedData.minValue)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-muted-foreground">Max Value</div>
            <div className="text-lg font-bold">
              {formatNumber(processedData.maxValue)}
            </div>
          </div>
        </div>

        {/* Detailed Data (Expandable) */}
        <div>
          <Button
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full justify-between"
          >
            View Raw Data
            {showDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showDetails && (
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Historical Data</h4>
                <div className="max-h-40 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.historical.map((point, index) => (
                        <TableRow key={index}>
                          <TableCell>{point.timestamp}</TableCell>
                          <TableCell>{formatNumber(point.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Forecast Data</h4>
                <div className="max-h-40 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Value</TableHead>
                        {processedData.hasConfidenceInterval && (
                          <>
                            <TableHead>Lower Bound</TableHead>
                            <TableHead>Upper Bound</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.forecast.map((point, index) => (
                        <TableRow key={index}>
                          <TableCell>{point.timestamp}</TableCell>
                          <TableCell>{formatNumber(point.value)}</TableCell>
                          {processedData.hasConfidenceInterval && (
                            <>
                              <TableCell>
                                {point.predLow
                                  ? formatNumber(point.predLow)
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {point.predHigh
                                  ? formatNumber(point.predHigh)
                                  : "-"}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Multi-Section Report Display Component
// Implements specification: combines multiple visualization types, section titles, appropriate rendering logic, visual separators
export const MultiSectionReportDisplay: React.FC<{
  data: MultiSectionReportData;
}> = ({ data }) => {
  const renderSection = (section: ReportSection, index: number) => {
    switch (section.section_type) {
      case "metric_grid":
      case "key_value":
        // Handle both new and legacy data structures for key_value
        const keyValueData = section.content as any;
        const processedKeyValueData = keyValueData?.data
          ? keyValueData
          : { data: keyValueData };
        return (
          <KeyValueDisplay
            key={index}
            data={processedKeyValueData as KeyValueData}
          />
        );
      case "dataframe":
        // Handle both new and legacy data structures for dataframe
        const dataFrameData = section.content as any;
        const processedDataFrameData = dataFrameData?.dataframe
          ? dataFrameData
          : { dataframe: dataFrameData };
        return (
          <DataFrameDisplay
            key={index}
            data={processedDataFrameData as DataFrameData}
          />
        );
      case "text":
        return <TextDisplay key={index} content={section.content as string} />;
      case "virality_report":
        return (
          <ViralityReportDisplay
            key={index}
            data={section.content as ViralityReportData}
          />
        );
      case "forecast_chart":
        return (
          <ForecastChartDisplay
            key={index}
            data={section.content as ForecastChartData}
          />
        );
      case "playlist_recommendation_report":
        return (
          <PlaylistRecommendationDisplay
            key={index}
            data={section.content as PlaylistRecommendationData}
          />
        );
      default:
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <p className="text-muted-foreground">
                Unknown section type: {section.section_type}
              </p>
              <pre className="text-xs overflow-auto mt-2">
                {JSON.stringify(section.content, null, 2)}
              </pre>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      {data.sections?.map((section, index) => (
        <div key={index}>
          {/* Section Title */}
          {section.title && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-foreground">
                {section.title}
              </h3>
              <div className="h-px bg-border mt-2"></div>
            </div>
          )}

          {/* Section Content */}
          <div className="mb-6">{renderSection(section, index)}</div>

          {/* Visual Separator (except for last section) */}
          {index < (data.sections?.length || 0) - 1 && (
            <div className="flex items-center justify-center py-4">
              <Separator className="flex-1" />
              <div className="px-4">
                <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
              </div>
              <Separator className="flex-1" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Mixed Content Display Component - for responses with both text and structured data
export const MixedContentDisplay: React.FC<{
  textContent?: string;
  structuredData?: unknown;
  dataType?: string;
}> = ({ textContent, structuredData, dataType }) => {
  const renderStructuredData = () => {
    if (!structuredData) return null;

    // Try to detect the type of structured data
    if (typeof structuredData === "object" && structuredData !== null) {
      const data = structuredData as any;

      // Check for dataframe structure (new format with dataframe property)
      if (
        data.dataframe &&
        data.dataframe.index &&
        data.dataframe.columns &&
        data.dataframe.data
      ) {
        return <DataFrameDisplay data={data as DataFrameData} />;
      }

      // Check for legacy dataframe structure (direct properties)
      if (data.index && data.columns && data.data) {
        return <DataFrameDisplay data={{ dataframe: data } as DataFrameData} />;
      }

      // Check for key-value structure (new format with data property)
      if (data.data && typeof data.data === "object") {
        const keyValueData = data.data;
        if (
          Object.keys(keyValueData).every(
            (key) =>
              typeof keyValueData[key] === "string" ||
              typeof keyValueData[key] === "number"
          )
        ) {
          return <KeyValueDisplay data={data as KeyValueData} />;
        }
      }

      // Check for legacy key-value structure (direct key-value pairs)
      if (
        Object.keys(data).every(
          (key) =>
            typeof data[key] === "string" || typeof data[key] === "number"
        )
      ) {
        return <KeyValueDisplay data={{ data } as KeyValueData} />;
      }

      // Check for virality report structure
      if (data.final_score !== undefined && data.verdict !== undefined) {
        return <ViralityReportDisplay data={data as ViralityReportData} />;
      }

      // Check for forecast chart structure
      if (data.historical_data || data.forecast_data) {
        return <ForecastChartDisplay data={data as ForecastChartData} />;
      }

      // Check for multi-section report
      if (data.sections && Array.isArray(data.sections)) {
        return (
          <MultiSectionReportDisplay data={data as MultiSectionReportData} />
        );
      }
    }

    // Fallback to JSON display
    return (
      <div className="p-4 bg-muted/30 rounded">
        <p className="text-sm text-muted-foreground mb-2">
          Structured Data {dataType ? `(${dataType})` : ""}
        </p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(structuredData, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {textContent ? <TextDisplay content={textContent} /> : null}
      {structuredData ? renderStructuredData() : null}
    </div>
  );
};

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  BarChart3,
  Database,
  Calendar,
} from "lucide-react";
import { useState, useMemo } from "react";
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
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
  formatCurrencyCompact,
  formatSmartValue,
  isEarningsValue,
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

// Text Display Component with Enhanced Formatting
export const TextDisplay: React.FC<{ content: string }> = ({ content }) => {
  const formatVariableName = (varName: string): string => {
    // Convert snake_case to Title Case and handle special cases
    return varName
      .replace(/_/g, " ")
      .replace(/\\/g, " ") // Remove backslashes and replace with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces
  };

  const formatNumericValue = (value: string, key?: string): string => {
    // Handle currency values that already have a dollar sign
    if (value.includes("$")) {
      const numericValue = parseFloat(value.replace(/[$,]/g, ""));
      if (!isNaN(numericValue)) {
        return formatCurrencyCompact(numericValue);
      }
      return value;
    }

    // Check if it's a numeric value that should be formatted
    const numericValue = parseFloat(value.replace(/,/g, "")); // Remove commas first
    if (!isNaN(numericValue)) {
      // Check if this is an earnings-related value
      if (key && isEarningsValue(key)) {
        return formatCurrencyCompact(numericValue);
      }
      // For other large numbers, use compact formatting with K/M/B
      return formatNumberCompact(numericValue);
    }
    return value;
  };

  const formatTextWithNumbers = (text: string): string => {
    // First handle currency values (numbers with $ prefix)
    const currencyRegex =
      /\$(\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\d{4,}(?:\.\d{2})?)/g;
    let result = text.replace(currencyRegex, (match, numberPart) => {
      const numericValue = parseFloat(numberPart.replace(/,/g, ""));
      if (!isNaN(numericValue) && numericValue >= 1000) {
        return formatCurrencyCompact(numericValue);
      }
      return match;
    });

    // Then handle regular large numbers (with or without commas)
    const numberRegex = /\b(\d{1,3}(?:,\d{3})+|\d{4,})\b/g;
    result = result.replace(numberRegex, (match) => {
      const numericValue = parseFloat(match.replace(/,/g, ""));
      if (!isNaN(numericValue) && numericValue >= 1000) {
        return formatNumberCompact(numericValue);
      }
      return match;
    });

    return result;
  };

  const parseMarkdownTable = (tableText: string) => {
    const lines = tableText.trim().split("\n");
    if (lines.length < 3) return null; // Need at least header, separator, and one data row

    // Parse header row
    const headerRow = lines[0]
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell);

    // Skip separator row (lines[1])

    // Parse data rows
    const dataRows = lines
      .slice(2)
      .map((line) =>
        line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell)
      )
      .filter((row) => row.length > 0);

    if (headerRow.length === 0 || dataRows.length === 0) return null;

    return { headers: headerRow, rows: dataRows };
  };

  const parseEnhancedMarkdown = (text: string) => {
    // Split text by lines first to handle line breaks properly
    const lines = text.split("\n");
    const result: React.ReactElement[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check if this line starts a markdown table (contains | and next line is separator)
      if (
        line.includes("|") &&
        i + 1 < lines.length &&
        lines[i + 1].includes("-")
      ) {
        // Found a table, collect all table lines
        const tableLines = [];
        let j = i;

        // Collect header row
        if (lines[j].includes("|")) {
          tableLines.push(lines[j]);
          j++;
        }

        // Collect separator row
        if (
          j < lines.length &&
          lines[j].includes("-") &&
          lines[j].includes("|")
        ) {
          tableLines.push(lines[j]);
          j++;
        }

        // Collect data rows
        while (
          j < lines.length &&
          lines[j].includes("|") &&
          lines[j].trim() !== ""
        ) {
          tableLines.push(lines[j]);
          j++;
        }

        // Parse the table
        if (tableLines.length >= 3) {
          const tableData = parseMarkdownTable(tableLines.join("\n"));

          if (tableData) {
            result.push(
              <div key={`table-${i}`} className="my-4 overflow-x-auto">
                <Table className="w-full bg-background border border-border">
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-b bg-muted/50">
                      {tableData.headers.map((header, headerIndex) => (
                        <TableHead
                          key={headerIndex}
                          className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap bg-muted/50"
                        >
                          {formatTextWithNumbers(header)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-background">
                    {tableData.rows.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        className="border-b bg-background hover:bg-muted/30 transition-colors"
                      >
                        {row.map((cell, cellIndex) => (
                          <TableCell
                            key={cellIndex}
                            className="p-3 whitespace-nowrap bg-background"
                          >
                            <span className="text-white">
                              {formatTextWithNumbers(cell)}
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
            i = j; // Skip to after the table
            continue;
          }
        }
      }

      // Process regular lines (non-table content)
      const processedLine = processRegularLine(line, i);
      if (processedLine) {
        result.push(processedLine);
      }
      i++;
    }

    return result;
  };

  const processRegularLine = (
    line: string,
    lineIndex: number
  ): React.ReactElement | null => {
    // Handle markdown headers (### **text**)
    if (line.trim().startsWith("###")) {
      const headerContent = line
        .replace(/^###\s*/, "")
        .replace(/\*\*/g, "")
        .trim();

      return (
        <div key={lineIndex} className="mb-3 mt-4">
          <h3 className="font-bold text-lg text-foreground">{headerContent}</h3>
        </div>
      );
    }

    // Handle bullet points - convert * to •, but handle them as regular text without bullets
    if (
      line.trim().startsWith("- **") ||
      (line.trim().startsWith("*") && !line.trim().startsWith("**"))
    ) {
      const bulletContent = line.replace(/^\s*[-*]\s*/, "").trim();

      // Check if this is a key-value pair (contains colon)
      if (bulletContent.includes(":")) {
        const [key, value] = bulletContent.split(":", 2);
        // Remove ** from both key and value if present
        const cleanKey = key.replace(/\*\*/g, "").trim();
        const cleanValue = value ? value.replace(/\*\*/g, "").trim() : "";
        const formattedKey = formatVariableName(cleanKey);
        const formattedValue = cleanValue
          ? formatNumericValue(cleanValue, cleanKey)
          : "";

        return (
          <div key={lineIndex} className="flex items-start gap-2 mb-1">
            <span className="text-white mt-1 text-sm">•</span>
            <div className="flex-1">
              <span className="font-semibold text-base text-foreground">
                {formattedKey}:
              </span>
              {formattedValue && (
                <span className="ml-2 text-white">{formattedValue}</span>
              )}
            </div>
          </div>
        );
      } else {
        // Regular bullet point content with dot
        const cleanContent = bulletContent.replace(/\*\*/g, "");
        const formattedContent = formatTextWithNumbers(cleanContent);
        return (
          <div key={lineIndex} className="flex items-start gap-2 mb-1">
            <span className="text-white mt-1 text-sm">•</span>
            <span className="text-white">{formattedContent}</span>
          </div>
        );
      }
    }

    // Handle regular lines that might contain bold text
    if (line.trim()) {
      // Parse bold text (**text**) but remove the markdown
      const parts = line.split(/(\*\*.*?\*\*)/g);

      const parsedLine = parts.map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          // Remove the ** and make it bold and slightly bigger
          const boldText = part.slice(2, -2);
          // Format numbers in bold text as well
          const formattedBoldText = formatTextWithNumbers(boldText);
          return (
            <strong
              key={`${lineIndex}-${partIndex}`}
              className="font-bold text-lg"
            >
              {formattedBoldText}
            </strong>
          );
        }
        // Format numbers in regular text
        return formatTextWithNumbers(part);
      });

      return (
        <div key={lineIndex} className="mb-1">
          {parsedLine}
        </div>
      );
    }

    // Empty lines
    return (
      <div key={lineIndex} className="mb-1">
        <br />
      </div>
    );
  };

  return (
    <div className="prose prose-sm max-w-none">
      <div className="text-white space-y-1">
        {parseEnhancedMarkdown(content)}
      </div>
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
                      {row.map((cell, cellIndex) => {
                        const columnName = tableData.columns[cellIndex] || "";
                        return (
                          <TableCell
                            key={cellIndex}
                            className="p-2 whitespace-nowrap min-w-[100px] max-w-[150px] bg-background"
                            style={{
                              width: cellIndex === 0 ? "120px" : "100px",
                            }}
                          >
                            <div className="truncate" title={String(cell)}>
                              {cellIndex === 0 ? (
                                <span className="font-medium">{cell}</span>
                              ) : (
                                <span className="text-muted-foreground">
                                  {formatSmartValue(columnName, cell)}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
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
export const KeyValueDisplay: React.FC<{
  data: KeyValueData | any;
  title?: string;
  hideTitle?: boolean;
}> = ({ data, title, hideTitle = false }) => {
  // Handle both new format with title and legacy format
  const actualTitle = !hideTitle ? title || (data as any)?.title : null;
  const metricsData = data.data || data; // Handle both new and legacy data structures

  // Validate data structure
  if (!validateDataStructure(data, ["data"]) && !data) {
    return createMalformedDataFallback(data, "KeyValueDisplay");
  }

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
    <div className="space-y-4">
      {/* Section Title */}
      {actualTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {actualTitle}
          </h3>
          <div className="h-px bg-border mt-2"></div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {entries.map(([key, value], index) => {
          const formattedLabel = convertSnakeCaseToTitleCase(key);
          const formattedValue = formatSmartValue(key, value);

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
                          {formatNumberCompact(rec.playlist_followers)}{" "}
                          followers
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
                {formatNumberCompact(
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

  // Process historical and forecast data separately using the working logic from test page
  const { historicalData, forecastData, filteredHistoricalData } =
    useMemo(() => {
      // Process historical data
      const processedHistorical = (data.historical_data?.data || [])
        .map(([timestamp, value], index) => {
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
        .map(([timestamp, value, lowerBound, upperBound], index) => {
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

      console.log("Historical data points:", processedHistorical.length);
      console.log(
        "Filtered historical data points:",
        filteredHistorical.length
      );
      console.log("Forecast data points:", processedForecast.length);

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

          <div className="flex">
            <div className="flex flex-1 flex-col justify-center gap-2 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground text-xs font-medium">
                  Average {data.y_axis_label || "Value"}
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
    );
  };

  // Render forecast data chart using the working logic from test page
  const renderForecastChart = () => {
    if (forecastData.length === 0) return null;

    return (
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
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {forecastData.length} forecast points with{" "}
                  <span className="font-semibold text-primary">
                    {hasConfidenceInterval
                      ? "confidence intervals"
                      : "trend analysis"}
                  </span>
                </p>
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
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart data={forecastData}>
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
                      let formattedValue;
                      if (typeof value === "number") {
                        const absValue = Math.abs(value);
                        const sign = value < 0 ? "-" : "";

                        if (absValue >= 1e9) {
                          formattedValue = `${sign}${(absValue / 1e9).toFixed(
                            2
                          )}B`;
                        } else if (absValue >= 1e6) {
                          formattedValue = `${sign}${(absValue / 1e6).toFixed(
                            2
                          )}M`;
                        } else {
                          formattedValue = value.toLocaleString();
                        }
                      } else {
                        formattedValue = value;
                      }

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
    );
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Historical Chart */}
        {renderHistoricalChart()}

        {/* Forecast Chart */}
        {renderForecastChart()}

        {/* Data Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-muted-foreground">
              Historical Points (Total)
            </div>
            <div className="text-lg font-bold">{historicalData.length}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-muted-foreground">
              Historical Points (Filtered)
            </div>
            <div className="text-lg font-bold">
              {filteredHistoricalData.length}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-muted-foreground">
              Forecast Points
            </div>
            <div className="text-lg font-bold">{forecastData.length}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-muted-foreground">
              Forecast Period
            </div>
            <div className="text-lg font-bold">
              {forecastData.length > 0
                ? Math.ceil(
                    (new Date(
                      forecastData[forecastData.length - 1]?.date
                    ).getTime() -
                      new Date(forecastData[0]?.date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 90}{" "}
              days
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-muted-foreground">
              Data Range
            </div>
            <div className="text-lg font-bold">
              {historicalData.length > 0 && forecastData.length > 0
                ? `${new Date(
                    historicalData[0]?.date
                  ).getFullYear()} - ${new Date(
                    forecastData[forecastData.length - 1]?.date
                  ).getFullYear()}`
                : "N/A"}
            </div>
          </div>
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
            hideTitle={true} // Hide title since we show it at section level
          />
        );

      case "dataframe":
      case "table":
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

      case "multi_forecast_display":
        return (
          <MultiForecastDisplay
            key={index}
            data={section.content as MultiForecastDisplayData}
          />
        );

      case "error":
        return <ErrorDisplay key={index} content={section.content as string} />;

      case "mixed_content":
        return (
          <MixedContentDisplay
            key={index}
            textContent=""
            structuredData={section.content}
            dataType={section.section_type}
          />
        );

      default:
        // Enhanced fallback - try to auto-detect the data type based on content structure
        const content = section.content as any;

        // Try to detect dataframe structure
        if (content && typeof content === "object") {
          // Check for dataframe structure (new format with dataframe property)
          if (
            content.dataframe &&
            content.dataframe.index &&
            content.dataframe.columns &&
            content.dataframe.data
          ) {
            return (
              <DataFrameDisplay key={index} data={content as DataFrameData} />
            );
          }

          // Check for legacy dataframe structure (direct properties)
          if (content.index && content.columns && content.data) {
            return (
              <DataFrameDisplay
                key={index}
                data={{ dataframe: content } as DataFrameData}
              />
            );
          }

          // Check for key-value structure (new format with data property)
          if (content.data && typeof content.data === "object") {
            const keyValueData = content.data;
            if (
              Object.keys(keyValueData).every(
                (key) =>
                  typeof keyValueData[key] === "string" ||
                  typeof keyValueData[key] === "number"
              )
            ) {
              return (
                <KeyValueDisplay key={index} data={content as KeyValueData} />
              );
            }
          }

          // Check for legacy key-value structure (direct key-value pairs)
          if (
            Object.keys(content).every(
              (key) =>
                typeof content[key] === "string" ||
                typeof content[key] === "number"
            )
          ) {
            return (
              <KeyValueDisplay
                key={index}
                data={{ data: content } as KeyValueData}
              />
            );
          }

          // Check for virality report structure
          if (
            content.final_score !== undefined &&
            content.verdict !== undefined
          ) {
            return (
              <ViralityReportDisplay
                key={index}
                data={content as ViralityReportData}
              />
            );
          }

          // Check for forecast chart structure
          if (content.historical_data || content.forecast_data) {
            return (
              <ForecastChartDisplay
                key={index}
                data={content as ForecastChartData}
              />
            );
          }

          // Check for multi-forecast structure
          if (content.forecasts && Array.isArray(content.forecasts)) {
            return (
              <MultiForecastDisplay
                key={index}
                data={content as MultiForecastDisplayData}
              />
            );
          }
        }

        // If it's a string, treat as text
        if (typeof content === "string") {
          return <TextDisplay key={index} content={content} />;
        }

        // Final fallback - show unknown section type with better formatting
        console.warn(
          `[MultiSectionReportDisplay] Unknown section type: ${section.section_type}`,
          section.content
        );
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <p className="text-muted-foreground">
                  Unknown section type:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {section.section_type}
                  </code>
                </p>
              </div>
              <details className="cursor-pointer">
                <summary className="text-sm font-medium mb-2">
                  View raw data
                </summary>
                <pre className="text-xs overflow-auto bg-muted/50 p-3 rounded">
                  {JSON.stringify(section.content, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      {data.sections?.map((section, index) => {
        // Extract title from section.content.title or fallback to section.title
        const sectionTitle = (section.content as any)?.title || section.title;

        return (
          <div key={index}>
            {/* Section Title - Big Bold Heading */}
            {sectionTitle && (
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {sectionTitle}
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-primary to-primary/20 rounded-full"></div>
              </div>
            )}

            {/* Section Content */}
            <div className="mb-8">{renderSection(section, index)}</div>

            {/* Visual Separator (except for last section) */}
            {index < (data.sections?.length || 0) - 1 && (
              <div className="flex items-center justify-center py-6">
                <Separator className="flex-1" />
                <div className="px-4">
                  <div className="w-3 h-3 bg-muted-foreground/20 rounded-full"></div>
                </div>
                <Separator className="flex-1" />
              </div>
            )}
          </div>
        );
      })}
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

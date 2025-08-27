import React from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportSection {
  section_type: string;
  content: unknown;
  title?: string;
}

interface TextDisplayProps {
  content: string;
}

const TextDisplay: React.FC<TextDisplayProps> = ({ content }) => {
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

  const isYearInText = (
    num: number,
    text: string,
    matchIndex: number
  ): boolean => {
    // Check if number is in year range
    if (num < 1900 || num > 2100 || !Number.isInteger(num)) {
      return false;
    }

    // Get context around the number (50 characters before and after)
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(text.length, matchIndex + 50);
    const context = text.substring(start, end).toLowerCase();

    // Check for year-related context words
    const yearContextWords = [
      "year",
      "years",
      "in",
      "by",
      "until",
      "since",
      "from",
      "to",
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];

    return yearContextWords.some((word) => context.includes(word));
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
    result = result.replace(numberRegex, (match, offset) => {
      const numericValue = parseFloat(match.replace(/,/g, ""));
      if (!isNaN(numericValue) && numericValue >= 1000) {
        // Check if this looks like a year in context
        if (isYearInText(numericValue, text, offset)) {
          return match; // Don't format years
        }
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
              <div
                key={`table-${i}`}
                className="my-4 overflow-x-auto scrollbar-thin"
              >
                <Table className="w-full">
                  <TableHeader className="bg-[#222C41] ">
                    <TableRow className="border-b">
                      {tableData.headers.map((header, headerIndex) => (
                        <TableHead
                          key={headerIndex}
                          className="text-left p-2 font-medium text-primary whitespace-nowrap min-w-[100px] max-w-[150px] bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                          style={{
                            width: headerIndex === 0 ? "120px" : "100px",
                          }}
                        >
                          {formatTextWithNumbers(header)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.rows.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        className="border-b bg-[#FFFFFF4D] hover:bg-[#FFFFFF4D]/30 transition-colors"
                      >
                        {row.map((cell, cellIndex) => (
                          <TableCell
                            key={cellIndex}
                            className="p-2 whitespace-nowrap min-w-[100px] max-w-[150px]"
                            style={{
                              width: cellIndex === 0 ? "120px" : "100px",
                            }}
                          >
                            <span className="text-white">{cell}</span>
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
          const formattedBoldText = boldText;
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
        return part;
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

export default TextDisplay;

"use client";
import React, { useState, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatSmartValue,
  validateDataStructure,
  logError,
} from "@/helpers/formatters";

// Interface definitions
interface DataFrameData {
  dataframe: {
    index: number[];
    columns: string[];
    data: (string | number)[][];
  };
}

// Local Error Handling Utilities
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

const createMalformedDataFallback = (data: unknown, context: string) => {
  logError(
    "Malformed data detected",
    `Invalid data structure in ${context}`,
    data
  );

  return (
    <div className="p-4 border rounded">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <span className="text-sm font-medium text-orange-800">
          Data Structure Issue
        </span>
      </div>
      <p className="text-sm text-orange-700 mb-3">
        The data received does&apos;t match the expected format. Raw data is
        shown below:
      </p>
      <details className="group">
        <summary className="cursor-pointer text-sm text-orange-600 hover:text-orange-800 flex items-center gap-1">
          View Raw Data
        </summary>
        <pre className="mt-2 p-2  rounded text-xs overflow-auto max-h-40 text-orange-900">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
};

interface DataFrameDisplayProps {
  data: DataFrameData;
}

const DataFrameDisplay: React.FC<DataFrameDisplayProps> = ({ data }) => {
  // Initialize hooks first (before any early returns)
  const [searchTerm] = useState("");
  const [sortConfig] = useState<{
    key: number;
    direction: "asc" | "desc";
  } | null>(null);

  // Get table data for useMemo dependency
  const tableData = data.dataframe || data; // Handle both new and legacy data structures

  // Filter and sort data - moved before early returns
  const processedData = useMemo(() => {
    // Return empty array if data is invalid
    if (
      !tableData.columns ||
      !Array.isArray(tableData.columns) ||
      !tableData.data ||
      !Array.isArray(tableData.data)
    ) {
      return [];
    }

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
  }, [tableData.data, searchTerm, sortConfig, tableData.columns]);

  // Validate data structure
  if (
    !validateDataStructure(data, ["dataframe.columns", "dataframe.data"]) &&
    !validateDataStructure(data, ["columns", "data"])
  ) {
    return createMalformedDataFallback(data, "DataFrameDisplay");
  }

  // Additional validation for table data
  if (
    !tableData.columns ||
    !Array.isArray(tableData.columns) ||
    !tableData.data ||
    !Array.isArray(tableData.data)
  ) {
    return createDataUnavailablePlaceholder("Table data is missing or invalid");
  }

  // const getSortIcon = (columnIndex: number) => {
  //   if (sortConfig?.key === columnIndex) {
  //     return sortConfig.direction === "asc" ? (
  //       <ArrowUp className="h-4 w-4" />
  //     ) : (
  //       <ArrowDown className="h-4 w-4" />
  //     );
  //   }
  //   return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  // };

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      {/* <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search table..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div> */}

      {/* Table Container with Horizontal Scroll */}
      <div className="w-full overflow-x-auto border border-border scrollbar-thin">
        <div className="min-w-fit">
          <Table className="w-full">
            <TableHeader className="bg-[#222C41] ">
              <TableRow className="border-b">
                {tableData.columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className="text-left p-2 font-medium text-primary whitespace-nowrap min-w-[100px] max-w-[150px] bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                    style={{ width: index === 0 ? "120px" : "100px" }}
                    // onClick={() => handleSort(index)}
                  >
                    <div
                      className="flex items-center gap-2 truncate"
                      title={column}
                    >
                      <span className="truncate">{column}</span>
                      {/* {index} */}
                      {/* {getSortIcon(index)} */}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {processedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="border-b bg-[#FFFFFF4D] hover:bg-[#FFFFFF4D]/30 transition-colors"
                >
                  {row.map((cell, cellIndex) => {
                    const columnName = tableData.columns[cellIndex] || "";
                    return (
                      <TableCell
                        key={cellIndex}
                        className="p-2 whitespace-nowrap min-w-[100px] max-w-[150px]"
                        style={{
                          width: cellIndex === 0 ? "120px" : "100px",
                        }}
                      >
                        <div className="truncate" title={String(cell)}>
                          {cellIndex === 0 ? (
                            <span className="font-medium">{cell}</span>
                          ) : (
                            <span className="text-white">
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

      {/* Results Info */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          Showing {processedData.length} of {tableData.data.length} rows
        </div>
      )}
    </div>
  );
};

export default DataFrameDisplay;

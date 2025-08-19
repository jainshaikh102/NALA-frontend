/**
 * NALA Frontend Helper Functions
 * Reusable utility functions for formatting and data manipulation
 * Used across components for consistent data presentation
 */

// Number Formatting Functions
export const formatNumber = (value: any): string => {
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return String(value);
};

export const formatNumberCompact = (value: any): string => {
  const num = typeof value === "number" ? value : parseFloat(String(value));

  if (isNaN(num)) {
    return String(value);
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1e12) {
    return sign + (absNum / 1e12).toFixed(2) + "T";
  }
  if (absNum >= 1e9) {
    return sign + (absNum / 1e9).toFixed(2) + "B";
  }
  if (absNum >= 1e6) {
    return sign + (absNum / 1e6).toFixed(2) + "M";
  }
  if (absNum >= 1e3) {
    return sign + (absNum / 1e3).toFixed(2) + "K";
  }

  return num.toLocaleString();
};

export const formatPercentage = (value: any, decimals: number = 1): string => {
  const num = typeof value === "number" ? value : parseFloat(String(value));

  if (isNaN(num)) {
    return String(value);
  }

  return `${num.toFixed(decimals)}%`;
};

export const formatCurrency = (
  value: any,
  currency: string = "USD"
): string => {
  const num = typeof value === "number" ? value : parseFloat(String(value));

  if (isNaN(num)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(num);
};

// Enhanced currency formatting with compact notation for large values
export const formatCurrencyCompact = (value: any): string => {
  const num = typeof value === "number" ? value : parseFloat(String(value));

  if (isNaN(num)) {
    return String(value);
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1e12) {
    return sign + "$" + (absNum / 1e12).toFixed(2) + "T";
  }
  if (absNum >= 1e9) {
    return sign + "$" + (absNum / 1e9).toFixed(2) + "B";
  }
  if (absNum >= 1e6) {
    return sign + "$" + (absNum / 1e6).toFixed(2) + "M";
  }
  if (absNum >= 1e3) {
    return sign + "$" + (absNum / 1e3).toFixed(2) + "K";
  }

  return sign + "$" + num.toLocaleString();
};

// Helper function to detect if a key/label contains earnings-related terms
export const isEarningsValue = (key: string): boolean => {
  const earningsKeywords = [
    "earning",
    "earnings",
    "revenue",
    "income",
    "profit",
    "salary",
    "wage",
    "payment",
    "payout",
    "money",
    "cash",
    "dollar",
    "usd",
    "cost",
    "price",
    "total_earnings",
    "min_earnings",
    "max_earnings",
    "net_earnings",
  ];

  return earningsKeywords.some((keyword) =>
    key.toLowerCase().includes(keyword.toLowerCase())
  );
};

// Smart value formatter that detects earnings and applies appropriate formatting
export const formatSmartValue = (key: string, value: any): string => {
  // Handle already formatted currency strings by extracting the number and reformatting
  if (typeof value === "string" && value.includes("$")) {
    // Extract number from currency string (remove $, commas, etc.)
    const numericValue = parseFloat(value.replace(/[$,]/g, ""));
    if (!isNaN(numericValue)) {
      return formatCurrencyCompact(numericValue);
    }
    return value; // Return original if we can't parse it
  }

  // Handle string values with commas (like "50,593,385")
  let num: number;
  if (typeof value === "string") {
    // Remove commas and parse as number
    num = parseFloat(value.replace(/,/g, ""));
  } else {
    num = typeof value === "number" ? value : parseFloat(String(value));
  }

  if (isNaN(num)) {
    return String(value);
  }

  // Check if this is an earnings-related value
  if (isEarningsValue(key)) {
    return formatCurrencyCompact(num);
  }

  // For other numeric values, use compact formatting
  return formatNumberCompact(num);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// String Formatting Functions
export const convertSnakeCaseToTitleCase = (str: string): string => {
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (
  text: string,
  maxLength: number = 100,
  suffix: string = "..."
): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Timestamp Parsing and Formatting Functions
export const parseTimestamp = (timestamp: string | number | Date): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (typeof timestamp === "number") {
    // Handle both seconds and milliseconds timestamps
    const date =
      timestamp > 1e10 ? new Date(timestamp) : new Date(timestamp * 1000);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  if (typeof timestamp === "string") {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  return new Date();
};

export const formatTimestamp = (
  timestamp: string | number | Date,
  format: "date" | "datetime" | "time" = "date"
): string => {
  const date = parseTimestamp(timestamp);

  switch (format) {
    case "datetime":
      return date.toLocaleString();
    case "time":
      return date.toLocaleTimeString();
    case "date":
    default:
      return date.toLocaleDateString();
  }
};

// Data Validation Functions
export const validateDataStructure = (
  data: any,
  requiredFields: string[]
): boolean => {
  if (!data || typeof data !== "object") {
    return false;
  }

  return requiredFields.every((field) => {
    const fieldPath = field.split(".");
    let current = data;

    for (const path of fieldPath) {
      if (current === null || current === undefined || !(path in current)) {
        return false;
      }
      current = current[path];
    }

    return true;
  });
};

// Logging Functions
export const logError = (context: string, error: any, data?: any) => {
  console.error(`[NALA] ${context}:`, error);
  if (data) {
    console.error(`[NALA] Data:`, data);
  }
};

export const logWarning = (context: string, message: string, data?: any) => {
  console.warn(`[NALA] ${context}: ${message}`);
  if (data) {
    console.warn(`[NALA] Data:`, data);
  }
};

// Array and Object Utilities
export const groupBy = <T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(
  array: T[],
  keyFn: (item: T) => any,
  direction: "asc" | "desc" = "asc"
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (aStr < bStr) return direction === "asc" ? -1 : 1;
    if (aStr > bStr) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Color and Theme Utilities
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "success":
    case "completed":
    case "active":
    case "calculated":
      return "text-green-600";
    case "warning":
    case "pending":
    case "unavailable":
      return "text-orange-600";
    case "error":
    case "failed":
    case "data_error":
      return "text-red-600";
    case "info":
    case "processing":
      return "text-blue-600";
    default:
      return "text-muted-foreground";
  }
};

export const getGrowthColor = (growth: number): string => {
  if (growth > 0) return "text-green-600";
  if (growth < 0) return "text-red-600";
  return "text-muted-foreground";
};

// URL and Link Utilities
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const openInNewTab = (url: string): void => {
  if (isValidUrl(url)) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

// Platform-specific Utilities
export const getPlatformIcon = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case "spotify":
      return "🎵"; // You can replace with actual icon components
    case "youtube":
      return "📺";
    case "apple":
    case "apple music":
      return "🍎";
    case "soundcloud":
      return "☁️";
    default:
      return "🎶";
  }
};

export const formatPlatformName = (platform: string): string => {
  return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
};

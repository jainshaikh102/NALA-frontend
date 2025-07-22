/**
 * Number formatting utility functions
 * These functions help format numbers for display across the application
 */

/**
 * Adds commas to numbers for better readability
 * @param num - The number to format
 * @returns Formatted string with commas
 * @example addCommas(1234567) => "1,234,567"
 */
export const addCommas = (num: number | string): string => {
  if (num === null || num === undefined) return "0";
  
  const numStr = typeof num === "string" ? num : num.toString();
  const number = parseFloat(numStr);
  
  if (isNaN(number)) return "0";
  
  return number.toLocaleString();
};

/**
 * Converts large numbers to abbreviated format (K, M, B, T)
 * @param num - The number to convert
 * @param decimals - Number of decimal places (default: 1)
 * @returns Abbreviated number string
 * @example formatLargeNumber(1234567) => "1.2M"
 */
export const formatLargeNumber = (num: number | string, decimals: number = 1): string => {
  if (num === null || num === undefined) return "0";
  
  const numStr = typeof num === "string" ? num : num.toString();
  const number = parseFloat(numStr);
  
  if (isNaN(number)) return "0";
  
  const absNumber = Math.abs(number);
  const sign = number < 0 ? "-" : "";
  
  if (absNumber >= 1e12) {
    return sign + (absNumber / 1e12).toFixed(decimals) + "T";
  } else if (absNumber >= 1e9) {
    return sign + (absNumber / 1e9).toFixed(decimals) + "B";
  } else if (absNumber >= 1e6) {
    return sign + (absNumber / 1e6).toFixed(decimals) + "M";
  } else if (absNumber >= 1e3) {
    return sign + (absNumber / 1e3).toFixed(decimals) + "K";
  } else {
    return sign + absNumber.toString();
  }
};

/**
 * Converts large numbers to abbreviated format with commas for smaller numbers
 * @param num - The number to convert
 * @param decimals - Number of decimal places for abbreviations (default: 1)
 * @returns Formatted number string with commas or abbreviations
 * @example formatNumberWithCommas(1234) => "1,234"
 * @example formatNumberWithCommas(1234567) => "1.2M"
 */
export const formatNumberWithCommas = (num: number | string, decimals: number = 1): string => {
  if (num === null || num === undefined) return "0";
  
  const numStr = typeof num === "string" ? num : num.toString();
  const number = parseFloat(numStr);
  
  if (isNaN(number)) return "0";
  
  const absNumber = Math.abs(number);
  
  // Use abbreviations for numbers >= 1 million
  if (absNumber >= 1e6) {
    return formatLargeNumber(number, decimals);
  } else {
    // Use commas for smaller numbers
    return addCommas(number);
  }
};

/**
 * Formats currency values with proper symbols and formatting
 * @param num - The number to format as currency
 * @param currency - Currency symbol (default: "$")
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 * @example formatCurrency(1234567.89) => "$1.23M"
 */
export const formatCurrency = (
  num: number | string, 
  currency: string = "$", 
  decimals: number = 2
): string => {
  if (num === null || num === undefined) return currency + "0";
  
  const numStr = typeof num === "string" ? num : num.toString();
  const number = parseFloat(numStr);
  
  if (isNaN(number)) return currency + "0";
  
  const absNumber = Math.abs(number);
  const sign = number < 0 ? "-" : "";
  
  if (absNumber >= 1e6) {
    return sign + currency + formatLargeNumber(absNumber, decimals);
  } else {
    return sign + currency + addCommas(number.toFixed(decimals));
  }
};

/**
 * Formats percentage values
 * @param num - The number to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 * @example formatPercentage(0.1234) => "12.3%"
 */
export const formatPercentage = (num: number | string, decimals: number = 1): string => {
  if (num === null || num === undefined) return "0%";
  
  const numStr = typeof num === "string" ? num : num.toString();
  const number = parseFloat(numStr);
  
  if (isNaN(number)) return "0%";
  
  return (number * 100).toFixed(decimals) + "%";
};

/**
 * Formats follower/subscriber counts with appropriate suffixes
 * @param num - The number of followers/subscribers
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted follower count string
 * @example formatFollowers(1234567) => "1.2M followers"
 */
export const formatFollowers = (num: number | string, decimals: number = 1): string => {
  const formatted = formatLargeNumber(num, decimals);
  return formatted + " followers";
};

/**
 * Formats listener counts with appropriate suffixes
 * @param num - The number of listeners
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted listener count string
 * @example formatListeners(1234567) => "1.2M listeners"
 */
export const formatListeners = (num: number | string, decimals: number = 1): string => {
  const formatted = formatLargeNumber(num, decimals);
  return formatted + " listeners";
};

/**
 * Formats view counts with appropriate suffixes
 * @param num - The number of views
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted view count string
 * @example formatViews(1234567) => "1.2M views"
 */
export const formatViews = (num: number | string, decimals: number = 1): string => {
  const formatted = formatLargeNumber(num, decimals);
  return formatted + " views";
};

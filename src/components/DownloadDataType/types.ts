// Shared interfaces for download components

export interface ChatMessage {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: string;
  displayData?: unknown;
  dataType?: string;
  queryStr?: string;
  status?: boolean;
}

export interface DataFrameData {
  dataframe: {
    index: any[];
    columns: string[];
    data: any[][];
  };
}

export interface KeyValueData {
  data: Record<string, any>;
}

export interface ForecastChartData {
  historical_data?: {
    index: any[];
    columns: string[];
    data: any[][];
  };
  forecast_data?: {
    index: any[];
    columns: string[];
    data: any[][];
  };
}

export interface ExtractedData {
  type: string;
  data: any;
}

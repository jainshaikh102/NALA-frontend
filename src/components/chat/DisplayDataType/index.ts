// Export all display data type components
export { default as TextDisplay } from "./TextDisplay";
export { default as ErrorDisplay } from "./ErrorDisplay";
export { default as KeyValueDisplay } from "./KeyValueDisplay";
export { default as DataFrameDisplay } from "./DataFrameDisplay";
export { default as ForecastChartDisplay } from "./ForecastChartDisplay";
export { default as ViralityReportDisplay } from "./ViralityReportDisplay";
export { default as PlaylistRecommendationDisplay } from "./PlaylistRecommendationDisplay";
export { default as MultiSectionReportDisplay } from "./MultiSectionReportDisplay";
export { default as MultiForecastDisplay } from "./MultiForecastDisplay";

// Type definitions for props
export interface BaseDisplayProps {
  data: any;
}

export interface TextDisplayProps extends BaseDisplayProps {
  content: string;
}

export interface ErrorDisplayProps extends BaseDisplayProps {
  content: string;
}

export interface KeyValueDisplayProps extends BaseDisplayProps {
  data: {
    data: { [key: string]: string | number };
  };
  title?: string;
  hideTitle?: boolean;
}

export interface DataFrameDisplayProps extends BaseDisplayProps {
  data: {
    dataframe?: {
      index: number[];
      columns: string[];
      data: (string | number)[][];
    };
    index?: number[];
    columns?: string[];
    data?: (string | number)[][];
  };
}

export interface ForecastChartDisplayProps extends BaseDisplayProps {
  data: {
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
  };
}

export interface ViralityReportDisplayProps extends BaseDisplayProps {
  data: {
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
  };
}

export interface PlaylistRecommendationDisplayProps extends BaseDisplayProps {
  data: {
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
  };
}

export interface MultiSectionReportDisplayProps extends BaseDisplayProps {
  data: {
    sections: Array<{
      title: string;
      data_type: string;
      data: any;
    }>;
  };
}

export interface MultiForecastDisplayProps extends BaseDisplayProps {
  data: {
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
  };
}

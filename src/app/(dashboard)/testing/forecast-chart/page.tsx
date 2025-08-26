"use client";

import React from "react";
import ForecastChartData from "./data";
import ForecastChartDisplay from "@/components/chat/DisplayDataType/ForecastChartDisplay";

const page = () => {
  // ForecastChartDisplay expects the data structure directly, not wrapped in sections
  // Using type assertion since the data structure is compatible at runtime
  const transformedData = ForecastChartData.display_data as unknown as {
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

  return (
    <div className="container mx-auto p-6 w-full space-y-4">
      <h1 className="text-4xl font-bold mb-8">Forecast Chart Test</h1>
      <ForecastChartDisplay data={transformedData} />
    </div>
  );
};

export default page;

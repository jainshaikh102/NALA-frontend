"use client";

import React from "react";
import multiSectionTestData from "./data";
import MultiSectionReportDisplay from "@/components/chat/DisplayDataType/MultiSectionReportDisplay";

const page = () => {
  // Transform the test data to match the expected format
  const transformedData = {
    sections: multiSectionTestData.display_data,
  };

  return (
    <div className="container mx-auto p-6 w-full space-y-4">
      <h1 className="text-4xl font-bold mb-8">Multi-Section Report Test</h1>
      <MultiSectionReportDisplay data={transformedData} />
    </div>
  );
};

export default page;

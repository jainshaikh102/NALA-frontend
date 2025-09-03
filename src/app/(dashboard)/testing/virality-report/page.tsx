"use client";

import React from "react";
import ViralityReportData from "./data";
import ViralityReportDisplay from "@/components/chat/DisplayDataType/ViralityReportDisplay";

const page = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Virality Report Testing</h1>
      <ViralityReportDisplay data={ViralityReportData.display_data} />
    </div>
  );
};

export default page;

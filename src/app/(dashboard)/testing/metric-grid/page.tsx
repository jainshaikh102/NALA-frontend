"use client";

import React from "react";
import MetricGridDisplay from "@/components/chat/DisplayDataType/MetricGridDisplay";

const testData = {
  data: {
    total_streams: 1500000,
    monthly_listeners: 850000,
    followers_count: 125000,
    engagement_rate: 4.2,
    avg_daily_streams: 50000,
    top_track_streams: 2500000,
    playlist_adds: 15000,
    social_media_mentions: 8500,
  },
  title: "Artist Performance Metrics"
};

const MetricGridTestPage = () => {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Metric Grid Testing</h1>
      
      <div className="space-y-8">
        {/* Test with title */}
        <div>
          <h2 className="text-lg font-semibold mb-4">With Title</h2>
          <MetricGridDisplay data={testData} />
        </div>

        {/* Test without title */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Without Title (hideTitle=true)</h2>
          <MetricGridDisplay data={testData} hideTitle={true} />
        </div>

        {/* Test with custom title prop */}
        <div>
          <h2 className="text-lg font-semibold mb-4">With Custom Title Prop</h2>
          <MetricGridDisplay 
            data={testData} 
            title="Custom Performance Dashboard" 
          />
        </div>

        {/* Test with legacy data format */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Legacy Data Format (direct key-value)</h2>
          <MetricGridDisplay 
            data={{
              revenue: 125000,
              profit_margin: 15.5,
              customer_count: 2500,
              conversion_rate: 3.8
            } as any}
            title="Business Metrics"
          />
        </div>
      </div>
    </div>
  );
};

export default MetricGridTestPage;

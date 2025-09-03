"use client";

import React from "react";
import MultiSectionReportDisplay from "@/components/chat/DisplayDataType/MultiSectionReportDisplay";

const testData = {
  sections: [
    {
      title: "Key Value Section",
      section_type: "key_value",
      content: {
        data: {
          total_revenue: 1250000,
          monthly_growth: 8.5,
          customer_satisfaction: 4.7,
          market_share: 12.3,
        }
      }
    },
    {
      title: "Metric Grid Section", 
      section_type: "metric_grid",
      content: {
        data: {
          active_users: 850000,
          conversion_rate: 3.2,
          avg_session_duration: 245,
          bounce_rate: 28.5,
          page_views: 2500000,
          unique_visitors: 450000,
        }
      }
    },
    {
      title: "Another Key Value Section",
      section_type: "key_value", 
      content: {
        data: {
          profit_margin: 15.8,
          operating_costs: 890000,
          employee_count: 125,
          office_locations: 3,
        }
      }
    },
    {
      title: "Another Metric Grid Section",
      section_type: "metric_grid",
      content: {
        data: {
          social_followers: 125000,
          engagement_rate: 4.2,
          brand_mentions: 8500,
          sentiment_score: 7.8,
          reach: 1200000,
          impressions: 3500000,
        }
      }
    }
  ]
};

const MultiSectionSeparationTestPage = () => {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Multi-Section Report: Metric Grid vs Key Value Separation Test</h1>
      
      <div className="space-y-4 mb-8">
        <p className="text-gray-600">
          This test shows that <code>metric_grid</code> and <code>key_value</code> sections now use separate components:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li><strong>Key Value sections</strong> use KeyValueDisplay component</li>
          <li><strong>Metric Grid sections</strong> use MetricGridDisplay component</li>
          <li>You can now design them independently with different styling</li>
        </ul>
      </div>

      <MultiSectionReportDisplay data={testData} />
    </div>
  );
};

export default MultiSectionSeparationTestPage;

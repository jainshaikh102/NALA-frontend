import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  formatSmartValue,
  convertSnakeCaseToTitleCase,
  formatTimestamp,
} from "../../helpers/formatters";

// Interface for virality report data
export interface ViralityReportData {
  artist_name?: string;
  final_score?: number;
  verdict?: string;
  summary?: string;
  audience_analysis?: string;
  engagement_analysis?: string;
  audience_growth_percentage?: number;
  engagement_growth_percentage?: number;
  detailed_metrics?: Record<
    string,
    {
      growth: number;
      status: string;
      baseline_avg: number;
      recent_avg: number;
    }
  >;
  [key: string]: any;
}

// Helper function to add virality summary to PDF
const addViralitySummaryToPDF = (
  doc: jsPDF,
  data: ViralityReportData,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  let currentY = yPosition;

  // Check if we need a new page
  if (currentY > pageHeight - 150) {
    doc.addPage();
    currentY = margin;
  }

  // Artist name and main title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Virality Report: ${data.artist_name || "Unknown Artist"}`,
    margin,
    currentY
  );
  currentY += 20;

  // Final score and verdict
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Final Score: ${data.final_score || 0}/100`, margin, currentY);
  currentY += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const verdictColor = getVerdictColor(data.verdict);
  doc.setTextColor(verdictColor.r, verdictColor.g, verdictColor.b);
  doc.text(`Status: ${data.verdict || "Unknown"}`, margin, currentY);
  doc.setTextColor(0, 0, 0); // Reset to black
  currentY += 20;

  // Summary section
  if (data.summary) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Summary:", margin, currentY);
    currentY += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const summaryText = doc.splitTextToSize(
      data.summary,
      pageWidth - 2 * margin
    );
    doc.text(summaryText, margin, currentY);
    currentY += summaryText.length * 5 + 10;
  }

  return currentY;
};

// Helper function to get color based on verdict
const getVerdictColor = (verdict?: string) => {
  switch (verdict?.toLowerCase()) {
    case "viral":
      return { r: 34, g: 197, b: 94 }; // Green
    case "trending":
      return { r: 59, g: 130, b: 246 }; // Blue
    case "stable":
      return { r: 168, g: 85, b: 247 }; // Purple
    case "declining":
      return { r: 239, g: 68, b: 68 }; // Red
    default:
      return { r: 107, g: 114, b: 128 }; // Gray
  }
};

// Helper function to add analysis sections to PDF
const addAnalysisSectionsToPDF = (
  doc: jsPDF,
  data: ViralityReportData,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  let currentY = yPosition;

  // Growth percentages summary
  if (
    data.audience_growth_percentage !== undefined ||
    data.engagement_growth_percentage !== undefined
  ) {
    // Check if we need a new page
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Growth Summary:", margin, currentY);
    currentY += 15;

    const growthData = [
      [
        "Audience Growth",
        `${(data.audience_growth_percentage || 0).toFixed(2)}%`,
      ],
      [
        "Engagement Growth",
        `${(data.engagement_growth_percentage || 0).toFixed(2)}%`,
      ],
    ];

    autoTable(doc, {
      head: [["Metric", "Growth Rate"]],
      body: growthData,
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Audience analysis
  if (data.audience_analysis) {
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Audience Analysis:", margin, currentY);
    currentY += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const audienceText = doc.splitTextToSize(
      data.audience_analysis,
      pageWidth - 2 * margin
    );
    doc.text(audienceText, margin, currentY);
    currentY += audienceText.length * 5 + 15;
  }

  // Engagement analysis
  if (data.engagement_analysis) {
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Engagement Analysis:", margin, currentY);
    currentY += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const engagementText = doc.splitTextToSize(
      data.engagement_analysis,
      pageWidth - 2 * margin
    );
    doc.text(engagementText, margin, currentY);
    currentY += engagementText.length * 5 + 15;
  }

  return currentY;
};

// Helper function to add detailed metrics to PDF
const addDetailedMetricsToPDF = (
  doc: jsPDF,
  data: ViralityReportData,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  if (
    !data.detailed_metrics ||
    Object.keys(data.detailed_metrics).length === 0
  ) {
    return yPosition;
  }

  let currentY = yPosition;

  // Check if we need a new page
  if (currentY > pageHeight - 150) {
    doc.addPage();
    currentY = margin;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Platform Metrics:", margin, currentY);
  currentY += 15;

  // Prepare table data
  const metricsData = Object.entries(data.detailed_metrics).map(
    ([platform, metrics]) => [
      convertSnakeCaseToTitleCase(platform),
      `${metrics.growth.toFixed(2)}%`,
      formatSmartValue("baseline", metrics.baseline_avg),
      formatSmartValue("recent", metrics.recent_avg),
      metrics.status,
    ]
  );

  // Split into multiple tables if too many metrics (more than 10)
  const maxRowsPerTable = 10;

  if (metricsData.length > maxRowsPerTable) {
    // console.log(`Large metrics table detected: ${metricsData.length} rows. Splitting into multiple tables.`);

    for (let i = 0; i < metricsData.length; i += maxRowsPerTable) {
      const dataChunk = metricsData.slice(i, i + maxRowsPerTable);

      // Check if we need a new page
      if (currentY > pageHeight - 120) {
        doc.addPage();
        currentY = margin;
      }

      // Add table part indicator if split
      if (metricsData.length > maxRowsPerTable) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        const partText = `Metrics Part ${Math.floor(i / maxRowsPerTable) + 1}`;
        doc.text(partText, margin, currentY);
        currentY += 8;
      }

      autoTable(doc, {
        head: [
          ["Platform", "Growth %", "Baseline Avg", "Recent Avg", "Status"],
        ],
        body: dataChunk,
        startY: currentY,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 139, 202], fontSize: 9 },
        columnStyles: {
          1: { halign: "right" }, // Growth percentage
          2: { halign: "right" }, // Baseline
          3: { halign: "right" }, // Recent
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }
  } else {
    // Normal single table
    autoTable(doc, {
      head: [["Platform", "Growth %", "Baseline Avg", "Recent Avg", "Status"]],
      body: metricsData,
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        1: { halign: "right" }, // Growth percentage
        2: { halign: "right" }, // Baseline
        3: { halign: "right" }, // Recent
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  return currentY;
};

// Main PDF generation function
export const downloadViralityReportAsPDF = (
  doc: jsPDF,
  data: ViralityReportData | any,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  // console.log("ViralityReport PDF: Received data", data);

  if (!data || typeof data !== "object") {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No virality report data available", margin, yPosition);
    // console.log("ViralityReport PDF: Invalid data structure", data);
    return yPosition + 20;
  }

  let currentY = yPosition;

  // Add virality summary section
  currentY = addViralitySummaryToPDF(
    doc,
    data,
    currentY,
    margin,
    pageWidth,
    pageHeight
  );

  // Add analysis sections
  currentY = addAnalysisSectionsToPDF(
    doc,
    data,
    currentY,
    margin,
    pageWidth,
    pageHeight
  );

  // Add detailed metrics
  currentY = addDetailedMetricsToPDF(
    doc,
    data,
    currentY,
    margin,
    pageWidth,
    pageHeight
  );

  return currentY;
};

// Helper function to add virality summary to Excel
const addViralitySummaryToExcel = (
  workbook: XLSX.WorkBook,
  data: ViralityReportData,
  messageIndex: number
) => {
  const summaryData = [
    { Field: "Artist Name", Value: data.artist_name || "Unknown" },
    { Field: "Final Score", Value: `${data.final_score || 0}/100` },
    { Field: "Status", Value: data.verdict || "Unknown" },
    {
      Field: "Audience Growth",
      Value: `${(data.audience_growth_percentage || 0).toFixed(2)}%`,
    },
    {
      Field: "Engagement Growth",
      Value: `${(data.engagement_growth_percentage || 0).toFixed(2)}%`,
    },
  ];

  if (data.summary) {
    summaryData.push({ Field: "Summary", Value: data.summary });
  }
  if (data.audience_analysis) {
    summaryData.push({
      Field: "Audience Analysis",
      Value: data.audience_analysis,
    });
  }
  if (data.engagement_analysis) {
    summaryData.push({
      Field: "Engagement Analysis",
      Value: data.engagement_analysis,
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(summaryData);
  const sheetName = `Virality_Sum_Msg${messageIndex}`.substring(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

// Helper function to add detailed metrics to Excel
const addDetailedMetricsToExcel = (
  workbook: XLSX.WorkBook,
  data: ViralityReportData,
  messageIndex: number
) => {
  if (
    !data.detailed_metrics ||
    Object.keys(data.detailed_metrics).length === 0
  ) {
    return;
  }

  const metricsData = Object.entries(data.detailed_metrics).map(
    ([platform, metrics]) => ({
      Platform: convertSnakeCaseToTitleCase(platform),
      "Growth %": `${metrics.growth.toFixed(2)}%`,
      "Growth (Numeric)": metrics.growth,
      "Baseline Average": formatSmartValue("baseline", metrics.baseline_avg),
      "Baseline (Numeric)": metrics.baseline_avg,
      "Recent Average": formatSmartValue("recent", metrics.recent_avg),
      "Recent (Numeric)": metrics.recent_avg,
      Status: metrics.status,
    })
  );

  const worksheet = XLSX.utils.json_to_sheet(metricsData);
  const sheetName = `Virality_Met_Msg${messageIndex}`.substring(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

// Main Excel generation function
export const downloadViralityReportAsExcel = (
  workbook: XLSX.WorkBook,
  data: ViralityReportData | any,
  messageIndex: number,
  sheetIndex: number
) => {
  // console.log("ViralityReport Excel: Received data", data);

  if (!data || typeof data !== "object") {
    // Create a placeholder sheet if no data
    const placeholderData = [
      { Section: "Virality Report", Status: "No data available" },
    ];
    const worksheet = XLSX.utils.json_to_sheet(placeholderData);
    const sheetName = `ViralityReport_Msg${messageIndex}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    // console.log("ViralityReport Excel: Invalid data structure", data);
    return;
  }

  // Add virality summary sheet
  addViralitySummaryToExcel(workbook, data, messageIndex);

  // Add detailed metrics sheet
  addDetailedMetricsToExcel(workbook, data, messageIndex);
};

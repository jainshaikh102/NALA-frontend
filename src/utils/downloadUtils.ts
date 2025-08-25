import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { toast } from "sonner";

// Import download components
import {
  downloadDataFrameAsPDF,
  downloadDataFrameAsExcel,
  downloadKeyValueAsPDF,
  downloadKeyValueAsExcel,
  downloadForecastDataAsPDF,
  downloadForecastDataAsExcel,
  downloadMultiSectionReportAsPDF,
  downloadMultiSectionReportAsExcel,
  downloadViralityReportAsPDF,
  downloadViralityReportAsExcel,
  downloadTextAsPDF,
  downloadTextAsExcel,
  ChatMessage,
  DataFrameData,
  KeyValueData,
  ForecastChartData,
  ExtractedData,
  MultiSectionReportData,
  ViralityReportData,
} from "../components/DownloadDataType";

// Re-export image and video download functions for external use
export {
  downloadImageFromBase64,
  downloadVideoFromUrl,
} from "../components/DownloadDataType";

// Interfaces are now imported from DownloadDataType components

// Utility function to extract data from different response types
const extractDataFromResponse = (message: ChatMessage) => {
  const { displayData, dataType, content } = message;

  // console.log("extractDataFromResponse: Processing message", { dataType, displayData });

  if (!displayData) {
    return { type: "text", data: content };
  }

  switch (dataType) {
    case "dataframe":
      return { type: "dataframe", data: displayData as DataFrameData };

    case "key_value":
      return { type: "key_value", data: displayData as KeyValueData };

    case "forecast_chart":
      return { type: "forecast_chart", data: displayData as ForecastChartData };

    case "multi_section_report":
      return { type: "multi_section_report", data: displayData };

    case "virality_report":
      return { type: "virality_report", data: displayData };

    case "image_base64":
      return { type: "image_base64", data: displayData };

    case "video_url":
      return { type: "video_url", data: displayData };

    default:
      return { type: "text", data: content };
  }
};

// Single Message PDF Download
export const downloadMessageAsPDF = (
  message: ChatMessage,
  messageIndex?: number
) => {
  try {
    if (!message) {
      toast.error("No message to export");
      return;
    }

    toast.loading("Generating PDF...", { id: "pdf-download" });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    // Add title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const title = `NALA Response ${messageIndex ? `#${messageIndex}` : ""}`;
    doc.text(title, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    // Add export date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const exportDate = `Exported on: ${new Date().toLocaleString()}`;
    doc.text(exportDate, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    // Add message timestamp
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const messageHeader = `${message.type === "user" ? "User" : "NALA"} (${
      message.timestamp
    })`;
    doc.text(messageHeader, margin, yPosition);
    yPosition += 10;

    // Add message content
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (message.content) {
      const splitContent = doc.splitTextToSize(
        message.content,
        pageWidth - 2 * margin
      );
      doc.text(splitContent, margin, yPosition);
      yPosition += splitContent.length * 5 + 10;
    }

    // Add structured data if available
    if (message.type === "bot" && message.displayData) {
      const extractedData = extractDataFromResponse(message);
      addDataToPDF(
        doc,
        extractedData,
        yPosition,
        margin,
        pageWidth,
        pageHeight
      );
    }

    // Download the PDF
    const filename = `nala-response-${messageIndex || "single"}-${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(filename);

    toast.success("PDF downloaded successfully!", { id: "pdf-download" });
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF. Please try again.", {
      id: "pdf-download",
    });
  }
};

// Image and Video download functions are now imported from DownloadDataType components

// Single Message Excel Download
export const downloadMessageAsExcel = (
  message: ChatMessage,
  messageIndex?: number
) => {
  try {
    if (!message) {
      toast.error("No message to export");
      return;
    }

    // console.log("downloadChatAsExcel: Starting Excel generation", { message, messageIndex });
    toast.loading("Generating Excel file...", { id: "excel-download" });

    const workbook = XLSX.utils.book_new();

    // Create message info sheet
    const messageInfo = {
      "Message Type": message.type === "user" ? "User" : "NALA",
      Timestamp: message.timestamp,
      Content: message.content,
      "Data Type": message.dataType || "text",
      "Export Date": new Date().toLocaleString(),
    };

    const infoSheet = XLSX.utils.json_to_sheet([messageInfo]);
    XLSX.utils.book_append_sheet(workbook, infoSheet, "Message Info");

    // Add data if available
    if (message.type === "bot" && message.displayData) {
      const extractedData = extractDataFromResponse(message);
      addDataToExcel(workbook, extractedData, messageIndex || 1, 1);
    }

    // Download the Excel file
    const filename = `nala-response-${messageIndex || "single"}-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, filename);

    toast.success("Excel file downloaded successfully!", {
      id: "excel-download",
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    toast.error("Failed to generate Excel file. Please try again.", {
      id: "excel-download",
    });
  }
};

// PDF Generation Functions (keeping for backward compatibility)
export const downloadChatAsPDF = (
  messages: ChatMessage[],
  sessionTitle?: string
) => {
  try {
    if (!messages || messages.length === 0) {
      toast.error("No chat messages to export");
      return;
    }

    toast.loading("Generating PDF...", { id: "pdf-download" });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    // Add title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const title = sessionTitle || "NALA Chat Export";
    doc.text(title, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    // Add export date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const exportDate = `Exported on: ${new Date().toLocaleString()}`;
    doc.text(exportDate, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    // Process each message
    messages.forEach((message) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      // Add message header
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const messageHeader = `${message.type === "user" ? "User" : "NALA"} (${
        message.timestamp
      })`;
      doc.text(messageHeader, margin, yPosition);
      yPosition += 10;

      // Add message content
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      if (message.content) {
        const splitContent = doc.splitTextToSize(
          message.content,
          pageWidth - 2 * margin
        );
        doc.text(splitContent, margin, yPosition);
        yPosition += splitContent.length * 5 + 10;
      }

      // Add structured data if available
      if (message.type === "bot" && message.displayData) {
        const extractedData = extractDataFromResponse(message);
        yPosition = addDataToPDF(
          doc,
          extractedData,
          yPosition,
          margin,
          pageWidth,
          pageHeight
        );
      }

      yPosition += 10; // Space between messages
    });

    // Download the PDF
    const filename = `nala-chat-${
      sessionTitle?.replace(/[^a-z0-9]/gi, "_") || "export"
    }-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);

    toast.success("PDF downloaded successfully!", { id: "pdf-download" });
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF. Please try again.", {
      id: "pdf-download",
    });
  }
};

// Helper function to add different data types to PDF
const addDataToPDF = (
  doc: jsPDF,
  extractedData: ExtractedData,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  const { type, data } = extractedData;

  switch (type) {
    case "dataframe":
      return downloadDataFrameAsPDF(
        doc,
        data,
        yPosition,
        margin,
        pageWidth,
        pageHeight
      );

    case "key_value":
      return downloadKeyValueAsPDF(
        doc,
        data,
        yPosition,
        margin,
        pageWidth,
        pageHeight
      );

    case "forecast_chart":
      return downloadForecastDataAsPDF(
        doc,
        data,
        yPosition,
        margin,
        pageWidth,
        pageHeight
      );

    case "multi_section_report":
      return downloadMultiSectionReportAsPDF(
        doc,
        data,
        yPosition,
        margin,
        pageWidth,
        pageHeight
      );

    case "virality_report":
      return downloadViralityReportAsPDF(
        doc,
        data,
        yPosition,
        margin,
        pageWidth,
        pageHeight
      );

    case "text":
      return downloadTextAsPDF(
        doc,
        data,
        yPosition,
        margin,
        pageWidth,
        pageHeight
      );

    default:
      return yPosition;
  }
};

// PDF helper functions are now in individual DownloadDataType components

// Excel Generation Functions
export const downloadChatAsExcel = (
  messages: ChatMessage[],
  sessionTitle?: string
) => {
  try {
    if (!messages || messages.length === 0) {
      toast.error("No chat messages to export");
      return;
    }

    toast.loading("Generating Excel file...", { id: "excel-download" });

    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = messages.map((message, index) => ({
      "Message #": index + 1,
      Type: message.type === "user" ? "User" : "NALA",
      Timestamp: message.timestamp,
      Content: message.content,
      "Data Type": message.dataType || "text",
      "Has Data": message.displayData ? "Yes" : "No",
    }));

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Chat Summary");

    // Process bot messages with data
    let dataSheetIndex = 1;
    messages.forEach((message, messageIndex) => {
      if (message.type === "bot" && message.displayData) {
        const extractedData = extractDataFromResponse(message);
        addDataToExcel(
          workbook,
          extractedData,
          messageIndex + 1,
          dataSheetIndex
        );
        dataSheetIndex++;
      }
    });

    // Download the Excel file
    const filename = `nala-chat-${
      sessionTitle?.replace(/[^a-z0-9]/gi, "_") || "export"
    }-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);

    toast.success("Excel file downloaded successfully!", {
      id: "excel-download",
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    toast.error("Failed to generate Excel file. Please try again.", {
      id: "excel-download",
    });
  }
};

// Helper function to add data to Excel workbook
const addDataToExcel = (
  workbook: XLSX.WorkBook,
  extractedData: ExtractedData,
  messageIndex: number,
  sheetIndex: number
) => {
  const { type, data } = extractedData;

  switch (type) {
    case "dataframe":
      downloadDataFrameAsExcel(workbook, data, messageIndex, sheetIndex);
      break;

    case "key_value":
      downloadKeyValueAsExcel(workbook, data, messageIndex, sheetIndex);
      break;

    case "forecast_chart":
      downloadForecastDataAsExcel(workbook, data, messageIndex, sheetIndex);
      break;

    case "multi_section_report":
      downloadMultiSectionReportAsExcel(
        workbook,
        data,
        messageIndex,
        sheetIndex
      );
      break;

    case "virality_report":
      // console.log("downloadUtils: Processing virality_report for Excel", data);
      downloadViralityReportAsExcel(workbook, data, messageIndex, sheetIndex);
      break;

    case "text":
      downloadTextAsExcel(workbook, data, messageIndex, sheetIndex);
      break;
  }
};

// Excel helper functions are now in individual DownloadDataType components

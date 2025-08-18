import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

// Interface for chat message data
interface ChatMessage {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: string;
  displayData?: unknown;
  dataType?: string;
  queryStr?: string;
  status?: boolean;
}

// Interface for dataframe structure
interface DataFrameData {
  dataframe: {
    index: any[];
    columns: string[];
    data: any[][];
  };
}

// Interface for key-value data
interface KeyValueData {
  data: Record<string, any>;
}

// Interface for forecast chart data
interface ForecastChartData {
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

// Utility function to extract data from different response types
const extractDataFromResponse = (message: ChatMessage) => {
  const { displayData, dataType, content } = message;

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
    messages.forEach((message, index) => {
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
  extractedData: any,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  const { type, data } = extractedData;

  switch (type) {
    case "dataframe":
      return addDataFrameToPDF(
        doc,
        data,
        yPosition,
        margin,
        pageWidth,
        pageHeight
      );

    case "key_value":
      return addKeyValueToPDF(
        doc,
        data,
        yPosition,
        margin,
        pageWidth,
        pageHeight
      );

    case "forecast_chart":
      return addForecastDataToPDF(
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

// Add dataframe to PDF
const addDataFrameToPDF = (
  doc: jsPDF,
  data: DataFrameData,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  if (!data?.dataframe) return yPosition;

  const { columns, data: rows } = data.dataframe;

  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Data Table:", margin, yPosition);
  yPosition += 10;

  // Create table
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: yPosition,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

// Add key-value data to PDF
const addKeyValueToPDF = (
  doc: jsPDF,
  data: KeyValueData,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  if (!data?.data) return yPosition;

  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Metrics:", margin, yPosition);
  yPosition += 10;

  const tableData = Object.entries(data.data).map(([key, value]) => [
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    String(value),
  ]);

  autoTable(doc, {
    head: [["Metric", "Value"]],
    body: tableData,
    startY: yPosition,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

// Add forecast data to PDF
const addForecastDataToPDF = (
  doc: jsPDF,
  data: ForecastChartData,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  let currentY = yPosition;

  if (data.historical_data) {
    currentY = addDataFrameToPDF(
      doc,
      { dataframe: data.historical_data },
      currentY,
      margin,
      pageWidth,
      pageHeight
    );
  }

  if (data.forecast_data) {
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Forecast Data:", margin, currentY);
    currentY += 10;

    currentY = addDataFrameToPDF(
      doc,
      { dataframe: data.forecast_data },
      currentY,
      margin,
      pageWidth,
      pageHeight
    );
  }

  return currentY;
};

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
  extractedData: any,
  messageIndex: number,
  sheetIndex: number
) => {
  const { type, data } = extractedData;

  switch (type) {
    case "dataframe":
      addDataFrameToExcel(workbook, data, messageIndex, sheetIndex);
      break;

    case "key_value":
      addKeyValueToExcel(workbook, data, messageIndex, sheetIndex);
      break;

    case "forecast_chart":
      addForecastDataToExcel(workbook, data, messageIndex, sheetIndex);
      break;
  }
};

// Add dataframe to Excel
const addDataFrameToExcel = (
  workbook: XLSX.WorkBook,
  data: DataFrameData,
  messageIndex: number,
  sheetIndex: number
) => {
  if (!data?.dataframe) return;

  const { columns, data: rows } = data.dataframe;
  const sheetData = [columns, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  const sheetName = `Data_Msg${messageIndex}`;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

// Add key-value data to Excel
const addKeyValueToExcel = (
  workbook: XLSX.WorkBook,
  data: KeyValueData,
  messageIndex: number,
  sheetIndex: number
) => {
  if (!data?.data) return;

  const sheetData = Object.entries(data.data).map(([key, value]) => ({
    Metric: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    Value: value,
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetData);
  const sheetName = `Metrics_Msg${messageIndex}`;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

// Add forecast data to Excel
const addForecastDataToExcel = (
  workbook: XLSX.WorkBook,
  data: ForecastChartData,
  messageIndex: number,
  sheetIndex: number
) => {
  if (data.historical_data) {
    addDataFrameToExcel(
      workbook,
      { dataframe: data.historical_data },
      messageIndex,
      sheetIndex
    );
  }

  if (data.forecast_data) {
    const { columns, data: rows } = data.forecast_data;
    const sheetData = [columns, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    const sheetName = `Forecast_Msg${messageIndex}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }
};

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  formatSmartValue,
  convertSnakeCaseToTitleCase,
  formatTimestamp,
} from "../../helpers/formatters";

// Interface for multi-section report data
export interface MultiSectionReportData {
  // The data can be either an array directly or nested under display_data
  display_data?: Array<{
    section_type: string;
    content: {
      title: string;
      data?: any;
      dataframe?: {
        columns: string[];
        data: any[][];
        index?: any[];
      };
    };
  }>;
  // Or it can be the array itself when passed from downloadUtils
  section_type?: string;
  content?: {
    title: string;
    data?: any;
    dataframe?: {
      columns: string[];
      data: any[][];
      index?: any[];
    };
  };
  [key: string]: any;
}

// Interface for individual section
interface SectionContent {
  section_type: string;
  content: {
    title: string;
    data?: any;
    dataframe?: {
      columns: string[];
      data: any[][];
      index?: any[];
    };
  };
}

// Helper function to add section title to PDF
const addSectionTitle = (
  doc: jsPDF,
  title: string,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, yPosition);
  yPosition += 15;

  return yPosition;
};

// Helper function to add metric grid to PDF
const addMetricGridToPDF = (
  doc: jsPDF,
  data: Record<string, any>,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  const tableData = Object.entries(data).map(([key, value]) => [
    convertSnakeCaseToTitleCase(key),
    formatSmartValue(key, value),
  ]);

  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = margin;
  }

  autoTable(doc, {
    head: [["Metric", "Value"]],
    body: tableData,
    startY: yPosition,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
    columnStyles: {
      0: { fontStyle: "bold" },
    },
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

// Helper function to add key-value data to PDF
const addKeyValueToPDF = (
  doc: jsPDF,
  data: Record<string, any>,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  const tableData = Object.entries(data).map(([key, value]) => [
    convertSnakeCaseToTitleCase(key),
    formatSmartValue(key, value),
  ]);

  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = margin;
  }

  autoTable(doc, {
    head: [["Metric", "Value"]],
    body: tableData,
    startY: yPosition,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
    columnStyles: {
      0: { fontStyle: "bold" },
    },
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

// Helper function to add dataframe to PDF with smart column handling
const addDataFrameToPDF = (
  doc: jsPDF,
  dataframe: { columns: string[]; data: any[][] },
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  const { columns, data } = dataframe;
  const maxColumnsPerTable = 8; // Maximum columns that fit well in PDF width

  // Format column headers
  const formattedColumns = columns.map((col) =>
    convertSnakeCaseToTitleCase(col)
  );

  // Format data with smart formatting
  const formattedData = data.map((row) =>
    row.map((value, index) => {
      const columnName = columns[index];
      return formatSmartValue(columnName, value);
    })
  );

  let currentY = yPosition;

  // If table has too many columns, split it into multiple tables
  if (columns.length > maxColumnsPerTable) {
    console.log(
      `Wide table detected: ${columns.length} columns. Splitting into multiple tables.`
    );

    // Split columns into chunks
    for (let i = 0; i < columns.length; i += maxColumnsPerTable) {
      const columnChunk = formattedColumns.slice(i, i + maxColumnsPerTable);
      const dataChunk = formattedData.map((row) =>
        row.slice(i, i + maxColumnsPerTable)
      );

      // Check if we need a new page
      if (currentY > pageHeight - 100) {
        doc.addPage();
        currentY = margin;
      }

      // Add table part indicator
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      const partText = `Table Part ${
        Math.floor(i / maxColumnsPerTable) + 1
      } (Columns ${i + 1}-${Math.min(i + maxColumnsPerTable, columns.length)})`;
      doc.text(partText, margin, currentY);
      currentY += 8;

      autoTable(doc, {
        head: [columnChunk],
        body: dataChunk,
        startY: currentY,
        margin: { left: margin, right: margin },
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [66, 139, 202], fontSize: 8 },
        columnStyles: {},
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }
  } else {
    // Normal table handling for tables with reasonable column count
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = margin;
    }

    autoTable(doc, {
      head: [formattedColumns],
      body: formattedData,
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  return currentY;
};

// Helper function to add platform data to PDF
const addPlatformDataToPDF = (
  doc: jsPDF,
  platforms: string[],
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Create bullet points for platforms
  const platformText = platforms.map((platform) => `• ${platform}`).join("\n");
  const splitText = doc.splitTextToSize(platformText, pageWidth - 2 * margin);

  doc.text(splitText, margin, yPosition);
  yPosition += splitText.length * 5 + 10;

  return yPosition;
};

// Main PDF generation function
export const downloadMultiSectionReportAsPDF = (
  doc: jsPDF,
  data: MultiSectionReportData | any,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  console.log("MultiSectionReport PDF: Received data", data);
  let sectionsToProcess: SectionContent[] = [];

  // Handle different data structures
  if (Array.isArray(data)) {
    // If data is directly an array of sections (most common case from API)
    console.log(
      "MultiSectionReport PDF: Processing array of sections",
      data.length
    );
    sectionsToProcess = data;
  } else if (data?.display_data && Array.isArray(data.display_data)) {
    // If data has display_data property with array
    sectionsToProcess = data.display_data;
  } else if (data?.section_type && data?.content) {
    // If data is a single section
    sectionsToProcess = [data];
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No multi-section report data available", margin, yPosition);
    console.log("MultiSectionReport PDF: Invalid data structure", data);
    return yPosition + 20;
  }

  let currentY = yPosition;

  // Process each section
  sectionsToProcess.forEach((section: SectionContent) => {
    const { section_type, content } = section;
    const { title, data: sectionData, dataframe } = content;

    // Add section title
    currentY = addSectionTitle(
      doc,
      title,
      currentY,
      margin,
      pageWidth,
      pageHeight
    );

    // Process based on section type
    switch (section_type) {
      case "metric_grid":
        if (sectionData && typeof sectionData === "object") {
          currentY = addMetricGridToPDF(
            doc,
            sectionData,
            currentY,
            margin,
            pageWidth,
            pageHeight
          );
        }
        break;

      case "key_value":
        if (sectionData && typeof sectionData === "object") {
          currentY = addKeyValueToPDF(
            doc,
            sectionData,
            currentY,
            margin,
            pageWidth,
            pageHeight
          );
        }
        break;

      case "dataframe":
        if (dataframe && dataframe.columns && dataframe.data) {
          currentY = addDataFrameToPDF(
            doc,
            dataframe,
            currentY,
            margin,
            pageWidth,
            pageHeight
          );
        }
        break;

      case "platform_data":
        if (sectionData && Array.isArray(sectionData)) {
          currentY = addPlatformDataToPDF(
            doc,
            sectionData,
            currentY,
            margin,
            pageWidth,
            pageHeight
          );
        }
        break;

      default:
        // Handle unknown section types
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(`[${section_type} - data not displayed]`, margin, currentY);
        currentY += 15;
        break;
    }

    // Add spacing between sections
    currentY += 10;
  });

  return currentY;
};

// Helper function to add metric grid to Excel
const addMetricGridToExcel = (
  workbook: XLSX.WorkBook,
  title: string,
  data: Record<string, any>,
  messageIndex: number
) => {
  const sheetData = Object.entries(data).map(([key, value]) => ({
    Metric: convertSnakeCaseToTitleCase(key),
    Value: formatSmartValue(key, value),
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetData);
  const sheetName = `${title.replace(
    /[^a-z0-9]/gi,
    "_"
  )}_Msg${messageIndex}`.substring(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

// Helper function to add key-value data to Excel
const addKeyValueToExcel = (
  workbook: XLSX.WorkBook,
  title: string,
  data: Record<string, any>,
  messageIndex: number
) => {
  const sheetData = Object.entries(data).map(([key, value]) => ({
    Metric: convertSnakeCaseToTitleCase(key),
    Value: formatSmartValue(key, value),
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetData);
  const sheetName = `${title.replace(
    /[^a-z0-9]/gi,
    "_"
  )}_Msg${messageIndex}`.substring(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

// Helper function to add dataframe to Excel with smart column handling
const addDataFrameToExcel = (
  workbook: XLSX.WorkBook,
  title: string,
  dataframe: { columns: string[]; data: any[][] },
  messageIndex: number
) => {
  const { columns, data } = dataframe;
  const maxColumnsPerSheet = 15; // Excel can handle more columns than PDF

  // Format column headers
  const formattedColumns = columns.map((col) =>
    convertSnakeCaseToTitleCase(col)
  );

  // If table has too many columns, split into multiple sheets
  if (columns.length > maxColumnsPerSheet) {
    console.log(
      `Wide Excel table detected: ${columns.length} columns. Splitting into multiple sheets.`
    );

    // Split columns into chunks
    for (let i = 0; i < columns.length; i += maxColumnsPerSheet) {
      const columnChunk = formattedColumns.slice(i, i + maxColumnsPerSheet);

      // Create data for this chunk
      const dataChunk = data.map((row) => {
        const chunkRow: Record<string, any> = {};
        columnChunk.forEach((colName, chunkIndex) => {
          const originalIndex = i + chunkIndex;
          if (originalIndex < columns.length) {
            const originalColumnName = columns[originalIndex];
            chunkRow[colName] = formatSmartValue(
              originalColumnName,
              row[originalIndex]
            );
          }
        });
        return chunkRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(dataChunk);
      const partNumber = Math.floor(i / maxColumnsPerSheet) + 1;
      const baseSheetName = `${title.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_P${partNumber}_Msg${messageIndex}`;
      const sheetName = baseSheetName.substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
  } else {
    // Normal single sheet for reasonable column count
    // Format data with smart formatting
    const formattedData = data.map((row) =>
      row.reduce((acc, value, index) => {
        const columnName = columns[index];
        const formattedColumnName = formattedColumns[index];
        acc[formattedColumnName] = formatSmartValue(columnName, value);
        return acc;
      }, {} as Record<string, any>)
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const sheetName = `${title.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_Msg${messageIndex}`.substring(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }
};

// Helper function to add platform data to Excel
const addPlatformDataToExcel = (
  workbook: XLSX.WorkBook,
  title: string,
  platforms: string[],
  messageIndex: number
) => {
  const sheetData = platforms.map((platform, index) => ({
    "Platform #": index + 1,
    "Platform Name": platform,
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetData);
  const sheetName = `${title.replace(
    /[^a-z0-9]/gi,
    "_"
  )}_Msg${messageIndex}`.substring(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

// Main Excel generation function
export const downloadMultiSectionReportAsExcel = (
  workbook: XLSX.WorkBook,
  data: MultiSectionReportData | any,
  messageIndex: number,
  sheetIndex: number
) => {
  console.log("MultiSectionReport Excel: Received data", data);
  let sectionsToProcess: SectionContent[] = [];

  // Handle different data structures
  if (Array.isArray(data)) {
    // If data is directly an array of sections (most common case from API)
    console.log(
      "MultiSectionReport Excel: Processing array of sections",
      data.length
    );
    sectionsToProcess = data;
  } else if (data?.display_data && Array.isArray(data.display_data)) {
    // If data has display_data property with array
    sectionsToProcess = data.display_data;
  } else if (data?.section_type && data?.content) {
    // If data is a single section
    sectionsToProcess = [data];
  } else {
    // Create a placeholder sheet if no data
    const placeholderData = [
      { Section: "Multi-Section Report", Status: "No data available" },
    ];
    const worksheet = XLSX.utils.json_to_sheet(placeholderData);
    const sheetName = `MultiReport_Msg${messageIndex}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    console.log("MultiSectionReport Excel: Invalid data structure", data);
    return;
  }

  // Create a summary sheet first
  const summaryData = sectionsToProcess.map(
    (section: SectionContent, index: number) => ({
      "Section #": index + 1,
      "Section Type": section.section_type,
      Title: section.content.title,
      "Has Data": section.content.data ? "Yes" : "No",
      "Has DataFrame": section.content.dataframe ? "Yes" : "No",
    })
  );

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
  const summarySheetName = `Summary_Msg${messageIndex}`;
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, summarySheetName);

  // Process each section
  sectionsToProcess.forEach((section: SectionContent, index: number) => {
    const { section_type, content } = section;
    const { title, data: sectionData, dataframe } = content;

    // Process based on section type
    switch (section_type) {
      case "metric_grid":
        if (sectionData && typeof sectionData === "object") {
          addMetricGridToExcel(workbook, title, sectionData, messageIndex);
        }
        break;

      case "key_value":
        if (sectionData && typeof sectionData === "object") {
          addKeyValueToExcel(workbook, title, sectionData, messageIndex);
        }
        break;

      case "dataframe":
        if (dataframe && dataframe.columns && dataframe.data) {
          addDataFrameToExcel(workbook, title, dataframe, messageIndex);
        }
        break;

      case "platform_data":
        if (sectionData && Array.isArray(sectionData)) {
          addPlatformDataToExcel(workbook, title, sectionData, messageIndex);
        }
        break;

      default:
        // Create a sheet for unknown section types
        const unknownData = [
          {
            "Section Type": section_type,
            Title: title,
            Status: "Data type not supported for Excel export",
          },
        ];
        const unknownWorksheet = XLSX.utils.json_to_sheet(unknownData);
        const unknownSheetName =
          `Unknown_${index}_Msg${messageIndex}`.substring(0, 31);
        XLSX.utils.book_append_sheet(
          workbook,
          unknownWorksheet,
          unknownSheetName
        );
        break;
    }
  });
};

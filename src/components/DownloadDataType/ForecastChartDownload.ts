import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { ForecastChartData, DataFrameData } from "./types";
import { downloadDataFrameAsPDF, downloadDataFrameAsExcel } from "./DataFrameDownload";

// Add forecast data to PDF
export const downloadForecastDataAsPDF = (
  doc: jsPDF,
  data: ForecastChartData,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  let currentY = yPosition;

  if (data.historical_data) {
    currentY = downloadDataFrameAsPDF(
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

    currentY = downloadDataFrameAsPDF(
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

// Add forecast data to Excel
export const downloadForecastDataAsExcel = (
  workbook: XLSX.WorkBook,
  data: ForecastChartData,
  messageIndex: number,
  sheetIndex: number
) => {
  if (data.historical_data) {
    downloadDataFrameAsExcel(
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

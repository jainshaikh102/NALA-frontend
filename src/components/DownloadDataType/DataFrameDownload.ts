import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DataFrameData } from "./types";

// Add dataframe to PDF
export const downloadDataFrameAsPDF = (
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

// Add dataframe to Excel
export const downloadDataFrameAsExcel = (
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

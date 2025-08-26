import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { KeyValueData } from "./types";

// Add key-value data to PDF
export const downloadKeyValueAsPDF = (
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

// Add key-value data to Excel
export const downloadKeyValueAsExcel = (
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

import jsPDF from "jspdf";
import * as XLSX from "xlsx";

// Add text content to PDF
export const downloadTextAsPDF = (
  doc: jsPDF,
  content: string,
  yPosition: number,
  margin: number,
  pageWidth: number,
  pageHeight: number
): number => {
  if (!content) return yPosition;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Text Content:", margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const splitContent = doc.splitTextToSize(content, pageWidth - 2 * margin);
  doc.text(splitContent, margin, yPosition);
  
  return yPosition + splitContent.length * 5 + 10;
};

// Add text content to Excel
export const downloadTextAsExcel = (
  workbook: XLSX.WorkBook,
  content: string,
  messageIndex: number,
  sheetIndex: number
) => {
  if (!content) return;
  
  const textData = [
    { Content: content }
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(textData);
  const sheetName = `Text_Msg${messageIndex}`;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

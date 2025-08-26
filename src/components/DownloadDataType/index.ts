// Export all download functions
export {
  downloadDataFrameAsPDF,
  downloadDataFrameAsExcel,
} from "./DataFrameDownload";
export {
  downloadKeyValueAsPDF,
  downloadKeyValueAsExcel,
} from "./KeyValueDownload";
export {
  downloadForecastDataAsPDF,
  downloadForecastDataAsExcel,
} from "./ForecastChartDownload";
export { downloadImageFromBase64 } from "./ImageDownload";
export { downloadVideoFromUrl } from "./VideoDownload";
export {
  downloadMultiSectionReportAsPDF,
  downloadMultiSectionReportAsExcel,
} from "./MultiSectionReportDownload";
export {
  downloadViralityReportAsPDF,
  downloadViralityReportAsExcel,
} from "./ViralityReportDownload";
export { downloadTextAsPDF, downloadTextAsExcel } from "./TextDownload";

// Export types
export * from "./types";
export type { MultiSectionReportData } from "./MultiSectionReportDownload";
export type { ViralityReportData } from "./ViralityReportDownload";

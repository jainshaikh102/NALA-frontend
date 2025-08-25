# DownloadDataType Components

This directory contains modular download components for different data types in the NALA frontend application. Each component handles PDF and Excel generation for specific data types.

## Structure

```
DownloadDataType/
├── types.ts                           # Shared interfaces and types
├── index.ts                          # Main export file
├── DataFrameDownload.ts              # DataFrame PDF/Excel generation
├── KeyValueDownload.ts               # Key-Value data PDF/Excel generation
├── ForecastChartDownload.ts          # Forecast chart data PDF/Excel generation
├── ImageDownload.ts                  # Image download functionality
├── VideoDownload.ts                  # Video download functionality
├── MultiSectionReportDownload.ts     # Multi-section report PDF/Excel generation (placeholder)
├── ViralityReportDownload.ts         # Virality report PDF/Excel generation (placeholder)
├── TextDownload.ts                   # Text content PDF/Excel generation
└── README.md                         # This documentation file
```

## Components Overview

### Core Components (Fully Implemented)

#### DataFrameDownload.ts

- **Functions**: `downloadDataFrameAsPDF`, `downloadDataFrameAsExcel`
- **Purpose**: Handles tabular data with columns and rows
- **PDF**: Creates formatted tables using jsPDF autoTable
- **Excel**: Converts to worksheet with proper column headers

#### KeyValueDownload.ts

- **Functions**: `downloadKeyValueAsPDF`, `downloadKeyValueAsExcel`
- **Purpose**: Handles metric/value pairs
- **PDF**: Creates formatted metric tables
- **Excel**: Converts to key-value worksheet format

#### ForecastChartDownload.ts

- **Functions**: `downloadForecastDataAsPDF`, `downloadForecastDataAsExcel`
- **Purpose**: Handles forecast data with historical and prediction data
- **PDF**: Combines historical and forecast data tables
- **Excel**: Creates separate sheets for historical and forecast data

#### ImageDownload.ts

- **Functions**: `downloadImageFromBase64`
- **Purpose**: Downloads base64 encoded images
- **Format**: PNG files with timestamp naming

#### VideoDownload.ts

- **Functions**: `downloadVideoFromUrl`
- **Purpose**: Downloads videos from URLs
- **Format**: MP4 files with timestamp naming

#### TextDownload.ts

- **Functions**: `downloadTextAsPDF`, `downloadTextAsExcel`
- **Purpose**: Handles plain text content
- **PDF**: Formatted text with proper wrapping
- **Excel**: Simple text content in worksheet

### Advanced Components (Fully Implemented)

#### MultiSectionReportDownload.ts

- **Functions**: `downloadMultiSectionReportAsPDF`, `downloadMultiSectionReportAsExcel`
- **Purpose**: Handles complex multi-section reports with various data types
- **PDF**: Creates formatted sections with titles, tables, and bullet points
- **Excel**: Creates multiple sheets for each section with summary sheet
- **Features**:
  - Smart value formatting using helper functions
  - Supports metric_grid, key_value, dataframe, and platform_data sections
  - Automatic currency and number formatting
  - Proper column header formatting (snake_case to Title Case)
  - Large number formatting (K/M/B/T suffixes)
  - Earnings detection and currency formatting

#### ViralityReportDownload.ts

- **Functions**: `downloadViralityReportAsPDF`, `downloadViralityReportAsExcel`
- **Purpose**: Handles virality analysis reports with artist metrics and growth data
- **PDF**: Creates formatted report with color-coded status, growth tables, and detailed metrics
- **Excel**: Creates multiple sheets for summary and detailed platform metrics
- **Features**:
  - Color-coded status indicators (Viral=Green, Trending=Blue, Stable=Purple, Declining=Red)
  - Smart value formatting for all metrics
  - Growth percentage calculations and formatting
  - Platform-specific metrics with baseline vs recent comparisons
  - Automatic table splitting for large metric sets
  - Professional report layout with sections for summary, analysis, and detailed metrics

## Usage

### Import Individual Components

```typescript
import {
  downloadDataFrameAsPDF,
  downloadDataFrameAsExcel,
} from "../components/DownloadDataType/DataFrameDownload";
```

### Import from Index (Recommended)

```typescript
import {
  downloadDataFrameAsPDF,
  downloadKeyValueAsPDF,
  downloadImageFromBase64,
} from "../components/DownloadDataType";
```

### Using in downloadUtils.ts

The main `downloadUtils.ts` file imports and uses these components in the `addDataToPDF` and `addDataToExcel` helper functions.

## Data Type Mapping

| Data Type              | PDF Function                      | Excel Function                      | Status                                     |
| ---------------------- | --------------------------------- | ----------------------------------- | ------------------------------------------ |
| `dataframe`            | `downloadDataFrameAsPDF`          | `downloadDataFrameAsExcel`          | ✅ Implemented                             |
| `key_value`            | `downloadKeyValueAsPDF`           | `downloadKeyValueAsExcel`           | ✅ Implemented                             |
| `forecast_chart`       | `downloadForecastDataAsPDF`       | `downloadForecastDataAsExcel`       | ✅ Implemented                             |
| `image_base64`         | N/A                               | N/A                                 | ✅ Implemented (`downloadImageFromBase64`) |
| `video_url`            | N/A                               | N/A                                 | ✅ Implemented (`downloadVideoFromUrl`)    |
| `text`                 | `downloadTextAsPDF`               | `downloadTextAsExcel`               | ✅ Implemented                             |
| `multi_section_report` | `downloadMultiSectionReportAsPDF` | `downloadMultiSectionReportAsExcel` | ✅ Implemented                             |
| `virality_report`      | `downloadViralityReportAsPDF`     | `downloadViralityReportAsExcel`     | ✅ Implemented                             |

## Benefits of This Structure

1. **Modularity**: Each data type has its own focused component
2. **Maintainability**: Easy to update specific data type handling
3. **Scalability**: Simple to add new data types
4. **Testability**: Individual components can be tested in isolation
5. **Code Organization**: Clear separation of concerns
6. **Reduced File Size**: Main downloadUtils.ts reduced from 691 to 409 lines

## Adding New Data Types

To add a new data type:

1. Create a new file: `[DataType]Download.ts`
2. Implement PDF and Excel functions following the existing pattern
3. Add exports to `index.ts`
4. Update the switch statements in `downloadUtils.ts`
5. Add documentation to this README

## Dependencies

- `jspdf`: PDF generation
- `jspdf-autotable`: Table formatting in PDFs
- `xlsx`: Excel file generation
- `sonner`: Toast notifications

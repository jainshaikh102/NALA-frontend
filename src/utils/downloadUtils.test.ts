// Simple test file to verify download utilities work correctly
// This is not a full test suite, just a basic verification

import { downloadChatAsPDF, downloadChatAsExcel } from './downloadUtils';

// Mock chat messages for testing
const mockMessages = [
  {
    id: 1,
    type: 'user' as const,
    content: 'What are the top performing tracks?',
    timestamp: '10:30 AM',
  },
  {
    id: 2,
    type: 'bot' as const,
    content: 'Here are the top performing tracks based on your data:',
    timestamp: '10:31 AM',
    displayData: {
      dataframe: {
        index: [0, 1, 2],
        columns: ['Track Name', 'Artist', 'Streams', 'Revenue'],
        data: [
          ['Song A', 'Artist 1', 1000000, 5000],
          ['Song B', 'Artist 2', 800000, 4200],
          ['Song C', 'Artist 3', 600000, 3100]
        ]
      }
    },
    dataType: 'dataframe'
  },
  {
    id: 3,
    type: 'user' as const,
    content: 'Can you show me the forecast for next month?',
    timestamp: '10:32 AM',
  },
  {
    id: 4,
    type: 'bot' as const,
    content: 'Here is the forecast data for next month:',
    timestamp: '10:33 AM',
    displayData: {
      historical_data: {
        index: [0, 1, 2],
        columns: ['Date', 'Streams'],
        data: [
          ['2024-01-01', 100000],
          ['2024-01-02', 120000],
          ['2024-01-03', 110000]
        ]
      },
      forecast_data: {
        index: [0, 1, 2],
        columns: ['Date', 'Predicted_Streams', 'Lower_Bound', 'Upper_Bound'],
        data: [
          ['2024-02-01', 115000, 100000, 130000],
          ['2024-02-02', 125000, 110000, 140000],
          ['2024-02-03', 120000, 105000, 135000]
        ]
      }
    },
    dataType: 'forecast_chart'
  }
];

// Test function to verify PDF generation
export const testPDFGeneration = () => {
  console.log('Testing PDF generation...');
  try {
    downloadChatAsPDF(mockMessages, 'Test Chat Session');
    console.log('PDF generation test completed successfully');
    return true;
  } catch (error) {
    console.error('PDF generation test failed:', error);
    return false;
  }
};

// Test function to verify Excel generation
export const testExcelGeneration = () => {
  console.log('Testing Excel generation...');
  try {
    downloadChatAsExcel(mockMessages, 'Test Chat Session');
    console.log('Excel generation test completed successfully');
    return true;
  } catch (error) {
    console.error('Excel generation test failed:', error);
    return false;
  }
};

// Test function to verify empty messages handling
export const testEmptyMessages = () => {
  console.log('Testing empty messages handling...');
  try {
    downloadChatAsPDF([], 'Empty Chat');
    downloadChatAsExcel([], 'Empty Chat');
    console.log('Empty messages test completed successfully');
    return true;
  } catch (error) {
    console.error('Empty messages test failed:', error);
    return false;
  }
};

// Run all tests
export const runAllTests = () => {
  console.log('Running download utilities tests...');
  
  const pdfTest = testPDFGeneration();
  const excelTest = testExcelGeneration();
  const emptyTest = testEmptyMessages();
  
  const allPassed = pdfTest && excelTest && emptyTest;
  
  console.log(`All tests ${allPassed ? 'PASSED' : 'FAILED'}`);
  return allPassed;
};

// Export mock data for manual testing
export { mockMessages };

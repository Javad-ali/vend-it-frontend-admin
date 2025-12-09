import { exportToCSV, exportToExcel, formatDataForExport, ExportColumn } from '@/lib/export';

// Mock URL and Blob for download testing
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document methods
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

document.createElement = jest.fn(() => ({
  setAttribute: jest.fn(),
  style: {},
  click: mockClick,
})) as any;

document.body.appendChild = mockAppendChild;
document.body.removeChild = mockRemoveChild;

describe('Export Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatDataForExport', () => {
    it('should format data with columns', () => {
      const data = [
        { id: 1, name: 'John', email: 'john@test.com' },
        { id: 2, name: 'Jane', email: 'jane@test.com' },
      ];
      
      const columns: ExportColumn[] = [
        { key: 'name', label: 'Full Name' },
        { key: 'email', label: 'Email Address' },
      ];
      
      const result = formatDataForExport(data, columns);
      
      expect(result[0]).toHaveProperty('Full Name', 'John');
      expect(result[0]).toHaveProperty('Email Address', 'john@test.com');
    });

    it('should apply format function', () => {
      const data = [{ price: 1000 }];
      
      const columns: ExportColumn[] = [
        { key: 'price', label: 'Price', format: (v) => `$${v}` },
      ];
      
      const result = formatDataForExport(data, columns);
      
      expect(result[0]).toHaveProperty('Price', '$1000');
    });

    it('should return original data if no columns specified', () => {
      const data = [{ id: 1, name: 'John' }];
      
      const result = formatDataForExport(data);
      
      expect(result).toEqual(data);
    });
  });

  describe('exportToCSV', () => {
    it('should not export empty data', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      exportToCSV([], 'test.csv');
      
      expect(consoleSpy).toHaveBeenCalledWith('No data to export');
      consoleSpy.mockRestore();
    });

    it('should create CSV file', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      
      exportToCSV(data, 'users.csv');
      
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('exportToExcel', () => {
    it('should not export empty data', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await exportToExcel([], 'test.xlsx');
      
      expect(consoleSpy).toHaveBeenCalledWith('No data to export');
      consoleSpy.mockRestore();
    });
  });
});

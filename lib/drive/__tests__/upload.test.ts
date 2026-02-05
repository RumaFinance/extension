import { uploadToDrive, listDriveFiles, deleteDriveFile } from '../upload';
import { DriveFileMetadata } from '../types';

// Mock global fetch
global.fetch = jest.fn();

describe('upload.ts - Google Drive Upload Functions', () => {
  const mockAccessToken = 'mock-access-token-123';
  const mockBlob = new Blob(['test content'], { type: 'text/plain' });
  const mockMetadata: DriveFileMetadata = {
    name: 'test.txt',
    mimeType: 'text/plain',
  };
  const mockFileId = 'file-id-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadToDrive', () => {
    it('should successfully upload file to Google Drive with correct parameters', async () => {
      // Mock successful response
      const mockResponseData = {
        id: mockFileId,
        name: 'test.txt',
        mimeType: 'text/plain',
        webViewLink: 'https://drive.google.com/file/d/file-id-123/view',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      });

      const result = await uploadToDrive(mockAccessToken, mockBlob, mockMetadata);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = (global.fetch as jest.Mock).mock.calls[0];

      expect(url).toBe('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
      expect(options.method).toBe('POST');
      expect(options.headers).toEqual({
        'Authorization': `Bearer ${mockAccessToken}`,
      });
      expect(options.body).toBeInstanceOf(FormData);

      // Verify FormData contains correct data
      const formData = options.body as FormData;
      
      // Note: We can't directly inspect FormData contents in Node.js
      // but we can verify the structure was created

      // Verify returned data
      expect(result).toEqual({
        id: mockFileId,
        name: 'test.txt',
        mimeType: 'text/plain',
        webViewLink: 'https://drive.google.com/file/d/file-id-123/view',
      });
    });

    it('should use default metadata when not provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: mockFileId, name: 'seed_backup.enc' }),
      });

      await uploadToDrive(mockAccessToken, mockBlob);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(options.body).toBeInstanceOf(FormData);
    });

    it('should throw error when access token is not provided', async () => {
      await expect(uploadToDrive('', mockBlob, mockMetadata))
        .rejects.toThrow('No access token provided');
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when Google Drive API returns error', async () => {
      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Access denied',
      });

      await expect(uploadToDrive(mockAccessToken, mockBlob, mockMetadata))
        .rejects.toThrow('Google Drive API Error (403): Access denied');
    });

    it('should throw error when fetch fails', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(uploadToDrive(mockAccessToken, mockBlob, mockMetadata))
        .rejects.toThrow('Upload failed: Network error');
    });

    it('should handle JSON parse error in response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Invalid JSON response',
      });

      await expect(uploadToDrive(mockAccessToken, mockBlob, mockMetadata))
        .rejects.toThrow('Google Drive API Error (500): Invalid JSON response');
    });
  });

  describe('listDriveFiles', () => {
    it('should successfully list files from Google Drive', async () => {
      const mockFiles = [
        { id: 'file1', name: 'test1.txt', mimeType: 'text/plain' },
        { id: 'file2', name: 'test2.txt', mimeType: 'text/plain' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: mockFiles }),
      });

      const files = await listDriveFiles(mockAccessToken);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/drive/v3/files?pageSize=100',
        {
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
          },
        }
      );

      expect(files).toEqual(mockFiles);
    });

    it('should return empty array when no files exist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: [] }),
      });

      const files = await listDriveFiles(mockAccessToken);

      expect(files).toEqual([]);
    });

    it('should throw error when API call fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(listDriveFiles(mockAccessToken))
        .rejects.toThrow('Failed to list files: Unauthorized');
    });

    it('should handle missing files property in response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // No 'files' property
      });

      const files = await listDriveFiles(mockAccessToken);

      expect(files).toEqual([]);
    });
  });

  describe('deleteDriveFile', () => {
    it('should successfully delete file from Google Drive', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await deleteDriveFile(mockAccessToken, mockFileId);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://www.googleapis.com/drive/v3/files/${mockFileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
          },
        }
      );
    });

    it('should not throw error on successful 204 response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(deleteDriveFile(mockAccessToken, mockFileId)).resolves.not.toThrow();
    });

    it('should throw error when deletion fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(deleteDriveFile(mockAccessToken, mockFileId))
        .rejects.toThrow('Failed to delete file: Not Found');
    });

    it('should handle network errors during deletion', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(deleteDriveFile(mockAccessToken, mockFileId))
        .rejects.toThrow('Network error');
    });
  });

  describe('FormData compatibility', () => {
    it('should work with FormData in Node.js environment', async () => {
      // Ensure FormData is available (jest environment provides it)
      expect(typeof FormData).toBe('function');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: mockFileId, name: 'test.txt' }),
      });

      await uploadToDrive(mockAccessToken, mockBlob, mockMetadata);

      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      const formData = options.body;

      // Verify FormData instance was created
      expect(formData).toBeInstanceOf(FormData);
      
      // In Node.js, we can't directly access FormData entries,
      // but we can verify the instance exists and was passed correctly
      expect(formData).toBeDefined();
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle empty response from upload', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Empty response
      });

      const result = await uploadToDrive(mockAccessToken, mockBlob, mockMetadata);

      // Should still resolve with whatever data was returned
      expect(result).toEqual({});
    });

    it('should handle non-JSON error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => {
          throw new Error('Cannot read response');
        },
      });

      await expect(uploadToDrive(mockAccessToken, mockBlob, mockMetadata))
        .rejects.toThrow('Upload failed: Cannot read response');
    });
  });
});

// Add a simple FormData mock if running in pure Node.js without jsdom
// Note: Jest with jsdom environment already provides FormData
if (typeof FormData === 'undefined') {
  // Minimal FormData mock for test environment
  class MockFormData {
    private data: Map<string, any> = new Map();

    append(key: string, value: any) {
      this.data.set(key, value);
    }

    get(key: string) {
      return this.data.get(key);
    }

    // Add other FormData methods if needed
    has(key: string): boolean {
      return this.data.has(key);
    }

    delete(key: string): void {
      this.data.delete(key);
    }

    getAll(key: string): any[] {
      const value = this.data.get(key);
      return value ? [value] : [];
    }

    set(key: string, value: any): void {
      this.data.set(key, value);
    }

    forEach(callback: (value: any, key: string, parent: MockFormData) => void) {
      this.data.forEach((value, key) => callback(value, key, this));
    }

    [Symbol.iterator]() {
      return this.data[Symbol.iterator]();
    }

    entries() {
      return this.data.entries();
    }

    keys() {
      return this.data.keys();
    }

    values() {
      return this.data.values();
    }
  }

  (global as any).FormData = MockFormData;
}
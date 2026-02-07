import { DriveFileMetadata, UploadResult } from './types';

/**
 * Upload encrypted blob to Google Drive
 */
export async function uploadToDrive(
  accessToken: string,
  blob: Blob,
  metadata: DriveFileMetadata = { name: 'seed_backup.enc', mimeType: 'application/octet-stream' }
): Promise<UploadResult> {
  if (!accessToken) {
    throw new Error('No access token provided');
  }
  
  try {
    // Create multipart/form-data request
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', blob);
    
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Drive API Error (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    return {
      id: result.id,
      name: result.name,
      mimeType: result.mimeType,
      webViewLink: result.webViewLink,
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List files in Google Drive (optional utility)
 */
export async function listDriveFiles(accessToken: string): Promise<any[]> {
  const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=100', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to list files: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.files || [];
}

/**
 * Delete file from Google Drive (optional utility)
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
}
export interface DriveConfig {
  clientId: string;
  scopes: string;
}

export interface EncryptionOptions {
  iterations?: number;
  saltLength?: number;
  ivLength?: number;
}

export interface DriveFileMetadata {
  name: string;
  mimeType: string;
}

export interface EncryptedBlobData {
  blob: Blob;
  metadata: {
    salt: Uint8Array;
    iv: Uint8Array;
  };
}

export interface UploadResult {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}
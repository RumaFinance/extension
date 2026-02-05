import { EncryptionOptions, EncryptedBlobData } from './types';

const DEFAULT_OPTIONS: EncryptionOptions = {
  iterations: 100000,
  saltLength: 16,
  ivLength: 12,
};

/**
 * Validate seed phrase (basic validation)
 */
export function validateSeedPhrase(seedPhrase: string): boolean {
  const words = seedPhrase.trim().split(/\s+/);
  return words.length >= 12 && words.length <= 24; // Standard seed phrases are 12-24 words
}

/**
 * Encrypt text using AES-GCM with PBKDF2 key derivation
 */
export async function encryptText(
  text: string,
  password: string,
  options: EncryptionOptions = DEFAULT_OPTIONS
): Promise<EncryptedBlobData> {
  const encoder = new TextEncoder();
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(options.saltLength || 16));
  const iv = crypto.getRandomValues(new Uint8Array(options.ivLength || 12));
  
  try {
    // Derive key from password using PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: options.iterations || 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Encrypt the text
    const encryptedContent = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(text)
    );
    
    // Combine salt + iv + encrypted content into a single blob
    const combinedData = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
    combinedData.set(salt, 0);
    combinedData.set(iv, salt.length);
    combinedData.set(new Uint8Array(encryptedContent), salt.length + iv.length);
    
    const blob = new Blob([combinedData], { type: 'application/octet-stream' });
    
    return {
      blob,
      metadata: { salt, iv },
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt text from encrypted blob
 */
export async function decryptText(
  encryptedBlob: Blob,
  password: string,
  options: EncryptionOptions = DEFAULT_OPTIONS
): Promise<string> {
  try {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const saltLength = options.saltLength || 16;
    const ivLength = options.ivLength || 12;
    
    // Extract components from the combined data
    const salt = new Uint8Array(arrayBuffer, 0, saltLength);
    const iv = new Uint8Array(arrayBuffer, saltLength, ivLength);
    const encryptedContent = new Uint8Array(arrayBuffer, saltLength + ivLength);
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: options.iterations || 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt the content
    const decryptedContent = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedContent
    );
    
    return decoder.decode(decryptedContent);
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
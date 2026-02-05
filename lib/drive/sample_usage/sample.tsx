import React, { useState } from 'react';
import {
  requestAccessToken,
  getAccessToken,
  encryptText,
  uploadToDrive,
  validateSeedPhrase,
  DEFAULT_SCOPES,
  DriveConfig,
} from '../index';

// Configuration from environment variables
const driveConfig: DriveConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  scopes: DEFAULT_SCOPES,
};

export const BackupManager: React.FC = () => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setStatus('Connecting to Google Drive...');
      
      await requestAccessToken(driveConfig);
      setStatus('Connected to Google Drive!');
    } catch (error) {
      setStatus(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEncryptAndUpload = async () => {
    if (!validateSeedPhrase(seedPhrase)) {
      setStatus('Please enter a valid seed phrase (12-24 words)');
      return;
    }

    if (!password) {
      setStatus('Please enter an encryption password');
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setStatus('Please connect to Google Drive first');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Encrypting seed phrase...');
      
      // Step 1: Encrypt
      const encryptedData = await encryptText(seedPhrase, password);
      setStatus('Encryption complete. Uploading to Drive...');
      
      // Step 2: Upload
      const result = await uploadToDrive(accessToken, encryptedData.blob, {
        name: `seed_backup_${Date.now()}.enc`,
        mimeType: 'application/octet-stream',
      });
      
      setStatus(`Backup successful! File ID: ${result.id}`);
      
      // Clear sensitive data
      setSeedPhrase('');
      setPassword('');
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backup-manager">
      <h2>Seed Phrase Backup</h2>
      
      <div className="mb-4">
        <button 
          onClick={handleConnect} 
          disabled={isLoading || !!getAccessToken()}
          className="btn btn-primary"
        >
          {getAccessToken() ? '✅ Connected' : '🔗 Connect Google Drive'}
        </button>
      </div>

      <div className="mb-4">
        <label>Seed Phrase</label>
        <textarea
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          placeholder="Enter your 12-24 word seed phrase"
          rows={3}
          disabled={isLoading || !getAccessToken()}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label>Encryption Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a strong password"
          disabled={isLoading || !getAccessToken()}
          className="w-full"
        />
      </div>

      <button
        onClick={handleEncryptAndUpload}
        disabled={isLoading || !seedPhrase || !password || !getAccessToken()}
        className="btn btn-success"
      >
        {isLoading ? 'Processing...' : 'Encrypt & Backup to Drive'}
      </button>

      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre className="text-sm whitespace-pre-wrap">{status}</pre>
        </div>
      )}
    </div>
  );
};
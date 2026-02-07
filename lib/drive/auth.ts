import { DriveConfig } from './types';

declare global {
  interface Window {
    google: any;
  }
}

let accessToken: string | null = null;

/**
 * Initialize Google OAuth2 token client
 * Note: Requires google.accounts.oauth2 to be loaded
 */
export function initGoogleAuth(config: DriveConfig): void {
  if (!window.google || !window.google.accounts) {
    throw new Error('Google OAuth2 library not loaded. Include <script src="https://accounts.google.com/gsi/client"></script>');
  }
}

/**
 * Request access token from Google OAuth2
 * @returns Promise that resolves with the access token
 */
export async function requestAccessToken(config: DriveConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: config.clientId,
      scope: config.scopes,
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(`OAuth Error: ${response.error}`));
          return;
        }
        accessToken = response.access_token;
        resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken();
  });
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return accessToken !== null;
}

/**
 * Revoke access token and reset authentication
 */
export async function revokeAccessToken(): Promise<void> {
  if (!accessToken) return;
  
  try {
    await fetch('https://accounts.google.com/o/oauth2/revoke?token=' + accessToken);
  } catch (error) {
    console.warn('Failed to revoke token:', error);
  } finally {
    accessToken = null;
  }
}
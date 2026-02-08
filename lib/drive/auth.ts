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
export async function requestAccessToken(driveConfig: DriveConfig): Promise<string> {
  const CLIENT_ID = driveConfig.clientId;
  const REDIRECT_URL = chrome.identity.getRedirectURL();
  const SCOPES = driveConfig.scopes;
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('redirect_uri', REDIRECT_URL);
  authUrl.searchParams.set('scope', SCOPES);

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.href,
        interactive: true,
      },
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }

        if (!responseUrl) {
          return reject(new Error('Auth flow cancelled or failed.'));
        }

        const url = new URL(responseUrl);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const token = hashParams.get('access_token');

        if (token) {
          resolve(accessToken = token);
        } else {
          reject(new Error('Token not found in response URL.'));
        }
      }
    );
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
# Drive Backup Utils
Secure encryption and Google Drive backup for seed phrases.

## Environment Variables

~~~ bash
# Required: Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
~~~
Get your Client ID from Google Cloud Console.


## Quick Usage

~~~ bash
import { 
  requestAccessToken, 
  encryptText, 
  uploadToDrive 
} from '@/utils/drive';

// 1. Connect to Google Drive
const token = await requestAccessToken({
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  scopes: 'https://www.googleapis.com/auth/drive.file'
});

// 2. Encrypt your seed phrase locally
const encrypted = await encryptText(
  'your seed phrase here',
  'your-strong-password'
);

// 3. Upload to Drive
const result = await uploadToDrive(token, encrypted.blob, {
  name: 'seed_backup.enc'
});

console.log(`Backup saved: ${result.id}`);
~~~
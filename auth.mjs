import { DeviceCodeCredential } from '@azure/identity';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokenFilePath = path.join(__dirname, '.access-token.txt');
const clientId = process.env.AZURE_CLIENT_ID || '0c3301de-9e6b-4dd4-bf4d-46ab2ac4f3d8';
const tenantId = process.env.AZURE_TENANT_ID || 'common';
const scopes = ['Notes.Read', 'Notes.ReadWrite', 'Notes.Create', 'User.Read', 'offline_access'];

console.log('Initiating Microsoft Device Code Authentication...');

const credential = new DeviceCodeCredential({
  clientId,
  tenantId,
  userPromptCallback: (info) => {
    console.log('\n==================================================');
    console.log('🔐 ACTION REQUIRED: OPEN BROWSER AND ENTER CODE');
    console.log(`URL:  ${info.verificationUri}`);
    console.log(`CODE: ${info.userCode}`);
    console.log('==================================================\n');
  }
});

try {
  const tokenResponse = await credential.getToken(scopes);
  const expiresOnTimestamp = tokenResponse.expiresOnTimestamp || (Date.now() + 3600 * 1000);
  const tokenData = {
    token: tokenResponse.token,
    clientId: clientId,
    scopes: scopes,
    createdAt: new Date().toISOString(),
    expiresOn: new Date(expiresOnTimestamp).toISOString()
  };
  fs.writeFileSync(tokenFilePath, JSON.stringify(tokenData, null, 2));
  console.log('✅ Token saved successfully to .access-token.txt!');
  process.exit(0);
} catch (err) {
  console.error('❌ Authentication failed:', err.message);
  process.exit(1);
}

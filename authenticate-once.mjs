import { DeviceCodeCredential } from '@azure/identity';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientId = process.env.AZURE_CLIENT_ID || '14d82eec-204b-4c2f-b7e8-296a70dab67e';
const tenantId = process.env.AZURE_TENANT_ID || 'common';
const scopes = ['Notes.Read', 'Notes.ReadWrite', 'Notes.Create', 'User.Read'];
const tokenFilePath = path.join(__dirname, '.access-token.txt');

const credential = new DeviceCodeCredential({
  clientId,
  tenantId,
  userPromptCallback(info) {
    console.log(`MICROSOFT_DEVICE_LOGIN_URL=${info.verificationUri}`);
    console.log(`MICROSOFT_DEVICE_CODE=${info.userCode}`);
    console.log('Waiting for Microsoft sign-in to complete...');
  }
});

try {
  const tokenResponse = await credential.getToken(scopes);
  const tokenData = {
    token: tokenResponse.token,
    clientId,
    scopes,
    createdAt: new Date().toISOString(),
    expiresOn: tokenResponse.expiresOnTimestamp
      ? new Date(tokenResponse.expiresOnTimestamp).toISOString()
      : null
  };
  fs.writeFileSync(tokenFilePath, JSON.stringify(tokenData, null, 2), { mode: 0o600 });
  console.log('AUTHENTICATION_COMPLETE');
} catch (error) {
  console.error(`AUTHENTICATION_FAILED=${error.message}`);
  process.exitCode = 1;
}

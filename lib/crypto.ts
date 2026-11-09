import crypto from 'crypto';

const MASTER_KEY_STRING = process.env.FOBIGN_E2EE_ENCRYPTION_KEY || 'fobign-master-e2ee-key-secure-2026-strict-monochrome-gateway-32b';
// 32-byte key derived via SHA-256
const ENCRYPTION_KEY = crypto.createHash('sha256').update(MASTER_KEY_STRING).digest();

/**
 * Encrypts sensitive request prompts and model responses at rest using AES-256-GCM.
 * User or public inspection cannot decrypt without the master secret.
 */
export function encryptPayload(plainText: string): string {
  if (!plainText) return '';
  try {
    const iv = crypto.randomBytes(12); // Standard 96-bit IV
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('E2EE Encryption Error:', err);
    return plainText;
  }
}

/**
 * Decrypts sensitive user communications securely for authorized admin view.
 */
export function decryptPayload(cipherString: string): string {
  if (!cipherString) return '';
  try {
    const parts = cipherString.split(':');
    if (parts.length !== 3) return cipherString; // Not encrypted / legacy plain
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return '[Decryption Failed - Encrypted Cipher Protected]';
  }
}


import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer | null {
  const raw = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!raw) return null;
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== KEY_LENGTH) return null;
  return buf;
}

/**
 * Encrypt a plaintext string (e.g. OAuth access token) for storage at rest.
 * Returns base64(IV + authTag + ciphertext) for storage in DB.
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  if (!key) {
    throw new Error(
      "GITHUB_TOKEN_ENCRYPTION_KEY must be set to encrypt tokens (use: openssl rand -base64 32)"
    );
  }
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/**
 * Decrypt a value produced by encryptToken. Handles legacy plaintext values
 * (returns as-is) so existing DB rows keep working until re-connected.
 */
export function decryptToken(stored: string): string {
  const key = getEncryptionKey();
  if (!key) return stored;
  let buf: Buffer;
  try {
    buf = Buffer.from(stored, "base64");
  } catch {
    return stored;
  }
  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    return stored;
  }
  const iv = buf.subarray(0, IV_LENGTH);
  const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(ciphertext) + decipher.final("utf8");
  } catch {
    return stored;
  }
}

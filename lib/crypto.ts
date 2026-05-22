import crypto from "crypto";

const COOKIE_SECRET = process.env.COOKIE_SECRET || "default_super_secret_cookie_key_9876543210123456";
const PIN_SECRET = process.env.PIN_SECRET || "default_super_secret_pin_key_1234567890123456";

// Derive a 32-byte key for AES-256-GCM from the secret
const derivedPinKey = crypto.createHash("sha256").update(PIN_SECRET).digest();

/**
 * Signs a value by appending a HMAC SHA-256 signature.
 * Output: value.signature
 */
export function signToken(data: string): string {
  const hmac = crypto.createHmac("sha256", COOKIE_SECRET);
  hmac.update(data);
  const signature = hmac.digest("hex");
  return `${data}.${signature}`;
}

/**
 * Verifies a signed value and returns the original data if signature is valid.
 * Returns null if invalid or verification fails.
 */
export function verifyToken(token: string): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;

  const hmac = crypto.createHmac("sha256", COOKIE_SECRET);
  hmac.update(data);
  const expectedSignature = hmac.digest("hex");

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return null;
    }
    
    if (crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return data;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output: ivHex:encryptedHex:authTagHex
 */
export function encryptText(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", derivedPinKey, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

/**
 * Decrypts an encrypted string using AES-256-GCM.
 * Returns plaintext if successful, or the original input if it's not encrypted (for fallback/backwards compatibility).
 */
export function decryptText(encryptedText: string): string {
  if (!encryptedText) return "";
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    // If it doesn't match the format, return as-is (graceful fallback for unencrypted legacy PINs)
    return encryptedText;
  }
  
  try {
    const [ivHex, encryptedHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    const decipher = crypto.createDecipheriv("aes-256-gcm", derivedPinKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (err) {
    console.error("PIN Decryption failed, returning input as fallback:", err);
    return encryptedText;
  }
}

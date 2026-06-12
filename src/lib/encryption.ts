import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_SECRET;

if (!ENCRYPTION_KEY) {
    throw new Error('API_KEY_ENCRYPTION_SECRET environment variable is not defined');
}

/**
 * Encrypt sensitive data using AES encryption
 * Used for storing API keys and other sensitive data in database
 * 
 * @param plaintext The text to encrypt
 * @returns Encrypted ciphertext
 */
export function encrypt(plaintext: string): string {
    if (!plaintext) return '';

    try {
        const ciphertext = CryptoJS.AES.encrypt(plaintext, ENCRYPTION_KEY).toString();
        return ciphertext;
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt encrypted data
 * 
 * @param ciphertext The encrypted text to decrypt
 * @returns Decrypted plaintext
 */
export function decrypt(ciphertext: string): string {
    if (!ciphertext) return '';

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        const plaintext = bytes.toString(CryptoJS.enc.Utf8);

        if (!plaintext) {
            throw new Error('Decryption resulted in empty string');
        }

        return plaintext;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Hash a password using SHA256
 * Note: For production, use bcrypt instead (already in your dependencies)
 * 
 * @param password Plain password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
}

/**
 * Generate a secure random token
 * Useful for API keys, session tokens, etc.
 * 
 * @param length Number of random bytes (will be hex encoded, so output is 2x length)
 * @returns Random hex string
 */
export function generateSecureToken(length: number = 32): string {
    const randomBytes = CryptoJS.lib.WordArray.random(length);
    return randomBytes.toString();
}

/**
 * Mask sensitive data for logging
 * Shows first and last few characters, masks the middle
 * 
 * @param value Sensitive string to mask
 * @param visibleChars Number of chars to show on each end
 * @returns Masked string
 */
export function maskSensitiveData(
    value: string,
    visibleChars: number = 4
): string {
    if (!value || value.length <= visibleChars * 2) {
        return '***';
    }

    const start = value.slice(0, visibleChars);
    const end = value.slice(-visibleChars);
    const masked = '*'.repeat(Math.max(value.length - (visibleChars * 2), 3));

    return `${start}${masked}${end}`;
}

/**
 * Validate that a value is properly encrypted
 * Checks if it can be decrypted successfully
 */
export function isValidEncryptedValue(ciphertext: string): boolean {
    try {
        const decrypted = decrypt(ciphertext);
        return decrypted.length > 0;
    } catch {
        return false;
    }
}

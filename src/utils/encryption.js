import CryptoJS from 'crypto-js';

// Secret key for encryption (in production, this should be stored securely)
const SECRET_KEY = 'EXAMINO_SECURE_KEY';

/**
 * Encrypts an image using AES-256
 * @param {string} imageData - Base64 encoded image data
 * @returns {string} - Encrypted image data
 */
export function encryptImage(imageData) {
  return CryptoJS.AES.encrypt(imageData, SECRET_KEY).toString();
}

/**
 * Decrypts an encrypted image
 * @param {string} encryptedData - Encrypted image data
 * @returns {string} - Decrypted image data (Base64)
 */
export function decryptImage(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypts data using AES-256
 * @param {any} data - Data to encrypt (will be stringified)
 * @returns {string} - Encrypted data
 */
export function encryptData(data) {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
}

/**
 * Decrypts encrypted data
 * @param {string} encryptedData - Encrypted data
 * @returns {any} - Decrypted data (parsed from JSON if possible)
 */
export function decryptData(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

  try {
    return JSON.parse(decryptedString);
  } catch (e) {
    // If not valid JSON, return as string
    return decryptedString;
  }
}

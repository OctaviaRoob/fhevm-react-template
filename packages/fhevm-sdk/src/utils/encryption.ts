/**
 * Encryption utilities
 */

import type { FhevmInstance } from '../core/types';

/**
 * Batch encrypt multiple values
 */
export async function batchEncrypt(
  fhevm: FhevmInstance,
  values: Array<{ type: string; value: any }>
): Promise<string[]> {
  const promises = values.map(async ({ type, value }) => {
    switch (type) {
      case 'euint8':
        return fhevm.encrypt8(value);
      case 'euint16':
        return fhevm.encrypt16(value);
      case 'euint32':
        return fhevm.encrypt32(value);
      case 'euint64':
        return fhevm.encrypt64(value);
      case 'ebool':
        return fhevm.encryptBool(value);
      case 'eaddress':
        return fhevm.encryptAddress(value);
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  });

  return Promise.all(promises);
}

/**
 * Helper to convert encrypted values to contract-compatible format
 */
export function formatEncryptedValue(encrypted: string): string {
  if (!encrypted.startsWith('0x')) {
    return `0x${encrypted}`;
  }
  return encrypted;
}

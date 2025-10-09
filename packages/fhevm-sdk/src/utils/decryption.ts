/**
 * Decryption utilities
 */

/**
 * Parse decrypted value based on expected type
 */
export function parseDecryptedValue(
  value: bigint | boolean | string,
  expectedType: 'uint' | 'bool' | 'address'
): number | boolean | string {
  switch (expectedType) {
    case 'uint':
      return typeof value === 'bigint' ? Number(value) : Number(value);
    case 'bool':
      return Boolean(value);
    case 'address':
      return String(value);
    default:
      return value as any;
  }
}

/**
 * Format decrypted value for display
 */
export function formatDecryptedValue(
  value: bigint | boolean | string,
  type: 'currency' | 'number' | 'boolean' | 'address' = 'number'
): string {
  switch (type) {
    case 'currency':
      const num = typeof value === 'bigint' ? Number(value) : Number(value);
      return `$${(num / 100).toFixed(2)}`;
    case 'number':
      return String(value);
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'address':
      const addr = String(value);
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    default:
      return String(value);
  }
}

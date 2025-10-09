/**
 * @fhevm/universal-sdk
 *
 * Universal FHEVM SDK for building confidential dApps
 * Framework-agnostic, developer-friendly, production-ready
 */

export * from './core/FhevmClient';
export * from './core/types';
export * from './utils/encryption';
export * from './utils/decryption';
export * from './utils/contract';

// Core exports
export { createFhevmInstance } from './core/FhevmClient';
export type {
  FhevmInstance,
  FhevmConfig,
  EncryptedInput,
  DecryptionRequest,
  NetworkConfig
} from './core/types';

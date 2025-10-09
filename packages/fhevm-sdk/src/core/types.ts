/**
 * Core TypeScript types for FHEVM SDK
 */

import type { ethers } from 'ethers';

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  gatewayUrl?: string;
  aclAddress?: string;
  kmsVerifierAddress?: string;
}

export interface FhevmConfig {
  network: NetworkConfig;
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
  gatewayUrl?: string;
  aclAddress?: string;
  kmsVerifierAddress?: string;
}

export interface FhevmInstance {
  encrypt8(value: number): Promise<string>;
  encrypt16(value: number): Promise<string>;
  encrypt32(value: number): Promise<string>;
  encrypt64(value: bigint): Promise<string>;
  encryptBool(value: boolean): Promise<string>;
  encryptAddress(value: string): Promise<string>;

  createEncryptedInput(contractAddress: string, userAddress: string): EncryptedInputBuilder;

  requestDecryption(
    ciphertext: string,
    contractAddress: string
  ): Promise<DecryptionRequest>;

  awaitDecryption(requestId: bigint): Promise<bigint | boolean | string>;
}

export interface EncryptedInputBuilder {
  add8(value: number): EncryptedInputBuilder;
  add16(value: number): EncryptedInputBuilder;
  add32(value: number): EncryptedInputBuilder;
  add64(value: bigint): EncryptedInputBuilder;
  addBool(value: boolean): EncryptedInputBuilder;
  addAddress(value: string): EncryptedInputBuilder;

  getEncrypted(): Promise<EncryptedInput>;
}

export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

export interface DecryptionRequest {
  requestId: bigint;
  ciphertext: string;
  contractAddress: string;
  timestamp: number;
}

export interface ContractInteraction<T = any> {
  contract: ethers.Contract;
  method: string;
  args: any[];
  encryptedInputs?: EncryptedInput;
  value?: bigint;
}

export interface TransactionResult {
  hash: string;
  wait(): Promise<ethers.TransactionReceipt>;
}

// Supported encrypted types
export type EncryptedType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool' | 'eaddress';

// Network presets
export const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://rpc.sepolia.org',
    gatewayUrl: 'https://gateway.sepolia.zama.ai',
    aclAddress: '0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2',
    kmsVerifierAddress: '0x12345...' // Replace with actual
  },
  zamaDevnet: {
    chainId: 9000,
    name: 'Zama Devnet',
    rpcUrl: 'https://devnet.zama.ai',
    gatewayUrl: 'https://gateway.devnet.zama.ai',
    aclAddress: '0x2Fb4341...',
    kmsVerifierAddress: '0x67890...'
  },
  zamaTestnet: {
    chainId: 8009,
    name: 'Zama Testnet',
    rpcUrl: 'https://fhevm-testnet.zama.ai',
    gatewayUrl: 'https://gateway.testnet.zama.ai'
  }
};

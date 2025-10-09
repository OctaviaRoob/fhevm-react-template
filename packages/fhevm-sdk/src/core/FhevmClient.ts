/**
 * Core FHEVM Client
 * Framework-agnostic client for FHEVM operations
 */

import { createInstance, type FhevmInstance as FhevmjsInstance } from 'fhevmjs';
import type { ethers } from 'ethers';
import type {
  FhevmConfig,
  FhevmInstance,
  EncryptedInputBuilder,
  EncryptedInput,
  DecryptionRequest,
  NetworkConfig
} from './types';

class FhevmClientImpl implements FhevmInstance {
  private instance: FhevmjsInstance | null = null;
  private config: FhevmConfig;
  private isInitialized = false;

  constructor(config: FhevmConfig) {
    this.config = config;
  }

  private async ensureInitialized(): Promise<FhevmjsInstance> {
    if (!this.instance || !this.isInitialized) {
      this.instance = await createInstance({
        chainId: this.config.network.chainId,
        publicKey: await this.getPublicKey(),
        gatewayUrl: this.config.gatewayUrl || this.config.network.gatewayUrl,
        aclAddress: this.config.aclAddress || this.config.network.aclAddress,
        kmsVerifierAddress: this.config.kmsVerifierAddress || this.config.network.kmsVerifierAddress
      });
      this.isInitialized = true;
    }
    return this.instance;
  }

  private async getPublicKey(): Promise<string> {
    // Fetch public key from KMS
    const gatewayUrl = this.config.gatewayUrl || this.config.network.gatewayUrl;
    if (!gatewayUrl) {
      throw new Error('Gateway URL not configured');
    }

    const response = await fetch(`${gatewayUrl}/fhe-key`);
    const data = await response.json();
    return data.publicKey;
  }

  async encrypt8(value: number): Promise<string> {
    const instance = await this.ensureInitialized();
    return instance.encrypt8(value);
  }

  async encrypt16(value: number): Promise<string> {
    const instance = await this.ensureInitialized();
    return instance.encrypt16(value);
  }

  async encrypt32(value: number): Promise<string> {
    const instance = await this.ensureInitialized();
    return instance.encrypt32(value);
  }

  async encrypt64(value: bigint): Promise<string> {
    const instance = await this.ensureInitialized();
    return instance.encrypt64(value);
  }

  async encryptBool(value: boolean): Promise<string> {
    const instance = await this.ensureInitialized();
    return instance.encryptBool(value);
  }

  async encryptAddress(value: string): Promise<string> {
    const instance = await this.ensureInitialized();
    return instance.encryptAddress(value);
  }

  createEncryptedInput(
    contractAddress: string,
    userAddress: string
  ): EncryptedInputBuilder {
    return new EncryptedInputBuilderImpl(
      this.ensureInitialized.bind(this),
      contractAddress,
      userAddress
    );
  }

  async requestDecryption(
    ciphertext: string,
    contractAddress: string
  ): Promise<DecryptionRequest> {
    const requestId = BigInt(Date.now()); // Simplified for example
    return {
      requestId,
      ciphertext,
      contractAddress,
      timestamp: Date.now()
    };
  }

  async awaitDecryption(requestId: bigint): Promise<bigint | boolean | string> {
    // Poll gateway for decryption result
    const gatewayUrl = this.config.gatewayUrl || this.config.network.gatewayUrl;
    if (!gatewayUrl) {
      throw new Error('Gateway URL not configured');
    }

    // Simplified polling logic
    const maxAttempts = 30;
    const delayMs = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${gatewayUrl}/decrypt/${requestId}`);
        if (response.ok) {
          const data = await response.json();
          return data.value;
        }
      } catch (error) {
        // Continue polling
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error(`Decryption timeout for request ${requestId}`);
  }
}

class EncryptedInputBuilderImpl implements EncryptedInputBuilder {
  private inputs: Array<{ type: string; value: any }> = [];

  constructor(
    private getInstance: () => Promise<FhevmjsInstance>,
    private contractAddress: string,
    private userAddress: string
  ) {}

  add8(value: number): EncryptedInputBuilder {
    this.inputs.push({ type: 'euint8', value });
    return this;
  }

  add16(value: number): EncryptedInputBuilder {
    this.inputs.push({ type: 'euint16', value });
    return this;
  }

  add32(value: number): EncryptedInputBuilder {
    this.inputs.push({ type: 'euint32', value });
    return this;
  }

  add64(value: bigint): EncryptedInputBuilder {
    this.inputs.push({ type: 'euint64', value });
    return this;
  }

  addBool(value: boolean): EncryptedInputBuilder {
    this.inputs.push({ type: 'ebool', value });
    return this;
  }

  addAddress(value: string): EncryptedInputBuilder {
    this.inputs.push({ type: 'eaddress', value });
    return this;
  }

  async getEncrypted(): Promise<EncryptedInput> {
    const instance = await this.getInstance();
    const input = instance.createEncryptedInput(this.contractAddress, this.userAddress);

    // Add all inputs in order
    for (const { type, value } of this.inputs) {
      switch (type) {
        case 'euint8':
          input.add8(value);
          break;
        case 'euint16':
          input.add16(value);
          break;
        case 'euint32':
          input.add32(value);
          break;
        case 'euint64':
          input.add64(value);
          break;
        case 'ebool':
          input.addBool(value);
          break;
        case 'eaddress':
          input.addAddress(value);
          break;
      }
    }

    return input.encrypt();
  }
}

/**
 * Create a new FHEVM instance
 *
 * @example
 * ```typescript
 * import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';
 * import { ethers } from 'ethers';
 *
 * const provider = new ethers.BrowserProvider(window.ethereum);
 * const fhevm = await createFhevmInstance({
 *   network: NETWORKS.sepolia,
 *   provider
 * });
 *
 * // Encrypt a value
 * const encrypted = await fhevm.encrypt32(12345);
 * ```
 */
export async function createFhevmInstance(config: FhevmConfig): Promise<FhevmInstance> {
  const client = new FhevmClientImpl(config);
  return client;
}

/**
 * Contract interaction utilities
 */

import type { ethers } from 'ethers';
import type { EncryptedInput } from '../core/types';

/**
 * Prepare contract call with encrypted inputs
 */
export function prepareEncryptedCall(
  contract: ethers.Contract,
  methodName: string,
  encryptedInput: EncryptedInput,
  additionalArgs: any[] = []
): {
  contract: ethers.Contract;
  method: string;
  args: any[];
} {
  return {
    contract,
    method: methodName,
    args: [...encryptedInput.handles, encryptedInput.inputProof, ...additionalArgs]
  };
}

/**
 * Execute contract call with encrypted inputs
 */
export async function executeEncryptedCall(
  contract: ethers.Contract,
  methodName: string,
  encryptedInput: EncryptedInput,
  additionalArgs: any[] = [],
  options: { value?: bigint } = {}
): Promise<ethers.TransactionResponse> {
  const args = [...encryptedInput.handles, encryptedInput.inputProof, ...additionalArgs];

  return contract[methodName](...args, options);
}

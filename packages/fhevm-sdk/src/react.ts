/**
 * React hooks for FHEVM SDK
 * Wagmi-style hooks for encrypted operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createFhevmInstance } from './core/FhevmClient';
import type {
  FhevmInstance,
  FhevmConfig,
  EncryptedInput,
  DecryptionRequest
} from './core/types';

/**
 * Hook to create and manage FHEVM instance
 *
 * @example
 * ```tsx
 * import { useFhevm, NETWORKS } from '@fhevm/universal-sdk/react';
 * import { useProvider } from 'wagmi';
 *
 * function MyComponent() {
 *   const provider = useProvider();
 *   const { fhevm, isLoading, error } = useFhevm({
 *     network: NETWORKS.sepolia,
 *     provider
 *   });
 *
 *   if (isLoading) return <div>Initializing FHE...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <div>FHEVM Ready!</div>;
 * }
 * ```
 */
export function useFhevm(config: FhevmConfig) {
  const [fhevm, setFhevm] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setIsLoading(true);
        const instance = await createFhevmInstance(config);
        if (mounted) {
          setFhevm(instance);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [config]);

  return { fhevm, isLoading, error };
}

/**
 * Hook to encrypt a value
 *
 * @example
 * ```tsx
 * import { useEncrypt } from '@fhevm/universal-sdk/react';
 *
 * function EncryptForm() {
 *   const { fhevm } = useFhevm(...);
 *   const { encrypt, encrypted, isLoading } = useEncrypt(fhevm);
 *
 *   const handleSubmit = async () => {
 *     await encrypt({ type: 'euint32', value: 12345 });
 *     console.log('Encrypted:', encrypted);
 *   };
 *
 *   return <button onClick={handleSubmit} disabled={isLoading}>
 *     Encrypt Value
 *   </button>;
 * }
 * ```
 */
export function useEncrypt(fhevm: FhevmInstance | null) {
  const [encrypted, setEncrypted] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (input: { type: string; value: any }) => {
      if (!fhevm) {
        throw new Error('FHEVM instance not initialized');
      }

      try {
        setIsLoading(true);
        setError(null);

        let result: string;
        switch (input.type) {
          case 'euint8':
            result = await fhevm.encrypt8(input.value);
            break;
          case 'euint16':
            result = await fhevm.encrypt16(input.value);
            break;
          case 'euint32':
            result = await fhevm.encrypt32(input.value);
            break;
          case 'euint64':
            result = await fhevm.encrypt64(input.value);
            break;
          case 'ebool':
            result = await fhevm.encryptBool(input.value);
            break;
          case 'eaddress':
            result = await fhevm.encryptAddress(input.value);
            break;
          default:
            throw new Error(`Unsupported encryption type: ${input.type}`);
        }

        setEncrypted(result);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fhevm]
  );

  return { encrypt, encrypted, isLoading, error };
}

/**
 * Hook to create encrypted inputs for contract calls
 *
 * @example
 * ```tsx
 * import { useEncryptedInput } from '@fhevm/universal-sdk/react';
 *
 * function SubmitData() {
 *   const { fhevm } = useFhevm(...);
 *   const { createInput, encryptedInput, isLoading } = useEncryptedInput(
 *     fhevm,
 *     contractAddress,
 *     userAddress
 *   );
 *
 *   const handleSubmit = async () => {
 *     const input = fhevm.createEncryptedInput(contractAddress, userAddress)
 *       .add32(500)  // spending
 *       .add8(10);   // rides
 *
 *     const encrypted = await createInput(input);
 *     // Use encrypted.handles and encrypted.inputProof in contract call
 *   };
 * }
 * ```
 */
export function useEncryptedInput(
  fhevm: FhevmInstance | null,
  contractAddress: string,
  userAddress: string
) {
  const [encryptedInput, setEncryptedInput] = useState<EncryptedInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createInput = useCallback(
    async (builder: ReturnType<FhevmInstance['createEncryptedInput']>) => {
      if (!fhevm) {
        throw new Error('FHEVM instance not initialized');
      }

      try {
        setIsLoading(true);
        setError(null);

        const encrypted = await builder.getEncrypted();
        setEncryptedInput(encrypted);
        return encrypted;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fhevm]
  );

  return { createInput, encryptedInput, isLoading, error };
}

/**
 * Hook to request and await decryption
 *
 * @example
 * ```tsx
 * import { useDecrypt } from '@fhevm/universal-sdk/react';
 *
 * function ViewResults() {
 *   const { fhevm } = useFhevm(...);
 *   const { decrypt, decrypted, isLoading } = useDecrypt(fhevm);
 *
 *   const handleDecrypt = async () => {
 *     const result = await decrypt({
 *       ciphertext: '0x...',
 *       contractAddress: '0x...'
 *     });
 *     console.log('Decrypted value:', result);
 *   };
 * }
 * ```
 */
export function useDecrypt(fhevm: FhevmInstance | null) {
  const [decrypted, setDecrypted] = useState<bigint | boolean | string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (request: { ciphertext: string; contractAddress: string }) => {
      if (!fhevm) {
        throw new Error('FHEVM instance not initialized');
      }

      try {
        setIsLoading(true);
        setError(null);

        const decryptionRequest = await fhevm.requestDecryption(
          request.ciphertext,
          request.contractAddress
        );

        const result = await fhevm.awaitDecryption(decryptionRequest.requestId);
        setDecrypted(result);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fhevm]
  );

  return { decrypt, decrypted, isLoading, error };
}

// Re-export core types and utilities
export * from './core/types';
export { createFhevmInstance } from './core/FhevmClient';

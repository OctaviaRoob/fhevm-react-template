# React Guide

Building confidential dApps with React and the Universal FHEVM SDK.

## Table of Contents

- [Setup](#setup)
- [Using Hooks](#using-hooks)
- [Component Examples](#component-examples)
- [State Management](#state-management)
- [Best Practices](#best-practices)

---

## Setup

### Install Dependencies

```bash
npm install @fhevm/universal-sdk ethers wagmi @rainbow-me/rainbowkit
```

### Configure Wagmi Provider

```tsx
// app/providers.tsx
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'My FHEVM App',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http()
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
```

---

## Using Hooks

### `useFhevm` Hook

Initialize FHEVM instance:

```tsx
'use client';

import { useFhevm, NETWORKS } from '@fhevm/universal-sdk/react';
import { useWalletClient } from 'wagmi';
import { ethers } from 'ethers';

export default function MyComponent() {
  const { data: walletClient } = useWalletClient();
  const provider = walletClient
    ? new ethers.BrowserProvider(walletClient)
    : null;

  const { fhevm, isLoading, error } = useFhevm({
    network: NETWORKS.sepolia,
    provider
  });

  if (isLoading) return <div>Initializing FHE...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!fhevm) return <div>Connect wallet to continue</div>;

  return <div>FHEVM Ready!</div>;
}
```

### `useEncrypt` Hook

Encrypt values:

```tsx
import { useEncrypt } from '@fhevm/universal-sdk/react';

function EncryptComponent({ fhevm }) {
  const { encrypt, encrypted, isLoading, error } = useEncrypt(fhevm);

  const handleEncrypt = async () => {
    await encrypt({ type: 'euint32', value: 12345 });
  };

  return (
    <div>
      <button onClick={handleEncrypt} disabled={isLoading}>
        {isLoading ? 'Encrypting...' : 'Encrypt Value'}
      </button>
      {encrypted && <p>Encrypted: {encrypted.slice(0, 20)}...</p>}
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}
```

### `useDecrypt` Hook

Decrypt values:

```tsx
import { useDecrypt } from '@fhevm/universal-sdk/react';

function DecryptComponent({ fhevm, encryptedValue, contractAddress }) {
  const { decrypt, decrypted, isLoading, error } = useDecrypt(fhevm);

  const handleDecrypt = async () => {
    await decrypt(encryptedValue, contractAddress);
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isLoading}>
        {isLoading ? 'Decrypting...' : 'Decrypt Value'}
      </button>
      {decrypted !== null && <p>Decrypted: {decrypted}</p>}
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}
```

---

## Component Examples

### Complete Form Example

```tsx
'use client';

import { useState } from 'react';
import { useFhevm, useEncrypt, NETWORKS } from '@fhevm/universal-sdk/react';
import { useWalletClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ethers } from 'ethers';

export default function DataSubmissionForm() {
  const [amount, setAmount] = useState('');
  const [count, setCount] = useState('');

  const { data: walletClient } = useWalletClient();
  const provider = walletClient ? new ethers.BrowserProvider(walletClient) : null;

  const { fhevm, isLoading: fhevmLoading } = useFhevm({
    network: NETWORKS.sepolia,
    provider
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fhevm) return;

    const input = fhevm
      .createEncryptedInput(contractAddress, await signer.getAddress())
      .add32(parseInt(amount))
      .add8(parseInt(count));

    const { handles, inputProof } = await input.getEncrypted();

    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'submitData',
      args: [...handles, inputProof]
    });
  };

  if (fhevmLoading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <input
        type="number"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        placeholder="Count"
      />
      <button type="submit" disabled={isConfirming}>
        {isConfirming ? 'Submitting...' : 'Submit Encrypted Data'}
      </button>
    </form>
  );
}
```

---

## State Management

### With Context

```tsx
// FhevmContext.tsx
import { createContext, useContext } from 'react';

const FhevmContext = createContext<FhevmInstance | null>(null);

export function FhevmProvider({ children }) {
  const { fhevm } = useFhevm({...});

  return (
    <FhevmContext.Provider value={fhevm}>
      {children}
    </FhevmContext.Provider>
  );
}

export const useFhevmContext = () => useContext(FhevmContext);
```

---

## Best Practices

1. **Memoize Provider**: Use `useMemo` for provider creation
2. **Error Boundaries**: Wrap components in error boundaries
3. **Loading States**: Always show loading indicators
4. **Type Safety**: Use TypeScript for all components
5. **Test Hooks**: Unit test custom hooks

For complete examples, see [Next.js Showcase](../examples/nextjs-showcase/).

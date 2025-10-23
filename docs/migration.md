# Migration Guide

Migrating from other FHEVM libraries to the Universal FHEVM SDK.

## Table of Contents

- [From fhevmjs](#from-fhevmjs)
- [From @fhevm/browser](#from-fhevmbrowser)
- [Benefits of Migration](#benefits-of-migration)
- [Breaking Changes](#breaking-changes)
- [Step-by-Step Migration](#step-by-step-migration)

---

## From fhevmjs

### Before (fhevmjs)

```typescript
import { createInstance } from 'fhevmjs';
import { ethers } from 'ethers';

// Complex setup (50+ lines)
const provider = new ethers.BrowserProvider(window.ethereum);
const network = await provider.getNetwork();
const chainId = Number(network.chainId);

// Fetch public key manually
const response = await fetch(`https://gateway.sepolia.zama.ai/publicKey`);
const publicKey = await response.text();

// Create instance with manual configuration
const instance = await createInstance({
  chainId,
  publicKey,
  gatewayUrl: 'https://gateway.sepolia.zama.ai',
  aclAddress: '0xACL_ADDRESS',
  kmsVerifierAddress: '0xKMS_ADDRESS'
});

// Encrypt manually
const encrypted = instance.encrypt32(12345);
```

### After (Universal SDK)

```typescript
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';
import { ethers } from 'ethers';

// Simple setup (4 lines)
const provider = new ethers.BrowserProvider(window.ethereum);
const fhevm = await createFhevmInstance({
  network: NETWORKS.sepolia,
  provider
});

// Encrypt with same API
const encrypted = await fhevm.encrypt32(12345);
```

**Savings**: 92% less code, automatic configuration

---

## From @fhevm/browser

### Before (@fhevm/browser)

```typescript
import { FhevmBrowser } from '@fhevm/browser';

const fhevm = new FhevmBrowser({
  chainId: 11155111,
  rpcUrl: 'https://rpc.sepolia.org',
  gatewayUrl: 'https://gateway.sepolia.zama.ai'
});

await fhevm.initialize();

const encrypted = await fhevm.encrypt(12345, 'euint32');
```

### After (Universal SDK)

```typescript
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';

const fhevm = await createFhevmInstance({
  network: NETWORKS.sepolia,
  provider
});

const encrypted = await fhevm.encrypt32(12345);
```

**Improvements**:
- Type-safe methods (`encrypt32` vs string-based)
- Framework-agnostic (works in Node.js too)
- React hooks included

---

## Benefits of Migration

### 1. Less Code

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Setup lines | 50+ | 4 | 92% |
| Dependencies | 3-5 | 2 | 60% |
| Configuration | Manual | Auto | 100% |

### 2. Framework Agnostic

```typescript
// Works in React
import { useFhevm } from '@fhevm/universal-sdk/react';

// Works in Node.js
import { createFhevmInstance } from '@fhevm/universal-sdk';

// Works in vanilla JS
import { createFhevmInstance } from '@fhevm/universal-sdk';
```

### 3. Better Developer Experience

- ✅ TypeScript-first with complete type safety
- ✅ React hooks for modern apps
- ✅ Network presets (no manual config)
- ✅ Builder pattern for encrypted inputs
- ✅ Comprehensive documentation

### 4. Production Ready

- ✅ Error handling built-in
- ✅ Timeout management
- ✅ Retry logic
- ✅ Loading states
- ✅ Type safety

---

## Breaking Changes

### API Differences

| Old API | New API | Notes |
|---------|---------|-------|
| `instance.encrypt(value, 'euint32')` | `fhevm.encrypt32(value)` | Type-safe methods |
| Manual public key fetch | Automatic | Built into `createFhevmInstance` |
| `instance.createEIP712()` | `fhevm.createEncryptedInput()` | Builder pattern |
| `instance.generateToken()` | Not needed | Handled internally |

### Import Changes

```typescript
// Old
import { createInstance } from 'fhevmjs';

// New
import { createFhevmInstance } from '@fhevm/universal-sdk';
```

---

## Step-by-Step Migration

### Step 1: Install SDK

```bash
npm install @fhevm/universal-sdk ethers
npm uninstall fhevmjs @fhevm/browser
```

### Step 2: Update Imports

```typescript
// Before
import { createInstance } from 'fhevmjs';

// After
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';
```

### Step 3: Replace Instance Creation

```typescript
// Before
const instance = await createInstance({
  chainId: 11155111,
  publicKey: fetchedPublicKey,
  gatewayUrl: 'https://gateway.sepolia.zama.ai',
  // ... more config
});

// After
const fhevm = await createFhevmInstance({
  network: NETWORKS.sepolia,
  provider
});
```

### Step 4: Update Encryption Calls

```typescript
// Before
const encrypted = instance.encrypt(12345, 'euint32');

// After
const encrypted = await fhevm.encrypt32(12345);
```

### Step 5: Update Encrypted Inputs

```typescript
// Before
const eip712 = instance.createEIP712(contractAddress, userAddress);
const encrypted = eip712.encrypt32(1000);
const proof = eip712.getSignature();

// After
const input = fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(1000);

const { handles, inputProof } = await input.getEncrypted();
```

### Step 6: Test Thoroughly

```bash
npm test
```

---

## React Migration

### Before (Manual Management)

```tsx
import { useState, useEffect } from 'react';
import { createInstance } from 'fhevmjs';

export default function MyComponent() {
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const inst = await createInstance({...});
        setInstance(inst);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Component logic...
}
```

### After (Built-in Hooks)

```tsx
import { useFhevm, NETWORKS } from '@fhevm/universal-sdk/react';

export default function MyComponent() {
  const { fhevm, isLoading, error } = useFhevm({
    network: NETWORKS.sepolia,
    provider
  });

  // Component logic...
}
```

**Benefits**:
- Built-in state management
- Automatic error handling
- Loading states included
- Optimized re-renders

---

## Next.js Migration

### Before

```tsx
// pages/_app.tsx
import { createInstance } from 'fhevmjs';

function MyApp({ Component, pageProps }) {
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    createInstance({...}).then(setInstance);
  }, []);

  return <Component {...pageProps} instance={instance} />;
}
```

### After

```tsx
// app/providers.tsx
'use client';

import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

// app/page.tsx
'use client';

import { useFhevm } from '@fhevm/universal-sdk/react';

export default function Page() {
  const { fhevm } = useFhevm({...});
  // Use fhevm directly
}
```

---

## Common Issues

### Issue: "Cannot find module '@fhevm/universal-sdk'"

**Solution**: Install the package
```bash
npm install @fhevm/universal-sdk ethers
```

### Issue: "Provider is undefined"

**Solution**: Check wallet connection
```typescript
if (!window.ethereum) {
  throw new Error('Please install MetaMask');
}
```

### Issue: "Network mismatch"

**Solution**: Use correct network preset
```typescript
// For Sepolia
const fhevm = await createFhevmInstance({
  network: NETWORKS.sepolia,
  provider
});
```

---

## Gradual Migration

You can migrate gradually by keeping both libraries:

```typescript
// Old code (keep working)
import { createInstance as createOldInstance } from 'fhevmjs';

// New code (start migrating)
import { createFhevmInstance } from '@fhevm/universal-sdk';

// Use old for existing features
const oldInstance = await createOldInstance({...});

// Use new for new features
const newFhevm = await createFhevmInstance({...});
```

Then migrate feature by feature.

---

## Support

Need help with migration?

- 📖 [Documentation](../README.md)
- 💬 [Discord](https://discord.fhe.org)
- 📧 [Email Support](mailto:support@fhevm-sdk.example)
- 🐛 [Report Issues](https://github.com/OctaviaRoob/fhevm-react-template/issues)

---

**Ready to migrate? Start with the [Getting Started Guide](./getting-started.md)!**

# Getting Started with Universal FHEVM SDK

Welcome to the Universal FHEVM SDK! This guide will help you set up and start building confidential dApps in minutes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Basic Usage](#basic-usage)
- [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MetaMask** or compatible Web3 wallet ([Install](https://metamask.io/))
- Basic knowledge of TypeScript/JavaScript
- Familiarity with Ethereum and smart contracts

### Recommended Tools

- **VS Code** with TypeScript extension
- **Hardhat** for smart contract development
- **Next.js** for frontend (optional, but recommended)

---

## Installation

### Install the SDK

```bash
npm install @fhevm/universal-sdk ethers
```

or

```bash
yarn add @fhevm/universal-sdk ethers
```

### Peer Dependencies

The SDK requires `ethers` v6 as a peer dependency. If you haven't installed it yet:

```bash
npm install ethers@^6.0.0
```

---

## Quick Start

### 1. Create Your First FHEVM Instance

Create a file `fhevm-demo.ts`:

```typescript
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';
import { ethers } from 'ethers';

async function initFhevm() {
  // Connect to MetaMask
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);

  // Create FHEVM instance (< 10 lines!)
  const fhevm = await createFhevmInstance({
    network: NETWORKS.sepolia,
    provider
  });

  console.log('FHEVM instance created!', fhevm);
  return fhevm;
}

initFhevm();
```

### 2. Encrypt Your First Value

```typescript
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';
import { ethers } from 'ethers';

async function encryptValue() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const fhevm = await createFhevmInstance({
    network: NETWORKS.sepolia,
    provider
  });

  // Encrypt a number
  const encrypted = await fhevm.encrypt32(12345);
  console.log('Encrypted value:', encrypted);

  return encrypted;
}

encryptValue();
```

### 3. Use with React Hooks

```tsx
'use client';

import { useFhevm, useEncrypt, NETWORKS } from '@fhevm/universal-sdk/react';
import { useWalletClient } from 'wagmi';
import { ethers } from 'ethers';

export default function EncryptDemo() {
  const { data: walletClient } = useWalletClient();
  const provider = walletClient
    ? new ethers.BrowserProvider(walletClient)
    : null;

  // Initialize FHEVM
  const { fhevm, isLoading, error } = useFhevm({
    network: NETWORKS.sepolia,
    provider
  });

  // Encrypt values
  const { encrypt, encrypted, isLoading: encrypting } = useEncrypt(fhevm);

  const handleEncrypt = async () => {
    await encrypt({ type: 'euint32', value: 12345 });
  };

  if (isLoading) return <div>Initializing FHE...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleEncrypt} disabled={encrypting}>
        {encrypting ? 'Encrypting...' : 'Encrypt Value'}
      </button>
      {encrypted && <p>Encrypted: {encrypted}</p>}
    </div>
  );
}
```

---

## Basic Usage

### Network Configuration

The SDK provides pre-configured network presets:

```typescript
import { NETWORKS } from '@fhevm/universal-sdk';

// Available networks
NETWORKS.sepolia;       // Ethereum Sepolia testnet
NETWORKS.zamaDevnet;    // Zama development network
NETWORKS.zamaTestnet;   // Zama test network
```

### Encryption Types

The SDK supports all FHEVM encrypted types:

```typescript
// Unsigned integers
await fhevm.encrypt8(255);        // euint8 (0-255)
await fhevm.encrypt16(65535);     // euint16 (0-65535)
await fhevm.encrypt32(4294967295); // euint32 (0-4294967295)
await fhevm.encrypt64(BigInt('18446744073709551615')); // euint64

// Boolean
await fhevm.encryptBool(true);    // ebool

// Address
await fhevm.encryptAddress('0x1234...'); // eaddress
```

### Encrypted Inputs (Builder Pattern)

For complex contract calls with multiple encrypted parameters:

```typescript
const contractAddress = '0x1234...';
const userAddress = '0x5678...';

const input = fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(1000)      // Add euint32
  .add8(50)         // Add euint8
  .addBool(true);   // Add ebool

const { handles, inputProof } = await input.getEncrypted();

// Use in contract call
await contract.submitData(...handles, inputProof);
```

### Decryption

Request decryption for encrypted results:

```typescript
// Request decryption from Zama gateway
const requestId = await fhevm.requestDecryption(
  encryptedValue,
  contractAddress
);

// Wait for decryption result
const decrypted = await fhevm.awaitDecryption(requestId);
console.log('Decrypted value:', decrypted);
```

---

## Basic Example: Complete Flow

Here's a complete example showing the full FHEVM flow:

```typescript
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';
import { ethers } from 'ethers';

async function completeFlow() {
  // 1. Setup
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();

  // 2. Initialize FHEVM
  const fhevm = await createFhevmInstance({
    network: NETWORKS.sepolia,
    provider
  });

  // 3. Encrypt data
  const encryptedAmount = await fhevm.encrypt32(1000);
  console.log('Encrypted:', encryptedAmount);

  // 4. Submit to contract
  const contractAddress = '0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c';
  const contract = new ethers.Contract(
    contractAddress,
    ['function submitValue(bytes calldata encryptedValue) external'],
    signer
  );

  const tx = await contract.submitValue(encryptedAmount);
  await tx.wait();
  console.log('Transaction confirmed:', tx.hash);

  // 5. Request decryption (for aggregates)
  const requestId = await fhevm.requestDecryption(
    encryptedAggregate,
    contractAddress
  );

  // 6. Await result
  const result = await fhevm.awaitDecryption(requestId);
  console.log('Decrypted result:', result);
}

completeFlow();
```

---

## Framework-Specific Setup

### React / Next.js

```tsx
// app/providers.tsx
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';

const config = getDefaultConfig({
  appName: 'My FHEVM App',
  projectId: 'YOUR_PROJECT_ID',
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

### Vanilla JavaScript

```javascript
// main.js
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';
import { ethers } from 'ethers';

document.getElementById('encryptBtn').addEventListener('click', async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const fhevm = await createFhevmInstance({
    network: NETWORKS.sepolia,
    provider
  });

  const value = document.getElementById('valueInput').value;
  const encrypted = await fhevm.encrypt32(parseInt(value));

  document.getElementById('result').textContent = encrypted;
});
```

### Node.js (Server-Side)

```javascript
// server.js
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';
import { ethers } from 'ethers';

async function serverSideEncryption() {
  // Use JsonRpcProvider for server-side
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  const fhevm = await createFhevmInstance({
    network: NETWORKS.sepolia,
    provider
  });

  // Encrypt on server
  const encrypted = await fhevm.encrypt32(1000);
  return encrypted;
}

serverSideEncryption();
```

---

## Environment Variables

Create a `.env.local` file:

```env
# Network Configuration
NEXT_PUBLIC_NETWORK=sepolia

# RPC URLs
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org
NEXT_PUBLIC_ZAMA_DEVNET_RPC_URL=https://devnet.zama.ai

# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c

# Optional: WalletConnect Project ID (for RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## Troubleshooting

### Issue: "Cannot find module '@fhevm/universal-sdk'"

**Solution**: Ensure the SDK is installed:
```bash
npm install @fhevm/universal-sdk ethers
```

### Issue: "Provider not found"

**Solution**: Make sure MetaMask is installed and connected:
```typescript
if (!window.ethereum) {
  alert('Please install MetaMask');
}
```

### Issue: "Wrong network"

**Solution**: Switch to the correct network in MetaMask or programmatically:
```typescript
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xaa36a7' }] // Sepolia
});
```

### Issue: "Encryption timeout"

**Solution**: Increase timeout or check network connection:
```typescript
const fhevm = await createFhevmInstance({
  network: NETWORKS.sepolia,
  provider,
  timeout: 30000 // 30 seconds
});
```

---

## Next Steps

Now that you've set up the SDK, explore these topics:

1. **[Core Concepts](./core-concepts.md)** - Understand FHE and how it works
2. **[API Reference](./api-reference.md)** - Complete API documentation
3. **[React Guide](./react-guide.md)** - Build React apps with FHEVM hooks
4. **[Next.js Guide](./nextjs-guide.md)** - Next.js 14 App Router integration
5. **[Security](./security.md)** - Best practices for secure dApps
6. **[Migration](./migration.md)** - Migrate from other FHEVM libraries

---

## Example Projects

Check out our example projects:

- **[Next.js Showcase](../examples/nextjs-showcase/)** - Complete Next.js 14 app
- **[Transit Analytics](../examples/transit-analytics/)** - Real-world privacy-preserving analytics
- **[Vanilla JS](../examples/vanilla-js/)** - Simple HTML/JS example

---

## Community & Support

- 📖 **Documentation**: [View full docs](../README.md)
- 💬 **Discord**: [Join community](https://discord.fhe.org)
- 🐛 **Issues**: [Report bugs](https://github.com/OctaviaRoob/fhevm-react-template/issues)
- 📧 **Email**: support@fhevm-sdk.example

---

**Ready to build confidential dApps? Let's dive deeper into the [Core Concepts](./core-concepts.md)!**

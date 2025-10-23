# Next.js Guide

Building confidential dApps with Next.js 14 App Router and the Universal FHEVM SDK.

## Quick Start

### 1. Create Next.js App

```bash
npx create-next-app@latest my-fhevm-app --typescript --tailwind --app
cd my-fhevm-app
```

### 2. Install Dependencies

```bash
npm install @fhevm/universal-sdk ethers wagmi @rainbow-me/rainbowkit
```

### 3. Setup Providers

```tsx
// app/providers.tsx
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'My FHEVM App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia],
  transports: { [sepolia.id]: http() }
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 4. Update Root Layout

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 5. Create FHEVM Page

```tsx
// app/page.tsx
'use client';

import { useFhevm, useEncrypt, NETWORKS } from '@fhevm/universal-sdk/react';
import { useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';

export default function Home() {
  const { data: walletClient } = useWalletClient();
  const provider = walletClient ? new ethers.BrowserProvider(walletClient) : null;

  const { fhevm, isLoading } = useFhevm({
    network: NETWORKS.sepolia,
    provider
  });

  const { encrypt, encrypted, isLoading: encrypting } = useEncrypt(fhevm);

  const handleEncrypt = async () => {
    await encrypt({ type: 'euint32', value: 12345 });
  };

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">FHEVM Demo</h1>
      <ConnectButton />

      {isLoading && <p>Initializing FHE...</p>}

      {fhevm && (
        <button
          onClick={handleEncrypt}
          disabled={encrypting}
          className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg"
        >
          {encrypting ? 'Encrypting...' : 'Encrypt Value'}
        </button>
      )}

      {encrypted && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="font-mono text-sm break-all">{encrypted}</p>
        </div>
      )}
    </main>
  );
}
```

### 6. Environment Variables

```env
# .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c
```

---

## Server Components vs Client Components

### Client Components (Use 'use client')

```tsx
'use client';

import { useFhevm } from '@fhevm/universal-sdk/react';

export default function ClientComponent() {
  const { fhevm } = useFhevm({...});
  // Can use hooks and browser APIs
}
```

### Server Components (Default)

```tsx
// app/about/page.tsx
export default function AboutPage() {
  // No hooks, no browser APIs
  return <div>About page (server-rendered)</div>;
}
```

---

## API Routes

```typescript
// app/api/encrypt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';
import { ethers } from 'ethers';

export async function POST(req: NextRequest) {
  const { value } = await req.json();

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const fhevm = await createFhevmInstance({
    network: NETWORKS.sepolia,
    provider
  });

  const encrypted = await fhevm.encrypt32(value);

  return NextResponse.json({ encrypted });
}
```

---

## Deployment

### Vercel

```bash
vercel --prod
```

### Environment Variables (Vercel)

Add in Vercel dashboard:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`

---

For complete example, see [Next.js Showcase](../examples/nextjs-showcase/).

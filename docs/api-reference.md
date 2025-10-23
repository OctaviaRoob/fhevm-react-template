# API Reference

Complete API documentation for the Universal FHEVM SDK.

## Core API (`@fhevm/universal-sdk`)

### `createFhevmInstance(config)`

Creates a new FHEVM instance for encryption/decryption operations.

**Parameters:**
- `config.network`: Network configuration (NETWORKS.sepolia, NETWORKS.zamaDevnet, etc.)
- `config.provider`: Ethers.js provider instance
- `config.timeout?`: Operation timeout in milliseconds (default: 30000)

**Returns:** `Promise<FhevmInstance>`

**Example:**
```typescript
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const fhevm = await createFhevmInstance({
  network: NETWORKS.sepolia,
  provider
});
```

### Encryption Methods

#### `fhevm.encrypt8(value)`
Encrypts an 8-bit unsigned integer (0-255).

#### `fhevm.encrypt16(value)`
Encrypts a 16-bit unsigned integer (0-65535).

#### `fhevm.encrypt32(value)`
Encrypts a 32-bit unsigned integer.

#### `fhevm.encrypt64(value)`
Encrypts a 64-bit unsigned integer.

#### `fhevm.encryptBool(value)`
Encrypts a boolean value.

#### `fhevm.encryptAddress(address)`
Encrypts an Ethereum address.

### `fhevm.createEncryptedInput(contractAddress, userAddress)`

Creates an encrypted input builder for batch encryption.

**Returns:** `EncryptedInputBuilder`

**Example:**
```typescript
const input = fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(1000)
  .add8(50)
  .addBool(true);

const { handles, inputProof } = await input.getEncrypted();
```

### Decryption Methods

#### `fhevm.requestDecryption(encryptedValue, contractAddress)`

Requests decryption from Zama gateway.

**Returns:** `Promise<string>` (request ID)

#### `fhevm.awaitDecryption(requestId, options?)`

Waits for decryption result.

**Parameters:**
- `options.timeout?`: Max wait time (default: 30000ms)
- `options.pollInterval?`: Check interval (default: 2000ms)

**Returns:** `Promise<number | bigint>`

---

## React Hooks (`@fhevm/universal-sdk/react`)

### `useFhevm(config)`

React hook for FHEVM instance management.

**Parameters:** Same as `createFhevmInstance`

**Returns:**
```typescript
{
  fhevm: FhevmInstance | null;
  isLoading: boolean;
  error: Error | null;
}
```

### `useEncrypt(fhevm)`

Hook for encrypting values.

**Returns:**
```typescript
{
  encrypt: (input: EncryptInput) => Promise<void>;
  encrypted: string | null;
  isLoading: boolean;
  error: Error | null;
}
```

### `useDecrypt(fhevm)`

Hook for decrypting values.

**Returns:**
```typescript
{
  decrypt: (encryptedValue: string, contractAddress: string) => Promise<void>;
  decrypted: number | bigint | null;
  isLoading: boolean;
  error: Error | null;
}
```

---

## Network Presets

### `NETWORKS.sepolia`

Ethereum Sepolia testnet configuration.

### `NETWORKS.zamaDevnet`

Zama development network configuration.

### `NETWORKS.zamaTestnet`

Zama test network configuration.

---

## TypeScript Types

### `FhevmConfig`
```typescript
interface FhevmConfig {
  network: NetworkConfig;
  provider: ethers.Provider;
  timeout?: number;
}
```

### `NetworkConfig`
```typescript
interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  gatewayUrl: string;
  publicKey?: string;
}
```

### `FhevmInstance`
```typescript
interface FhevmInstance {
  encrypt8(value: number): Promise<string>;
  encrypt16(value: number): Promise<string>;
  encrypt32(value: number): Promise<string>;
  encrypt64(value: bigint): Promise<string>;
  encryptBool(value: boolean): Promise<string>;
  encryptAddress(address: string): Promise<string>;
  createEncryptedInput(contractAddress: string, userAddress: string): EncryptedInputBuilder;
  requestDecryption(encryptedValue: string, contractAddress: string): Promise<string>;
  awaitDecryption(requestId: string, options?: DecryptOptions): Promise<number | bigint>;
}
```

---

For complete examples, see the [Examples](../examples/) directory.

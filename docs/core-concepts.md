# Core Concepts

Understanding Fully Homomorphic Encryption (FHE) and the Universal FHEVM SDK architecture.

## Table of Contents

- [What is Fully Homomorphic Encryption?](#what-is-fully-homomorphic-encryption)
- [FHEVM Architecture](#fhevm-architecture)
- [Encrypted Data Types](#encrypted-data-types)
- [Encryption Process](#encryption-process)
- [Homomorphic Operations](#homomorphic-operations)
- [Decryption Flow](#decryption-flow)
- [Privacy Model](#privacy-model)

---

## What is Fully Homomorphic Encryption?

**Fully Homomorphic Encryption (FHE)** enables computation on encrypted data without decryption.

### Traditional Encryption Flow

```
Plaintext → Encrypt → Ciphertext → Decrypt → Compute → Result
          (Private)              (Exposed)
```

### FHE Flow

```
Plaintext → Encrypt → Ciphertext → Compute (Encrypted) → Decrypt → Result
          (Private)              (Always Private)
```

### Key Benefits

- ✅ **Privacy-Preserving**: Data never exposed during computation
- ✅ **Blockchain-Compatible**: Store encrypted data on-chain
- ✅ **Regulatory Compliance**: Meet GDPR/CCPA requirements
- ✅ **Zero-Knowledge**: Verifiable computation without revealing data

---

## FHEVM Architecture

### System Components

```
┌─────────────────────────────────────────────────┐
│              Client Application                  │
│  (Browser / Node.js / React / Vue)              │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Universal FHEVM SDK                     │  │
│  │  ├─ FhevmClient (Core)                   │  │
│  │  ├─ React Hooks (Optional)               │  │
│  │  └─ Network Presets                      │  │
│  └──────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           Ethereum Blockchain                    │
│  ┌──────────────────────────────────────────┐  │
│  │  Smart Contract (Solidity)               │  │
│  │  ├─ TFHE Library (FHE Operations)        │  │
│  │  ├─ Encrypted Storage (euint32, etc.)    │  │
│  │  └─ Gateway Integration                  │  │
│  └──────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│         Zama Coprocessor / Gateway              │
│  ┌──────────────────────────────────────────┐  │
│  │  Decryption Oracle                       │  │
│  │  ├─ Secure Key Management (KMS)          │  │
│  │  ├─ Threshold Decryption                 │  │
│  │  └─ Cryptographic Signatures             │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **Client encrypts** data using FHE public key
2. **Smart contract** stores encrypted data on-chain
3. **Smart contract** performs homomorphic operations
4. **Gateway** decrypts results (only when requested)
5. **Client** receives decrypted output

---

## Encrypted Data Types

The FHEVM supports these encrypted types:

| Type | Description | Range | Use Cases |
|------|-------------|-------|-----------|
| **euint8** | 8-bit unsigned integer | 0 - 255 | Age, count, small values |
| **euint16** | 16-bit unsigned integer | 0 - 65,535 | Price, quantity |
| **euint32** | 32-bit unsigned integer | 0 - 4,294,967,295 | Balance, timestamp |
| **euint64** | 64-bit unsigned integer | 0 - 18,446,744,073,709,551,615 | Large numbers |
| **ebool** | Encrypted boolean | true / false | Flags, conditions |
| **eaddress** | Encrypted address | Ethereum address | Private transfers |

### Type Selection Guide

```typescript
// Small values (0-255)
const age = await fhevm.encrypt8(25);

// Medium values (0-65535)
const price = await fhevm.encrypt16(1000);

// Large values (billions)
const balance = await fhevm.encrypt32(1000000);

// Very large values
const bigAmount = await fhevm.encrypt64(BigInt('9999999999999999'));

// Boolean flags
const isActive = await fhevm.encryptBool(true);

// Addresses
const recipient = await fhevm.encryptAddress('0x1234...');
```

---

## Encryption Process

### Client-Side Encryption

```typescript
import { createFhevmInstance, NETWORKS } from '@fhevm/universal-sdk';

// 1. Create FHEVM instance
const fhevm = await createFhevmInstance({
  network: NETWORKS.sepolia,
  provider
});

// 2. Encrypt value
const encrypted = await fhevm.encrypt32(12345);
// Result: "0x..." (ciphertext)

// 3. Use in contract call
await contract.submitValue(encrypted);
```

### What Happens During Encryption?

1. **Fetch Public Key**: SDK retrieves FHE public key from blockchain
2. **Encrypt Value**: Value encrypted using TFHE library
3. **Generate Proof**: Zero-knowledge proof of correct encryption
4. **Return Ciphertext**: Encrypted bytes ready for contract

---

## Homomorphic Operations

### Supported Operations

Smart contracts can perform these operations on encrypted data:

#### Arithmetic Operations

```solidity
// Addition
euint32 sum = TFHE.add(encryptedA, encryptedB);

// Subtraction
euint32 diff = TFHE.sub(encryptedA, encryptedB);

// Multiplication
euint32 product = TFHE.mul(encryptedA, encryptedB);

// Division (limited)
euint32 quotient = TFHE.div(encryptedA, plaintextB);
```

#### Comparison Operations

```solidity
// Equal
ebool isEqual = TFHE.eq(encryptedA, encryptedB);

// Not equal
ebool notEqual = TFHE.ne(encryptedA, encryptedB);

// Greater than
ebool greater = TFHE.gt(encryptedA, encryptedB);

// Less than
ebool less = TFHE.lt(encryptedA, encryptedB);
```

#### Logical Operations

```solidity
// AND
ebool andResult = TFHE.and(encryptedBool1, encryptedBool2);

// OR
ebool orResult = TFHE.or(encryptedBool1, encryptedBool2);

// NOT
ebool notResult = TFHE.not(encryptedBool);
```

### Example: Encrypted Sum

```solidity
contract EncryptedSum {
    euint32 public encryptedTotal;

    function addValue(bytes calldata encryptedValue) public {
        euint32 value = TFHE.asEuint32(encryptedValue);
        encryptedTotal = TFHE.add(encryptedTotal, value);
    }
}
```

---

## Decryption Flow

### Async Decryption

```typescript
// 1. Request decryption from gateway
const requestId = await fhevm.requestDecryption(
  encryptedValue,
  contractAddress
);

// 2. Wait for oracle callback
const decrypted = await fhevm.awaitDecryption(requestId, {
  timeout: 30000, // 30 seconds
  pollInterval: 2000 // Check every 2 seconds
});

console.log('Decrypted value:', decrypted);
```

### Smart Contract Decryption

```solidity
import "@fhevm/oracle/Gateway.sol";

contract MyContract {
    function requestDecryption(euint32 encrypted) public {
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(encrypted);

        Gateway.requestDecryption(
            cts,
            this.callbackDecrypt.selector,
            0,
            block.timestamp + 100,
            false
        );
    }

    function callbackDecrypt(
        uint256 requestId,
        uint32 decryptedValue
    ) public onlyGateway {
        // Handle decrypted value
        emit ValueDecrypted(decryptedValue);
    }
}
```

---

## Privacy Model

### What's Private?

| Data | Encryption | Visibility |
|------|-----------|-----------|
| Individual values | ✅ euint32 | Private (never decrypted) |
| Intermediate results | ✅ euint32 | Private (computation encrypted) |
| Aggregate results | ✅ euint32 → decrypt | Public (after decryption) |

### What's Public?

- Transaction existence (blockchain requirement)
- Transaction sender address
- Contract address
- Function called
- Gas used
- Timestamp

### Privacy Best Practices

1. **Use Fresh Addresses**: Prevent transaction linkage
2. **Batch Operations**: Submit multiple values together
3. **Timing Obfuscation**: Randomize submission times
4. **Network Privacy**: Use Tor/VPN for submissions
5. **Aggregate-Only Decryption**: Never decrypt individual values

---

## Security Considerations

### Threat Model

#### Protected Against ✅

- On-chain data analysis
- Contract owner snooping
- Third-party surveillance
- Front-running attacks

#### Not Protected Against ⚠️

- Transaction timing analysis
- Wallet address correlation
- Network-level monitoring
- Quantum attacks (future)

### Mitigation Strategies

```typescript
// 1. Use random delays
await delay(Math.random() * 5000);
await contract.submitData(encrypted);

// 2. Use mixing services
const mixedAddress = await mixer.getCleanAddress();

// 3. Batch submissions
const inputs = [value1, value2, value3];
await contract.batchSubmit(inputs);
```

---

## Advanced Concepts

### Encrypted Input Builder

```typescript
const input = fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(1000)      // euint32
  .add8(50)         // euint8
  .addBool(true);   // ebool

const { handles, inputProof } = await input.getEncrypted();
await contract.submit(...handles, inputProof);
```

### Re-encryption

Re-encrypt data for a different address:

```typescript
const reencrypted = await fhevm.reencrypt(
  encryptedValue,
  publicKey,
  signature
);
```

### Time-Windowed Operations

```solidity
function submitData() public {
    require(block.timestamp % 2 == 1, "Odd hours only");
    // Submit during odd hours
}

function analyze() public {
    require(block.timestamp % 2 == 0, "Even hours only");
    // Analyze during even hours
}
```

---

## Performance Characteristics

### Encryption Times

| Type | Average Time | Gas Cost |
|------|-------------|----------|
| euint8 | ~100ms | ~50,000 |
| euint16 | ~120ms | ~60,000 |
| euint32 | ~150ms | ~80,000 |
| euint64 | ~200ms | ~100,000 |
| ebool | ~80ms | ~40,000 |

### Homomorphic Operation Costs

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Add | ~30,000 | Cheapest |
| Sub | ~30,000 | Same as add |
| Mul | ~80,000 | More expensive |
| Div | ~100,000 | Most expensive |
| Compare | ~40,000 | Moderate cost |

---

## Next Steps

- **[API Reference](./api-reference.md)** - Complete SDK API
- **[React Guide](./react-guide.md)** - Build React apps
- **[Security](./security.md)** - Best practices
- **[Examples](../examples/)** - Real-world implementations

---

**Understanding these core concepts is essential for building privacy-preserving dApps with FHE!**

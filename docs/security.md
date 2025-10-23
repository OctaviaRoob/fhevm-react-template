# Security Best Practices

Guidelines for building secure confidential dApps with the Universal FHEVM SDK.

## Table of Contents

- [Privacy Model](#privacy-model)
- [Threat Model](#threat-model)
- [Best Practices](#best-practices)
- [Common Vulnerabilities](#common-vulnerabilities)
- [Security Checklist](#security-checklist)

---

## Privacy Model

### What FHE Protects

✅ **Individual data values**: Encrypted on-chain, never decrypted
✅ **Computation results**: Intermediate values remain encrypted
✅ **Aggregate statistics**: Only totals/sums revealed (not individuals)

### What FHE Doesn't Protect

❌ **Transaction existence**: Visible on blockchain
❌ **Sender address**: Public Ethereum address
❌ **Transaction timing**: Timestamp is public
❌ **Gas usage**: Public information

---

## Threat Model

### Protected Against

- ✅ On-chain data analysis
- ✅ Contract owner surveillance
- ✅ Third-party snooping
- ✅ Front-running (encrypted values)

### Not Protected Against

- ⚠️ Transaction timing analysis
- ⚠️ Address correlation
- ⚠️ Network-level monitoring
- ⚠️ Side-channel attacks

---

## Best Practices

### 1. Use Fresh Addresses

```typescript
// Bad: Reusing same address
const userAddress = await signer.getAddress();

// Good: Generate fresh address per transaction
const freshWallet = ethers.Wallet.createRandom();
```

### 2. Randomize Timing

```typescript
// Add random delay before submission
const randomDelay = Math.floor(Math.random() * 5000);
await new Promise(resolve => setTimeout(resolve, randomDelay));
await contract.submitData(encrypted);
```

### 3. Batch Operations

```typescript
// Submit multiple values together
const input = fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(value1)
  .add32(value2)
  .add32(value3);

await contract.batchSubmit(input);
```

### 4. Never Decrypt Individual Values

```solidity
// Bad: Decrypting individual user data
function getUserBalance(address user) public {
    euint32 balance = balances[user];
    Gateway.requestDecryption(balance); // DON'T DO THIS
}

// Good: Only decrypt aggregates
function getTotalBalance() public onlyOwner {
    euint32 total = calculateTotal();
    Gateway.requestDecryption(total); // OK
}
```

### 5. Validate Encrypted Inputs

```solidity
function submitData(bytes calldata encryptedValue) public {
    require(encryptedValue.length > 0, "Empty input");
    require(encryptedValue.length <= MAX_SIZE, "Input too large");

    euint32 value = TFHE.asEuint32(encryptedValue);
    // Additional validation...
}
```

### 6. Access Control

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract SecureContract is Ownable {
    function performAnalysis() public onlyOwner {
        // Only owner can trigger decryption
    }
}
```

### 7. Time-Based Controls

```solidity
uint256 public lastSubmission;

function submitData() public {
    require(
        block.timestamp >= lastSubmission + COOLDOWN_PERIOD,
        "Cooldown not expired"
    );
    lastSubmission = block.timestamp;
    // Process submission...
}
```

---

## Common Vulnerabilities

### 1. Leaking Individual Data

**Vulnerable:**
```solidity
mapping(address => euint32) public balances;

function revealBalance(address user) public {
    // Decrypts individual balance - PRIVACY LEAK!
    Gateway.requestDecryption(balances[user]);
}
```

**Secure:**
```solidity
euint32 public totalBalance;

function revealTotal() public onlyOwner {
    // Only reveals aggregate
    Gateway.requestDecryption(totalBalance);
}
```

### 2. Timing Attacks

**Vulnerable:**
```typescript
// Submitting immediately reveals pattern
await contract.submitData(encrypted);
```

**Secure:**
```typescript
// Random delay obfuscates timing
await delay(Math.random() * 10000);
await contract.submitData(encrypted);
```

### 3. Address Correlation

**Vulnerable:**
```typescript
// Same address for all operations
const signer = await provider.getSigner();
await contract.submit(encrypted);
await contract.claim();
```

**Secure:**
```typescript
// Use different addresses or mixing service
const submitWallet = freshAddress1;
const claimWallet = freshAddress2;
```

### 4. Insufficient Input Validation

**Vulnerable:**
```solidity
function submitValue(bytes calldata enc) public {
    euint32 value = TFHE.asEuint32(enc);
    total = TFHE.add(total, value); // No bounds check
}
```

**Secure:**
```solidity
function submitValue(bytes calldata enc) public {
    euint32 value = TFHE.asEuint32(enc);

    // Check bounds (encrypted comparison)
    ebool isValid = TFHE.le(value, MAX_VALUE);
    require(TFHE.decrypt(isValid), "Value too large");

    total = TFHE.add(total, value);
}
```

---

## Security Checklist

### Smart Contract Security

- [ ] Only decrypt aggregate values, never individual data
- [ ] Implement access control (Ownable, AccessControl)
- [ ] Validate all encrypted inputs
- [ ] Add rate limiting / cooldowns
- [ ] Emit events for transparency
- [ ] Use OpenZeppelin contracts for standards
- [ ] Run Slither security audit
- [ ] Test with Hardhat test suite

### Frontend Security

- [ ] Never log encrypted values in production
- [ ] Clear sensitive data from memory
- [ ] Use HTTPS for all connections
- [ ] Validate user inputs before encryption
- [ ] Handle errors gracefully (no sensitive info in errors)
- [ ] Implement CSP headers
- [ ] Use environment variables for secrets

### Privacy Protection

- [ ] Use fresh addresses when possible
- [ ] Randomize transaction timing
- [ ] Batch operations together
- [ ] Use Tor/VPN for network privacy
- [ ] Don't correlate on-chain/off-chain identities
- [ ] Minimize public metadata

### Operational Security

- [ ] Rotate private keys regularly
- [ ] Use hardware wallets for production
- [ ] Monitor for unusual activity
- [ ] Have incident response plan
- [ ] Regular security audits
- [ ] Bug bounty program

---

## Encryption Security

### Secure Key Management

```typescript
// Bad: Hardcoded private key
const privateKey = "0x1234...";

// Good: Use environment variables
const privateKey = process.env.PRIVATE_KEY;

// Best: Use hardware wallet
import { LedgerSigner } from '@ethersproject/hardware-wallets';
const signer = new LedgerSigner(provider);
```

### Secure Random Generation

```typescript
// Bad: Predictable randomness
const random = Math.random();

// Good: Cryptographically secure
import { randomBytes } from 'crypto';
const random = randomBytes(32);
```

---

## Auditing

### Static Analysis

```bash
# Run Slither on contracts
npm run security

# Check for common vulnerabilities
slither contracts/ --detect all
```

### Testing

```typescript
// Test privacy guarantees
it('should not reveal individual values', async () => {
  await contract.submitData(encrypted);
  const individual = await contract.getUserData(user);
  // Should be encrypted
  expect(individual).to.not.equal(plaintext);
});

// Test aggregate decryption
it('should reveal only aggregates', async () => {
  const total = await contract.getTotalDecrypted();
  // Should be plaintext aggregate
  expect(total).to.equal(expectedTotal);
});
```

---

## Incident Response

### If Data Leak Detected

1. **Immediately pause contract** (if pausable)
2. **Notify users** via official channels
3. **Investigate root cause**
4. **Deploy patched contract**
5. **Migrate user data** securely
6. **Publish post-mortem**

### Emergency Contacts

- Security team: security@example.com
- Bug bounty: bugbounty@example.com
- Zama support: support@zama.ai

---

## Resources

- [Zama Security Guidelines](https://docs.zama.ai/fhevm/security)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/security)
- [Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Ethereum Security Tools](https://ethereum.org/en/developers/docs/security/)

---

**Security is an ongoing process. Stay vigilant and keep learning!**

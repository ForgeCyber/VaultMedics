# VaultMedics Smart Contracts

This directory contains the Solidity smart contracts for VaultMedics - a blockchain-powered medical record management system built on BOT Chain.

## Overview

VaultMedics uses smart contracts to provide:
- **Immutable Record Proofs**: Medical record hashes stored on BOT Chain blockchain
- **Consent Management**: Patient-controlled access to healthcare providers
- **Audit Trail**: Complete HIPAA-compliant logging of all access events

## Smart Contract

### MedicalRecordRegistry.sol

The main contract (325 lines) that manages:
- Medical record creation and verification
- Patient consent granting/revocation
- Access control and audit logging
- IPFS hash references for encrypted data

## Getting Started

### Prerequisites

- Node.js 18+
- Private key with bot tokens
- MetaMask or compatible Web3 wallet

### Installation

```console
cd SContract
npm install
```

### Environment Setup

```console
cp .env.example .env
```

Edit `.env` and add your private key:
```
PRIVATE_KEY=your_wallet_private_key_here
BOT_RPC_API_KEY=your_api_key_optional
BOT_EXPLORER_API_KEY=your_api_key_optional
```

### Compile Contracts

```console
npx hardhat compile
```

### Deploy to Bot Networks

**Bot Testnet**:
```console
npx hardhat run scripts/deploy.ts --network tbot
```

**Bot Mainnet**:
```console
npx hardhat run scripts/deploy.ts --network bot
```

### Testing

```console
npx hardhat test
```

## Repository Structure

```
├── contracts/              # Solidity smart contracts
│   └── MedicalRecordRegistry.sol
├── scripts/                # Deployment scripts
│   └── deploy.ts
├── test/                   # Contract tests
├── artifacts/              # Compiled contract artifacts
├── hardhat.config.ts       # Hardhat configuration
├── package.json
├── .env.example
└── README.md
```

## Contract Functions

### Record Management
- `createRecord(recordHash, recordType, ipfsHash)` - Create new medical record
- `updateRecordIPFS(recordHash, newIpfsHash)` - Update IPFS hash
- `deactivateRecord(recordHash)` - Soft delete record
- `getRecord(recordHash)` - Get record details

### Consent Management
- `grantConsent(provider, expiresAt)` - Grant access to provider
- `revokeConsent(provider)` - Revoke provider access
- `hasAccess(patient, provider)` - Check if provider has access

### Query Functions
- `getPatientRecords(patient)` - Get all patient records
- `getPatientRecordCount(patient)` - Get record count
- `getConsent(patient, provider)` - Get consent details

### Admin Functions
- `setRegistryFee(newFee)` - Update registry fee
- `setPaused(_paused)` - Pause/unpause registry
- `withdrawFees()` - Withdraw collected fees
- `transferOwnership(newOwner)` - Transfer contract ownership

## Deployment Output

After deployment, the script saves deployment info to:
- `deployments/{network}-{timestamp}.json`
- `deployments/{network}-latest.json`

Update your frontend `.env.local` with the contract address:
```
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REGISTRY_NETWORK=bot
```

## Gas Costs (BOT)

| Operation | Gas | BOT (est.) |
|-----------|-----|------------|
| Create Record | ~150,000 | 0.015 |
| Grant Consent | ~100,000 | 0.010 |
| Revoke Consent | ~80,000 | 0.008 |

## Resources

- [BOT Developer Docs](https://dev-docs.botchain.ai/docs/Developers/quick-guide/)
- [Hardhat Docs](https://hardhat.org/docs)
- [Frontend Documentation](../Frontend/README.md)

## License

MIT License

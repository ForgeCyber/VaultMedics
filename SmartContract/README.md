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
cd SmartContract
forge install
```

### Environment Setup

```console
cp .env.example .env
```

Edit `.env` and add your private key:
```
PRIVATE_KEY=your_wallet_private_key_here
BOT_RPC_URL=your_api_key_optional
EXPLORER_RPC_URL=your_api_key_optional
```

### Compile Contracts

```console
forge build
```

### Deploy to Bot Networks

**Bot Mainnet**:
```console
forge script script/Deploy.s.sol --broadcast --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

### Verify Deployed Contract
```console
forge verify-contract $ADDRESS src/MedicalRecordRegistry.sol:MedicalRecordRegistry --etherscan-api-key $KEY
```

### Testing

```console
forge test
or
forge test -vvvv
```

## Repository Structure

```
├── src/                    # Solidity smart contracts
│   └── MedicalRecordRegistry.sol
├── script/                # Deployment scripts
│   └── Deploy.s.sol
├── test/                   # Contract tests
├── out/                    # Compiled contract artifacts
├── foundry.toml            # Foundry configuration
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

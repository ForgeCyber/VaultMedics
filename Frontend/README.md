# VaultMedics - Blockchain-Verified Medical Records on BOT Chain

[![BOT Hackathon](https://img.shields.io/badge/Hackathon-BOT%20Chain%20Africa%20Builder-blue)](https://www.botchain.ai/en)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)
[![Solidity Contracts](https://img.shields.io/badge/Contracts-Solidity-red)](https://docs.soliditylang.org/)
[![License MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

VaultMedics is a **secure, blockchain-powered medical record management system** built on **BOT blockchain**. It enables patients to securely store, manage, and verify their medical records while maintaining complete control over doctor access.

## 🎯 What It Does

- **📋 Record Management**: Upload, organize, and manage medical documents
- **🤖 AI Insights**: Get automatic medical record summaries with key findings
- **⛓️ Blockchain Verification**: Register records on BOT Network for immutable proof
- **🔐 Consent Control**: Grant/revoke doctor access with cryptographic guarantees
- **📊 Audit Trail**: Complete compliance logging for HIPAA requirements

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <repo>
cd VaultMedics/Frontend
pnpm install

# 2. Setup environment
cp .env.example .env.local

# 3. Start development
pnpm dev

# 4. Open browser
open http://localhost:3000
```

See [README.md](./../SmartContract/README.md) for contract setup.

## 💡 Key Features

### For Patients
- ✅ Secure sign-up and authentication
- ✅ Upload medical documents (PDF, JPG, etc.)
- ✅ AI-powered record summarization
- ✅ Verify records on blockchain
- ✅ Grant/revoke doctor access
- ✅ Complete audit trail

### For Healthcare Providers
- ✅ View consented records
- ✅ Verify record authenticity
- ✅ Access is encrypted and time-limited
- ✅ Instantaneous revocation

### For Developers
- ✅ Smart contracts for medical records
- ✅ HIPAA-compliant audit logging
- ✅ Type-safe TypeScript codebase
- ✅ Hardhat deployment pipelines
- ✅ Comprehensive documentation

## 🏗️ Architecture

```
Frontend (Next.js + React)
    ↓
Backend (Next.js API Routes)
    ↓
┌─────────────────────────────┐
│  Data Layer                 │
│  ├─ Supabase                │
│  ├─ Vercel Blob (files)     │
│  └─ BOT Blockchain          │
└─────────────────────────────┘
```

## 🔗 Blockchain Integration

### Smart Contract
- **MedicalRecordRegistry.sol** (325 lines) - Located in `../SmartContract/src/`
  - Create immutable record proofs
  - Manage patient-doctor consent
  - Query record details
  - HIPAA compliance logging

### Deployed On
- **BOT Testnet or Mainnet** (for hackathon) - Deploy from `../SmartContract/`
- Ready for BOT Mainnet

### Gas Costs
| Operation | Gas | BOT |
|-----------|-----|------|
| Create Record | 150,000 | ~0.015 |
| Grant Consent | 100,000 | ~0.010 |
| Revoke Consent | 80,000 | ~0.008 |

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **ethers.js** - Web3 interaction

### Backend
- **Next.js API Routes** - Serverless functions
- **Neon PostgreSQL** - Database
- **Drizzle ORM** - Type-safe queries
- **Better Auth** - Authentication
- **Vercel AI SDK** - Gemini integration

### Blockchain
- **Solidity 0.8.19** - Smart contracts (in `../SmartContract/`)
- **Foundry** - Development framework (in `../SmartContract/`)
- **BOT Network** - EVM layer 1
- **MetaMask** - Wallet integration
- **ethers.js** - Web3 interaction

## 📊 Database Schema

8 tables supporting medical records and blockchain integration:

```
user              (Better Auth)
session           (Better Auth)
account           (Better Auth)
verification      (Better Auth)
medical_records   (VaultMedics)
record_summaries  (AI insights)
blockchain_records (Proofs)
consent_logs      (HIPAA audit trail)
```

## 🔐 Security

- ✅ Server-side session validation
- ✅ Per-user data scoping
- ✅ Encrypted file storage
- ✅ Password hashing (Better Auth)
- ✅ CSRF protection
- ✅ Immutable blockchain audit trail

## 📦 Deployment

### Development
```bash
pnpm dev          # Start on localhost:3000
```

### Production
```bash
pnpm build        # Build for production
pnpm start        # Start production server
```

## 📋 File Structure

```
vault-medics/
├── app/                    # Next.js app
│   ├── (auth)/            # Sign in/up
│   ├── (dashboard)/       # Main app
│   ├── api/               # API routes
│   └── globals.css
├── components/            # React components
├── lib/
│   ├── auth.ts            # Auth config
│   ├── db/                # Database setup
│   └── blockchain/        # Contract ABI & wagmi config
├── hooks/                 # React hooks
└── docs/                  # Documentation
```

## 🎯 Hackathon Submission

Submitted to **BOT Chain Africa Builder Challenge**

### Highlights
- ✅ Real problem: Patient data portability & control
- ✅ Meaningful BOT integration: Smart contracts + blockchain verification
- ✅ Technical execution: Working demo with blockchain interaction
- ✅ Clear roadmap: Phase 2-5 enhancements planned

See [HACKATHON_SUBMISSION.md](./HACKATHON_SUBMISSION.md) for full details.

## 🚀 Roadmap

### Phase 1 (✅ Complete)
- Patient dashboard
- Medical record CRUD
- AI summarization
- Blockchain verification

### Phase 2 (🔄 Planned)
- BOT Data Proof Protocol
- Enhanced privacy features
- Confidential Compute integration

### Phase 3 (📋 Planned)
- Doctor portal
- Provider verification DAO
- Multi-signature consent

### Phase 4 (📋 Planned)
- Cross-chain interoperability
- FAssets for international patients
- Insurance claim verification

## 🤝 Contributing

This is a hackathon project. Contributions welcome! See issues for ideas.

## 📄 License

MIT License - see LICENSE file

## 🔗 Links

- [BOT Chain Developer Docs](https://dev-docs.botchain.ai/docs/Developers/quick-guide/)
- [Deploy on Vercel](https://vercel.com/)
- [BOT Explorer](https://scan.bohr.life/)

## 👥 Team

Built for **BOT Chain Africa Builder Challenge**

**Questions?** Check the documentation or visit the BOT Chain Africa Builder Challenge Telegram group.

---

**VaultMedics** - Empowering Patients with Blockchain-Verified Medical Records

*Built with ❤️ on BOT Chain*

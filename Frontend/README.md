# VaultMedics - Blockchain-Verified Medical Records on Flare

[![Flare Summer Signal Hackathon](https://img.shields.io/badge/Hackathon-Flare%20Summer%20Signal-blue)](https://dorahacks.io/hackathon/flaresummersignal/detail)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)
[![Solidity Contracts](https://img.shields.io/badge/Contracts-Solidity-red)](https://docs.soliditylang.org/)
[![License MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

VaultMedics is a **secure, blockchain-powered medical record management system** built on **Flare blockchain**. It enables patients to securely store, manage, and verify their medical records while maintaining complete control over doctor access.

## 🎯 What It Does

- **📋 Record Management**: Upload, organize, and manage medical documents
- **🤖 AI Insights**: Get automatic medical record summaries with key findings
- **⛓️ Blockchain Verification**: Register records on Flare for immutable proof
- **🔐 Consent Control**: Grant/revoke doctor access with cryptographic guarantees
- **📊 Audit Trail**: Complete compliance logging for HIPAA requirements

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <repo>
cd vault-medics
pnpm install

# 2. Setup environment
cp .env.example .env.local
# Add DATABASE_URL, BETTER_AUTH_SECRET, AI_GATEWAY_API_KEY

# 3. Start development
pnpm dev

# 4. Open browser
open http://localhost:3000
```

See [BLOCKCHAIN_DEPLOYMENT.md](./BLOCKCHAIN_DEPLOYMENT.md) for blockchain setup.

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
│  ├─ Neon PostgreSQL         │
│  ├─ Vercel Blob (files)     │
│  └─ Flare Blockchain        │
└─────────────────────────────┘
```

## 🔗 Blockchain Integration

### Smart Contract
- **MedicalRecordRegistry.sol** (325 lines) - Located in `../SContract/contracts/`
  - Create immutable record proofs
  - Manage patient-doctor consent
  - Query record details
  - HIPAA compliance logging

### Deployed On
- **Flare Coston2 Testnet** (for hackathon) - Deploy from `../SContract/`
- Ready for Songbird & Flare Mainnet

### Gas Costs (Coston2)
| Operation | Gas | CFLR |
|-----------|-----|------|
| Create Record | 150,000 | ~0.015 |
| Grant Consent | 100,000 | ~0.010 |
| Revoke Consent | 80,000 | ~0.008 |

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [BLOCKCHAIN_DEPLOYMENT.md](./BLOCKCHAIN_DEPLOYMENT.md) | Full deployment guide |
| [HACKATHON_SUBMISSION.md](./HACKATHON_SUBMISSION.md) | Hackathon entry details |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Complete project overview |
| [DOCUMENTATION.md](./DOCUMENTATION.md) | Documentation index |

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
- **Solidity 0.8.19** - Smart contracts (in `../SContract/`)
- **Hardhat** - Development framework (in `../SContract/`)
- **Flare Network** - EVM layer 1
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
blockchain_records (Flare proofs)
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

### Blockchain
```bash
# Deploy to Coston2 (from SContract directory)
cd ../SContract
npx hardhat run scripts/deploy.ts --network coston2

# Get testnet tokens
# https://faucet.flare.network/
```

## 🧪 Testing

For blockchain testing, see [BLOCKCHAIN_DEPLOYMENT.md](./BLOCKCHAIN_DEPLOYMENT.md):
- Local testing (no blockchain)
- Blockchain testing (Coston2)
- Test scenarios
- Troubleshooting

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

Submitted to **Flare Summer Signal - Confidential Compute Apps Track**

### Highlights
- ✅ Real problem: Patient data portability & control
- ✅ Meaningful Flare integration: Smart contracts + blockchain verification
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
- Flare Data Proof Protocol
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

- [Flare Developer Docs](https://dev.flare.network/)
- [Flare Hackathon Telegram](https://t.me/+5Vn6ZKhr6KI3NjIx)
- [Deploy on Vercel](https://vercel.com/)
- [Coston2 Explorer](https://coston2-explorer.flare.network/)

## 👥 Team

Built for **Flare Summer Signal Hackathon**

**Questions?** Check the documentation or visit the Flare Hackathon Telegram group.

---

**VaultMedics** - Empowering Patients with Blockchain-Verified Medical Records

*Built with ❤️ on Flare*

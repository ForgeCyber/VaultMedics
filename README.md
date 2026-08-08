# VaultMedics

> **An AI-powered Personal Health Vault that gives patients ownership, understanding, and secure control of their medical records.**

---

## Vision

VaultMedics is a decentralized, AI-powered personal health record platform that transforms healthcare from institution-centered to patient-centered. Instead of hospitals owning fragmented health data, patients securely store, understand, and share their records through AI-assisted insights and privacy-first access controls.

---

## The Problem

Medical records in healthcare systems are:

- **Fragmented** - Scattered across different hospitals and clinics
- **Inaccessible** - Difficult for patients to access their own history
- **Paper-based** - Vulnerable to loss, damage, and unauthorized access
- **Incomprehensible** - Complex medical terminology patients don't understand
- **Opaque** - No visibility into who accessed records or when
- **Uncontrollable** - Limited ability to manage data sharing permissions

These issues cause delays, increase costs, reduce treatment quality, and negatively affect patient outcomes.

---

## The Solution

VaultMedics provides a secure, AI-powered platform where patients own their medical records. The platform enables patients to:

- Store medical records securely in one place
- Upload laboratory reports, prescriptions, and medical images
- Organize and categorize their health documents
- View their complete health timeline
- Share records securely with healthcare providers
- Revoke access at any time
- Use AI to understand complex medical reports
- Verify document integrity through blockchain

---

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - PostgreSQL database, authentication, and storage
- **Next.js API Routes** - Serverless API endpoints

### AI
- **Google Gemini API** - Medical report analysis and patient-friendly explanations

### Blockchain
- **Bot Network** - Immutable record verification, consent management, and audit trails
- **Solidity** - Smart contracts for consent and access control

---

## Project Structure

```
VaultMedics/
├── Frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and configurations
│   ├── hooks/               # Custom React hooks
│   └── public/              # Static assets
├── SContract/               # Solidity smart contracts
└── README.md                # This file
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account
- Google Gemini API key
- Bot wallet (for blockchain features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VaultMedics/Frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and fill in:
   ```bash
   cp .env.example .env.local
   ```
   
   Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `GEMINI_API_KEY` - Google Gemini API key
   - `NEXT_PUBLIC_BOT_CONTRACT_ADDRESS` - Deployed contract address

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `schema.sql` in your Supabase SQL editor
   - Enable authentication (email/password)

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

---

## Features

### Patient Portal
- Secure registration and authentication
- Personal health dashboard with overview
- Upload medical records (PDFs, images)
- View and organize health timeline
- Manage access permissions

### AI Medical Assistant
- Summarize complex lab reports
- Explain medical terminology in plain language
- Highlight abnormal values and concerns
- Suggest questions to ask your doctor
- Provide medication information (not prescribing)

### Doctor Portal
- Request access to patient records
- View records after patient approval
- Upload consultation notes
- Add prescriptions and diagnoses

### Blockchain Layer (BOT)
- Record immutable hashes of medical documents
- Log consent events on-chain
- Maintain transparent audit trail
- Verify document integrity

### Security & Privacy
- End-to-end encryption
- Role-based access control
- Complete audit logs
- Patient-controlled consent management

---

## Documentation

- **[FEATURES.md](FEATURES.md)** - Detailed feature overview
- **[USERFLOW.md](USERFLOW.md)** - User interaction flows
- **Frontend/README.md** - Frontend-specific documentation

---

## Smart Contracts

The smart contracts are deployed on the BOT Network:

- **PatientRegistry** - Manages patient identities
- **MedicalRecordRegistry** - Stores document hashes and metadata
- **ConsentManager** - Handles permission grants and revocations
- **AccessAudit** - Logs all access events for transparency

---

## Why VaultMedics?

Unlike traditional Electronic Medical Record (EMR) systems where hospitals own patient data, VaultMedics places patients at the center of healthcare by enabling them to securely store, organize, understand, and selectively share their medical information.

**Key Differentiators:**
- Patient ownership of health data
- AI-powered medical understanding
- Blockchain-verified document integrity
- Transparent consent management
- Complete audit trail

---

## License

MIT License - see LICENSE file for details

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

---

## Contact

For questions or support, please open an issue on GitHub.

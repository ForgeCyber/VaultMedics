export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MedicalRecord {
  id: number
  userId: string
  title: string
  description?: string | null
  recordType: string
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  mimeType?: string | null
  uploadedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface RecordAttachment {
  id: number
  recordId: number
  userId: string
  fileUrl: string
  fileName: string
  fileSize?: number | null
  mimeType?: string | null
  uploadedAt: Date
}

export interface BlockchainRecord {
  id: number
  recordId: number
  userId: string
  blockchainHash: string
  transactionHash: string
  isVerified: boolean
  verificationTimestamp: Date
  createdAt: Date
  updatedAt: Date
}

export interface RecordSummary {
  id: number
  recordId: number
  userId: string
  summary: string
  keyFindings: string
  recommendations: string
  generatedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface ProviderPermission {
  id: number
  patientId: string
  patientWalletAddress: string
  providerWalletAddress: string
  grantedAt: Date
  expiresAt?: Date | null
  isActive: boolean
  blockchainTxHash?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface RecordPermission {
  id: number
  recordId: number
  patientId: string
  granteeId: string
  granteeType: string
  permission: string
  status: 'pending' | 'granted' | 'revoked'
  expiresAt?: Date | null
  approvedAt?: Date | null
  approvedBy?: string | null
  createdAt: Date
  updatedAt: Date
}

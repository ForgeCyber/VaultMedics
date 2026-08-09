import crypto from 'crypto'

const PINATA_BASE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'

const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL

function getPinataAuthHeaders() {
  const pinataJwt = process.env.PINATA_JWT
  if (pinataJwt) {
    return { Authorization: `Bearer ${pinataJwt}` }
  }

  return undefined
}

function getEncryptionKey(rawKey?: string | Buffer | null, allowEnvFallback = true) {
  const keySource = rawKey ?? (allowEnvFallback ? process.env.IPFS_ENCRYPTION_KEY : undefined)
  if (!keySource) return null

  if (typeof keySource === 'string') {
    if (/^[0-9a-fA-F]{64}$/.test(keySource)) {
      return Buffer.from(keySource, 'hex')
    }

    const key = Buffer.from(keySource, 'base64')
    if (key.length !== 32) {
      throw new Error('IPFS encryption key must be a 32-byte key encoded as hex or base64')
    }
    return key
  }

  if (Buffer.isBuffer(keySource)) {
    if (keySource.length !== 32) {
      throw new Error('IPFS encryption key buffer must be 32 bytes')
    }
    return keySource
  }

  throw new Error('Invalid encryption key format')
}

export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('base64')
}

function encryptBuffer(data: Buffer, rawKey?: string | Buffer | null) {
  const key = getEncryptionKey(rawKey)
  if (!key) return null

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted])
}

export function decryptBuffer(data: Buffer, rawKey?: string | Buffer | null) {
  const key = getEncryptionKey(rawKey, false)
  if (!key) throw new Error('Missing encryption key for decryption')

  if (data.length < 28) throw new Error('Encrypted data is too short')
  const iv = data.slice(0, 12)
  const authTag = data.slice(12, 28)
  const ciphertext = data.slice(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}

export function getIpfsHashFromUri(uri: string) {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', '')
  }

  const match = uri.match(/\/ipfs\/([^/?#]+)/)
  return match?.[1] ?? uri
}

export function buildIpfsUri(hash: string) {
  return `ipfs://${hash}`
}

export function buildPinataGatewayUrl(hash: string) {
  if (!PINATA_GATEWAY_URL) {
    throw new Error('Missing PINATA_GATEWAY_URL')
  }
  return `${PINATA_GATEWAY_URL.replace(/\/$/, '')}/ipfs/${hash}`
}

export async function pinFileToIPFS(fileBuffer: Buffer, fileName: string, contentType: string, encryptionKey?: string) {
  const pinataApiKey = process.env.PINATA_API_KEY
  const pinataApiSecret = process.env.PINATA_API_SECRET
  const authHeaders = getPinataAuthHeaders()

  if (!authHeaders && (!pinataApiKey || !pinataApiSecret)) {
    throw new Error('Missing Pinata credentials. Set PINATA_JWT or PINATA_API_KEY and PINATA_API_SECRET.')
  }

  const encrypted = encryptBuffer(fileBuffer, encryptionKey)
  const uploadBuffer = encrypted ?? fileBuffer
  const uploadFileName = encrypted ? `${fileName}.enc` : fileName
  const uploadContentType = encrypted ? 'application/octet-stream' : contentType

  const formData = new FormData()
  formData.append('file', new Blob([new Uint8Array(uploadBuffer)], { type: uploadContentType }), uploadFileName)
  formData.append('pinataMetadata', JSON.stringify({ name: uploadFileName }))

  if (!authHeaders) {
    formData.append('pinata_api_key', pinataApiKey as string)
    formData.append('pinata_secret_api_key', pinataApiSecret as string)
  }

  const response = await fetch(PINATA_BASE_URL, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Pinata upload failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const json = await response.json()
  if (!json.IpfsHash) {
    throw new Error('Pinata response did not contain IpfsHash')
  }

  return {
    ipfsHash: json.IpfsHash as string,
    fileUrl: buildIpfsUri(json.IpfsHash as string),
  }
}

async function decryptAndViewFile(ipfsHash: string, encryptionKey?: string) {
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch file from IPFS: ${response.status} ${response.statusText}`)
  }
  const buffer = await response.arrayBuffer()
  const decrypted = decryptBuffer(Buffer.from(buffer), encryptionKey)
  return decrypted
}

'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { MEDICAL_RECORD_REGISTRY_ABI, CONTRACT_ADDRESSES, NETWORKS } from '@/lib/blockchain/contract-abi'

declare global {
  interface Window {
    ethereum?: any
  }
}

interface BlockchainState {
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  contract: ethers.Contract | null
  address: string | null
  chainId: number | null
  chainName: string | null
  connected: boolean
}

export function useBlockchainRegistry() {
  const [state, setState] = useState<BlockchainState>({
    provider: null,
    signer: null,
    contract: null,
    address: null,
    chainId: null,
    chainName: null,
    connected: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Connect to wallet
  const connectWallet = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!window.ethereum) {
        throw new Error('No Web3 wallet detected. Please install MetaMask or similar.')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()

      const contractAddress = CONTRACT_ADDRESSES.coston2
      if (!contractAddress) {
        throw new Error('Contract address not configured')
      }

      const contract = new ethers.Contract(
        contractAddress,
        MEDICAL_RECORD_REGISTRY_ABI,
        signer
      )

      setState({
        provider,
        signer,
        contract,
        address: accounts[0],
        chainId: Number(network.chainId),
        chainName: network.name,
        connected: true,
      })

      console.log('[v0] Wallet connected:', accounts[0])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(message)
      console.error('[v0] Wallet connection error:', message)
    } finally {
      setLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setState({
      provider: null,
      signer: null,
      contract: null,
      address: null,
      chainId: null,
      chainName: null,
      connected: false,
    })
  }

  // Create medical record on blockchain
  const createRecord = async (
    recordHash: string,
    recordType: string,
    ipfsHash: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      if (!state.contract) {
        throw new Error('Contract not initialized. Please connect wallet.')
      }

      const tx = await state.contract.createRecord(recordHash, recordType, ipfsHash)
      const receipt = await tx.wait()

      return {
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        success: true,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create record'
      setError(message)
      console.error('[v0] Record creation error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Grant consent to provider
  const grantConsent = async (provider: string, expiresInDays: number = 0) => {
    try {
      setLoading(true)
      setError(null)

      if (!state.contract) {
        throw new Error('Contract not initialized. Please connect wallet.')
      }

      const expiresAt = expiresInDays === 0 ? 0 : Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60

      const tx = await state.contract.grantConsent(provider, expiresAt)
      const receipt = await tx.wait()

      return {
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        success: true,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to grant consent'
      setError(message)
      console.error('[v0] Grant consent error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Revoke consent from provider
  const revokeConsent = async (provider: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!state.contract) {
        throw new Error('Contract not initialized. Please connect wallet.')
      }

      const tx = await state.contract.revokeConsent(provider)
      const receipt = await tx.wait()

      return {
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        success: true,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke consent'
      setError(message)
      console.error('[v0] Revoke consent error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get all records for patient
  const getPatientRecords = async (patientAddress: string) => {
    try {
      if (!state.contract) {
        throw new Error('Contract not initialized')
      }

      const records = await state.contract.getPatientRecords(patientAddress)
      return records
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get patient records'
      console.error('[v0] Get records error:', message)
      throw err
    }
  }

  // Register a new provider
  const registerProvider = async (providerName: string, specialty: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!state.contract) {
        throw new Error('Contract not initialized')
      }

      const tx = await state.contract.registerProvider(providerName, specialty)
      const receipt = await tx.wait()

      return {
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        success: true,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register provider'
      setError(message)
      console.error('[v0] Register provider error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get all providers
  const getProviders = async () => {
    try {
      if (!state.contract) {
        throw new Error('Contract not initialized')
      }
      return await state.contract.getProvider()
    } catch (err) {
      console.error('[v0] Get providers error:', err)
      throw err
    }
  }

  // Get patients for provider
  const getPatients = async (provider: string) => {
    try {
      if (!state.contract) {
        throw new Error('Contract not initialized')
      }
      return await state.contract.getPatients(provider)
    } catch (err) {
      console.error('[v0] Get patients error:', err)
      throw err
    }
  }

  // Get single record
  const getRecord = async (recordHash: string) => {
    try {
      if (!state.contract) {
        throw new Error('Contract not initialized')
      }

      const record = await state.contract.getRecord(recordHash)
      return record
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get record'
      console.error('[v0] Get record error:', message)
      throw err
    }
  }

  // Check access
  const checkAccess = async (patient: string, provider: string) => {
    try {
      if (!state.contract) {
        throw new Error('Contract not initialized')
      }

      const hasAccess = await state.contract.hasAccess(patient, provider)
      return hasAccess
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check access'
      console.error('[v0] Check access error:', message)
      throw err
    }
  }

  const getConsent = async (patient: string, provider: string) => {
    try {
      if (!state.contract) {
        throw new Error('Contract not initialized')
      }

      const consent = await state.contract.getConsent(patient, provider)
      return consent
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get consent'
      console.error('[v0] Get consent error:', message)
      throw err
    }
  }

  // Update IPFS pointer on-chain for the given record
  const updateRecordIPFS = async (recordHash: string, newIpfsHash: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!state.contract) {
        throw new Error('Contract not initialized. Please connect wallet.')
      }

      const tx = await state.contract.updateRecordIPFS(recordHash, newIpfsHash)
      const receipt = await tx.wait()

      console.log('[v0] Record IPFS updated on blockchain:', {
        recordHash,
        newIpfsHash,
        hash: receipt?.hash,
      })

      return {
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        success: true,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update record IPFS'
      setError(message)
      console.error('[v0] Update IPFS error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deactivateRecord = async (recordHash: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!state.contract) {
        throw new Error('Contract not initialized. Please connect wallet.')
      }

      const tx = await state.contract.deactivateRecord(recordHash)
      const receipt = await tx.wait()

      console.log('[v0] Record deactivated on blockchain:', {
        recordHash,
        hash: receipt?.hash,
      })

      return {
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        success: true,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate record'
      setError(message)
      console.error('[v0] Deactivate record error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reactivateRecord = async (recordHash: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!state.contract) {
        throw new Error('Contract not initialized. Please connect wallet.')
      }

      const tx = await state.contract.reactivateRecord(recordHash)
      const receipt = await tx.wait()

      console.log('[v0] Record reactivated on blockchain:', {
        recordHash,
        hash: receipt?.hash,
      })

      return {
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        success: true,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reactivate record'
      setError(message)
      console.error('[v0] Reactivate record error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Auto-connect on component mount (if user previously connected)
  useEffect(() => {
    const autoConnect = async () => {
      try {
        if (window.ethereum && window.ethereum.selectedAddress) {
          await connectWallet()
        }
      } catch (err) {
        console.error('[v0] Auto-connect error:', err)
      }
    }

    autoConnect()
  }, [])

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    createRecord,
    grantConsent,
    revokeConsent,
    getPatientRecords,
    getProviders,
    getPatients,
    registerProvider,
    getRecord,
    checkAccess,
    getConsent,
    updateRecordIPFS,
    deactivateRecord,
    reactivateRecord,
    loading,
    error,
  }
}

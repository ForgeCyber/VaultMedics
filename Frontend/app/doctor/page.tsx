'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import { useBlockchainRegistry } from '@/hooks/use-blockchain-registry'
import { DoctorDashboard } from '@/components/doctor-dashboard'
import {
  Stethoscope,
  Shield,
  FileSearch,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  Wallet,
  Search,
  Loader2,
  Accessibility,
  Copy,
  RefreshCcw,
} from 'lucide-react'
import Link from 'next/link'

interface ProviderInfo {
  name: string
  specialty: string
}

interface AccessStatus {
  status: 'idle' | 'granted' | 'denied' | 'checking'
  message: string
}

export default function DoctorPortalPage() {
  const { checkAccess, connected, address, loading, getPatients, registerProvider, connectWallet, disconnectWallet } = useBlockchainRegistry()
  const [patientAddress, setPatientAddress] = useState('')
  const [accessStatus, setAccessStatus] = useState<AccessStatus>({ status: 'idle', message: '' })
  const [verifiedPatient, setVerifiedPatient] = useState('')
  const [patientsList, setPatientsList] = useState<string[]>([])
  const [providerInfo, setProviderInfo] = useState<ProviderInfo>({ 
    name: '', 
    specialty: '' 
  })

  useEffect(() => {
    if (connected && address) {
      const fetchPatients = async () => {
        try {
          const patients = await getPatients(address)
          setPatientsList(patients)
        } catch (error) {
          console.error('Error fetching patients:', error)
        }
      }
      fetchPatients()
    }
  }, [connected, address])

  const verifyAccess = async () => {
    if (!patientAddress || !patientAddress.startsWith('0x') || patientAddress.length !== 42) {
      setAccessStatus({ status: 'denied', message: 'Enter a valid patient wallet address (0x...)' })
      return
    }

    if (!connected) {
      setAccessStatus({ status: 'denied', message: 'Connect your doctor wallet first' })
      return
    }

    setAccessStatus({ status: 'checking', message: '' })
    setVerifiedPatient('')

    try {
      const hasAccess = await checkAccess(patientAddress, address || '')
      if (hasAccess) {
        setAccessStatus({ status: 'granted', message: 'Access granted by patient. You may view authorized records.' })
        setVerifiedPatient(patientAddress)
      } else {
        setAccessStatus({ status: 'denied', message: 'No active consent found. Ask the patient to grant access via their VaultMedics Permissions panel.' })
      }
    } catch {
      setAccessStatus({ status: 'denied', message: 'Could not verify access. Ensure you are on Flare Coston2 testnet.' })
    }
  }

  const handleRegisterProvider = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { name, specialty } = providerInfo

    try {
      if (!connected || !address) {
        setAccessStatus({ status: 'denied', message: 'Connect your doctor wallet first' })
        return
      }
      await registerProvider(name, specialty)
    } catch (error) {
      console.error('Error registering provider:', error)
      setAccessStatus({ status: 'denied', message: 'Failed to register provider.' })
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <Stethoscope className="text-blue-600" size={24} />
              <span className="text-xl font-bold text-slate-900 dark:text-white">Doctor Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {connected ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button variant="ghost" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={connectWallet} disabled={loading}>
                <Wallet size={16} className="mr-1" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {accessStatus.status !== 'denied' && accessStatus.status !== 'granted' ? (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                Healthcare Provider Access
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Request and verify patient-authorized access to medical records. All access is cryptographically
                consented on Flare blockchain.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Patient Consent Required',
                  desc: 'Records are only accessible when patients explicitly grant permission.',
                },
                {
                  icon: Lock,
                  title: 'Blockchain Verified',
                  desc: 'Consent records are immutably stored on Flare for auditability.',
                },
                {
                  icon: FileSearch,
                  title: 'Complete History',
                  desc: 'View authorized records, diagnoses, and consultation notes.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm"
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
            {/* Access Form */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 w-full mx-auto shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Search size={20} className="text-blue-600" />
                Verify Patient Access
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patientAddress">Patient Wallet Address</Label>
                  <Input
                    id="patientAddress"
                    placeholder="0x..."
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    className="font-mono h-12 text-lg"
                  />
                  <p className="text-xs text-slate-500">
                    Enter the public wallet address provided by the patient.
                  </p>
                </div>

                {connected && address && (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Doctor Authenticated: <span className="font-mono font-bold">{address.slice(0, 12)}...{address.slice(-10)}</span>
                    </p>
                  </div>
                )}

                {accessStatus.message && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl text-sm border ${
                      accessStatus.status === 'checking' ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                        : accessStatus.status === 'granted'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : accessStatus.status === 'denied'
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                    }`}
                  >
                    {accessStatus.status === 'granted' ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
                    <span>{accessStatus.message}</span>
                  </div>
                )}

                <Button
                  onClick={verifyAccess}
                  disabled={loading || accessStatus.status === 'checking'}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-500/20"
                >
                  {accessStatus.status === 'checking' ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Verifying on Flare...
                    </>
                  ) : (
                    'Check Access Permission'
                  )}
                </Button>
              </div>
            </div>

            {/* Granted List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 w-full mx-auto shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Accessibility size={20} className="text-blue-600" />
                  Patient That Granted Access
                </span>
                <RefreshCcw
                  size={20}
                  className="text-blue-600 cursor-pointer"
                  onClick={async () => {
                    try {
                      const patients = await getPatients(address || '')
                      setPatientsList(patients)
                    } catch (error) {
                      console.error('Error fetching patients:', error)
                    }
                  }}
                />
              </h2>

              <div className="space-y-6">
                {patientsList.length === 0 ? (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg text-center">
                      No patients have granted access yet. Once a patient grants permission, their address will appear here.
                    </p>
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
                      <p>Register to be a doctor/health provider</p>
                      <div>
                        <form onSubmit={handleRegisterProvider}>
                          <div className="space-y-4 mb-4">
                            <input
                              type="text"
                              id="name"
                              value={providerInfo.name}
                              onChange={(e) => setProviderInfo({...providerInfo, name: e.target.value})} // Update providerInfo
                              placeholder="Your Name"
                              className="w-full h-12 px-3 border rounded-lg text-lg"
                            />
                            <input
                              type="text"
                              id="specialty"
                              value={providerInfo.specialty}
                              onChange={(e) => setProviderInfo({...providerInfo, specialty: e.target.value})}
                              placeholder="Specialty (e.g., Cardiology, Dermatology)"
                              className="w-full h-12 px-3 border rounded-lg text-lg"
                            />
                          </div>
                          <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-500/20">
                            {loading ? 'Registering...' : 'Register'}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                    {patientsList.map((patient) => (
                      <div key={patient} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">{patient}</span>
                        <Copy size={20} 
                          className="text-emerald-600"
                          onClick={() => {
                            navigator.clipboard.writeText(patient)
                            alert(`Copied ${patient} to clipboard`)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                  <Shield size={16} /> Access Verified
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Patient Records: <span className="font-mono text-blue-600 dark:text-blue-400">{verifiedPatient.slice(0, 8)}...{verifiedPatient.slice(-6)}</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  You have been granted secure access to this patient's medical history on Flare.
                </p>
              </div>
              <Button variant="outline" onClick={() => setAccessStatus({ status: 'idle', message: '' })} className="shrink-0">
                Switch Patient
              </Button>
            </div>

            <DoctorDashboard patientAddress={verifiedPatient} />
          </div>
        )}

        <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">
            Are you a patient?{' '}
            <Link href="/dashboard" className="text-blue-600 font-bold hover:underline">
              Access your personal health vault
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getHealthProfile, updateHealthProfile } from '@/app/actions/audit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Download, Save, QrCode } from 'lucide-react'

interface HealthCardProps {
  userName: string
  userEmail: string
  userId: string
}

export function HealthCard({ userName, userEmail, userId }: HealthCardProps) {
  const [profile, setProfile] = useState({
    blood_type: '',
    allergies: '',
    emergency_contact: '',
    emergency_phone: '',
    medications: '',
    conditions: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getHealthProfile().then((data) => {
      if (data) {
        setProfile({
          blood_type: data.blood_type || '',
          allergies: data.allergies || '',
          emergency_contact: data.emergency_contact || '',
          emergency_phone: data.emergency_phone || '',
          medications: data.medications || '',
          conditions: data.conditions || '',
        })
      }
    })
  }, [])

  const qrData = [
    'VaultMedics AI',
    userId.slice(0, 8),
    userName,
    (profile.blood_type || 'U').slice(0, 3),
    (profile.allergies || 'N').slice(0, 30),
    (profile.emergency_contact || '').slice(0, 15),
    (profile.emergency_phone || '').slice(0, 12),
    (profile.medications || '').slice(0, 30),
    (profile.conditions || '').slice(0, 30)
  ].join('\n')

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateHealthProfile(profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    const el = document.getElementById('health-card')
    if (!el) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      // Fallback to default print if popup blocked
      window.print()
      return
    }

    printWindow.document.write(`<!doctype html><html><head><title>Health Card</title></head><body>${el.innerHTML}</body></html>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Card Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden print:shadow-none" id="health-card">
          <div className="bg-linear-to-r from-red-600 to-red-500 p-4 text-white">
            <div className="flex items-center gap-2">
              <Heart size={20} />
              <span className="font-bold">Emergency Health Card</span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-6">
              <div className="shrink-0 bg-white p-2 rounded-lg border">
                <QRCodeSVG value={qrData} size={150} level="L" />
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Name</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{userName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                {profile.blood_type && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Blood Type</span>
                    <p className="font-semibold text-red-600">{profile.blood_type}</p>
                  </div>
                )}
                {profile.allergies && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Allergies</span>
                    <p className="font-medium text-amber-700 dark:text-amber-400">{profile.allergies}</p>
                  </div>
                )}
                </div>
                {profile.emergency_contact && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Emergency Contact</span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {profile.emergency_contact}
                      {profile.emergency_phone && ` · ${profile.emergency_phone}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {profile.medications && (
              <div className="text-sm border-t pt-3">
                <span className="text-slate-500">Medications: </span>
                <span className="text-slate-900 dark:text-white">{profile.medications}</span>
              </div>
            )}
            {profile.conditions && (
              <div className="text-sm">
                <span className="text-slate-500">Conditions: </span>
                <span className="text-slate-900 dark:text-white">{profile.conditions}</span>
              </div>
            )}
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <QrCode size={12} /> Scan QR for emergency medical info · VaultMedics
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Health Card Details</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fill in your emergency information. This data is stored securely and encoded in your QR health card.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="blood_type">Blood Type</Label>
              <Input
                id="blood_type"
                placeholder="e.g. O+"
                value={profile.blood_type}
                onChange={(e) => setProfile({ ...profile, blood_type: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                placeholder="e.g. Penicillin, Peanuts"
                value={profile.allergies}
                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                placeholder="Contact name"
                value={profile.emergency_contact}
                onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency_phone">Emergency Phone</Label>
              <Input
                id="emergency_phone"
                placeholder="+1 555 0100"
                value={profile.emergency_phone}
                onChange={(e) => setProfile({ ...profile, emergency_phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="medications">Current Medications</Label>
              <Input
                id="medications"
                placeholder="List current medications"
                value={profile.medications}
                onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="conditions">Medical Conditions</Label>
              <Input
                id="conditions"
                placeholder="e.g. Type 2 Diabetes, Asthma"
                value={profile.conditions}
                onChange={(e) => setProfile({ ...profile, conditions: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              <Save size={16} className="mr-2" />
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Download size={16} className="mr-2" />
              Print Card
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Lock,
  Shield,
  Zap,
  ArrowRight,
  Heart,
  Link2,
  Users,
  Stethoscope,
  CheckCircle,
  Globe,
} from 'lucide-react'
import Link from 'next/link'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              VaultMedics
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/doctor">
              <Button variant="ghost" size="sm">
                <Stethoscope size={16} className="mr-1" />
                Doctors
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
            <Globe size={14} />
            Built on Flare Blockchain · Flare Summer Signal
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Your Health.
            <br />
            <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Your Records. Your Control.
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            The AI-powered Personal Health Vault that puts patients at the center of healthcare.
            Securely store, understand, and share your medical records with blockchain-verified integrity.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/sign-up">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base">
                Start Free <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-12 text-base">
                Explore Features
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-16 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Healthcare data is broken
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              {[
                'Records scattered across hospitals and clinics',
                'Patients repeat the same information every visit',
                'No visibility into who accessed your data',
                'Complex medical reports nobody understands',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              VaultMedics fixes this
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              {[
                'One secure vault for all your medical records',
                'AI explains reports in plain language',
                'Full audit trail of every access event',
                'Blockchain-verified document integrity on Flare',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to own your health story
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Apple Health meets Google Drive meets ChatGPT — with blockchain security, designed for patients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'End-to-End Encryption',
                desc: 'Military-grade encryption. Only you control access to your sensitive health data.',
                color: 'blue',
              },
              {
                icon: Zap,
                title: 'AI Medical Assistant',
                desc: 'Summarize reports, explain diagnoses, translate medical jargon, and suggest doctor questions.',
                color: 'green',
              },
              {
                icon: Lock,
                title: 'Flare Blockchain Verification',
                desc: 'Document hashes stored on-chain. Tamper-evident integrity without exposing health data.',
                color: 'purple',
              },
              {
                icon: Users,
                title: 'Consent Management',
                desc: 'Grant time-limited access to doctors. Revoke instantly. Full cryptographic guarantees.',
                color: 'indigo',
              },
              {
                icon: Link2,
                title: 'Health Timeline',
                desc: 'Chronological view of visits, diagnoses, medications, lab reports, and vaccinations.',
                color: 'teal',
              },
              {
                icon: Heart,
                title: 'Emergency Health Card',
                desc: 'QR-coded emergency card with blood type, allergies, medications, and emergency contacts.',
                color: 'red',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flare Integration */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Powered by Flare Blockchain</h2>
          <p className="text-slate-300 mb-8 text-lg">
            Medical records never go on-chain. Only hashes, consent events, and audit metadata —
            guaranteeing integrity, transparency, and privacy.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Document Verifier', desc: 'Immutable proof of record integrity' },
              { title: 'Consent Manager', desc: 'Cryptographic access permissions' },
              { title: 'Audit Trail', desc: 'Transparent, tamper-evident logging' },
            ].map((item) => (
              <div key={item.title} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">Take control of your health data today</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the patient-first healthcare revolution. Free to start.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 h-12">
              Create Your Vault <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-blue-400" />
            <span className="font-semibold text-white">VaultMedics</span>
          </div>
          <p className="text-sm">&copy; 2026 VaultMedics. Privacy-first healthcare for everyone.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/doctor" className="hover:text-white transition-colors">
              Doctor Portal
            </Link>
            <Link href="/sign-in" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

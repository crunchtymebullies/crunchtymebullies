'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink, FileText, Shield, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react'

interface Step {
  id: string
  title: string
  description: string
  details: string[]
  tip?: string
  warning?: string
  link?: { url: string; label: string }
}

const steps: Step[] = [
  {
    id: 'docs', title: 'Gather Your Business Documents', description: 'Before creating a Stripe account, have these ready:',
    details: [
      'Your LLC formation documents (Articles of Organization)',
      'Your EIN (Employer Identification Number) from the IRS',
      'A government-issued photo ID (driver\'s license or passport)',
      'Your business bank account information (routing + account number)',
      'Your business address',
    ],
    tip: 'If you don\'t have an EIN yet, you can get one free at irs.gov — it takes about 5 minutes online.',
  },
  {
    id: 'create', title: 'Create Your Stripe Account', description: 'Go to Stripe and start the signup process.',
    details: [
      'Go to stripe.com and click "Start now"',
      'Enter your email address and create a strong password',
      'Choose "Business" when it asks your account type',
      'Select "LLC" as your business structure',
      'Enter your business name exactly as it appears on your LLC docs: "Crunchtyme Bullies LLC" (or however it\'s registered)',
    ],
    link: { url: 'https://dashboard.stripe.com/register', label: 'Open Stripe Signup' },
    tip: 'Use your business email (crunchtymebullies@gmail.com) not a personal email.',
  },
  {
    id: 'business', title: 'Fill In Business Details', description: 'Stripe will ask for your business information.',
    details: [
      'Business name: Use your official LLC name',
      'EIN: Enter your 9-digit EIN number',
      'Industry: Select "Retail" or "Pet Services"',
      'Business website: Enter crunchtymebullies.com',
      'Product description: "American Bully dog breeding, puppy sales, and pet products"',
      'Business address: Enter your registered business address',
    ],
    warning: 'Make sure the business name matches your LLC documents exactly. Mismatches can delay verification.',
  },
  {
    id: 'verify', title: 'Verify Your Identity', description: 'Stripe requires identity verification for security.',
    details: [
      'Enter your full legal name, date of birth, and SSN (last 4 digits)',
      'Upload a clear photo of your government-issued ID (front and back)',
      'Make sure the photo is well-lit and all text is readable',
      'Stripe will verify your identity — this usually takes a few minutes but can take up to 2 business days',
    ],
    tip: 'Take the ID photo in good lighting. Blurry photos get rejected and you have to redo it.',
  },
  {
    id: 'bank', title: 'Connect Your Bank Account', description: 'Link the bank account where you want to receive payouts.',
    details: [
      'Choose "Manual entry" to enter your routing and account numbers',
      'Or use "Instant verification" if your bank supports it (Chase, Bank of America, etc.)',
      'This is where Stripe will deposit your sales revenue',
      'Payouts typically arrive in 2 business days',
    ],
    warning: 'Use a BUSINESS bank account, not personal. Stripe may flag personal accounts linked to business LLCs.',
  },
  {
    id: 'complete', title: 'Finish & Share Access', description: 'Once your account is verified and active, share the login info below so we can connect it to your website.',
    details: [
      'You\'ll know it\'s ready when you see "Payments Active" in your Stripe dashboard',
      'Enter your Stripe email and password below',
      'We will use these ONLY to set up the developer API connection to your website',
      'Once connected, you can change the password if you want',
      'We will NEVER make charges or access your money — the API keys only allow your website to process sales',
    ],
    tip: 'You will keep full control of your Stripe account. We just need temporary access to grab the API keys for the website.',
  },
]

export default function StripePage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<string>('docs')
  const [stripeEmail, setStripeEmail] = useState('')
  const [stripePassword, setStripePassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const toggle = (id: string) => {
    setCompleted(prev => ({ ...prev, [id]: !prev[id] }))
    const progress = JSON.parse(localStorage.getItem('go-progress') || '{}')
    const allDone = steps.every(s => s.id === id ? !completed[id] : completed[s.id])
    progress.stripe = allDone ? 'done' : 'in-progress'
    localStorage.setItem('go-progress', JSON.stringify(progress))
  }

  const handleSubmitCreds = async () => {
    if (!stripeEmail || !stripePassword) return
    setSubmitting(true)
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'stripe-credentials',
          data: { json: JSON.stringify({ email: stripeEmail, password: stripePassword, submittedAt: new Date().toISOString() }) },
        })
      })
      setSubmitted(true)
      toggle('complete')
    } catch {}
    setSubmitting(false)
  }

  const completedCount = Object.values(completed).filter(Boolean).length

  return (
    <div>
      <Link href="/go" className="inline-flex items-center gap-2 text-white/30 text-xs font-heading hover:text-gold transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Command Center
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <CreditCard size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-white">Stripe Payment Setup</h1>
            <p className="text-white/40 text-sm font-body">Follow each step to get online payments running on your site.</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i < completedCount ? 'bg-emerald-400' : 'bg-white/10'
            }`} />
          ))}
        </div>
        <p className="text-white/30 text-xs font-body mt-2">{completedCount} of {steps.length} steps completed</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const isExpanded = expanded === step.id
          const isDone = completed[step.id]
          return (
            <div key={step.id} className={`border rounded-xl overflow-hidden transition-all duration-300 ${
              isDone ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-brand-dark/40 border-white/5'
            }`}>
              <button onClick={() => setExpanded(isExpanded ? '' : step.id)}
                className="w-full flex items-center gap-4 p-5 text-left">
                <button onClick={(e) => { e.stopPropagation(); toggle(step.id) }}
                  className="flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 size={24} className="text-emerald-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center">
                      <span className="text-white/30 text-xs font-heading">{i+1}</span>
                    </div>
                  )}
                </button>
                <div className="flex-1">
                  <h3 className={`font-display text-base ${isDone ? 'text-emerald-300' : 'text-white'}`}>{step.title}</h3>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-white/20" /> : <ChevronDown size={18} className="text-white/20" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-0 animate-fade-in">
                  <div className="pl-10">
                    <p className="text-white/50 font-body text-sm mb-4">{step.description}</p>
                    <ul className="space-y-2 mb-4">
                      {step.details.map((d, j) => (
                        <li key={j} className="flex gap-2 text-white/40 font-body text-sm">
                          <span className="text-gold/40 mt-1">▸</span> {d}
                        </li>
                      ))}
                    </ul>

                    {step.tip && (
                      <div className="p-3 bg-gold/5 border border-gold/10 rounded-lg mb-4 flex gap-2">
                        <Shield size={14} className="text-gold mt-0.5 flex-shrink-0" />
                        <p className="text-gold/70 text-xs font-body">{step.tip}</p>
                      </div>
                    )}
                    {step.warning && (
                      <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg mb-4 flex gap-2">
                        <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-red-300/70 text-xs font-body">{step.warning}</p>
                      </div>
                    )}
                    {step.link && (
                      <a href={step.link.url} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 text-blue-400 text-sm font-heading hover:underline mb-4">
                        <ExternalLink size={14} /> {step.link.label}
                      </a>
                    )}

                    {/* Credential form on last step */}
                    {step.id === 'complete' && !submitted && (
                      <div className="mt-4 p-4 bg-brand-black/50 border border-white/10 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock size={14} className="text-gold" />
                          <span className="text-gold text-xs tracking-wider uppercase font-heading">Secure Submission</span>
                        </div>
                        <input type="email" value={stripeEmail} onChange={e => setStripeEmail(e.target.value)}
                          placeholder="Stripe login email"
                          className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15" />
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} value={stripePassword} onChange={e => setStripePassword(e.target.value)}
                            placeholder="Stripe password"
                            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15 pr-12" />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <button onClick={handleSubmitCreds} disabled={submitting || !stripeEmail || !stripePassword}
                          className="btn-gold w-full disabled:opacity-30 disabled:cursor-not-allowed">
                          {submitting ? 'Submitting...' : 'Submit Securely'}
                        </button>
                      </div>
                    )}
                    {step.id === 'complete' && submitted && (
                      <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                        <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                        <p className="text-emerald-300 font-heading text-sm">Credentials received! We will connect everything.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

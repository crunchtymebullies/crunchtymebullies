'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Dog, Plus, X, Check, Upload, Sparkles } from 'lucide-react'

interface DogForm {
  name: string; age: string; sex: string; breed: string; variety: string; color: string;
  weight: string; personality: string; sire: string; dam: string; bloodline: string;
  registry: string; regNumber: string; healthTests: string;
}

const emptyDog: DogForm = {
  name: '', age: '', sex: '', breed: 'American Bully', variety: '', color: '', weight: '',
  personality: '', sire: '', dam: '', bloodline: '', registry: '', regNumber: '', healthTests: '',
}

export default function DogsInfoPage() {
  const [dogs, setDogs] = useState<DogForm[]>([{ ...emptyDog }])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = (i: number, field: keyof DogForm, value: string) => {
    setDogs(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  const addDog = () => setDogs(prev => [...prev, { ...emptyDog }])
  const removeDog = (i: number) => setDogs(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    const filled = dogs.filter(d => d.name.trim())
    if (!filled.length) return
    setSubmitting(true)
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'dog-info', data: { json: JSON.stringify(filled) } })
      })
      const progress = JSON.parse(localStorage.getItem('go-progress') || '{}')
      progress.dogs = 'done'
      localStorage.setItem('go-progress', JSON.stringify(progress))
      setSubmitted(true)
    } catch {}
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="text-center py-20">
        <Link href="/go" className="inline-flex items-center gap-2 text-white/30 text-xs font-heading hover:text-gold transition-colors mb-12">
          <ArrowLeft size={14} /> Back to Command Center
        </Link>
        <Check size={48} className="text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-display text-white mb-2">Dog Info Submitted!</h2>
        <p className="text-white/40 font-body">We will review and add this to the site. You can come back and submit more anytime.</p>
        <button onClick={() => { setSubmitted(false); setDogs([{ ...emptyDog }]) }} className="btn-gold-outline mt-8">Add More Dogs</button>
      </div>
    )
  }

  return (
    <div>
      <Link href="/go" className="inline-flex items-center gap-2 text-white/30 text-xs font-heading hover:text-gold transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Command Center
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Dog size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-white">Dog Information</h1>
            <p className="text-white/40 text-sm font-body">Fill in details for each dog. Leave blanks for anything you do not know.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {dogs.map((dog, i) => (
          <div key={i} className="p-6 bg-brand-dark/50 border border-white/5 rounded-xl relative">
            {dogs.length > 1 && (
              <button onClick={() => removeDog(i)} className="absolute top-4 right-4 text-white/20 hover:text-red-400 transition-colors">
                <X size={18} />
              </button>
            )}
            <h3 className="text-gold text-xs tracking-[0.2em] uppercase font-heading mb-4">Dog {i + 1}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {([
                ['name', 'Name *', 'text', 'e.g. Blue Steel'],
                ['age', 'Age / DOB', 'text', 'e.g. 2 years, or 03/15/2023'],
                ['sex', 'Sex', 'select', 'male,female'],
                ['breed', 'Breed', 'text', 'American Bully'],
                ['variety', 'Variety / Class', 'select', 'Standard,Classic,Pocket,XL,Micro,Exotic'],
                ['color', 'Color', 'text', 'e.g. Blue Tri, Lilac Fawn'],
                ['weight', 'Weight', 'text', 'e.g. 65 lbs'],
                ['sire', 'Sire (Father)', 'text', 'Father\'s name'],
                ['dam', 'Dam (Mother)', 'text', 'Mother\'s name'],
                ['bloodline', 'Bloodline', 'text', 'e.g. Razors Edge, Gottiline'],
                ['registry', 'Registry', 'text', 'e.g. ABKC, UKC'],
                ['regNumber', 'Registration #', 'text', 'Registration number'],
              ] as const).map(([field, label, type, placeholder]) => (
                <div key={field}>
                  <label className="text-white/40 text-[10px] uppercase tracking-wider font-heading block mb-1.5">{label}</label>
                  {type === 'select' ? (
                    <select value={dog[field]} onChange={e => update(i, field, e.target.value)}
                      className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-body focus:border-gold/40 focus:outline-none">
                      <option value="">Select...</option>
                      {placeholder.split(',').map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={dog[field]} onChange={e => update(i, field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-body focus:border-gold/40 focus:outline-none placeholder:text-white/10" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-heading block mb-1.5">Personality / Temperament</label>
              <textarea value={dog.personality} onChange={e => update(i, 'personality', e.target.value)}
                rows={2} placeholder="Describe their personality in a few sentences — playful, calm, protective, goofy, etc."
                className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/10" />
            </div>

            <div className="mt-4">
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-heading block mb-1.5">Health Tests (one per line)</label>
              <textarea value={dog.healthTests} onChange={e => update(i, 'healthTests', e.target.value)}
                rows={2} placeholder="e.g.&#10;DNA Panel - Clear&#10;Vet Checked - Healthy"
                className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/10" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        <button onClick={addDog} className="btn-gold-outline flex items-center gap-2">
          <Plus size={16} /> Add Another Dog
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="btn-gold flex items-center gap-2 disabled:opacity-30">
          <Sparkles size={16} /> {submitting ? 'Submitting...' : 'Submit All Dog Info'}
        </button>
      </div>
    </div>
  )
}

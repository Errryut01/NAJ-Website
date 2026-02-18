'use client'

import { useState } from 'react'

export function CandidateIntakeForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [resumeOrLinkedinUrl, setResumeOrLinkedinUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'Candidate Intake',
          name,
          email,
          resumeOrLinkedinUrl,
        }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setStatus('success')
      setName('')
      setEmail('')
      setResumeOrLinkedinUrl('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Name</label>
        <input
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-2 w-full rounded-md border border-white/10 bg-[#140a26]/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
        <input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full rounded-md border border-white/10 bg-[#140a26]/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Resume or LinkedIn URL
        </label>
        <input
          type="text"
          placeholder="Paste resume link or LinkedIn URL"
          value={resumeOrLinkedinUrl}
          onChange={(e) => setResumeOrLinkedinUrl(e.target.value)}
          className="mt-2 w-full rounded-md border border-white/10 bg-[#140a26]/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-[#0c071a] hover:bg-amber-300 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending...' : 'Submit'}
      </button>
      {status === 'success' && (
        <p className="text-sm text-amber-300">Thanks! We&apos;ll be in touch soon.</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
      )}
      <p className="text-xs text-slate-400">
        By submitting, you agree to receive role updates from NAJ.
      </p>
    </form>
  )
}

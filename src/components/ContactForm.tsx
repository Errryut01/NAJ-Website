'use client'

import { useState } from 'react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [companyOrRole, setCompanyOrRole] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'Contact',
          fullName,
          email,
          companyOrRole,
          message,
        }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setStatus('success')
      setFullName('')
      setEmail('')
      setCompanyOrRole('')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f081d] to-amber-900/20 p-6 shadow-sm" onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-slate-100">Start the Conversation</h3>
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Full Name</label>
          <input
            type="text"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="mt-2 w-full rounded-md border border-white/10 bg-[#140a26]/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
          <input
            type="email"
            placeholder="jane@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 w-full rounded-md border border-white/10 bg-[#140a26]/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Company / Role</label>
          <input
            type="text"
            placeholder="Company or role interest"
            value={companyOrRole}
            onChange={(e) => setCompanyOrRole(e.target.value)}
            className="mt-2 w-full rounded-md border border-white/10 bg-[#140a26]/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Message</label>
          <textarea
            rows={4}
            placeholder="Tell us what you need help with..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2 w-full rounded-md border border-white/10 bg-[#140a26]/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 w-full rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-[#0c071a] hover:bg-amber-300 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
      {status === 'success' && (
        <p className="mt-3 text-sm text-amber-300">Thanks! We&apos;ll be in touch soon.</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-400">Something went wrong. Please try again.</p>
      )}
    </form>
  )
}

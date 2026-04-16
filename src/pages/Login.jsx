import React, { useState, useEffect } from 'react'
import { Wifi, Hash, ChevronRight, Save, Check } from 'lucide-react'

export default function Login({ onLogin }) {
  const [accountNumber, setAccountNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const bizName = import.meta.env.VITE_BUSINESS_NAME || 'ISP Billing'
  const bizTagline = import.meta.env.VITE_BUSINESS_TAGLINE || 'Internet Service Provider'

  // Load saved account on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('cp_saved_account')
    if (savedAccount) setAccountNumber(savedAccount)
  }, [])

  const handleSave = () => {
    if (!accountNumber.trim()) return
    localStorage.setItem('cp_saved_account', accountNumber.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await onLogin(accountNumber)
    if (!result.success) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Wifi size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">{bizName}</h1>
          <p className="text-slate-400 text-sm mt-1">{bizTagline}</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <h2 className="text-white font-semibold text-lg mb-1">Client Portal</h2>
          <p className="text-slate-400 text-sm mb-6">Enter your account number to view your billing details.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Account Number</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="input pl-9 text-center text-xl font-mono tracking-widest"
                  placeholder="e.g. 001234"
                  value={accountNumber}
                  onChange={e => { setAccountNumber(e.target.value); setError('') }}
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSave}
                disabled={!accountNumber.trim()}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all
                  ${saved
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
              >
                {saved ? <Check size={15} /> : <Save size={15} />}
                {saved ? 'Saved!' : 'Save'}
              </button>

              <button
                type="submit"
                className="btn-primary flex-1 justify-center py-2.5 text-base"
                disabled={loading || !accountNumber.trim()}
              >
                {loading ? 'Checking...' : 'View My Account'}
                {!loading && <ChevronRight size={18} />}
              </button>
            </div>
          </form>
        </div>

        <p className="text-slate-600 text-xs text-center mt-6">
          Don't know your account number? Contact your ISP.
        </p>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { X, CreditCard, CheckCircle, ExternalLink, Copy, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

const GCASH_NUMBER = import.meta.env.VITE_GCASH_NUMBER || ''
const PAYMAYA_NUMBER = import.meta.env.VITE_PAYMAYA_NUMBER || ''
const GCASH_NAME = import.meta.env.VITE_GCASH_NAME || 'ISP Admin'
const GCASH_DEEPLINK = import.meta.env.VITE_GCASH_DEEPLINK || ''   // e.g. https://gcash.com/send?...
const PAYMAYA_DEEPLINK = import.meta.env.VITE_PAYMAYA_DEEPLINK || ''

export default function PaymentModal({ invoice, client, onClose, onSuccess }) {
  const [step, setStep] = useState('choose')   // choose | manual | auto | success
  const [method, setMethod] = useState(null)   // gcash | paymaya
  const [refNumber, setRefNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const fmt = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleChooseMethod = (m) => {
    setMethod(m)
    setStep('choose_type')
  }

  const handleChooseType = (type) => {
    if (type === 'auto') {
      // Redirect to GCash/PayMaya deep link
      const link = method === 'gcash' ? GCASH_DEEPLINK : PAYMAYA_DEEPLINK
      if (link) {
        window.open(link, '_blank')
      }
      setStep('auto')
    } else {
      setStep('manual')
    }
  }

  const handleSubmitManual = async () => {
    if (!refNumber.trim()) {
      setError('Please enter your reference number.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const { error: err } = await supabase.from('payment_requests').insert({
        invoice_id: invoice.id,
        client_id: client.id,
        amount: invoice.amount,
        payment_method: method,
        payment_type: 'manual',
        reference_number: refNumber.trim(),
        status: 'pending',
      })
      if (err) throw err
      setStep('success')
      onSuccess?.()
    } catch (e) {
      setError('Failed to submit. Please try again.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitAuto = async () => {
    if (!refNumber.trim()) {
      setError('Please enter your reference number after payment.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const { error: err } = await supabase.from('payment_requests').insert({
        invoice_id: invoice.id,
        client_id: client.id,
        amount: invoice.amount,
        payment_method: method,
        payment_type: 'auto',
        reference_number: refNumber.trim(),
        status: 'pending',
      })
      if (err) throw err
      setStep('success')
      onSuccess?.()
    } catch (e) {
      setError('Failed to submit. Please try again.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const accountNumber = method === 'gcash' ? GCASH_NUMBER : PAYMAYA_NUMBER

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md animate-slide-up shadow-2xl">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <CreditCard size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Pay Invoice</p>
              <p className="text-slate-400 text-xs">{invoice.invoice_number} · {fmt(invoice.amount)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">

          {/* STEP: Choose Method */}
          {step === 'choose' && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-slate-400 text-sm text-center mb-4">Choose your payment method</p>

              {/* GCash */}
              <button
                onClick={() => handleChooseMethod('gcash')}
                className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-2xl transition-all group hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <span className="text-white font-black text-lg">G</span>
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-bold text-base">GCash</p>
                  <p className="text-slate-400 text-xs mt-0.5">Pay via GCash wallet</p>
                </div>
                <div className="text-slate-500 group-hover:text-blue-400 transition-colors">›</div>
              </button>

              {/* PayMaya */}
              <button
                onClick={() => handleChooseMethod('paymaya')}
                className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 rounded-2xl transition-all group hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                  <span className="text-white font-black text-lg">M</span>
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-bold text-base">Maya</p>
                  <p className="text-slate-400 text-xs mt-0.5">Pay via Maya (PayMaya)</p>
                </div>
                <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">›</div>
              </button>

              <p className="text-slate-600 text-xs text-center pt-2">
                Your payment will be verified by our team
              </p>
            </div>
          )}

          {/* STEP: Choose Type (Manual or Auto) */}
          {step === 'choose_type' && (
            <div className="space-y-3 animate-fade-in">
              <button onClick={() => setStep('choose')} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-2 transition-colors">
                ← Back
              </button>
              <p className="text-slate-400 text-sm text-center mb-4">
                How do you want to pay via <span className="text-white font-semibold capitalize">{method === 'paymaya' ? 'Maya' : 'GCash'}</span>?
              </p>

              {/* Manual - Input Reference */}
              <button
                onClick={() => handleChooseType('manual')}
                className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-2xl transition-all group hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
                  📋
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-bold text-sm">Manual Transfer</p>
                  <p className="text-slate-400 text-xs mt-0.5">Send to our number, then enter reference</p>
                </div>
                <div className="text-slate-500 group-hover:text-blue-400 transition-colors">›</div>
              </button>

              {/* Auto - Redirect to App */}
              <button
                onClick={() => handleChooseType('auto')}
                className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 rounded-2xl transition-all group hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
                  📱
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-bold text-sm">Open {method === 'paymaya' ? 'Maya' : 'GCash'} App</p>
                  <p className="text-slate-400 text-xs mt-0.5">Redirect to {method === 'paymaya' ? 'Maya' : 'GCash'} automatically</p>
                </div>
                <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
                  <ExternalLink size={14} />
                </div>
              </button>
            </div>
          )}

          {/* STEP: Manual Payment */}
          {step === 'manual' && (
            <div className="animate-fade-in">
              <button onClick={() => setStep('choose_type')} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors">
                ← Back
              </button>

              {/* Account to send to */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-4">
                <p className="text-slate-400 text-xs mb-3 font-medium uppercase tracking-wider">
                  Send payment to:
                </p>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-bold text-xl tracking-widest">{accountNumber || '—'}</p>
                    <p className="text-slate-400 text-sm mt-0.5">{GCASH_NAME}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(accountNumber)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="border-t border-slate-700 pt-3 mt-3 flex items-center justify-between">
                  <p className="text-slate-400 text-sm">Amount to send:</p>
                  <p className="text-white font-bold text-lg">{fmt(invoice.amount)}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2 mb-4">
                {[
                  `Open your ${method === 'paymaya' ? 'Maya' : 'GCash'} app`,
                  `Send ${fmt(invoice.amount)} to ${accountNumber || 'our number'}`,
                  'Copy the reference number from the receipt',
                  'Paste it below and tap Submit',
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{s}</p>
                  </div>
                ))}
              </div>

              {/* Reference input */}
              <div className="mb-4">
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Reference Number *</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 transition-all"
                  placeholder="e.g. 1234567890"
                  value={refNumber}
                  onChange={e => { setRefNumber(e.target.value); setError('') }}
                />
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>

              <button
                onClick={handleSubmitManual}
                disabled={submitting || !refNumber.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-blue-600/30"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : 'Submit Payment'}
              </button>
            </div>
          )}

          {/* STEP: Auto (after redirect) */}
          {step === 'auto' && (
            <div className="animate-fade-in">
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">📱</div>
                <p className="text-white font-semibold">Complete payment in {method === 'paymaya' ? 'Maya' : 'GCash'}</p>
                <p className="text-slate-400 text-sm mt-1">After paying, come back here and enter your reference number.</p>
              </div>

              <div className="mb-4">
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Reference Number *</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 transition-all"
                  placeholder="e.g. 1234567890"
                  value={refNumber}
                  onChange={e => { setRefNumber(e.target.value); setError('') }}
                />
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = method === 'gcash' ? GCASH_DEEPLINK : PAYMAYA_DEEPLINK
                    if (link) window.open(link, '_blank')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-all border border-slate-700 text-sm"
                >
                  <ExternalLink size={14} />
                  Open App
                </button>
                <button
                  onClick={handleSubmitAuto}
                  disabled={submitting || !refNumber.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : 'Submit'}
                </button>
              </div>
            </div>
          )}

          {/* STEP: Success */}
          {step === 'success' && (
            <div className="text-center py-4 animate-scale-in">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Payment Submitted!</h3>
              <p className="text-slate-400 text-sm mb-1">Reference: <span className="text-white font-mono font-semibold">{refNumber}</span></p>
              <p className="text-slate-400 text-sm mb-6">
                Our team will verify your payment shortly. Your internet will be reconnected once confirmed.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState, useRef } from 'react'
import { Wifi, FileText, CreditCard, LogOut, Printer, MessageCircle, Megaphone, Bell, X, Send, Pin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format, differenceInDays } from 'date-fns'
import { useReactToPrint } from 'react-to-print'
import Receipt from '../components/Receipt'
import Chat from './Chat'

const TYPE_STYLES = {
  info:        'bg-blue-500/10 border-blue-500/30 text-blue-400',
  maintenance: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  outage:      'bg-red-500/10 border-red-500/30 text-red-400',
  promo:       'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
}

export default function Portal({ user, onLogout }) {
  const [client, setClient] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [tab, setTab] = useState('overview') // overview | invoices | payments
  const bizName = import.meta.env.VITE_BUSINESS_NAME || 'ISP Billing'
  const receiptRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: 'Receipt',
    pageStyle: `@page { size: 58mm auto; margin: 0; } @media print { body { margin: 0; } }`,
  })

  useEffect(() => {
    async function load() {
      const [{ data: clientData }, { data: invData }, { data: payData }, { data: annData }] = await Promise.all([
        supabase.from('clients').select('*, plans(name, speed_mbps, price)').eq('id', user.clientId).single(),
        supabase.from('invoices').select('*').eq('client_id', user.clientId).order('created_at', { ascending: false }),
        supabase.from('payments').select('*, invoices(invoice_number, amount, due_date, billing_period_start, billing_period_end)').eq('client_id', user.clientId).order('paid_at', { ascending: false }),
        supabase.from('announcements').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5),
      ])
      setClient(clientData)
      setInvoices(invData || [])
      setPayments(payData || [])
      setAnnouncements(annData || [])
      setLoading(false)
    }
    load()
  }, [user.clientId])

  const fmt = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
  const pendingTotal = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + Number(i.amount), 0)
  const overdueInvoices = invoices.filter(i => i.status === 'overdue')

  const statusBadge = (s) => {
    if (s === 'paid') return <span className="badge-paid">Paid</span>
    if (s === 'overdue') return <span className="badge-overdue">Overdue</span>
    return <span className="badge-pending">Pending</span>
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Chat is now an overlay, no full-page redirect needed

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Wifi size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{client?.full_name}</p>
              <p className="text-slate-400 text-xs">#{client?.account_number}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
            <LogOut size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 flex gap-1 pb-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'invoices', label: `Invoices (${invoices.length})` },
            { key: 'payments', label: `Payments (${payments.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <>
            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="space-y-2">
                {announcements.map(a => (
                  <div key={a.id} className={`p-4 rounded-xl border ${TYPE_STYLES[a.type] || TYPE_STYLES.info}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {a.is_pinned && <Pin size={12} />}
                      <span className="text-xs font-bold uppercase">{a.type}</span>
                      <span className="text-xs opacity-60">{format(new Date(a.created_at), 'MMM d')}</span>
                    </div>
                    <p className="font-semibold text-white text-sm">{a.title}</p>
                    <p className="text-sm mt-1 opacity-90">{a.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Overdue Alert */}
            {overdueInvoices.length > 0 && (
              <div className="card p-4 border-red-500/30 bg-red-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={16} className="text-red-400" />
                  <p className="text-red-400 font-semibold text-sm">Overdue Balance</p>
                </div>
                <p className="text-red-400 font-bold text-3xl">{fmt(overdueInvoices.reduce((s, i) => s + Number(i.amount), 0))}</p>
                <p className="text-slate-500 text-xs mt-1">Please pay immediately to avoid disconnection</p>
              </div>
            )}

            {/* Plan */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-semibold">My Plan</h2>
                <span className={client?.status === 'active' ? 'badge-active' : 'badge-disconnected'}>{client?.status}</span>
              </div>
              {client?.plans ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 border border-blue-600/30 rounded-xl flex items-center justify-center">
                    <Wifi size={22} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-xl">{client.plans.name}</p>
                    <p className="text-slate-400 text-sm">{client.plans.speed_mbps} Mbps — {fmt(client.plans.price)}/month</p>
                  </div>
                </div>
              ) : <p className="text-slate-500 text-sm">No plan assigned</p>}
            </div>

            {/* Balance Summary */}
            {pendingTotal > 0 && (
              <div className="card p-5">
                <p className="text-slate-400 text-sm mb-1">Outstanding Balance</p>
                <p className="text-white font-bold text-3xl">{fmt(pendingTotal)}</p>
                <p className="text-slate-500 text-xs mt-1">Please pay on or before due date</p>
              </div>
            )}

            {/* Recent Invoice */}
            {invoices.length > 0 && (
              <div className="card p-5">
                <h3 className="text-white font-semibold mb-3">Latest Invoice</h3>
                {(() => {
                  const inv = invoices[0]
                  return (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-mono text-sm">{inv.invoice_number}</p>
                        <p className="text-slate-500 text-xs">Due: {format(new Date(inv.due_date), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{fmt(inv.amount)}</p>
                        {statusBadge(inv.status)}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </>
        )}

        {/* INVOICES TAB */}
        {tab === 'invoices' && (
          <div className="card overflow-hidden">
            {invoices.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-12">No invoices yet</p>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {invoices.map(inv => (
                  <div key={inv.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-mono font-medium">{inv.invoice_number}</p>
                      <p className="text-slate-500 text-xs">Due: {format(new Date(inv.due_date), 'MMM d, yyyy')}</p>
                      {inv.billing_period_start && (
                        <p className="text-slate-600 text-xs">
                          {format(new Date(inv.billing_period_start), 'MMM d')} – {format(new Date(inv.billing_period_end), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{fmt(inv.amount)}</p>
                      {statusBadge(inv.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {tab === 'payments' && (
          <div className="card overflow-hidden">
            {payments.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-12">No payments yet</p>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {payments.map(p => (
                  <div key={p.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">{fmt(p.amount_paid)}</p>
                      <p className="text-slate-500 text-xs">{format(new Date(p.paid_at), 'MMM d, yyyy hh:mm a')}</p>
                      <p className="text-slate-500 text-xs capitalize">{p.payment_method?.replace('_', ' ')}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPayment({ ...p, clients: { full_name: client?.full_name, address: client?.address, contact_number: client?.contact_number } })}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                    >
                      <Printer size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/40 flex items-center justify-center transition-all z-40"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Dialog Overlay */}
      {showChat && <Chat user={user} onClose={() => setShowChat(false)} />}

      {/* Receipt Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedPayment(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <div className="bg-white rounded-xl p-2 mb-4 overflow-auto max-h-80">
              <Receipt ref={receiptRef} payment={selectedPayment} settings={{ business_name: bizName }} />
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1 justify-center" onClick={() => setSelectedPayment(null)}>Close</button>
              <button className="btn-primary flex-1 justify-center" onClick={handlePrint}>
                <Printer size={15} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

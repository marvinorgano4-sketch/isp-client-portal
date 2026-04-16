import React, { forwardRef } from 'react'
import { format } from 'date-fns'

const Receipt = forwardRef(({ payment, settings }, ref) => {
  if (!payment) return null
  const invoice = payment.invoices || {}
  const client = payment.clients || {}
  const biz = settings || {}
  const fd = (d) => { try { return format(new Date(d), 'MM/dd/yy') } catch { return d || '—' } }
  const fm = (n) => `P${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
  return (
    <div ref={ref} style={{ width: '50mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: '9px', fontWeight: '700', color: '#000', background: '#fff', padding: '2mm 2mm', lineHeight: '1.35' }}>
      <div style={{ textAlign: 'center', marginBottom: '3px' }}>
        <div style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>{biz.business_name || 'ISP BILLING'}</div>
      </div>
      <Line />
      <div style={{ textAlign: 'center', fontWeight: '900', fontSize: '10px', margin: '2px 0' }}>OFFICIAL RECEIPT</div>
      <Line />
      <Row2 a="OR#" b={payment.id?.slice(-6).toUpperCase()} />
      <Row2 a="INV#" b={invoice.invoice_number || '—'} />
      <Row2 a="Date" b={`${fd(payment.paid_at)} ${payment.paid_at ? format(new Date(payment.paid_at), 'hh:mm a') : ''}`} />
      <Line />
      <Row2 a="Client" b={client.full_name || '—'} bold />
      <Line />
      <Row2 a="Amount" b={fm(invoice.amount)} />
      <Row2 a="PAID" b={fm(payment.amount_paid)} bold large />
      <Row2 a="Method" b={(payment.payment_method || 'cash').replace(/_/g, ' ').toUpperCase()} />
      <Line double />
      <div style={{ textAlign: 'center', fontWeight: '900', fontSize: '10px', margin: '2px 0' }}>** PAID IN FULL **</div>
      <div style={{ textAlign: 'center', fontSize: '8px', marginTop: '3px' }}>Thank you for your payment!</div>
    </div>
  )
})
Receipt.displayName = 'Receipt'
export default Receipt
function Line({ double }) { return <div style={{ borderTop: double ? '2px solid #000' : '1px solid #000', margin: '3px 0' }} /> }
function Row2({ a, b, bold, large }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: large ? '10px' : '9px', marginBottom: '1px', gap: '3px' }}>
      <span style={{ flexShrink: 0, fontWeight: '700', minWidth: '28px' }}>{a}:</span>
      <span style={{ fontWeight: bold ? '900' : '700', textAlign: 'right', flex: 1, wordBreak: 'break-word' }}>{b}</span>
    </div>
  )
}

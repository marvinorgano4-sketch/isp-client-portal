import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function Chat({ user, onBack }) {
  const [conv, setConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const initChat = useCallback(async () => {
    let { data } = await supabase.from('chat_conversations').select('*').eq('client_id', user.clientId).single()
    if (!data) {
      const { data: newConv } = await supabase.from('chat_conversations').insert([{ client_id: user.clientId, status: 'open' }]).select().single()
      data = newConv
    }
    setConv(data)
    const { data: msgs } = await supabase.from('chat_messages').select('*').eq('conversation_id', data.id).order('created_at')
    setMessages(msgs || [])
    setTimeout(scrollToBottom, 100)
    await supabase.from('chat_conversations').update({ unread_client: 0 }).eq('id', data.id)
  }, [user.clientId])

  useEffect(() => { initChat() }, [initChat])

  useEffect(() => {
    if (!conv?.id) return
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    const channel = supabase.channel(`cp-chat-${conv.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conv.id}` },
        (payload) => {
          setMessages(prev => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new])
          setTimeout(scrollToBottom, 100)
        })
      .subscribe()
    channelRef.current = channel
    return () => supabase.removeChannel(channel)
  }, [conv?.id])

  const sendMessage = async () => {
    if (!newMsg.trim() || !conv) return
    setSending(true)
    const msgText = newMsg.trim()
    setNewMsg('')
    await supabase.from('chat_messages').insert([{
      conversation_id: conv.id,
      sender_role: 'client',
      sender_name: user.name,
      message: msgText,
    }])
    await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString(), status: 'open', unread_admin: (conv.unread_admin || 0) + 1 }).eq('id', conv.id)
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-white font-semibold text-sm">Support Chat</p>
          <p className="text-emerald-400 text-xs">● Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">Send a message to start chatting with support</p>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_role === 'client' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2.5 rounded-2xl ${m.sender_role === 'client' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-100 rounded-bl-sm'}`}>
              {m.sender_role !== 'client' && <p className="text-xs font-semibold mb-1 text-blue-400">{m.sender_name}</p>}
              <p className="text-sm">{m.message}</p>
              <p className={`text-xs mt-1 ${m.sender_role === 'client' ? 'text-blue-200' : 'text-slate-500'}`}>
                {format(new Date(m.created_at), 'hh:mm a')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Type a message..."
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button className="btn-primary px-4" onClick={sendMessage} disabled={sending || !newMsg.trim()}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

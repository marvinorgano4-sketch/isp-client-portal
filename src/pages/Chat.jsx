import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, MessageCircle, Loader2, Check, CheckCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function Chat({ user, onClose }) {
  const [conv, setConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [pendingMsgs, setPendingMsgs] = useState([]) // optimistic messages
  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)
  const inputRef = useRef(null)

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
          setPendingMsgs([])
          setTimeout(scrollToBottom, 100)
        })
      .subscribe()
    channelRef.current = channel

    // Polling fallback every 3s — ensures messages always appear even if realtime fails
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at')
      if (data) {
        setMessages(data)
        setPendingMsgs([])
        setTimeout(scrollToBottom, 50)
      }
    }, 3000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [conv?.id])

  const sendMessage = async () => {
    if (!newMsg.trim() || !conv || sending) return
    const msgText = newMsg.trim()
    setNewMsg('') // Clear input immediately
    setSending(true)

    // Optimistic UI — show message immediately as "sending"
    const tempId = `temp-${Date.now()}`
    const tempMsg = {
      id: tempId,
      message: msgText,
      sender_role: 'client',
      sender_name: user.name,
      created_at: new Date().toISOString(),
      pending: true,
    }
    setPendingMsgs(prev => [...prev, tempMsg])
    setTimeout(scrollToBottom, 50)

    // Parallel execution — don't block UI but wait for completion
    await Promise.all([
      supabase.from('chat_messages').insert([{
        conversation_id: conv.id,
        sender_role: 'client',
        sender_name: user.name,
        message: msgText,
      }]),
      supabase.from('chat_conversations').update({
        updated_at: new Date().toISOString(),
        status: 'open',
        unread_admin: (conv.unread_admin || 0) + 1,
      }).eq('id', conv.id),
    ])

    setSending(false)
    inputRef.current?.focus()
  }

  const allMessages = [
    ...messages,
    ...pendingMsgs.filter(p => !messages.find(m => m.message === p.message && m.sender_role === 'client')),
  ]

  return (
    <>
      {/* Backdrop - click to close on mobile */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:bg-transparent"
        onClick={onClose}
      />

      {/* Chat Dialog */}
      <div className="fixed z-50
        /* Mobile: bottom sheet style */
        bottom-0 left-0 right-0 h-[75vh] rounded-t-2xl
        /* Desktop: floating bottom-right */
        md:bottom-6 md:right-6 md:left-auto md:w-96 md:h-[520px] md:rounded-2xl
        bg-slate-900 border border-slate-700 flex flex-col shadow-2xl shadow-black/50
        transition-all duration-200
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 rounded-t-2xl bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Support Chat</p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-emerald-400 text-xs">Online</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {allMessages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Send a message to start chatting with support</p>
            </div>
          )}
          {allMessages.map(m => (
            <div key={m.id} className={`flex ${m.sender_role === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl
                ${m.sender_role === 'client'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                }
                ${m.pending ? 'opacity-60' : 'opacity-100'}
                transition-opacity duration-200
              `}>
                {m.sender_role !== 'client' && (
                  <p className="text-xs font-semibold mb-1 text-blue-400">{m.sender_name}</p>
                )}
                <p className="text-sm leading-relaxed">{m.message}</p>
                <div className={`flex items-center gap-1 mt-1 ${m.sender_role === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`text-xs ${m.sender_role === 'client' ? 'text-blue-200' : 'text-slate-500'}`}>
                    {format(new Date(m.created_at), 'hh:mm a')}
                  </p>
                  {/* Sending status indicator */}
                  {m.sender_role === 'client' && (
                    m.pending
                      ? <Loader2 size={11} className="text-blue-200 animate-spin" />
                      : <CheckCheck size={11} className="text-blue-200" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex gap-2 items-end">
            <input
              ref={inputRef}
              className="input flex-1 resize-none text-sm py-2.5"
              placeholder="Type a message..."
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              autoComplete="off"
            />
            <button
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center
                ${newMsg.trim() && !sending
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              onClick={sendMessage}
              disabled={sending || !newMsg.trim()}
            >
              {sending
                ? <Loader2 size={18} className="animate-spin" />
                : <Send size={18} />
              }
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

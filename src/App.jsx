import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { initOneSignal, subscribeOneSignal, isOneSignalSubscribed } from './lib/onesignal'
import Login from './pages/Login'
import Portal from './pages/Portal'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp_user') || 'null') } catch { return null }
  })
  const [showPushPrompt, setShowPushPrompt] = useState(false)

  // Init OneSignal on mount
  useEffect(() => {
    initOneSignal()
  }, [])

  // After login, check if subscribed
  useEffect(() => {
    if (!user) return
    setTimeout(async () => {
      const subscribed = await isOneSignalSubscribed()
      if (!subscribed) setShowPushPrompt(true)
    }, 3000)
  }, [user])

  useEffect(() => {
    if (user) localStorage.setItem('cp_user', JSON.stringify(user))
    else localStorage.removeItem('cp_user')
  }, [user])

  const login = async (accountNumber) => {
    const { data, error } = await supabase
      .from('clients')
      .select('id, full_name, status, account_number')
      .eq('account_number', accountNumber.trim())
      .single()
    if (error || !data) return { success: false, error: 'Account number not found.' }
    if (data.status === 'disconnected') return { success: false, error: 'Your account is disconnected. Please contact support.' }
    setUser({ clientId: data.id, name: data.full_name, accountNumber: data.account_number })
    return { success: true }
  }

  const logout = () => setUser(null)

  const handleEnableNotifications = async () => {
    setShowPushPrompt(false)
    if (!user) return
    const ok = await subscribeOneSignal(user.clientId)
    if (ok) alert('✓ Notifications enabled!')
  }

  if (!user) return <Login onLogin={login} />

  return (
    <>
      <Portal user={user} onLogout={logout} />

      {/* Push Notification Prompt */}
      {showPushPrompt && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50
          bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-2xl shadow-black/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
              🔔
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Enable Notifications</p>
              <p className="text-slate-400 text-xs mt-0.5">
                Get payment reminders and alerts directly on your phone.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleEnableNotifications}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                >
                  Enable
                </button>
                <button
                  onClick={() => setShowPushPrompt(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium py-2 rounded-lg transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

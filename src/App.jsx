import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Portal from './pages/Portal'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp_user') || 'null') } catch { return null }
  })

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

  if (!user) return <Login onLogin={login} />
  return <Portal user={user} onLogout={logout} />
}

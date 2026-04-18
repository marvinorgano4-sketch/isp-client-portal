import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { initOneSignal, subscribeOneSignal, isOneSignalSubscribed } from './lib/onesignal'
import { checkForUpdate } from './lib/appUpdate'
import Login from './pages/Login'
import Portal from './pages/Portal'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp_user') || 'null') } catch { return null }
  })
  const [showPushPrompt, setShowPushPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [enablingNotifications, setEnablingNotifications] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(null)
  const [showPermissionGuide, setShowPermissionGuide] = useState(false)

  // Init OneSignal on mount
  useEffect(() => {
    initOneSignal()
  }, [])

  // Check for app updates (APK only)
  useEffect(() => {
    if (!user) return
    
    const checkUpdate = async () => {
      const update = await checkForUpdate()
      if (update) {
        setUpdateAvailable(update)
      }
    }
    
    // Check on login
    checkUpdate()
    
    // Check daily
    const interval = setInterval(checkUpdate, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  // PWA Install Prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show install prompt after 5 seconds if user is logged in
      if (user) {
        setTimeout(() => setShowInstallPrompt(true), 5000)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed')
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [user])

  // Check for notification permission on app open (before login)
  useEffect(() => {
    const checkNotificationOnStart = async () => {
      // Wait for OneSignal to initialize
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const subscribed = await isOneSignalSubscribed()
      if (!subscribed) {
        setShowPushPrompt(true)
        
        // Auto-trigger permission request after 2 seconds
        setTimeout(async () => {
          await handleEnableNotificationsBeforeLogin()
        }, 2000)
      }
    }
    
    checkNotificationOnStart()
  }, [])

  // After login, check if subscribed and show prompt immediately
  useEffect(() => {
    if (!user) return
    
    const checkAndPrompt = async () => {
      const subscribed = await isOneSignalSubscribed()
      if (!subscribed) {
        setShowPushPrompt(true)
        
        // Auto-trigger permission request after 1 second
        setTimeout(async () => {
          // Automatically trigger the permission dialog
          await handleEnableNotifications()
        }, 1000)
      }
    }
    
    // Check immediately after login
    setTimeout(checkAndPrompt, 500)
    
    // Keep checking every 5 seconds if not subscribed
    const interval = setInterval(async () => {
      const subscribed = await isOneSignalSubscribed()
      if (!subscribed) {
        setShowPushPrompt(true)
      } else {
        setShowPushPrompt(false)
        clearInterval(interval)
      }
    }, 5000)
    
    return () => clearInterval(interval)
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

  const handleEnableNotificationsBeforeLogin = async () => {
    if (enablingNotifications) return
    
    setEnablingNotifications(true)
    
    // Show visual guide when permission dialog appears
    setShowPermissionGuide(true)
    
    try {
      console.log('Requesting notification permission (before login)')
      const ok = await subscribeOneSignal(null) // No client ID yet
      
      // Hide guide after permission is handled
      setShowPermissionGuide(false)
      
      if (ok) {
        console.log('Notification permission granted!')
        setShowPushPrompt(false)
        // Show success message
        setTimeout(() => {
          alert('✓ Notifications enabled! You will receive payment reminders after login.')
        }, 300)
      } else {
        console.log('Notification permission denied or failed')
        // If user denied, show detailed instructions
        const message = `⚠️ Notification Permission Denied

To enable notifications:

1. Go to your phone Settings
2. Find "Apps" or "Applications"
3. Find "ISP Client Portal"
4. Tap "Permissions" or "Notifications"
5. Enable "Notifications"
6. Come back to this app

Or you can uninstall and reinstall the app, then allow notifications when prompted.`
        
        alert(message)
        // Prompt will stay visible
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      setShowPermissionGuide(false)
      alert('⚠️ Failed to enable notifications. Please try again or enable manually in your phone settings.')
    } finally {
      setEnablingNotifications(false)
    }
  }

  const handleEnableNotifications = async () => {
    if (!user || enablingNotifications) return
    
    setEnablingNotifications(true)
    
    // Show visual guide when permission dialog appears
    setShowPermissionGuide(true)
    
    try {
      console.log('Requesting notification permission for client:', user.clientId)
      const ok = await subscribeOneSignal(user.clientId)
      
      // Hide guide after permission is handled
      setShowPermissionGuide(false)
      
      if (ok) {
        console.log('Notification permission granted!')
        setShowPushPrompt(false)
        // Show success message
        setTimeout(() => {
          alert('✓ Notifications enabled! You will now receive payment reminders.')
        }, 300)
      } else {
        console.log('Notification permission denied or failed')
        // If user denied, show detailed instructions
        const message = `⚠️ Notification Permission Denied

To enable notifications:

1. Go to your phone Settings
2. Find "Apps" or "Applications"
3. Find "ISP Client Portal"
4. Tap "Permissions" or "Notifications"
5. Enable "Notifications"
6. Come back to this app

Or you can uninstall and reinstall the app, then allow notifications when prompted.`
        
        alert(message)
        // Prompt will stay visible
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      setShowPermissionGuide(false)
      alert('⚠️ Failed to enable notifications. Please try again or enable manually in your phone settings.')
    } finally {
      setEnablingNotifications(false)
    }
  }

  const handleInstallApp = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallPrompt(false)
    }
    setDeferredPrompt(null)
  }

  if (!user) return (
    <>
      <Login onLogin={login} />
      
      {/* Visual Guide Overlay - Points to "Allow" button in Android Permission Dialog */}
      {showPermissionGuide && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Dimmed background */}
          <div className="absolute inset-0 bg-black/70" />
          
          {/* Spotlight on center area where permission dialog appears */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-64 bg-gradient-radial from-transparent via-transparent to-black/70 rounded-3xl" />
          
          {/* Animated pointer pointing to "Allow" button (right side of dialog) */}
          <div className="absolute top-1/2 right-16 flex flex-col items-center animate-bounce">
            {/* Large arrow pointing left to "Allow" button */}
            <div className="text-8xl drop-shadow-[0_0_15px_rgba(59,130,246,1)] transform -rotate-90">
              👆
            </div>
            
            {/* Instruction text */}
            <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-blue-400 animate-pulse-slow mt-4">
              <p className="font-bold text-lg text-center whitespace-nowrap">Tap ALLOW</p>
              <p className="text-sm text-center text-blue-100 mt-1">to enable notifications</p>
            </div>
          </div>
          
          {/* Additional pulsing ring effect pointing to "Allow" button */}
          <div className="absolute top-1/2 right-20 -translate-y-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-blue-500 animate-ping opacity-75" />
          </div>
          
          {/* Arrow pointing to dialog center */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
            <div className="text-6xl animate-bounce drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
              ⬇️
            </div>
          </div>
        </div>
      )}
      
      {/* Push Notification Prompt - Persistent (No Close Button) */}
      {showPushPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 border-2 border-blue-600 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-pulse-slow">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 text-4xl animate-bounce">
                🔔
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Enable Notifications</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                To receive important payment reminders, service alerts, and account updates, please enable notifications now.
              </p>
              <button
                onClick={user ? handleEnableNotifications : handleEnableNotificationsBeforeLogin}
                disabled={enablingNotifications}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-base font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/50 hover:shadow-blue-600/70 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-3"
              >
                {enablingNotifications ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enabling...
                  </span>
                ) : (
                  '✓ Enable Notifications Now'
                )}
              </button>
              
              {/* Help Button */}
              <button
                onClick={() => {
                  alert(`📱 How to Enable Notifications Manually:

1. Go to your phone Settings
2. Tap "Apps" or "Applications"
3. Find "ISP Client Portal"
4. Tap "Permissions" or "Notifications"
5. Enable "Notifications"
6. Return to this app

The prompt will disappear once notifications are enabled.`)
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium py-3 rounded-xl transition-colors"
              >
                📖 How to Enable Manually
              </button>
              
              <p className="text-slate-500 text-xs mt-4">
                Required for account updates and payment reminders
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <Portal user={user} onLogout={logout} />

      {/* Visual Guide Overlay - Points to "Allow" button in Android Permission Dialog */}
      {showPermissionGuide && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Dimmed background */}
          <div className="absolute inset-0 bg-black/70" />
          
          {/* Spotlight on center area where permission dialog appears */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-64 bg-gradient-radial from-transparent via-transparent to-black/70 rounded-3xl" />
          
          {/* Animated pointer pointing to "Allow" button (right side of dialog) */}
          <div className="absolute top-1/2 right-16 flex flex-col items-center animate-bounce">
            {/* Large arrow pointing left to "Allow" button */}
            <div className="text-8xl drop-shadow-[0_0_15px_rgba(59,130,246,1)] transform -rotate-90">
              👆
            </div>
            
            {/* Instruction text */}
            <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-blue-400 animate-pulse-slow mt-4">
              <p className="font-bold text-lg text-center whitespace-nowrap">Tap ALLOW</p>
              <p className="text-sm text-center text-blue-100 mt-1">to enable notifications</p>
            </div>
          </div>
          
          {/* Additional pulsing ring effect pointing to "Allow" button */}
          <div className="absolute top-1/2 right-20 -translate-y-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-blue-500 animate-ping opacity-75" />
          </div>
          
          {/* Arrow pointing to dialog center */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
            <div className="text-6xl animate-bounce drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
              ⬇️
            </div>
          </div>
        </div>
      )}

      {/* Push Notification Prompt - Persistent (No Close Button) */}
      {showPushPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 border-2 border-blue-600 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-pulse-slow">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 text-4xl animate-bounce">
                🔔
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Enable Notifications</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                To receive important payment reminders, service alerts, and account updates, please enable notifications now.
              </p>
              <button
                onClick={user ? handleEnableNotifications : handleEnableNotificationsBeforeLogin}
                disabled={enablingNotifications}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-base font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/50 hover:shadow-blue-600/70 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-3"
              >
                {enablingNotifications ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enabling...
                  </span>
                ) : (
                  '✓ Enable Notifications Now'
                )}
              </button>
              
              {/* Help Button */}
              <button
                onClick={() => {
                  alert(`📱 How to Enable Notifications Manually:

1. Go to your phone Settings
2. Tap "Apps" or "Applications"
3. Find "ISP Client Portal"
4. Tap "Permissions" or "Notifications"
5. Enable "Notifications"
6. Return to this app

The prompt will disappear once notifications are enabled.`)
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium py-3 rounded-xl transition-colors"
              >
                📖 How to Enable Manually
              </button>
              
              <p className="text-slate-500 text-xs mt-4">
                Required for account updates and payment reminders
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      {showInstallPrompt && !showPushPrompt && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40
          bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 shadow-2xl shadow-blue-600/40">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
              📱
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Install App</p>
              <p className="text-blue-100 text-xs mt-0.5">
                Add to your home screen for quick access and better experience!
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstallApp}
                  className="flex-1 bg-white hover:bg-blue-50 text-blue-600 text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Update Available Prompt */}
      {updateAvailable && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40
          bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-4 shadow-2xl shadow-emerald-600/40 border-2 border-emerald-400">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
              🎉
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Update Available!</p>
              <p className="text-emerald-100 text-xs mt-0.5">
                Version {updateAvailable.latestVersion} is now available
              </p>
              <p className="text-emerald-200 text-xs mt-1 italic">
                {updateAvailable.releaseNotes}
              </p>
              <div className="flex gap-2 mt-3">
                <a
                  href={updateAvailable.downloadUrl}
                  download
                  className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 text-xs font-semibold py-2 rounded-lg transition-colors text-center"
                >
                  Download
                </a>
                <button
                  onClick={() => setUpdateAvailable(null)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID

let initialized = false

export async function initOneSignal() {
  if (!ONESIGNAL_APP_ID || initialized) {
    if (!ONESIGNAL_APP_ID) console.error('❌ OneSignal App ID not found in .env')
    if (initialized) console.log('OneSignal already initialized')
    return
  }
  if (typeof window === 'undefined') return

  // Wait for OneSignal SDK to load
  await waitForOneSignal()

  try {
    console.log('Initializing OneSignal with App ID:', ONESIGNAL_APP_ID)
    
    await window.OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      notifyButton: { enable: false },
      allowLocalhostAsSecureOrigin: true,
    })
    
    initialized = true
    console.log('✓ OneSignal initialized successfully')
    
    // Check initial permission state
    const initialPermission = window.OneSignal.Notifications.permission
    console.log('Initial permission state:', initialPermission)
  } catch (e) {
    console.error('❌ OneSignal init failed:', e)
  }
}

function waitForOneSignal(timeout = 10000) {
  return new Promise((resolve) => {
    if (window.OneSignal) { resolve(); return }
    const start = Date.now()
    const check = setInterval(() => {
      if (window.OneSignal) { clearInterval(check); resolve() }
      if (Date.now() - start > timeout) { clearInterval(check); resolve() }
    }, 100)
  })
}

export async function subscribeOneSignal(clientId) {
  await waitForOneSignal()
  if (!window.OneSignal) {
    console.error('OneSignal not loaded')
    return false
  }
  
  try {
    console.log('Requesting notification permission...')
    
    // Request permission - this returns true if granted, false if denied
    const permissionGranted = await window.OneSignal.Notifications.requestPermission()
    
    console.log('Permission request result:', permissionGranted)
    
    // Double check the permission state
    const permissionState = window.OneSignal.Notifications.permission
    console.log('Permission state after request:', permissionState)
    
    // Check if permission was actually granted
    if (!permissionGranted || permissionState !== true) {
      console.log('User denied notification permission or permission not granted')
      return false
    }
    
    console.log('✓ Notification permission granted!')
    
    // Permission granted, add client tag if provided
    if (clientId) {
      await window.OneSignal.User.addTag('client_id', String(clientId))
      console.log('✓ Client ID tag added:', clientId)
    }
    
    console.log('✓ OneSignal subscription successful')
    return true
  } catch (e) {
    console.error('❌ OneSignal subscribe failed:', e)
    return false
  }
}

export async function isOneSignalSubscribed() {
  await waitForOneSignal()
  if (!window.OneSignal) {
    console.log('OneSignal not loaded yet')
    return false
  }
  
  try {
    // Check if permission is granted (this is a property, not a function)
    const permission = window.OneSignal.Notifications.permission
    console.log('Current permission status:', permission)
    
    // Permission should be true if granted
    return permission === true
  } catch (e) {
    console.error('Error checking permission:', e)
    return false
  }
}

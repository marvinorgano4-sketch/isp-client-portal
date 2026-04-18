const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID

let initialized = false

export async function initOneSignal() {
  if (!ONESIGNAL_APP_ID || initialized) return
  if (typeof window === 'undefined') return

  // Wait for OneSignal SDK to load
  await waitForOneSignal()

  try {
    await window.OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      notifyButton: { enable: false },
      allowLocalhostAsSecureOrigin: true,
    })
    initialized = true
    console.log('OneSignal initialized')
  } catch (e) {
    console.error('OneSignal init failed:', e)
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
  if (!window.OneSignal) return false
  try {
    await window.OneSignal.Notifications.requestPermission()
    if (clientId) {
      await window.OneSignal.User.addTag('client_id', clientId)
    }
    return true
  } catch (e) {
    console.error('OneSignal subscribe failed:', e)
    return false
  }
}

export async function isOneSignalSubscribed() {
  await waitForOneSignal()
  if (!window.OneSignal) return false
  try {
    return window.OneSignal.Notifications.permission === true
  } catch { return false }
}

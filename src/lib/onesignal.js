// OneSignal Web Push Integration
// Docs: https://documentation.onesignal.com/docs/web-push-quickstart

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID

export function initOneSignal() {
  if (!ONESIGNAL_APP_ID) {
    console.warn('OneSignal App ID not configured')
    return
  }
  if (typeof window === 'undefined') return

  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      notifyButton: { enable: false }, // we use our own UI
      allowLocalhostAsSecureOrigin: true,
    })
  })
}

export async function subscribeOneSignal(clientId) {
  if (!window.OneSignal) return false
  try {
    await window.OneSignal.Notifications.requestPermission()
    // Tag the user with their client ID so we can target them
    await window.OneSignal.User.addTag('client_id', clientId)
    return true
  } catch (e) {
    console.error('OneSignal subscribe failed:', e)
    return false
  }
}

export async function isOneSignalSubscribed() {
  if (!window.OneSignal) return false
  try {
    return await window.OneSignal.Notifications.permission
  } catch { return false }
}

export async function getOneSignalPlayerId() {
  if (!window.OneSignal) return null
  try {
    return await window.OneSignal.User.PushSubscription.id
  } catch { return null }
}

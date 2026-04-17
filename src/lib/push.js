import { supabase } from './supabase'

// Register service worker
export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    console.log('SW registered')
    return reg
  } catch (e) {
    console.error('SW registration failed:', e)
    return null
  }
}

// Request push permission and save subscription to Supabase
export async function subscribeToPush(clientId) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false

  try {
    const reg = await navigator.serviceWorker.ready
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

    if (!vapidKey) {
      console.warn('No VAPID key — push notifications disabled')
      return false
    }

    // Unsubscribe from any existing subscription first
    const existing = await reg.pushManager.getSubscription()
    if (existing) await existing.unsubscribe()

    // Fresh subscribe with current VAPID key
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    // Save subscription to Supabase
    const subJson = sub.toJSON()
    await supabase.from('push_subscriptions').upsert({
      client_id: clientId,
      endpoint: subJson.endpoint,
      p256dh: subJson.keys?.p256dh,
      auth: subJson.keys?.auth,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'client_id' })

    return true
  } catch (e) {
    console.error('Push subscribe failed:', e)
    return false
  }
}

export async function isSubscribed() {
  if (!('serviceWorker' in navigator)) return false
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  return !!sub
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

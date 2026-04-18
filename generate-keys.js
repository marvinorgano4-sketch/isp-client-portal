const crypto = require('crypto')

const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1'
})

const pub = publicKey.export({ type: 'spki', format: 'der' })
const priv = privateKey.export({ type: 'pkcs8', format: 'der' })

const publicKeyBase64 = pub.slice(-65).toString('base64url')
const privateKeyBase64 = priv.slice(-32).toString('base64url')

console.log('=== VAPID KEYS ===')
console.log('Public Key:')
console.log(publicKeyBase64)
console.log('')
console.log('Private Key:')
console.log(privateKeyBase64)
console.log('')
console.log('=== ADD TO VERCEL ENV VARS ===')
console.log('VITE_VAPID_PUBLIC_KEY=' + publicKeyBase64)
console.log('VAPID_PRIVATE_KEY=' + privateKeyBase64)

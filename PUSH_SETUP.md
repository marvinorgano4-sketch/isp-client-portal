# Push Notification Setup

## 1. Generate VAPID Keys

Run this in terminal:
```bash
npx web-push generate-vapid-keys
```

You'll get:
- Public Key → add to Vercel as `VITE_VAPID_PUBLIC_KEY`
- Private Key → add to Vercel as `VAPID_PRIVATE_KEY` (server-side only)

## 2. Add Supabase Table

Run this SQL in Supabase SQL Editor:
```sql
CREATE TABLE push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text,
  auth text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id)
);
```

## 3. Add Vercel Environment Variables
- `VITE_VAPID_PUBLIC_KEY` = your public key
- `VAPID_PRIVATE_KEY` = your private key (for server functions)

## 4. Icons Required
Add these to /public folder:
- icon-192.png (192x192 PNG)
- icon-512.png (512x512 PNG)

# PWA Installation Testing Guide

## Why the Install Prompt Might Not Appear

The `beforeinstallprompt` event only fires when ALL these conditions are met:

### ✅ Requirements Checklist:

1. **HTTPS or localhost** - Must be served over HTTPS (or localhost for testing)
2. **Service Worker registered** - ✅ Fixed! Now registered in main.jsx
3. **Valid manifest.json** - ✅ Already configured
4. **Icons present** - ✅ SVG icons created as placeholders
5. **Not already installed** - If already installed, prompt won't show
6. **User engagement** - User must interact with the site first (click, scroll, etc.)
7. **Not in incognito/private mode** - PWA install doesn't work in private browsing

---

## Testing Steps

### Option 1: Test on Localhost (Development)

1. **Start dev server:**
   ```bash
   cd isp-client-portal
   npm run dev
   ```

2. **Open in Chrome:**
   - Go to `http://localhost:5173` (or your dev port)
   - Open DevTools (F12)
   - Go to **Application** tab → **Manifest**
   - Check if manifest loads correctly
   - Check **Service Workers** section - should show "activated and running"

3. **Check PWA installability:**
   - In DevTools, go to **Application** → **Manifest**
   - Look for "Add to home screen" section
   - If there are errors, they'll be listed here

4. **Manual install test:**
   - Click the install icon in Chrome's address bar (⊕ or ⬇️ icon)
   - Or: Chrome menu (⋮) → "Install Client Portal..."

### Option 2: Test on Production (Vercel)

1. **Deploy to Vercel:**
   ```bash
   npm run build
   vercel --prod
   ```

2. **Open on Android device:**
   - Open Chrome browser
   - Go to your production URL
   - Wait 5-10 seconds
   - Look for install prompt

3. **Force install prompt (if not showing):**
   - Chrome menu (⋮) → "Install app" or "Add to Home Screen"

---

## Debugging PWA Issues

### Check in Chrome DevTools:

1. **Open DevTools** (F12)

2. **Application Tab:**
   - **Manifest**: Should show your manifest.json with no errors
   - **Service Workers**: Should show "activated and running"
   - **Storage**: Check if service worker is registered

3. **Console Tab:**
   - Look for "✓ Service Worker registered" message
   - Check for any errors

4. **Lighthouse Tab:**
   - Run PWA audit
   - Shows what's missing for PWA installation

### Common Issues:

#### Issue 1: "Service Worker not registered"
**Solution:** Make sure you deployed the latest code with SW registration in main.jsx

#### Issue 2: "Manifest not found"
**Solution:** Check if `/manifest.json` is accessible in browser

#### Issue 3: "Icons not found"
**Solution:** Check if `/icon-192.svg` and `/icon-512.svg` are accessible

#### Issue 4: "Already installed"
**Solution:** 
- Uninstall the app first
- Chrome → Settings → Apps → Client Portal → Uninstall
- Or: Long press app icon → App info → Uninstall

#### Issue 5: "Install prompt not showing"
**Solution:**
- Clear browser cache
- Close and reopen browser
- Try in a new incognito window (then exit and try in normal mode)
- Make sure you're on HTTPS (not HTTP)

---

## Manual Installation (Always Works)

Even if the automatic prompt doesn't show, users can always install manually:

### On Android Chrome:
1. Open the website
2. Tap menu (⋮) in top-right
3. Tap "Install app" or "Add to Home Screen"
4. Confirm installation

### On Desktop Chrome:
1. Open the website
2. Click install icon (⊕) in address bar
3. Or: Menu (⋮) → "Install Client Portal..."

### On iOS Safari:
1. Open the website
2. Tap Share button (□↑)
3. Tap "Add to Home Screen"
4. Confirm

---

## Testing the Install Prompt Code

To test if the install prompt code is working:

1. **Open Console** (F12)

2. **Check for event listener:**
   ```javascript
   // The app should log when beforeinstallprompt fires
   // Look for console messages
   ```

3. **Manually trigger (for testing):**
   ```javascript
   // In console, check if deferredPrompt is set
   // (This is just for debugging, won't work in production)
   ```

4. **Check state:**
   - The install prompt should appear 5 seconds after login
   - Only if `beforeinstallprompt` event fired
   - Only if not already installed

---

## Force Install Prompt (Development Only)

For testing, you can bypass the automatic prompt:

1. **Chrome DevTools** → **Application** → **Manifest**
2. Click "Add to home screen" link at the bottom
3. This simulates the install prompt

---

## Verifying Installation

After installing:

1. **Check home screen** - App icon should appear
2. **Open app** - Should open in standalone mode (no browser UI)
3. **Check status bar** - Should use your theme color (#2563eb blue)
4. **Test offline** - Should work without internet (cached)
5. **Test notifications** - Should receive push notifications

---

## Production Deployment Checklist

Before deploying:

- [ ] Service worker registered in main.jsx ✅
- [ ] manifest.json is valid ✅
- [ ] Icons are present (SVG or PNG) ✅
- [ ] Deployed to HTTPS (Vercel) ✅
- [ ] Tested on localhost first
- [ ] Tested manual installation
- [ ] Tested on real Android device
- [ ] Push notifications working
- [ ] Offline mode working

---

## Quick Test Commands

```bash
# 1. Build the app
npm run build

# 2. Preview production build locally
npm run preview

# 3. Open in browser
# Go to http://localhost:4173

# 4. Check PWA in DevTools
# F12 → Application → Manifest
# F12 → Application → Service Workers

# 5. Deploy to Vercel
vercel --prod
```

---

## Expected Behavior

### After Login:
1. **1 second** → Push notification prompt appears (full screen modal)
2. **5 seconds** → Install app prompt appears (bottom banner)
3. User can click "Install" on either prompt
4. Browser's native install dialog appears
5. User confirms → App installed to home screen

### After Installation:
- App icon appears on home screen
- Opening app shows full-screen experience
- No browser UI (address bar, tabs, etc.)
- Works offline
- Receives push notifications

---

## Still Not Working?

If the install prompt still doesn't appear after following all steps:

1. **Use manual installation** - Always works, users just need to:
   - Chrome menu → "Install app"

2. **Check Lighthouse audit:**
   - DevTools → Lighthouse → PWA
   - Shows exactly what's missing

3. **Verify on real device:**
   - Sometimes works on mobile but not desktop
   - Test on actual Android phone with Chrome

4. **Clear everything:**
   ```bash
   # Clear browser data
   # Chrome → Settings → Privacy → Clear browsing data
   # Check: Cached images, Site settings
   ```

5. **Check browser version:**
   - Update Chrome to latest version
   - Some older versions don't support PWA

---

## Alternative: Show Install Instructions

If automatic prompt is unreliable, add manual instructions in your app:

```jsx
// Add to Portal.jsx or Settings page
<div className="card p-4">
  <h3 className="text-white font-semibold mb-2">📱 Install App</h3>
  <p className="text-slate-400 text-sm mb-3">
    For the best experience, install this app on your device:
  </p>
  <ol className="text-slate-400 text-sm space-y-1 ml-4">
    <li>1. Tap the menu (⋮) in your browser</li>
    <li>2. Select "Install app" or "Add to Home Screen"</li>
    <li>3. Confirm installation</li>
  </ol>
</div>
```

---

## Need Help?

If you're still having issues:
1. Share the Lighthouse PWA audit results
2. Share any console errors
3. Confirm you're testing on HTTPS (not HTTP)
4. Confirm service worker is registered (check DevTools)

The manual installation method (Chrome menu → Install app) should ALWAYS work if the PWA is properly configured!

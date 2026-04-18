# APK Update System Guide

## 📋 Overview

Unlike web apps, APK updates are **NOT automatic**. Users must manually download and install new versions. However, we've added an **in-app update checker** to notify users when updates are available.

---

## 🔄 Update Methods Comparison

### Web App (PWA) ✅ Automatic
```
You: Deploy to Vercel
Users: Get updates instantly (automatic)
```
- ✅ Instant updates
- ✅ No user action needed
- ✅ All users updated at once
- ✅ Easy to maintain

### APK ❌ Manual
```
You: Build new APK → Upload to server
Users: Download → Install manually
```
- ❌ Manual download required
- ❌ Manual installation required
- ❌ Not all users update
- ❌ Slower adoption

---

## 🎯 In-App Update Checker (Implemented)

We've added a system that:
1. Checks for updates daily
2. Compares current version with server version
3. Shows update prompt if new version available
4. Provides download link

### How It Works:

```
App opens → Check server for latest version
            ↓
    Is new version available?
            ↓
    ┌───────┴───────┐
    │ YES           │ NO
    ↓               ↓
Show prompt    Continue normally
    ↓
User clicks "Download"
    ↓
APK downloads
    ↓
User installs manually
```

---

## ⚙️ Setup

### 1. Update Version Number

Edit `isp-client-portal/src/lib/appUpdate.js`:

```javascript
const CURRENT_VERSION = '1.0.1' // Change this when releasing new version
```

### 2. Update Server Version File

Edit `isp-landing/api/app-version.json`:

```json
{
  "version": "1.0.1",
  "downloadUrl": "https://yourisp.com/downloads/isp-client-portal-v1.0.1.apk",
  "releaseNotes": "Bug fixes and performance improvements",
  "releaseDate": "2026-01-20"
}
```

### 3. Upload to Server

Upload `app-version.json` to your server:
```
https://yourisp.com/api/app-version.json
```

Make sure it's publicly accessible!

---

## 📦 Release Process

### Step 1: Update Code
```bash
# Make your changes
# Test thoroughly
```

### Step 2: Update Version Number

In `src/lib/appUpdate.js`:
```javascript
const CURRENT_VERSION = '1.0.1' // Increment version
```

In `package.json`:
```json
{
  "version": "1.0.1"
}
```

### Step 3: Build New APK

```bash
cd isp-client-portal
npm run build
npx cap sync
npx cap open android
```

In Android Studio:
- Build → Build APK
- Get APK from `android/app/build/outputs/apk/release/`

### Step 4: Upload APK

Upload to your server:
```
https://yourisp.com/downloads/isp-client-portal-v1.0.1.apk
```

### Step 5: Update Version File

Update `app-version.json` on server:
```json
{
  "version": "1.0.1",
  "downloadUrl": "https://yourisp.com/downloads/isp-client-portal-v1.0.1.apk",
  "releaseNotes": "What's new in this version",
  "releaseDate": "2026-01-20"
}
```

### Step 6: Notify Users

Users will see update prompt next time they open the app!

---

## 📱 User Experience

### Update Prompt:
```
┌─────────────────────────────────┐
│ 🎉 Update Available!            │
│                                 │
│ Version 1.0.1 is now available  │
│ Bug fixes and improvements      │
│                                 │
│ [Download]  [Later]             │
└─────────────────────────────────┘
```

### User Flow:
1. Open app
2. See update prompt (if available)
3. Click "Download"
4. APK downloads to phone
5. Open downloaded APK
6. Android asks to install
7. Click "Install"
8. App updated!

---

## 🔢 Version Numbering

Use semantic versioning: `MAJOR.MINOR.PATCH`

### Examples:
- `1.0.0` - Initial release
- `1.0.1` - Bug fix
- `1.1.0` - New feature
- `2.0.0` - Major changes

### When to Increment:
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, small improvements
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, major redesign

---

## 🧪 Testing

### Test Update Flow:

1. **Install old version** (e.g., 1.0.0)
2. **Update version file** on server to 1.0.1
3. **Open app**
4. **Check if prompt appears**
5. **Click "Download"**
6. **Verify APK downloads**
7. **Install new version**
8. **Verify update successful**

---

## 📊 Monitoring

### Track Update Adoption:

1. **Server logs** - Check download count
2. **Analytics** - Track version numbers
3. **User feedback** - Ask users their version

### Check Current Version:

Add version display in app settings:

```javascript
import { getCurrentVersion } from './lib/appUpdate'

// In Settings or About page:
<p>Version: {getCurrentVersion()}</p>
```

---

## 🐛 Troubleshooting

### Issue 1: Update Prompt Not Showing

**Check:**
- ✅ Version file accessible? (visit URL in browser)
- ✅ Version number incremented in code?
- ✅ App running as standalone (not in browser)?
- ✅ Last check was more than 24 hours ago?

**Debug:**
```javascript
// In browser console:
localStorage.removeItem('last_update_check')
// Then refresh app
```

### Issue 2: Download Not Working

**Check:**
- ✅ APK file uploaded to server?
- ✅ Download URL correct in version file?
- ✅ File publicly accessible?
- ✅ HTTPS enabled?

### Issue 3: Version Not Updating

**Check:**
- ✅ Version number in code matches APK?
- ✅ APK rebuilt after version change?
- ✅ Users installed new APK?

---

## 💡 Best Practices

### 1. Test Before Release
- Build APK
- Test on real device
- Verify all features work
- Check update prompt

### 2. Clear Release Notes
```json
{
  "releaseNotes": "✓ Fixed login issue\n✓ Improved performance\n✓ Added dark mode"
}
```

### 3. Version Naming
```
isp-client-portal-v1.0.1.apk  ✓ Good
app.apk                        ✗ Bad
```

### 4. Keep Old Versions
Don't delete old APKs immediately. Some users might need them.

### 5. Notify Users
- Push notification
- SMS
- Email
- In-app banner

---

## 🚀 Advanced: Force Update

For critical updates, you can force users to update:

### In `app-version.json`:
```json
{
  "version": "1.0.1",
  "minVersion": "1.0.1",
  "forceUpdate": true,
  "downloadUrl": "...",
  "releaseNotes": "Critical security update - please update immediately"
}
```

### Implementation:
```javascript
// In appUpdate.js
if (data.forceUpdate && isNewerVersion(data.minVersion, CURRENT_VERSION)) {
  // Show non-dismissible update prompt
  // Block app usage until updated
}
```

---

## 📈 Update Adoption Strategy

### Week 1: Soft Prompt
- Show update available
- Allow "Later" option
- Check daily

### Week 2: Persistent Prompt
- Show on every app open
- Highlight benefits
- Make more prominent

### Week 3: Force Update (if critical)
- Block app usage
- Require update
- Provide support

---

## 🎯 Comparison: APK vs Web

| Feature | Web App | APK |
|---------|---------|-----|
| Updates | Automatic | Manual |
| Speed | Instant | Slow |
| User Action | None | Download + Install |
| Adoption | 100% | 50-80% |
| Maintenance | Easy | Moderate |
| Distribution | URL | File |

**Recommendation:** Offer both! Let users choose their preference.

---

## 📞 User Support

### Common User Questions:

**Q: How do I update?**
A: Open the app, tap "Download" on the update prompt, then install the downloaded APK.

**Q: Do I need to uninstall first?**
A: No! Just install the new version over the old one.

**Q: Will I lose my data?**
A: No, your login and data are safe.

**Q: Why do I need to update?**
A: Updates include bug fixes, new features, and security improvements.

---

## 🎉 Summary

### APK Updates:
- ❌ Not automatic
- ✅ In-app checker added
- ✅ User-friendly prompts
- ✅ Easy download process

### Your Workflow:
1. Update version number
2. Build new APK
3. Upload to server
4. Update version file
5. Users get notified!

### User Workflow:
1. Open app
2. See update prompt
3. Click "Download"
4. Install APK
5. Done!

---

**Remember:** Web app updates are automatic, but APK updates require user action. The in-app update checker makes it easier, but you still need to encourage users to update!

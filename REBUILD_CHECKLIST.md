# 🔄 APK Rebuild Checklist

## ✅ Changes Made (Ready to Rebuild)

### 1. Visual Guide Implementation
- [x] Added `showPermissionGuide` state
- [x] Created visual guide overlay with animated pointer
- [x] Added pulsing ring effect
- [x] Added instruction box with "Tap ALLOW"
- [x] Positioned at top of screen (z-index 9999)
- [x] Auto-shows when permission request triggers
- [x] Auto-hides after permission is handled

### 2. Auto-Trigger Implementation
- [x] Auto-triggers 1 second after login
- [x] Calls `handleEnableNotifications()` automatically
- [x] Shows visual guide when triggered

### 3. Persistent Prompt
- [x] No close button
- [x] No "Maybe Later" button
- [x] Auto-checks every 5 seconds
- [x] Disappears only when notifications enabled

### 4. Error Handling
- [x] Detailed instructions on deny
- [x] Manual enable guide button
- [x] Success message on enable
- [x] Clear error messages

## 🚀 Rebuild Steps

### Quick Method (Recommended):
```bash
cd isp-client-portal
build-apk.bat
```

### Manual Method:
```bash
cd isp-client-portal

# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. In Android Studio:
#    - Build > Build Bundle(s) / APK(s) > Build APK(s)
#    - Wait for build to complete
#    - Click "locate" to find APK
```

## 📱 Testing Checklist

### Before Installing:
- [ ] Uninstall old APK completely from device
- [ ] Clear any cached data
- [ ] Make sure device has internet connection

### After Installing:
- [ ] Open app
- [ ] Login with account number
- [ ] Wait for notification prompt to appear
- [ ] Wait 1 second for auto-trigger
- [ ] **Check if visual guide appears** (👆 pointer, pulsing ring, instruction box)
- [ ] **Check if Android permission dialog appears**
- [ ] Tap "Allow" on Android dialog
- [ ] **Check if visual guide disappears**
- [ ] **Check if success message appears**
- [ ] **Check if notification prompt disappears**
- [ ] Verify you can use app normally

### Test Deny Scenario:
- [ ] Uninstall and reinstall
- [ ] Login
- [ ] Tap "Deny" on Android dialog
- [ ] **Check if detailed instructions appear**
- [ ] **Check if prompt stays visible**
- [ ] **Check if "How to Enable Manually" button works**

### Test Manual Enable:
- [ ] Go to Settings > Apps > ISP Client Portal
- [ ] Enable notifications manually
- [ ] Return to app
- [ ] **Check if prompt disappears within 5 seconds**

### Test Already Enabled:
- [ ] With notifications already enabled
- [ ] Login
- [ ] **Check that no prompt appears**
- [ ] **Check direct access to portal**

## 📋 Files Modified

- [x] `isp-client-portal/src/App.jsx` - Added visual guide overlay
- [x] `isp-client-portal/src/index.css` - Already has animations
- [x] `isp-client-portal/android/app/src/main/AndroidManifest.xml` - Already has permissions
- [x] `isp-client-portal/capacitor.config.json` - Already configured

## 🎯 Expected Visual Guide Appearance

When permission request triggers, you should see:

```
┌─────────────────────────────┐
│   [Status Bar]              │
│                              │
│   ⭕ (Pulsing ring)          │ ← Animated ring
│                              │
│         👆                   │ ← Bouncing pointer
│    (Bouncing)                │
│                              │
│   ┌──────────────────┐      │
│   │   Tap ALLOW      │      │ ← Blue instruction box
│   │ to enable notif  │      │
│   └──────────────────┘      │
│                              │
│  [Android Dialog]            │ ← Permission dialog
│  "Allow notifications?"      │
│  [Deny]  [Allow]            │
│                              │
└─────────────────────────────┘
```

## ⚠️ Common Issues

### Issue: Visual guide doesn't appear
**Solution**: 
- Check if `showPermissionGuide` state is being set to `true`
- Check console for errors
- Verify z-index is 9999

### Issue: Auto-trigger doesn't work
**Solution**:
- Check if OneSignal is initialized
- Check if user is logged in
- Check console for errors
- Verify 1 second delay is working

### Issue: Prompt doesn't disappear
**Solution**:
- Check if notifications are actually enabled
- Check if 5-second interval is running
- Manually enable in Settings and wait 5 seconds

### Issue: Android dialog doesn't appear
**Solution**:
- Check if POST_NOTIFICATIONS permission is in manifest
- Check if OneSignal is configured correctly
- Check if device is Android 13+ (requires permission)

## 🎉 Success Indicators

You'll know it's working when:

✅ Notification prompt appears after login
✅ Auto-trigger happens after 1 second
✅ Visual guide appears with animated pointer
✅ Android permission dialog appears
✅ Visual guide disappears after tapping Allow/Deny
✅ Success message appears after Allow
✅ Prompt disappears after Allow
✅ App works normally after enabling

## 📝 Notes

- Visual guide uses z-index 9999 (highest priority)
- Pointer is positioned at `top-20` (5rem from top)
- Ring is positioned at `top-12` (3rem from top)
- All animations are CSS-based (smooth performance)
- Guide is pointer-events disabled (won't block Android dialog)
- Auto-trigger delay is 1 second (adjustable if needed)
- Check interval is 5 seconds (adjustable if needed)

## 🔄 Version Info

**Current Version**: 1.0.0
**Last Updated**: 2026-04-19
**Status**: ✅ Ready to rebuild and test

---

## 🚀 Quick Start

1. Run `build-apk.bat`
2. Install APK on device
3. Test notification flow
4. Verify visual guide appears
5. Done! 🎉

---

**Tapos na ang implementation! I-rebuild mo na lang at i-test!** ✅

# Fix: Notifications Not Working in APK

## 🐛 Problem

After installing APK:
- ❌ Notification permission denied
- ❌ Can't enable notifications in app settings
- ❌ Notification toggle is grayed out/disabled

## ✅ Solution

I've added the required Android permissions to `AndroidManifest.xml`. Now you need to rebuild the APK.

---

## 🔧 What Was Fixed

### Added to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

These permissions allow:
- **POST_NOTIFICATIONS** - Required for Android 13+ to show notifications
- **VIBRATE** - Allows notification vibration
- **WAKE_LOCK** - Keeps device awake for notifications

---

## 🚀 Rebuild APK

### Step 1: Sync Changes
```bash
cd isp-client-portal
npx cap sync
```

### Step 2: Open Android Studio
```bash
npx cap open android
```

### Step 3: Build New APK
In Android Studio:
1. Wait for Gradle sync to complete
2. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete
4. Click "locate" to find APK

### Step 4: Install New APK
1. Uninstall old version first
2. Install new APK
3. Open app and login
4. Notification prompt should work now!

---

## 📱 Testing

### After Installing New APK:

1. **Open app**
2. **Login**
3. **Notification prompt appears**
4. **Click "Enable Notifications Now"**
5. **Android should show permission dialog**
6. **Click "Allow"**
7. **✓ Notifications enabled!**

### Verify in Settings:

1. **Long press app icon** → **App info**
2. **Permissions** → **Notifications**
3. **Should be clickable now!**
4. **Toggle should work**

---

## 🎯 Expected Behavior

### Before Fix:
```
App Settings → Permissions → Notifications
❌ Grayed out / Not clickable
❌ Can't enable
```

### After Fix:
```
App Settings → Permissions → Notifications
✅ Clickable
✅ Can toggle on/off
✅ Works properly
```

---

## 🔍 Why This Happened

### Android 13+ Requirement:
- Android 13 (API 33) and above require explicit `POST_NOTIFICATIONS` permission
- Without this permission in manifest, the notification toggle is disabled
- Capacitor doesn't add this by default

### What We Added:
```xml
<!-- For Android 13+ notification support -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- For notification features -->
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

---

## 📋 Checklist

Before rebuilding:
- [x] Permissions added to AndroidManifest.xml ✅
- [ ] Run `npx cap sync`
- [ ] Open Android Studio
- [ ] Build new APK
- [ ] Uninstall old version
- [ ] Install new APK
- [ ] Test notifications

---

## 🐛 Troubleshooting

### Issue 1: Still Can't Enable Notifications

**Solution:**
1. Make sure you built NEW APK after adding permissions
2. Uninstall old version completely
3. Install new APK
4. Try again

### Issue 2: Permission Dialog Doesn't Appear

**Solution:**
1. Check if you're on Android 13+
2. Verify permissions in AndroidManifest.xml
3. Rebuild APK
4. Clear app data before testing

### Issue 3: Notifications Still Grayed Out

**Solution:**
1. Uninstall app completely
2. Restart phone
3. Install new APK
4. Test again

---

## 💡 For Future Updates

Whenever you rebuild the APK, make sure:
1. ✅ Permissions are in AndroidManifest.xml
2. ✅ Run `npx cap sync` before building
3. ✅ Build in Android Studio (not just copy files)
4. ✅ Test on real device

---

## 🎉 After Fix

Users will be able to:
- ✅ Enable notifications from app prompt
- ✅ Toggle notifications in app settings
- ✅ Receive push notifications
- ✅ Get payment reminders

---

## 📞 Quick Commands

```bash
# Sync changes
npx cap sync

# Open Android Studio
npx cap open android

# After building, find APK at:
# android/app/build/outputs/apk/debug/app-debug.apk
# or
# android/app/build/outputs/apk/release/app-release.apk
```

---

## ✅ Summary

**Problem:** Notification permissions not declared in Android manifest
**Solution:** Added required permissions
**Action:** Rebuild APK and reinstall

After rebuilding, notifications will work properly! 🎉

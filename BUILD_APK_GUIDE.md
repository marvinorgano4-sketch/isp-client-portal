# Complete APK Build Guide

This guide will help you create a **real APK file** that users can download and install on Android devices.

---

## 📋 Prerequisites

### 1. Install Android Studio
- Download: https://developer.android.com/studio
- Install with default settings
- Open Android Studio once to complete setup

### 2. Install Java JDK 11 or higher
- Download: https://www.oracle.com/java/technologies/downloads/
- Or use OpenJDK: https://adoptium.net/
- Verify: `java -version` (should show version 11+)

### 3. Set Environment Variables (Windows)
```powershell
# Add to System Environment Variables:
ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-11

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

---

## 🚀 Step-by-Step APK Build

### Step 1: Build the Web App
```bash
cd isp-client-portal
npm run build
```

This creates the `dist` folder with your compiled web app.

### Step 2: Add Android Platform
```bash
# First time only
npx cap add android
```

This creates the `android` folder with native Android project.

### Step 3: Sync Web App to Android
```bash
npx cap sync
```

This copies your `dist` folder to the Android project.

### Step 4: Open in Android Studio
```bash
npx cap open android
```

Android Studio will open with your project.

### Step 5: Build APK in Android Studio

1. **Wait for Gradle sync** to complete (bottom status bar)
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Wait for build to complete (2-5 minutes)
4. Click "locate" in the notification
5. APK is in: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📦 APK Locations

### Debug APK (for testing):
```
isp-client-portal/android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (for distribution):
```
isp-client-portal/android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔐 Create Signed Release APK

For production/distribution, you need a signed APK:

### Step 1: Generate Keystore
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Answer the questions:
- Password: (choose a strong password)
- Name: Your name
- Organization: Your ISP name
- City, State, Country: Your location

This creates `my-release-key.keystore` file.

### Step 2: Configure Signing in Android Studio

1. **Build → Generate Signed Bundle / APK**
2. Select **APK**
3. Click **Create new...**
4. Browse to your keystore file
5. Enter passwords
6. Select **release** build variant
7. Click **Finish**

### Step 3: Get Signed APK
APK will be in: `android/app/release/app-release.apk`

---

## 🎨 Customize App

### Change App Name
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">Your ISP Name</string>
</resources>
```

### Change App Icon
Replace these files in `android/app/src/main/res/`:
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

Or use: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

### Change Package Name
Edit `capacitor.config.json`:
```json
{
  "appId": "com.yourisp.clientportal"
}
```

Then rebuild:
```bash
npx cap sync
```

---

## 📱 Test APK

### Method 1: Install on Connected Device
1. Enable USB Debugging on Android device
2. Connect via USB
3. In Android Studio: **Run → Run 'app'**

### Method 2: Install APK File
1. Copy APK to phone
2. Open APK file
3. Allow "Install from unknown sources"
4. Install

### Method 3: Use Emulator
1. Android Studio → **Tools → AVD Manager**
2. Create Virtual Device
3. Run app on emulator

---

## 🌐 Host APK for Download

Users can download and install the APK directly from your website.

### Option 1: Host on Your Server
1. Upload APK to your server
2. Create download link on your website
3. Users download and install

### Option 2: Use GitHub Releases
1. Create GitHub release
2. Upload APK as release asset
3. Share download link

### Option 3: Use File Hosting
- Google Drive (set to "Anyone with link")
- Dropbox
- Firebase Hosting
- Your own server

### Add Download Button to Website

Create a download page or add to your landing page:

```html
<a href="/downloads/isp-client-portal.apk" download>
  <button>Download Android App (APK)</button>
</a>
```

---

## 🔄 Update Workflow

When you make changes to your app:

```bash
# 1. Make changes to your React code
# 2. Build
npm run build

# 3. Sync to Android
npx cap sync

# 4. Open Android Studio
npx cap open android

# 5. Build new APK
# Build → Build APK
```

---

## 📊 APK Size Optimization

### Reduce APK Size:

1. **Enable ProGuard** (code minification)
   Edit `android/app/build.gradle`:
   ```gradle
   buildTypes {
       release {
           minifyEnabled true
           shrinkResources true
           proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
       }
   }
   ```

2. **Use App Bundle** instead of APK
   - Build → Generate Signed Bundle
   - Upload to Play Store
   - Google optimizes for each device

3. **Remove unused resources**
   ```bash
   npm run build -- --minify
   ```

---

## 🐛 Common Issues

### Issue 1: "SDK location not found"
**Solution:** Set ANDROID_HOME environment variable

### Issue 2: "Gradle sync failed"
**Solution:** 
- Android Studio → File → Invalidate Caches
- Restart Android Studio

### Issue 3: "Build failed: Java version"
**Solution:** Install JDK 11 or higher

### Issue 4: "APK not installing"
**Solution:** 
- Enable "Install from unknown sources"
- Check if old version is installed (uninstall first)

### Issue 5: "White screen on app open"
**Solution:**
- Check `capacitor.config.json` has correct `webDir: "dist"`
- Run `npm run build` before `npx cap sync`

---

## 📱 Distribution Options

### Option 1: Direct APK Download (Easiest)
- Host APK on your website
- Users download and install
- ✅ No fees
- ✅ Instant updates
- ❌ Users need to enable "unknown sources"

### Option 2: Google Play Store
- Upload to Play Console
- Users install from Play Store
- ✅ Trusted source
- ✅ Automatic updates
- ❌ $25 one-time fee
- ❌ Review process (1-3 days)

### Option 3: Alternative App Stores
- Amazon Appstore
- Samsung Galaxy Store
- APKPure, APKMirror (for distribution)

---

## 🎯 Quick Commands Reference

```bash
# Build web app
npm run build

# Add Android platform (first time only)
npx cap add android

# Sync changes to Android
npx cap sync

# Open in Android Studio
npx cap open android

# Full rebuild
npm run build && npx cap sync && npx cap open android
```

---

## 📋 Checklist

Before distributing your APK:

- [ ] App name customized
- [ ] App icon customized
- [ ] Package name changed (com.yourisp.clientportal)
- [ ] Tested on real device
- [ ] Signed with release keystore
- [ ] Push notifications working
- [ ] Offline mode working
- [ ] All features tested
- [ ] APK size optimized
- [ ] Version number updated

---

## 🚀 Next Steps

1. **Build debug APK** - Test on your device
2. **Customize branding** - App name, icon, colors
3. **Create release APK** - Sign with keystore
4. **Host for download** - Upload to your server
5. **Add download link** - On your website
6. **Test with users** - Get feedback
7. **Iterate** - Make improvements

---

## 💡 Pro Tips

- **Keep your keystore safe!** - You can't update your app without it
- **Test on multiple devices** - Different screen sizes, Android versions
- **Monitor APK size** - Keep it under 50MB for easy downloads
- **Version your APKs** - Use semantic versioning (1.0.0, 1.0.1, etc.)
- **Provide both options** - Web app AND APK download

---

## Need Help?

Common resources:
- Capacitor Docs: https://capacitorjs.com/docs
- Android Studio Guide: https://developer.android.com/studio/intro
- Stack Overflow: Search for specific errors

Your APK is ready to build! Follow the steps above and you'll have a downloadable Android app! 🎉

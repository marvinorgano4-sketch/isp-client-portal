# ISP Client Portal - Web + APK

Your client portal now supports **BOTH** web access and native Android APK!

---

## 🎯 What You Have

✅ **Web App (PWA)** - Browser-based, installable, auto-updates
✅ **Android APK** - Native app, downloadable, offline-first
✅ **Same Codebase** - One app, two deployment methods
✅ **Download Page** - Let users choose their preferred method

---

## 🚀 Quick Start

### For Web Deployment (Already Working):
```bash
npm run build
vercel --prod
```
Done! Users access via browser.

### For APK Build (New):

**Easy Way:**
```bash
# Double-click this file:
build-apk.bat
```

**Manual Way:**
```bash
npm run build
npx cap sync
npx cap open android
# Then build APK in Android Studio
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `BUILD_APK_GUIDE.md` | Complete APK build instructions |
| `DUAL_DEPLOYMENT.md` | How to offer both web + APK |
| `QUICK_START.md` | PWA installation guide |
| `PWA_TESTING_GUIDE.md` | Debug PWA issues |
| `APK_GUIDE.md` | APK options overview |
| `build-apk.bat` | Automated build script |

---

## 📱 User Options

### Option 1: Web App (Recommended)
- **Access:** https://your-portal.vercel.app
- **Install:** Optional (PWA from browser)
- **Updates:** Automatic
- **Size:** ~2-5 MB cached
- **Best for:** Most users

### Option 2: Android APK
- **Access:** Download from your website
- **Install:** Required (APK file)
- **Updates:** Manual download
- **Size:** ~15-25 MB
- **Best for:** Users who prefer native apps

---

## 🛠️ Prerequisites for APK Build

1. **Android Studio** - https://developer.android.com/studio
2. **Java JDK 11+** - https://adoptium.net/
3. **Node.js** - Already installed ✅
4. **Capacitor** - Already installed ✅

---

## 📦 Build Process

### First Time Setup:
```bash
# 1. Add Android platform
npx cap add android

# 2. Customize app
# Edit: capacitor.config.json
# Change: appId, appName

# 3. Build
npm run build
npx cap sync
npx cap open android
```

### Subsequent Builds:
```bash
# Just run the script:
build-apk.bat
```

---

## 🎨 Customization

### Change App Name:
Edit `capacitor.config.json`:
```json
{
  "appName": "Your ISP Name"
}
```

### Change Package ID:
Edit `capacitor.config.json`:
```json
{
  "appId": "com.yourisp.clientportal"
}
```

### Change App Icon:
Replace files in:
```
android/app/src/main/res/mipmap-*/ic_launcher.png
```

Or use: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

---

## 📍 APK Location

After building in Android Studio:

**Debug APK (for testing):**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK (for distribution):**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🌐 Hosting APK

### Option 1: Your Server
```bash
# Upload APK to:
/downloads/isp-client-portal.apk

# Link:
https://yourisp.com/downloads/isp-client-portal.apk
```

### Option 2: GitHub Releases
1. Create release on GitHub
2. Upload APK as asset
3. Share download link

### Option 3: Google Drive
1. Upload APK
2. Set to "Anyone with link"
3. Share link

---

## 📄 Download Page

Use the provided template:
```
isp-landing/download.html
```

Features:
- ✅ Web app link
- ✅ APK download button
- ✅ Installation instructions
- ✅ Comparison guide
- ✅ Mobile-responsive

Update URLs and deploy to your website.

---

## 🔄 Update Workflow

### Web App Updates:
```bash
npm run build
vercel --prod
```
✅ Users get updates automatically

### APK Updates:
```bash
npm run build
npx cap sync
npx cap open android
# Build new APK
# Upload to server
```
⚠️ Users must download and install manually

---

## ✅ Testing Checklist

### Web App:
- [ ] Deployed to Vercel
- [ ] HTTPS working
- [ ] Login working
- [ ] All features working
- [ ] PWA installable
- [ ] Push notifications working
- [ ] Offline mode working

### APK:
- [ ] Built successfully
- [ ] Installed on device
- [ ] Login working
- [ ] All features working
- [ ] Push notifications working
- [ ] Offline mode working
- [ ] App icon correct
- [ ] App name correct

---

## 🐛 Troubleshooting

### "SDK location not found"
Set ANDROID_HOME environment variable

### "Gradle sync failed"
File → Invalidate Caches → Restart

### "Build failed"
Check Java version: `java -version` (need 11+)

### "White screen on app open"
Run `npm run build` before `npx cap sync`

### More help:
See `BUILD_APK_GUIDE.md` for detailed troubleshooting

---

## 📊 Comparison

| Aspect | Web App | APK |
|--------|---------|-----|
| Setup | ✅ Easy | ⚠️ Moderate |
| Distribution | ✅ URL only | ⚠️ File needed |
| Updates | ✅ Automatic | ❌ Manual |
| Installation | ✅ Optional | ⚠️ Required |
| Trust | ✅ HTTPS | ⚠️ "Unknown sources" |
| Offline | ⚠️ Limited | ✅ Full |
| Size | ✅ Small | ⚠️ Larger |

**Recommendation:** Offer both, recommend web app

---

## 🎯 Next Steps

1. **Read** `BUILD_APK_GUIDE.md` for detailed instructions
2. **Install** Android Studio and Java JDK
3. **Run** `build-apk.bat` to build your first APK
4. **Test** APK on your Android device
5. **Customize** app name, icon, and branding
6. **Host** APK on your server
7. **Deploy** download page
8. **Announce** to your users

---

## 💡 Pro Tips

- Start with web app (easier)
- Build APK when you have time
- Offer both options to users
- Most users will prefer web app
- APK is great for power users
- Keep both versions updated
- Monitor which option is more popular

---

## 📞 Support

Need help?
- Check documentation files
- Search for errors on Stack Overflow
- Capacitor docs: https://capacitorjs.com/docs
- Android Studio guide: https://developer.android.com/studio

---

## 🎉 You're Ready!

You now have everything you need to:
- ✅ Deploy web app (already done)
- ✅ Build Android APK (follow guide)
- ✅ Offer both options to users
- ✅ Maintain and update both versions

Good luck! 🚀

@echo off
echo ========================================
echo ISP Client Portal - APK Builder
echo ========================================
echo.

echo [1/5] Checking if Android platform exists...
if not exist "android" (
    echo Android platform not found. Adding...
    call npx cap add android
    if %errorlevel% neq 0 (
        echo ERROR: Failed to add Android platform!
        pause
        exit /b %errorlevel%
    )
    echo ✓ Android platform added
) else (
    echo ✓ Android platform already exists
)
echo.

echo [2/5] Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b %errorlevel%
)
echo ✓ Web app built successfully
echo.

echo [3/5] Syncing to Android...
call npx cap sync
if %errorlevel% neq 0 (
    echo ERROR: Sync failed!
    pause
    exit /b %errorlevel%
)
echo ✓ Synced to Android
echo.

echo [4/5] Opening Android Studio...
call npx cap open android
echo ✓ Android Studio opened
echo.

echo [5/5] Next steps:
echo ========================================
echo IMPORTANT: Notification permissions have been added!
echo.
echo 1. Wait for Gradle sync to complete (bottom status bar)
echo 2. Click: Build → Build Bundle(s) / APK(s) → Build APK(s)
echo 3. Wait for build to complete (2-5 minutes)
echo 4. Click "locate" in the notification
echo 5. APK is in: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 6. UNINSTALL old version first!
echo 7. Install new APK
echo 8. Test notifications - should work now!
echo ========================================
echo.
echo TIP: If Gradle sync fails, try:
echo - File → Invalidate Caches → Restart
echo - Or close Android Studio and run this script again
echo.
pause

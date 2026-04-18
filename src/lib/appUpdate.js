// App Update Checker for APK
// Checks if a new version is available and prompts user to update

const CURRENT_VERSION = '1.0.0' // Update this when you release new version
const UPDATE_CHECK_URL = 'https://yourisp.com/api/app-version.json' // Your server endpoint

export async function checkForUpdate() {
  try {
    // Only check if running as installed app (not in browser)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (!isStandalone) return null

    // Check last update check time (don't check too often)
    const lastCheck = localStorage.getItem('last_update_check')
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    if (lastCheck && (now - parseInt(lastCheck)) < oneDay) {
      return null // Checked recently, skip
    }

    // Fetch latest version from server
    const response = await fetch(UPDATE_CHECK_URL)
    if (!response.ok) return null

    const data = await response.json()
    const latestVersion = data.version
    const downloadUrl = data.downloadUrl

    // Save last check time
    localStorage.setItem('last_update_check', now.toString())

    // Compare versions
    if (isNewerVersion(latestVersion, CURRENT_VERSION)) {
      return {
        currentVersion: CURRENT_VERSION,
        latestVersion,
        downloadUrl,
        releaseNotes: data.releaseNotes || 'Bug fixes and improvements',
      }
    }

    return null // No update available
  } catch (error) {
    console.error('Update check failed:', error)
    return null
  }
}

function isNewerVersion(latest, current) {
  const latestParts = latest.split('.').map(Number)
  const currentParts = current.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if (latestParts[i] > currentParts[i]) return true
    if (latestParts[i] < currentParts[i]) return false
  }

  return false
}

export function getCurrentVersion() {
  return CURRENT_VERSION
}

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showAndroidBanner, setShowAndroidBanner] = useState(false)
  const [showIOSBanner, setShowIOSBanner] = useState(false)

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isStandalone = (window.navigator as Record<string, unknown>)['standalone'] === true
  const isIOSNonSafari =
    isIOS && !isStandalone && !/^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  useEffect(() => {
    if (localStorage.getItem('ml_install_dismissed')) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowAndroidBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    if (isIOS && !isStandalone && !isIOSNonSafari) {
      setShowIOSBanner(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [isIOS, isStandalone, isIOSNonSafari])

  const installAndroid = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowAndroidBanner(false)
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    localStorage.setItem('ml_install_dismissed', '1')
    setShowAndroidBanner(false)
    setShowIOSBanner(false)
  }

  return { showAndroidBanner, showIOSBanner, isIOSNonSafari, installAndroid, dismiss }
}

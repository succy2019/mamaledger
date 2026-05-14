import { useInstallPWA } from '../hooks/useInstallPWA'

export default function InstallBanner() {
  const { showAndroidBanner, showIOSBanner, isIOSNonSafari, installAndroid, dismiss } = useInstallPWA()

  if (isIOSNonSafari) {
    return (
      <div className="fixed top-14 left-0 w-full z-50 px-5 pt-2">
        <div
          className="rounded-2xl flex items-start gap-3 shadow-lg"
          style={{ background: '#ffdad6', padding: '14px 16px' }}
        >
          <span className="material-symbols-outlined mt-0.5" style={{ color: '#93000a', fontSize: '22px' }}>warning</span>
          <div className="flex-1">
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', fontWeight: 700, color: '#93000a' }}>
              Open in Safari for voice recording
            </p>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#410002', marginTop: '4px' }}>
              MamaLedger's voice feature requires Safari on iOS. Please open this page in Safari.
            </p>
          </div>
          <button onClick={dismiss} className="active:scale-95">
            <span className="material-symbols-outlined" style={{ color: '#93000a', fontSize: '20px' }}>close</span>
          </button>
        </div>
      </div>
    )
  }

  if (showAndroidBanner) {
    return (
      <div className="fixed bottom-24 left-0 w-full z-50 px-5">
        <div
          className="rounded-2xl flex items-center gap-3"
          style={{ background: '#1b5e20', padding: '14px 16px', boxShadow: '0 4px 20px rgba(0,69,13,0.35)' }}
        >
          <span
            className="material-symbols-outlined text-[32px] flex-shrink-0"
            style={{ color: '#acf4a4', fontVariationSettings: "'FILL' 1" }}
          >
            install_mobile
          </span>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
              Install MamaLedger
            </p>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '12px', color: '#90d689', marginTop: '2px' }}>
              Add to home screen for offline access
            </p>
          </div>
          <button
            onClick={installAndroid}
            className="active:scale-95 transition-transform"
            style={{ background: '#fcab28', color: '#694300', borderRadius: '9999px', padding: '8px 16px', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            Install
          </button>
          <button onClick={dismiss} className="active:scale-95 ml-1">
            <span className="material-symbols-outlined" style={{ color: '#90d689', fontSize: '20px' }}>close</span>
          </button>
        </div>
      </div>
    )
  }

  if (showIOSBanner) {
    return (
      <div className="fixed bottom-24 left-0 w-full z-50 px-5">
        <div
          className="rounded-2xl"
          style={{ background: '#1b5e20', padding: '16px', boxShadow: '0 4px 20px rgba(0,69,13,0.35)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ color: '#acf4a4', fontVariationSettings: "'FILL' 1" }}
            >
              install_mobile
            </span>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 700, color: '#ffffff', flex: 1 }}>
              Install MamaLedger
            </p>
            <button onClick={dismiss} className="active:scale-95">
              <span className="material-symbols-outlined" style={{ color: '#90d689', fontSize: '20px' }}>close</span>
            </button>
          </div>
          <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', color: '#c8f0c4', lineHeight: '20px' }}>
            Tap the <strong style={{ color: '#ffffff' }}>Share ⬆</strong> button in Safari, then tap{' '}
            <strong style={{ color: '#ffffff' }}>"Add to Home Screen"</strong> to install.
          </p>
        </div>
      </div>
    )
  }

  return null
}

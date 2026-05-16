import { useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import { clearToken } from '../lib/api'

const PROFILE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDFoWTmktrq7LUJhnyssPhqWClHNHfzLhOjvcRY4VD0LaPErv9bXg7gQg2kM4Exxd8goBzoJd8w3y1-4Qfl6VBy0xoilVZBvQAqX3HwjPcf3kNpaCfyiaokWhkvdZ0RJggARLWU6cCCpcZrNkJU9W5ITclkjz533LXluVlXb05YtpkC8j1XQ6DZc0thR2O4lULvbngccELilHI9kLbhQ_h1w-u6g8QPetbc3gDUhTV-zGYy5R-NlWc758vhRqmorOyv7fsnqudKzvs'

export default function SettingsPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearToken()
    navigate('/welcome', { replace: true })
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f9f9f9', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <TopAppBar title="Settings" />

      <main style={{ padding: '24px 20px' }}>
        {/* Profile card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '9999px', overflow: 'hidden', border: '3px solid #acf4a4', flexShrink: 0 }}>
            <img src={PROFILE_IMG} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '18px', fontWeight: 700, color: '#1a1c1c' }}>My Account</p>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', color: '#717a6d', marginTop: '2px' }}>Market Trader</p>
          </div>
        </div>

        {/* Options list */}
        <div style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
          {/* Divider row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: '1px solid #eeeeee' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '9999px', background: '#eeeeee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ color: '#00450d', fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>notifications</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 700, color: '#1a1c1c' }}>Notifications</p>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#717a6d' }}>Daily sales reminders</p>
            </div>
            <span className="material-symbols-outlined" style={{ color: '#c0c9bb', fontSize: '20px' }}>chevron_right</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '9999px', background: '#eeeeee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ color: '#00450d', fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>language</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 700, color: '#1a1c1c' }}>Language</p>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#717a6d' }}>English / Pidgin</p>
            </div>
            <span className="material-symbols-outlined" style={{ color: '#c0c9bb', fontSize: '20px' }}>chevron_right</span>
          </div>
        </div>

        {/* Logout */}
        <div style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <button
            onClick={handleLogout}
            className="active:scale-95 transition-transform"
            style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '9999px', background: '#ffdad6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '22px' }}>logout</span>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 700, color: '#ba1a1a' }}>Logout</p>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#717a6d' }}>Sign out of your account</p>
            </div>
            <span className="material-symbols-outlined" style={{ color: '#c0c9bb', fontSize: '20px' }}>chevron_right</span>
          </button>
        </div>

        {/* App info */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '22px', fontWeight: 800, color: '#00450d' }}>MamaLedger</p>
          <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#c0c9bb', marginTop: '4px' }}>Version 1.0.0 · Offline-first</p>
        </div>
      </main>

      <BottomNav active="settings" />
    </div>
  )
}

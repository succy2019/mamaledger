import { useNavigate } from 'react-router-dom'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

const PROFILE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDFoWTmktrq7LUJhnyssPhqWClHNHfzLhOjvcRY4VD0LaPErv9bXg7gQg2kM4Exxd8goBzoJd8w3y1-4Qfl6VBy0xoilVZBvQAqX3HwjPcf3kNpaCfyiaokWhkvdZ0RJggARLWU6cCCpcZrNkJU9W5ITclkjz533LXluVlXb05YtpkC8j1XQ6DZc0thR2O4lULvbngccELilHI9kLbhQ_h1w-u6g8QPetbc3gDUhTV-zGYy5R-NlWc758vhRqmorOyv7fsnqudKzvs'

interface TopAppBarProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export default function TopAppBar({ title = 'MamaLedger', showBack, onBack }: TopAppBarProps) {
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()

  return (
    <header
      className="flex justify-between items-center w-full px-5 sticky top-0 z-50 bg-surface shadow-sm"
      style={{ height: '56px' }}
    >
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            onClick={onBack ?? (() => navigate(-1))}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
        ) : (
          <>
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ color: isOnline ? '#00450d' : '#ba1a1a' }}
            >
              {isOnline ? 'signal_wifi_4_bar' : 'signal_wifi_off'}
            </span>
            {!isOnline && (
              <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[12px] font-bold">
                Offline
              </span>
            )}
          </>
        )}
      </div>

      <h1 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '22px', fontWeight: 800, color: '#00450d', letterSpacing: '-0.01em' }}>
        {title}
      </h1>

      <button
        onClick={() => navigate('/settings')}
        style={{ width: '40px', height: '40px', borderRadius: '9999px', overflow: 'hidden', border: '2px solid #acf4a4', padding: 0, cursor: 'pointer', flexShrink: 0 }}
      >
        <img
          src={PROFILE_IMG}
          alt="Profile"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </button>
    </header>
  )
}

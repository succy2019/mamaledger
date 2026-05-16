import { useNavigate } from 'react-router-dom'
import { isLoggedIn } from '../lib/api'

const HINT_CHIPS = [
  { icon: 'translate', label: 'English' },
  { icon: 'translate', label: 'Pidgin' },
  { icon: 'translate', label: 'Hausa' },
  { icon: 'translate', label: 'Igbo' },
  { icon: 'translate', label: 'Yoruba' },
]

const VOICE_CHIPS = [
  '"Sell 3 bags of rice 1500"',
  '"Customer pay 2k"',
  '"Buy supply 10000"',
]

export default function WelcomeScreen() {
  const navigate = useNavigate()

  const handleStart = () => {
    if (isLoggedIn()) {
      navigate('/home')
    } else {
      navigate('/auth/login')
    }
  }

  return (
    <div
      style={{ minHeight: '100dvh', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}
    >
      {/* Illustration area */}
      <div
        className="relative overflow-hidden mx-5 mt-5 rounded-xl shadow-sm"
        style={{ aspectRatio: '1 / 1', background: '#f3f3f3' }}
      >
        {/* Market woman illustration */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXZpVZFQq6gQmz-WOhSoZNfASXL8PADZno2u_dxqEnM6yXeSn4C7GTAsHEtcVCUFnkRSkfgO1ILmlqQubNQl96Ds6Ml4KxoDU9hacxavBrup12oz7qJuQBI5sMB3gm26upvsY4Y9A03eM_l-LNSR8wRpQixCLswcMINhxYLNMbhNSkIfbGQdW7INrvH66GTFtXVnFgNvTbbWFiDy4DdmMnmHyrOtab4rEloTvxHq03N2Eeul38Wo8l6jt9Sz6Xr5OaIbqs3AvSsP0"
          alt="Nigerian Market Woman Illustration"
          style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.9 }}
        />
        {/* Background accent blurs */}
        <div
          className="absolute pointer-events-none"
          style={{ top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '9999px', background: 'rgba(255,221,181,0.5)', filter: 'blur(48px)' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ bottom: '-40px', left: '-40px', width: '192px', height: '192px', borderRadius: '9999px', background: 'rgba(172,244,164,0.4)', filter: 'blur(48px)' }}
        />
        {/* Floating chips */}
        <div
          className="absolute flex items-center gap-2"
          style={{ top: '16px', left: '16px', background: 'rgba(0,69,13,0.75)', borderRadius: '9999px', padding: '6px 12px', backdropFilter: 'blur(4px)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#fcab28', fontVariationSettings: "'FILL' 1" }}>mic</span>
          <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>Voice Entry</span>
        </div>
        <div
          className="absolute flex items-center gap-2"
          style={{ bottom: '16px', right: '16px', background: 'rgba(0,69,13,0.75)', borderRadius: '9999px', padding: '6px 12px', backdropFilter: 'blur(4px)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#acf4a4', fontVariationSettings: "'FILL' 1" }}>wifi_off</span>
          <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>Works Offline</span>
        </div>
      </div>

      {/* Bottom content */}
      <div style={{ flex: 1, padding: '24px 20px 24px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '28px', fontWeight: 800, color: '#1a1c1c', letterSpacing: '-0.01em', marginBottom: '10px' }}>
          Welcome to MamaLedger
        </h1>
        <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '20px', fontWeight: 700, color: '#00450d', lineHeight: '26px', marginBottom: '6px' }}>
          "Speak am, he go enter book"
        </p>
        <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', color: '#717a6d', lineHeight: '20px', marginBottom: '20px' }}>
          No writing, no stress — just talk and it saves.
        </p>

        {/* Language chips */}
        <div className="flex gap-2 flex-wrap mb-5">
          {HINT_CHIPS.map(c => (
            <button
              key={c.label}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '34px', padding: '0 12px', background: '#eeeeee', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: 600, color: '#41493e' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Voice example chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
          {VOICE_CHIPS.map(chip => (
            <button
              key={chip}
              style={{ flexShrink: 0, height: '38px', padding: '0 14px', background: '#f3f3f3', borderRadius: '9999px', border: '1px solid #c0c9bb', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#41493e', whiteSpace: 'nowrap' }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="active:scale-95 transition-transform"
          style={{ width: '100%', height: '56px', background: '#00450d', color: '#ffffff', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(0,69,13,0.3)' }}
        >
          Get Started
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>arrow_forward</span>
        </button>

        <p
          onClick={() => navigate('/auth/register')}
          style={{ textAlign: 'center', marginTop: '14px', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', color: '#717a6d', cursor: 'pointer' }}
        >
          New user?{' '}
          <span style={{ color: '#00450d', fontWeight: 700 }}>Create account</span>
        </p>
      </div>
    </div>
  )
}

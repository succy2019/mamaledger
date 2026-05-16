import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn } from '../lib/api'

const SLIDES = [
  {
    subtitle: '"Speak am, e go enter book"',
    label: 'Setting up your shop...',
    progress: '33%',
  },
  {
    subtitle: '"Track sales with your voice"',
    label: 'Loading your market...',
    progress: '66%',
  },
  {
    subtitle: '"Know your money, grow your business"',
    label: 'Almost ready...',
    progress: '100%',
  },
]

export default function SplashScreen() {
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide(prev => {
        if (prev >= SLIDES.length - 1) {
          clearInterval(timer)
          setTimeout(() => navigate(isLoggedIn() ? '/home' : '/welcome', { replace: true }), 500)
          return prev
        }
        return prev + 1
      })
    }, 1200)
    return () => clearInterval(timer)
  }, [navigate])

  const { subtitle, label, progress } = SLIDES[slide]

  return (
    <main
      className="relative flex flex-col items-center justify-between overflow-hidden"
      style={{ minHeight: '100dvh', background: '#1b5e20', padding: '0 20px' }}
    >
      {/* Glow blobs */}
      <div
        className="absolute pointer-events-none"
        style={{ top: '-80px', left: '-80px', width: '280px', height: '280px', borderRadius: '9999px', background: 'rgba(172,244,164,0.08)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute pointer-events-none"
        style={{ bottom: '-100px', right: '-80px', width: '320px', height: '320px', borderRadius: '9999px', background: 'rgba(252,171,40,0.07)', filter: 'blur(80px)' }}
      />

      {/* Center content */}
      <div className="flex-grow flex flex-col items-center justify-center text-center" style={{ paddingTop: '60px' }}>
        {/* Logo orb */}
        <div
          className="flex items-center justify-center mb-8"
          style={{ width: '128px', height: '128px', borderRadius: '9999px', background: '#00450d', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '64px', color: '#acf4a4', fontVariationSettings: "'FILL' 1" }}
          >
            mic
          </span>
        </div>

        <h1
          style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '12px' }}
        >
          MamaLedger
        </h1>

        <p
          key={subtitle}
          style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '20px', fontWeight: 600, color: '#91d78a', fontStyle: 'italic', maxWidth: '260px', lineHeight: '28px', transition: 'opacity 0.4s' }}
        >
          {subtitle}
        </p>
      </div>

      {/* Market silhouette placeholder */}
      <div className="w-full flex justify-around items-end" style={{ height: '100px', opacity: 0.25, marginBottom: '16px' }}>
        <div style={{ width: '56px', height: '64px', background: '#acf4a4', borderRadius: '8px 8px 0 0' }} />
        <div style={{ width: '40px', height: '48px', background: '#acf4a4', borderRadius: '50% 50% 0 0' }} />
        <div style={{ width: '72px', height: '80px', background: '#91d78a', borderRadius: '6px 6px 0 0' }} />
        <div style={{ width: '48px', height: '56px', background: '#acf4a4', borderRadius: '50% 50% 0 0' }} />
        <div style={{ width: '32px', height: '44px', background: '#91d78a', borderRadius: '8px 8px 0 0' }} />
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: '240px', marginBottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '100%', height: '6px', background: 'rgba(172,244,164,0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{ height: '100%', width: progress, background: '#fcab28', borderRadius: '9999px', boxShadow: '0 0 12px rgba(252,171,40,0.5)', transition: 'width 0.7s ease-out' }}
          />
        </div>
        <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: 'rgba(172,244,164,0.7)' }}>
          {label}
        </p>
      </div>
    </main>
  )
}

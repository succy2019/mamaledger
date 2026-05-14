import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken } from '../../lib/api'

type Step = 'phone' | 'pin'

export default function Login() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    if (step === 'pin') pinRefs[0].current?.focus()
  }, [step])

  const handlePinInput = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...pin]
    next[idx] = val
    setPin(next)
    if (val && idx < 3) pinRefs[idx + 1].current?.focus()
    // auto-submit when 4th digit entered
    if (idx === 3 && val) {
      const filled = [...pin.slice(0, 3), val]
      if (filled.every(d => d)) handleLogin(filled.join(''))
    }
  }

  const handlePinKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      const next = [...pin]
      next[idx - 1] = ''
      setPin(next)
      pinRefs[idx - 1].current?.focus()
    }
  }

  const handlePhoneNext = () => {
    setError('')
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10 || cleaned.length > 11) {
      setError('Enter a valid Nigerian phone number')
      return
    }
    setStep('pin')
  }

  const handleLogin = async (pinStr?: string) => {
    const code = pinStr ?? pin.join('')
    if (code.length < 4) {
      setError('Enter your 4-digit PIN')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { token } = await api.login(phone, code)
      setToken(token)
      navigate('/home', { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid phone or PIN')
      setPin(['', '', '', ''])
      pinRefs[0].current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'max(884px, 100dvh)', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '0 20px', height: '56px', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <button
          onClick={() => (step === 'phone' ? navigate('/welcome') : setStep('phone'))}
          className="active:scale-95"
        >
          <span className="material-symbols-outlined" style={{ color: '#1a1c1c', fontSize: '24px' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '20px', fontWeight: 800, color: '#00450d', flex: 1, textAlign: 'center', marginRight: '24px' }}>
          Welcome Back
        </h1>
      </header>

      <div style={{ flex: 1, padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div style={{ width: '72px', height: '72px', borderRadius: '9999px', background: '#00450d', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,69,13,0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#acf4a4', fontVariationSettings: "'FILL' 1" }}>mic</span>
          </div>
        </div>

        {step === 'phone' && (
          <>
            <h2 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '26px', fontWeight: 800, color: '#1a1c1c', marginBottom: '6px', textAlign: 'center' }}>
              Your phone number
            </h2>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#717a6d', marginBottom: '32px', textAlign: 'center' }}>
              Enter the number you registered with
            </p>
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #c0c9bb', borderRadius: '12px', overflow: 'hidden', background: '#ffffff', marginBottom: '24px' }}>
              <span style={{ padding: '0 14px', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px', fontWeight: 600, color: '#41493e', borderRight: '1px solid #c0c9bb' }}>+234</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="08012345678"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handlePhoneNext()}
                autoFocus
                style={{ flex: 1, padding: '16px 14px', fontSize: '17px', fontFamily: '"Plus Jakarta Sans", sans-serif', border: 'none', outline: 'none', background: 'transparent', color: '#1a1c1c' }}
              />
            </div>
          </>
        )}

        {step === 'pin' && (
          <>
            <h2 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '26px', fontWeight: 800, color: '#1a1c1c', marginBottom: '6px', textAlign: 'center' }}>
              Enter your PIN
            </h2>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#717a6d', marginBottom: '32px', textAlign: 'center' }}>
              {phone}
            </p>
            <div className="flex justify-center gap-4">
              {pin.map((v, i) => (
                <input
                  key={i}
                  ref={pinRefs[i]}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={v ? '●' : ''}
                  onChange={e => handlePinInput(i, e.target.value.replace('●', ''))}
                  onKeyDown={e => handlePinKeyDown(i, e)}
                  style={{ width: '64px', height: '72px', textAlign: 'center', fontSize: v ? '32px' : '14px', fontFamily: '"Be Vietnam Pro", sans-serif', fontWeight: 800, borderRadius: '12px', border: `2px solid ${v ? '#00450d' : '#c0c9bb'}`, background: v ? '#f0f9f0' : '#ffffff', color: '#1a1c1c', outline: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                />
              ))}
            </div>
          </>
        )}

        {error && (
          <div style={{ margin: '16px 0', padding: '12px 16px', background: '#ffdad6', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#93000a', fontSize: '20px' }}>error</span>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', color: '#93000a' }}>{error}</p>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => (step === 'phone' ? handlePhoneNext() : handleLogin())}
          disabled={loading}
          className="active:scale-95 transition-transform"
          style={{ width: '100%', height: '56px', background: loading ? '#717a6d' : '#00450d', color: '#ffffff', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(0,69,13,0.25)' }}
        >
          {loading ? 'Logging in...' : step === 'phone' ? 'Continue' : 'Log In'}
          {!loading && <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>}
        </button>

        <p
          onClick={() => navigate('/auth/register')}
          style={{ textAlign: 'center', marginTop: '16px', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', color: '#717a6d', cursor: 'pointer' }}
        >
          New to MamaLedger?{' '}
          <span style={{ color: '#00450d', fontWeight: 700 }}>Create account</span>
        </p>
      </div>
    </div>
  )
}

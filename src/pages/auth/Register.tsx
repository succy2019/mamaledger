import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken } from '../../lib/api'

type Step = 'phone' | 'pin' | 'confirm'

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const confirmRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  useEffect(() => {
    if (step === 'pin') pinRefs[0].current?.focus()
    if (step === 'confirm') confirmRefs[0].current?.focus()
  }, [step])

  const handlePinInput = (
    idx: number,
    val: string,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.RefObject<HTMLInputElement | null>[]
  ) => {
    if (!/^\d?$/.test(val)) return
    const next = [...arr]
    next[idx] = val
    setArr(next)
    if (val && idx < 3) refs[idx + 1].current?.focus()
  }

  const handlePinKeyDown = (
    idx: number,
    e: React.KeyboardEvent,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.RefObject<HTMLInputElement | null>[]
  ) => {
    if (e.key === 'Backspace' && !arr[idx] && idx > 0) {
      const next = [...arr]
      next[idx - 1] = ''
      setArr(next)
      refs[idx - 1].current?.focus()
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

  const handlePinNext = () => {
    setError('')
    if (pin.some(d => !d)) {
      setError('Enter all 4 digits')
      return
    }
    setStep('confirm')
  }

  const handleRegister = async () => {
    setError('')
    if (confirmPin.some(d => !d)) {
      setError('Enter all 4 digits')
      return
    }
    if (pin.join('') !== confirmPin.join('')) {
      setError('PINs do not match. Try again.')
      setConfirmPin(['', '', '', ''])
      confirmRefs[0].current?.focus()
      return
    }
    setLoading(true)
    try {
      const { token } = await api.register(phone, pin.join(''))
      setToken(token)
      navigate('/home', { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const PinInputRow = ({
    values,
    setValues,
    refs,
  }: {
    values: string[]
    setValues: React.Dispatch<React.SetStateAction<string[]>>
    refs: React.RefObject<HTMLInputElement | null>[]
  }) => (
    <div className="flex justify-center gap-4">
      {values.map((v, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => handlePinInput(i, e.target.value, values, setValues, refs)}
          onKeyDown={e => handlePinKeyDown(i, e, values, setValues, refs)}
          style={{
            width: '64px',
            height: '72px',
            textAlign: 'center',
            fontSize: '28px',
            fontFamily: '"Be Vietnam Pro", sans-serif',
            fontWeight: 800,
            borderRadius: '12px',
            border: `2px solid ${v ? '#00450d' : '#c0c9bb'}`,
            background: v ? '#f0f9f0' : '#ffffff',
            color: '#1a1c1c',
            outline: 'none',
            WebkitAppearance: 'none',
          }}
        />
      ))}
    </div>
  )

  return (
    <div style={{ minHeight: 'max(884px, 100dvh)', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '0 20px', height: '56px', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <button onClick={() => (step === 'phone' ? navigate('/welcome') : setStep(step === 'confirm' ? 'pin' : 'phone'))} className="active:scale-95">
          <span className="material-symbols-outlined" style={{ color: '#1a1c1c', fontSize: '24px' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '20px', fontWeight: 800, color: '#00450d', flex: 1, textAlign: 'center', marginRight: '24px' }}>
          Create Account
        </h1>
      </header>

      <div style={{ flex: 1, padding: '32px 20px 40px', display: 'flex', flexDirection: 'column' }}>
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {(['phone', 'pin', 'confirm'] as Step[]).map((s, i) => (
            <div
              key={s}
              style={{ height: '4px', borderRadius: '9999px', background: i <= ['phone', 'pin', 'confirm'].indexOf(step) ? '#00450d' : '#e2e2e2', flex: 1, maxWidth: '60px', transition: 'background 0.3s' }}
            />
          ))}
        </div>

        {step === 'phone' && (
          <>
            <h2 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '26px', fontWeight: 800, color: '#1a1c1c', marginBottom: '8px' }}>Your phone number</h2>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#717a6d', marginBottom: '32px' }}>
              We'll use this to secure your account
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
                style={{ flex: 1, padding: '16px 14px', fontSize: '17px', fontFamily: '"Plus Jakarta Sans", sans-serif', border: 'none', outline: 'none', background: 'transparent', color: '#1a1c1c' }}
              />
            </div>
          </>
        )}

        {step === 'pin' && (
          <>
            <h2 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '26px', fontWeight: 800, color: '#1a1c1c', marginBottom: '8px' }}>Create a 4-digit PIN</h2>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#717a6d', marginBottom: '32px' }}>
              You'll use this PIN to log in
            </p>
            <PinInputRow values={pin} setValues={setPin} refs={pinRefs} />
          </>
        )}

        {step === 'confirm' && (
          <>
            <h2 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '26px', fontWeight: 800, color: '#1a1c1c', marginBottom: '8px' }}>Confirm your PIN</h2>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#717a6d', marginBottom: '32px' }}>
              Enter the same PIN again
            </p>
            <PinInputRow values={confirmPin} setValues={setConfirmPin} refs={confirmRefs} />
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
          onClick={step === 'phone' ? handlePhoneNext : step === 'pin' ? handlePinNext : handleRegister}
          disabled={loading}
          className="active:scale-95 transition-transform"
          style={{ width: '100%', height: '56px', background: loading ? '#717a6d' : '#00450d', color: '#ffffff', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(0,69,13,0.25)' }}
        >
          {loading ? 'Creating account...' : step === 'confirm' ? 'Create Account' : 'Continue'}
          {!loading && <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>}
        </button>

        <p
          onClick={() => navigate('/auth/login')}
          style={{ textAlign: 'center', marginTop: '16px', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', color: '#717a6d', cursor: 'pointer' }}
        >
          Already have an account?{' '}
          <span style={{ color: '#00450d', fontWeight: 700 }}>Log in</span>
        </p>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import { parseVoiceInput } from '../lib/parser'

const WAVEFORM_HEIGHTS = ['60%', '40%', '85%', '100%', '55%', '30%', '75%', '90%', '45%', '20%']

const SUGGESTION_CHIPS = [
  '"Received 2k"',
  '"Customer pay 500"',
  '"Buy supply 10000"',
  '"Sell 3 bags rice 1500"',
  '"Expense 800 transport"',
]

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

export default function VoiceRecordingScreen() {
  const navigate = useNavigate()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
  }, [])

  const startRecording = useCallback(() => {
    setError('')
    setTranscript('')
    setSeconds(0)

    const SpeechRec =
      (window as Window).SpeechRecognition || (window as Window).webkitSpeechRecognition

    if (!SpeechRec) {
      setError('Voice recording not supported in this browser. Please use Chrome or Safari.')
      return
    }

    const rec = new SpeechRec()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-NG'

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) final += result[0].transcript
        else interim += result[0].transcript
      }
      setTranscript(final || interim)
    }

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== 'aborted') setError(`Mic error: ${e.error}`)
      stopRecording()
    }

    rec.onend = () => {
      if (isRecording) stopRecording()
    }

    recognitionRef.current = rec
    rec.start()
    setIsRecording(true)

    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }, [isRecording, stopRecording])

  useEffect(() => {
    startRecording()
    return () => {
      recognitionRef.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleSave = () => {
    if (!transcript.trim()) return
    const parsed = parseVoiceInput(transcript)
    navigate('/confirm', { state: { parsed, transcript } })
  }

  const handleChipTap = (chip: string) => {
    const clean = chip.replace(/^"|"$/g, '')
    setTranscript(clean)
  }

  return (
    <div
      className="bg-background text-on-background"
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}
    >
      <TopAppBar title="Voice Entry" />

      <main
        style={{ flex: 1, padding: '0 20px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingTop: '80px' }}
      >
        {/* Timer & Status */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', fontWeight: 700, color: '#717a6d', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {isRecording ? 'Recording...' : 'Tap mic to record'}
          </p>
          <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '40px', fontWeight: 800, color: '#1a1c1c', letterSpacing: '-0.02em', marginTop: '4px' }}>
            {formatTime(seconds)}
          </p>
        </div>

        {/* Mic & Waveform */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%' }}>
          {/* Pulsing Mic */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isRecording && (
              <div
                className="mic-pulse"
                style={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '9999px', background: '#fcab28', opacity: 0.2 }}
              />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className="active:scale-95 transition-transform"
              style={{ width: '128px', height: '128px', borderRadius: '9999px', background: '#fcab28', color: '#694300', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(252,171,40,0.45)', position: 'relative', zIndex: 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '64px', fontVariationSettings: "'FILL' 1" }}>
                {isRecording ? 'stop_circle' : 'mic'}
              </span>
            </button>
          </div>

          {/* Waveform */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '64px', gap: '4px', width: '100%', maxWidth: '280px' }}>
            {WAVEFORM_HEIGHTS.map((h, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: isRecording ? h : '20%',
                  background: '#00450d',
                  borderRadius: '9999px',
                  transition: 'height 0.15s ease',
                  animation: isRecording ? `waveBar 0.8s ease-in-out ${i * 80}ms infinite alternate` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Live Transcription Card */}
        <div
          style={{ width: '100%', background: '#ffffff', borderRadius: '16px', padding: '20px', borderLeft: '4px solid #fcab28', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', minHeight: '88px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#835400', fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '11px', fontWeight: 700, color: '#835400', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Live Transcription
            </p>
          </div>
            <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '18px', fontWeight: 600, lineHeight: '26px', fontStyle: transcript ? 'italic' : 'normal', color: transcript ? '#1a1c1c' : '#c0c9bb' }}>
            {transcript ? `"${transcript}"` : 'Start speaking...'}
          </p>
        </div>

        {error && (
          <div style={{ width: '100%', padding: '12px 16px', background: '#ffdad6', borderRadius: '10px', display: 'flex', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#93000a', fontSize: '18px', flexShrink: 0 }}>warning</span>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#93000a' }}>{error}</p>
          </div>
        )}

        {/* Cancel / Save */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
          <button
            onClick={() => navigate('/home')}
            className="active:scale-95 transition-transform"
            style={{ height: '56px', background: '#e2e2e2', color: '#41493e', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!transcript.trim()}
            className="active:scale-95 transition-transform"
            style={{ height: '56px', background: transcript.trim() ? '#00450d' : '#c0c9bb', color: '#ffffff', borderRadius: '12px', border: 'none', cursor: transcript.trim() ? 'pointer' : 'not-allowed', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: transcript.trim() ? '0 4px 12px rgba(0,69,13,0.25)' : 'none' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Save
          </button>
        </div>
      </main>

      {/* Suggestion chips */}
      <div
        className="no-scrollbar"
        style={{ position: 'fixed', bottom: '68px', left: 0, width: '100%', overflowX: 'auto', whiteSpace: 'nowrap', padding: '0 20px 8px', display: 'flex', gap: '8px' }}
      >
        {SUGGESTION_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => handleChipTap(chip)}
            className="active:scale-95 transition-transform"
            style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', height: '36px', padding: '0 14px', background: '#e8e8e8', borderRadius: '9999px', border: '1px solid #c0c9bb', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#41493e' }}
          >
            {chip}
          </button>
        ))}
      </div>

      <BottomNav active="add" />

      <style>{`
        @keyframes waveBar {
          from { opacity: 0.4; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

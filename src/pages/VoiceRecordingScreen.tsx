import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import { parseVoiceInput } from '../lib/parser'
import { transcribeAudio, parseTranscriptWithAI } from '../lib/api'
import { addEntry } from '../lib/db'

const WAVEFORM_HEIGHTS = ['60%', '40%', '85%', '100%', '55%', '30%', '75%', '90%', '45%', '20%']

const SUGGESTION_CHIPS = [
  '"Received 2k"',
  '"Customer pay 500"',
  '"Buy supply 10000"',
  '"Sell 3 bags rice 1500"',
  '"Expense 800 transport"',
]

type RecordingStatus =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'analyzing'
  | 'saving'
  | 'done'
  | 'error'

const STATUS_LABEL: Record<RecordingStatus, string> = {
  idle: 'Tap mic to record',
  recording: 'Recording...',
  transcribing: 'Transcribing audio...',
  analyzing: 'Analyzing with AI...',
  saving: 'Saving entry...',
  done: 'Saved!',
  error: 'Something went wrong',
}

export default function VoiceRecordingScreen() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isRecording = status === 'recording'
  const isProcessing = status === 'transcribing' || status === 'analyzing' || status === 'saving'
  const isDone = status === 'done'

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // â”€â”€ Step 3 & 4: Parse transcript with AI, fall back to local parser, save â”€â”€
  const processTranscript = async (text: string) => {
    setTranscript(text)
    setStatus('analyzing')

    let parsed: { item: string; quantity: number; price: number; type: 'sale' | 'credit' | 'expense' | 'stock' | 'payback'; customer?: string | null }
    try {
      parsed = await parseTranscriptWithAI(text)
    } catch {
      // Fallback: local regex parser when AI is unavailable
      const local = parseVoiceInput(text)
      parsed = { item: local.item, quantity: local.quantity, price: local.price, type: local.type, customer: local.customer }
    }

    setStatus('saving')
    try {
      await addEntry({
        item: (parsed.item || 'Item').slice(0, 200),
        quantity: Math.max(1, Math.round(Number(parsed.quantity) || 1)),
        price: Math.max(0, Number(parsed.price) || 0),
        type: parsed.type || 'sale',
        customer: parsed.customer ?? undefined,
        timestamp: Date.now(),
        synced: false,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry')
      setStatus('error')
      return
    }

    setStatus('done')
    setTimeout(() => navigate('/home', { replace: true }), 1500)
  }

  // â”€â”€ Step 2: Send audio blob to Whisper, then pass transcript onward â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const processAudio = async (audioBlob: Blob) => {
    setStatus('transcribing')
    let text = ''
    try {
      text = await transcribeAudio(audioBlob)
      if (!text.trim()) throw new Error('No speech detected. Please try again.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed')
      setStatus('error')
      return
    }
    await processTranscript(text)
  }

  // â”€â”€ Step 1: Capture audio with MediaRecorder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const startRecording = async () => {
    setError('')
    setTranscript('')
    setSeconds(0)

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone access denied. Allow microphone access and try again.')
      setStatus('error')
      return
    }

    streamRef.current = stream
    audioChunksRef.current = []

    const mimeType = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : ''

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream)

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop())
      const blob = new Blob(audioChunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      })
      void processAudio(blob)
    }

    mediaRecorderRef.current = recorder
    recorder.start(1000) // collect audio in 1-second chunks
    setStatus('recording')
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  // Auto-start recording when screen opens
  useEffect(() => {
    void startRecording()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMicClick = () => {
    if (isRecording) {
      setStatus('transcribing') // immediate visual feedback
      stopRecording()
    } else if (status === 'idle' || status === 'error') {
      void startRecording()
    }
  }

  // Tap a suggestion chip to skip recording and directly AI-parse that text
  const handleChipTap = (chip: string) => {
    if (isRecording) stopRecording()
    const text = chip.replace(/^"|"$/g, '')
    void processTranscript(text)
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
            {STATUS_LABEL[status]}
          </p>
          <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '40px', fontWeight: 800, color: '#1a1c1c', letterSpacing: '-0.02em', marginTop: '4px' }}>
            {isProcessing || isDone ? 'â€“â€“:â€“â€“' : formatTime(seconds)}
          </p>
        </div>

        {/* Mic / Processing / Done indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* Pulse ring â€” only while recording */}
            {isRecording && (
              <div
                className="mic-pulse"
                style={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '9999px', background: '#fcab28', opacity: 0.2 }}
              />
            )}

            {/* Processing spinner ring */}
            {isProcessing && (
              <div style={{ position: 'absolute', width: '148px', height: '148px', borderRadius: '9999px', border: '4px solid #e8f5e9', borderTopColor: '#00450d', animation: 'spinRing 0.9s linear infinite' }} />
            )}

            {/* Main button */}
            <button
              onClick={handleMicClick}
              disabled={isProcessing || isDone}
              className="active:scale-95 transition-transform"
              style={{
                width: '128px', height: '128px', borderRadius: '9999px',
                background: isDone ? '#00450d' : isProcessing ? '#e8f5e9' : '#fcab28',
                color: isDone ? '#ffffff' : isProcessing ? '#00450d' : '#694300',
                border: 'none',
                cursor: isProcessing || isDone ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isProcessing || isDone ? 'none' : '0 8px 32px rgba(252,171,40,0.45)',
                position: 'relative', zIndex: 1,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '64px', fontVariationSettings: "'FILL' 1" }}>
                {isDone ? 'check_circle' : isProcessing ? 'smart_toy' : isRecording ? 'stop_circle' : 'mic'}
              </span>
            </button>
          </div>

          {/* Waveform â€” hidden while processing/done */}
          {!isProcessing && !isDone && (
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
          )}

          {/* Processing progress steps */}
          {(isProcessing || isDone) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '280px' }}>
              {(['transcribing', 'analyzing', 'saving', 'done'] as RecordingStatus[]).map((step, i) => {
                const stepOrder = ['transcribing', 'analyzing', 'saving', 'done']
                const currentOrder = stepOrder.indexOf(status)
                const stepCompleted = i < currentOrder || isDone
                const stepActive = step === status
                const stepLabels = ['Transcribing audio', 'Analyzing with AI', 'Saving entry', 'Complete']
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: i > currentOrder ? 0.35 : 1 }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '9999px', flexShrink: 0,
                      background: stepCompleted ? '#00450d' : stepActive ? '#fcab28' : '#e2e8e2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {stepCompleted
                        ? <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fff', fontVariationSettings: "'FILL' 1" }}>check</span>
                        : stepActive
                          ? <div style={{ width: '10px', height: '10px', borderRadius: '9999px', background: '#694300' }} />
                          : <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: '#c0c9bb' }} />
                      }
                    </div>
                    <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: stepActive ? 700 : 500, color: stepActive ? '#1a1c1c' : '#717a6d' }}>
                      {stepLabels[i]}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Live Transcription Card */}
        <div
          style={{ width: '100%', background: '#ffffff', borderRadius: '16px', padding: '20px', borderLeft: `4px solid ${isDone ? '#00450d' : '#fcab28'}`, boxShadow: '0 4px 16px rgba(0,0,0,0.05)', minHeight: '88px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: isDone ? '#00450d' : '#835400', fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
              {isDone ? 'check_circle' : 'auto_awesome'}
            </span>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '11px', fontWeight: 700, color: isDone ? '#00450d' : '#835400', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isDone ? 'Entry Saved' : isProcessing ? 'AI Transcription' : 'Live Transcription'}
            </p>
          </div>
          <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '18px', fontWeight: 600, lineHeight: '26px', fontStyle: transcript ? 'italic' : 'normal', color: transcript ? '#1a1c1c' : '#c0c9bb' }}>
            {transcript
              ? `"${transcript}"`
              : isProcessing
                ? 'Processing...'
                : 'Start speaking...'}
          </p>
        </div>

        {error && (
          <div style={{ width: '100%', padding: '12px 16px', background: '#ffdad6', borderRadius: '10px', display: 'flex', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#93000a', fontSize: '18px', flexShrink: 0 }}>warning</span>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#93000a' }}>{error}</p>
          </div>
        )}

        {/* Cancel button â€” hidden while processing/done */}
        {!isProcessing && !isDone && (
          <div style={{ width: '100%' }}>
            <button
              onClick={() => navigate('/home')}
              className="active:scale-95 transition-transform"
              style={{ width: '100%', height: '56px', background: '#e2e2e2', color: '#41493e', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              Cancel
            </button>
          </div>
        )}
      </main>

      {/* Suggestion chips â€” hidden while processing/done */}
      {!isProcessing && !isDone && (
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
      )}

      <BottomNav active="add" />

      <style>{`
        @keyframes waveBar {
          from { opacity: 0.4; }
          to   { opacity: 1; }
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

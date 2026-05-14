import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const SplashScreen = lazy(() => import('./pages/SplashScreen'))
const WelcomeScreen = lazy(() => import('./pages/WelcomeScreen'))
const Register = lazy(() => import('./pages/auth/Register'))
const Login = lazy(() => import('./pages/auth/Login'))
const HomeDashboard = lazy(() => import('./pages/HomeDashboard'))
const VoiceRecordingScreen = lazy(() => import('./pages/VoiceRecordingScreen'))
const EntryConfirmationScreen = lazy(() => import('./pages/EntryConfirmationScreen'))
const ReportsScreen = lazy(() => import('./pages/ReportsScreen'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function Loader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-stack-sm">
        <span
          className="material-symbols-outlined text-primary text-[48px]"
          style={{ animation: 'spin 1s linear infinite' }}
        >
          refresh
        </span>
        <p className="font-label-lg text-label-lg text-on-surface-variant">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/record" element={<VoiceRecordingScreen />} />
        <Route path="/confirm" element={<EntryConfirmationScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

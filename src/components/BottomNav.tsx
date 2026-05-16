import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { key: 'home',     label: 'Home',     icon: 'home',      path: '/home' },
  { key: 'add',      label: 'Add',      icon: 'mic',       path: '/record' },
  { key: 'reports',  label: 'Reports',  icon: 'bar_chart', path: '/reports' },
  { key: 'settings', label: 'Settings', icon: 'settings',  path: '/settings' },
] as const

type TabKey = (typeof TABS)[number]['key']

interface BottomNavProps {
  active?: TabKey
}

export default function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const activeKey =
    active ??
    (/^\/confirm/.test(location.pathname)
      ? 'add'
      : TABS.find(t => t.path !== '/home' && location.pathname.startsWith(t.path))?.key ?? 'home')

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center bg-surface rounded-t-2xl"
      style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', paddingTop: '8px', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}
    >
      {TABS.map(tab => {
        const isActive = activeKey === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95"
            style={{
              padding: isActive ? '6px 20px' : '6px 12px',
              borderRadius: '9999px',
              background: isActive ? '#fcab28' : 'transparent',
              color: isActive ? '#694300' : '#717a6d',
              minWidth: '56px',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '24px',
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
            <span style={{ fontSize: '11px', fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, lineHeight: 1.2 }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

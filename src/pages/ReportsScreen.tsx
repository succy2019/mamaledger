import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import { db } from '../lib/db'

interface WeeklyStat {
  day: string
  amount: number
  isToday: boolean
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

async function getWeeklyStats(): Promise<WeeklyStat[]> {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Mon=0..Sun=6

  const stats: WeeklyStat[] = DAY_LABELS.map((day, i) => ({
    day,
    amount: 0,
    isToday: i === todayIdx,
  }))

  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const entries = await db.entries
    .where('timestamp')
    .aboveOrEqual(sevenDaysAgo.getTime())
    .toArray()

  for (const e of entries) {
    if (e.type !== 'sale' && e.type !== 'payback') continue
    const d = new Date(e.timestamp)
    const dow = d.getDay()
    const idx = dow === 0 ? 6 : dow - 1
    if (idx >= 0 && idx < 7) {
      stats[idx].amount += e.price * e.quantity
    }
  }
  return stats
}

async function getSummaries() {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfDay.getDate() - (startOfDay.getDay() === 0 ? 6 : startOfDay.getDay() - 1))

  const allEntries = await db.entries.toArray()

  const today = allEntries.filter(e => e.timestamp >= startOfDay.getTime())
  const week = allEntries.filter(e => e.timestamp >= startOfWeek.getTime())

  const sum = (arr: typeof allEntries, type: string) =>
    arr.filter(e => e.type === type).reduce((s, e) => s + e.price * e.quantity, 0)

  return {
    todayTotal: sum(today, 'sale') + sum(today, 'credit') + sum(today, 'payback'),
    weekTotal: sum(week, 'sale') + sum(week, 'credit') + sum(week, 'payback'),
    weekSalesCount: week.filter(e => e.type === 'sale' || e.type === 'payback').length,
    totalIn: sum(allEntries, 'sale') + sum(allEntries, 'payback'),
    totalOut: sum(allEntries, 'expense'),
  }
}

export default function ReportsScreen() {
  const navigate = useNavigate()
  const [weekly, setWeekly] = useState<WeeklyStat[]>(DAY_LABELS.map(d => ({ day: d, amount: 0, isToday: false })))
  const [summary, setSummary] = useState({ todayTotal: 0, weekTotal: 0, weekSalesCount: 0, totalIn: 0, totalOut: 0 })

  useEffect(() => {
    getWeeklyStats().then(setWeekly)
    getSummaries().then(setSummary)
  }, [])

  const maxAmount = Math.max(...weekly.map(w => w.amount), 1)
  const fmt = (n: number) => n >= 1000000 ? `₦${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n / 1000).toFixed(0)}k` : `₦${n.toLocaleString('en-NG')}`

  const handleShare = () => {
    const text = `📊 MamaLedger Report\n\nToday: ₦${summary.todayTotal.toLocaleString('en-NG')}\nThis Week: ₦${summary.weekTotal.toLocaleString('en-NG')}\nTotal Money In: ₦${summary.totalIn.toLocaleString('en-NG')}\nTotal Money Out: ₦${summary.totalOut.toLocaleString('en-NG')}\n\n_Shared via MamaLedger_`

    if (navigator.share) {
      navigator.share({ title: 'MamaLedger Report', text })
    } else {
      const encoded = encodeURIComponent(text)
      window.open(`https://wa.me/?text=${encoded}`, '_blank')
    }
  }

  return (
    <div
      className="bg-background text-on-background"
      style={{ minHeight: '100dvh', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
    >
      <TopAppBar />

      <main style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Summary Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          {/* Today */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px', borderLeft: '4px solid #00450d', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: 700, color: '#717a6d' }}>Today Money</p>
            <h2 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '28px', fontWeight: 800, color: '#1a1c1c', marginTop: '4px' }}>
              {fmt(summary.todayTotal)}
            </h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span style={{ background: '#ffddb5', color: '#2a1800', borderRadius: '9999px', padding: '4px 10px', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '12px', fontWeight: 700 }}>
                Today
              </span>
            </div>
          </div>

          {/* This Week */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px', borderLeft: '4px solid #fcab28', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: 700, color: '#717a6d' }}>This Week</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '4px' }}>
              <h2 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '28px', fontWeight: 800, color: '#1a1c1c' }}>
                {fmt(summary.weekTotal)}
              </h2>
              <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', fontWeight: 700, color: '#835400', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                +8%
              </span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <span style={{ background: '#ffddb5', color: '#2a1800', borderRadius: '9999px', padding: '4px 10px', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '12px', fontWeight: 700 }}>
                {summary.weekSalesCount} Sales
              </span>
            </div>
          </div>
        </section>

        {/* Weekly Bar Chart */}
        <section style={{ background: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '18px', fontWeight: 700, color: '#1a1c1c' }}>Sales Flow</h3>
            <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#717a6d' }}>Last 7 Days</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '192px', gap: '6px', padding: '0 4px' }}>
            {weekly.map(w => {
              const pct = Math.max((w.amount / maxAmount) * 100, w.amount > 0 ? 8 : 4)
              const isHighest = w.amount === maxAmount && w.amount > 0
              return (
                <div key={w.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${pct}%`,
                      background: w.isToday ? '#1b5e20' : isHighest ? '#fcab28' : '#e2e2e2',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease',
                    }}
                  />
                  <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '11px', fontWeight: w.isToday ? 800 : 600, color: w.isToday ? '#00450d' : '#717a6d' }}>
                    {w.day}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Business Health */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '12px', fontWeight: 700, color: '#717a6d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Business Health
          </h3>

          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '9999px', background: '#acf4a4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#00450d', fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              </div>
              <div>
                <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', color: '#717a6d' }}>Money In (Total)</p>
                <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '22px', fontWeight: 800, color: '#00450d' }}>{fmt(summary.totalIn)}</p>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ color: '#717a6d', fontSize: '20px' }}>chevron_right</span>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '9999px', background: '#ffdbcf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#6c2200', fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
              <div>
                <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', color: '#717a6d' }}>Money Out (Stock)</p>
                <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '22px', fontWeight: 800, color: '#6c2200' }}>{fmt(summary.totalOut)}</p>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ color: '#717a6d', fontSize: '20px' }}>chevron_right</span>
          </div>
        </section>

        {/* WhatsApp Share */}
        <button
          onClick={handleShare}
          className="active:scale-95 transition-transform"
          style={{ width: '100%', height: '56px', background: '#25D366', color: '#ffffff', borderRadius: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px', fontWeight: 700, boxShadow: '0 4px 16px rgba(37,211,102,0.35)', marginTop: '4px' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.414-8.412" />
          </svg>
          Share to WhatsApp
        </button>
      </main>

      <BottomNav active="reports" />
    </div>
  )
}

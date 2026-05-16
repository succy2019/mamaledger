import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import TransactionItem from '../components/TransactionItem'
import InstallBanner from '../components/InstallBanner'
import { getTodaySummary, getRecentEntries } from '../lib/db'
import type { LedgerEntry, DailySummary } from '../types'

const DEFAULT_SUMMARY: DailySummary = {
  totalSales: 0,
  totalExpenses: 0,
  totalCredit: 0,
  stockCount: 0,
  salesCount: 0,
}

export default function HomeDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [summary, setSummary] = useState<DailySummary>(DEFAULT_SUMMARY)
  const [entries, setEntries] = useState<LedgerEntry[]>([])

  useEffect(() => {
    getTodaySummary().then(setSummary)
    getRecentEntries(5).then(setEntries)
  }, [location.key])

  const fmt = (n: number) => n.toLocaleString('en-NG')

  return (
    <div
      className="bg-background text-on-background"
      style={{ minHeight: 'max(884px, 100dvh)', paddingBottom: '96px' }}
    >
      <TopAppBar />
      <InstallBanner />

      <main style={{ padding: '20px 20px 0' }}>
        {/* Hero: Today's Sales */}
        <section style={{ marginBottom: '24px' }}>
          <div
            className="relative overflow-hidden"
            style={{ background: '#00450d', borderRadius: '16px', padding: '20px', height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,69,13,0.3)' }}
          >
            {/* Decorative icon */}
            <div className="absolute" style={{ top: '-20px', right: '-20px', opacity: 0.1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '140px', color: '#ffffff', fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>

            <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Today's Sales
            </span>

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  ₦{fmt(summary.totalSales)}
                </span>
                <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', fontWeight: 600, color: '#91d78a' }}>Money enter</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Credit Owed - full width */}
          <div
            style={{ background: '#eeeeee', borderRadius: '12px', padding: '16px', gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: 700, color: '#717a6d', marginBottom: '4px' }}>Who dey owe you?</p>
              <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '26px', fontWeight: 800, color: '#ba1a1a' }}>₦{fmt(summary.totalCredit)}</p>
            </div>
            <div style={{ background: '#ffdad6', borderRadius: '9999px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '20px' }}>person_remove</span>
            </div>
          </div>

          {/* Expenses */}
          <div style={{ background: '#eeeeee', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span className="material-symbols-outlined" style={{ color: '#933100', fontSize: '22px', marginBottom: '8px', display: 'block' }}>shopping_cart_checkout</span>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: 700, color: '#717a6d' }}>Expenses</p>
            <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '22px', fontWeight: 800, color: '#1a1c1c', marginTop: '4px' }}>₦{fmt(summary.totalExpenses)}</p>
          </div>

          {/* Stock Count */}
          <div style={{ background: '#eeeeee', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span className="material-symbols-outlined" style={{ color: '#00450d', fontSize: '22px', marginBottom: '8px', display: 'block' }}>inventory_2</span>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: 700, color: '#717a6d' }}>Stock Count</p>
            <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '22px', fontWeight: 800, color: '#1a1c1c', marginTop: '4px' }}>{summary.stockCount} items</p>
          </div>
        </section>

        {/* Recent Transactions */}
        <section style={{ marginBottom: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '20px', fontWeight: 700, color: '#1a1c1c' }}>Recent Transactions</h2>
            <button
              onClick={() => navigate('/reports')}
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', fontWeight: 700, color: '#00450d', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              See All
            </button>
          </div>

          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #c0c9bb' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c0c9bb', display: 'block', marginBottom: '12px' }}>receipt_long</span>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#717a6d' }}>No transactions yet</p>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', color: '#c0c9bb', marginTop: '4px' }}>Tap the mic button to add your first entry</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {entries.map(e => (
                <TransactionItem key={e.id} entry={e} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Giant FAB mic button */}
      <div
        style={{ position: 'fixed', bottom: '88px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 45 }}
      >
        <button
          onClick={() => navigate('/record')}
          className="active:scale-90 transition-transform"
          style={{ width: '96px', height: '96px', borderRadius: '9999px', background: '#fcab28', color: '#694300', border: '4px solid #ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(252,171,40,0.5)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}>mic</span>
        </button>
        <span style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '22px', fontWeight: 600, color: '#1a1c1c', lineHeight: '28px', textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>Tap to talk</span>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

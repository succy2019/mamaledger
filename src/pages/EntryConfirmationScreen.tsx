import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import { addEntry } from '../lib/db'
import type { EntryType, ParsedEntry } from '../types'

const CATEGORIES = ['Food', 'Paint', 'Electronics', 'Fabric', 'Provision', 'Cosmetics', 'Other']

const ENTRY_TYPE_OPTIONS: { value: EntryType; label: string; color: string; bg: string; icon: string }[] = [
  { value: 'sale',    label: 'Sale',    color: '#00450d', bg: '#f0f9f0', icon: 'trending_up' },
  { value: 'credit',  label: 'Credit',  color: '#835400', bg: '#fff8ef', icon: 'receipt_long' },
  { value: 'expense', label: 'Expense', color: '#6c2200', bg: '#fff3ee', icon: 'local_shipping' },
  { value: 'stock',   label: 'Stock',   color: '#41493e', bg: '#f3f3f3', icon: 'inventory_2' },
]

const TYPE_ICON_MAP: Record<EntryType, string> = {
  sale: 'format_paint',
  credit: 'format_paint',
  expense: 'format_paint',
  stock: 'format_paint',
}

export default function EntryConfirmationScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const parsed: ParsedEntry = state?.parsed ?? {
    item: 'Unknown Item',
    quantity: 1,
    price: 0,
    type: 'sale' as EntryType,
    rawTranscript: '',
  }
  const rawTranscript: string = state?.transcript ?? ''

  const [item, setItem] = useState(parsed.item)
  const [quantity, setQuantity] = useState(String(parsed.quantity))
  const [price, setPrice] = useState(String(parsed.price))
  const [type, setType] = useState<EntryType>(parsed.type)
  const [category, setCategory] = useState('')
  const [editingField, setEditingField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const totalAmount = (Number(price) || 0) * (Number(quantity) || 1)
  const typeConfig = ENTRY_TYPE_OPTIONS.find(t => t.value === type) ?? ENTRY_TYPE_OPTIONS[0]

  const handleSave = async () => {
    setSaving(true)
    try {
      await addEntry({
        item: item.trim() || 'Item',
        quantity: Math.max(1, parseInt(quantity) || 1),
        price: Math.max(0, parseFloat(price) || 0),
        type,
        category: category || undefined,
        timestamp: Date.now(),
        synced: false,
      })
      navigate('/home', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  const Field = ({
    fieldKey,
    label,
    value,
    iconName,
    display,
    isEditing,
    editControl,
  }: {
    fieldKey: string
    label: string
    value: string
    iconName: string
    display?: React.ReactNode
    isEditing: boolean
    editControl?: React.ReactNode
  }) => (
    <>
      <div
        onClick={() => setEditingField(isEditing ? null : fieldKey)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', background: isEditing ? '#f3f3f3' : 'transparent', transition: 'background 0.15s' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '9999px', background: '#eeeeee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ color: '#00450d', fontSize: '24px' }}>{iconName}</span>
          </div>
          <div>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '12px', fontWeight: 700, color: '#717a6d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
            <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '17px', fontWeight: 600, color: '#1a1c1c', marginTop: '2px' }}>
              {display ?? value}
            </div>
          </div>
        </div>
        <span className="material-symbols-outlined" style={{ color: '#717a6d', fontSize: '20px' }}>
          {isEditing ? 'expand_less' : 'edit'}
        </span>
      </div>
      {isEditing && editControl && (
        <div style={{ paddingLeft: '60px', paddingBottom: '8px' }}>
          {editControl}
        </div>
      )}
      <hr style={{ border: 'none', borderTop: '1px solid #e2e2e2', margin: '0 8px' }} />
    </>
  )

  return (
    <div
      className="bg-background text-on-background"
      style={{ minHeight: 'max(884px, 100dvh)', paddingBottom: '96px' }}
    >
      <TopAppBar title="Confirm Entry" showBack onBack={() => navigate('/record')} />

      <main style={{ padding: '20px 20px 0' }}>
        {/* Header */}
        <section style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: '#fcab28', animation: 'pulse 1.5s infinite' }} />
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: 700, color: '#717a6d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Transcription Complete
            </p>
          </div>
          <h2 style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '22px', fontWeight: 800, color: '#1a1c1c', marginBottom: '6px' }}>
            Confirm Entry
          </h2>
          {rawTranscript && (
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#717a6d', fontStyle: 'italic', lineHeight: '22px' }}>
              "{rawTranscript}"
            </p>
          )}
        </section>

        {/* Editable Fields Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #e2e2e2', padding: '8px', marginBottom: '16px' }}>
          <Field
            fieldKey="item"
            label="Item"
            value={item}
            iconName="format_paint"
            isEditing={editingField === 'item'}
            editControl={
              <input
                autoFocus
                value={item}
                onChange={e => setItem(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #00450d', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#1a1c1c', outline: 'none', background: '#ffffff' }}
              />
            }
          />
          <Field
            fieldKey="qty"
            label="Quantity"
            value={quantity}
            iconName="production_quantity_limits"
            isEditing={editingField === 'qty'}
            editControl={
              <input
                autoFocus
                type="number"
                inputMode="numeric"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                style={{ width: '120px', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #00450d', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#1a1c1c', outline: 'none', background: '#ffffff' }}
              />
            }
          />
          <Field
            fieldKey="price"
            label="Price"
            value={price}
            iconName="payments"
            display={
              <span>
                <strong style={{ color: '#00450d' }}>₦{Number(price).toLocaleString('en-NG')}</strong>
                <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', fontWeight: 400, color: '#717a6d' }}> / unit</span>
              </span>
            }
            isEditing={editingField === 'price'}
            editControl={
              <input
                autoFocus
                type="number"
                inputMode="numeric"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                style={{ width: '160px', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #00450d', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#1a1c1c', outline: 'none', background: '#ffffff' }}
              />
            }
          />
          {/* Type selector */}
          <div
            onClick={() => setEditingField(editingField === 'type' ? null : 'type')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', background: editingField === 'type' ? '#f3f3f3' : 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '9999px', background: typeConfig.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: typeConfig.color, fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>{typeConfig.icon}</span>
              </div>
              <div>
                <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '12px', fontWeight: 700, color: '#717a6d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type</p>
                <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '17px', fontWeight: 700, color: typeConfig.color, marginTop: '2px' }}>{typeConfig.label}</p>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ color: '#717a6d', fontSize: '20px' }}>swap_horiz</span>
          </div>
          {editingField === 'type' && (
            <div style={{ display: 'flex', gap: '8px', paddingLeft: '8px', paddingBottom: '8px', flexWrap: 'wrap' }}>
              {ENTRY_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setType(opt.value); setEditingField(null) }}
                  style={{ padding: '8px 16px', borderRadius: '9999px', border: `2px solid ${type === opt.value ? opt.color : '#e2e2e2'}`, background: type === opt.value ? opt.bg : '#ffffff', color: opt.color, fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Chips */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px', fontWeight: 700, color: '#717a6d', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>Category</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(category === cat ? '' : cat)}
                style={{ padding: '8px 16px', borderRadius: '9999px', border: `2px solid ${category === cat ? '#00450d' : '#c0c9bb'}`, background: category === cat ? '#f0f9f0' : '#ffffff', color: category === cat ? '#00450d' : '#41493e', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Total summary */}
        <div style={{ background: '#f0f9f0', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', color: '#41493e', fontWeight: 600 }}>Total Amount</span>
          <span style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '22px', fontWeight: 800, color: '#00450d' }}>₦{totalAmount.toLocaleString('en-NG')}</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => navigate('/record')}
            style={{ height: '56px', background: '#e2e2e2', color: '#41493e', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 700 }}
          >
            Edit All
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="active:scale-95 transition-transform"
            style={{ height: '56px', background: saving ? '#717a6d' : '#00450d', color: '#ffffff', borderRadius: '12px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,69,13,0.25)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </main>

      <BottomNav active="add" />
    </div>
  )
}

import type { LedgerEntry } from '../types'

interface TransactionItemProps {
  entry: LedgerEntry
}

const TYPE_CONFIG = {
  sale: {
    borderColor: '#00450d',
    iconBg: '#acf4a4',
    iconColor: '#002203',
    icon: 'point_of_sale',
    label: 'Sale',
    amtColor: '#00450d',
    prefix: '+',
  },
  credit: {
    borderColor: '#835400',
    iconBg: '#ffddb5',
    iconColor: '#2a1800',
    icon: 'receipt_long',
    label: 'Credit',
    amtColor: '#835400',
    prefix: '~',
  },
  expense: {
    borderColor: '#6c2200',
    iconBg: '#ffdbcf',
    iconColor: '#380d00',
    icon: 'local_shipping',
    label: 'Expense',
    amtColor: '#6c2200',
    prefix: '-',
  },
  stock: {
    borderColor: '#717a6d',
    iconBg: '#e2e2e2',
    iconColor: '#1a1c1c',
    icon: 'inventory_2',
    label: 'Stock',
    amtColor: '#41493e',
    prefix: '',
  },
  payback: {
    borderColor: '#00639b',
    iconBg: '#c8e6ff',
    iconColor: '#001e2e',
    icon: 'handshake',
    label: 'Pay Back',
    amtColor: '#00639b',
    prefix: '+',
  },
}

export default function TransactionItem({ entry }: TransactionItemProps) {
  const cfg = TYPE_CONFIG[entry.type]
  const time = new Date(entry.timestamp).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const amount = (entry.price * entry.quantity).toLocaleString('en-NG')

  return (
    <div
      className="bg-surface-container-lowest flex items-center justify-between rounded-xl shadow-sm"
      style={{ padding: '14px 16px', borderLeft: `4px solid ${cfg.borderColor}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.iconBg }}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ color: cfg.iconColor, fontVariationSettings: "'FILL' 1" }}
          >
            {cfg.icon}
          </span>
        </div>
        <div>
          <p
            className="line-clamp-1"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px', fontWeight: 600, color: '#1a1c1c' }}
          >
            {entry.item}
          </p>
          <p style={{ fontSize: '12px', fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#717a6d', marginTop: '2px' }}>
            {time} · {cfg.label}
            {entry.customer ? ` · ${entry.customer}` : ''}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p style={{ fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '18px', fontWeight: 700, color: cfg.amtColor }}>
          {cfg.prefix}₦{amount}
        </p>
        {entry.quantity > 1 && (
          <p style={{ fontSize: '11px', color: '#717a6d', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            x{entry.quantity}
          </p>
        )}
      </div>
    </div>
  )
}

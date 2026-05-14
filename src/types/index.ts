export type EntryType = 'sale' | 'credit' | 'expense' | 'stock'

export interface LedgerEntry {
  id?: number
  item: string
  quantity: number
  price: number
  type: EntryType
  customer?: string
  category?: string
  note?: string
  timestamp: number
  synced: boolean
}

export interface DailySummary {
  totalSales: number
  totalExpenses: number
  totalCredit: number
  stockCount: number
  salesCount: number
}

export interface ParsedEntry {
  item: string
  quantity: number
  price: number
  type: EntryType
  customer?: string
  rawTranscript: string
}

export interface User {
  phone: string
  name?: string
  market?: string
  category?: string
}

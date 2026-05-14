import Dexie, { type EntityTable } from 'dexie'
import type { LedgerEntry } from '../types'

class MamaLedgerDB extends Dexie {
  entries!: EntityTable<LedgerEntry, 'id'>

  constructor() {
    super('MamaLedgerDB')
    this.version(1).stores({
      entries: '++id, type, timestamp, synced',
    })
  }
}

export const db = new MamaLedgerDB()

export async function getTodaySummary() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const entries = await db.entries
    .where('timestamp')
    .aboveOrEqual(startOfDay.getTime())
    .toArray()

  return {
    totalSales: entries
      .filter(e => e.type === 'sale')
      .reduce((sum, e) => sum + e.price * e.quantity, 0),
    totalExpenses: entries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.price * e.quantity, 0),
    totalCredit: entries
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.price * e.quantity, 0),
    stockCount: entries
      .filter(e => e.type === 'stock')
      .reduce((sum, e) => sum + e.quantity, 0),
    salesCount: entries.filter(e => e.type === 'sale').length,
  }
}

export async function getRecentEntries(limit = 10) {
  return db.entries.orderBy('timestamp').reverse().limit(limit).toArray()
}

export async function addEntry(entry: Omit<LedgerEntry, 'id'>) {
  return db.entries.add({ ...entry, synced: false })
}

export async function markSynced(ids: number[]) {
  return db.entries.where('id').anyOf(ids).modify({ synced: true })
}

export async function getUnsyncedEntries() {
  return db.entries.filter(e => !e.synced).toArray()
}

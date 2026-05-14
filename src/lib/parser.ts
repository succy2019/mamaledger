import type { ParsedEntry, EntryType } from '../types'

function extractPrice(text: string): number {
  // Match patterns like "₦15,000", "15000 naira", "15k", "15 thousand"
  const patterns = [
    /₦\s*(\d[\d,]*)/i,
    /(\d[\d,]*)\s*(?:naira|NGN)/i,
    /(\d+(?:\.\d+)?)\s*(?:thousand)/i,
    /(\d+(?:\.\d+)?)\s*k\b/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      let val = parseFloat(match[1].replace(/,/g, ''))
      if (/thousand|k\b/i.test(text.slice((match.index ?? 0) + match[1].length))) {
        val *= 1000
      }
      return val
    }
  }
  return 0
}

function extractQuantity(text: string): number {
  const match = text.match(
    /(\d+)\s+(?:pieces?|pcs?|units?|bags?|buckets?|plates?|cups?|dozens?|packs?|bottles?|cartons?|crates?|rolls?|yards?|meters?|litres?|kg|items?)/i
  )
  if (match) return parseInt(match[1], 10)

  // Fallback: number at start of phrase like "5 paint bucket"
  const fallback = text.match(/(\d+)\s+[a-z]/i)
  return fallback ? parseInt(fallback[1], 10) : 1
}

function extractType(text: string): EntryType {
  const lower = text.toLowerCase()
  if (/credit|owe|debt|borrow|pay.?later|on.?credit|owing/i.test(lower)) return 'credit'
  if (/expense|spent|spend|buy|bought|purchase|paid.?for|supply|restock|running.?cost/i.test(lower)) return 'expense'
  if (/stock|store|receive|inventory|new.?goods|got.?in/i.test(lower)) return 'stock'
  return 'sale'
}

function extractItem(text: string): string {
  // Remove price fragments
  let cleaned = text
    .replace(/₦\s*\d[\d,]*/gi, '')
    .replace(/\d[\d,]*\s*(?:naira|NGN|thousand|k\b)/gi, '')
    // Remove quantity fragments
    .replace(/\d+\s*(?:pieces?|pcs?|units?|bags?|buckets?|plates?|cups?|dozens?|packs?|bottles?|cartons?|crates?|rolls?|yards?|meters?|litres?|kg|items?)/gi, '')
    // Remove filler words
    .replace(/\b(i|just|sold|sell|bought|buy|received|got|for|at|each|per|and|the|a|an|of|to|from|by|on|credit|sale|expense|stock)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Extract first meaningful noun phrase (up to 4 words)
  const words = cleaned.split(' ').filter(Boolean).slice(0, 4)
  return words.join(' ') || 'Item'
}

function extractCustomer(text: string): string | undefined {
  const match = text.match(/(?:for|to|from|customer[:\s]+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
  return match?.[1]
}

export function parseVoiceInput(transcript: string): ParsedEntry {
  return {
    item: extractItem(transcript),
    quantity: extractQuantity(transcript),
    price: extractPrice(transcript),
    type: extractType(transcript),
    customer: extractCustomer(transcript),
    rawTranscript: transcript,
  }
}

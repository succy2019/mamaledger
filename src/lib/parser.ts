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

  // "credited me / us / my account" = someone paid us → money received → sale
  // "paid me", "pay me", "sent me", "gave me" = payment received → sale
  if (/credited?\s+(me|us|my|our)\b/i.test(lower)) return 'sale'
  if (/\b(paid|pay|sent|gave)\s+(me|us|my|our)\b/i.test(lower)) return 'sale'
  // "customer paid", "she paid", "he paid" without "for" (which would be an expense) → sale
  if (/\b(?:customer|she|he|they|nkechi|mama|oga|iya|baba|uncle|aunty|sister|brother)\s+paid\b/i.test(lower)) return 'sale'
  // "pay back", "paid back" = debt settlement → sale
  if (/paid?\s+back/i.test(lower)) return 'sale'

  // "sold/gave on credit", "owes", "debt", "borrow" = credit sale → customer owes us
  if (/\bon\s+credit\b|owe[sd]?\s+me|debt|borrow|pay.?later|owing/i.test(lower)) return 'credit'
  // "sold on credit" / standalone "credit" only when not "credited me"
  if (/\bcredit\b/i.test(lower)) return 'credit'

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
    .replace(/\b(i|me|us|my|our|just|sold|sell|bought|buy|received|got|credited?|paid?|back|gave|sent|for|at|each|per|and|the|a|an|of|to|from|by|on|credit|sale|expense|stock)\b/gi, ' ')
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

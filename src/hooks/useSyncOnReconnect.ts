import { useEffect, useRef } from 'react'
import { getUnsyncedEntries, markSynced } from '../lib/db'
import { api, isLoggedIn } from '../lib/api'

async function syncPending() {
  if (!isLoggedIn()) return
  const unsynced = await getUnsyncedEntries()
  if (unsynced.length === 0) return

  try {
    await api.syncEntries(unsynced)
    const ids = unsynced.map(e => e.id as number)
    await markSynced(ids)
  } catch {
    // Stay silent — will retry on next reconnect
  }
}

export function useSyncOnReconnect() {
  const syncing = useRef(false)

  const runSync = () => {
    if (syncing.current) return
    syncing.current = true
    syncPending().finally(() => {
      syncing.current = false
    })
  }

  useEffect(() => {
    // Sync any pending entries from previous offline sessions
    runSync()

    window.addEventListener('online', runSync)
    return () => window.removeEventListener('online', runSync)
  }, [])
}

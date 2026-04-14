import { useState, useEffect, useCallback } from 'react'

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

interface UpdateState {
  available: boolean
  version: string | null
  downloading: boolean
  error: string | null
}

export function useUpdater() {
  const [state, setState] = useState<UpdateState>({
    available: false,
    version: null,
    downloading: false,
    error: null,
  })

  useEffect(() => {
    if (!isTauri) return

    const check = async () => {
      try {
        const { check } = await import('@tauri-apps/plugin-updater')
        const update = await check()
        if (update?.available) {
          setState(s => ({ ...s, available: true, version: update.version }))
        }
      } catch (e) {
        // Silently ignore — update server may not be reachable
      }
    }

    // Check on startup after a short delay
    const t = setTimeout(check, 3000)
    // Re-check every 30 minutes
    const interval = setInterval(check, 30 * 60 * 1000)
    return () => { clearTimeout(t); clearInterval(interval) }
  }, [])

  const installUpdate = useCallback(async () => {
    if (!isTauri || !state.available) return
    setState(s => ({ ...s, downloading: true }))
    try {
      const { check } = await import('@tauri-apps/plugin-updater')
      const { relaunch } = await import('@tauri-apps/plugin-process')
      const update = await check()
      if (update?.available) {
        await update.downloadAndInstall()
        await relaunch()
      }
    } catch (e) {
      setState(s => ({ ...s, downloading: false, error: 'Update failed. Please try again.' }))
    }
  }, [state.available])

  return { ...state, installUpdate }
}

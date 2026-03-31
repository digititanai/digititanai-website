'use client'

import { useState, useEffect } from 'react'
import { loadAllCollections } from './collections'
import { refreshHomePageData } from './homePageData'

// Singleton — only one fetch happens no matter how many components call useData()
let globalLoaded = false
let globalPromise: Promise<void> | null = null

async function loadOnce() {
  if (globalLoaded) return
  if (globalPromise) return globalPromise

  globalPromise = (async () => {
    try {
      await Promise.all([loadAllCollections(), refreshHomePageData()])
    } catch {
      // Fail silently — components render with defaults
    }
    globalLoaded = true
    globalPromise = null
  })()

  return globalPromise
}

export function useData() {
  const [loaded, setLoaded] = useState(globalLoaded)

  useEffect(() => {
    if (globalLoaded) { setLoaded(true); return }
    let cancelled = false
    loadOnce().then(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [])

  return { loaded }
}

export function useDetailData(key: string) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { loadCollection } = await import('./collections')
        await loadCollection(key)
      } catch {}
      if (!cancelled) setLoaded(true)
    }
    load()
    return () => { cancelled = true }
  }, [key])

  return { loaded }
}

// Reset on navigation (for admin saves to reflect on frontend)
export function resetDataCache() {
  globalLoaded = false
  globalPromise = null
}

'use client'

import { useState, useEffect } from 'react'
import { loadAllCollections, setCache } from './collections'
import { refreshHomePageData, setHomeCache } from './homePageData'

let globalLoaded = false
let globalPromise: Promise<void> | null = null

// Read preloaded data from server-injected script tag (instant, no API call)
// Cached so multiple components don't re-parse the same JSON
let _preloadedCache: Record<string, unknown> | null = null
let _preloadedParsed = false

export function readPreloadedData(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  if (_preloadedParsed) return _preloadedCache
  _preloadedParsed = true
  try {
    const el = document.getElementById('preloaded-data')
    if (el?.textContent) {
      _preloadedCache = JSON.parse(el.textContent)
      return _preloadedCache
    }
  } catch {}
  return null
}

async function loadOnce() {
  if (globalLoaded) return
  if (globalPromise) return globalPromise

  globalPromise = (async () => {
    try {
      // Try preloaded data first (instant)
      const preloaded = readPreloadedData()
      if (preloaded && Object.keys(preloaded).length > 0) {
        // Populate caches directly — no API calls needed
        const collectionKeys = ['col_services', 'col_portfolio', 'col_blog', 'col_testimonials', 'col_categories_v2']
        for (const key of collectionKeys) {
          if (preloaded[key]) setCache(key, preloaded[key])
        }
        if (preloaded['sabbirahsan_home_page_data']) {
          setHomeCache(preloaded['sabbirahsan_home_page_data'] as Record<string, unknown>)
        }
        // Store other preloaded data for components that read them directly
        if (preloaded['page_content_header']) setCache('page_content_header', preloaded['page_content_header'])
        if (preloaded['page_content_footer']) setCache('page_content_footer', preloaded['page_content_footer'])
        if (preloaded['site_settings_v2']) setCache('site_settings_v2', preloaded['site_settings_v2'])
        if (preloaded['site_code_injection']) setCache('site_code_injection', preloaded['site_code_injection'])
      } else {
        // Fallback: fetch from API (slower)
        await Promise.all([loadAllCollections(), refreshHomePageData()])
      }
    } catch {
      // If preloaded fails, try API
      try { await Promise.all([loadAllCollections(), refreshHomePageData()]) } catch {}
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
      // Check preloaded data first
      const preloaded = readPreloadedData()
      if (preloaded?.[key]) {
        setCache(key, preloaded[key])
        if (!cancelled) setLoaded(true)
        return
      }
      // Fallback to API
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

export function resetDataCache() {
  globalLoaded = false
  globalPromise = null
}

'use client'

import { useEffect } from 'react'
import { readPreloadedData } from '@/lib/useData'

// Execute HTML containing <script> tags by parsing and appending them properly
function injectHTML(html: string, target: HTMLElement) {
  const container = document.createElement('div')
  container.innerHTML = html

  // Extract and execute scripts — innerHTML doesn't run <script> tags
  const scripts = container.querySelectorAll('script')
  scripts.forEach((oldScript) => {
    const newScript = document.createElement('script')
    // Copy all attributes (src, async, id, etc.)
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value)
    })
    // Copy inline script content
    if (oldScript.textContent) newScript.textContent = oldScript.textContent
    oldScript.remove()
    target.appendChild(newScript)
  })

  // Append remaining non-script elements (noscript, meta, link, etc.)
  while (container.firstChild) {
    target.appendChild(container.firstChild)
  }
}

function applySettings(settings: Record<string, Record<string, string>> | undefined) {
  if (!settings) return
  if (settings.general?.favicon) {
    const existing = document.querySelector('link[rel="icon"]')
    if (existing) existing.setAttribute('href', settings.general.favicon)
    else { const link = document.createElement('link'); link.rel = 'icon'; link.href = settings.general.favicon; document.head.appendChild(link) }
  }
  if (settings.seo?.metaTitle) document.title = settings.seo.metaTitle
  else if (settings.general?.siteTitle) document.title = settings.general.tagline ? `${settings.general.siteTitle} | ${settings.general.tagline}` : settings.general.siteTitle
  if (settings.seo?.metaDescription) { const m = document.querySelector('meta[name="description"]') as HTMLMetaElement; if (m) m.content = settings.seo.metaDescription }
  if (settings.seo?.ogImage) { let og = document.querySelector('meta[property="og:image"]') as HTMLMetaElement; if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:image'); document.head.appendChild(og) }; og.content = settings.seo.ogImage }
}

export function HeadCodeInjection() {
  useEffect(() => {
    const preloaded = readPreloadedData()
    if (preloaded) {
      const injection = preloaded.site_code_injection as Record<string, string> | undefined
      if (injection?.head) injectHTML(injection.head, document.head)
      applySettings(preloaded.site_settings_v2 as Record<string, Record<string, string>> | undefined)
      return
    }
    fetch('/api/data/site_code_injection', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => { if (data?.head) injectHTML(data.head, document.head) }).catch(() => {})
    fetch('/api/data/site_settings_v2', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => {
      if (!data) return
      applySettings(data)
    }).catch(() => {})
  }, [])

  return null
}

export function BodyCodeInjection() {
  useEffect(() => {
    const preloaded = readPreloadedData()
    if (preloaded) {
      const injection = preloaded.site_code_injection as Record<string, string> | undefined
      if (injection?.body) injectHTML(injection.body, document.body)
      return
    }
    fetch('/api/data/site_code_injection', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => { if (data?.body) injectHTML(data.body, document.body) }).catch(() => {})
  }, [])

  return null
}

'use client'

import { useEffect, useState } from 'react'
import { readPreloadedData } from '@/lib/useData'

export function HeadCodeInjection() {
  const [code, setCode] = useState('')

  useEffect(() => {
    const preloaded = readPreloadedData()
    if (preloaded) {
      const injection = preloaded.site_code_injection as Record<string, string> | undefined
      if (injection?.head) setCode(injection.head)
      const settings = preloaded.site_settings_v2 as Record<string, Record<string, string>> | undefined
      if (settings?.general?.favicon) {
        const existing = document.querySelector('link[rel="icon"]')
        if (existing) existing.setAttribute('href', settings.general.favicon)
        else { const link = document.createElement('link'); link.rel = 'icon'; link.href = settings.general.favicon; document.head.appendChild(link) }
      }
      if (settings?.seo?.metaTitle) document.title = settings.seo.metaTitle
      else if (settings?.general?.siteTitle) document.title = settings.general.tagline ? `${settings.general.siteTitle} | ${settings.general.tagline}` : settings.general.siteTitle
      if (settings?.seo?.metaDescription) { const m = document.querySelector('meta[name="description"]') as HTMLMetaElement; if (m) m.content = settings.seo.metaDescription }
      if (settings?.seo?.ogImage) { let og = document.querySelector('meta[property="og:image"]') as HTMLMetaElement; if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:image'); document.head.appendChild(og) }; og.content = settings.seo.ogImage }
      return
    }
    fetch('/api/data/site_code_injection', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => { if (data?.head) setCode(data.head) }).catch(() => {})
    fetch('/api/data/site_settings_v2', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => {
      if (!data) return
      if (data.general?.favicon) { const e = document.querySelector('link[rel="icon"]'); if (e) e.setAttribute('href', data.general.favicon) }
      if (data.seo?.metaTitle) document.title = data.seo.metaTitle
      else if (data.general?.siteTitle) document.title = data.general.tagline ? `${data.general.siteTitle} | ${data.general.tagline}` : data.general.siteTitle
    }).catch(() => {})
  }, [])

  if (!code) return null
  return <div dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />
}

export function BodyCodeInjection() {
  const [code, setCode] = useState('')

  useEffect(() => {
    const preloaded = readPreloadedData()
    if (preloaded) {
      const injection = preloaded.site_code_injection as Record<string, string> | undefined
      if (injection?.body) setCode(injection.body)
      return
    }
    fetch('/api/data/site_code_injection', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => { if (data?.body) setCode(data.body) }).catch(() => {})
  }, [])

  if (!code) return null
  return <div dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />
}

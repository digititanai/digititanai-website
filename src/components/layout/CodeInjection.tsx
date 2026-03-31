'use client'

import { useEffect, useState } from 'react'

export function HeadCodeInjection() {
  const [code, setCode] = useState('')

  useEffect(() => {
    // Load custom head code
    fetch('/api/data/site_code_injection', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.head) setCode(data.head) })
      .catch(() => {})

    // Load favicon + meta from settings
    fetch('/api/data/site_settings_v2', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        // Favicon
        if (data.general?.favicon) {
          const existing = document.querySelector('link[rel="icon"]')
          if (existing) existing.setAttribute('href', data.general.favicon)
          else {
            const link = document.createElement('link')
            link.rel = 'icon'
            link.href = data.general.favicon
            document.head.appendChild(link)
          }
        }
        // Meta title — use SEO title, or fallback to site title + tagline
        if (data.seo?.metaTitle) {
          document.title = data.seo.metaTitle
        } else if (data.general?.siteTitle) {
          document.title = data.general.tagline
            ? `${data.general.siteTitle} | ${data.general.tagline}`
            : data.general.siteTitle
        }
        // Meta description
        if (data.seo?.metaDescription) {
          let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement
          if (meta) meta.content = data.seo.metaDescription
        }
        // OG image
        if (data.seo?.ogImage) {
          let og = document.querySelector('meta[property="og:image"]') as HTMLMetaElement
          if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:image'); document.head.appendChild(og) }
          og.content = data.seo.ogImage
        }
      })
      .catch(() => {})
  }, [])

  if (!code) return null
  return <div dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />
}

export function BodyCodeInjection() {
  const [code, setCode] = useState('')

  useEffect(() => {
    fetch('/api/data/site_code_injection', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.body) setCode(data.body) })
      .catch(() => {})
  }, [])

  if (!code) return null
  return <div dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />
}

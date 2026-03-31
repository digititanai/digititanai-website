'use client'

import { useEffect, useState } from 'react'

interface ThemeSettings {
  primaryColor: string
  accentColor: string
  bgColor: string
  textColor: string
  surfaceColor: string
  headingFont: string
  bodyFont: string
  borderRadius: string
}

const defaults: ThemeSettings = {
  primaryColor: '#4B8A6C',
  accentColor: '#B89B4A',
  bgColor: '#071D16',
  textColor: '#E8DCC8',
  surfaceColor: '#0E2A20',
  headingFont: 'Sora',
  bodyFont: 'DM Sans',
  borderRadius: '12',
}

// Convert hex to RGB for CSS color-mix support
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r} ${g} ${b}`
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/data/site_settings_v2', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.appearance) return
        const t: ThemeSettings = { ...defaults, ...data.appearance }

        // Inject a <style> tag that overrides Tailwind's static colors
        const style = document.createElement('style')
        style.id = 'theme-overrides'
        // Remove old one if exists
        document.getElementById('theme-overrides')?.remove()

        style.textContent = `
          /* Theme color overrides */
          .bg-brand-darkest { background-color: ${t.bgColor} !important; }
          .bg-brand-gold { background-color: ${t.accentColor} !important; }
          .bg-brand-gold\\/90 { background-color: ${t.accentColor} !important; }
          .text-brand-gold { color: ${t.accentColor} !important; }
          .text-brand-cream { color: ${t.textColor} !important; }
          .text-brand-mid { color: ${t.primaryColor} !important; }
          .border-brand-gold { border-color: ${t.accentColor} !important; }
          .fill-brand-gold { fill: ${t.accentColor} !important; }
          .btn-primary { background-color: ${t.accentColor} !important; }
          .badge { background-color: color-mix(in srgb, ${t.primaryColor} 15%, transparent) !important; color: ${t.primaryColor} !important; border-color: color-mix(in srgb, ${t.primaryColor} 30%, transparent) !important; }

          /* Font overrides */
          .font-display, h1, h2, h3, .heading-lg, .heading-md, .heading-sm { font-family: "${t.headingFont}", system-ui, sans-serif !important; }
          .font-sans, body { font-family: "${t.bodyFont}", system-ui, sans-serif !important; }

          /* Border radius override */
          .rounded-2xl { border-radius: ${t.borderRadius}px !important; }
          .rounded-xl { border-radius: ${Math.max(0, parseInt(t.borderRadius) - 4)}px !important; }
          .rounded-lg { border-radius: ${Math.max(0, parseInt(t.borderRadius) - 8)}px !important; }
        `
        document.head.appendChild(style)

        // Load Google Fonts
        const fonts = new Set([t.headingFont, t.bodyFont])
        fonts.forEach(font => {
          if (font && !['DM Sans', 'Sora', 'Inter'].includes(font)) {
            const href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`
            if (!document.querySelector(`link[href="${href}"]`)) {
              const link = document.createElement('link')
              link.href = href
              link.rel = 'stylesheet'
              document.head.appendChild(link)
            }
          }
        })
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  return <>{children}</>
}

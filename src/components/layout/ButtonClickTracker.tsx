'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

function getButtonName(el: HTMLElement): string | null {
  // Get text content from the button/link itself
  const text = el.innerText?.trim()
  if (text) return text

  // Fallback: check aria-label or title
  return el.getAttribute('aria-label') || el.getAttribute('title') || null
}

// Only track CTA buttons — not nav links, filters, toggles, etc.
const CTA_SELECTORS = [
  '.btn-primary',
  '.btn-secondary',
  '.btn-ghost',
  '[data-track-click]',
]

function findCTAParent(el: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = el
  while (current) {
    for (const sel of CTA_SELECTORS) {
      if (current.matches(sel)) return current
    }
    current = current.parentElement
  }
  return null
}

export default function ButtonClickTracker() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || []

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const cta = findCTAParent(target)
      if (!cta) return
      if (cta.hasAttribute('data-track-ignore')) return

      const buttonName = getButtonName(cta)
      if (!buttonName) return

      window.dataLayer.push({
        event: 'web_button_click',
        button_name: buttonName,
        page_url: window.location.href,
      })
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}

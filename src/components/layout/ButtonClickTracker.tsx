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

function findClickableParent(el: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = el
  while (current) {
    const tag = current.tagName
    if (tag === 'BUTTON' || tag === 'A') return current
    if (current.getAttribute('role') === 'button') return current
    current = current.parentElement
  }
  return null
}

export default function ButtonClickTracker() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || []

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const clickable = findClickableParent(target)
      if (!clickable) return

      const buttonName = getButtonName(clickable)
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

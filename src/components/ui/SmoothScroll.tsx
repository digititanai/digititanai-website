'use client'

import { useEffect, useState } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Disable smooth scroll on touch/mobile devices — causes jank and blinking
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    const lenis = new Lenis({
      duration: 0.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => { lenis.destroy() }
  }, [])

  return <>{children}</>
}

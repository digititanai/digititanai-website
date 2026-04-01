'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'

const MotionReadyContext = createContext(false)
export const useMotionReady = () => useContext(MotionReadyContext)

export default function MotionReady({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Small delay to let the page paint with visible content first
    requestAnimationFrame(() => setReady(true))
  }, [])

  return (
    <MotionReadyContext.Provider value={ready}>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion={ready ? 'never' : 'always'}>
          {children}
        </MotionConfig>
      </LazyMotion>
    </MotionReadyContext.Provider>
  )
}

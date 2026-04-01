'use client'

import { useData } from '@/lib/useData'

export default function DataLoader({ children }: { children: React.ReactNode }) {
  // Trigger data loading but never block rendering
  useData()
  return <>{children}</>
}

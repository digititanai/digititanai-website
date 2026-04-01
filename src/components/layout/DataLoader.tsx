'use client'

import { useData } from '@/lib/useData'

export default function DataLoader({ children }: { children: React.ReactNode }) {
  const { loaded } = useData()

  return (
    <div
      className="transition-opacity duration-300"
      style={{ opacity: loaded ? 1 : 0 }}
    >
      {children}
    </div>
  )
}

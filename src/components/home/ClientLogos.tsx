'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { loadHomePageData, defaultHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'

export default function ClientLogos() {
  const { loaded } = useData()
  const [data, setData] = useState(defaultHomePageData.clientLogos)
  useEffect(() => { if (loaded) loadHomePageData().then(d => setData(d.clientLogos)) }, [loaded])

  return (
    <section className="py-14 relative overflow-hidden" suppressHydrationWarning>
      <motion.p
        className="text-center text-[11px] font-mono text-brand-cream/30 uppercase tracking-[0.25em] mb-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {data.label}
      </motion.p>

      {/* Marquee — full width, no container constraint */}
      <div className="relative w-full overflow-hidden">
        <div className="flex w-max animate-marquee">
          {/* First set */}
          {data.clients.map((name) => (
            <div key={`a-${name}`} className="mx-3 shrink-0 px-6 py-2.5 rounded-full border border-surface-300/50 bg-surface-200/30">
              <span className="text-[13px] font-display font-medium text-brand-cream/45 whitespace-nowrap tracking-wide">{name}</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {data.clients.map((name) => (
            <div key={`b-${name}`} className="mx-3 shrink-0 px-6 py-2.5 rounded-full border border-surface-300/50 bg-surface-200/30">
              <span className="text-[13px] font-display font-medium text-brand-cream/45 whitespace-nowrap tracking-wide">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

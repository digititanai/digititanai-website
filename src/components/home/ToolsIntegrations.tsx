'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TiltCard from '@/components/ui/TiltCard'
import { loadHomePageData, getHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'

export default function ToolsIntegrations() {
  const { loaded } = useData()
  const [tData, setTData] = useState(() => getHomePageData().tools)
  useEffect(() => { if (loaded) loadHomePageData().then(d => setTData(d.tools)) }, [loaded])

  return (
    <section className="py-28 relative overflow-hidden" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="badge">{tData.badge}</span>
          <h2 className="text-4xl sm:text-5xl font-display font-bold mt-4">
            {tData.heading.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="gradient-text">{tData.heading.split(' ').slice(-1).join(' ')}</span>
          </h2>
          <p className="mt-5 text-lg text-brand-cream-dark max-w-2xl mx-auto">
            {tData.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tData.tools.map((tool, i) => {
            const Icon = getIcon(tool.icon)
            return (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 30, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <TiltCard tiltAmount={10}>
                  <div className="p-5 rounded-xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-500 text-center group relative overflow-hidden h-full">
                    <div className="absolute inset-0 card-shine pointer-events-none" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-brand-mid/8 border border-brand-mid/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-mid/15 group-hover:border-brand-mid/25 transition-all duration-500">
                        <Icon className="w-5 h-5 text-brand-mid" />
                      </div>
                      <div className="text-sm font-display font-semibold text-brand-cream">{tool.name}</div>
                      <div className="text-[10px] font-mono text-surface-400 uppercase tracking-wider mt-1">{tool.category}</div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

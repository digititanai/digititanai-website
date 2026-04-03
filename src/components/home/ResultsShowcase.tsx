'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { loadHomePageData, defaultHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'

export default function ResultsShowcase() {
  const { loaded } = useData()
  const [rData, setRData] = useState(defaultHomePageData.results)
  useEffect(() => { if (loaded) loadHomePageData().then(d => setRData(d.results)) }, [loaded])

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
          <span className="badge">{rData.badge}</span>
          <h2 className="text-4xl sm:text-5xl font-display font-bold mt-4">
            {rData.heading.split(' ').slice(0, -2).join(' ')}{' '}
            <span className="gradient-text">{rData.heading.split(' ').slice(-2).join(' ')}</span>
          </h2>
          <p className="mt-5 text-lg text-brand-cream-dark max-w-2xl mx-auto">
            {rData.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rData.results.map((item, i) => (
            <motion.div
              key={item.metric}
              className="rounded-2xl bg-surface-200 border border-surface-300 p-6 hover:border-brand-mid/20 transition-all duration-500 group relative overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ scale: 1.02, boxShadow: '0 15px 50px rgba(6,182,212,0.06)' }}
            >
              <div className="absolute inset-0 card-shine pointer-events-none" />
              <div className="relative z-10">
                <div className="text-xs font-mono text-surface-400 uppercase tracking-wider mb-4">{item.metric}</div>
                <div className="flex items-end justify-between gap-4">
                  {/* Before */}
                  <div>
                    <div className="text-[10px] font-mono text-red-400/60 uppercase tracking-wider mb-1">Before</div>
                    <div className="text-xl font-display font-bold text-surface-400 line-through decoration-red-400/30">{item.before}</div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-1 pb-1">
                    <motion.div
                      className="w-8 h-[1px] bg-gradient-to-r from-red-400/30 to-brand-mid/60"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      style={{ originX: 0 }}
                    />
                    <ArrowUp className="w-3 h-3 text-brand-mid" />
                  </div>

                  {/* After */}
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-brand-mid/80 uppercase tracking-wider mb-1">After</div>
                    <div className="text-xl font-display font-bold text-brand-cream">{item.after}</div>
                  </div>
                </div>

                {/* Improvement badge */}
                <div className="mt-4 pt-4 border-t border-surface-300/50 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-surface-400">Improvement</span>
                  <span className="text-sm font-mono font-bold text-brand-mid bg-brand-mid/10 px-2.5 py-1 rounded-full">{item.improvement}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

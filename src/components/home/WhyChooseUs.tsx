'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import TiltCard from '@/components/ui/TiltCard'
import { loadHomePageData, getHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'

export default function WhyChooseUs() {
  const { loaded } = useData()
  const [wData, setWData] = useState(() => getHomePageData().whyChooseUs)
  useEffect(() => { if (loaded) loadHomePageData().then(d => setWData(d.whyChooseUs)) }, [loaded])

  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rotateX = useTransform(scrollYProgress, [0, 0.3], [6, 0])

  return (
    <section ref={ref} className="py-28 relative overflow-hidden perspective-2000" suppressHydrationWarning>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-mid/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="badge">{wData.badge}</span>
          <h2 className="text-4xl sm:text-5xl font-display font-bold mt-4">
            {wData.heading.split(' ').slice(0, -2).join(' ')}{' '}
            <span className="gradient-text">{wData.heading.split(' ').slice(-2).join(' ')}</span>
          </h2>
          <p className="mt-5 text-lg text-brand-cream-dark max-w-2xl mx-auto">
            {wData.subtitle}
          </p>
        </motion.div>

        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" style={{ rotateX }}>
          {wData.reasons.map((r, i) => {
            const Icon = getIcon(r.icon)
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="h-full"
              >
                <TiltCard tiltAmount={8}>
                  <div className={`h-full p-7 rounded-2xl border transition-all duration-500 relative overflow-hidden ${r.highlight ? 'bg-brand-mid/[0.06] border-brand-mid/20' : 'bg-surface-200 border-surface-300 hover:border-brand-mid/15'}`}>
                    <div className="absolute inset-0 card-shine pointer-events-none" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center mb-5">
                        <Icon className="w-6 h-6 text-brand-mid" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-brand-cream mb-2">{r.title}</h3>
                      <p className="text-sm text-brand-cream-dark leading-relaxed">{r.description}</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

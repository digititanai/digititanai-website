'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { loadHomePageData, defaultHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'

export default function HowItWorksSection() {
  const { loaded } = useData()
  const [hData, setHData] = useState(defaultHomePageData.howItWorks)
  useEffect(() => { if (loaded) loadHomePageData().then(d => setHData(d.howItWorks)) }, [loaded])

  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const lineScaleX = useTransform(scrollYProgress, [0.1, 0.6], [0, 1])

  return (
    <section ref={sectionRef} className="py-28 relative overflow-hidden" suppressHydrationWarning>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-mid/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="badge">{hData.badge}</span>
          <h2 className="text-4xl sm:text-5xl font-display font-bold mt-4">
            {hData.heading.split(' ').slice(0, -2).join(' ')}{' '}
            <span className="gradient-text">{hData.heading.split(' ').slice(-2).join(' ')}</span>
          </h2>
          <p className="mt-5 text-lg text-brand-cream-dark max-w-xl mx-auto">
            {hData.subtitle}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-[16.66%] right-[16.66%] h-px bg-brand-mid/10 -translate-y-1/2 z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-mid/40 via-brand-mid to-brand-mid/40 origin-left"
              style={{ scaleX: lineScaleX }}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 relative z-10">
            {hData.steps.map((step, i) => {
              const StepIcon = getIcon(step.icon)
              const stepNum = String(i + 1).padStart(2, '0')
              return (
                <motion.div
                  key={stepNum}
                  className="relative group perspective-1000 h-full"
                  initial={{ opacity: 0, y: 60, rotateY: i === 0 ? -20 : i === 2 ? 20 : 0 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  <motion.div
                    className="relative p-8 rounded-2xl bg-gradient-to-b from-surface-200/80 to-surface-200 border border-brand-mid/10 hover:border-brand-mid/25 transition-all duration-500 h-full preserve-3d"
                    whileHover={{ rotateY: 5, scale: 1.02, boxShadow: '0 20px 60px rgba(6,182,212,0.08)' }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    {/* Step number watermark */}
                    <motion.span
                      className="absolute top-6 right-8 text-7xl font-display font-bold text-brand-mid/[0.05] leading-none select-none"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                    >
                      {stepNum}
                    </motion.span>

                    {/* Icon */}
                    <div className="relative mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center group-hover:bg-brand-mid/15 group-hover:border-brand-mid/25 transition-all duration-500">
                        <StepIcon className="w-7 h-7 text-brand-mid" />
                      </div>
                      <motion.div
                        className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-brand-mid flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                      >
                        <span className="text-[9px] font-bold text-brand-darkest">{i + 1}</span>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-display font-bold text-brand-cream mb-3">{step.title}</h3>
                    <p className="text-sm text-brand-cream-dark leading-relaxed">{step.description}</p>

                    {/* Arrow connector between cards */}
                    {i < hData.steps.length - 1 && (
                      <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-surface-200 border border-brand-mid/20 items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-brand-mid" />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

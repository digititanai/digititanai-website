'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTABanner() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1])

  return (
    <section ref={ref} className="py-20 relative overflow-hidden perspective-2000">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <motion.div className="absolute inset-0" style={{ y: bgY, background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 60%)' }} />

      <motion.div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ scale }}>
        <motion.div
          className="rounded-3xl border border-brand-mid/15 bg-gradient-to-b from-surface-200/80 to-surface-200/40 backdrop-blur-xl p-10 sm:p-14 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 card-shine pointer-events-none" />

          <div className="relative z-10">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-mid/10 border border-brand-mid/20 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-mid" />
              <span className="text-[11px] font-mono text-brand-mid uppercase tracking-wider">Limited Availability</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold">
              Ready to <span className="gradient-text">Scale Your Growth</span>?
            </h2>
            <p className="mt-5 text-lg text-brand-cream-dark max-w-xl mx-auto">
              Book a free 30-minute strategy call. We&apos;ll audit your current setup and show you exactly where the opportunities are.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link href="/book" className="btn-primary animate-magnetic-pulse gap-2.5">
                  Book Free Strategy Call
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link href="/contact" className="btn-secondary gap-2.5">
                  Send a Message
                </Link>
              </motion.div>
            </div>

            <p className="mt-6 text-xs text-surface-400">No commitment required. Spots are limited each month.</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

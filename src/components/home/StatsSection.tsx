'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { loadHomePageData, defaultHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = value / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span ref={ref} className="gradient-text font-display font-bold text-[36px] md:text-[44px] leading-none">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function StatsSection() {
  const { loaded } = useData()
  const [sData, setSData] = useState(defaultHomePageData.stats)
  useEffect(() => { if (loaded) loadHomePageData().then(d => setSData(d.stats)) }, [loaded])

  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -3])

  return (
    <section ref={ref} className="py-12 md:py-16 perspective-2000" suppressHydrationWarning>
      <div className="container-main">
        <motion.div
          className="relative rounded-3xl bg-surface-200 border border-brand-mid/15 p-8 md:p-12 overflow-hidden card-shine noise-overlay"
          style={{ y, rotateX, transformPerspective: 2000 }}
        >
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-y-8 lg:gap-y-0 lg:divide-x divide-surface-300">
            {sData.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={`text-center px-3 sm:px-4 ${i % 2 === 1 ? 'border-l border-surface-300 lg:border-l-0' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <div className="mt-2 text-[13px] sm:text-[14px] font-semibold text-brand-cream">{stat.label}</div>
                <div className="mt-1 text-[11px] sm:text-[12px] text-surface-400">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

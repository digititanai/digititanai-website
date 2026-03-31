'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { loadHomePageData, defaultHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'
import { getTestimonials, type TestimonialItem } from '@/lib/collections'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0, 1] } },
}

export default function TestimonialsSection() {
  const { loaded } = useData()
  const [header, setHeader] = useState(defaultHomePageData.testimonials)
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])

  useEffect(() => { (async () => {
    if (!loaded) return
    const freshHome = await loadHomePageData()
    const homeData = freshHome.testimonials
    setHeader(homeData)
    const allTestimonials = getTestimonials()
    const active = allTestimonials.filter((t: TestimonialItem) => t.active)
    const selected = homeData.testimonials
    if (selected && selected.length > 0) {
      const merged = selected.map((s: { id: string }) => active.find((t: TestimonialItem) => t.id === s.id)).filter((t): t is TestimonialItem => !!t)
      setTestimonials(merged.length > 0 ? merged : active)
    } else {
      setTestimonials(active)
    }
  })() }, [loaded])

  return (
    <section className="section-gap" suppressHydrationWarning>
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-14"
        >
          <span className="badge">{header.badge}</span>
          <h2 className="mt-5 heading-lg">{header.heading}</h2>
          <p className="mt-4 body-base max-w-lg mx-auto">
            {header.subtitle}
          </p>
        </motion.div>

        {/* 3-column grid */}
        <motion.div
          key={testimonials.length}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch"
          initial="hidden"
          animate={testimonials.length > 0 ? 'visible' : 'hidden'}
          variants={stagger}
        >
          {testimonials.map((t) => (
            <motion.div key={t.id} variants={fadeUp} className="h-full">
              <div className="card h-full p-5 md:p-7 flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= t.rating ? 'text-brand-gold fill-brand-gold' : 'text-brand-cream/15'}`} />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[15px] leading-[1.75] text-brand-cream/80 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-brand-mid/10">
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="w-11 h-11 rounded-full object-cover border border-brand-mid/20 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-brand-mid/15 border border-brand-mid/20 flex items-center justify-center shrink-0">
                      <span className="text-[13px] font-bold text-brand-mid">{t.initials}</span>
                    </div>
                  )}
                  <div>
                    <div className="text-[14px] font-semibold text-brand-cream">{t.name}</div>
                    <div className="text-[12px] text-brand-cream/50">{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

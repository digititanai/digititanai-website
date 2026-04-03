'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Star } from 'lucide-react'
import { loadHomePageData, getHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'
import { getTestimonials, type TestimonialItem } from '@/lib/collections'
import TiltCard from '@/components/ui/TiltCard'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 25, rotateX: -15 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0, 1] } },
}

export default function TestimonialsSection() {
  const { loaded } = useData()
  const [header, setHeader] = useState(() => getHomePageData().testimonials)
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -6])

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
    <section ref={sectionRef} className="section-gap perspective-2000" suppressHydrationWarning>
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="badge">{header.badge}</span>
          <h2 className="mt-5 heading-lg">
            {header.heading.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="gradient-text">{header.heading.split(' ').slice(-1)}</span>
          </h2>
          <p className="mt-4 body-base max-w-lg mx-auto">{header.subtitle}</p>
        </motion.div>

        {/* 3-column grid */}
        <motion.div
          key={testimonials.length}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch"
          style={{ rotateX, transformPerspective: 2000 }}
          initial="hidden"
          animate={testimonials.length > 0 ? 'visible' : 'hidden'}
          variants={stagger}
        >
          {testimonials.map((t) => (
            <motion.div key={t.id} variants={fadeUp} className="h-full">
              <TiltCard tiltAmount={8}>
                <div className="card glow-border card-shine h-full p-5 md:p-7 flex flex-col">
                  {/* Stars with spin entrance */}
                  <div className="flex gap-1 mb-5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <motion.div
                        key={s}
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: s * 0.05, type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        <Star className={`w-4 h-4 ${s <= t.rating ? 'text-brand-mid fill-brand-mid' : 'text-surface-300'}`} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-[15px] leading-[1.75] text-brand-cream-dark flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-surface-300">
                    {t.image ? (
                      <img src={t.image} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-brand-mid/30 shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-brand-mid/10 border-2 border-brand-mid/30 flex items-center justify-center shrink-0">
                        <span className="text-[13px] font-bold text-brand-mid">{t.initials}</span>
                      </div>
                    )}
                    <div>
                      <div className="text-[14px] font-semibold text-brand-cream">{t.name}</div>
                      <div className="text-[12px] text-surface-400">{t.role}, {t.company}</div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

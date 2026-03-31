'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CalendarDays, ArrowRight } from 'lucide-react'
import { loadHomePageData, defaultHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.4, 0, 1] },
  },
}

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.9, ease: [0.25, 0.4, 0, 1], delay: 0.3 },
  },
}

const floatBadge = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0, 1], delay: 0.8 + i * 0.15 },
  }),
}

function MagneticButton({ children, className, href }: { children: React.ReactNode; className: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`
  }, [])
  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0, 0)'
  }, [])
  return (
    <Link ref={ref} href={href} className={`${className} magnetic-btn`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </Link>
  )
}

export default function HeroSection() {
  const { loaded } = useData()
  const [hero, setHero] = useState(defaultHomePageData.hero)
  useEffect(() => { if (loaded) loadHomePageData().then(d => setHero(d.hero)) }, [loaded])

  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const headingY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const photoY = useTransform(scrollYProgress, [0, 1], [0, -30])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={sectionRef} className="relative min-h-[100svh] flex items-center overflow-hidden pt-24 pb-12 sm:pt-20 sm:pb-10 lg:pt-0 lg:pb-0" suppressHydrationWarning>
      {/* Background gradient mesh */}
      <div className="absolute inset-0 z-0" style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(75,138,108,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(184,155,74,0.04) 0%, transparent 40%), radial-gradient(ellipse at 60% 90%, rgba(33,95,71,0.1) 0%, transparent 50%)',
      }} />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(231,221,198,1) 1px, transparent 1px), linear-gradient(90deg, rgba(231,221,198,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <motion.div className="relative z-10 container-main w-full" initial="hidden" animate="visible" variants={stagger} style={{ opacity }}>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ═══ LEFT SIDE - Text Content ═══ */}
          <div className="w-full lg:w-[55%] text-center lg:text-left">
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-bold tracking-[0.15em] uppercase text-brand-gold bg-brand-gold/10 border border-brand-gold/25 rounded-full">
                {hero.badge}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeUp} style={{ y: headingY }}
              className="mt-6 sm:mt-8 text-[32px] sm:text-[42px] md:text-[52px] lg:text-[68px] font-display font-bold leading-[1.08] tracking-[-0.02em]">
              {hero.heading}
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} className="mt-4 sm:mt-6 text-[14px] sm:text-[16px] md:text-[17px] leading-[1.75] text-brand-cream/70 max-w-[440px] mx-auto lg:mx-0">
              {hero.subtitle}
            </motion.p>

            {/* Buttons */}
            <motion.div variants={fadeUp} className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <MagneticButton href={hero.primaryBtnLink} className="btn-primary gap-2.5 w-full sm:w-auto justify-center">
                <CalendarDays className="w-4 h-4" />
                {hero.primaryBtnText}
              </MagneticButton>
              <MagneticButton href={hero.secondaryBtnLink} className="btn-secondary gap-2.5 w-full sm:w-auto justify-center">
                {hero.secondaryBtnText}
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={fadeUp} className="mt-8 sm:mt-12 grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-center lg:justify-start sm:gap-3">
              {hero.stats.map((stat, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-brand-mid/[0.06] border border-brand-mid/10">
                  <span className="text-[18px] sm:text-[22px] font-display font-bold text-brand-gold leading-none">{stat.value}</span>
                  <span className="text-[10px] sm:text-[12px] font-medium text-brand-cream/50 text-center">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ═══ RIGHT SIDE - Photo with floating badges ═══ */}
          <motion.div variants={fadeRight} style={{ y: photoY }} className="w-full lg:w-[45%] flex justify-center lg:justify-end mt-4 lg:mt-0">
            <div className="relative w-[240px] sm:w-[320px] md:w-[400px] lg:w-full max-w-[480px]">

              {/* Photo container */}
              <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_60px_rgba(0,0,0,0.4)]" style={{ aspectRatio: '3/4' }}>
                {hero.heroImage ? (
                  <img src={hero.heroImage} alt="Sabbir Ahsan" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0" style={{
                      background: 'linear-gradient(160deg, #0E3529 0%, #215F47 40%, #4B8A6C 70%, #0E3529 100%)',
                    }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[100px] font-display font-bold text-brand-cream/10 select-none">SA</span>
                    </div>
                  </>
                )}
                {/* Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/60 via-transparent to-transparent" />
              </div>

              {/* ── Floating Glass Badge: Analytics (top right) ── */}
              <motion.div custom={0} variants={floatBadge}
                className="absolute hidden sm:block sm:top-4 sm:-right-8 z-20 animate-float">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-dark/70 backdrop-blur-xl border border-brand-mid/20 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                  <div className="w-10 h-10 rounded-lg bg-brand-mid/20 flex items-center justify-center">
                    {(() => { const I = getIcon(hero.floatingBadges[0]?.icon); return <I className="w-5 h-5 text-brand-mid" /> })()}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-brand-cream">{hero.floatingBadges[0]?.title ?? 'Analytics'}</div>
                    <div className="text-[11px] text-brand-cream/50">{hero.floatingBadges[0]?.subtitle ?? 'GA4 & GTM'}</div>
                  </div>
                </div>
              </motion.div>

              {/* ── Floating Glass Badge: Automation (mid left) ── */}
              <motion.div custom={1} variants={floatBadge}
                className="absolute hidden sm:block top-[45%] sm:-left-10 z-20 animate-float-slow">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-dark/70 backdrop-blur-xl border border-brand-mid/20 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                  <div className="w-10 h-10 rounded-lg bg-brand-gold/15 flex items-center justify-center">
                    {(() => { const I = getIcon(hero.floatingBadges[1]?.icon); return <I className="w-5 h-5 text-brand-gold" /> })()}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-brand-cream">{hero.floatingBadges[1]?.title ?? 'Automation'}</div>
                    <div className="text-[11px] text-brand-cream/50">{hero.floatingBadges[1]?.subtitle ?? 'n8n & Zapier'}</div>
                  </div>
                </div>
              </motion.div>

              {/* ── Floating Glass Badge: Development (bottom right) ── */}
              <motion.div custom={2} variants={floatBadge}
                className="absolute hidden sm:block sm:bottom-8 sm:-right-6 z-20 animate-bounce-subtle">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-dark/70 backdrop-blur-xl border border-brand-mid/20 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                  <div className="w-10 h-10 rounded-lg bg-brand-green-light/15 flex items-center justify-center">
                    {(() => { const I = getIcon(hero.floatingBadges[2]?.icon); return <I className="w-5 h-5 text-brand-green-light" /> })()}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-brand-cream">{hero.floatingBadges[2]?.title ?? 'MarTech'}</div>
                    <div className="text-[11px] text-brand-cream/50">{hero.floatingBadges[2]?.subtitle ?? 'HubSpot & More'}</div>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <div className="relative w-px h-8 overflow-hidden">
          <motion.div className="absolute top-0 left-0 w-full h-3 rounded-full"
            style={{ background: 'linear-gradient(to bottom, #B89B4A, transparent)' }}
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        </div>
        <span className="text-[10px] tracking-[0.2em] uppercase text-brand-cream/40">Scroll</span>
      </motion.div>
    </section>
  )
}

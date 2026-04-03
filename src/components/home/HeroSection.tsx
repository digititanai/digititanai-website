'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles, CalendarDays, Cpu, Globe, Layers, BarChart3, Orbit, Megaphone, Target } from 'lucide-react'
import { loadHomePageData, getHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'

/* ── Single orbiting card ── */
function PlanetCard({ icon: Icon, label, orbitSize, startDeg, duration, cardSize, reverse }: {
  icon: React.ElementType; label: string; orbitSize: string; startDeg: number; duration: number; cardSize: number; reverse?: boolean
}) {
  // The trick: a wrapper div the size of the orbit, centered, rotates.
  // The card sits at the top-center (12 o'clock) of that wrapper.
  // A counter-rotation keeps the card upright.
  const dir = reverse ? -360 : 360
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="relative rounded-full"
        style={{ width: orbitSize, height: orbitSize }}
        initial={{ rotate: startDeg }}
        animate={{ rotate: startDeg + dir }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {/* Card at top of circle */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-auto"
          style={{ top: -(cardSize / 2) }}
          initial={{ rotate: -startDeg }}
          animate={{ rotate: -(startDeg + dir) }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + startDeg * 0.005, type: 'spring', stiffness: 150, damping: 15 }}
          >
            <div
              className="rounded-2xl bg-surface-200/90 backdrop-blur-xl border border-brand-mid/20 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-brand-mid/40 hover:bg-surface-300/50 transition-all duration-300 cursor-default"
              style={{ width: cardSize, height: cardSize }}
            >
              <Icon className="text-brand-mid" style={{ width: cardSize * 0.4, height: cardSize * 0.4 }} />
            </div>
            {label && <span className="text-[9px] font-mono text-surface-400 uppercase tracking-[0.12em] whitespace-nowrap">{label}</span>}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ── Orbital System ── */
function OrbitalHUD() {
  return (
    <div className="relative w-full aspect-square max-w-[520px] mx-auto">
      {/* Static orbit rings */}
      <div className="absolute inset-[2%] rounded-full border border-brand-mid/[0.06]" />
      <div className="absolute inset-[14%] rounded-full border border-brand-mid/[0.1]" />
      <div className="absolute inset-[32%] rounded-full border border-dashed border-brand-mid/[0.07]" />
      <div className="absolute inset-[46%] rounded-full border border-brand-mid/[0.04]" />

      {/* Center core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(6,182,212,0.03) 60%, transparent 100%)',
            boxShadow: '0 0 60px rgba(6,182,212,0.1), 0 0 30px rgba(6,182,212,0.06)',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Orbit className="w-8 h-8 text-brand-mid/70" strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* Pulse waves */}
      {[0, 1, 2].map((i) => (
        <motion.div key={`p-${i}`} className="absolute rounded-full border border-brand-mid/[0.04]" style={{ inset: '46%' }}
          animate={{ scale: [1, 4.5], opacity: [0.3, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: i * 1.5, ease: 'easeOut' }}
        />
      ))}

      {/* Outer orbit — 3 large cards, 45s, clockwise */}
      <PlanetCard icon={Megaphone} label="Digital Mktg" orbitSize="86%" startDeg={0} duration={45} cardSize={52} />
      <PlanetCard icon={Globe} label="SEO" orbitSize="86%" startDeg={120} duration={45} cardSize={52} />
      <PlanetCard icon={Target} label="PPC Ads" orbitSize="86%" startDeg={240} duration={45} cardSize={52} />

      {/* Inner orbit — 3 smaller cards, 30s, counter-clockwise */}
      <PlanetCard icon={Cpu} label="Automation" orbitSize="55%" startDeg={30} duration={30} cardSize={42} reverse />
      <PlanetCard icon={BarChart3} label="Dashboard" orbitSize="55%" startDeg={150} duration={30} cardSize={42} reverse />
      <PlanetCard icon={Layers} label="MarTech" orbitSize="55%" startDeg={270} duration={30} cardSize={42} reverse />

      {/* Tiny orbiting dots */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div className="relative w-[96%] h-[96%] rounded-full" animate={{ rotate: -360 }} transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}>
          {[0, 72, 144, 216, 288].map((d) => (
            <div key={d} className="absolute w-1.5 h-1.5 rounded-full bg-brand-mid/20 -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${50 + 50 * Math.sin(d * Math.PI / 180)}%`, left: `${50 + 50 * Math.cos(d * Math.PI / 180)}%` }} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const { loaded } = useData()
  const [hero, setHero] = useState(() => getHomePageData().hero)
  useEffect(() => { if (loaded) loadHomePageData().then(d => setHero(d.hero)) }, [loaded])

  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 70% 50%, rgba(6,182,212,0.05) 0%, transparent 50%)',
      }} />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 container-main pt-28 pb-16 lg:pt-0 lg:pb-0"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 xl:gap-12">

          {/* ═══ LEFT — Content ═══ */}
          <div className="flex-1 text-center lg:text-left lg:max-w-[50%] shrink-0">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-brand-mid bg-brand-mid/[0.06] border border-brand-mid/15 rounded-full">
                <Sparkles className="w-3 h-3" />
                {hero.badge}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="mt-7 text-[2.2rem] sm:text-[2.8rem] lg:text-[3.2rem] xl:text-[3.6rem] font-display font-extrabold leading-[1.15] tracking-[-0.02em]"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <span className="text-brand-cream">Grow Your Brand with </span>
              <span className="text-shimmer">Data-Driven</span>
              <span className="text-brand-cream"> Digital </span>
              <span className="text-shimmer">Strategy</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mt-6 text-[16px] sm:text-[17px] leading-[1.75] text-brand-cream-dark max-w-md mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
            >
              {hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href={hero.primaryBtnLink} className="btn-primary animate-magnetic-pulse gap-2.5 rounded-xl h-12 px-7">
                  <CalendarDays className="w-4 h-4" />
                  {hero.primaryBtnText}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href={hero.secondaryBtnLink} className="btn-secondary gap-2.5 rounded-xl h-12 px-7">
                  {hero.secondaryBtnText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-10 flex items-center justify-center lg:justify-start gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              {hero.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl sm:text-3xl font-display font-bold gradient-text leading-none">{stat.value}</div>
                  <div className="mt-1.5 text-[10px] font-mono text-surface-400 uppercase tracking-[0.12em]">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ═══ RIGHT — Orbital HUD (desktop only) ═══ */}
          <motion.div
            className="hidden lg:flex flex-1 w-[50%]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <OrbitalHUD />
          </motion.div>

        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div className="w-5 h-8 rounded-full border border-brand-mid/20 flex justify-center pt-1.5">
          <motion.div className="w-1 h-2 rounded-full bg-brand-mid/50" animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </motion.div>
      </motion.div>
    </section>
  )
}

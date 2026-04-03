'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { defaultAboutContent, type AboutPageContent } from '@/lib/pageContent'
import PageSEO from '@/components/layout/PageSEO'
import { getIcon } from '@/lib/iconMap'
import TiltCard from '@/components/ui/TiltCard'

export default function AboutPage() {
  const [content, setContent] = useState<AboutPageContent>(defaultAboutContent)
  useEffect(() => {
    fetch('/api/data/page_content_about', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent({ ...defaultAboutContent, ...data }) })
      .catch(() => {})
  }, [])

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOp = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <main>
      <PageSEO title={(content as unknown as Record<string, string>).seoTitle} description={(content as unknown as Record<string, string>).seoDescription} image={(content as unknown as Record<string, string>).seoImage} />

      {/* ═══ HERO — full-width centered ═══ */}
      <section ref={heroRef} className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(6,182,212,0.06) 0%, transparent 60%)' }} />

        <motion.div style={{ y: heroY, opacity: heroOp }} className="relative z-10 container-main text-center">
          <motion.span className="badge" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {content.badge}
          </motion.span>

          <motion.h1
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-[1.08] tracking-tight max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
          >
            {content.heroHeading}
          </motion.h1>

          <motion.p
            className="mt-6 text-lg text-brand-cream-dark max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {content.heroSubtitle}
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="pb-20">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {content.stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center p-6 rounded-2xl bg-surface-200 border border-surface-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl font-display font-bold gradient-text">{s.value}</div>
                <div className="text-sm text-brand-cream-dark mt-2">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHO WE ARE — split section ═══ */}
      <section className="py-24 relative">
        <div className="container-main">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            {/* Left text — takes 3 cols */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="badge">{content.whoWeAreBadge}</span>
              <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold leading-tight">
                {content.whoWeAreHeading}
              </h2>
              <p className="mt-6 text-[15px] leading-[1.85] text-brand-cream-dark">{content.bio1}</p>
              <p className="mt-4 text-[15px] leading-[1.85] text-brand-cream-dark">{content.bio2}</p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {content.checklist.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <CheckCircle className="w-4 h-4 text-brand-mid shrink-0" />
                    <span className="text-[13px] text-brand-cream/70">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — visual card stack */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="space-y-4">
                {content.credentials.map((card, i) => {
                  const CardIcon = getIcon(card.icon)
                  return (
                    <motion.div
                      key={card.label}
                      className="flex items-center gap-4 p-4 rounded-xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-300"
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="w-11 h-11 rounded-xl bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center shrink-0">
                        <CardIcon className="w-5 h-5 text-brand-mid" />
                      </div>
                      <div>
                        <div className="text-[14px] font-display font-bold text-brand-cream">{card.label}</div>
                        <div className="text-[12px] text-brand-cream-dark">{card.sub}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ OUR APPROACH — numbered steps ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-mid/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="container-main relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge">{content.approachBadge}</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">
              {content.approachHeading}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.approach.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                <div className="p-6 rounded-2xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-500 h-full relative overflow-hidden group">
                  <div className="absolute inset-0 card-shine pointer-events-none" />
                  <span className="absolute top-4 right-5 text-5xl font-display font-bold text-brand-mid/[0.06] select-none">{step.num}</span>
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-full bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center mb-5">
                      <span className="text-sm font-mono font-bold text-brand-mid">{step.num}</span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-brand-cream mb-2">{step.title}</h3>
                    <p className="text-sm text-brand-cream-dark leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE US ═══ */}
      <section className="py-24 relative">
        <div className="container-main">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge">{content.whyUsBadge}</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">
              {content.whyUsHeading}
            </h2>
            {content.whyUsSubtitle && (
              <p className="mt-5 text-lg text-brand-cream-dark max-w-2xl mx-auto">{content.whyUsSubtitle}</p>
            )}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.whyUs.map((item, i) => {
              const ItemIcon = getIcon(item.icon)
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="h-full"
                >
                  <TiltCard tiltAmount={8}>
                    <div className="h-full p-7 rounded-2xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-500 relative overflow-hidden group">
                      <div className="absolute inset-0 card-shine pointer-events-none" />
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center mb-5 group-hover:bg-brand-mid/15 transition-colors">
                          <ItemIcon className="w-6 h-6 text-brand-mid" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-brand-cream">{item.title}</h3>
                        <p className="text-sm text-brand-cream-dark leading-relaxed mt-2">{item.desc}</p>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ SKILLS ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-main">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge">{content.skillsBadge}</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">{content.skillsHeading}</h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {content.skills.map((skill, i) => {
              const Icon = getIcon(skill.icon)
              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="h-full"
                >
                  <div className="h-full p-5 rounded-2xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-brand-mid" />
                    </div>
                    <h3 className="text-[14px] font-display font-bold text-brand-cream">{skill.name}</h3>
                    <p className="text-[12px] text-brand-cream-dark mt-1">{skill.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ TOOLS ═══ */}
      <section className="py-24">
        <div className="container-main">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge">{content.toolsBadge}</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">{content.toolsHeading}</h2>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.02 } } }}
          >
            {content.tools.map((tool) => (
              <motion.span
                key={tool}
                variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                className="px-5 py-2.5 text-[13px] font-mono text-brand-cream/60 rounded-full bg-surface-200 border border-surface-300 hover:border-brand-mid/25 hover:text-brand-cream transition-all duration-300 cursor-default"
                whileHover={{ scale: 1.05 }}
              >
                {tool}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

    </main>
  )
}

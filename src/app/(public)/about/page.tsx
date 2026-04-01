'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Download, ArrowRight, BarChart3, Search, Zap, LineChart,
  PenTool, Share2, MousePointerClick, Cpu, Globe, Mail,
  Briefcase, GraduationCap, Award, MapPin, Calendar
} from 'lucide-react'
import { defaultAboutContent, type AboutPageContent } from '@/lib/pageContent'
import PageSEO from '@/components/layout/PageSEO'
import { getIcon } from '@/lib/iconMap'

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutPageContent>(defaultAboutContent)
  useEffect(() => {
    fetch('/api/data/page_content_about', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent({ ...defaultAboutContent, ...data }) })
      .catch(() => {})
  }, [])

  const photoRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: photoRef, offset: ['start end', 'end start'] })
  const photoY = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <main>
      <PageSEO title={(content as unknown as Record<string, string>).seoTitle} description={(content as unknown as Record<string, string>).seoDescription} image={(content as unknown as Record<string, string>).seoImage} />
      {/* ═══ Hero Section ═══ */}
      <section className="pt-32 pb-20">
        <div className="container-main">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
            {/* Left: Photo */}
            <motion.div
              ref={photoRef}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-[40%] shrink-0 self-stretch hidden lg:block"
            >
              <div className="h-full rounded-2xl overflow-hidden bg-gradient-to-br from-brand-dark via-brand-mid/60 to-brand-dark flex items-center justify-center relative">
                {content.image ? (
                  <img src={content.image} alt={content.heading} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <span className="text-[80px] font-display font-bold text-brand-cream/10">SA</span>
                )}
              </div>
            </motion.div>

            {/* Right: Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-[58%]"
            >
              <span className="badge">{content.badge}</span>
              <h1 className="mt-5 heading-lg">
                {content.heading}
              </h1>
              <p className="mt-2 text-[18px] font-medium text-brand-gold">
                {content.subtitle}
              </p>
              <p className="mt-6 text-[15px] leading-[1.8] text-brand-cream/75">
                {content.bio1}
              </p>
              <p className="mt-4 text-[15px] leading-[1.8] text-brand-cream/75">
                {content.bio2}
              </p>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {content.stats.map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-xl bg-brand-mid/[0.06] border border-brand-mid/10">
                    <div className="text-[28px] font-display font-bold text-brand-gold">{s.value}</div>
                    <div className="text-[12px] text-brand-cream/50 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      <div className="container-main"><div className="line-divider-gold" /></div>

      {/* ═══ Skills Grid ═══ */}
      <section className="section-gap">
        <div className="container-main">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="badge">{content.skillsBadge}</span>
              <h2 className="mt-5 heading-md">{content.skillsHeading}</h2>
            </div>
          </div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {content.skills.map((skill) => {
              const Icon = getIcon(skill.icon)
              return (
                <motion.div key={skill.name} variants={fadeUp} className="h-full">
                  <div className="card h-full p-5 flex flex-col items-start">
                    <div className="w-11 h-11 rounded-xl bg-brand-mid/10 border border-brand-mid/20 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-brand-mid" />
                    </div>
                    <h3 className="text-[15px] font-semibold text-brand-cream">{skill.name}</h3>
                    <p className="text-[13px] text-brand-cream/55 mt-1">{skill.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <div className="container-main"><div className="line-divider" /></div>

      {/* ═══ Experience ═══ */}
      <section className="section-gap">
        <div className="container-main">
          <span className="badge">{content.experienceBadge}</span>
          <h2 className="mt-5 heading-md mb-12">{content.experienceHeading}</h2>

          <div className="grid md:grid-cols-2 gap-5">
            {content.experiences.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="h-full"
              >
                <div className="card h-full p-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="text-[13px] font-medium text-brand-gold">{exp.year}</span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-brand-cream">{exp.role}</h3>
                  <p className="text-[14px] text-brand-mid font-medium mt-1">{exp.company}</p>
                  <p className="text-[14px] text-brand-cream/65 mt-3 flex-1 leading-[1.7]">{exp.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-main"><div className="line-divider" /></div>

      {/* ═══ Tools & Technologies ═══ */}
      <section className="section-gap">
        <div className="container-main">
          <span className="badge">{content.toolsBadge}</span>
          <h2 className="mt-5 heading-md mb-10">{content.toolsHeading}</h2>

          <motion.div
            className="flex flex-wrap gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {content.tools.map((tool) => (
              <motion.span
                key={tool}
                variants={fadeUp}
                className="px-4 py-2.5 text-[13px] font-medium text-brand-cream/70 rounded-xl
                bg-brand-mid/[0.06] border border-brand-mid/10
                hover:border-brand-mid/20 hover:text-brand-cream/90 transition-all duration-300 cursor-default"
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

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { loadHomePageData, defaultHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'
import { getPortfolio } from '@/lib/collections'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0, 1] } },
}

export default function FeaturedPortfolio() {
  const { loaded } = useData()
  const [pData, setPData] = useState(defaultHomePageData.portfolio)
  useEffect(() => { (async () => {
    if (!loaded) return
    const freshHome = await loadHomePageData()
    const homeData = freshHome.portfolio
    const allPortfolio = getPortfolio()
    const merged = homeData.projects.map((hp) => {
      const col = allPortfolio.find((p) => p.id === hp.id)
      return col ? { id: col.id, title: col.title, category: col.category, description: col.description, slug: col.slug, icon: col.icon, metrics: col.metrics } : hp
    })
    setPData({ ...homeData, projects: merged })
  })() }, [loaded])

  return (
    <section className="section-gap" suppressHydrationWarning>
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="badge"
            >
              {pData.badge}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-5 heading-lg"
            >
              {pData.heading}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/portfolio" className="inline-flex items-center gap-2 text-[14px] font-medium text-brand-gold hover:text-brand-gold-light transition-colors">
              {pData.linkText} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Project Grid - 2 columns */}
        <motion.div
          key={pData.projects.length}
          className="grid md:grid-cols-2 gap-5 items-stretch"
          initial="hidden"
          animate={pData.projects.length > 0 ? 'visible' : 'hidden'}
          variants={stagger}
        >
          {pData.projects.map((project, idx) => {
            const Icon = getIcon(project.icon)
            return (
              <motion.div key={project.title} variants={fadeUp} className="h-full">
                <Link href={`/portfolio/${project.slug}`} className="card-hover block h-full p-7 group flex flex-col">
                  {/* Top row: icon + category + arrow */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-brand-mid/10 border border-brand-mid/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand-mid" />
                      </div>
                      <span className="text-[12px] font-semibold tracking-wider uppercase text-brand-gold/70">
                        {project.category}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-brand-mid/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-brand-gold/30 transition-all duration-300">
                      <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[20px] md:text-[22px] font-display font-bold text-brand-cream leading-tight">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-[14px] leading-[1.7] text-brand-cream/70 flex-1">
                    {project.description}
                  </p>

                  {/* Metrics row */}
                  <div className="mt-6 pt-5 border-t border-brand-mid/10 flex items-center gap-6">
                    {project.metrics.map((m) => (
                      <div key={m.label}>
                        <div className="text-[20px] font-display font-bold text-brand-gold leading-none">
                          {m.value}
                        </div>
                        <div className="mt-1 text-[11px] text-brand-cream/45 uppercase tracking-wider">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

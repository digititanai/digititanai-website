'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { loadHomePageData, getHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'
import { getPortfolio } from '@/lib/collections'
import TiltCard from '@/components/ui/TiltCard'

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
  const [pData, setPData] = useState(() => getHomePageData().portfolio)
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
        {/* Centered header */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge">{pData.badge}</span>
          <h2 className="mt-5 heading-lg">
            Results That <span className="gradient-text">Speak</span>
          </h2>
        </motion.div>

        {/* 2-column project grid */}
        <motion.div
          key={pData.projects.length}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch"
          initial="hidden"
          animate={pData.projects.length > 0 ? 'visible' : 'hidden'}
          variants={stagger}
        >
          {pData.projects.map((project) => {
            const Icon = getIcon(project.icon)
            return (
              <motion.div key={project.title} variants={fadeUp} className="h-full">
                <TiltCard>
                  <Link href={`/portfolio/${project.slug}`} className="card-hover glow-border card-shine block h-full p-5 md:p-7 group flex flex-col">
                    {/* Top: icon + category + arrow */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-brand-mid" />
                        </div>
                        <span className="text-[11px] font-mono font-semibold tracking-[0.12em] uppercase text-surface-400">
                          {project.category}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-surface-300 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-brand-mid/30 transition-all duration-300">
                        <ArrowUpRight className="w-3.5 h-3.5 text-brand-mid" />
                      </div>
                    </div>

                    <h3 className="text-[20px] md:text-[22px] font-display font-bold text-brand-cream leading-tight">{project.title}</h3>
                    <p className="mt-3 text-[14px] leading-[1.7] text-brand-cream-dark flex-1">{project.description}</p>

                    {/* Metrics */}
                    <div className="mt-6 pt-5 border-t border-surface-300 flex flex-wrap items-center gap-4 md:gap-6">
                      {project.metrics.map((m) => (
                        <div key={m.label}>
                          <div className="text-[20px] font-display font-bold gradient-text leading-none">{m.value}</div>
                          <div className="mt-1 text-[11px] font-mono text-surface-400 uppercase tracking-wider">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* View all */}
        <motion.div className="mt-10 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-[13px] font-mono font-medium text-brand-mid hover:text-brand-gold-light transition-colors tracking-[0.05em] uppercase">
            {pData.linkText} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

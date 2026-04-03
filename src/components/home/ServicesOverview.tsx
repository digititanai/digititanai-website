'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { loadHomePageData, getHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'
import { getServices, getCategories } from '@/lib/collections'
import TiltCard from '@/components/ui/TiltCard'

function buildServiceUrl(serviceSlug: string, categoryName?: string): string {
  if (!categoryName) return `/services/${serviceSlug}`
  const cats = getCategories()
  const cat = cats.find((c) => c.name === categoryName)
  if (!cat) return `/services/${serviceSlug}`
  const parent = cats.find((c) => c.id === cat.parentId)
  if (parent && !parent.id.startsWith('vert-')) return `/services/${parent.slug}/${cat.slug}/${serviceSlug}`
  return `/services/${cat.slug}/${serviceSlug}`
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0, 1] } },
}

export default function ServicesOverview() {
  const { loaded } = useData()
  const [sData, setSData] = useState(() => getHomePageData().services)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { (async () => {
    if (!loaded) return
    const freshHome = await loadHomePageData()
    const homeData = freshHome.services
    const allServices = getServices()
    const activeServices = allServices.filter((s: { active: boolean }) => s.active)
    const merged = homeData.services.map((hs: { id: string }) => {
      const col = activeServices.find((s: { id: string }) => s.id === hs.id)
      return col ? { id: col.id, title: col.title, description: col.description, slug: col.slug, icon: col.icon } : hs
    }).filter((hs: { id: string }) => activeServices.some((s: { id: string }) => s.id === hs.id))
    setSData({ ...homeData, services: merged } as ReturnType<typeof getHomePageData>['services'])
    setMounted(true)
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
          <span className="badge">What We Do</span>
          <h2 className="mt-5 heading-lg">
            <span className="gradient-text">{sData.heading}</span>
          </h2>
          <p className="mt-4 body-base max-w-lg mx-auto">{sData.subtitle}</p>
        </motion.div>

        {/* 3-column grid */}
        <motion.div
          key={sData.services.length}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch"
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          variants={stagger}
        >
          {sData.services.slice(0, 6).map((service) => {
            const Icon = getIcon(service.icon)
            return (
              <motion.div key={service.title} variants={fadeUp} className="h-full">
                <TiltCard tiltAmount={12}>
                  <Link href={mounted ? buildServiceUrl(service.slug, getServices().find((s) => s.slug === service.slug)?.category) : `/services/${service.slug}`}
                    className="card-hover card-shine block h-full p-6 group flex flex-col">
                    {/* Icon + tag */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand-mid" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold tracking-[0.15em] uppercase text-surface-400 bg-surface-300 px-2.5 py-1 rounded-full">
                        Service
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[17px] font-display font-bold text-brand-cream leading-tight">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-[14px] leading-[1.7] text-brand-cream-dark flex-1">
                      {service.description}
                    </p>

                    {/* Bottom accent line */}
                    <div className="mt-5 pt-4 border-t border-surface-300">
                      <div className="flex items-center gap-1.5 text-[13px] font-mono font-medium text-brand-mid group-hover:text-brand-gold-light transition-colors tracking-wide uppercase">
                        Learn more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Accent bar that scales on hover */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-mid/0 via-brand-mid to-brand-mid/0"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </TiltCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* View all link */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/services" className="inline-flex items-center gap-2 text-[13px] font-mono font-medium text-brand-mid hover:text-brand-gold-light transition-colors tracking-[0.05em] uppercase">
            {sData.linkText} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { loadHomePageData, defaultHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'
import { getServices, getCategories } from '@/lib/collections'

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

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)')

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8
    setTransform(`perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.02,1.02,1.02)`)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg)')
  }, [])

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.3s ease-out', transformStyle: 'preserve-3d' }}
      className="h-full">
      {children}
    </div>
  )
}

export default function ServicesOverview() {
  const { loaded } = useData()
  const [sData, setSData] = useState(defaultHomePageData.services)
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
    setSData({ ...homeData, services: merged } as typeof defaultHomePageData.services)
    setMounted(true)
  })() }, [loaded])

  return (
    <section className="section-gap" suppressHydrationWarning>
      <div className="container-main">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="heading-lg"
            >
              {sData.heading}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-3 body-base max-w-lg"
            >
              {sData.subtitle}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link href="/services" className="inline-flex items-center gap-2 text-[14px] font-medium text-brand-gold hover:text-brand-gold-light transition-colors">
              {sData.linkText} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* 4-column grid */}
        <motion.div
          key={sData.services.length}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch"
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          variants={stagger}
        >
          {sData.services.map((service, idx) => {
            const Icon = getIcon(service.icon)
            return (
              <motion.div key={service.title} variants={fadeUp} className="h-full">
                <TiltCard>
                  <Link href={mounted ? buildServiceUrl(service.slug, getServices().find((s) => s.slug === service.slug)?.category) : `/services/${service.slug}`}
                    className="card-hover block h-full p-6 group flex flex-col">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-brand-mid/10 border border-brand-mid/20 flex items-center justify-center mb-5">
                      <Icon className="w-5 h-5 text-brand-mid" />
                    </div>

                    {/* Title */}
                    <h3 className="text-[17px] font-bold text-brand-cream leading-tight">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-[14px] leading-[1.6] text-brand-cream/70 flex-1">
                      {service.description}
                    </p>

                    {/* Learn more */}
                    <div className="mt-5 flex items-center gap-1.5 text-[13px] font-medium text-brand-gold group-hover:text-brand-gold-light transition-colors">
                      Learn more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, Check, X as XIcon, DollarSign } from 'lucide-react'
import { getServices, getCategories, type ServiceItem } from '@/lib/collections'
import { defaultPageContent } from '@/lib/pageContent'
import PageSEO from '@/components/layout/PageSEO'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'
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

function PricingModal({ service, onClose, content }: { service: ServiceItem; onClose: () => void; content?: Record<string, string> }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl border border-brand-mid/[0.08] bg-brand-darkest p-6 md:p-8"
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl overflow-hidden" style={{
          backgroundImage: 'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-[22px] font-display font-bold text-brand-cream">{service.title}</h3>
              <p className="text-[14px] text-brand-gold mt-1">{service.tagline}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full border border-brand-mid/15 flex items-center justify-center text-brand-cream/40 hover:text-brand-cream hover:border-brand-cream/20 transition-all">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[13px] text-brand-cream/50 mb-8 flex items-center gap-2">
            <Check className="w-4 h-4 text-brand-mid" />
            {content?.consultationNote || 'Book a free consultation first — no payment required to get started.'}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {service.pricing.map((tier) => (
              <div key={tier.name} className={`rounded-xl p-5 flex flex-col border ${tier.highlighted ? 'border-brand-gold/25 bg-brand-gold/[0.03]' : 'border-brand-mid/[0.08]'}`}>
                {tier.highlighted && (
                  <div className="text-[11px] font-bold tracking-wider uppercase text-brand-gold mb-3">{content?.popularLabel || 'Most Popular'}</div>
                )}
                <h4 className="text-[15px] font-semibold text-brand-cream">{tier.name}</h4>
                <div className="text-[32px] font-display font-bold text-brand-gold mt-2 mb-4">{tier.price}</div>
                <ul className="space-y-2 flex-1 mb-5">
                  {tier.features.map((f) => (
                    <li key={f.text} className={`flex items-center gap-2 text-[13px] ${f.included ? 'text-brand-cream/75' : 'text-brand-cream/25'}`}>
                      {f.included ? <Check className="w-3.5 h-3.5 text-brand-mid shrink-0" /> : <XIcon className="w-3.5 h-3.5 text-brand-cream/15 shrink-0" />}
                      {f.text}
                    </li>
                  ))}
                </ul>
                <Link href={`/book?service=${encodeURIComponent(service.title)}&package=${encodeURIComponent(tier.name)}`} data-track-ignore onClick={() => { onClose(); window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'select_pricing', service_name: service.title, package_name: tier.name, package_amount: tier.price }) }} className={tier.highlighted ? 'btn-primary w-full text-center text-[13px] h-10' : 'btn-secondary w-full text-center text-[13px] h-10'}>
                  {content?.bookBtnText || 'Book Free Consultation'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ServicesPage() {
  const { loaded } = useData()
  const [services, setServices] = useState<ServiceItem[]>([])
  const [pricingService, setPricingService] = useState<ServiceItem | null>(null)
  const [content, setContent] = useState(defaultPageContent.services)
  useEffect(() => {
    fetch('/api/data/page_content_services', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent({ ...defaultPageContent.services, ...data }) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!loaded) return
    const load = async () => {
      const items = getServices()
      setServices(items.filter((s: ServiceItem) => s.active))
    }
    load()
  }, [loaded])

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOp = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <main>
      <PageSEO title={content.seoTitle} description={content.seoDescription} image={content.seoImage} />

      {/* ═══ HERO ═══ */}
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
            {content.heading}
          </motion.h1>

          <motion.p
            className="mt-6 text-lg text-brand-cream-dark max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {content.subtitle}
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ SERVICES GRID ═══ */}
      <section className="pb-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-mid/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="container-main relative z-10">
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, i) => {
              const Icon = getIcon(service.icon)
              return (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="h-full"
                >
                  <TiltCard tiltAmount={6}>
                    <div className="h-full p-7 rounded-2xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-500 relative overflow-hidden group flex flex-col">
                      <div className="absolute inset-0 card-shine pointer-events-none" />

                      <div className="relative z-10 flex flex-col flex-1">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center mb-5 group-hover:bg-brand-mid/15 transition-colors">
                          <Icon className="w-6 h-6 text-brand-mid" />
                        </div>

                        {/* Title & tagline */}
                        <h3 className="text-xl font-display font-bold text-brand-cream">{service.title}</h3>
                        <p className="text-[13px] font-medium text-brand-gold mt-1">{service.tagline}</p>

                        {/* Description */}
                        <p className="mt-4 text-sm text-brand-cream-dark leading-relaxed">{service.description}</p>

                        {/* Features */}
                        <div className="mt-5 pt-5 border-t border-brand-mid/10 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 flex-1">
                          {service.features.map((f, fi) => (
                            <motion.div
                              key={f}
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3 + fi * 0.04 }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-mid shrink-0" />
                              <span className="text-[13px] text-brand-cream/70">{f}</span>
                            </motion.div>
                          ))}
                        </div>

                        {/* Buttons */}
                        <div className="mt-6 flex items-center gap-3">
                          <Link href={buildServiceUrl(service.slug, service.category)} className="btn-secondary h-10 px-5 text-[13px] flex-1 text-center justify-center">
                            {content.viewDetailsText || 'View Details'} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => setPricingService(service)} className="btn-primary h-10 px-5 text-[13px] flex-1 text-center justify-center">
                            <DollarSign className="w-3.5 h-3.5" /> {content.pricingBtnText || 'Pricing'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Modal */}
      <AnimatePresence>
        {pricingService && (
          <PricingModal service={pricingService} onClose={() => setPricingService(null)} content={content} />
        )}
      </AnimatePresence>
    </main>
  )
}

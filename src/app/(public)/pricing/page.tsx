'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, X as XIcon, ChevronRight } from 'lucide-react'
import { defaultPageContent } from '@/lib/pageContent'
import PageSEO from '@/components/layout/PageSEO'
import { getIcon } from '@/lib/iconMap'
import { useData } from '@/lib/useData'

interface ServicePricing {
  id: string
  title: string
  slug: string
  icon: string
  tagline: string
  pricing: { name: string; price: string; highlighted?: boolean; features: { text: string; included: boolean }[] }[]
}

const defaultFaqs = [
  { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade your plan at any time. We will adjust billing accordingly and ensure a smooth transition.' },
  { q: 'Is there a contract or commitment?', a: 'No long-term contracts. All plans are flexible — you can cancel at any time with 30 days notice.' },
  { q: 'What payment methods do you accept?', a: 'I accept bank transfers, PayPal, and major credit/debit cards. Payment terms are discussed during consultation.' },
  { q: 'Do you offer custom packages?', a: 'Yes! If none of the standard packages fit your needs, I can create a custom proposal tailored to your specific goals and budget.' },
  { q: 'How quickly can you start?', a: 'Most projects begin within 1-2 weeks of agreement. Urgent projects can be accommodated with a priority scheduling fee.' },
  { q: 'What if I am not satisfied?', a: 'Your satisfaction is my priority. If you are not happy with the results, we will work together to make it right or I will offer a partial refund.' },
]

export default function PricingPage() {
  const { loaded } = useData()
  const [services, setServices] = useState<ServicePricing[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [content, setContent] = useState(defaultPageContent.pricing)
  const scrollRef = useRef<HTMLDivElement>(null)

  const selectService = useCallback((id: string) => {
    setSelectedService(id)
    // Scroll the selected tab to the left so tabs after it are visible
    requestAnimationFrame(() => {
      const container = scrollRef.current
      if (!container) return
      const btn = container.querySelector(`[data-service-id="${id}"]`) as HTMLElement
      if (!btn) return
      container.scrollTo({ left: btn.offsetLeft - 4, behavior: 'smooth' })
    })
  }, [])

  useEffect(() => {
    fetch('/api/data/page_content_pricing', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent({ ...defaultPageContent.pricing, ...data }) })
      .catch(() => {})
  }, [])

  // Fetch real services with pricing
  useEffect(() => {
    if (!loaded) return
    fetch('/api/data/col_services', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data)) {
          const active = data.filter((s: { active: boolean }) => s.active)
          setServices(active)
          if (active.length > 0) setSelectedService(active[0].id)
        }
      })
      .catch(() => {})
  }, [loaded])

  const currentService = services.find(s => s.id === selectedService)

  return (
    <main className="min-h-screen bg-brand-darkest">
      <PageSEO title={content.seoTitle} description={content.seoDescription} image={content.seoImage} />
      {/* Hero */}
      <section className="section-gap">
        <div className="container-main text-center">
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="badge mb-6 inline-block">{content.badge}</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="heading-lg">{content.heading}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 body-lg text-brand-cream/60 max-w-[520px] mx-auto">{content.subtitle}</motion.p>
        </div>
      </section>

      <div className="line-divider" />

      {/* Service Selector + Pricing */}
      <section className="section-gap">
        <div className="container-main">
          {/* Service tabs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            {/* Mobile: horizontal scroll — shows partial items as scroll hint */}
            <div className="md:hidden overflow-x-auto scrollbar-hide" ref={scrollRef}>
              <div className="flex gap-1.5 pb-2">
                {services.map((s) => {
                  const Icon = getIcon(s.icon)
                  return (
                    <button key={s.id} data-service-id={s.id} onClick={() => selectService(s.id)}
                      className={`px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-300 inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                        selectedService === s.id
                          ? 'bg-brand-gold text-brand-darkest shadow-lg shadow-brand-gold/20'
                          : 'border border-brand-mid/15 text-brand-cream/50 hover:text-brand-cream hover:border-brand-mid/25'
                      }`}>
                      <Icon className="w-3 h-3" /> {s.title}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Desktop: wrapped centered */}
            <div className="hidden md:flex flex-wrap justify-center gap-2">
              {services.map((s) => {
                const Icon = getIcon(s.icon)
                return (
                  <button key={s.id} onClick={() => selectService(s.id)}
                    className={`px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 inline-flex items-center gap-2 ${
                      selectedService === s.id
                        ? 'bg-brand-gold text-brand-darkest shadow-lg shadow-brand-gold/20'
                        : 'border border-brand-mid/15 text-brand-cream/50 hover:text-brand-cream hover:border-brand-mid/25'
                    }`}>
                    <Icon className="w-3.5 h-3.5" /> {s.title}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Pricing cards for selected service */}
          {currentService && (
            <motion.div key={currentService.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-8">
                <p className="text-[14px] text-brand-gold font-medium">{currentService.tagline}</p>
              </div>
              <div className="grid gap-5 grid-cols-1 md:grid-cols-3 items-stretch max-w-4xl mx-auto">
                {currentService.pricing.map((tier, i) => (
                  <motion.div key={tier.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={`relative rounded-2xl border p-7 flex flex-col ${
                      tier.highlighted
                        ? 'border-brand-gold/30 bg-brand-gold/[0.04] shadow-xl shadow-brand-gold/10'
                        : 'border-brand-mid/10 bg-surface-100/20'
                    }`}>
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-gold text-brand-darkest text-[11px] font-bold uppercase tracking-wider rounded-full">Most Popular</div>
                    )}
                    <h3 className="text-[18px] font-semibold text-brand-cream">{tier.name}</h3>
                    <div className="mt-3 mb-6">
                      <span className="text-[36px] font-display font-bold text-brand-gold">{tier.price}</span>
                    </div>
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {tier.features.map((f) => (
                        <li key={f.text} className={`flex items-start gap-2.5 text-[13px] ${f.included ? 'text-brand-cream/75' : 'text-brand-cream/25'}`}>
                          {f.included ? <Check className="w-4 h-4 text-brand-mid shrink-0 mt-0.5" /> : <XIcon className="w-4 h-4 text-brand-cream/15 shrink-0 mt-0.5" />}
                          {f.text}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/book?service=${encodeURIComponent(currentService.title)}&package=${encodeURIComponent(tier.name)}`}
                      data-track-ignore
                      onClick={() => { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'select_pricing', service_name: currentService.title, package_name: tier.name, package_amount: tier.price }) }}
                      className={tier.highlighted ? 'btn-primary w-full text-center' : 'btn-secondary w-full text-center'}>
                      Book Free Consultation
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {services.length === 0 && (
            <div className="text-center py-16"><p className="text-brand-cream/40">Loading services...</p></div>
          )}
        </div>
      </section>

      <div className="line-divider" />

      {/* FAQ */}
      <section className="section-gap">
        <div className="container-main max-w-[700px]">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="badge inline-block">FAQ</span>
          </motion.div>
          <div>
            {(() => {
              let faqs = defaultFaqs
              try { if (content.faqs) faqs = typeof content.faqs === 'string' ? JSON.parse(content.faqs) : content.faqs } catch {}
              return faqs
            })().map((faq: { q: string; a: string }, i: number) => (
              <div key={i} className="border-b border-brand-mid/10">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-6 text-left group">
                  <span className="text-[15px] font-medium text-brand-cream/80 pr-4 group-hover:text-brand-cream transition-colors">{faq.q}</span>
                  <div className="w-7 h-7 rounded-full border border-brand-gold/30 flex items-center justify-center flex-shrink-0 group-hover:border-brand-gold/60 transition-colors">
                    <Plus className={`w-3.5 h-3.5 text-brand-gold transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <p className="pb-6 text-[14px] text-brand-cream/60 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight, CheckCircle2, Check, X as XIcon, DollarSign } from 'lucide-react'
import { getServices, getCategories, type ServiceItem, type PricingTier } from '@/lib/collections'
import { defaultPageContent } from '@/lib/pageContent'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'

function buildServiceUrl(serviceSlug: string, categoryName?: string): string {
  if (!categoryName) return `/services/${serviceSlug}`
  const cats = getCategories()
  const cat = cats.find((c) => c.name === categoryName)
  if (!cat) return `/services/${serviceSlug}`
  const parent = cats.find((c) => c.id === cat.parentId)
  if (parent && !parent.id.startsWith('vert-')) return `/services/${parent.slug}/${cat.slug}/${serviceSlug}`
  return `/services/${cat.slug}/${serviceSlug}`
}

const _defaultServices = [
  {
    title: 'Tracking & Analytics',
    slug: 'tracking-analytics',
    icon: 'BarChart3',
    tagline: 'Measure what matters',
    description: 'Server-side tracking, GA4, GTM, and advanced conversion setup. Get accurate data to make confident marketing decisions.',
    features: ['GA4 & GTM Setup', 'Server-Side Tracking', 'Conversion Tracking', 'Custom Dashboards', 'Attribution Modeling', 'Data Layer Implementation'],
    pricing: [
      { name: 'Starter', price: '$500', features: [{ text: 'GA4 setup & configuration', included: true }, { text: 'GTM container with core tags', included: true }, { text: 'Up to 10 custom events', included: true }, { text: 'Basic conversion tracking', included: true }, { text: 'Server-side tracking', included: false }, { text: 'Attribution modeling', included: false }] },
      { name: 'Professional', price: '$1,200', highlighted: true, features: [{ text: 'Everything in Starter', included: true }, { text: 'Server-side GTM container', included: true }, { text: 'Up to 30 custom events', included: true }, { text: 'Enhanced conversions', included: true }, { text: 'Custom attribution model', included: true }, { text: 'Looker Studio dashboards', included: true }] },
      { name: 'Enterprise', price: '$2,500', features: [{ text: 'Everything in Professional', included: true }, { text: 'BigQuery data pipeline', included: true }, { text: 'Unlimited custom events', included: true }, { text: 'Multi-property architecture', included: true }, { text: 'Custom API integrations', included: true }, { text: 'Team training workshop', included: true }] },
    ],
  },
  {
    title: 'Automation with n8n',
    slug: 'automation-n8n',
    icon: 'Zap',
    tagline: 'Save 10+ hours weekly',
    description: 'Connect your entire stack with intelligent workflow automation. From lead routing to reporting — fully automated.',
    features: ['Workflow Design & Build', 'CRM Automation', 'Lead Routing & Scoring', 'Email Sequence Automation', 'Data Sync Between Tools', 'Custom API Integrations'],
    pricing: [
      { name: 'Starter', price: '$800', features: [{ text: '3 automated workflows', included: true }, { text: 'CRM integration', included: true }, { text: 'Email notifications', included: true }, { text: 'Basic lead routing', included: true }, { text: 'Custom API connections', included: false }, { text: 'Advanced logic & branching', included: false }] },
      { name: 'Professional', price: '$1,800', highlighted: true, features: [{ text: 'Up to 10 workflows', included: true }, { text: 'Multi-tool integrations', included: true }, { text: 'Lead scoring system', included: true }, { text: 'Advanced branching logic', included: true }, { text: 'Error handling & monitoring', included: true }, { text: 'Slack/Teams notifications', included: true }] },
      { name: 'Enterprise', price: '$3,500', features: [{ text: 'Unlimited workflows', included: true }, { text: 'Custom API development', included: true }, { text: 'Database integrations', included: true }, { text: 'Webhook management', included: true }, { text: 'Priority support (30 days)', included: true }, { text: 'Full documentation', included: true }] },
    ],
  },
  {
    title: 'Modern WordPress Dev',
    slug: 'wordpress-development',
    icon: 'Globe',
    tagline: 'Built for conversions',
    description: 'High-performance WordPress sites with Elementor, built for speed, SEO, and conversion optimization.',
    features: ['Custom Elementor Design', 'Speed Optimization', 'SEO-Ready Structure', 'Mobile-First Development', 'WooCommerce Setup', 'Ongoing Maintenance'],
    pricing: [
      { name: 'Starter', price: '$1,500', features: [{ text: 'Up to 5 pages', included: true }, { text: 'Elementor design', included: true }, { text: 'Mobile responsive', included: true }, { text: 'Basic SEO setup', included: true }, { text: 'WooCommerce', included: false }, { text: 'Custom functionality', included: false }] },
      { name: 'Professional', price: '$3,000', highlighted: true, features: [{ text: 'Up to 15 pages', included: true }, { text: 'Custom Elementor widgets', included: true }, { text: 'Speed optimization', included: true }, { text: 'Advanced SEO setup', included: true }, { text: 'Contact form & CRM integration', included: true }, { text: 'Blog setup', included: true }] },
      { name: 'Enterprise', price: '$6,000', features: [{ text: 'Unlimited pages', included: true }, { text: 'Full WooCommerce store', included: true }, { text: 'Custom plugin development', included: true }, { text: 'Multi-language support', included: true }, { text: 'Hosting setup & migration', included: true }, { text: '60-day support', included: true }] },
    ],
  },
  {
    title: 'Campaign Optimization',
    slug: 'campaign-optimization',
    icon: 'Target',
    tagline: 'Maximum ROAS',
    description: 'Scientific ad management across Google, Meta, and LinkedIn for maximum return on ad spend.',
    features: ['Google Ads Management', 'Meta Ads (FB/IG)', 'LinkedIn Ads', 'A/B Testing', 'Audience Targeting', 'Performance Reporting'],
    pricing: [
      { name: 'Starter', price: '$800/mo', features: [{ text: '1 platform management', included: true }, { text: 'Campaign setup', included: true }, { text: 'Monthly optimization', included: true }, { text: 'Basic reporting', included: true }, { text: 'A/B testing', included: false }, { text: 'Retargeting campaigns', included: false }] },
      { name: 'Professional', price: '$1,500/mo', highlighted: true, features: [{ text: '2 platforms', included: true }, { text: 'Advanced targeting', included: true }, { text: 'Bi-weekly optimization', included: true }, { text: 'A/B testing', included: true }, { text: 'Retargeting campaigns', included: true }, { text: 'Detailed reporting', included: true }] },
      { name: 'Enterprise', price: '$3,000/mo', features: [{ text: 'All platforms', included: true }, { text: 'Full-funnel strategy', included: true }, { text: 'Weekly optimization', included: true }, { text: 'Dynamic creative', included: true }, { text: 'Custom dashboard', included: true }, { text: 'Dedicated manager', included: true }] },
    ],
  },
  {
    title: 'SEO & Content Strategy',
    slug: 'seo-content-strategy',
    icon: 'Search',
    tagline: 'Rank and convert',
    description: 'Data-driven SEO audits, keyword strategy, and content that ranks and converts.',
    features: ['Technical SEO Audit', 'Keyword Research', 'On-Page Optimization', 'Content Strategy', 'Link Building', 'Monthly SEO Reports'],
    pricing: [
      { name: 'Starter', price: '$600/mo', features: [{ text: 'Technical SEO audit', included: true }, { text: '5 keyword targets', included: true }, { text: 'On-page optimization', included: true }, { text: 'Monthly report', included: true }, { text: 'Content creation', included: false }, { text: 'Link building', included: false }] },
      { name: 'Professional', price: '$1,200/mo', highlighted: true, features: [{ text: '15 keyword targets', included: true }, { text: '4 blog posts/month', included: true }, { text: 'On-page + technical SEO', included: true }, { text: 'Link building outreach', included: true }, { text: 'Competitor analysis', included: true }, { text: 'Bi-weekly reports', included: true }] },
      { name: 'Enterprise', price: '$2,500/mo', features: [{ text: '50+ keyword targets', included: true }, { text: '8 content pieces/month', included: true }, { text: 'Premium link building', included: true }, { text: 'Content strategy', included: true }, { text: 'Weekly reports', included: true }, { text: 'Dedicated SEO manager', included: true }] },
    ],
  },
  {
    title: 'MarTech Consulting',
    slug: 'martech-consulting',
    icon: 'Settings2',
    tagline: 'Optimize your stack',
    description: 'Stack audit, tool selection, CRM integration, and full marketing technology optimization.',
    features: ['Tech Stack Audit', 'Tool Selection & Setup', 'CRM Integration', 'Data Migration', 'Team Training', 'Vendor Management'],
    pricing: [
      { name: 'Starter', price: '$1,000', features: [{ text: 'Stack audit & report', included: true }, { text: 'Tool recommendations', included: true }, { text: 'Integration plan', included: true }, { text: 'Basic implementation', included: true }, { text: 'Data migration', included: false }, { text: 'Team training', included: false }] },
      { name: 'Professional', price: '$2,500', highlighted: true, features: [{ text: 'Everything in Starter', included: true }, { text: 'Full implementation', included: true }, { text: 'Data migration', included: true }, { text: 'CRM configuration', included: true }, { text: 'Team training (2 sessions)', included: true }, { text: '30-day support', included: true }] },
      { name: 'Enterprise', price: '$5,000', features: [{ text: 'Everything in Professional', included: true }, { text: 'Custom development', included: true }, { text: 'API integrations', included: true }, { text: 'Ongoing management', included: true }, { text: 'Quarterly reviews', included: true }, { text: '90-day support', included: true }] },
    ],
  },
  {
    title: 'Social Media Marketing',
    slug: 'social-media-marketing',
    icon: 'Megaphone',
    tagline: 'Build your presence',
    description: 'Strategic content creation, community management, and paid social across all platforms.',
    features: ['Content Strategy', 'Community Management', 'Paid Social Campaigns', 'Influencer Outreach', 'Analytics & Reporting', 'Brand Voice Development'],
    pricing: [
      { name: 'Starter', price: '$500/mo', features: [{ text: '2 platforms', included: true }, { text: '12 posts/month', included: true }, { text: 'Basic analytics', included: true }, { text: 'Monthly report', included: true }, { text: 'Community management', included: false }, { text: 'Paid social', included: false }] },
      { name: 'Professional', price: '$1,000/mo', highlighted: true, features: [{ text: '4 platforms', included: true }, { text: '20 posts/month', included: true }, { text: 'Stories & Reels', included: true }, { text: 'Community management', included: true }, { text: 'Bi-weekly reports', included: true }, { text: 'Paid social campaigns', included: true }] },
      { name: 'Enterprise', price: '$2,000/mo', features: [{ text: 'All platforms', included: true }, { text: '30+ posts/month', included: true }, { text: 'Influencer outreach', included: true }, { text: 'Full community mgmt', included: true }, { text: 'Weekly reports', included: true }, { text: 'Brand strategy', included: true }] },
    ],
  },
  {
    title: 'Email & CRM Systems',
    slug: 'email-crm-systems',
    icon: 'PenTool',
    tagline: 'Nurture at scale',
    description: 'Email automation, lead nurturing sequences, and CRM setup for scalable growth.',
    features: ['Email Automation Setup', 'Lead Nurturing Flows', 'CRM Configuration', 'Segmentation Strategy', 'A/B Testing', 'Deliverability Optimization'],
    pricing: [
      { name: 'Starter', price: '$700', features: [{ text: 'CRM setup & configuration', included: true }, { text: '3 email sequences', included: true }, { text: 'Contact segmentation', included: true }, { text: 'Basic automation', included: true }, { text: 'A/B testing', included: false }, { text: 'Deliverability audit', included: false }] },
      { name: 'Professional', price: '$1,500', highlighted: true, features: [{ text: 'Everything in Starter', included: true }, { text: '10 email sequences', included: true }, { text: 'Lead scoring setup', included: true }, { text: 'A/B testing framework', included: true }, { text: 'Deliverability optimization', included: true }, { text: 'Team training', included: true }] },
      { name: 'Enterprise', price: '$3,000', features: [{ text: 'Everything in Professional', included: true }, { text: 'Unlimited sequences', included: true }, { text: 'Custom integrations', included: true }, { text: 'Advanced segmentation', included: true }, { text: 'Migration from existing CRM', included: true }, { text: '60-day support', included: true }] },
    ],
  },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0, 1] } } }

function PricingModal({ service, onClose, content }: { service: ServiceItem; onClose: () => void; content?: Record<string, string> }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl border border-brand-mid/[0.08] bg-brand-darkest p-6 md:p-8"
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl overflow-hidden" style={{
          backgroundImage: 'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10">
          {/* Header */}
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

          {/* Pricing cards */}
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
                <Link href={`/book?service=${encodeURIComponent(service.title)}&package=${encodeURIComponent(tier.name)}`} onClick={onClose} className={tier.highlighted ? 'btn-primary w-full text-center text-[13px] h-10' : 'btn-secondary w-full text-center text-[13px] h-10'}>
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

  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container-main">
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="badge">{content.badge}</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="mt-5 heading-lg max-w-2xl">
            {content.heading}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-5 body-lg max-w-xl">
            {content.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-16 md:pb-20 lg:pb-24 pt-6">
        <div className="container-main">
          <motion.div key={services.length} className="grid md:grid-cols-2 gap-5 items-stretch" initial="hidden" animate={services.length > 0 ? 'visible' : 'hidden'} variants={stagger}>
            {services.map((service) => {
              const Icon = getIcon(service.icon)
              return (
                <motion.div key={service.slug} variants={fadeUp} className="h-full">
                  <div className="card-hover h-full p-7 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-brand-mid/10 border border-brand-mid/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand-mid" />
                      </div>
                    </div>

                    {/* Title & tagline */}
                    <h3 className="text-[20px] font-display font-bold text-brand-cream">{service.title}</h3>
                    <p className="text-[13px] font-medium text-brand-gold mt-1">{service.tagline}</p>

                    {/* Description */}
                    <p className="mt-4 text-[14px] leading-[1.7] text-brand-cream/70">{service.description}</p>

                    {/* Features */}
                    <div className="mt-5 pt-5 border-t border-brand-mid/10 grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1">
                      {service.features.map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-mid shrink-0" />
                          <span className="text-[13px] text-brand-cream/60">{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex items-center gap-3">
                      <Link href={buildServiceUrl(service.slug, service.category)} className="btn-secondary h-10 px-5 text-[13px] flex-1 text-center">
                        {content.viewDetailsText || 'View Details'} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => setPricingService(service)} className="btn-primary h-10 px-5 text-[13px] flex-1 text-center">
                        <DollarSign className="w-3.5 h-3.5" /> {content.pricingBtnText || 'Pricing'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
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

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, Check, X, Eye, ChevronDown, ChevronRight, ExternalLink,
} from 'lucide-react'
import {
  getServices, saveServices, getServiceDetail, saveServiceDetail,
  getCategories, type ServiceDetail,
} from '@/lib/collections'
import { useData, useDetailData } from '@/lib/useData'
import { serviceDetailDefaults } from '@/lib/serviceDetailDefaults'
import { iconMap } from '@/lib/iconMap'
import IconPicker from '@/components/admin/IconPicker'
import CategoryPicker from '@/components/admin/CategoryPicker'

function SectionBlock({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="bg-surface-200/80 border border-brand-mid/[0.08] rounded-2xl shadow-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-100/40 transition-colors">
        <span className="text-[14px] font-medium text-brand-cream">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-brand-cream/50" /> : <ChevronRight className="w-4 h-4 text-brand-cream/35" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-brand-mid/[0.05] pt-4">{children}</div>}
    </div>
  )
}

function seedFromDefaults(s: string): ServiceDetail {
  const src = serviceDetailDefaults[s]
  return {
    category: src?.category || '',
    description: src?.description || '',
    heroDescription: src?.overview?.[0] || '',
    ctaPrimaryText: 'Book a Consultation',
    ctaPrimaryLink: '/contact',
    ctaSecondaryText: 'Contact Me',
    ctaSecondaryLink: '/contact',
    quickOverviewItems: [
      { label: `${src?.process?.length || 5}-Step Process` },
      { label: `${src?.deliverables?.length || 10} Deliverables` },
      { label: `${src?.pricing?.length || 3} Pricing Tiers` },
      { label: '30-Day Support' },
    ],
    processSectionTitle: 'The Process',
    process: src?.process || [],
    deliverablesSectionTitle: "What's Included",
    deliverables: src?.deliverables || [],
    pricingSectionTitle: 'Choose Your Plan',
    pricingSectionSubtitle: 'Meet first, pay later. Every plan starts with a free consultation — no upfront payment required.',
    pricing: src?.pricing || [],
    faqSectionTitle: 'Common Questions',
    faqs: src?.faqs || [],
    relatedSectionTitle: 'Explore More',
    relatedSlugs: src?.relatedSlugs || [],
  }
}

export default function ServiceDetailEditor() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { loaded } = useData()
  const { loaded: detailLoaded } = useDetailData('col_service_detail_' + slug)
  const [serviceTitle, setServiceTitle] = useState('')
  const [serviceSlug, setServiceSlug] = useState('')
  const [data, setData] = useState<ServiceDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!slug || !loaded || !detailLoaded) return
    const svc = getServices().find((s) => s.slug === slug)
    if (svc) { setServiceTitle(svc.title); setServiceSlug(svc.slug) }

    // Load saved data, merge with defaults to fill any missing new fields
    const defaults = seedFromDefaults(slug)
    const existing = getServiceDetail(slug)
    if (existing) {
      // Merge: existing data takes priority, but missing fields get defaults
      const merged = { ...defaults, ...existing }
      // Ensure arrays aren't lost
      if (!merged.quickOverviewItems?.length) merged.quickOverviewItems = defaults.quickOverviewItems
      if (!merged.ctaPrimaryText) merged.ctaPrimaryText = defaults.ctaPrimaryText
      if (!merged.ctaPrimaryLink) merged.ctaPrimaryLink = defaults.ctaPrimaryLink
      if (!merged.ctaSecondaryText) merged.ctaSecondaryText = defaults.ctaSecondaryText
      if (!merged.ctaSecondaryLink) merged.ctaSecondaryLink = defaults.ctaSecondaryLink
      if (!merged.heroDescription) merged.heroDescription = defaults.heroDescription
      // Sync: pull latest pricing and category from collection (source of truth)
      const colService = getServices().find((sv) => sv.slug === slug)
      if (colService) {
        if (colService.pricing?.length) merged.pricing = colService.pricing
        if (colService.category) merged.category = colService.category
      }
      setData(merged)
    } else {
      saveServiceDetail(slug, defaults)
      setData(defaults)
    }
  }, [slug, loaded, detailLoaded])

  const handleSave = () => {
    if (!data || !slug) return
    setSaving(true)
    // Save detail page data
    saveServiceDetail(serviceSlug || slug, data)
    // Sync title, slug, category, and pricing back to the main services collection
    const allSvcs = getServices()
    const newSlug = serviceSlug || slug
    const updated = allSvcs.map((s) => s.slug === slug ? { ...s, title: serviceTitle, slug: newSlug, category: data.category, pricing: data.pricing } : s)
    saveServices(updated)
    // If slug changed, migrate detail store key
    if (newSlug !== slug) {
      if (typeof window !== 'undefined') localStorage.removeItem(`col_service_detail_${slug}`)
    }
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000) }, 500)
  }

  if (!data) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 text-brand-cream/40 animate-spin" /></div>

  const d = data
  const setD = (fn: (prev: ServiceDetail) => ServiceDetail) => { setData(fn(data)); setSaved(false) }

  // Build full URL path from category hierarchy
  const buildServicePath = () => {
    const cats = getCategories()
    const cat = cats.find((c) => c.name === d.category)
    if (cat) {
      const parent = cats.find((c) => c.id === cat.parentId)
      if (parent && !parent.id.startsWith('vert-')) {
        return `/services/${parent.slug}/${cat.slug}/${serviceSlug || slug}`
      }
      return `/services/${cat.slug}/${serviceSlug || slug}`
    }
    return `/services/${serviceSlug || slug}`
  }
  const fullPath = buildServicePath()

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/services')} className="h-9 px-3 text-[12px] text-brand-cream/60 hover:text-brand-cream rounded-lg hover:bg-surface-100/60 transition-all inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> All Services
          </button>
          <div className="w-px h-5 bg-brand-mid/10" />
          <div>
            <h1 className="text-[16px] font-semibold text-brand-cream tracking-tight">{serviceTitle} — Detail Page</h1>
            <p className="text-[11px] text-brand-cream/40 font-mono">{fullPath}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={fullPath} target="_blank" rel="noopener noreferrer" className="h-8 px-3 text-[12px] text-brand-cream/50 hover:text-brand-cream rounded-lg hover:bg-surface-200/60 transition-all inline-flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Preview
          </a>
          <button onClick={handleSave} disabled={saving || saved} className="h-8 px-3.5 text-[12px] font-medium bg-brand-gold/90 text-brand-darkest rounded-lg hover:bg-brand-gold transition-all inline-flex items-center gap-1.5 disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* ═══ TITLE & SLUG ═══ */}
      <div className="bg-surface-200/80 border border-brand-mid/[0.08] rounded-2xl shadow-card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Service Title</label><input type="text" value={serviceTitle} onChange={(e) => { setServiceTitle(e.target.value); setSaved(false) }} className="w-full h-10 px-3 text-[15px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream font-semibold focus:outline-none focus:border-brand-mid/15" /></div>
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">URL Slug</label><input type="text" value={serviceSlug} onChange={(e) => { setServiceSlug(e.target.value); setSaved(false) }} className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream font-mono focus:outline-none focus:border-brand-mid/15" /></div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 bg-surface-100/20 border border-brand-mid/[0.05] rounded-lg">
          <ExternalLink className="w-3 h-3 text-brand-gold/50 flex-shrink-0" />
          <span className="text-[11px] text-brand-cream/40 font-mono truncate">domain{fullPath}</span>
        </div>
      </div>

      {/* ═══ HERO SECTION ═══ */}
      <SectionBlock title="Hero Section" defaultOpen>
        <div className="space-y-4">
          <CategoryPicker label="Category Badge" value={d.category} onChange={(v) => setD((p) => ({ ...p, category: v }))} type="service" multiple />

          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Hero Description (paragraph shown below title)</label><textarea value={d.heroDescription || ''} onChange={(e) => setD((p) => ({ ...p, heroDescription: e.target.value }))} rows={5} className="w-full px-3 py-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15 resize-none" /></div>

          <div className="pt-3 border-t border-brand-mid/[0.05]">
            <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">CTA Buttons</span>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Primary Button Text</label><input type="text" value={d.ctaPrimaryText || ''} onChange={(e) => setD((p) => ({ ...p, ctaPrimaryText: e.target.value }))} className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15" /></div>
              <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Primary Button Link</label><input type="text" value={d.ctaPrimaryLink || ''} onChange={(e) => setD((p) => ({ ...p, ctaPrimaryLink: e.target.value }))} className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream font-mono focus:outline-none focus:border-brand-mid/15" /></div>
              <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Secondary Button Text</label><input type="text" value={d.ctaSecondaryText || ''} onChange={(e) => setD((p) => ({ ...p, ctaSecondaryText: e.target.value }))} className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15" /></div>
              <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Secondary Button Link</label><input type="text" value={d.ctaSecondaryLink || ''} onChange={(e) => setD((p) => ({ ...p, ctaSecondaryLink: e.target.value }))} className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream font-mono focus:outline-none focus:border-brand-mid/15" /></div>
            </div>
          </div>

          <div className="pt-3 border-t border-brand-mid/[0.05]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">Quick Overview Card (4 items)</span>
              <button type="button" onClick={() => setD((p) => ({ ...p, quickOverviewItems: [...(p.quickOverviewItems || []), { label: '' }] }))} className="text-[10px] text-brand-gold flex items-center gap-1"><Plus className="w-2.5 h-2.5" /> Add</button>
            </div>
            {(d.quickOverviewItems || []).map((item, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-brand-cream/25 font-mono w-4 text-center">{i + 1}</span>
                <div className="w-32 flex-shrink-0">
                  <IconPicker value={item.icon || 'Layers'} onChange={(v) => setD((p) => ({ ...p, quickOverviewItems: (p.quickOverviewItems || []).map((it, j) => j === i ? { ...it, icon: v } : it) }))} />
                </div>
                <input type="text" value={item.label} onChange={(e) => setD((p) => ({ ...p, quickOverviewItems: (p.quickOverviewItems || []).map((it, j) => j === i ? { ...it, label: e.target.value } : it) }))} placeholder="e.g. 5-Step Process" className="flex-1 h-10 px-3 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream placeholder-brand-cream/25 focus:outline-none focus:border-brand-mid/15" />
                <button onClick={() => setD((p) => ({ ...p, quickOverviewItems: (p.quickOverviewItems || []).filter((_, j) => j !== i) }))} className="text-red-400/50 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* Process Steps */}
      <SectionBlock title="Process Steps">
        <div className="space-y-4">
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Section Title</label><input type="text" value={d.processSectionTitle || ''} onChange={(e) => setD((p) => ({ ...p, processSectionTitle: e.target.value }))} placeholder="The Process" className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream placeholder-brand-cream/25 focus:outline-none focus:border-brand-mid/15" /></div>
        </div>
        <div className="space-y-2 mt-3">
          {d.process.map((step, i) => (
            <div key={i} className="flex items-start gap-3 bg-brand-darkest/30 rounded-xl p-3">
              <span className="text-[12px] text-brand-gold font-mono font-bold mt-2 w-6 text-center">{step.step}</span>
              <div className="flex-1 space-y-2">
                <input type="text" value={step.title} onChange={(e) => setD((p) => ({ ...p, process: p.process.map((s, j) => j === i ? { ...s, title: e.target.value } : s) }))} placeholder="Step title" className="w-full h-9 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream font-medium focus:outline-none focus:border-brand-mid/15" />
                <textarea value={step.description} onChange={(e) => setD((p) => ({ ...p, process: p.process.map((s, j) => j === i ? { ...s, description: e.target.value } : s) }))} rows={2} className="w-full px-3 py-2 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15 resize-none" />
              </div>
              <button onClick={() => setD((p) => ({ ...p, process: p.process.filter((_, j) => j !== i) }))} className="text-red-400/50 hover:text-red-400 mt-2"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          <button onClick={() => setD((p) => ({ ...p, process: [...p.process, { step: p.process.length + 1, title: '', description: '' }] }))} className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-brand-mid/[0.08] hover:border-brand-mid/25 rounded-lg text-brand-cream/40 hover:text-brand-cream/70 text-[11px] transition-all"><Plus className="w-3 h-3" /> Add Step</button>
        </div>
      </SectionBlock>

      {/* Deliverables */}
      <SectionBlock title="Deliverables">
        <div className="mb-3"><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Section Title</label><input type="text" value={d.deliverablesSectionTitle || ''} onChange={(e) => setD((p) => ({ ...p, deliverablesSectionTitle: e.target.value }))} placeholder="What's Included" className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream placeholder-brand-cream/25 focus:outline-none focus:border-brand-mid/15" /></div>
        <div className="space-y-1.5">
          {d.deliverables.map((del, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400/60 flex-shrink-0" />
              <input type="text" value={del} onChange={(e) => setD((p) => ({ ...p, deliverables: p.deliverables.map((d2, j) => j === i ? e.target.value : d2) }))} className="flex-1 h-9 px-3 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15" />
              <button onClick={() => setD((p) => ({ ...p, deliverables: p.deliverables.filter((_, j) => j !== i) }))} className="text-red-400/50 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          <button onClick={() => setD((p) => ({ ...p, deliverables: [...p.deliverables, ''] }))} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-brand-mid/[0.08] hover:border-brand-mid/25 rounded-lg text-brand-cream/40 hover:text-brand-cream/70 text-[11px] transition-all"><Plus className="w-3 h-3" /> Add Deliverable</button>
        </div>
      </SectionBlock>

      {/* Pricing Tiers */}
      <SectionBlock title="Pricing Tiers">
        <div className="space-y-3 mb-4">
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Section Title</label><input type="text" value={d.pricingSectionTitle || ''} onChange={(e) => setD((p) => ({ ...p, pricingSectionTitle: e.target.value }))} placeholder="Choose Your Plan" className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream placeholder-brand-cream/25 focus:outline-none focus:border-brand-mid/15" /></div>
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Section Subtitle</label><input type="text" value={d.pricingSectionSubtitle || ''} onChange={(e) => setD((p) => ({ ...p, pricingSectionSubtitle: e.target.value }))} className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15" /></div>
        </div>
        <div className="space-y-3">
          {d.pricing.map((tier, ti) => (
            <div key={ti} className="bg-brand-darkest/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="text" value={tier.name} onChange={(e) => setD((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, name: e.target.value } : t) }))} placeholder="Tier name" className="w-32 h-9 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream font-medium focus:outline-none focus:border-brand-mid/15" />
                  <input type="text" value={tier.price} onChange={(e) => setD((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, price: e.target.value } : t) }))} placeholder="$500" className="w-28 h-9 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream font-mono focus:outline-none focus:border-brand-mid/15" />
                  <label className="flex items-center gap-1.5 text-[11px] text-brand-cream/40"><input type="checkbox" checked={tier.highlighted || false} onChange={(e) => setD((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, highlighted: e.target.checked } : t) }))} className="rounded" />Popular</label>
                </div>
                <button onClick={() => setD((p) => ({ ...p, pricing: p.pricing.filter((_, j) => j !== ti) }))} className="text-red-400/50 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
              </div>
              <input type="text" value={tier.description} onChange={(e) => setD((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, description: e.target.value } : t) }))} placeholder="Tier description" className="w-full h-9 px-3 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15" />
              <div className="space-y-1">
                {tier.features.map((feat, fi) => (
                  <div key={fi} className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setD((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, features: t.features.map((f2, k) => k === fi ? { ...f2, included: !f2.included } : f2) } : t) }))}
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${feat.included ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/10 text-red-400/50'}`}>
                      {feat.included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    </button>
                    <input type="text" value={feat.text} onChange={(e) => setD((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, features: t.features.map((f2, k) => k === fi ? { ...f2, text: e.target.value } : f2) } : t) }))} className="flex-1 h-7 px-2 text-[11px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
                    <button onClick={() => setD((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, features: t.features.filter((_, k) => k !== fi) } : t) }))} className="text-red-400/40 hover:text-red-400"><Trash2 className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
                <button onClick={() => setD((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, features: [...t.features, { text: '', included: true }] } : t) }))} className="text-[10px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center gap-1 mt-1"><Plus className="w-2.5 h-2.5" /> Add feature</button>
              </div>
            </div>
          ))}
          <button onClick={() => setD((p) => ({ ...p, pricing: [...p.pricing, { name: '', price: '', description: '', features: [{ text: '', included: true }] }] }))} className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-brand-mid/[0.08] hover:border-brand-mid/25 rounded-lg text-brand-cream/40 hover:text-brand-cream/70 text-[11px] transition-all"><Plus className="w-3 h-3" /> Add Tier</button>
        </div>
      </SectionBlock>

      {/* FAQs */}
      <SectionBlock title="FAQs">
        <div className="mb-3"><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Section Title</label><input type="text" value={d.faqSectionTitle || ''} onChange={(e) => setD((p) => ({ ...p, faqSectionTitle: e.target.value }))} placeholder="Common Questions" className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream placeholder-brand-cream/25 focus:outline-none focus:border-brand-mid/15" /></div>
        <div className="space-y-2">
          {d.faqs.map((faq, i) => (
            <div key={i} className="bg-brand-darkest/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-brand-cream/30 font-mono">Q{i + 1}</span>
                <button onClick={() => setD((p) => ({ ...p, faqs: p.faqs.filter((_, j) => j !== i) }))} className="text-red-400/50 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
              </div>
              <input type="text" value={faq.question} onChange={(e) => setD((p) => ({ ...p, faqs: p.faqs.map((f, j) => j === i ? { ...f, question: e.target.value } : f) }))} placeholder="Question" className="w-full h-9 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15" />
              <textarea value={faq.answer} onChange={(e) => setD((p) => ({ ...p, faqs: p.faqs.map((f, j) => j === i ? { ...f, answer: e.target.value } : f) }))} rows={3} placeholder="Answer" className="w-full px-3 py-2 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15 resize-none" />
            </div>
          ))}
          <button onClick={() => setD((p) => ({ ...p, faqs: [...p.faqs, { question: '', answer: '' }] }))} className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-brand-mid/[0.08] hover:border-brand-mid/25 rounded-lg text-brand-cream/40 hover:text-brand-cream/70 text-[11px] transition-all"><Plus className="w-3 h-3" /> Add FAQ</button>
        </div>
      </SectionBlock>

      {/* ═══ RELATED SERVICES ═══ */}
      <SectionBlock title="Related Services">
        {(() => {
          const allSvcs = getServices().filter((sv) => sv.slug !== slug && sv.active)
          const currentService = getServices().find((sv) => sv.slug === slug)
          const selectedSlugs = new Set(d.relatedSlugs)
          const sameCategory = allSvcs.filter((sv) => sv.category === currentService?.category)

          const addSlug = (s: string) => { if (!selectedSlugs.has(s)) setD((p) => ({ ...p, relatedSlugs: [...p.relatedSlugs, s] })) }
          const removeSlug = (s: string) => setD((p) => ({ ...p, relatedSlugs: p.relatedSlugs.filter((r) => r !== s) }))
          const setRandom = () => {
            const shuffled = [...allSvcs].sort(() => Math.random() - 0.5).slice(0, 3)
            setD((p) => ({ ...p, relatedSlugs: shuffled.map((sv) => sv.slug) }))
          }
          const setSameCategory = () => {
            const picks = sameCategory.length ? sameCategory.slice(0, 3) : [...allSvcs].slice(0, 3)
            setD((p) => ({ ...p, relatedSlugs: picks.map((sv) => sv.slug) }))
          }

          return (
            <div className="space-y-4">
              <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Section Title</label><input type="text" value={d.relatedSectionTitle || ''} onChange={(e) => setD((p) => ({ ...p, relatedSectionTitle: e.target.value }))} placeholder="Explore More" className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream placeholder-brand-cream/25 focus:outline-none focus:border-brand-mid/15" /></div>

              {/* Quick actions */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={setSameCategory} className="h-8 px-3 text-[11px] font-medium bg-brand-darkest/30 text-brand-cream/60 rounded-xl hover:bg-surface-300/60 hover:text-brand-cream transition-all">Same Category</button>
                <button type="button" onClick={setRandom} className="h-8 px-3 text-[11px] font-medium bg-brand-darkest/30 text-brand-cream/60 rounded-xl hover:bg-surface-300/60 hover:text-brand-cream transition-all">Random 3</button>
                {d.relatedSlugs.length > 0 && <button type="button" onClick={() => setD((p) => ({ ...p, relatedSlugs: [] }))} className="h-8 px-3 text-[11px] text-red-400/70 hover:text-red-400 transition-colors">Clear All</button>}
              </div>

              {/* Selected services */}
              {d.relatedSlugs.length > 0 && (
                <div>
                  <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">Selected ({d.relatedSlugs.length})</span>
                  <div className="mt-2 space-y-1.5">
                    {d.relatedSlugs.map((rs) => {
                      const svc = allSvcs.find((sv) => sv.slug === rs)
                      const SIcon = iconMap[svc?.icon || 'Globe'] || iconMap['Globe']
                      return (
                        <div key={rs} className="flex items-center gap-2.5 p-2.5 bg-brand-gold/[0.04] rounded-xl">
                          <div className="w-7 h-7 rounded-md bg-brand-gold/10 flex items-center justify-center flex-shrink-0"><SIcon className="w-3.5 h-3.5 text-brand-gold" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-brand-cream font-medium truncate">{svc?.title || rs}</p>
                            <p className="text-[10px] text-brand-cream/35 font-mono">{rs}</p>
                          </div>
                          <button onClick={() => removeSlug(rs)} className="p-1 rounded hover:bg-red-500/10 text-brand-cream/30 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Available services to add */}
              <div>
                <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">Available Services</span>
                <div className="mt-2 space-y-1">
                  {allSvcs.map((svc) => {
                    const isSelected = selectedSlugs.has(svc.slug)
                    const SIcon = iconMap[svc.icon] || iconMap['Globe']
                    return (
                      <button key={svc.slug} type="button" onClick={() => isSelected ? removeSlug(svc.slug) : addSlug(svc.slug)}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all ${isSelected ? 'bg-brand-gold/8 border border-brand-gold/20' : 'bg-surface-200/20 border border-transparent hover:bg-surface-200/40'}`}>
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-brand-gold/15' : 'bg-surface-300/40'}`}>
                          <SIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-gold' : 'text-brand-cream/40'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] font-medium truncate ${isSelected ? 'text-brand-cream' : 'text-brand-cream/60'}`}>{svc.title}</p>
                          <p className="text-[10px] text-brand-cream/30">{svc.category}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-brand-gold/20 border-brand-gold/30' : 'border-brand-mid/10'}`}>
                          {isSelected && <Check className="w-3 h-3 text-brand-gold" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })()}
      </SectionBlock>
    </div>
  )
}

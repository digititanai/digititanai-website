'use client'

import { useState, useEffect } from 'react'
import {
  FileText, Save, Send, ChevronDown, ChevronRight, Plus, Trash2, Search, Globe,
  Loader2, Eye, Clock, Layers, Settings2, ExternalLink, Check, ArrowLeft,
  Star, HelpCircle, BookOpen, Sparkles, BarChart3, Briefcase, Zap,
  Upload, X, Image as ImageIcon, ArrowUp, ArrowDown,
} from 'lucide-react'
import { getHomePageData, saveHomePageData, defaultHomePageData } from '@/lib/homePageData'
import { defaultPageContent, defaultAboutContent } from '@/lib/pageContent'
import type { HomePageData } from '@/lib/homePageData'
import { iconMap } from '@/lib/iconMap'
import IconPicker from '@/components/admin/IconPicker'
import { getServices, getPortfolio, getBlog, getTestimonials } from '@/lib/collections'
import { useData } from '@/lib/useData'
import type { ServiceItem as ColService, PortfolioItem as ColPortfolio, BlogItem as ColBlog, TestimonialItem as ColTestimonial } from '@/lib/collections'

// ══════════════════════════════════════════════
// PAGE LIST DATA
// ══════════════════════════════════════════════

interface PageListItem {
  id: string
  title: string
  slug: string
  status: 'published' | 'draft'
  lastUpdated: string
  sections: number
}

const pagesList: PageListItem[] = [
  { id: 'home', title: 'Home', slug: '/', status: 'published', lastUpdated: '2024-03-20', sections: 6 },
  { id: 'about', title: 'About', slug: '/about', status: 'published', lastUpdated: '2024-03-18', sections: 3 },
  { id: 'services', title: 'Services', slug: '/services', status: 'published', lastUpdated: '2024-03-15', sections: 2 },
  { id: 'portfolio', title: 'Portfolio', slug: '/portfolio', status: 'published', lastUpdated: '2024-03-14', sections: 2 },
  { id: 'blog', title: 'Blog', slug: '/blog', status: 'published', lastUpdated: '2024-03-12', sections: 2 },
  { id: 'pricing', title: 'Pricing', slug: '/pricing', status: 'published', lastUpdated: '2024-03-31', sections: 3 },
  { id: 'contact', title: 'Contact', slug: '/contact', status: 'published', lastUpdated: '2024-03-08', sections: 2 },
  { id: 'book', title: 'Book', slug: '/book', status: 'published', lastUpdated: '2024-03-06', sections: 2 },
  { id: 'privacy', title: 'Privacy Policy', slug: '/privacy', status: 'published', lastUpdated: '2024-03-30', sections: 1 },
  { id: 'terms', title: 'Terms of Service', slug: '/terms', status: 'published', lastUpdated: '2024-03-30', sections: 1 },
  { id: 'header', title: 'Header / Navbar', slug: '', status: 'published', lastUpdated: '2024-03-31', sections: 1 },
  { id: 'footer', title: 'Footer', slug: '', status: 'published', lastUpdated: '2024-03-31', sections: 1 },
]

// ══════════════════════════════════════════════
// REUSABLE EDITOR COMPONENTS
// ══════════════════════════════════════════════

function SectionWrapper({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-surface-200/80 border border-brand-mid/[0.08] rounded-2xl shadow-card overflow-hidden transition-all duration-200 hover:border-brand-mid/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-100/40 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${open ? 'bg-brand-gold/10 text-brand-gold' : 'bg-surface-200/60 text-brand-cream/40'}`}>
            {icon}
          </div>
          <span className="text-[14px] font-medium text-brand-cream">{title}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-brand-cream/50" /> : <ChevronRight className="w-4 h-4 text-brand-cream/35" />}
      </button>
      {open && <div className="px-4 pb-5 border-t border-brand-mid/6 pt-4">{children}</div>}
    </div>
  )
}

function Field({ label, value, onChange, multiline = false, mono = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; mono?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] text-brand-cream/50 font-medium uppercase tracking-wider mb-2">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className={`w-full px-3.5 py-2.5 text-[13px] bg-surface-100/50 border border-brand-mid/10 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/25 focus:ring-1 focus:ring-brand-mid/10 resize-none transition-all ${mono ? 'font-mono' : ''}`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className={`w-full h-10 px-3.5 text-[13px] bg-surface-100/50 border border-brand-mid/10 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/25 focus:ring-1 focus:ring-brand-mid/10 transition-all ${mono ? 'font-mono' : ''}`} />
      )}
    </div>
  )
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>
}

// Use shared ImageUploader with media picker
import ImageUploader from '@/components/admin/ImageUploader'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false, loading: () => <div className="h-[300px] rounded-xl bg-brand-darkest/40 border border-brand-mid/[0.06] animate-pulse" /> })

// ══════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════

type EditorTab = 'content' | 'seo'

export default function PagesManagement() {
  const { loaded } = useData()
  const [editingPage, setEditingPage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<EditorTab>('content')
  const [picker, setPicker] = useState<'services' | 'portfolio' | 'blog' | 'testimonials' | null>(null)
  const [data, setData] = useState<HomePageData | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pageContentData, setPageContentData] = useState<Record<string, any> | null>(null)
  const [pageContentSaving, setPageContentSaving] = useState(false)
  const [pageContentSaved, setPageContentSaved] = useState(false)
  const [pageContentLoaded, setPageContentLoaded] = useState(false)

  useEffect(() => {
    if (!loaded) return
    fetch('/api/data/sabbirahsan_home_page_data', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(fresh => {
      if (fresh && typeof fresh === 'object' && fresh.hero) {
        setData({ ...defaultHomePageData, ...fresh })
      } else {
        setData(getHomePageData())
      }
    }).catch(() => setData(getHomePageData()))
  }, [loaded])

  // Load page content when editing a non-home page
  useEffect(() => {
    if (!editingPage || editingPage === 'home') return
    const defaults = editingPage === 'about' ? defaultAboutContent : defaultPageContent[editingPage as keyof typeof defaultPageContent]
    if (!defaults) return
    setPageContentData(null)
    setPageContentSaved(false)
    setPageContentLoaded(false)
    fetch(`/api/data/page_content_${editingPage}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(fresh => {
        if (fresh && typeof fresh === 'object') {
          setPageContentData({ ...defaults, ...fresh })
        } else {
          setPageContentData({ ...defaults })
        }
      })
      .catch(() => { setPageContentData({ ...defaults }) })
      .finally(() => setPageContentLoaded(true))
  }, [editingPage])

  const filteredPages = pagesList.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const publishedCount = pagesList.filter((p) => p.status === 'published').length
  const draftCount = pagesList.filter((p) => p.status === 'draft').length

  const handlePageContentSave = async () => {
    if (!pageContentData || !editingPage) return
    setPageContentSaving(true)
    try {
      const res = await fetch(`/api/admin/data/page_content_${editingPage}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: pageContentData }),
      })
      if (res.ok) {
        setPageContentSaved(true)
        setTimeout(() => setPageContentSaved(false), 2000)
      }
    } catch {}
    finally { setPageContentSaving(false) }
  }

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    saveHomePageData(data)
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000) }, 600)
  }

  const update = <K extends keyof HomePageData>(section: K, updater: (prev: HomePageData[K]) => HomePageData[K]) => {
    setData((prev) => prev ? { ...prev, [section]: updater(prev[section]) } : prev)
    setSaved(false)
  }

  // ── HOME PAGE EDITOR ──
  if (editingPage === 'home' && data) {
    return (
      <div className="space-y-5">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setEditingPage(null)} className="h-9 px-3 text-[12px] text-brand-cream/60 hover:text-brand-cream rounded-lg hover:bg-surface-100/60 transition-all inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> All Pages
            </button>
            <div className="w-px h-5 bg-brand-mid/10" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-brand-gold" />
              </div>
              <div>
                <h1 className="text-[16px] font-semibold text-brand-cream tracking-tight">Home Page</h1>
                <p className="text-[11px] text-brand-cream/40 font-mono">/</p>
              </div>
              <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-emerald-500/8 text-emerald-400/90 ring-1 ring-emerald-500/15">
                <div className="w-1 h-1 rounded-full bg-emerald-400" /> published
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="h-8 px-3 text-[12px] text-brand-cream/50 hover:text-brand-cream rounded-lg hover:bg-surface-200/60 transition-all inline-flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Preview
            </a>
            <div className="w-px h-5 bg-brand-mid/10" />
            <button onClick={handleSave} disabled={saving || saved} className="h-8 px-3.5 text-[12px] font-medium bg-surface-200/80 border border-brand-mid/12 text-brand-cream rounded-lg hover:bg-surface-300/60 transition-all inline-flex items-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={handleSave} className="h-8 px-3.5 text-[12px] font-medium bg-brand-gold/90 text-brand-darkest rounded-lg hover:bg-brand-gold transition-all inline-flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Publish
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-brand-mid/8">
          {([
            { key: 'content' as EditorTab, label: 'Content', icon: Layers },
            { key: 'seo' as EditorTab, label: 'SEO', icon: Globe },
          ]).map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-colors ${activeTab === tab.key ? 'text-brand-cream' : 'text-brand-cream/40 hover:text-brand-cream/70'}`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-brand-gold rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-3">

            {/* ═══ HERO SECTION ═══ */}
            <SectionWrapper title="Hero Section" icon={<Sparkles className="w-4 h-4" />} defaultOpen>
              <div className="space-y-4">
                <Field label="Badge Text" value={data.hero.badge} onChange={(v) => update('hero', (h) => ({ ...h, badge: v }))} />
                <Field label="Main Heading" value={data.hero.heading} onChange={(v) => update('hero', (h) => ({ ...h, heading: v }))} />
                <Field label="Subtitle" value={data.hero.subtitle} onChange={(v) => update('hero', (h) => ({ ...h, subtitle: v }))} multiline />

                <div className="pt-3 border-t border-brand-mid/6">
                  <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">Hero Photo</span>
                  <div className="mt-3">
                    <ImageUploader label="Profile Photo" value={data.hero.heroImage} onChange={(v) => update('hero', (h) => ({ ...h, heroImage: v }))} />
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-mid/6">
                  <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">Call-to-Action Buttons</span>
                  <div className="mt-3 space-y-3">
                    <FieldRow>
                      <Field label="Primary Button Text" value={data.hero.primaryBtnText} onChange={(v) => update('hero', (h) => ({ ...h, primaryBtnText: v }))} />
                      <Field label="Primary Button Link" value={data.hero.primaryBtnLink} onChange={(v) => update('hero', (h) => ({ ...h, primaryBtnLink: v }))} mono />
                    </FieldRow>
                    <FieldRow>
                      <Field label="Secondary Button Text" value={data.hero.secondaryBtnText} onChange={(v) => update('hero', (h) => ({ ...h, secondaryBtnText: v }))} />
                      <Field label="Secondary Button Link" value={data.hero.secondaryBtnLink} onChange={(v) => update('hero', (h) => ({ ...h, secondaryBtnLink: v }))} mono />
                    </FieldRow>
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-mid/6">
                  <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">Stats</span>
                  <div className="mt-3 space-y-2">
                    {data.hero.stats.map((stat, i) => (
                      <FieldRow key={i}>
                        <Field label={`Stat ${i + 1} Value`} value={stat.value} onChange={(v) => update('hero', (h) => ({ ...h, stats: h.stats.map((s, j) => j === i ? { ...s, value: v } : s) }))} />
                        <Field label={`Stat ${i + 1} Label`} value={stat.label} onChange={(v) => update('hero', (h) => ({ ...h, stats: h.stats.map((s, j) => j === i ? { ...s, label: v } : s) }))} />
                      </FieldRow>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-mid/6">
                  <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">Floating Badges (Photo Area)</span>
                  <div className="mt-3 space-y-2">
                    {data.hero.floatingBadges.map((badge, i) => (
                      <div key={i} className="grid grid-cols-3 gap-3 items-end">
                        <Field label={`Badge ${i + 1} Title`} value={badge.title} onChange={(v) => update('hero', (h) => ({ ...h, floatingBadges: h.floatingBadges.map((b, j) => j === i ? { ...b, title: v } : b) }))} />
                        <Field label={`Badge ${i + 1} Subtitle`} value={badge.subtitle} onChange={(v) => update('hero', (h) => ({ ...h, floatingBadges: h.floatingBadges.map((b, j) => j === i ? { ...b, subtitle: v } : b) }))} />
                        <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">{`Badge ${i + 1} Icon`}</label><IconPicker value={badge.icon} onChange={(v) => update('hero', (h) => ({ ...h, floatingBadges: h.floatingBadges.map((b, j) => j === i ? { ...b, icon: v } : b) }))} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionWrapper>

            {/* ═══ SERVICES ═══ */}
            <SectionWrapper title="Services Overview" icon={<Layers className="w-4 h-4" />}>
              <div className="space-y-4">
                <Field label="Section Heading" value={data.services.heading} onChange={(v) => update('services', (s) => ({ ...s, heading: v }))} />
                <Field label="Section Subtitle" value={data.services.subtitle} onChange={(v) => update('services', (s) => ({ ...s, subtitle: v }))} />
                <Field label="Link Text" value={data.services.linkText} onChange={(v) => update('services', (s) => ({ ...s, linkText: v }))} />

                <div className="pt-3 border-t border-brand-mid/6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">{data.services.services.length} services on home</span>
                    <a href="/admin/services" className="text-[11px] text-brand-gold hover:text-brand-gold-light flex items-center gap-1 transition-colors">
                      <ExternalLink className="w-3 h-3" /> Manage in Services
                    </a>
                  </div>
                  <div className="space-y-1.5">
                    {data.services.services.map((service, i) => {
                      const SIcon = iconMap[service.icon] || iconMap['Globe']
                      return (
                        <div key={i} className="flex items-center gap-2 p-2.5 bg-surface-200/30 border border-brand-mid/8 rounded-lg group/item">
                          <span className="text-[10px] text-brand-cream/25 font-mono w-4 text-center">{i + 1}</span>
                          <div className="w-7 h-7 rounded-md bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                            <SIcon className="w-3.5 h-3.5 text-brand-gold" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] text-brand-cream font-medium truncate">{service.title}</p>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button disabled={i === 0} onClick={() => update('services', (s) => { const arr = [...s.services]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; return { ...s, services: arr } })}
                              className="p-1 rounded hover:bg-surface-300/60 text-brand-cream/40 hover:text-brand-cream disabled:opacity-20 transition-all"><ArrowUp className="w-3 h-3" /></button>
                            <button disabled={i === data.services.services.length - 1} onClick={() => update('services', (s) => { const arr = [...s.services]; [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; return { ...s, services: arr } })}
                              className="p-1 rounded hover:bg-surface-300/60 text-brand-cream/40 hover:text-brand-cream disabled:opacity-20 transition-all"><ArrowDown className="w-3 h-3" /></button>
                            <button onClick={() => update('services', (s) => ({ ...s, services: s.services.filter((_, j) => j !== i) }))}
                              className="p-1 rounded hover:bg-red-500/10 text-brand-cream/40 hover:text-red-400 transition-all"><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => setPicker('services')}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-brand-mid/12 hover:border-brand-mid/25 hover:bg-surface-100/30 rounded-lg text-brand-cream/40 hover:text-brand-cream/70 text-[11px] transition-all">
                    <Plus className="w-3 h-3" /> Add Service to Home
                  </button>
                </div>
              </div>
            </SectionWrapper>

            {/* ═══ PORTFOLIO ═══ */}
            <SectionWrapper title="Featured Portfolio" icon={<BarChart3 className="w-4 h-4" />}>
              <div className="space-y-4">
                <FieldRow>
                  <Field label="Badge Text" value={data.portfolio.badge} onChange={(v) => update('portfolio', (p) => ({ ...p, badge: v }))} />
                  <Field label="Link Text" value={data.portfolio.linkText} onChange={(v) => update('portfolio', (p) => ({ ...p, linkText: v }))} />
                </FieldRow>
                <Field label="Section Heading" value={data.portfolio.heading} onChange={(v) => update('portfolio', (p) => ({ ...p, heading: v }))} />

                <div className="pt-3 border-t border-brand-mid/6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">{data.portfolio.projects.length} projects on home</span>
                    <a href="/admin/portfolio" className="text-[11px] text-brand-gold hover:text-brand-gold-light flex items-center gap-1 transition-colors">
                      <ExternalLink className="w-3 h-3" /> Manage in Portfolio
                    </a>
                  </div>
                  <div className="space-y-1.5">
                    {data.portfolio.projects.map((project, i) => {
                      const PIcon = iconMap[project.icon] || iconMap['TrendingUp']
                      return (
                        <div key={i} className="flex items-center gap-2 p-2.5 bg-surface-200/30 border border-brand-mid/8 rounded-lg group/item">
                          <span className="text-[10px] text-brand-cream/25 font-mono w-4 text-center">{i + 1}</span>
                          <div className="w-7 h-7 rounded-md bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                            <PIcon className="w-3.5 h-3.5 text-brand-gold" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] text-brand-cream font-medium truncate">{project.title}</p>
                            <p className="text-[10px] text-brand-cream/35 truncate">{project.category}</p>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button disabled={i === 0} onClick={() => update('portfolio', (p) => { const arr = [...p.projects]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; return { ...p, projects: arr } })}
                              className="p-1 rounded hover:bg-surface-300/60 text-brand-cream/40 hover:text-brand-cream disabled:opacity-20 transition-all"><ArrowUp className="w-3 h-3" /></button>
                            <button disabled={i === data.portfolio.projects.length - 1} onClick={() => update('portfolio', (p) => { const arr = [...p.projects]; [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; return { ...p, projects: arr } })}
                              className="p-1 rounded hover:bg-surface-300/60 text-brand-cream/40 hover:text-brand-cream disabled:opacity-20 transition-all"><ArrowDown className="w-3 h-3" /></button>
                            <button onClick={() => update('portfolio', (p) => ({ ...p, projects: p.projects.filter((_, j) => j !== i) }))}
                              className="p-1 rounded hover:bg-red-500/10 text-brand-cream/40 hover:text-red-400 transition-all"><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => setPicker('portfolio')}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-brand-mid/12 hover:border-brand-mid/25 hover:bg-surface-100/30 rounded-lg text-brand-cream/40 hover:text-brand-cream/70 text-[11px] transition-all">
                    <Plus className="w-3 h-3" /> Add Project to Home
                  </button>
                </div>
              </div>
            </SectionWrapper>

            {/* ═══ TESTIMONIALS ═══ */}
            <SectionWrapper title="Testimonials" icon={<Star className="w-4 h-4" />}>
              <div className="space-y-4">
                <FieldRow>
                  <Field label="Badge Text" value={data.testimonials.badge} onChange={(v) => update('testimonials', (t) => ({ ...t, badge: v }))} />
                  <Field label="Section Heading" value={data.testimonials.heading} onChange={(v) => update('testimonials', (t) => ({ ...t, heading: v }))} />
                </FieldRow>
                <Field label="Subtitle" value={data.testimonials.subtitle} onChange={(v) => update('testimonials', (t) => ({ ...t, subtitle: v }))} />

                <div className="pt-3 border-t border-brand-mid/6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">{data.testimonials.testimonials.length} testimonials on home</span>
                    <a href="/admin/testimonials" className="text-[11px] text-brand-gold hover:text-brand-gold-light flex items-center gap-1 transition-colors">
                      <ExternalLink className="w-3 h-3" /> Manage Testimonials
                    </a>
                  </div>
                  <div className="space-y-1.5">
                    {data.testimonials.testimonials.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 bg-surface-200/30 border border-brand-mid/8 rounded-lg group/item">
                        <span className="text-[10px] text-brand-cream/25 font-mono w-4 text-center">{i + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-brand-mid/15 border border-brand-mid/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-brand-mid">{t.initials}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] text-brand-cream font-medium truncate">{t.name}</p>
                          <p className="text-[10px] text-brand-cream/35 truncate">{t.role}, {t.company}</p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button disabled={i === 0} onClick={() => update('testimonials', (ts) => { const arr = [...ts.testimonials]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; return { ...ts, testimonials: arr } })}
                            className="p-1 rounded hover:bg-surface-300/60 text-brand-cream/40 hover:text-brand-cream disabled:opacity-20 transition-all"><ArrowUp className="w-3 h-3" /></button>
                          <button disabled={i === data.testimonials.testimonials.length - 1} onClick={() => update('testimonials', (ts) => { const arr = [...ts.testimonials]; [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; return { ...ts, testimonials: arr } })}
                            className="p-1 rounded hover:bg-surface-300/60 text-brand-cream/40 hover:text-brand-cream disabled:opacity-20 transition-all"><ArrowDown className="w-3 h-3" /></button>
                          <button onClick={() => update('testimonials', (ts) => ({ ...ts, testimonials: ts.testimonials.filter((_, j) => j !== i) }))}
                            className="p-1 rounded hover:bg-red-500/10 text-brand-cream/40 hover:text-red-400 transition-all"><X className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPicker('testimonials')}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-brand-mid/12 hover:border-brand-mid/25 hover:bg-surface-100/30 rounded-lg text-brand-cream/40 hover:text-brand-cream/70 text-[11px] transition-all">
                    <Plus className="w-3 h-3" /> Add Testimonial to Home
                  </button>
                </div>
              </div>
            </SectionWrapper>

            {/* ═══ BLOG ═══ */}
            <SectionWrapper title="Blog Preview" icon={<BookOpen className="w-4 h-4" />}>
              <div className="space-y-4">
                <FieldRow>
                  <Field label="Badge Text" value={data.blog.badge} onChange={(v) => update('blog', (b) => ({ ...b, badge: v }))} />
                  <Field label="Section Heading" value={data.blog.heading} onChange={(v) => update('blog', (b) => ({ ...b, heading: v }))} />
                </FieldRow>
                <Field label="Link Text" value={data.blog.linkText} onChange={(v) => update('blog', (b) => ({ ...b, linkText: v }))} />

                <div className="pt-3 border-t border-brand-mid/6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">{data.blog.posts.length} posts on home</span>
                    <a href="/admin/blog" className="text-[11px] text-brand-gold hover:text-brand-gold-light flex items-center gap-1 transition-colors">
                      <ExternalLink className="w-3 h-3" /> Manage in Blog
                    </a>
                  </div>
                  <div className="space-y-1.5">
                    {data.blog.posts.map((post, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 bg-surface-200/30 border border-brand-mid/8 rounded-lg group/item">
                        <span className="text-[10px] text-brand-cream/25 font-mono w-4 text-center">{i + 1}</span>
                        <div className="w-7 h-7 rounded-md bg-surface-300/60 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-3 h-3 text-brand-cream/40" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] text-brand-cream font-medium truncate">{post.title}</p>
                          <p className="text-[10px] text-brand-cream/35">{post.category} · {post.date}</p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button disabled={i === 0} onClick={() => update('blog', (b) => { const arr = [...b.posts]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; return { ...b, posts: arr } })}
                            className="p-1 rounded hover:bg-surface-300/60 text-brand-cream/40 hover:text-brand-cream disabled:opacity-20 transition-all"><ArrowUp className="w-3 h-3" /></button>
                          <button disabled={i === data.blog.posts.length - 1} onClick={() => update('blog', (b) => { const arr = [...b.posts]; [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; return { ...b, posts: arr } })}
                            className="p-1 rounded hover:bg-surface-300/60 text-brand-cream/40 hover:text-brand-cream disabled:opacity-20 transition-all"><ArrowDown className="w-3 h-3" /></button>
                          <button onClick={() => update('blog', (b) => ({ ...b, posts: b.posts.filter((_, j) => j !== i) }))}
                            className="p-1 rounded hover:bg-red-500/10 text-brand-cream/40 hover:text-red-400 transition-all"><X className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPicker('blog')}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-brand-mid/12 hover:border-brand-mid/25 hover:bg-surface-100/30 rounded-lg text-brand-cream/40 hover:text-brand-cream/70 text-[11px] transition-all">
                    <Plus className="w-3 h-3" /> Add Post to Home
                  </button>
                </div>
              </div>
            </SectionWrapper>

            {/* ═══ FAQ SECTION ═══ */}
            <SectionWrapper title="FAQ Section" icon={<HelpCircle className="w-4 h-4" />}>
              <div className="space-y-4">
                <FieldRow>
                  <Field label="Section Heading" value={data.faq.heading} onChange={(v) => update('faq', (f) => ({ ...f, heading: v }))} />
                  <Field label="Section Subtitle" value={data.faq.subtitle} onChange={(v) => update('faq', (f) => ({ ...f, subtitle: v }))} />
                </FieldRow>

                <div className="pt-3 border-t border-brand-mid/6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-brand-cream/40 uppercase tracking-wider font-medium">FAQ Items ({data.faq.faqs.length})</span>
                    <button onClick={() => update('faq', (f) => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }))}
                      className="text-[11px] text-brand-gold hover:text-brand-gold-light flex items-center gap-1 transition-colors">
                      <Plus className="w-3 h-3" /> Add FAQ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.faq.faqs.map((faq, i) => (
                      <div key={i} className="bg-surface-200/30 border border-brand-mid/6 rounded-lg p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-brand-cream/40 font-mono">Q{String(i + 1).padStart(2, '0')}</span>
                          <button onClick={() => update('faq', (f) => ({ ...f, faqs: f.faqs.filter((_, j) => j !== i) }))}
                            className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <Field label="Question" value={faq.question} onChange={(v) => update('faq', (f) => ({ ...f, faqs: f.faqs.map((fq, j) => j === i ? { ...fq, question: v } : fq) }))} />
                        <Field label="Answer" value={faq.answer} onChange={(v) => update('faq', (f) => ({ ...f, faqs: f.faqs.map((fq, j) => j === i ? { ...fq, answer: v } : fq) }))} multiline />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionWrapper>

          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div className="bg-surface-200/80 border border-brand-mid/[0.08] rounded-2xl shadow-card p-5 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-brand-mid/6">
                <Settings2 className="w-4 h-4 text-brand-gold/80" />
                <span className="text-[13px] font-medium text-brand-cream">Meta Information</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-brand-cream/50 font-medium uppercase tracking-wider">Meta Title</label>
                  <span className={`text-[10px] font-mono ${data.seo.metaTitle.length > 60 ? 'text-red-400' : data.seo.metaTitle.length > 50 ? 'text-amber-400' : 'text-brand-cream/30'}`}>
                    {data.seo.metaTitle.length}/60
                  </span>
                </div>
                <input type="text" value={data.seo.metaTitle} onChange={(e) => update('seo', (s) => ({ ...s, metaTitle: e.target.value }))}
                  className="w-full h-10 px-3.5 text-[13px] bg-surface-100/50 border border-brand-mid/10 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/25 focus:ring-1 focus:ring-brand-mid/10 transition-all" />
                <div className="mt-1.5 h-1 bg-surface-200/60 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${data.seo.metaTitle.length > 60 ? 'bg-red-400' : data.seo.metaTitle.length > 50 ? 'bg-amber-400' : 'bg-emerald-400/60'}`}
                    style={{ width: `${Math.min((data.seo.metaTitle.length / 60) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-brand-cream/50 font-medium uppercase tracking-wider">Meta Description</label>
                  <span className={`text-[10px] font-mono ${data.seo.metaDescription.length > 160 ? 'text-red-400' : data.seo.metaDescription.length > 140 ? 'text-amber-400' : 'text-brand-cream/30'}`}>
                    {data.seo.metaDescription.length}/160
                  </span>
                </div>
                <textarea value={data.seo.metaDescription} onChange={(e) => update('seo', (s) => ({ ...s, metaDescription: e.target.value }))} rows={3}
                  className="w-full px-3.5 py-2.5 text-[13px] bg-surface-100/50 border border-brand-mid/10 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/25 focus:ring-1 focus:ring-brand-mid/10 resize-none transition-all" />
                <div className="mt-1.5 h-1 bg-surface-200/60 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${data.seo.metaDescription.length > 160 ? 'bg-red-400' : data.seo.metaDescription.length > 140 ? 'bg-amber-400' : 'bg-emerald-400/60'}`}
                    style={{ width: `${Math.min((data.seo.metaDescription.length / 160) * 100, 100)}%` }} />
                </div>
              </div>
              <ImageUploader label="OG Image (1200x630)" value={data.seo.ogImage} onChange={(v) => update('seo', (s) => ({ ...s, ogImage: v }))} />
            </div>

            {/* Search Preview */}
            <div className="bg-surface-200/80 border border-brand-mid/[0.08] rounded-2xl shadow-card p-5">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-brand-mid/6">
                <Eye className="w-4 h-4 text-brand-gold/80" />
                <span className="text-[13px] font-medium text-brand-cream">Search Preview</span>
              </div>
              <div className="bg-white rounded-lg p-4 max-w-lg">
                <p className="text-[#1a0dab] text-[16px] leading-snug font-medium truncate">{data.seo.metaTitle || 'Home'}</p>
                <p className="text-[#006621] text-[13px] mt-1 flex items-center gap-1"><ExternalLink className="w-3 h-3" />sabbirahsan.com</p>
                <p className="text-[#545454] text-[13px] mt-1 line-clamp-2 leading-relaxed">{data.seo.metaDescription}</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PICKER MODAL ═══ */}
        {picker && data && (() => {
          const allServices = getServices()
          const allPortfolio = getPortfolio()
          const allBlog = getBlog()
          const allTestimonials = getTestimonials()

          const existingServiceIds = new Set(data.services.services.map((s) => s.id))
          const existingPortfolioIds = new Set(data.portfolio.projects.map((p) => p.id))
          const existingBlogIds = new Set(data.blog.posts.map((p) => p.id))
          const existingTestimonialIds = new Set(data.testimonials.testimonials.map((t) => t.id))

          const pickerTitle = { services: 'Select a Service', portfolio: 'Select a Project', blog: 'Select a Blog Post', testimonials: 'Select a Testimonial' }[picker]

          return (<>
            <div onClick={() => setPicker(null)} className="fixed inset-0 z-50 bg-black/60" />
            <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 bg-brand-darkest border border-brand-mid/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-mid/10">
                <span className="text-[14px] font-medium text-brand-cream">{pickerTitle}</span>
                <button onClick={() => setPicker(null)} className="p-1 rounded hover:bg-brand-mid/10 text-brand-cream/50"><X className="w-4 h-4" /></button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1.5">
                {picker === 'services' && allServices.filter((s) => s.active).map((s) => {
                  const already = existingServiceIds.has(s.id)
                  const SIcon = iconMap[s.icon] || iconMap['Globe']
                  return (
                    <button key={s.id} disabled={already} onClick={() => { update('services', (sv) => ({ ...sv, services: [...sv.services, { id: s.id, title: s.title, description: s.description, slug: s.slug, icon: s.icon }] })); setPicker(null) }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${already ? 'opacity-40 cursor-not-allowed' : 'hover:bg-surface-100/60 cursor-pointer'}`}>
                      <div className="w-8 h-8 rounded-md bg-brand-mid/10 flex items-center justify-center flex-shrink-0"><SIcon className="w-4 h-4 text-brand-mid" /></div>
                      <div className="min-w-0 flex-1"><p className="text-[13px] text-brand-cream font-medium truncate">{s.title}</p><p className="text-[11px] text-brand-cream/40 truncate">{s.description}</p></div>
                      {already && <span className="text-[10px] text-brand-cream/30 flex-shrink-0">Added</span>}
                    </button>
                  )
                })}

                {picker === 'portfolio' && allPortfolio.map((p) => {
                  const already = existingPortfolioIds.has(p.id)
                  const PIcon = iconMap[p.icon] || iconMap['TrendingUp']
                  return (
                    <button key={p.id} disabled={already} onClick={() => { update('portfolio', (pf) => ({ ...pf, projects: [...pf.projects, { id: p.id, title: p.title, category: p.category, description: p.description, slug: p.slug, icon: p.icon, metrics: [...p.metrics] }] })); setPicker(null) }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${already ? 'opacity-40 cursor-not-allowed' : 'hover:bg-surface-100/60 cursor-pointer'}`}>
                      <div className="w-8 h-8 rounded-md bg-brand-gold/10 flex items-center justify-center flex-shrink-0"><PIcon className="w-4 h-4 text-brand-gold" /></div>
                      <div className="min-w-0 flex-1"><p className="text-[13px] text-brand-cream font-medium truncate">{p.title}</p><p className="text-[11px] text-brand-cream/40">{p.category} · {p.clientName}</p></div>
                      {already && <span className="text-[10px] text-brand-cream/30 flex-shrink-0">Added</span>}
                    </button>
                  )
                })}

                {picker === 'blog' && allBlog.filter((b) => b.status === 'published').map((b) => {
                  const already = existingBlogIds.has(b.id)
                  return (
                    <button key={b.id} disabled={already} onClick={() => { update('blog', (bl) => ({ ...bl, posts: [...bl.posts, { id: b.id, title: b.title, excerpt: b.excerpt, category: b.category, date: b.date, readTime: b.readTime }] })); setPicker(null) }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${already ? 'opacity-40 cursor-not-allowed' : 'hover:bg-surface-100/60 cursor-pointer'}`}>
                      <div className="w-8 h-8 rounded-md bg-surface-300/60 flex items-center justify-center flex-shrink-0"><BookOpen className="w-3.5 h-3.5 text-brand-cream/40" /></div>
                      <div className="min-w-0 flex-1"><p className="text-[13px] text-brand-cream font-medium truncate">{b.title}</p><p className="text-[11px] text-brand-cream/40">{b.category} · {b.date}</p></div>
                      {already && <span className="text-[10px] text-brand-cream/30 flex-shrink-0">Added</span>}
                    </button>
                  )
                })}

                {picker === 'testimonials' && allTestimonials.filter((t) => t.active).map((t) => {
                  const already = existingTestimonialIds.has(t.id)
                  return (
                    <button key={t.id} disabled={already} onClick={() => { update('testimonials', (ts) => ({ ...ts, testimonials: [...ts.testimonials, { id: t.id, quote: t.quote, name: t.name, company: t.company, role: t.role, initials: t.initials }] })); setPicker(null) }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${already ? 'opacity-40 cursor-not-allowed' : 'hover:bg-surface-100/60 cursor-pointer'}`}>
                      <div className="w-8 h-8 rounded-full bg-brand-mid/15 border border-brand-mid/20 flex items-center justify-center flex-shrink-0"><span className="text-[10px] font-bold text-brand-mid">{t.initials}</span></div>
                      <div className="min-w-0 flex-1"><p className="text-[13px] text-brand-cream font-medium truncate">{t.name}</p><p className="text-[11px] text-brand-cream/40 truncate">{t.role}, {t.company}</p></div>
                      {already && <span className="text-[10px] text-brand-cream/30 flex-shrink-0">Added</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </>)
        })()}
      </div>
    )
  }

  // ── OTHER PAGE EDITOR ──
  if (editingPage && editingPage !== 'home' && pageContentData && pageContentLoaded) {
    const page = pagesList.find((p) => p.id === editingPage)
    const pageKey = editingPage as keyof typeof defaultPageContent
    const fields = defaultPageContent[pageKey] ? Object.keys(defaultPageContent[pageKey]) : []

    const fieldLabels: Record<string, string> = {
      badge: 'Badge Text',
      heading: 'Main Heading',
      subtitle: 'Subtitle',
      bio1: 'Bio Paragraph 1',
      bio2: 'Bio Paragraph 2',
      email: 'Email Address',
      phone: 'Phone Number',
      location: 'Location',
      hours: 'Business Hours',
      perks: 'Sidebar Perks (one per line)',
      ctaHeading: 'CTA Card Heading',
      ctaDescription: 'CTA Card Description',
      ctaButtonText: 'CTA Button Text',
      ctaButtonLink: 'CTA Button Link',
      followHeading: 'Follow Section Heading',
      viewDetailsText: 'View Details Button',
      pricingBtnText: 'Pricing Button',
      consultationNote: 'Consultation Note',
      bookBtnText: 'Book Button Text',
      popularLabel: 'Popular Badge Label',
      lastUpdated: 'Last Updated Date',
      content: 'Page Content (HTML)',
      logoFirst: 'Logo First Part',
      logoSecond: 'Logo Second Part',
      buttonText: 'CTA Button Text',
      buttonLink: 'CTA Button Link',
      ctaBtn1Text: 'CTA Button 1 Text',
      ctaBtn1Link: 'CTA Button 1 Link',
      ctaBtn2Text: 'CTA Button 2 Text',
      ctaBtn2Link: 'CTA Button 2 Link',
      brandDescription: 'Brand Description',
      copyright: 'Copyright Text',
      navigationHeading: 'Navigation Column Heading',
      servicesHeading: 'Services Column Heading',
      contactHeading: 'Contact Column Heading',
      privacyText: 'Privacy Link Text',
      privacyLink: 'Privacy Link URL',
      termsText: 'Terms Link Text',
      termsLink: 'Terms Link URL',
      seoTitle: 'Meta Title',
      seoDescription: 'Meta Description',
      seoImage: 'OG Image',
    }

    return (
      <div className="space-y-5">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setEditingPage(null); setPageContentData(null) }} className="h-9 px-3 text-[12px] text-brand-cream/60 hover:text-brand-cream rounded-lg hover:bg-surface-100/60 transition-all inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> All Pages
            </button>
            <div className="w-px h-5 bg-brand-mid/10" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-brand-gold" />
              </div>
              <div>
                <h1 className="text-[16px] font-semibold text-brand-cream tracking-tight">{page?.title}{editingPage !== 'header' && editingPage !== 'footer' ? ' Page' : ''}</h1>
                <p className="text-[11px] text-brand-cream/40 font-mono">{page?.slug || '(global component)'}</p>
              </div>
              <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-emerald-500/8 text-emerald-400/90 ring-1 ring-emerald-500/15">
                <div className="w-1 h-1 rounded-full bg-emerald-400" /> {page?.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {page?.slug && (
              <a href={page.slug} target="_blank" rel="noopener noreferrer" className="h-8 px-3 text-[12px] text-brand-cream/50 hover:text-brand-cream rounded-lg hover:bg-surface-200/60 transition-all inline-flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Preview
              </a>
            )}
            <div className="w-px h-5 bg-brand-mid/10" />
            <button onClick={handlePageContentSave} disabled={pageContentSaving || pageContentSaved} className="h-8 px-3.5 text-[12px] font-medium bg-brand-gold/90 text-brand-darkest rounded-lg hover:bg-brand-gold transition-all inline-flex items-center gap-1.5 disabled:opacity-50">
              {pageContentSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : pageContentSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {pageContentSaving ? 'Saving...' : pageContentSaved ? 'Saved!' : 'Save & Publish'}
            </button>
          </div>
        </div>

        {/* About Page — Photo */}
        {editingPage === 'about' && (
          <SectionWrapper title="Profile Photo" icon={<Star className="w-4 h-4" />} defaultOpen>
            <ImageUploader label="About Page Photo" value={pageContentData.image || ''} onChange={(v) => { setPageContentData((prev: typeof pageContentData) => prev ? { ...prev, image: v } : prev); setPageContentSaved(false) }} hint="Recommended: Portrait photo, at least 600x800px" />
          </SectionWrapper>
        )}

        {/* Editor Content */}
        <SectionWrapper title={editingPage === 'header' ? 'Navbar Settings' : editingPage === 'footer' ? 'Footer Settings' : 'Hero Section'} icon={<Sparkles className="w-4 h-4" />} defaultOpen>
          <div className="space-y-4">
            {[
              'badge', 'heading', 'subtitle',
              ...(editingPage === 'about' ? ['bio1', 'bio2'] : []),
              ...(editingPage === 'contact' ? ['email', 'phone', 'location', 'hours', 'ctaHeading', 'ctaDescription', 'ctaButtonText', 'ctaButtonLink', 'followHeading'] : []),
              ...(editingPage === 'book' ? ['perks'] : []),
              ...(editingPage === 'services' ? ['viewDetailsText', 'pricingBtnText', 'consultationNote', 'bookBtnText', 'popularLabel'] : []),
              ...(editingPage === 'privacy' || editingPage === 'terms' ? ['lastUpdated', 'content'] : []),
              ...(editingPage === 'header' ? ['logoFirst', 'logoSecond', 'buttonText', 'buttonLink'] : []),
              ...(editingPage === 'footer' ? ['ctaHeading', 'ctaDescription', 'ctaBtn1Text', 'ctaBtn1Link', 'ctaBtn2Text', 'ctaBtn2Link', 'brandDescription', 'navigationHeading', 'servicesHeading', 'contactHeading', 'email', 'phone', 'location', 'hours', 'copyright', 'privacyText', 'privacyLink', 'termsText', 'termsLink'] : []),
            ].filter(f => pageContentData[f] !== undefined).map((field) => (
              field === 'content' ? (
                <div key={field}>
                  <label className="block text-[11px] text-brand-cream/50 font-medium uppercase tracking-wider mb-2">Page Content</label>
                  <p className="text-[10px] text-brand-cream/25 mb-3">Type / for formatting options — headings, lists, quotes, bold, links, and more.</p>
                  <RichTextEditor
                    key={`${editingPage}-content`}
                    value={pageContentData[field] || ''}
                    onChange={(v) => { setPageContentData((prev: typeof pageContentData) => prev ? { ...prev, [field]: v } : prev); setPageContentSaved(false) }}
                    placeholder="Start writing your page content..."
                  />
                </div>
              ) : (
              <Field
                key={field}
                label={fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1)}
                value={pageContentData[field] || ''}
                onChange={(v) => { setPageContentData((prev: typeof pageContentData) => prev ? { ...prev, [field]: v } : prev); setPageContentSaved(false) }}
                multiline={field === 'subtitle' || field === 'bio1' || field === 'bio2' || field === 'perks' || field === 'consultationNote' || field === 'ctaDescription' || field === 'brandDescription'}
              />)
            ))}
          </div>
        </SectionWrapper>

        {/* About Page — Stats */}
        {editingPage === 'about' && pageContentData.stats && (
          <SectionWrapper title="Stats" icon={<BarChart3 className="w-4 h-4" />}>
            <div className="space-y-3">
              {pageContentData.stats.map((s: { value: string; label: string }, i: number) => (
                <div key={i} className="grid grid-cols-[80px_1fr_auto] gap-2 items-center">
                  <input value={s.value} onChange={(e) => { const next = [...pageContentData.stats]; next[i] = { ...next[i], value: e.target.value }; setPageContentData((p: typeof pageContentData) => p ? { ...p, stats: next } : p); setPageContentSaved(false) }} className="h-9 px-2.5 text-[13px] font-bold bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-gold focus:outline-none focus:border-brand-mid/15 text-center" />
                  <input value={s.label} onChange={(e) => { const next = [...pageContentData.stats]; next[i] = { ...next[i], label: e.target.value }; setPageContentData((p: typeof pageContentData) => p ? { ...p, stats: next } : p); setPageContentSaved(false) }} className="h-9 px-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
                  <button onClick={() => { const next = pageContentData.stats.filter((_: unknown, j: number) => j !== i); setPageContentData((p: typeof pageContentData) => p ? { ...p, stats: next } : p); setPageContentSaved(false) }} className="text-red-400/40 hover:text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <button onClick={() => { setPageContentData((p: typeof pageContentData) => p ? { ...p, stats: [...(p.stats || []), { value: '', label: '' }] } : p); setPageContentSaved(false) }} className="w-full py-2 border border-dashed border-brand-mid/[0.08] rounded-lg text-[10px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-2.5 h-2.5" /> Add Stat</button>
            </div>
          </SectionWrapper>
        )}

        {/* About Page — Skills */}
        {editingPage === 'about' && pageContentData.skills && (
          <SectionWrapper title="Skills" icon={<Zap className="w-4 h-4" />}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Section Badge" value={pageContentData.skillsBadge || ''} onChange={(v) => { setPageContentData((p: typeof pageContentData) => p ? { ...p, skillsBadge: v } : p); setPageContentSaved(false) }} />
                <Field label="Section Heading" value={pageContentData.skillsHeading || ''} onChange={(v) => { setPageContentData((p: typeof pageContentData) => p ? { ...p, skillsHeading: v } : p); setPageContentSaved(false) }} />
              </div>
              {pageContentData.skills.map((s: { name: string; icon: string; desc: string }, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_100px_1fr_auto] gap-2 items-center">
                  <input value={s.name} onChange={(e) => { const next = [...pageContentData.skills]; next[i] = { ...next[i], name: e.target.value }; setPageContentData((p: typeof pageContentData) => p ? { ...p, skills: next } : p); setPageContentSaved(false) }} placeholder="Skill Name" className="h-9 px-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
                  <IconPicker value={s.icon} onChange={(v) => { const next = [...pageContentData.skills]; next[i] = { ...next[i], icon: v }; setPageContentData((p: typeof pageContentData) => p ? { ...p, skills: next } : p); setPageContentSaved(false) }} />
                  <input value={s.desc} onChange={(e) => { const next = [...pageContentData.skills]; next[i] = { ...next[i], desc: e.target.value }; setPageContentData((p: typeof pageContentData) => p ? { ...p, skills: next } : p); setPageContentSaved(false) }} placeholder="Description" className="h-9 px-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream/70 focus:outline-none focus:border-brand-mid/15" />
                  <button onClick={() => { const next = pageContentData.skills.filter((_: unknown, j: number) => j !== i); setPageContentData((p: typeof pageContentData) => p ? { ...p, skills: next } : p); setPageContentSaved(false) }} className="text-red-400/40 hover:text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <button onClick={() => { setPageContentData((p: typeof pageContentData) => p ? { ...p, skills: [...(p.skills || []), { name: '', icon: 'Star', desc: '' }] } : p); setPageContentSaved(false) }} className="w-full py-2 border border-dashed border-brand-mid/[0.08] rounded-lg text-[10px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-2.5 h-2.5" /> Add Skill</button>
            </div>
          </SectionWrapper>
        )}

        {/* About Page — Experience */}
        {editingPage === 'about' && pageContentData.experiences && (
          <SectionWrapper title="Experience" icon={<Briefcase className="w-4 h-4" />}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Section Badge" value={pageContentData.experienceBadge || ''} onChange={(v) => { setPageContentData((p: typeof pageContentData) => p ? { ...p, experienceBadge: v } : p); setPageContentSaved(false) }} />
                <Field label="Section Heading" value={pageContentData.experienceHeading || ''} onChange={(v) => { setPageContentData((p: typeof pageContentData) => p ? { ...p, experienceHeading: v } : p); setPageContentSaved(false) }} />
              </div>
              {pageContentData.experiences.map((exp: { year: string; role: string; company: string; desc: string }, i: number) => (
                <div key={i} className="rounded-lg border border-brand-mid/[0.06] bg-brand-darkest/30 p-3 space-y-2">
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-2">
                    <input value={exp.year} onChange={(e) => { const next = [...pageContentData.experiences]; next[i] = { ...next[i], year: e.target.value }; setPageContentData((p: typeof pageContentData) => p ? { ...p, experiences: next } : p); setPageContentSaved(false) }} placeholder="2022 – Present" className="h-8 px-2 text-[11px] bg-brand-darkest/50 border border-brand-mid/[0.06] rounded-md text-brand-gold font-mono focus:outline-none" />
                    <input value={exp.role} onChange={(e) => { const next = [...pageContentData.experiences]; next[i] = { ...next[i], role: e.target.value }; setPageContentData((p: typeof pageContentData) => p ? { ...p, experiences: next } : p); setPageContentSaved(false) }} placeholder="Role" className="h-8 px-2 text-[12px] bg-brand-darkest/50 border border-brand-mid/[0.06] rounded-md text-brand-cream font-medium focus:outline-none" />
                    <input value={exp.company} onChange={(e) => { const next = [...pageContentData.experiences]; next[i] = { ...next[i], company: e.target.value }; setPageContentData((p: typeof pageContentData) => p ? { ...p, experiences: next } : p); setPageContentSaved(false) }} placeholder="Company" className="h-8 px-2 text-[12px] bg-brand-darkest/50 border border-brand-mid/[0.06] rounded-md text-brand-cream/70 focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <input value={exp.desc} onChange={(e) => { const next = [...pageContentData.experiences]; next[i] = { ...next[i], desc: e.target.value }; setPageContentData((p: typeof pageContentData) => p ? { ...p, experiences: next } : p); setPageContentSaved(false) }} placeholder="Description" className="flex-1 h-8 px-2 text-[12px] bg-brand-darkest/50 border border-brand-mid/[0.06] rounded-md text-brand-cream/60 focus:outline-none" />
                    <button onClick={() => { const next = pageContentData.experiences.filter((_: unknown, j: number) => j !== i); setPageContentData((p: typeof pageContentData) => p ? { ...p, experiences: next } : p); setPageContentSaved(false) }} className="text-red-400/40 hover:text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => { setPageContentData((p: typeof pageContentData) => p ? { ...p, experiences: [...(p.experiences || []), { year: '', role: '', company: '', desc: '' }] } : p); setPageContentSaved(false) }} className="w-full py-2 border border-dashed border-brand-mid/[0.08] rounded-lg text-[10px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-2.5 h-2.5" /> Add Experience</button>
            </div>
          </SectionWrapper>
        )}

        {/* About Page — Tools */}
        {editingPage === 'about' && pageContentData.tools && (
          <SectionWrapper title="Tech Stack & Tools" icon={<Settings2 className="w-4 h-4" />}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Section Badge" value={pageContentData.toolsBadge || ''} onChange={(v) => { setPageContentData((p: typeof pageContentData) => p ? { ...p, toolsBadge: v } : p); setPageContentSaved(false) }} />
                <Field label="Section Heading" value={pageContentData.toolsHeading || ''} onChange={(v) => { setPageContentData((p: typeof pageContentData) => p ? { ...p, toolsHeading: v } : p); setPageContentSaved(false) }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {pageContentData.tools.map((tool: string, i: number) => (
                  <div key={i} className="flex items-center gap-1 bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg px-2 py-1">
                    <input value={tool} onChange={(e) => { const next = [...pageContentData.tools]; next[i] = e.target.value; setPageContentData((p: typeof pageContentData) => p ? { ...p, tools: next } : p); setPageContentSaved(false) }} className="w-28 h-6 text-[11px] bg-transparent text-brand-cream focus:outline-none" />
                    <button onClick={() => { const next = pageContentData.tools.filter((_: unknown, j: number) => j !== i); setPageContentData((p: typeof pageContentData) => p ? { ...p, tools: next } : p); setPageContentSaved(false) }} className="text-red-400/30 hover:text-red-400"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => { setPageContentData((p: typeof pageContentData) => p ? { ...p, tools: [...(p.tools || []), ''] } : p); setPageContentSaved(false) }} className="w-full py-2 border border-dashed border-brand-mid/[0.08] rounded-lg text-[10px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-2.5 h-2.5" /> Add Tool</button>
            </div>
          </SectionWrapper>
        )}

        {/* Pricing Page — FAQs */}
        {editingPage === 'pricing' && pageContentData.faqs && (() => {
          let items: { q: string; a: string }[] = []
          try { items = typeof pageContentData.faqs === 'string' ? JSON.parse(pageContentData.faqs) : pageContentData.faqs } catch {}
          const updateFaqs = (next: typeof items) => {
            setPageContentData((p: typeof pageContentData) => p ? { ...p, faqs: JSON.stringify(next) } : p)
            setPageContentSaved(false)
          }
          return (
            <SectionWrapper title="Frequently Asked Questions" icon={<HelpCircle className="w-4 h-4" />}>
              <div className="space-y-3">
                {items.map((faq, i) => (
                  <div key={i} className="rounded-lg border border-brand-mid/[0.06] bg-brand-darkest/30 p-3 space-y-2">
                    <div className="flex gap-2 items-start">
                      <input value={faq.q} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], q: e.target.value }; updateFaqs(next) }} placeholder="Question" className="flex-1 h-9 px-2.5 text-[13px] font-medium bg-brand-darkest/50 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
                      <button onClick={() => updateFaqs(items.filter((_, j) => j !== i))} className="text-red-400/40 hover:text-red-400 p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <textarea value={faq.a} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], a: e.target.value }; updateFaqs(next) }} placeholder="Answer" rows={2} className="w-full px-2.5 py-2 text-[12px] bg-brand-darkest/50 border border-brand-mid/[0.06] rounded-lg text-brand-cream/70 focus:outline-none focus:border-brand-mid/15 resize-none" />
                  </div>
                ))}
                <button onClick={() => updateFaqs([...items, { q: '', a: '' }])} className="w-full py-2.5 border border-dashed border-brand-mid/[0.08] rounded-lg text-[11px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add FAQ</button>
              </div>
            </SectionWrapper>
          )
        })()}

        {/* Header Page — Nav Links */}
        {editingPage === 'header' && pageContentData.navLinks && (() => {
          let items: { label: string; href: string }[] = []
          try { items = typeof pageContentData.navLinks === 'string' ? JSON.parse(pageContentData.navLinks) : pageContentData.navLinks } catch {}
          const updateNavLinks = (next: typeof items) => {
            setPageContentData((p: typeof pageContentData) => p ? { ...p, navLinks: JSON.stringify(next) } : p)
            setPageContentSaved(false)
          }
          return (
            <SectionWrapper title="Navigation Links" icon={<ExternalLink className="w-4 h-4" />}>
              <div className="space-y-3">
                {items.map((link, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input value={link.label} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], label: e.target.value }; updateNavLinks(next) }} placeholder="Label (e.g. Home)" className="h-9 px-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
                    <input value={link.href} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], href: e.target.value }; updateNavLinks(next) }} placeholder="/about" className="h-9 px-2.5 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream/70 font-mono focus:outline-none focus:border-brand-mid/15" />
                    <button onClick={() => { updateNavLinks(items.filter((_, j) => j !== i)) }} className="text-red-400/40 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => { updateNavLinks([...items, { label: '', href: '/' }]) }} className="w-full py-2.5 border border-dashed border-brand-mid/[0.08] rounded-lg text-[11px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Nav Link</button>
              </div>
            </SectionWrapper>
          )
        })()}

        {/* Footer — Navigation Links */}
        {editingPage === 'footer' && pageContentData.navLinks && (() => {
          let items: { label: string; href: string }[] = []
          try { items = typeof pageContentData.navLinks === 'string' ? JSON.parse(pageContentData.navLinks) : pageContentData.navLinks } catch {}
          const update = (next: typeof items) => {
            setPageContentData((p: typeof pageContentData) => p ? { ...p, navLinks: JSON.stringify(next) } : p)
            setPageContentSaved(false)
          }
          return (
            <SectionWrapper title="Navigation Links" icon={<Layers className="w-4 h-4" />}>
              <div className="space-y-3">
                {items.map((link, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input value={link.label} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], label: e.target.value }; update(next) }} placeholder="Label" className="h-9 px-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none" />
                    <input value={link.href} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], href: e.target.value }; update(next) }} placeholder="/about" className="h-9 px-2.5 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream/70 font-mono focus:outline-none" />
                    <button onClick={() => update(items.filter((_, j) => j !== i))} className="text-red-400/40 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => update([...items, { label: '', href: '' }])} className="w-full py-2.5 border border-dashed border-brand-mid/[0.08] rounded-lg text-[11px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Navigation Link</button>
              </div>
            </SectionWrapper>
          )
        })()}

        {/* Footer — Social Links */}
        {editingPage === 'footer' && pageContentData.socialLinks && (() => {
          let items: { label: string; url: string; icon: string }[] = []
          try { items = typeof pageContentData.socialLinks === 'string' ? JSON.parse(pageContentData.socialLinks) : pageContentData.socialLinks } catch {}
          const update = (next: typeof items) => {
            setPageContentData((p: typeof pageContentData) => p ? { ...p, socialLinks: JSON.stringify(next) } : p)
            setPageContentSaved(false)
          }
          return (
            <SectionWrapper title="Social Links" icon={<ExternalLink className="w-4 h-4" />}>
              <div className="space-y-3">
                {items.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_100px_auto] gap-2 items-center">
                    <input value={s.label} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], label: e.target.value }; update(next) }} placeholder="Label" className="h-9 px-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none" />
                    <input value={s.url} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], url: e.target.value }; update(next) }} placeholder="https://..." className="h-9 px-2.5 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream/70 font-mono focus:outline-none" />
                    <IconPicker value={s.icon} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], icon: v }; update(next) }} />
                    <button onClick={() => update(items.filter((_, j) => j !== i))} className="text-red-400/40 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => update([...items, { label: '', url: '', icon: 'Globe' }])} className="w-full py-2.5 border border-dashed border-brand-mid/[0.08] rounded-lg text-[11px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Social Link</button>
              </div>
            </SectionWrapper>
          )
        })()}

        {/* Footer — Service Links */}
        {editingPage === 'footer' && pageContentData.serviceLinks && (() => {
          let items: { label: string; href: string }[] = []
          try { items = typeof pageContentData.serviceLinks === 'string' ? JSON.parse(pageContentData.serviceLinks) : pageContentData.serviceLinks } catch {}
          const update = (next: typeof items) => {
            setPageContentData((p: typeof pageContentData) => p ? { ...p, serviceLinks: JSON.stringify(next) } : p)
            setPageContentSaved(false)
          }
          return (
            <SectionWrapper title="Service Links" icon={<Briefcase className="w-4 h-4" />}>
              <div className="space-y-3">
                {items.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input value={s.label} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], label: e.target.value }; update(next) }} placeholder="Service Name" className="h-9 px-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none" />
                    <input value={s.href} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], href: e.target.value }; update(next) }} placeholder="/services/slug" className="h-9 px-2.5 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream/70 font-mono focus:outline-none" />
                    <button onClick={() => update(items.filter((_, j) => j !== i))} className="text-red-400/40 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => update([...items, { label: '', href: '' }])} className="w-full py-2.5 border border-dashed border-brand-mid/[0.08] rounded-lg text-[11px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Service Link</button>
              </div>
            </SectionWrapper>
          )
        })()}

        {/* Contact Page — Social Links */}
        {editingPage === 'contact' && pageContentData.socials && (() => {
          let items: { label: string; url: string; icon: string }[] = []
          try { items = typeof pageContentData.socials === 'string' ? JSON.parse(pageContentData.socials) : pageContentData.socials } catch {}
          const updateSocials = (next: typeof items) => {
            setPageContentData((p: typeof pageContentData) => p ? { ...p, socials: JSON.stringify(next) } : p)
            setPageContentSaved(false)
          }
          return (
            <SectionWrapper title="Social Links" icon={<ExternalLink className="w-4 h-4" />}>
              <div className="space-y-3">
                {items.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_100px_auto] gap-2 items-center">
                    <input value={s.label} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], label: e.target.value }; updateSocials(next) }} placeholder="Label (e.g. LinkedIn)" className="h-9 px-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
                    <input value={s.url} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], url: e.target.value }; updateSocials(next) }} placeholder="https://..." className="h-9 px-2.5 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream/70 font-mono focus:outline-none focus:border-brand-mid/15" />
                    <IconPicker value={s.icon} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], icon: v }; updateSocials(next) }} />
                    <button onClick={() => { updateSocials(items.filter((_, j) => j !== i)) }} className="text-red-400/40 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => { updateSocials([...items, { label: '', url: '', icon: 'Globe' }]) }} className="w-full py-2.5 border border-dashed border-brand-mid/[0.08] rounded-lg text-[11px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Social Link</button>
              </div>
            </SectionWrapper>
          )
        })()}

        {/* SEO */}
        {editingPage !== 'header' && editingPage !== 'footer' && (
        <SectionWrapper title="SEO" icon={<Search className="w-4 h-4" />}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] text-brand-cream/50 font-medium uppercase tracking-wider">Meta Title</label>
                <span className="text-[10px] font-mono text-brand-cream/30">{(pageContentData.seoTitle || '').length}/60</span>
              </div>
              <input type="text" value={pageContentData.seoTitle || ''} onChange={(e) => { setPageContentData((prev: typeof pageContentData) => prev ? { ...prev, seoTitle: e.target.value } : prev); setPageContentSaved(false) }} placeholder="Page title for search engines" className="w-full h-10 px-3.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] text-brand-cream/50 font-medium uppercase tracking-wider">Meta Description</label>
                <span className="text-[10px] font-mono text-brand-cream/30">{(pageContentData.seoDescription || '').length}/160</span>
              </div>
              <textarea value={pageContentData.seoDescription || ''} onChange={(e) => { setPageContentData((prev: typeof pageContentData) => prev ? { ...prev, seoDescription: e.target.value } : prev); setPageContentSaved(false) }} rows={3} placeholder="Brief description for search engines" className="w-full px-3.5 py-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15 resize-none" />
            </div>
            <ImageUploader label="OG Image (1200x630)" value={pageContentData.seoImage || ''} onChange={(v) => { setPageContentData((prev: typeof pageContentData) => prev ? { ...prev, seoImage: v } : prev); setPageContentSaved(false) }} />
            {/* Search Preview */}
            <div className="bg-white rounded-lg p-4 max-w-lg">
              <p className="text-[#1a0dab] text-[16px] font-medium truncate">{pageContentData.seoTitle || pageContentData.heading || 'Page Title'}</p>
              <p className="text-[#006621] text-[13px] mt-1">sabbirahsan.com{page?.slug}</p>
              <p className="text-[#545454] text-[13px] mt-1 line-clamp-2">{pageContentData.seoDescription || pageContentData.subtitle || 'Meta description...'}</p>
            </div>
          </div>
        </SectionWrapper>
        )}
      </div>
    )
  }

  // ── LIST VIEW ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-brand-cream tracking-tight">Pages</h1>
          <p className="text-[13px] text-brand-cream/50 mt-0.5">Manage your website pages and content</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100/60 border border-brand-mid/8 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[12px] text-brand-cream/60">{publishedCount} published</span>
          </div>
          {draftCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100/60 border border-brand-mid/8 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[12px] text-brand-cream/60">{draftCount} draft</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-cream/35 group-focus-within:text-brand-cream/60 transition-colors" />
        <input type="text" placeholder="Search pages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-3 text-[13px] bg-surface-100/40 border border-brand-mid/10 rounded-xl text-brand-cream placeholder-brand-cream/30 focus:outline-none focus:border-brand-mid/25 focus:bg-surface-100/60 transition-all" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredPages.map((page) => (
          <div key={page.id} onClick={() => { setEditingPage(page.id); setActiveTab('content'); setSaved(false) }}
            className="group bg-surface-200/80 border border-brand-mid/[0.08] rounded-2xl shadow-card p-4 cursor-pointer transition-all duration-200 hover:bg-surface-100/60 hover:border-brand-mid/10 hover:shadow-card">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-200/60 group-hover:bg-brand-gold/10 flex items-center justify-center flex-shrink-0 transition-colors">
                  <FileText className="w-4 h-4 text-brand-cream/40 group-hover:text-brand-gold transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-brand-cream truncate">{page.title}</p>
                  <p className="text-[11px] text-brand-cream/40 font-mono mt-0.5">{page.slug}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider ${
                page.status === 'published' ? 'bg-emerald-500/8 text-emerald-400/90 ring-1 ring-emerald-500/15' : 'bg-amber-500/8 text-amber-400/90 ring-1 ring-amber-500/15'
              }`}>
                <div className={`w-1 h-1 rounded-full ${page.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {page.status}
              </span>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-brand-mid/6">
              <span className="text-[11px] text-brand-cream/30 flex items-center gap-1"><Clock className="w-3 h-3" />{page.lastUpdated}</span>
              <span className="text-[11px] text-brand-cream/30 flex items-center gap-1"><Layers className="w-3 h-3" />{page.sections} sections</span>
            </div>
          </div>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-5 h-5 text-brand-cream/20 mx-auto mb-2" />
          <p className="text-[13px] text-brand-cream/40">No pages found</p>
        </div>
      )}
    </div>
  )
}

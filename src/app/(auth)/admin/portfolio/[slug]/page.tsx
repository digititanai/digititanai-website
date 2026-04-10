'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Plus, Trash2, Check, Eye, ChevronDown, ChevronRight, ExternalLink, FolderOpen } from 'lucide-react'
import dynamic from 'next/dynamic'
const MediaPicker = dynamic(() => import('@/components/admin/MediaPicker'), { ssr: false })
import { getPortfolio, savePortfolio, getPortfolioDetail, savePortfolioDetail, type PortfolioDetail } from '@/lib/collections'
import { useData } from '@/lib/useData'
import { portfolioDetailDefaults } from '@/lib/portfolioDetailDefaults'
import CategoryPicker from '@/components/admin/CategoryPicker'
import ImageUploader from '@/components/admin/ImageUploader'

function SectionBlock({ title, color, defaultOpen, children }: { title: string; color: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const colors: Record<string, string> = { green: 'border-brand-mid/30 bg-brand-mid/[0.04] text-brand-mid', gold: 'border-brand-gold/30 bg-brand-gold/[0.03] text-brand-gold', blue: 'border-blue-500/30 bg-blue-500/[0.03] text-blue-400', emerald: 'border-emerald-500/30 bg-emerald-500/[0.03] text-emerald-400', amber: 'border-amber-500/30 bg-amber-500/[0.03] text-amber-400' }
  const c = colors[color] || colors.green
  return (
    <div className={`rounded-xl border-l-2 ${c.split(' ').slice(0, 2).join(' ')} overflow-hidden`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-brand-darkest/20 transition-colors">
        <span className={`text-[10px] uppercase tracking-widest font-semibold ${c.split(' ')[2]}`}>{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-brand-cream/40" /> : <ChevronRight className="w-4 h-4 text-brand-cream/30" />}
      </button>
      {open && <div className="px-5 pb-5 pt-2">{children}</div>}
    </div>
  )
}

const inp = "w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15"
const ta = "w-full px-3 py-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15 resize-none"

export default function PortfolioDetailEditor() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { loaded } = useData()
  const [title, setTitle] = useState('')
  const [projectSlug, setProjectSlug] = useState('')
  const [data, setData] = useState<PortfolioDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showGalleryPicker, setShowGalleryPicker] = useState(false)

  useEffect(() => {
    if (!slug || !loaded) return
    const init = async () => {
      const { loadAllCollections, loadCollection } = await import('@/lib/collections')
      await loadAllCollections()
      await loadCollection(`col_portfolio_detail_${slug}`)

      const p = getPortfolio().find((i) => i.slug === slug)
      if (p) { setTitle(p.title); setProjectSlug(p.slug) }

      const defaults = portfolioDetailDefaults[slug]
      const existing = getPortfolioDetail(slug)
      if (existing) {
        if (!existing.image && p?.image) existing.image = p.image
        setData(existing)
      } else if (defaults) {
        const seeded: PortfolioDetail = { ...defaults }
        await savePortfolioDetail(slug, seeded)
        setData(seeded)
      } else {
        setData({ title: p?.title || '', category: p?.category || '', description: p?.description || '', client: '', industry: '', service: '', timeline: '', tools: [], challenge: '', solution: '', result: '', metrics: p?.metrics || [], testimonial: { quote: '', author: '', role: '' }, related: [] })
      }
    }
    init()
  }, [slug, loaded])

  const handleSave = () => {
    if (!data || !slug) return
    setSaving(true)
    savePortfolioDetail(projectSlug || slug, data)
    const all = getPortfolio()
    const updated = all.map((p) => p.slug === slug ? { ...p, title: data.title || title, slug: projectSlug || slug, category: data.category, description: data.description, metrics: data.metrics, image: data.image } : p)
    savePortfolio(updated)
    if (projectSlug && projectSlug !== slug && typeof window !== 'undefined') localStorage.removeItem(`col_portfolio_detail_${slug}`)
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000) }, 500)
  }

  if (!data) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 text-brand-cream/40 animate-spin" /></div>

  const d = data
  const setD = (fn: (prev: PortfolioDetail) => PortfolioDetail) => { setData(fn(data)); setSaved(false) }

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/portfolio')} className="h-9 px-3 text-[12px] text-brand-cream/60 hover:text-brand-cream rounded-lg hover:bg-surface-100/60 transition-all inline-flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> All Projects</button>
          <div className="w-px h-5 bg-brand-mid/10" />
          <div>
            <h1 className="text-[16px] font-semibold text-brand-cream tracking-tight">{title} — Case Study</h1>
            <p className="text-[11px] text-brand-cream/40 font-mono">/portfolio/{slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/portfolio/${slug}`} target="_blank" rel="noopener noreferrer" className="h-8 px-3 text-[12px] text-brand-cream/50 hover:text-brand-cream rounded-lg hover:bg-surface-200/60 transition-all inline-flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Preview</a>
          <button onClick={handleSave} disabled={saving || saved} className="h-8 px-3.5 text-[12px] font-medium bg-brand-gold/90 text-brand-darkest rounded-lg hover:bg-brand-gold transition-all inline-flex items-center gap-1.5 disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Title & Slug */}
      <div className="bg-brand-mid/[0.04] rounded-xl border-l-2 border-brand-mid/30 p-5 space-y-3">
        <span className="text-[10px] text-brand-mid uppercase tracking-widest font-semibold">Project Info</span>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Title</label><input type="text" value={d.title} onChange={(e) => { setD((p) => ({ ...p, title: e.target.value })); setTitle(e.target.value) }} className={inp + ' font-semibold'} /></div>
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Slug</label><input type="text" value={projectSlug} onChange={(e) => { setProjectSlug(e.target.value); setSaved(false) }} className={inp + ' font-mono'} /></div>
        </div>
        <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Description</label><textarea value={d.description} onChange={(e) => setD((p) => ({ ...p, description: e.target.value }))} rows={3} className={ta} /></div>
        <ImageUploader label="Featured Image" value={d.image || ''} onChange={(v) => setD((p) => ({ ...p, image: v }))} hint="Recommended: 1200 x 630px (16:9 ratio) — used on listing cards and case study hero" />
        <div className="grid grid-cols-2 gap-3">
          <CategoryPicker label="Category" value={d.category} onChange={(v) => setD((p) => ({ ...p, category: v }))} type="portfolio" multiple />
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Service</label><input type="text" value={d.service} onChange={(e) => setD((p) => ({ ...p, service: e.target.value }))} className={inp} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Client</label><input type="text" value={d.client} onChange={(e) => setD((p) => ({ ...p, client: e.target.value }))} className={inp} /></div>
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Industry</label><input type="text" value={d.industry} onChange={(e) => setD((p) => ({ ...p, industry: e.target.value }))} className={inp} /></div>
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Timeline</label><input type="text" value={d.timeline} onChange={(e) => setD((p) => ({ ...p, timeline: e.target.value }))} className={inp} /></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2"><label className="text-[11px] text-brand-cream/50 uppercase tracking-wider font-medium">Tools Used</label><button type="button" onClick={() => setD((p) => ({ ...p, tools: [...p.tools, ''] }))} className="text-[10px] text-brand-gold flex items-center gap-1"><Plus className="w-2.5 h-2.5" /> Add</button></div>
          <div className="flex flex-wrap gap-1.5">
            {d.tools.map((tool, i) => (
              <div key={i} className="flex items-center gap-1">
                <input type="text" value={tool} onChange={(e) => setD((p) => ({ ...p, tools: p.tools.map((t, j) => j === i ? e.target.value : t) }))} className="h-8 px-2.5 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream w-32 focus:outline-none focus:border-brand-mid/15" />
                <button onClick={() => setD((p) => ({ ...p, tools: p.tools.filter((_, j) => j !== i) }))} className="text-red-400/40 hover:text-red-400"><Trash2 className="w-2.5 h-2.5" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Challenge / Solution / Result */}
      <SectionBlock title="Challenge" color="amber" defaultOpen>
        <textarea value={d.challenge} onChange={(e) => setD((p) => ({ ...p, challenge: e.target.value }))} rows={5} className={ta} />
      </SectionBlock>

      <SectionBlock title="Solution" color="green" defaultOpen>
        <textarea value={d.solution} onChange={(e) => setD((p) => ({ ...p, solution: e.target.value }))} rows={5} className={ta} />
      </SectionBlock>

      <SectionBlock title="Result" color="emerald" defaultOpen>
        <textarea value={d.result} onChange={(e) => setD((p) => ({ ...p, result: e.target.value }))} rows={5} className={ta} />
      </SectionBlock>

      {/* Metrics */}
      <SectionBlock title="Key Metrics" color="gold">
        <div className="space-y-2">
          {d.metrics.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={m.value} onChange={(e) => setD((p) => ({ ...p, metrics: p.metrics.map((met, j) => j === i ? { ...met, value: e.target.value } : met) }))} placeholder="Value" className="w-24 h-9 px-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream font-mono font-bold focus:outline-none focus:border-brand-mid/15" />
              <input type="text" value={m.label} onChange={(e) => setD((p) => ({ ...p, metrics: p.metrics.map((met, j) => j === i ? { ...met, label: e.target.value } : met) }))} placeholder="Label" className="flex-1 h-9 px-2.5 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
              <button onClick={() => setD((p) => ({ ...p, metrics: p.metrics.filter((_, j) => j !== i) }))} className="text-red-400/40 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          <button onClick={() => setD((p) => ({ ...p, metrics: [...p.metrics, { label: '', value: '' }] }))} className="w-full py-2 border border-dashed border-brand-mid/[0.08] rounded-lg text-[10px] text-brand-cream/30 hover:text-brand-cream/50 flex items-center justify-center gap-1"><Plus className="w-2.5 h-2.5" /> Add Metric</button>
        </div>
      </SectionBlock>

      {/* Gallery */}
      <SectionBlock title="Project Gallery" color="amber">
        <div className="space-y-3">
          <p className="text-[10px] text-brand-cream/25">Upload project screenshots, mockups, or results. Recommended: 1200 x 800px</p>
          <div className="grid grid-cols-3 gap-2">
            {(d.gallery || []).map((img, i) => (
              <div key={i} className="relative group aspect-[3/2] rounded-lg overflow-hidden bg-brand-darkest/40">
                <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => setD((p) => ({ ...p, gallery: (p.gallery || []).filter((_, j) => j !== i) }))}
                    className="h-7 px-2.5 text-[10px] font-medium bg-red-500/20 text-red-400 rounded-lg inline-flex items-center gap-1 hover:bg-red-500/30">
                    <Trash2 className="w-2.5 h-2.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
            <label className="aspect-[3/2] rounded-lg border border-dashed border-brand-mid/[0.08] hover:border-brand-mid/20 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-brand-darkest/20">
              <Plus className="w-4 h-4 text-brand-cream/20 mb-1" />
              <span className="text-[10px] text-brand-cream/25">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const formData = new FormData()
                formData.append('file', file)
                const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
                const data = await res.json()
                if (data.url) setD((p) => ({ ...p, gallery: [...(p.gallery || []), data.url] }))
              }} />
            </label>
            <button onClick={() => setShowGalleryPicker(true)} className="aspect-[3/2] rounded-lg border border-dashed border-brand-gold/15 hover:border-brand-gold/30 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-brand-gold/5">
              <FolderOpen className="w-4 h-4 text-brand-gold/40 mb-1" />
              <span className="text-[10px] text-brand-gold/50">From Media</span>
            </button>
          </div>
          {showGalleryPicker && <MediaPicker onSelect={(url) => { setD((p) => ({ ...p, gallery: [...(p.gallery || []), url] })); setShowGalleryPicker(false) }} onClose={() => setShowGalleryPicker(false)} />}
        </div>
      </SectionBlock>

      {/* Testimonial */}
      <SectionBlock title="Client Testimonial" color="blue">
        <div className="space-y-3">
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Quote</label><textarea value={d.testimonial.quote} onChange={(e) => setD((p) => ({ ...p, testimonial: { ...p.testimonial, quote: e.target.value } }))} rows={4} className={ta} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Author</label><input type="text" value={d.testimonial.author} onChange={(e) => setD((p) => ({ ...p, testimonial: { ...p.testimonial, author: e.target.value } }))} className={inp} /></div>
            <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Role</label><input type="text" value={d.testimonial.role} onChange={(e) => setD((p) => ({ ...p, testimonial: { ...p.testimonial, role: e.target.value } }))} className={inp} /></div>
          </div>
        </div>
      </SectionBlock>

      {/* Related */}
      <SectionBlock title="Related Projects" color="green">
        <div className="space-y-2">
          {(() => {
            const allProjects = getPortfolio().filter((p) => p.slug !== slug)
            return allProjects.map((p) => {
              const isSelected = d.related.includes(p.slug)
              return (
                <button key={p.id} type="button" onClick={() => setD((prev) => ({ ...prev, related: isSelected ? prev.related.filter((r) => r !== p.slug) : [...prev.related, p.slug] }))}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all ${isSelected ? 'bg-brand-gold/[0.04] border-l-2 border-brand-gold/30' : 'hover:bg-brand-darkest/20'}`}>
                  <div className="flex-1"><span className={`text-[13px] ${isSelected ? 'text-brand-cream font-medium' : 'text-brand-cream/60'}`}>{p.title}</span></div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-gold" />}
                </button>
              )
            })
          })()}
        </div>
      </SectionBlock>

      {/* SEO */}
      <SectionBlock title="SEO" color="blue">
        <div className="space-y-3">
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Meta Title</label><input type="text" value={d.seoTitle || ''} onChange={(e) => setD((p) => ({ ...p, seoTitle: e.target.value }))} placeholder={d.title} className={inp} /><p className="text-[10px] text-brand-cream/25 mt-1">{(d.seoTitle || d.title || '').length}/60</p></div>
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Meta Description</label><textarea value={d.seoDescription || ''} onChange={(e) => setD((p) => ({ ...p, seoDescription: e.target.value }))} placeholder={d.description} rows={2} className={ta} /><p className="text-[10px] text-brand-cream/25 mt-1">{(d.seoDescription || d.description || '').length}/160</p></div>
          <ImageUploader label="OG Image" value={d.seoImage || ''} onChange={(v) => setD((p) => ({ ...p, seoImage: v }))} hint="1200x630 for social sharing" />
        </div>
      </SectionBlock>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit3, Trash2, X, Save, Search, Loader2, ToggleLeft, ToggleRight, Check, FileText, ExternalLink } from 'lucide-react'
import { getServices, saveServices, getServiceDetail, saveServiceDetail, getCategories, type ServiceItem } from '@/lib/collections'
import { useData } from '@/lib/useData'
import { iconMap } from '@/lib/iconMap'
import IconPicker from '@/components/admin/IconPicker'
import CategoryPicker from '@/components/admin/CategoryPicker'

const emptyForm: Omit<ServiceItem, 'id'> = { title: '', slug: '', icon: 'Globe', tagline: '', description: '', features: [''], pricing: [{ name: 'Starter', price: '', features: [{ text: '', included: true }] }], category: '', active: true }

export default function ServicesManagement() {
  const { loaded } = useData()
  const [items, setItems] = useState<ServiceItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null)
  const [formData, setFormData] = useState<Omit<ServiceItem, 'id'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!loaded) return
    fetch('/api/data/col_services', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(fresh => {
      setItems(Array.isArray(fresh) && fresh.length ? fresh : getServices())
    }).catch(() => setItems(getServices()))
  }, [loaded])
  const persist = (next: ServiceItem[]) => { setItems(next); saveServices(next) }

  const filtered = items.filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const openNew = () => { setEditingItem(null); setFormData(JSON.parse(JSON.stringify(emptyForm))); setShowModal(true) }
  const openEdit = (item: ServiceItem) => { setEditingItem(item); setFormData(JSON.parse(JSON.stringify({ ...item, id: undefined }))); setShowModal(true) }

  const handleSave = () => {
    setSaving(true)
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const data = { ...formData, slug }
    const next = editingItem ? items.map((i) => i.id === editingItem.id ? { ...data, id: editingItem.id } : i) : [...items, { ...data, id: Date.now().toString() }]
    persist(next)
    // Sync ALL shared fields to service detail store
    const oldSlug = editingItem?.slug || slug
    const existing = getServiceDetail(oldSlug)
    if (existing) {
      const updated = { ...existing, pricing: data.pricing, category: data.category }
      // If slug changed, save under new key and remove old
      if (oldSlug !== slug) {
        saveServiceDetail(slug, updated)
        if (typeof window !== 'undefined') localStorage.removeItem(`col_service_detail_${oldSlug}`)
      } else {
        saveServiceDetail(slug, updated)
      }
    }
    setShowModal(false); setTimeout(() => setSaving(false), 300)
  }

  const handleDelete = (id: string) => { persist(items.filter((i) => i.id !== id)); setDeleteConfirm(null) }
  const toggleActive = (id: string) => { persist(items.map((i) => i.id === id ? { ...i, active: !i.active } : i)) }

  const f = formData
  const setF = setFormData

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-[20px] font-semibold text-brand-cream tracking-tight">Services</h1><p className="text-[13px] text-brand-cream/50 mt-0.5">Manage your service offerings</p></div>
        <button onClick={openNew} className="h-9 px-4 text-[13px] font-medium bg-brand-gold text-brand-darkest rounded-lg hover:bg-brand-gold-light transition-colors inline-flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Service</button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-cream/50" />
        <input type="text" placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-9 pr-3 text-[13px] bg-surface-100/40 border border-brand-mid/10 rounded-xl text-brand-cream placeholder-brand-cream/30 focus:outline-none focus:border-brand-mid/15 transition-all" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const Icon = iconMap[item.icon] || iconMap['Globe']
          const cats = getCategories(); const cat = cats.find((c) => c.name === item.category); const parent = cat ? cats.find((c) => c.id === cat.parentId) : null
          const catPath = parent && !parent.id.startsWith('vert-') ? `${parent.slug}/${cat!.slug}` : cat ? cat.slug : ''
          const url = catPath ? `/services/${catPath}/${item.slug}` : `/services/${item.slug}`
          return (
            <div key={item.id} className={`rounded-2xl bg-surface-200/80 border border-brand-mid/[0.08] shadow-card p-5 group transition-all hover:border-brand-mid/15 hover:shadow-card-hover hover:-translate-y-0.5 h-full flex flex-col ${item.active ? '' : 'opacity-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-brand-mid/[0.08] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-mid" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/services/${item.slug}`} className="p-1.5 rounded-lg hover:bg-brand-mid/10 text-brand-cream/40 hover:text-brand-cream transition-colors" title="Edit detail page"><FileText className="w-3.5 h-3.5" /></Link>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-brand-mid/10 text-brand-cream/40 hover:text-brand-cream transition-colors" title="Quick edit"><Edit3 className="w-3.5 h-3.5" /></button>
                  {deleteConfirm === item.id ? (
                    <div className="flex gap-1"><button onClick={() => handleDelete(item.id)} className="h-6 px-2 bg-red-600 text-white rounded text-[10px]">Delete</button><button onClick={() => setDeleteConfirm(null)} className="h-6 px-2 bg-brand-mid/10 text-brand-cream rounded text-[10px]">Cancel</button></div>
                  ) : (<button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-brand-cream/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-brand-cream truncate">{item.title}</h3>
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-1 rounded-md text-brand-cream/20 hover:text-brand-gold hover:bg-brand-gold/10 transition-all" title="Preview page"><ExternalLink className="w-3 h-3" /></a>
              </div>
              <p className="text-[10px] text-brand-cream/20 font-mono mt-1">{url}</p>
              <p className="text-[11px] text-brand-gold/60 mt-1.5">{item.tagline}</p>
              <p className="text-[12px] text-brand-cream/40 mt-2 line-clamp-2 flex-1">{item.description}</p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-mid/8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-brand-cream/35 bg-brand-mid/[0.06] px-2 py-0.5 rounded-md">{item.category}</span>
                  <span className="text-[11px] text-brand-gold/80 font-medium">{item.pricing[0]?.price}</span>
                </div>
                <button onClick={() => toggleActive(item.id)}>{item.active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-brand-cream/30" />}</button>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (<>
        <div onClick={() => setShowModal(false)} className="fixed inset-0 z-50 bg-black/60" />
        <div className="fixed inset-x-4 top-[5%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 bg-brand-darkest/95 backdrop-blur-xl border border-brand-mid/[0.08] rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-mid/[0.05]"><span className="text-[14px] font-medium text-brand-cream">{editingItem ? 'Edit Service' : 'Add Service'}</span><button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-brand-mid/10 text-brand-cream/50"><X className="w-4 h-4" /></button></div>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* ── Basic Info ── */}
            <div className="bg-brand-mid/[0.04] rounded-xl p-4 space-y-3 border-l-2 border-brand-mid/30">
              <span className="text-[10px] text-brand-mid uppercase tracking-widest font-semibold">Basic Info</span>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Title</label><input type="text" value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15" /></div>
                <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Tagline</label><input type="text" value={f.tagline} onChange={(e) => setF((p) => ({ ...p, tagline: e.target.value }))} className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15" /></div>
              </div>
              <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Description</label><textarea value={f.description} onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15 resize-none" /></div>
              <div className="grid grid-cols-3 gap-3">
                <CategoryPicker label="Category" value={f.category} onChange={(v) => setF((p) => ({ ...p, category: v }))} type="service" multiple />
                <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Slug</label><input type="text" value={f.slug} onChange={(e) => setF((p) => ({ ...p, slug: e.target.value }))} placeholder="Auto" className="w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream font-mono placeholder-brand-cream/25 focus:outline-none focus:border-brand-mid/15" /></div>
                <IconPicker label="Icon" value={f.icon} onChange={(v) => setF((p) => ({ ...p, icon: v }))} />
              </div>
            </div>

            {/* ── Features ── */}
            <div className="bg-brand-gold/[0.03] rounded-xl p-4 space-y-3 border-l-2 border-brand-gold/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-brand-gold uppercase tracking-widest font-semibold">Features</span>
                <button type="button" onClick={() => setF((p) => ({ ...p, features: [...p.features, ''] }))} className="text-[10px] text-brand-gold flex items-center gap-1 hover:text-brand-gold-light transition-colors"><Plus className="w-2.5 h-2.5" /> Add</button>
              </div>
              <div className="space-y-1.5">
                {f.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={feat} onChange={(e) => setF((p) => ({ ...p, features: p.features.map((ft, j) => j === i ? e.target.value : ft) }))} className="flex-1 h-8 px-2.5 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
                    <button onClick={() => setF((p) => ({ ...p, features: p.features.filter((_, j) => j !== i) }))} className="text-red-400/40 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Pricing Tiers ── */}
            <div className="bg-emerald-500/[0.03] rounded-xl p-4 space-y-3 border-l-2 border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">Pricing Tiers</span>
                <button type="button" onClick={() => setF((p) => ({ ...p, pricing: [...p.pricing, { name: '', price: '', features: [{ text: '', included: true }] }] }))} className="text-[10px] text-brand-gold flex items-center gap-1 hover:text-brand-gold-light transition-colors"><Plus className="w-2.5 h-2.5" /> Add Tier</button>
              </div>
              <div className="space-y-2">
                {f.pricing.map((tier, ti) => {
                  const tierColors = [
                    { bg: 'bg-brand-mid/[0.04]', border: 'border-brand-mid/25', label: 'text-brand-mid', tag: 'Starter' },
                    { bg: 'bg-brand-gold/[0.04]', border: 'border-brand-gold/25', label: 'text-brand-gold', tag: 'Pro' },
                    { bg: 'bg-blue-500/[0.04]', border: 'border-blue-500/25', label: 'text-blue-400', tag: 'Enterprise' },
                  ]
                  const c = tierColors[ti % tierColors.length]
                  return (
                  <div key={ti} className={`${c.bg} rounded-xl p-3.5 space-y-2.5 border-l-2 ${c.border}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] ${c.label} uppercase tracking-widest font-semibold`}>Tier {ti + 1}</span>
                        <input type="text" value={tier.name} onChange={(e) => setF((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, name: e.target.value } : t) }))} placeholder="Tier name" className="w-28 h-8 px-2.5 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream font-medium focus:outline-none focus:border-brand-mid/15" />
                        <input type="text" value={tier.price} onChange={(e) => setF((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, price: e.target.value } : t) }))} placeholder="$500" className="w-24 h-8 px-2.5 text-[12px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream font-mono focus:outline-none focus:border-brand-mid/15" />
                        <label className="flex items-center gap-1.5 text-[10px] text-brand-cream/40"><input type="checkbox" checked={tier.highlighted || false} onChange={(e) => setF((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, highlighted: e.target.checked } : t) }))} className="rounded" />Popular</label>
                      </div>
                      <button onClick={() => setF((p) => ({ ...p, pricing: p.pricing.filter((_, j) => j !== ti) }))} className="text-red-400/40 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="space-y-1">
                      {tier.features.map((feat, fi) => (
                        <div key={fi} className="flex items-center gap-1.5">
                          <button type="button" onClick={() => setF((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, features: t.features.map((f2, k) => k === fi ? { ...f2, included: !f2.included } : f2) } : t) }))}
                            className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${feat.included ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/8 text-red-400/40'}`}>
                            {feat.included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          </button>
                          <input type="text" value={feat.text} onChange={(e) => setF((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, features: t.features.map((f2, k) => k === fi ? { ...f2, text: e.target.value } : f2) } : t) }))} className="flex-1 h-7 px-2 text-[11px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
                          <button onClick={() => setF((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, features: t.features.filter((_, k) => k !== fi) } : t) }))} className="text-red-400/30 hover:text-red-400 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setF((p) => ({ ...p, pricing: p.pricing.map((t, j) => j === ti ? { ...t, features: [...t.features, { text: '', included: true }] } : t) }))} className="text-[10px] text-brand-cream/25 hover:text-brand-cream/50 flex items-center gap-1 transition-colors"><Plus className="w-2.5 h-2.5" /> Add feature</button>
                  </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-brand-mid/[0.05]">
            <button onClick={() => setShowModal(false)} className="h-9 px-4 text-[13px] bg-brand-darkest/30 text-brand-cream/60 rounded-xl">Cancel</button>
            <button onClick={handleSave} disabled={saving || !f.title} className="h-9 px-4 text-[13px] font-medium bg-brand-gold text-brand-darkest rounded-lg hover:bg-brand-gold-light disabled:opacity-50 inline-flex items-center gap-1.5">{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}{editingItem ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </>)}
    </div>
  )
}

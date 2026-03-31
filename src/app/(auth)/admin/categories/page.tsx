'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Edit3, Trash2, X, Save, Loader2, Tag,
  ChevronRight, ChevronDown, FolderOpen, Folder, CornerDownRight, Link2, ExternalLink,
} from 'lucide-react'
import { getCategories, saveCategories, type Category } from '@/lib/collections'
import { useData } from '@/lib/useData'

const verticals = [
  { id: 'vert-services', name: 'Services', type: 'service' as const, dot: 'bg-emerald-400', base: '/services' },
  { id: 'vert-portfolio', name: 'Portfolio', type: 'portfolio' as const, dot: 'bg-blue-400', base: '/portfolio' },
  { id: 'vert-blog', name: 'Blog', type: 'blog' as const, dot: 'bg-amber-400', base: '/blog' },
]

function autoSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function CategoriesManagement() {
  const { loaded } = useData()
  const [items, setItems] = useState<Category[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'vert-services': true, 'vert-portfolio': true, 'vert-blog': true })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [modalParentId, setModalParentId] = useState('')
  const [modalEditId, setModalEditId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loaded) return
    fetch('/api/data/col_categories_v2', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(fresh => {
      setItems(Array.isArray(fresh) && fresh.length ? fresh : getCategories())
    }).catch(() => setItems(getCategories()))
  }, [loaded])
  const persist = (next: Category[]) => { setItems(next); saveCategories(next) }

  const getChildren = (pid: string) => items.filter((c) => c.parentId === pid)
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

  // Modal helpers
  const openAdd = (parentId: string) => {
    setModalMode('add'); setModalParentId(parentId); setModalEditId(null)
    setFormName(''); setFormSlug(''); setSlugTouched(false); setShowModal(true)
  }
  const openEdit = (item: Category) => {
    setModalMode('edit'); setModalEditId(item.id); setModalParentId(item.parentId || '')
    setFormName(item.name); setFormSlug(item.slug); setSlugTouched(true); setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleNameChange = (val: string) => {
    setFormName(val)
    if (!slugTouched) setFormSlug(autoSlug(val))
  }

  const handleSave = () => {
    if (!formName.trim()) return
    setSaving(true)
    const slug = formSlug || autoSlug(formName)
    if (modalMode === 'edit' && modalEditId) {
      persist(items.map((i) => i.id === modalEditId ? { ...i, name: formName.trim(), slug } : i))
    } else {
      const parentItem = items.find((c) => c.id === modalParentId)
      const type = parentItem?.type || 'service'
      persist([...items, { id: Date.now().toString(), name: formName.trim(), slug, type, parentId: modalParentId }])
    }
    closeModal(); setTimeout(() => setSaving(false), 200)
  }

  const handleDelete = (id: string) => {
    const childIds = new Set(items.filter((c) => c.parentId === id).map((c) => c.id))
    const grandIds = new Set(items.filter((c) => childIds.has(c.parentId || '')).map((c) => c.id))
    persist(items.filter((i) => i.id !== id && !childIds.has(i.id) && !grandIds.has(i.id)))
    setDeleteConfirm(null)
  }

  // Build URL path for a category
  const buildPath = (cat: Category): string => {
    const vert = verticals.find((v) => v.type === cat.type)
    const base = vert?.base || ''
    const parent = items.find((c) => c.id === cat.parentId)
    if (parent && parent.id.startsWith('vert-')) {
      return `${base}/${cat.slug}`
    } else if (parent) {
      return `${base}/${parent.slug}/${cat.slug}`
    }
    return `${base}/${cat.slug}`
  }

  // Get modal context label
  const getModalParentLabel = () => {
    const p = items.find((c) => c.id === modalParentId)
    if (!p) return ''
    if (p.id.startsWith('vert-')) return `under ${p.name}`
    const vert = verticals.find((v) => v.type === p.type)
    return `under ${p.name} (${vert?.name})`
  }

  // Preview URL in modal
  const getPreviewUrl = () => {
    const vert = verticals.find((v) => {
      const p = items.find((c) => c.id === modalParentId)
      return p?.type === v.type || p?.id === v.id
    })
    const base = vert?.base || ''
    const parent = items.find((c) => c.id === modalParentId)
    const slug = formSlug || autoSlug(formName) || 'slug'
    if (parent?.id.startsWith('vert-')) return `domain${base}/${slug}`
    if (parent) return `domain${base}/${parent.slug}/${slug}`
    return `domain${base}/${slug}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-brand-cream tracking-tight">Categories</h1>
        <p className="text-[13px] text-brand-cream/50 mt-0.5">
          {items.filter((c) => c.parentId?.startsWith('vert-')).length} categories &middot; {items.filter((c) => c.parentId && !c.parentId.startsWith('vert-')).length} subcategories
        </p>
      </div>

      <div className="space-y-5">
        {verticals.map((vert) => {
          const parents = getChildren(vert.id)
          const isExp = expanded[vert.id]

          return (
            <div key={vert.id}>
              {/* Vertical Header */}
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => toggle(vert.id)} className="flex items-center gap-2.5">
                  {isExp ? <ChevronDown className="w-4 h-4 text-brand-cream/40" /> : <ChevronRight className="w-4 h-4 text-brand-cream/30" />}
                  <div className={`w-2 h-2 rounded-full ${vert.dot}`} />
                  <span className="text-[15px] text-brand-cream font-semibold">{vert.name}</span>
                  <span className="text-[11px] text-brand-cream/25">{parents.length}</span>
                </button>
                <button onClick={() => { if (!isExp) toggle(vert.id); openAdd(vert.id) }}
                  className="h-7 px-2.5 text-[11px] font-medium text-brand-cream/40 hover:text-brand-cream rounded-md hover:bg-surface-100/40 transition-all inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {/* Parent Category Cards */}
              {isExp && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {parents.map((parent) => {
                    const subs = getChildren(parent.id)
                    const isParentExp = expanded[parent.id] ?? true

                    return (
                      <div key={parent.id} className="bg-surface-200/80 border border-brand-mid/[0.08] rounded-2xl shadow-card overflow-hidden hover:border-brand-mid/10 transition-all group/card">
                        {/* Card Header */}
                        <div className="px-4 pt-4 pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-brand-mid/[0.08] border border-brand-mid/[0.06] flex items-center justify-center backdrop-blur-sm">
                                <Folder className="w-4 h-4 text-brand-mid/70" />
                              </div>
                              <div>
                                <h3 className="text-[14px] text-brand-cream font-semibold">{parent.name}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Link2 className="w-2.5 h-2.5 text-brand-cream/15" />
                                  <span className="text-[10px] text-brand-cream/25 font-mono">{vert.base}/{parent.slug}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(parent)} className="p-1.5 rounded-lg hover:bg-surface-200/60 text-brand-cream/30 hover:text-brand-cream transition-colors"><Edit3 className="w-3 h-3" /></button>
                              {deleteConfirm === parent.id ? (
                                <div className="flex gap-1">
                                  <button onClick={() => handleDelete(parent.id)} className="h-6 px-2 bg-red-600 text-white rounded text-[9px]">Delete</button>
                                  <button onClick={() => setDeleteConfirm(null)} className="h-6 px-2 bg-surface-200/60 text-brand-cream rounded text-[9px]">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(parent.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-brand-cream/30 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                              )}
                            </div>
                          </div>

                          {subs.length > 0 && (
                            <button onClick={() => toggle(parent.id)} className="mt-2 text-[10px] text-brand-cream/30 hover:text-brand-cream/50 transition-colors inline-flex items-center gap-1">
                              {isParentExp ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                              {subs.length} subcategor{subs.length === 1 ? 'y' : 'ies'}
                            </button>
                          )}
                        </div>

                        {/* Subcategories */}
                        {isParentExp && (
                          <div className="border-t border-brand-mid/[0.05] bg-brand-darkest/20">
                            {subs.map((sub) => (
                              <div key={sub.id} className="flex items-center gap-2 px-4 py-2 group/sub hover:bg-surface-100/[0.04] transition-colors border-b border-brand-mid/[0.03] last:border-0">
                                <CornerDownRight className="w-3 h-3 text-brand-cream/10 flex-shrink-0" />
                                <Tag className="w-2.5 h-2.5 text-brand-cream/20 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-[12px] text-brand-cream/60">{sub.name}</span>
                                  <span className="text-[9px] text-brand-cream/15 font-mono ml-1.5">/{sub.slug}</span>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                  <button onClick={() => openEdit(sub)} className="p-1 rounded hover:bg-surface-200/60 text-brand-cream/25 hover:text-brand-cream transition-colors"><Edit3 className="w-2.5 h-2.5" /></button>
                                  {deleteConfirm === sub.id ? (
                                    <div className="flex gap-1">
                                      <button onClick={() => handleDelete(sub.id)} className="h-5 px-1.5 bg-red-600 text-white rounded text-[8px]">Yes</button>
                                      <button onClick={() => setDeleteConfirm(null)} className="h-5 px-1.5 bg-surface-200/60 text-brand-cream rounded text-[8px]">No</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => setDeleteConfirm(sub.id)} className="p-1 rounded hover:bg-red-500/10 text-brand-cream/25 hover:text-red-400 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <button onClick={() => openAdd(parent.id)}
                              className="w-full flex items-center gap-1.5 px-4 py-2 text-[10px] text-brand-cream/20 hover:text-brand-cream/45 hover:bg-surface-100/[0.04] transition-all">
                              <Plus className="w-2.5 h-2.5" /> Add subcategory
                            </button>
                          </div>
                        )}

                        {subs.length === 0 && (
                          <div className="border-t border-brand-mid/[0.05]">
                            <button onClick={() => openAdd(parent.id)}
                              className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-[10px] text-brand-cream/20 hover:text-brand-cream/45 hover:bg-surface-100/[0.04] transition-all">
                              <Plus className="w-2.5 h-2.5" /> Add subcategory
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Add new parent card */}
                  <button onClick={() => openAdd(vert.id)}
                    className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-brand-mid/[0.08] hover:border-brand-mid/15 hover:shadow-card-hover hover:-translate-y-0.5 rounded-2xl text-brand-cream/20 hover:text-brand-cream/50 transition-all group/add">
                    <div className="w-10 h-10 rounded-xl border border-dashed border-brand-mid/10 group-hover/add:border-brand-gold/20 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4 group-hover/add:text-brand-gold transition-colors" />
                    </div>
                    <span className="text-[11px]">New Category</span>
                  </button>
                </div>
              )}

              {!isExp && parents.length > 0 && (
                <p className="text-[11px] text-brand-cream/20 ml-8">{parents.map((p) => p.name).join(', ')}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* ═══ MODAL ═══ */}
      {showModal && (<>
        <div onClick={closeModal} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-x-4 top-[18%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50">
          <div className="bg-brand-darkest/95 backdrop-blur-xl border border-brand-mid/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 pt-5 pb-4">
              <h2 className="text-[15px] font-semibold text-brand-cream">
                {modalMode === 'edit' ? 'Edit Category' : modalParentId.startsWith('vert-') ? 'New Category' : 'New Subcategory'}
              </h2>
              {modalMode === 'add' && <p className="text-[12px] text-brand-cream/40 mt-0.5">{getModalParentLabel()}</p>}
            </div>

            <div className="px-6 pb-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Name</label>
                <input type="text" value={formName} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Web Development" autoFocus
                  className="w-full h-11 px-4 text-[14px] bg-surface-100/40 border border-brand-mid/10 rounded-xl text-brand-cream placeholder-brand-cream/25 focus:outline-none focus:border-brand-mid/25 focus:ring-1 focus:ring-brand-mid/10 transition-all" />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Slug</label>
                <input type="text" value={formSlug} onChange={(e) => { setFormSlug(e.target.value); setSlugTouched(true) }} placeholder={autoSlug(formName) || 'auto-generated'}
                  className="w-full h-11 px-4 text-[14px] bg-surface-100/40 border border-brand-mid/10 rounded-xl text-brand-cream font-mono placeholder-brand-cream/20 focus:outline-none focus:border-brand-mid/25 focus:ring-1 focus:ring-brand-mid/10 transition-all" />
              </div>

              {/* URL Preview */}
              {formName && (
                <div className="flex items-center gap-2 p-3 bg-surface-100/30 border border-brand-mid/[0.06] rounded-xl">
                  <ExternalLink className="w-3.5 h-3.5 text-brand-gold/50 flex-shrink-0" />
                  <span className="text-[12px] text-brand-cream/50 font-mono truncate">{getPreviewUrl()}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-brand-mid/[0.06]">
              <button onClick={closeModal} className="h-10 px-5 text-[13px] bg-surface-200/50 border border-brand-mid/10 text-brand-cream rounded-xl hover:bg-surface-300/50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !formName.trim()}
                className="h-10 px-5 text-[13px] font-medium bg-brand-gold text-brand-darkest rounded-xl hover:bg-brand-gold-light disabled:opacity-40 transition-all inline-flex items-center gap-2">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {modalMode === 'edit' ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </>)}
    </div>
  )
}

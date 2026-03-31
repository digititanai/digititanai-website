'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Plus, Tag, CornerDownRight, Folder, X, Check } from 'lucide-react'
import { getCategories, saveCategories, type Category } from '@/lib/collections'

interface CategoryPickerProps {
  value: string
  onChange: (v: string) => void
  type: Category['type']
  label?: string
  multiple?: boolean
}

const verticalIds: Record<string, string> = { service: 'vert-services', portfolio: 'vert-portfolio', blog: 'vert-blog' }

function parseMulti(value: string): string[] {
  return value ? value.split(',').map((s) => s.trim()).filter(Boolean) : []
}

export default function CategoryPicker({ value, onChange, type, label, multiple }: CategoryPickerProps) {
  const [open, setOpen] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const allCats = getCategories()
  const vertId = verticalIds[type] || verticalIds['service']
  const parents = allCats.filter((c) => c.parentId === vertId)
  const getSubs = (pid: string) => allCats.filter((c) => c.parentId === pid)

  const selected = multiple ? parseMulti(value) : [value]
  const isSelected = (name: string) => selected.includes(name)

  useEffect(() => {
    if (!open) return
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    const onClick = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return
      if (dropRef.current?.contains(e.target as Node)) return
      setOpen(false); setAddingTo(null)
    }
    const onScroll = () => {
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect()
        setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
      }
    }
    document.addEventListener('mousedown', onClick)
    window.addEventListener('scroll', onScroll, true)
    return () => { document.removeEventListener('mousedown', onClick); window.removeEventListener('scroll', onScroll, true) }
  }, [open])

  const handleCreate = (parentId: string) => {
    if (!newCat.trim()) return
    const slug = newCat.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    saveCategories([...getCategories(), { id: Date.now().toString(), name: newCat.trim(), slug, type, parentId }])
    if (multiple) {
      const next = [...selected, newCat.trim()]
      onChange(next.join(', '))
    } else {
      onChange(newCat.trim())
    }
    setNewCat(''); setAddingTo(null)
    if (!multiple) setOpen(false)
  }

  const select = (name: string) => {
    if (multiple) {
      const next = isSelected(name) ? selected.filter((s) => s !== name) : [...selected, name]
      onChange(next.join(', '))
    } else {
      onChange(name)
      setOpen(false); setAddingTo(null)
    }
  }

  const removeTag = (name: string) => {
    const next = selected.filter((s) => s !== name)
    onChange(next.join(', '))
  }

  const displayValue = multiple
    ? (selected.length > 0 ? selected.join(', ') : '')
    : value

  return (
    <div>
      {label && <label className="block text-[11px] text-brand-cream/50 font-medium uppercase tracking-wider mb-2">{label}</label>}
      <button ref={btnRef} type="button" onClick={() => { setOpen(!open); setAddingTo(null) }}
        className="w-full min-h-[40px] px-3 py-1.5 text-[13px] bg-surface-100/50 border border-brand-mid/10 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/25 transition-all flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
          <Tag className={`w-3 h-3 flex-shrink-0 ${displayValue ? 'text-brand-gold' : 'text-brand-cream/25'}`} />
          {multiple && selected.length > 0 ? (
            selected.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-gold/15 text-brand-gold text-[11px] font-medium">
                {cat}
                <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(cat) }} className="hover:text-red-400 transition-colors"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))
          ) : (
            <span className={`truncate ${displayValue ? 'text-brand-cream' : 'text-brand-cream/30'}`}>{displayValue || (multiple ? 'Select categories' : 'Select category')}</span>
          )}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-brand-cream/30 flex-shrink-0" />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div ref={dropRef}
          className="fixed z-[9999] bg-[#0B2A1F] border border-brand-mid/10 rounded-xl shadow-2xl overflow-hidden"
          style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 260) }}>
          {multiple && selected.length > 0 && (
            <div className="px-3 py-2 border-b border-brand-mid/10 flex items-center justify-between">
              <span className="text-[11px] text-brand-cream/40">{selected.length} selected</span>
              <button type="button" onClick={() => { onChange(''); setOpen(false) }} className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors">Clear all</button>
            </div>
          )}
          <div className="max-h-[280px] overflow-y-auto py-1">
            {parents.map((parent) => {
              const subs = getSubs(parent.id)
              const parentActive = isSelected(parent.name)
              return (
                <div key={parent.id}>
                  {/* Parent category — selectable */}
                  <button type="button" onClick={() => select(parent.name)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-[#153F31] ${parentActive ? 'bg-brand-gold/10' : ''}`}>
                    {multiple ? (
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${parentActive ? 'bg-brand-gold border-brand-gold' : 'border-brand-cream/20'}`}>
                        {parentActive && <Check className="w-2.5 h-2.5 text-brand-darkest" />}
                      </div>
                    ) : (
                      <Folder className={`w-3 h-3 flex-shrink-0 ${parentActive ? 'text-brand-gold' : 'text-brand-cream/25'}`} />
                    )}
                    <span className={`text-[13px] font-medium ${parentActive ? 'text-brand-cream' : 'text-brand-cream/70'}`}>{parent.name}</span>
                    {!multiple && parentActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                  </button>
                  {/* Subcategories */}
                  {subs.map((sub) => {
                    const subActive = isSelected(sub.name)
                    return (
                      <button key={sub.id} type="button" onClick={() => select(sub.name)}
                        className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-left transition-all hover:bg-[#153F31] ${subActive ? 'bg-brand-gold/10' : ''}`}>
                        {multiple ? (
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${subActive ? 'bg-brand-gold border-brand-gold' : 'border-brand-cream/20'}`}>
                            {subActive && <Check className="w-2 h-2 text-brand-darkest" />}
                          </div>
                        ) : (
                          <CornerDownRight className="w-2.5 h-2.5 text-brand-cream/12 flex-shrink-0" />
                        )}
                        <span className={`text-[12px] ${subActive ? 'text-brand-cream' : 'text-brand-cream/50'}`}>{sub.name}</span>
                        {!multiple && subActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                      </button>
                    )
                  })}
                </div>
              )
            })}
            {parents.length === 0 && <p className="px-3 py-4 text-[12px] text-brand-cream/25 text-center">No categories</p>}
          </div>

          {/* Create new */}
          <div className="border-t border-brand-mid/10">
            {addingTo ? (
              <div className="p-2 flex items-center gap-2">
                <input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate(addingTo)} placeholder="Category name" autoFocus
                  className="flex-1 h-8 px-2.5 text-[12px] bg-surface-100/50 border border-brand-mid/10 rounded-md text-brand-cream placeholder-brand-cream/25 focus:outline-none focus:border-brand-mid/25" />
                <button onClick={() => handleCreate(addingTo)} className="h-8 px-3 text-[11px] font-medium bg-brand-gold text-brand-darkest rounded-md hover:bg-brand-gold-light">Add</button>
              </div>
            ) : (
              <div className="flex">
                <button type="button" onClick={() => setAddingTo(vertId)}
                  className="flex-1 flex items-center gap-1.5 px-3 py-2.5 text-[11px] text-brand-cream/35 hover:text-brand-cream/60 hover:bg-[#153F31] transition-all">
                  <Plus className="w-3 h-3" /> New category
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { iconMap, iconNames } from '@/lib/iconMap'

interface IconPickerProps {
  value: string
  onChange: (v: string) => void
  label?: string
}

export default function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const CurrentIcon = iconMap[value] || iconMap['Globe']

  const updatePos = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    // Keep dropdown within viewport
    const dropWidth = 280
    let left = rect.left
    if (left + dropWidth > window.innerWidth - 16) {
      left = window.innerWidth - dropWidth - 16
    }
    if (left < 16) left = 16
    setPos({ top: rect.bottom + 4, left })
  }, [])

  // Position + close on outside click
  useEffect(() => {
    if (!open) return
    updatePos()
    const onScroll = () => updatePos()
    const onClick = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return
      if (dropRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    window.addEventListener('scroll', onScroll, true)
    document.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open, updatePos])

  const filtered = search
    ? iconNames.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    : iconNames

  return (
    <div>
      {label && <label className="block text-[11px] text-brand-cream/50 font-medium uppercase tracking-wider mb-2">{label}</label>}
      <button
        ref={btnRef}
        type="button"
        onClick={() => { setOpen(!open); setSearch('') }}
        className="w-full h-10 px-3 text-[13px] bg-surface-100/50 border border-brand-mid/10 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/25 transition-all flex items-center gap-2.5"
      >
        <CurrentIcon className="w-4 h-4 text-brand-gold flex-shrink-0" />
        <span className="text-brand-cream/60 text-[12px] truncate">{value || 'Select icon'}</span>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropRef}
          className="fixed z-[9999] w-[280px] bg-[#0B2A1F] border border-brand-mid/10 rounded-xl shadow-2xl overflow-hidden"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="p-2 border-b border-brand-mid/10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              autoFocus
              className="w-full h-8 px-2.5 text-[12px] bg-surface-100/50 border border-brand-mid/10 rounded-md text-brand-cream placeholder-brand-cream/30 focus:outline-none focus:border-brand-mid/25"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto p-2 grid grid-cols-7 gap-1">
            {filtered.map((name) => {
              const Icon = iconMap[name]
              const isSelected = value === name
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => { onChange(name); setOpen(false) }}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-brand-gold/15 ring-1 ring-brand-gold/30'
                      : 'hover:bg-[#153F31]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-gold' : 'text-brand-cream/50 hover:text-brand-cream/80'}`} />
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="col-span-7 py-4 text-center text-[11px] text-brand-cream/30">No icons found</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

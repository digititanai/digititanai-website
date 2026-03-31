'use client'

import { useState, useEffect } from 'react'
import { Search, Image, FileText, Video, Check, X, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'

interface MediaItem {
  id: string
  name: string
  type: 'image' | 'document' | 'video'
  size: number
  url: string
}

interface MediaPickerProps {
  onSelect: (url: string) => void
  onClose: () => void
}

function formatSize(bytes: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/media?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setMedia(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = media.filter(m =>
    m.type === 'image' &&
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected)
      onClose()
    }
  }

  return createPortal(
    <>
      <div onClick={onClose} className="fixed inset-0 z-[60] bg-black/70" />
      <div className="fixed inset-x-4 top-[5%] bottom-[5%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-3xl z-[60] bg-brand-darkest border border-brand-mid/10 rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-mid/10 flex-shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold text-brand-cream">Choose from Media</h3>
            <p className="text-[11px] text-brand-cream/40 mt-0.5">{filtered.length} images available</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-mid/10 text-brand-cream/40 hover:text-brand-cream"><X className="w-4 h-4" /></button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-brand-mid/[0.06] flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-cream/40" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search images..." className="w-full h-9 pl-9 pr-3 text-[13px] bg-brand-darkest/60 border border-brand-mid/10 rounded-lg text-brand-cream placeholder-brand-cream/30 focus:outline-none focus:border-brand-mid/25" />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 text-brand-cream/30 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16"><p className="text-brand-cream/40 text-[13px]">{media.length === 0 ? 'No images uploaded yet. Upload images first.' : 'No images match your search.'}</p></div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item.url === selected ? null : item.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${
                    selected === item.url
                      ? 'border-brand-gold shadow-lg shadow-brand-gold/20 ring-2 ring-brand-gold/30'
                      : 'border-transparent hover:border-brand-mid/20'
                  }`}
                >
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  {selected === item.url && (
                    <div className="absolute inset-0 bg-brand-gold/20 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-brand-gold flex items-center justify-center"><Check className="w-4 h-4 text-brand-darkest" /></div>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                    <p className="text-[9px] text-white/80 truncate">{item.name}</p>
                    <p className="text-[8px] text-white/50">{formatSize(item.size)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-brand-mid/10 flex-shrink-0">
          <p className="text-[11px] text-brand-cream/30">{selected ? 'Image selected' : 'Click an image to select it'}</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-8 px-4 text-[12px] bg-surface-200/60 border border-brand-mid/10 text-brand-cream rounded-lg">Cancel</button>
            <button onClick={handleConfirm} disabled={!selected} className="h-8 px-4 text-[12px] font-medium bg-brand-gold text-brand-darkest rounded-lg hover:bg-brand-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Use Selected</button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

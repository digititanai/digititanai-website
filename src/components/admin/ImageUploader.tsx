'use client'

import { useState } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, FolderOpen } from 'lucide-react'
import dynamic from 'next/dynamic'

const MediaPicker = dynamic(() => import('./MediaPicker'), { ssr: false })

interface ImageUploaderProps {
  value: string
  onChange: (v: string) => void
  label?: string
  hint?: string
}

export default function ImageUploader({ value, onChange, label = 'Image', hint }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) onChange(data.url)
    } catch {} finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleUpload(file)
  }

  return (
    <div>
      <label className="block text-[11px] text-brand-cream/50 font-medium uppercase tracking-wider mb-2">{label}</label>

      {value ? (
        <div className="flex items-start gap-3">
          <div className="w-32 h-20 rounded-lg overflow-hidden bg-brand-darkest/40 flex-shrink-0">
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-1.5 pt-0.5">
            <label className="h-7 px-2.5 text-[10px] font-medium bg-brand-darkest/40 text-brand-cream/60 rounded-lg cursor-pointer inline-flex items-center gap-1 hover:text-brand-cream transition-colors w-fit">
              <Upload className="w-2.5 h-2.5" /> Replace
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
            </label>
            <button onClick={() => setShowPicker(true)} className="h-7 px-2.5 text-[10px] font-medium bg-brand-darkest/40 text-brand-gold/70 rounded-lg inline-flex items-center gap-1 hover:text-brand-gold transition-colors w-fit">
              <FolderOpen className="w-2.5 h-2.5" /> Choose from Media
            </button>
            <button onClick={() => onChange('')} className="h-7 px-2.5 text-[10px] font-medium text-red-400/60 rounded-lg inline-flex items-center gap-1 hover:text-red-400 transition-colors w-fit">
              <X className="w-2.5 h-2.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex items-center gap-3 w-full h-20 px-4 rounded-xl border border-dashed cursor-pointer transition-all ${
              dragOver ? 'border-brand-gold/40 bg-brand-gold/5' : 'border-brand-mid/[0.08] hover:border-brand-mid/20 hover:bg-brand-darkest/20'
            }`}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 text-brand-cream/40 animate-spin" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg bg-brand-darkest/30 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-4 h-4 text-brand-cream/20" />
                </div>
                <div>
                  <span className="text-[12px] text-brand-cream/40 block">Click or drag to upload</span>
                  <span className="text-[10px] text-brand-cream/20">JPG, PNG, WebP — Max 5MB</span>
                </div>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
          </label>
          <button onClick={() => setShowPicker(true)} className="w-full h-9 rounded-xl border border-brand-mid/[0.08] text-[11px] text-brand-cream/40 hover:text-brand-gold hover:border-brand-gold/20 transition-all inline-flex items-center justify-center gap-1.5">
            <FolderOpen className="w-3 h-3" /> Choose from Media Library
          </button>
        </div>
      )}

      {hint && <p className="text-[10px] text-brand-cream/20 mt-1.5">{hint}</p>}

      {showPicker && <MediaPicker onSelect={(url) => onChange(url)} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

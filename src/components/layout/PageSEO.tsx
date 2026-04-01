'use client'
import { useEffect } from 'react'

export default function PageSEO({ title, description, image }: { title?: string; description?: string; image?: string }) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement
      if (meta) meta.content = description
    }
    if (image) {
      let og = document.querySelector('meta[property="og:image"]') as HTMLMetaElement
      if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:image'); document.head.appendChild(og) }
      og.content = image
    }
  }, [title, description, image])
  return null
}

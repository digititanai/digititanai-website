'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { defaultPageContent } from '@/lib/pageContent'

// Simple markdown-to-HTML converter for legal pages
function markdownToHtml(md: string): string {
  if (!md) return ''
  if (md.includes('<h2>')) return md

  let html = md
  // Headings — all levels convert to h2 for consistent section splitting
  html = html.replace(/^#{1,3} (.+)$/gm, '<h2>$1</h2>')
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  // Paragraphs
  html = html.split('\n\n').map(block => {
    const trimmed = block.trim()
    if (!trimmed) return ''
    if (/^<(h[1-6]|ul|ol|li|p|div|blockquote)/.test(trimmed)) return trimmed
    if (!trimmed.startsWith('<')) return `<p>${trimmed}</p>`
    return trimmed
  }).join('\n')

  return html
}

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState(defaultPageContent.privacy)

  useEffect(() => {
    fetch('/api/data/page_content_privacy', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent({ ...defaultPageContent.privacy, ...data }) })
      .catch(() => {})
  }, [])

  const htmlContent = markdownToHtml(content.content || '')

  // Parse sections from HTML
  const sections: { id: string; title: string; html: string }[] = []
  if (htmlContent) {
    const parts = htmlContent.split(/<h2>/gi)
    if (parts[0]?.trim()) sections.push({ id: 'intro', title: 'Introduction', html: parts[0] })
    for (let i = 1; i < parts.length; i++) {
      const endTag = parts[i].indexOf('</h2>')
      const title = parts[i].slice(0, endTag).replace(/<[^>]+>/g, '').replace(/^\d+\.\s*/, '')
      const html = parts[i].slice(endTag + 5)
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      sections.push({ id, title, html })
    }
  }

  return (
    <main>
      <section className="pt-32 pb-12">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link href="/" className="text-[13px] text-brand-cream/40 hover:text-brand-cream inline-flex items-center gap-1.5 mb-6 transition-colors"><ArrowLeft className="w-3.5 h-3.5" /> Back to Home</Link>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-brand-mid/10 border border-brand-mid/20 flex items-center justify-center"><Shield className="w-5 h-5 text-brand-mid" /></div>
              <div>
                <span className="badge">{content.badge}</span>
                <h1 className="heading-lg mt-1">{content.heading}</h1>
              </div>
            </div>
            <p className="text-[14px] text-brand-cream/40">{content.lastUpdated}</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-main">
          <div className="flex gap-12">
            <aside className="hidden lg:block w-[200px] flex-shrink-0">
              <div className="sticky top-28">
                <span className="text-[11px] uppercase tracking-[0.15em] text-brand-cream/30 font-semibold">Contents</span>
                <nav className="mt-4 flex flex-col gap-2">
                  {sections.filter(s => s.id !== 'intro').map(({ id, title }) => (
                    <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }}
                      className="text-[13px] leading-[1.5] text-brand-cream/40 hover:text-brand-cream/80 transition-colors">{title}</a>
                  ))}
                </nav>
              </div>
            </aside>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1 min-w-0 max-w-3xl">
              {sections.map(({ id, title, html }) => (
                <div key={id} id={id} className="mb-10 scroll-mt-28">
                  {id !== 'intro' && <h2 className="text-[22px] font-display font-bold text-brand-cream mb-4">{title}</h2>}
                  <div className="prose-custom text-[15px] leading-[1.85] text-brand-cream/70" dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}

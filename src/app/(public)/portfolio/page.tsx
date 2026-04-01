'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { getPortfolio, type PortfolioItem } from '@/lib/collections'
import { useData } from '@/lib/useData'
import { getIcon } from '@/lib/iconMap'
import { defaultPageContent } from '@/lib/pageContent'
import PageSEO from '@/components/layout/PageSEO'

type FilterCategory = string

const defaultPortfolioItems: PortfolioItem[] = [
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0, 1] } } }

export default function PortfolioPage() {
  const { loaded } = useData()
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [content, setContent] = useState(defaultPageContent.portfolio)
  useEffect(() => {
    fetch('/api/data/page_content_portfolio', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent({ ...defaultPageContent.portfolio, ...data }) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!loaded) return
    const load = async () => {
      const items = getPortfolio()
      setPortfolioItems(items)
    }
    load()
  }, [loaded])

  const isAllSelected = activeFilters.size === 0
  const filterCategories: FilterCategory[] = ['All', ...Array.from(new Set(portfolioItems.flatMap((item) => item.category ? item.category.split(',').map((c) => c.trim()) : []).filter(Boolean)))]

  const toggleFilter = (cat: string) => {
    setActiveFilters((prev) => {
      if (cat === 'All') return new Set()
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const filtered = isAllSelected ? portfolioItems : portfolioItems.filter((item) => {
    const itemCats = item.category ? item.category.split(',').map((c) => c.trim()) : []
    return itemCats.some((c) => activeFilters.has(c))
  })

  return (
    <main>
      <PageSEO title={content.seoTitle} description={content.seoDescription} image={content.seoImage} />
      {/* Hero */}
      <section className="pt-32 pb-10">
        <div className="container-main">
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="badge">{content.badge}</motion.span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-5">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="heading-lg">
                {content.heading}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-3 body-lg max-w-lg">
                {content.subtitle}
              </motion.p>
            </div>
          </div>

          {/* Filter Pills */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap gap-2">
            {filterCategories.map((cat) => {
              const isActive = cat === 'All' ? isAllSelected : activeFilters.has(cat)
              return (
                <button key={cat} onClick={() => toggleFilter(cat)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-gold text-brand-darkest shadow-[0_0_20px_rgba(184,155,74,0.2)]'
                      : 'border border-brand-mid/15 text-brand-cream/50 hover:text-brand-cream hover:border-brand-mid/25'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-16 pt-6">
        <div className="container-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={Array.from(activeFilters).join(',') || 'all'}
              className="grid md:grid-cols-2 gap-5 items-stretch"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={stagger}
            >
              {filtered.length === 0 && (
                <p className="col-span-2 text-center text-brand-cream/30 py-16 body-base">No projects in this category yet.</p>
              )}

              {filtered.map((item, idx) => {
                const Icon = getIcon(item.icon)
                return (
                  <motion.div key={item.slug} variants={fadeUp} className="h-full">
                    <Link href={`/portfolio/${item.slug}`} className="card-hover block h-full p-0 group overflow-hidden flex flex-col">
                      {/* Image area */}
                      <div className={`relative aspect-[16/9] bg-gradient-to-br ${['from-brand-dark via-brand-mid/40 to-brand-dark','from-brand-dark via-brand-gold/10 to-brand-dark','from-brand-dark via-brand-green-light/20 to-brand-dark','from-brand-dark via-brand-mid/30 to-brand-dark'][idx % 4]} overflow-hidden`}>
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (<>
                        <div className="absolute inset-0 opacity-[0.04]" style={{
                          backgroundImage: 'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
                          backgroundSize: '40px 40px',
                        }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-12 h-12 text-brand-cream/10 group-hover:text-brand-cream/20 transition-all duration-500 group-hover:scale-110" />
                        </div>
                        </>)}
                        {/* Hover overlay */}
                        <div className="absolute top-4 right-4 w-9 h-9 rounded-full border border-brand-cream/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-brand-gold/40 transition-all duration-300 bg-brand-darkest/30 backdrop-blur-sm">
                          <ArrowUpRight className="w-4 h-4 text-brand-gold" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-brand-mid mb-2">{item.category}</span>
                        <h3 className="text-[18px] font-display font-bold text-brand-cream group-hover:text-brand-gold transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-[14px] leading-[1.7] text-brand-cream/70 flex-1">{item.description}</p>

                        {/* Metrics */}
                        <div className="mt-5 pt-4 border-t border-brand-mid/10 flex items-center gap-6">
                          {item.metrics.map((m) => (
                            <div key={m.label}>
                              <div className="text-[18px] font-display font-bold text-brand-gold leading-none">{m.value}</div>
                              <div className="text-[11px] text-brand-cream/40 mt-1 uppercase tracking-wider">{m.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}

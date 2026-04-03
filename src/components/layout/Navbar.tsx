'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, CalendarDays } from 'lucide-react'
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion'
import { defaultPageContent } from '@/lib/pageContent'
import { readPreloadedData } from '@/lib/useData'

const defaultHeader = defaultPageContent.header

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isTop, setIsTop] = useState(true)
  const [content, setContent] = useState(defaultHeader)
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const lastScrollY = useRef(0)

  useEffect(() => {
    const preloaded = readPreloadedData()
    if (preloaded?.page_content_header) { setContent(prev => ({ ...prev, ...preloaded.page_content_header as typeof prev })); return }
    fetch('/api/data/page_content_header', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && typeof data === 'object') setContent(prev => ({ ...prev, ...data })) })
      .catch(() => {})
  }, [])

  let navLinks: { label: string; href: string }[] = []
  try {
    navLinks = typeof content.navLinks === 'string' ? JSON.parse(content.navLinks) : content.navLinks
  } catch {
    navLinks = JSON.parse(defaultHeader.navLinks)
  }

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const diff = latest - lastScrollY.current
    setIsTop(latest < 20)
    if (diff > 5 && latest > 100) {
      setHidden(true)
    } else if (diff < -5) {
      setHidden(false)
    }
    lastScrollY.current = latest
  })

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  useEffect(() => { setIsMobileMenuOpen(false) }, [pathname])

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-0 px-0 sm:pt-4 sm:px-4"
      >
        <nav className={`
          flex items-center justify-between w-full max-w-[1200px]
          h-14 px-4 rounded-none sm:rounded-full
          transition-all duration-500 ease-out
          ${isTop
            ? 'bg-brand-darkest/80 backdrop-blur-xl border-b border-brand-mid/10 sm:border-b-0 lg:bg-transparent lg:backdrop-blur-none lg:border-b-0'
            : 'bg-brand-darkest/95 backdrop-blur-xl border-b sm:border border-brand-mid/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          }
        `}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 pl-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-mid/15 to-brand-mid/5 border border-brand-mid/20 flex items-center justify-center relative overflow-hidden">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4h8c8 0 13 5 13 12s-5 12-13 12H6z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" className="text-brand-mid"/>
                <line x1="11" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-gold-light" opacity=".7"/>
                <line x1="11" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-mid"/>
                <line x1="11" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-gold-light" opacity=".7"/>
                <circle cx="21" cy="16" r="1.8" className="fill-brand-gold-light" opacity=".9"/>
              </svg>
            </div>
            <span className="font-logo text-[14px] font-bold tracking-[0.08em] uppercase">
              <span className="text-brand-mid">{content.logoFirst}</span><span className="text-brand-cream">{content.logoSecond}</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link key={link.href} href={link.href}
                  className={`
                    relative px-3.5 py-1.5 text-[13px] font-medium rounded-full
                    transition-all duration-300
                    ${isActive
                      ? 'text-brand-cream'
                      : 'text-surface-400 hover:text-brand-cream'
                    }
                  `}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right: CTA */}
          <div className="flex items-center gap-2 pr-1">
            <Link href={content.buttonLink}
              className="hidden md:inline-flex items-center justify-center h-10 px-5 text-[13px] font-semibold
              bg-brand-mid text-brand-darkest rounded-full
              shadow-[0_0_20px_rgba(6,182,212,0.15)]
              hover:bg-brand-gold-light hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]
              transition-all duration-300">
              {content.buttonText}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -mr-1 text-surface-400 hover:text-brand-cream transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 md:hidden bg-black/40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-14 left-0 right-0 z-40 md:hidden bg-brand-darkest border-b border-surface-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
            >
              <nav className="px-5 py-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                  return (
                    <Link key={link.href} href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors
                        ${isActive ? 'text-brand-cream bg-brand-mid/10' : 'text-surface-400 hover:text-brand-cream hover:bg-surface-300/30'}`}
                    >
                      {link.label}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-mid" />}
                    </Link>
                  )
                })}
                <div className="pt-3 mt-2 border-t border-surface-300">
                  <Link href={content.buttonLink} onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full h-11 text-[14px] font-semibold bg-brand-mid text-brand-darkest rounded-xl">
                    <CalendarDays className="w-4 h-4" />
                    {content.buttonText}
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

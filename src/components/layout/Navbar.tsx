'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Activity } from 'lucide-react'
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion'
import { defaultPageContent } from '@/lib/pageContent'

const defaultHeader = defaultPageContent.header

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isTop, setIsTop] = useState(true)
  const [content, setContent] = useState(defaultHeader)
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const lastScrollY = useRef(0)

  // Fetch editable header content
  useEffect(() => {
    fetch('/api/data/page_content_header', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          setContent(prev => ({ ...prev, ...data }))
        }
      })
      .catch(() => {})
  }, [])

  // Parse nav links from JSON string
  let navLinks: { label: string; href: string }[] = []
  try {
    navLinks = typeof content.navLinks === 'string' ? JSON.parse(content.navLinks) : content.navLinks
  } catch {
    navLinks = JSON.parse(defaultHeader.navLinks)
  }

  // Hide on scroll down, show on scroll up
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false) }, [pathname])

  return (
    <>
      {/* Pill Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: hidden ? -100 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-0 px-0 sm:pt-4 sm:px-4"
      >
        <nav className={`
          flex items-center justify-between w-full max-w-[1200px]
          h-14 px-4 rounded-none sm:rounded-full
          transition-all duration-500 ease-out
          ${isTop
            ? 'bg-brand-darkest/95 backdrop-blur-xl border-b border-brand-mid/10 sm:border-b-0 lg:bg-transparent lg:backdrop-blur-none lg:border-b-0'
            : 'bg-brand-darkest/95 backdrop-blur-xl border-b sm:border border-brand-mid/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          }
        `}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 pl-3">
            <div className="w-8 h-8 rounded-lg bg-brand-gold/15 border border-brand-gold/25 flex items-center justify-center">
              <Activity className="w-4 h-4 text-brand-gold" />
            </div>
            <span className="font-display text-[16px] font-bold text-brand-cream tracking-tight">
              <span className="text-brand-gold">{content.logoFirst}</span>{content.logoSecond}
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
                      : 'text-brand-cream/45 hover:text-brand-cream/80'
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
              bg-brand-gold text-brand-darkest rounded-full
              shadow-[0_0_20px_rgba(184,155,74,0.2)]
              hover:bg-brand-gold-light hover:shadow-[0_0_30px_rgba(184,155,74,0.3)]
              transition-all duration-300">
              {content.buttonText}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -mr-1 text-brand-cream/70 hover:text-brand-cream transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden bg-brand-darkest"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-2">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <motion.div key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block py-3 text-[28px] font-display font-bold tracking-tight transition-colors
                        ${isActive ? 'text-brand-cream' : 'text-brand-cream/30 hover:text-brand-cream/70'}`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: navLinks.length * 0.06 }}
                className="mt-8"
              >
                <Link href={content.buttonLink} onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center h-12 px-8 text-[15px] font-semibold bg-brand-gold text-brand-darkest rounded-full">
                  {content.buttonText}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

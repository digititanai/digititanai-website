'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Linkedin, Twitter, Github, Youtube, Instagram, Facebook, Mail, MapPin, Clock, Phone, ArrowUpRight, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { defaultPageContent } from '@/lib/pageContent'
import { readPreloadedData } from '@/lib/useData'

function MagneticButton({ children, className, href }: { children: React.ReactNode; className: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15
    ref.current.style.transform = `translate(${x}px, ${y}px)`
  }, [])
  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0, 0)'
  }, [])
  return (
    <Link ref={ref} href={href} className={`${className} magnetic-btn`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </Link>
  )
}

const defaultFooter = defaultPageContent.footer
const defaultHeader = defaultPageContent.header

const socialLinks = [
  { icon: Linkedin, href: 'https://linkedin.com/in/digititanai', label: 'LinkedIn' },
  { icon: Facebook, href: 'https://facebook.com/digititanai', label: 'Facebook' },
  { icon: Twitter, href: 'https://x.com/digititanai', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/digititanai', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@digititanai', label: 'YouTube' },
  { icon: Github, href: 'https://github.com/digititanai', label: 'GitHub' },
]

const serviceLinks = [
  { name: 'Tracking & Analytics', slug: 'tracking-analytics' },
  { name: 'Automation with n8n', slug: 'automation-n8n' },
  { name: 'WordPress Development', slug: 'wordpress-development' },
  { name: 'Campaign Optimization', slug: 'campaign-optimization' },
  { name: 'SEO & Content Strategy', slug: 'seo-content-strategy' },
  { name: 'MarTech Consulting', slug: 'martech-consulting' },
]

export default function Footer() {
  const [content, setContent] = useState(defaultFooter)
  const [headerContent, setHeaderContent] = useState(defaultHeader)

  // Read from preloaded data (instant) or fallback to API
  useEffect(() => {
    const preloaded = readPreloadedData()
    if (preloaded) {
      if (preloaded.page_content_footer) setContent(prev => ({ ...prev, ...(preloaded.page_content_footer as typeof prev) }))
      if (preloaded.page_content_header) setHeaderContent(prev => ({ ...prev, ...(preloaded.page_content_header as typeof prev) }))
      return
    }
    fetch('/api/data/page_content_footer', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => { if (data) setContent(prev => ({ ...prev, ...data })) }).catch(() => {})
    fetch('/api/data/page_content_header', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => { if (data) setHeaderContent(prev => ({ ...prev, ...data })) }).catch(() => {})
  }, [])

  // Parse nav links from footer content (independent from header)
  let navLinks: { label: string; href: string }[] = []
  try {
    navLinks = typeof content.navLinks === 'string' ? JSON.parse(content.navLinks) : (content.navLinks || [])
  } catch {
    navLinks = JSON.parse(defaultFooter.navLinks)
  }

  return (
    <footer className="relative bg-brand-darkest">
      {/* CTA Band */}
      <div className="relative py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="container-main relative z-10 text-center"
        >
          <h3 className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] font-display font-bold text-brand-cream leading-[1.1] tracking-[-0.02em]">
            Ready to <span className="gradient-text">Transform</span> Your Digital Presence?
          </h3>
          <p className="mt-4 text-[15px] md:text-[17px] text-brand-cream-dark max-w-xl mx-auto leading-[1.7]">
            Book a free discovery call and let&apos;s discuss how we can drive measurable growth for your business.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <MagneticButton href={content.ctaBtn1Link} className="btn-primary animate-magnetic-pulse gap-2.5 w-full sm:w-auto justify-center">
              {content.ctaBtn1Text}
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton href={content.ctaBtn2Link} className="btn-secondary gap-2.5 w-full sm:w-auto justify-center">
              {content.ctaBtn2Text}
            </MagneticButton>
          </div>
        </motion.div>
      </div>

      <div className="container-main"><div className="line-divider-gold" /></div>

      {/* Main Footer */}
      <div className="container-main py-10 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">

          {/* Brand - spans full on mobile, 4 cols on lg */}
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-mid/15 to-brand-mid/5 border border-brand-mid/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4h8c8 0 13 5 13 12s-5 12-13 12H6z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" className="text-brand-mid"/>
                  <line x1="11" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-gold-light" opacity=".7"/>
                  <line x1="11" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-mid"/>
                  <line x1="11" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-gold-light" opacity=".7"/>
                  <circle cx="21" cy="16" r="1.8" className="fill-brand-gold-light" opacity=".9"/>
                </svg>
              </div>
              <span className="font-logo text-[15px] font-bold tracking-[0.08em] uppercase">
                <span className="text-brand-mid">{headerContent.logoFirst}</span><span className="text-brand-cream">{headerContent.logoSecond}</span>
              </span>
            </Link>
            <p className="text-[13px] sm:text-[14px] leading-[1.7] text-brand-cream-dark max-w-[300px] mb-5">
              {content.brandDescription}
            </p>

            {/* Social */}
            <div className="flex items-center gap-3">
              {(() => {
                const iconMap: Record<string, React.ElementType> = { Linkedin, Facebook, Twitter, Instagram, Youtube, Github }
                let items: { label: string; url: string; icon: string }[] = []
                try { items = typeof content.socialLinks === 'string' ? JSON.parse(content.socialLinks) : (content.socialLinks || []) } catch { items = socialLinks.map(s => ({ label: s.label, url: s.href, icon: s.label })) }
                return items.map((s) => {
                  const Icon = iconMap[s.icon] || Mail
                  return (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      className="w-9 h-9 rounded-lg bg-surface-200 border border-surface-300 flex items-center justify-center
                      text-surface-400 hover:text-brand-mid hover:border-brand-mid/20 hover:bg-brand-mid/10 transition-all duration-300">
                      <Icon className="w-4 h-4" />
                    </a>
                  )
                })
              })()}
            </div>
          </div>

          {/* Navigation */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-[12px] sm:text-[13px] font-semibold text-brand-cream mb-4">{content.navigationHeading || 'Navigation'}</h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] sm:text-[14px] text-brand-cream-dark hover:text-brand-cream transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1 lg:col-span-3">
            <h4 className="text-[12px] sm:text-[13px] font-semibold text-brand-cream mb-4">{content.servicesHeading || 'Services'}</h4>
            <ul className="space-y-2.5">
              {(() => {
                let items: { label: string; href: string }[] = []
                try { items = typeof content.serviceLinks === 'string' ? JSON.parse(content.serviceLinks) : (content.serviceLinks || []) } catch { items = serviceLinks.map(s => ({ label: s.name, href: `/services/${s.slug}` })) }
                return items.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="text-[14px] text-brand-cream-dark hover:text-brand-cream transition-colors duration-200">{s.label}</Link>
                  </li>
                ))
              })()}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-3">
            <h4 className="text-[12px] sm:text-[13px] font-semibold text-brand-cream mb-4">{content.contactHeading || 'Get in Touch'}</h4>
            <ul className="space-y-4">
              <li>
                <a href={`mailto:${content.email}`} className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-surface-200 border border-surface-300 flex items-center justify-center shrink-0 group-hover:border-brand-mid/20 transition-colors">
                    <Mail className="w-4 h-4 text-surface-400 group-hover:text-brand-mid transition-colors" />
                  </div>
                  <span className="text-[14px] text-brand-cream-dark group-hover:text-brand-cream transition-colors">
                    {content.email}
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-200 border border-surface-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-surface-400" />
                </div>
                <span className="text-[14px] text-brand-cream-dark">{content.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-200 border border-surface-300 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-surface-400" />
                </div>
                <span className="text-[14px] text-brand-cream-dark">{content.location}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-200 border border-surface-300 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-surface-400" />
                </div>
                <span className="text-[14px] text-brand-cream-dark">{content.hours}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="container-main">
        <div className="border-t border-surface-300 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-surface-400">
            &copy; {new Date().getFullYear()} {content.copyright}
          </p>
          <div className="flex items-center gap-6">
            <Link href={content.privacyLink || '/privacy'} className="text-[13px] text-surface-400 hover:text-brand-cream transition-colors">{content.privacyText || 'Privacy Policy'}</Link>
            <Link href={content.termsLink || '/terms'} className="text-[13px] text-surface-400 hover:text-brand-cream transition-colors">{content.termsText || 'Terms of Service'}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

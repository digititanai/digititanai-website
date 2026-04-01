'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Send, AlertCircle, Mail, MapPin, Clock, Phone, CalendarDays, ArrowRight, CheckCircle2, Linkedin, Twitter, Facebook, Instagram, Github, Youtube } from 'lucide-react'
import { defaultPageContent } from '@/lib/pageContent'
import PageSEO from '@/components/layout/PageSEO'

interface FormData { name: string; email: string; phone: string; service: string; budget: string; message: string }
interface FormErrors { name?: string; email?: string; phone?: string; service?: string; message?: string }

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.name.trim()) errors.name = 'Name is required'
  if (!data.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Please enter a valid email address'
  if (!data.phone.trim()) errors.phone = 'Phone number is required'
  else if (!/^\+?[\d\s\-()]{7,20}$/.test(data.phone.trim())) errors.phone = 'Please enter a valid phone number'
  if (!data.service) errors.service = 'Please select a service'
  if (!data.message.trim()) errors.message = 'Please describe your project'
  return errors
}

const services = [
  'Tracking & Analytics', 'Automation with n8n', 'Modern WordPress Dev',
  'Campaign Optimization', 'SEO & Content Strategy', 'MarTech Consulting',
  'Social Media Marketing', 'Email & CRM Systems', 'Other',
]

const budgets = ['< $500', '$500 – $1,000', '$1,000 – $5,000', '$5,000+']

const socials = [
  { icon: Linkedin, href: 'https://linkedin.com/in/sabbirahsan', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://x.com/sabbirahsan', label: 'Twitter' },
  { icon: Facebook, href: 'https://facebook.com/sabbirahsan', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/sabbirahsan', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@sabbirahsan', label: 'YouTube' },
  { icon: Github, href: 'https://github.com/sabbirahsan', label: 'GitHub' },
]

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', phone: '', service: '', budget: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [content, setContent] = useState(defaultPageContent.contact)
  useEffect(() => {
    fetch('/api/data/page_content_contact', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent({ ...defaultPageContent.contact, ...data }) })
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name as keyof FormErrors]) setErrors((p) => ({ ...p, [name]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const v = validate(form)
    if (Object.keys(v).length > 0) { setErrors(v); return }
    setSubmitting(true)
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone, service_interest: form.service, budget_range: form.budget, message: form.message }
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        setSubmitted(true); toast.success('Message sent!')
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: 'send_message',
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          service_interest: form.service,
          budget_range: form.budget,
          message: form.message,
        })
      }
      else {
        const err = await res.json().catch(() => ({}))
        if (err.details) {
          const msgs = Object.values(err.details).flat().join(', ')
          toast.error(msgs || err.error || 'Something went wrong.')
        } else {
          toast.error(err.error || 'Something went wrong.')
        }
      }
    } catch { toast.error('Something went wrong.') }
    finally { setSubmitting(false) }
  }

  return (
    <main>
      <PageSEO title={content.seoTitle} description={content.seoDescription} image={content.seoImage} />
      {/* Hero */}
      <section className="pt-32 pb-10">
        <div className="container-main">
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="badge">{content.badge}</motion.span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-5">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="heading-lg">
                {content.heading}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-3 body-lg max-w-lg">
                {content.subtitle}
              </motion.p>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Link href="/book" className="btn-primary gap-2">
                <CalendarDays className="w-4 h-4" /> Book a Free Call
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 pt-6">
        <div className="container-main">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">

            {/* Form Card */}
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="card p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }} />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-brand-gold/15 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-brand-gold" />
                    </div>
                    <h3 className="heading-sm text-brand-cream mb-2">Message Sent!</h3>
                    <p className="body-base mb-8 max-w-sm mx-auto">Thank you for reaching out. I&apos;ll get back to you within 24 hours.</p>
                    <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', service: '', budget: '', message: '' }) }} className="btn-secondary">
                      Send Another Message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  className="card p-7 md:p-9 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }} />
                  <div className="relative z-10 space-y-5">
                    <h2 className="text-[18px] font-display font-bold text-brand-cream mb-1">Send a Message</h2>
                    <p className="text-[13px] text-brand-cream/50 mb-6">Fill out the form and I&apos;ll get back to you within 24 hours.</p>

                    {/* Name + Email row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] uppercase tracking-wider text-brand-cream/40 font-medium mb-1.5">Name *</label>
                        <input type="text" name="name" placeholder="Your name" value={form.name} onChange={handleChange}
                          className={`input-field ${errors.name ? 'border-red-500/40' : ''}`} />
                        {errors.name && <p className="mt-1 text-[12px] text-red-400/70 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-[12px] uppercase tracking-wider text-brand-cream/40 font-medium mb-1.5">Email *</label>
                        <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange}
                          className={`input-field ${errors.email ? 'border-red-500/40' : ''}`} />
                        {errors.email && <p className="mt-1 text-[12px] text-red-400/70 flex items-center gap-1"><AlertCircle size={11} />{errors.email}</p>}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[12px] uppercase tracking-wider text-brand-cream/40 font-medium mb-1.5">Phone *</label>
                      <input type="tel" name="phone" placeholder="+880 1XXX-XXXXXX" value={form.phone} onChange={handleChange}
                        className={`input-field ${errors.phone ? 'border-red-500/40' : ''}`} />
                      {errors.phone && <p className="mt-1 text-[12px] text-red-400/70 flex items-center gap-1"><AlertCircle size={11} />{errors.phone}</p>}
                    </div>

                    {/* Service + Budget row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] uppercase tracking-wider text-brand-cream/40 font-medium mb-1.5">Service *</label>
                        <select name="service" value={form.service} onChange={handleChange}
                          className={`input-field ${errors.service ? 'border-red-500/40' : ''}`}>
                          <option value="">Select a service</option>
                          {services.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.service && <p className="mt-1 text-[12px] text-red-400/70 flex items-center gap-1"><AlertCircle size={11} />{errors.service}</p>}
                      </div>
                      <div>
                        <label className="block text-[12px] uppercase tracking-wider text-brand-cream/40 font-medium mb-1.5">Budget</label>
                        <select name="budget" value={form.budget} onChange={handleChange} className="input-field">
                          <option value="">Select range</option>
                          {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-[12px] uppercase tracking-wider text-brand-cream/40 font-medium mb-1.5">Message *</label>
                      <textarea name="message" rows={5} placeholder="Tell me about your project, goals, and timeline..." value={form.message} onChange={handleChange}
                        className={`textarea-field ${errors.message ? 'border-red-500/40' : ''}`} />
                      {errors.message && <p className="mt-1 text-[12px] text-red-400/70 flex items-center gap-1"><AlertCircle size={11} />{errors.message}</p>}
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={submitting} data-track-ignore className="btn-primary w-full gap-2">
                      {submitting ? 'Sending...' : <><Send size={14} /> Send Message</>}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* Contact Info Card */}
              <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="card p-6 space-y-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }} />
                <div className="relative z-10 space-y-5">
                  <h3 className="text-[15px] font-semibold text-brand-cream">Contact Info</h3>
                  {[
                    { icon: Mail, label: 'Email', value: content.email, href: `mailto:${content.email}` },
                    { icon: Phone, label: 'Phone', value: content.phone },
                    { icon: MapPin, label: 'Location', value: content.location },
                    { icon: Clock, label: 'Hours', value: content.hours },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-mid/[0.06] border border-brand-mid/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-brand-mid" />
                      </div>
                      <div>
                        <div className="text-[11px] text-brand-cream/35 uppercase tracking-wider">{item.label}</div>
                        {item.href ? (
                          <a href={item.href} className="text-[14px] text-brand-cream/80 hover:text-brand-gold transition-colors">{item.value}</a>
                        ) : (
                          <div className="text-[14px] text-brand-cream/80">{item.value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Book a Call Card */}
              <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="card-gold p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(rgba(184,155,74,1) 1px, transparent 1px), linear-gradient(90deg, rgba(184,155,74,1) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }} />
                <div className="relative z-10">
                  <h3 className="text-[15px] font-semibold text-brand-cream mb-2">{content.ctaHeading || 'Prefer a live conversation?'}</h3>
                  <p className="text-[13px] text-brand-cream/60 mb-4">{content.ctaDescription || 'Book a free 30-minute call. No payment required — just a friendly chat about your goals.'}</p>
                  <Link href={content.ctaButtonLink || '/book'} className="btn-primary w-full text-center gap-2">
                    <CalendarDays className="w-4 h-4" /> {content.ctaButtonText || 'Book a Free Call'}
                  </Link>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="card p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }} />
                <div className="relative z-10">
                  <h3 className="text-[15px] font-semibold text-brand-cream mb-4">{content.followHeading || 'Follow Me'}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(() => {
                      const iconMap: Record<string, React.ElementType> = { Linkedin, Twitter, Facebook, Instagram, Youtube, Github }
                      let items: { label: string; url: string; icon: string }[] = []
                      try { items = typeof content.socials === 'string' ? JSON.parse(content.socials) : content.socials || [] } catch { items = socials.map(s => ({ label: s.label, url: s.href, icon: s.label })) }
                      return items.map((s) => {
                        const Icon = iconMap[s.icon] || Mail
                        return (
                          <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-brand-mid/10 text-brand-cream/50 hover:text-brand-gold hover:border-brand-gold/20 transition-all text-[12px] font-medium">
                            <Icon className="w-3.5 h-3.5" /> {s.label}
                          </a>
                        )
                      })
                    })()}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

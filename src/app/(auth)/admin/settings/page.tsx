'use client'

import { useState, useEffect } from 'react'
import { Save, Globe, Search, Link2, Palette, CheckCircle2, XCircle, Loader2, Moon, Sun, Type, Code } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'

type Tab = 'general' | 'seo' | 'integrations' | 'appearance' | 'code'

const defaultSettings = {
  general: {
    siteTitle: 'Sabbir Ahsan',
    tagline: 'Digital Marketer & MarTech Specialist',
    contactEmail: 'sabbirahsan73@gmail.com',
    phone: '+880 1XXX-XXXXXX',
    address: 'Dhaka, Bangladesh',
    logo: '',
    favicon: '',
  },
  seo: {
    metaTitle: 'Sabbir Ahsan | Digital Marketer & MarTech Specialist',
    metaDescription: 'Transforming brands through data-driven digital strategies and cutting-edge marketing technology.',
    ogImage: '',
    gaTrackingId: '',
    keywords: 'digital marketing, martech, SEO, automation, tracking, analytics',
  },
  appearance: {
    primaryColor: '#4B8A6C',
    accentColor: '#B89B4A',
    bgColor: '#071D16',
    textColor: '#E8DCC8',
    surfaceColor: '#0E2A20',
    headingFont: 'Sora',
    bodyFont: 'DM Sans',
    borderRadius: '12',
    darkMode: true,
  },
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState(defaultSettings)
  const [headCode, setHeadCode] = useState('')
  const [bodyCode, setBodyCode] = useState('')
  const [codeSaving, setCodeSaving] = useState(false)
  const [codeSaved, setCodeSaved] = useState(false)

  // Load all settings from Supabase
  useEffect(() => {
    fetch('/api/data/site_settings_v2', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setSettings(prev => ({
          general: { ...prev.general, ...data.general },
          seo: { ...prev.seo, ...data.seo },
          appearance: { ...prev.appearance, ...data.appearance },
        }))
      })
      .catch(() => {})

    fetch('/api/data/site_code_injection', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) { setHeadCode(data.head || ''); setBodyCode(data.body || '') } })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save settings
      await fetch('/api/admin/data/site_settings_v2', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: settings }),
      })

      // Sync general settings → header (logo name, button)
      const nameParts = settings.general.siteTitle.split(' ')
      const headerSync: Record<string, string> = {}
      if (nameParts.length >= 2) {
        headerSync.logoFirst = nameParts[0]
        headerSync.logoSecond = nameParts.slice(1).join(' ')
      } else if (nameParts.length === 1) {
        headerSync.logoFirst = nameParts[0]
        headerSync.logoSecond = ''
      }

      // Read existing header content and merge
      const headerRes = await fetch('/api/data/page_content_header', { cache: 'no-store' })
      const existingHeader = headerRes.ok ? await headerRes.json() : {}
      await fetch('/api/admin/data/page_content_header', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: { ...existingHeader, ...headerSync } }),
      })

      // Sync general settings → footer (email, phone, location, brand desc)
      const footerRes = await fetch('/api/data/page_content_footer', { cache: 'no-store' })
      const existingFooter = footerRes.ok ? await footerRes.json() : {}
      await fetch('/api/admin/data/page_content_footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: { ...existingFooter, email: settings.general.contactEmail, phone: settings.general.phone, location: settings.general.address } }),
      })

      // Sync general settings → contact page
      const contactRes = await fetch('/api/data/page_content_contact', { cache: 'no-store' })
      const existingContact = contactRes.ok ? await contactRes.json() : {}
      await fetch('/api/admin/data/page_content_contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: { ...existingContact, email: settings.general.contactEmail, phone: settings.general.phone, location: settings.general.address } }),
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  const saveCodeInjection = async () => {
    setCodeSaving(true)
    try {
      await fetch('/api/admin/data/site_code_injection', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: { head: headCode, body: bodyCode } }),
      })
      setCodeSaved(true)
      setTimeout(() => setCodeSaved(false), 2000)
    } catch {}
    setCodeSaving(false)
  }

  const g = settings.general
  const s = settings.seo
  const a = settings.appearance
  const setG = (updates: Partial<typeof g>) => setSettings(prev => ({ ...prev, general: { ...prev.general, ...updates } }))
  const setS = (updates: Partial<typeof s>) => setSettings(prev => ({ ...prev, seo: { ...prev.seo, ...updates } }))
  const setA = (updates: Partial<typeof a>) => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, ...updates } }))

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'general', label: 'General', icon: Globe },
    { key: 'seo', label: 'SEO', icon: Search },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'integrations', label: 'Integrations', icon: Link2 },
    { key: 'code', label: 'Code Injection', icon: Code },
  ]

  const inp = 'w-full h-9 px-3 text-[13px] bg-brand-darkest/50 border border-brand-mid/10 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/30 transition-colors'

  const SaveBtn = ({ onSave, isSaving, isSaved }: { onSave: () => void; isSaving: boolean; isSaved: boolean }) => (
    <div className="pt-4 border-t border-brand-mid/10">
      <button onClick={onSave} disabled={isSaving} className="h-9 px-4 text-[13px] font-medium bg-brand-gold text-brand-darkest rounded-lg hover:bg-brand-gold-light disabled:opacity-50 transition-colors inline-flex items-center gap-1.5">
        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
        {isSaved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-[18px] font-semibold text-brand-cream">Settings</h1>

      <div className="flex items-center gap-1 bg-brand-dark/30 border border-brand-mid/10 rounded-lg p-0.5 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`h-7 px-3 rounded-md text-[11px] font-medium transition-colors inline-flex items-center gap-1.5 ${activeTab === tab.key ? 'bg-brand-mid/10 text-brand-cream' : 'text-brand-cream/60 hover:text-brand-cream'}`}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* ═══ GENERAL ═══ */}
      {activeTab === 'general' && (
        <div className="bg-brand-dark/30 border border-brand-mid/10 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">Site Title</label><input type="text" value={g.siteTitle} onChange={(e) => setG({ siteTitle: e.target.value })} className={inp} /><p className="text-[10px] text-brand-cream/25 mt-1">First word = gold, rest = white in logo (e.g. &quot;Sabbir Ahsan&quot;)</p></div>
            <div><label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">Tagline</label><input type="text" value={g.tagline} onChange={(e) => setG({ tagline: e.target.value })} className={inp} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUploader label="Logo" value={g.logo} onChange={(v) => setG({ logo: v })} />
            <ImageUploader label="Favicon" value={g.favicon} onChange={(v) => setG({ favicon: v })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">Contact Email</label><input type="email" value={g.contactEmail} onChange={(e) => setG({ contactEmail: e.target.value })} className={inp} /></div>
            <div><label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">Phone</label><input type="text" value={g.phone} onChange={(e) => setG({ phone: e.target.value })} className={inp} /></div>
            <div className="md:col-span-2"><label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">Address</label><input type="text" value={g.address} onChange={(e) => setG({ address: e.target.value })} className={inp} /></div>
          </div>
          <SaveBtn onSave={handleSave} isSaving={saving} isSaved={saved} />
        </div>
      )}

      {/* ═══ SEO ═══ */}
      {activeTab === 'seo' && (
        <div className="bg-brand-dark/30 border border-brand-mid/10 rounded-xl p-6 space-y-4">
          <div><label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">Meta Title</label><input type="text" value={s.metaTitle} onChange={(e) => setS({ metaTitle: e.target.value })} className={inp} /><p className="text-[10px] text-brand-cream/30 mt-1">{s.metaTitle.length}/60 characters</p></div>
          <div><label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">Meta Description</label><textarea value={s.metaDescription} onChange={(e) => setS({ metaDescription: e.target.value })} rows={3} className="w-full px-3 py-2 text-[13px] bg-brand-darkest/50 border border-brand-mid/10 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/30 resize-none" /><p className="text-[10px] text-brand-cream/30 mt-1">{s.metaDescription.length}/160 characters</p></div>
          <div><label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">Keywords</label><input type="text" value={s.keywords} onChange={(e) => setS({ keywords: e.target.value })} className={inp} /><p className="text-[10px] text-brand-cream/30 mt-1">Comma-separated</p></div>
          <ImageUploader label="OG Image (1200x630)" value={s.ogImage} onChange={(v) => setS({ ogImage: v })} />
          <div><label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">Google Analytics ID</label><input type="text" value={s.gaTrackingId} onChange={(e) => setS({ gaTrackingId: e.target.value })} placeholder="G-XXXXXXXXXX" className={inp} /></div>

          {/* Search Preview */}
          <div className="p-4 bg-white rounded-lg">
            <p className="text-[16px] text-[#1a0dab] font-medium truncate">{s.metaTitle || 'Page Title'}</p>
            <p className="text-[13px] text-[#006621] truncate">sabbirahsan.com</p>
            <p className="text-[13px] text-[#545454] line-clamp-2">{s.metaDescription || 'Meta description will appear here...'}</p>
          </div>
          <SaveBtn onSave={handleSave} isSaving={saving} isSaved={saved} />
        </div>
      )}

      {/* ═══ APPEARANCE ═══ */}
      {activeTab === 'appearance' && (
        <div className="space-y-4">
          {/* Colors */}
          <div className="bg-brand-dark/30 border border-brand-mid/10 rounded-xl p-6 space-y-5">
            <h3 className="text-[14px] font-semibold text-brand-cream">Colors</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Primary', key: 'primaryColor' as const, desc: 'Buttons, links, accents' },
                { label: 'Accent / Gold', key: 'accentColor' as const, desc: 'Highlights, badges, CTA' },
                { label: 'Background', key: 'bgColor' as const, desc: 'Page background' },
                { label: 'Text', key: 'textColor' as const, desc: 'Body text color' },
                { label: 'Surface', key: 'surfaceColor' as const, desc: 'Cards, panels' },
              ].map((c) => (
                <div key={c.key}>
                  <label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">{c.label}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={a[c.key]} onChange={(e) => setA({ [c.key]: e.target.value })} className="w-9 h-9 rounded-lg border border-brand-mid/10 cursor-pointer bg-transparent" />
                    <input type="text" value={a[c.key]} onChange={(e) => setA({ [c.key]: e.target.value })} className={`flex-1 ${inp} font-mono text-[12px]`} />
                  </div>
                  <p className="text-[10px] text-brand-cream/25 mt-1">{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Color Preview */}
            <div className="p-4 rounded-xl border border-brand-mid/10" style={{ backgroundColor: a.bgColor }}>
              <p className="text-[11px] text-brand-cream/40 mb-3">Live Preview</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 px-4 rounded-lg flex items-center text-[13px] font-medium" style={{ backgroundColor: a.primaryColor, color: a.bgColor }}>Primary Button</div>
                <div className="h-9 px-4 rounded-lg flex items-center text-[13px] font-medium" style={{ backgroundColor: a.accentColor, color: a.bgColor }}>Accent Button</div>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: a.surfaceColor }}>
                <p style={{ color: a.textColor, fontFamily: a.headingFont }} className="text-[18px] font-bold">Heading Text</p>
                <p style={{ color: a.textColor, fontFamily: a.bodyFont, opacity: 0.7 }} className="text-[14px] mt-1">Body text with your selected fonts and colors.</p>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-brand-dark/30 border border-brand-mid/10 rounded-xl p-6 space-y-5">
            <h3 className="text-[14px] font-semibold text-brand-cream flex items-center gap-2"><Type className="w-4 h-4" /> Typography</h3>
            {/* Load all Google Fonts for preview */}
            {/* eslint-disable-next-line @next/next/no-css-tags */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;700&family=DM+Sans:wght@400;700&family=Inter:wght@400;700&family=Poppins:wght@400;700&family=Montserrat:wght@400;700&family=Raleway:wght@400;700&family=Oswald:wght@400;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;700&family=Roboto:wght@400;700&family=Roboto+Slab:wght@400;700&family=Playfair+Display:wght@400;700&family=DM+Serif+Display&family=Merriweather:wght@400;700&family=Lora:wght@400;700&family=Source+Serif+Pro:wght@400;700&family=Source+Sans+Pro:wght@400;700&family=Cormorant+Garamond:wght@400;700&family=Crimson+Text:wght@400;700&family=Plus+Jakarta+Sans:wght@400;700&family=Nunito+Sans:wght@400;700&family=Manrope:wght@400;700&family=Work+Sans:wght@400;700&family=Outfit:wght@400;700&family=Figtree:wght@400;700&family=Instrument+Serif&display=swap" />

            {(() => {
              const allFonts = ['Sora', 'DM Sans', 'Inter', 'Poppins', 'Montserrat', 'Raleway', 'Oswald', 'Lato', 'Open Sans', 'Roboto', 'Roboto Slab', 'Playfair Display', 'DM Serif Display', 'Instrument Serif', 'Merriweather', 'Lora', 'Source Serif Pro', 'Source Sans Pro', 'Cormorant Garamond', 'Crimson Text', 'Plus Jakarta Sans', 'Nunito Sans', 'Manrope', 'Work Sans', 'Outfit', 'Figtree']
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Heading Font */}
                  <div>
                    <label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-2">Heading Font</label>
                    <div className="max-h-[280px] overflow-y-auto border border-brand-mid/10 rounded-lg">
                      {allFonts.map(f => (
                        <button key={f} onClick={() => setA({ headingFont: f })}
                          className={`w-full text-left px-3 py-2.5 border-b border-brand-mid/[0.04] transition-all ${a.headingFont === f ? 'bg-brand-gold/10 border-l-2 border-l-brand-gold' : 'hover:bg-brand-mid/5'}`}>
                          <span style={{ fontFamily: `"${f}", sans-serif` }} className="text-[16px] font-bold text-brand-cream block">{f}</span>
                          <span style={{ fontFamily: `"${f}", sans-serif` }} className="text-[12px] text-brand-cream/40">The quick brown fox jumps over the lazy dog</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Body Font */}
                  <div>
                    <label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-2">Body Font</label>
                    <div className="max-h-[280px] overflow-y-auto border border-brand-mid/10 rounded-lg">
                      {allFonts.map(f => (
                        <button key={f} onClick={() => setA({ bodyFont: f })}
                          className={`w-full text-left px-3 py-2.5 border-b border-brand-mid/[0.04] transition-all ${a.bodyFont === f ? 'bg-brand-gold/10 border-l-2 border-l-brand-gold' : 'hover:bg-brand-mid/5'}`}>
                          <span style={{ fontFamily: `"${f}", sans-serif` }} className="text-[14px] text-brand-cream block">{f}</span>
                          <span style={{ fontFamily: `"${f}", sans-serif` }} className="text-[12px] text-brand-cream/40">The quick brown fox jumps over the lazy dog</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            <div>
              <label className="block text-[11px] text-brand-cream/60 uppercase tracking-wider mb-1.5">Border Radius (px)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="24" value={a.borderRadius} onChange={(e) => setA({ borderRadius: e.target.value })} className="flex-1 accent-brand-gold" />
                <span className="text-[13px] text-brand-cream/60 font-mono w-10 text-right">{a.borderRadius}px</span>
              </div>
              <div className="flex gap-2 mt-2">
                {['0', '4', '8', '12', '16', '24'].map(v => (
                  <button key={v} onClick={() => setA({ borderRadius: v })} className={`w-10 h-10 border flex items-center justify-center text-[10px] font-mono transition-all ${a.borderRadius === v ? 'border-brand-gold text-brand-gold' : 'border-brand-mid/10 text-brand-cream/40'}`} style={{ borderRadius: `${v}px` }}>{v}</button>
                ))}
              </div>
            </div>

            {/* Combined Preview */}
            <div className="p-5 rounded-xl border border-brand-mid/10 bg-brand-darkest/50">
              <p className="text-[11px] text-brand-cream/30 mb-3">Preview</p>
              <p style={{ fontFamily: `"${a.headingFont}", sans-serif` }} className="text-[26px] font-bold text-brand-cream">Heading: {a.headingFont}</p>
              <p style={{ fontFamily: `"${a.bodyFont}", sans-serif` }} className="text-[15px] text-brand-cream/70 mt-2 leading-relaxed">Body ({a.bodyFont}): The quick brown fox jumps over the lazy dog. 0123456789. This is how your body text will look across the website with the selected font combination.</p>
            </div>
          </div>

          {/* Dark Mode */}
          <div className="bg-brand-dark/30 border border-brand-mid/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {a.darkMode ? <Moon className="w-5 h-5 text-brand-gold" /> : <Sun className="w-5 h-5 text-brand-gold" />}
                <div>
                  <p className="text-[13px] text-brand-cream font-medium">Dark Mode</p>
                  <p className="text-[11px] text-brand-cream/40">Currently {a.darkMode ? 'enabled' : 'disabled'}</p>
                </div>
              </div>
              <button onClick={() => setA({ darkMode: !a.darkMode })} className={`relative w-11 h-6 rounded-full transition-colors ${a.darkMode ? 'bg-brand-gold' : 'bg-brand-mid/20'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-brand-darkest rounded-full transition-transform shadow-sm ${a.darkMode ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          <SaveBtn onSave={handleSave} isSaving={saving} isSaved={saved} />
        </div>
      )}

      {/* ═══ INTEGRATIONS ═══ */}
      {activeTab === 'integrations' && (
        <div className="bg-brand-dark/30 border border-brand-mid/10 rounded-xl p-4 space-y-3">
          {[
            { name: 'Google Calendar', desc: 'Auto-create calendar events on bookings', connected: !!process.env.NEXT_PUBLIC_SUPABASE_URL, detail: 'sabbirahsan73@gmail.com' },
            { name: 'Gmail API', desc: 'Send emails via OAuth2', connected: true, detail: 'OAuth2 configured' },
            { name: 'Supabase', desc: 'Database, storage, and authentication', connected: true, detail: 'Connected' },
            { name: 'Google Analytics', desc: 'Website analytics tracking', connected: !!s.gaTrackingId && s.gaTrackingId !== '', detail: s.gaTrackingId || 'Not configured' },
          ].map((i) => (
            <div key={i.name} className="flex items-center justify-between p-4 bg-brand-darkest/30 border border-brand-mid/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${i.connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <p className="text-[13px] text-brand-cream/80 font-medium">{i.name}</p>
                  <p className="text-[11px] text-brand-cream/40">{i.desc}</p>
                  <p className="text-[11px] text-brand-cream/30 font-mono mt-0.5">{i.detail}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium inline-flex items-center gap-1 ${i.connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {i.connected ? <><CheckCircle2 className="w-2.5 h-2.5" /> Connected</> : <><XCircle className="w-2.5 h-2.5" /> Not Set</>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ CODE INJECTION ═══ */}
      {activeTab === 'code' && (
        <div className="space-y-6">
          <div className="bg-brand-dark/30 border border-brand-mid/10 rounded-xl p-6">
            <h3 className="text-[14px] font-semibold text-brand-cream mb-1">Head Code</h3>
            <p className="text-[11px] text-brand-cream/40 mb-4">Injected into &lt;head&gt; on every page. Use for analytics, fonts, meta tags.</p>
            <textarea value={headCode} onChange={(e) => { setHeadCode(e.target.value); setCodeSaved(false) }} rows={10} placeholder="<!-- Google Analytics, fonts, etc. -->" className="w-full px-3.5 py-3 text-[13px] font-mono bg-brand-darkest/60 border border-brand-mid/10 rounded-lg text-brand-green-light placeholder-brand-cream/20 focus:outline-none focus:border-brand-mid/25 resize-y leading-relaxed" style={{ minHeight: '150px' }} />
          </div>
          <div className="bg-brand-dark/30 border border-brand-mid/10 rounded-xl p-6">
            <h3 className="text-[14px] font-semibold text-brand-cream mb-1">Body Code</h3>
            <p className="text-[11px] text-brand-cream/40 mb-4">Injected after &lt;body&gt; tag. Use for tag managers, chat widgets.</p>
            <textarea value={bodyCode} onChange={(e) => { setBodyCode(e.target.value); setCodeSaved(false) }} rows={10} placeholder="<!-- GTM noscript, chat widgets, etc. -->" className="w-full px-3.5 py-3 text-[13px] font-mono bg-brand-darkest/60 border border-brand-mid/10 rounded-lg text-brand-green-light placeholder-brand-cream/20 focus:outline-none focus:border-brand-mid/25 resize-y leading-relaxed" style={{ minHeight: '150px' }} />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={saveCodeInjection} disabled={codeSaving} className="h-9 px-4 text-[13px] font-medium bg-brand-gold text-brand-darkest rounded-lg hover:bg-brand-gold-light disabled:opacity-50 transition-colors inline-flex items-center gap-1.5">
              {codeSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : codeSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {codeSaved ? 'Saved!' : 'Save Code'}
            </button>
            <p className="text-[11px] text-brand-cream/30">Changes apply on next page load.</p>
          </div>
        </div>
      )}
    </div>
  )
}

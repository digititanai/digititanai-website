'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, ArrowLeft, Check, X, CheckCircle2, Layers, ListChecks, CreditCard, HeadphonesIcon } from 'lucide-react';
import { getServiceDetail, saveServiceDetail, getServices, getCategories } from '@/lib/collections';
import { useData, useDetailData } from '@/lib/useData';
import { getIcon } from '@/lib/iconMap';
import { serviceDetailDefaults, type ServiceDetailPageData } from '@/lib/serviceDetailDefaults';

type ServiceData = ServiceDetailPageData;
type PricingTier = ServiceData['pricing'][0];

const serviceMap = serviceDetailDefaults;


/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

// Dynamic — reads from admin-editable collections store (returns defaults on server)
function getAllServices() {
  return getServices().filter((s) => s.active).map((s) => ({ slug: s.slug, title: s.title, category: s.category }));
}

// Build the full URL path for a service based on its category hierarchy
function buildServiceUrl(serviceSlug: string, categoryName?: string): string {
  if (!categoryName) return `/services/${serviceSlug}`;
  const cats = getCategories();
  const cat = cats.find((c) => c.name === categoryName);
  if (!cat) return `/services/${serviceSlug}`;
  const parent = cats.find((c) => c.id === cat.parentId);
  if (parent && !parent.id.startsWith('vert-')) {
    return `/services/${parent.slug}/${cat.slug}/${serviceSlug}`;
  }
  return `/services/${cat.slug}/${serviceSlug}`;
}

/* ------------------------------------------------------------------ */
/*  FAQ Item component                                                 */
/* ------------------------------------------------------------------ */

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-brand-mid/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="text-[15px] font-medium text-brand-cream/80 pr-4 group-hover:text-brand-cream transition-colors">
          {question}
        </span>
        <div className="w-7 h-7 rounded-full border border-brand-gold/30 flex items-center justify-center flex-shrink-0 group-hover:border-brand-gold/60 transition-colors">
          <Plus
            className={`w-3.5 h-3.5 text-brand-gold transition-transform duration-300 ${
              isOpen ? 'rotate-45' : ''
            }`}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-6 body-sm text-brand-cream/50 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string[] }>();
  // Catch-all gives array like ['analytics', 'tracking-analytics'] — service slug is always the last segment
  const slugParts = Array.isArray(params.slug) ? params.slug : [params.slug];
  const slug = slugParts[slugParts.length - 1] || '';
  const { loaded } = useData();
  const { loaded: detailLoaded } = useDetailData('col_service_detail_' + slug);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Always start with hardcoded data for consistent server/client initial render
  const hardcoded = serviceMap[slug];

  // After mount, load admin-edited data from localStorage
  const [service, setService] = useState<ServiceData | null>(null);
  const [detail, setDetail] = useState<import('@/lib/collections').ServiceDetail | null>(null);

  useEffect(() => {
    if (!slug || !loaded || !detailLoaded) return;
    // Seed all services to localStorage if not yet done
    for (const [sSlug, sData] of Object.entries(serviceMap)) {
      if (!getServiceDetail(sSlug)) {
        saveServiceDetail(sSlug, {
          category: sData.category,
          description: sData.description,
          heroDescription: sData.overview[0],
          ctaPrimaryText: 'Book a Consultation',
          ctaPrimaryLink: '/contact',
          ctaSecondaryText: 'Contact Me',
          ctaSecondaryLink: '/contact',
          quickOverviewItems: [
            { label: `${sData.process.length}-Step Process` },
            { label: `${sData.deliverables.length} Deliverables` },
            { label: `${sData.pricing.length} Pricing Tiers` },
            { label: '30-Day Support' },
          ],
          processSectionTitle: 'The Process',
          process: sData.process,
          deliverablesSectionTitle: "What's Included",
          deliverables: sData.deliverables,
          pricingSectionTitle: 'Choose Your Plan',
          pricingSectionSubtitle: 'Meet first, pay later. Every plan starts with a free consultation — no upfront payment required.',
          pricing: sData.pricing,
          faqSectionTitle: 'Common Questions',
          faqs: sData.faqs,
          relatedSectionTitle: 'Explore More',
          relatedSlugs: sData.relatedSlugs,
        });
      }
    }

    const saved = getServiceDetail(slug);
    if (saved) {
      setDetail(saved);
      setService({
        title: getServices().find((s) => s.slug === slug)?.title || saved.category,
        category: saved.category,
        description: saved.description,
        overview: [saved.heroDescription || saved.description],
        process: saved.process,
        deliverables: saved.deliverables,
        pricing: saved.pricing as PricingTier[],
        faqs: saved.faqs,
        relatedSlugs: saved.relatedSlugs,
      });
    }
    setMounted(true);
  }, [slug, loaded, detailLoaded]);

  // Use hardcoded for SSR, switch to dynamic after mount
  const s = (mounted && service) ? service : hardcoded;
  const d = mounted ? detail : null;

  /* ---- 404 ---- */
  if (!s) {
    return (
      <main className="min-h-screen bg-brand-darkest flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-md text-brand-cream mb-4">Service Not Found</h1>
          <p className="text-brand-cream/50 body-base mb-8">
            The service you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/services" className="btn-primary">
            View All Services
          </Link>
        </div>
      </main>
    );
  }

  // Use `s` for service data, `d` for detail overrides
  // Only use dynamic data after mount to avoid hydration mismatch
  const relatedServices = mounted
    ? getAllServices().filter((rs) => s.relatedSlugs.includes(rs.slug))
    : s.relatedSlugs.map((rSlug) => {
        const h = serviceMap[rSlug];
        return h ? { slug: rSlug, title: h.title, category: h.category } : { slug: rSlug, title: rSlug, category: '' };
      });

  const heroDescription = d?.heroDescription || s.overview[0];
  const ctaPrimaryText = d?.ctaPrimaryText || 'Book a Consultation';
  const ctaPrimaryLink = d?.ctaPrimaryLink || '/contact';
  const ctaSecondaryText = d?.ctaSecondaryText || 'Contact Me';
  const ctaSecondaryLink = d?.ctaSecondaryLink || '/contact';
  const processSectionTitle = d?.processSectionTitle || 'The Process';
  const deliverablesSectionTitle = d?.deliverablesSectionTitle || "What's Included";
  const pricingSectionTitle = d?.pricingSectionTitle || 'Choose Your Plan';
  const pricingSectionSubtitle = d?.pricingSectionSubtitle || 'Meet first, pay later. Every plan starts with a free consultation — no upfront payment required.';
  const faqSectionTitle = d?.faqSectionTitle || 'Common Questions';
  const relatedSectionTitle = d?.relatedSectionTitle || 'Explore More';

  const defaultItems = [
    { icon: Layers, label: `${s.process.length}-Step Process` },
    { icon: ListChecks, label: `${s.deliverables.length} Deliverables` },
    { icon: CreditCard, label: `${s.pricing.length} Pricing Tiers` },
    { icon: HeadphonesIcon, label: '30-Day Support' },
  ];
  const quickHighlights = (d?.quickOverviewItems?.length ? d.quickOverviewItems : defaultItems).map((item, i) => ({
    icon: 'icon' in item && typeof item.icon === 'string' ? getIcon(item.icon) : (defaultItems[i]?.icon || Layers),
    label: item.label,
  }));

  return (
    <main className="min-h-screen" suppressHydrationWarning>
      {/* ================================================================ */}
      {/*  HERO                                                            */}
      {/* ================================================================ */}
      <section className="pt-28 pb-14">
        <div className="container-main">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[14px] text-brand-cream/50 hover:text-brand-cream transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Services
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            {/* Left column — 60% */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="badge inline-block mb-5">{s.category}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="heading-lg text-brand-cream"
              >
                {s.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="mt-5 text-[15px] text-brand-cream/60 leading-[1.8] max-w-[560px]"
              >
                {heroDescription}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link href={ctaPrimaryLink} className="btn-primary inline-flex items-center gap-2.5">
                  {ctaPrimaryText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href={ctaSecondaryLink} className="btn-secondary">
                  {ctaSecondaryText}
                </Link>
              </motion.div>
            </div>

            {/* Right column — 40% Quick Overview card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl border border-brand-mid/[0.08] p-6">
                <h2 className="text-[13px] font-semibold uppercase tracking-wider text-brand-gold/80 mb-5">
                  Quick Overview
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {quickHighlights.map((h) => (
                    <div key={h.label} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-mid/10 flex items-center justify-center flex-shrink-0">
                        <h.icon className="w-4 h-4 text-brand-gold" />
                      </div>
                      <span className="text-[13px] text-brand-cream/70 font-medium leading-tight">
                        {h.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  PROCESS                                                         */}
      {/* ================================================================ */}
      <section className="py-16">
        <div className="container-main">
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="heading-md text-brand-cream mb-10">
            {processSectionTitle}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
            {s.process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="h-full"
              >
                <div className="rounded-2xl border border-brand-mid/[0.08] p-5 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }} />
                  <div className="relative z-10">
                    <span className="text-[32px] font-display font-bold text-brand-gold/20 leading-none">
                      {String(p.step).padStart(2, '0')}
                    </span>
                    <h3 className="text-[15px] font-semibold text-brand-cream mt-3">{p.title}</h3>
                    <p className="text-[13px] text-brand-cream/60 leading-[1.6] mt-2">{p.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  DELIVERABLES                                                    */}
      {/* ================================================================ */}
      <section className="py-16">
        <div className="container-main">
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="heading-md text-brand-cream mb-10">
            {deliverablesSectionTitle}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {s.deliverables.map((del, i) => (
              <motion.div
                key={del}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-brand-mid/[0.08] hover:border-brand-mid/15 transition-colors"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-brand-gold shrink-0" />
                <span className="text-[14px] text-brand-cream/75">{del}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ================================================================ */}
      {/*  PRICING                                                         */}
      {/* ================================================================ */}
      <section className="py-16">
        <div className="container-main">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="heading-md text-brand-cream">
                {pricingSectionTitle}
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mt-2 body-sm">
                {pricingSectionSubtitle}
              </motion.p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            {s.pricing.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="h-full"
              >
                <div className={`relative rounded-2xl h-full flex flex-col overflow-hidden border ${
                  tier.highlighted
                    ? 'border-brand-gold/25 bg-brand-gold/[0.03]'
                    : 'border-brand-mid/[0.08] bg-transparent'
                }`}>
                  {/* Grid pattern */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }} />

                  {tier.highlighted && (
                    <div className="relative z-10 bg-brand-gold text-brand-darkest text-center py-2 text-[12px] font-bold tracking-wider uppercase">
                      Most Popular
                    </div>
                  )}

                  <div className="relative z-10 p-6 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-[16px] font-semibold text-brand-cream">{tier.name}</h3>
                        <p className="text-[13px] text-brand-cream/50 mt-1">{tier.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-brand-mid/[0.08]">
                      <span className="text-[36px] font-display font-bold text-brand-gold leading-none">{tier.price}</span>
                      {tier.price.includes('/mo') ? null : <span className="text-[13px] text-brand-cream/40">one-time</span>}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {tier.features.map((f) => (
                        <li key={f.text} className={`flex items-center gap-2.5 text-[13px] ${f.included ? 'text-brand-cream/75' : 'text-brand-cream/25'}`}>
                          {f.included ? (
                            <Check className="w-4 h-4 text-brand-mid shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-brand-cream/15 shrink-0" />
                          )}
                          {f.text}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link href={`/book?service=${encodeURIComponent(s.title)}&package=${encodeURIComponent(tier.name)}`} className={tier.highlighted ? 'btn-primary w-full text-center' : 'btn-secondary w-full text-center'}>
                      Book Free Consultation
                    </Link>
                    <p className="text-[11px] text-brand-cream/35 text-center mt-2">No payment required</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  FAQ — Common Questions (2-column)                               */}
      {/* ================================================================ */}
      <section className="py-16">
        <div className="container-main">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-sm text-brand-cream mb-10"
          >
            {faqSectionTitle}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
            {s.faqs.map((faq, i) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  RELATED SERVICES — Explore More                                 */}
      {/* ================================================================ */}
      <section className="py-12">
        <div className="container-main">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-sm text-brand-cream mb-8"
          >
            {relatedSectionTitle}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedServices.map((rs, i) => (
              <motion.div
                key={rs.slug}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link href={buildServiceUrl(rs.slug, rs.category)} className="card card-hover p-5 flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-brand-mid/10 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4.5 h-4.5 text-brand-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-brand-cream/80 group-hover:text-brand-cream transition-colors truncate">
                      {rs.title}
                    </h3>
                  </div>
                  <span className="text-[13px] text-brand-gold/60 group-hover:text-brand-gold transition-colors flex-shrink-0">
                    View&nbsp;&rarr;
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

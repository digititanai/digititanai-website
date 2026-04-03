'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Plus, ArrowRight, ArrowLeft, Check, X, CheckCircle2, Layers, ListChecks, CreditCard, HeadphonesIcon } from 'lucide-react';
import { getServiceDetail, saveServiceDetail, getServices, getCategories } from '@/lib/collections';
import { useData, useDetailData } from '@/lib/useData';
import PageSEO from '@/components/layout/PageSEO';
import { getIcon } from '@/lib/iconMap';
import { serviceDetailDefaults, type ServiceDetailPageData } from '@/lib/serviceDetailDefaults';
import TiltCard from '@/components/ui/TiltCard';

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
          ctaPrimaryLink: '/book',
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

    // Fire view_service dataLayer event
    const serviceName = getServices().find((sv) => sv.slug === slug)?.title || saved?.category || slug
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'view_service', service_name: serviceName, page_url: window.location.href })
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
  const ctaPrimaryLink = d?.ctaPrimaryLink || '/book';
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
      {d ? <PageSEO title={d.seoTitle || s.title} description={d.seoDescription || s.description} image={d.seoImage} /> : null}
      {/* ════════════════════════════════════════════════════════════ */}
      {/*  HERO                                                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(6,182,212,0.06) 0%, transparent 60%)' }} />

        <div className="container-main relative z-10">
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="badge inline-block mb-5">{s.category}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold leading-[1.08] tracking-tight text-brand-cream"
              >
                {s.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-[15px] text-brand-cream-dark leading-[1.8] max-w-[560px]"
              >
                {heroDescription}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
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

            {/* Right column — Quick Overview card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl bg-surface-200 border border-surface-300 p-6 relative overflow-hidden">
                <div className="absolute inset-0 card-shine pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-[13px] font-semibold uppercase tracking-wider text-brand-mid/80 mb-5">
                    Quick Overview
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {quickHighlights.map((h) => (
                      <div key={h.label} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center flex-shrink-0">
                          <h.icon className="w-4 h-4 text-brand-mid" />
                        </div>
                        <span className="text-[13px] text-brand-cream/70 font-medium leading-tight">
                          {h.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  PROCESS                                                       */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-mid/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="container-main relative z-10">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge">Process</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">{processSectionTitle}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch">
            {s.process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="h-full"
              >
                <div className="p-6 rounded-2xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-500 h-full relative overflow-hidden group">
                  <div className="absolute inset-0 card-shine pointer-events-none" />
                  <span className="absolute top-4 right-5 text-5xl font-display font-bold text-brand-mid/[0.06] select-none">
                    {String(p.step).padStart(2, '0')}
                  </span>
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-full bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center mb-5">
                      <span className="text-sm font-mono font-bold text-brand-mid">{String(p.step).padStart(2, '0')}</span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-brand-cream mb-2">{p.title}</h3>
                    <p className="text-sm text-brand-cream-dark leading-relaxed">{p.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  DELIVERABLES                                                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container-main">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge">Deliverables</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">{deliverablesSectionTitle}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {s.deliverables.map((del, i) => (
              <motion.div
                key={del}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center gap-3 px-5 py-4 rounded-xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-300"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-mid shrink-0" />
                <span className="text-[14px] text-brand-cream/75">{del}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════ */}
      {/*  PRICING                                                       */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-mid/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="container-main relative z-10">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge">Pricing</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">{pricingSectionTitle}</h2>
            <p className="mt-4 text-brand-cream-dark max-w-xl mx-auto">{pricingSectionSubtitle}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {s.pricing.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="h-full"
              >
                <TiltCard tiltAmount={6}>
                  <div className={`relative rounded-2xl h-full flex flex-col overflow-hidden border transition-all duration-500 ${
                    tier.highlighted
                      ? 'border-brand-mid/25 bg-brand-mid/[0.04]'
                      : 'bg-surface-200 border-surface-300 hover:border-brand-mid/20'
                  }`}>
                    <div className="absolute inset-0 card-shine pointer-events-none" />

                    {tier.highlighted && (
                      <div className="relative z-10 bg-brand-mid text-brand-darkest text-center py-2 text-[12px] font-bold tracking-wider uppercase">
                        Most Popular
                      </div>
                    )}

                    <div className="relative z-10 p-6 flex flex-col flex-1">
                      <div className="mb-4">
                        <h3 className="text-[16px] font-display font-bold text-brand-cream">{tier.name}</h3>
                        <p className="text-[13px] text-brand-cream-dark mt-1">{tier.description}</p>
                      </div>

                      <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-surface-300">
                        <span className="text-[36px] font-display font-bold gradient-text leading-none">{tier.price}</span>
                        {tier.price.includes('/mo') ? null : <span className="text-[13px] text-brand-cream/40">one-time</span>}
                      </div>

                      <ul className="space-y-2.5 flex-1 mb-6">
                        {tier.features.map((f) => (
                          <li key={f.text} className={`flex items-center gap-2.5 text-[13px] ${f.included ? 'text-brand-cream/75' : 'text-brand-cream/25'}`}>
                            {f.included ? <Check className="w-4 h-4 text-brand-mid shrink-0" /> : <X className="w-4 h-4 text-brand-cream/15 shrink-0" />}
                            {f.text}
                          </li>
                        ))}
                      </ul>

                      <Link href={`/book?service=${encodeURIComponent(s.title)}&package=${encodeURIComponent(tier.name)}`} data-track-ignore onClick={() => { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'select_pricing', service_name: s.title, package_name: tier.name, package_amount: tier.price }) }} className={tier.highlighted ? 'btn-primary w-full text-center' : 'btn-secondary w-full text-center'}>
                        Book Free Consultation
                      </Link>
                      <p className="text-[11px] text-brand-cream/35 text-center mt-2">No payment required</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  FAQ                                                           */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container-main">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge">FAQ</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">{faqSectionTitle}</h2>
          </motion.div>
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

      {/* ════════════════════════════════════════════════════════════ */}
      {/*  RELATED SERVICES                                              */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container-main">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge">More Services</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">{relatedSectionTitle}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedServices.map((rs, i) => (
              <motion.div
                key={rs.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={buildServiceUrl(rs.slug, rs.category)} className="flex items-center gap-4 p-5 rounded-2xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-300 group">
                  <div className="w-11 h-11 rounded-xl bg-brand-mid/10 border border-brand-mid/15 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-mid/15 transition-colors">
                    <Layers className="w-5 h-5 text-brand-mid" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-display font-bold text-brand-cream/80 group-hover:text-brand-cream transition-colors truncate">
                      {rs.title}
                    </h3>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-mid/50 group-hover:text-brand-mid transition-colors flex-shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

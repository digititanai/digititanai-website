'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getPortfolioDetail, savePortfolioDetail } from '@/lib/collections';
import { useData, useDetailData } from '@/lib/useData';
import { portfolioDetailDefaults } from '@/lib/portfolioDetailDefaults';
import PageSEO from '@/components/layout/PageSEO';
import TiltCard from '@/components/ui/TiltCard';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Metric {
  label: string;
  value: string;
}

interface ProjectData {
  title: string;
  category: string;
  description: string;
  client: string;
  industry: string;
  service: string;
  timeline: string;
  tools: string[];
  challenge: string;
  solution: string;
  result: string;
  metrics: Metric[];
  testimonial: { quote: string; author: string; role: string };
  related: string[];
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const projectMap: Record<string, ProjectData> = {
  'fundednext-tracking-overhaul': {
    title: 'FundedNext Tracking Infrastructure',
    category: 'Tracking & Analytics',
    description:
      'Rebuilt the entire tracking and attribution infrastructure for FundedNext, recovering 35% of lost conversion data through server-side implementation. This project eliminated data blind spots across their multi-million dollar ad spend.',
    client: 'FundedNext',
    industry: 'Fintech / Prop Trading',
    service: 'Tracking & Analytics',
    timeline: '6 weeks',
    tools: ['GA4', 'GTM Server-Side', 'Meta CAPI', 'Looker Studio', 'BigQuery'],
    challenge:
      'FundedNext was losing 35% of their conversion data due to ad blockers, iOS privacy restrictions, and browser-side tracking limitations. This data loss meant campaign attribution was fundamentally broken — the marketing team was making budget decisions based on incomplete data, misattributing conversions, and unable to identify which campaigns actually drove revenue.',
    solution:
      'I implemented a full server-side Google Tag Manager setup, deployed Meta Conversions API for direct server-to-server event transmission, configured enhanced conversions across Google Ads, and built a custom data layer that captured every meaningful user interaction. The architecture bypasses client-side blockers entirely, sending conversion events directly from the server to ad platforms.',
    result:
      'The server-side infrastructure recovered 35% of previously lost conversion data, bringing attribution accuracy to 95%. With accurate data feeding back into ad platform algorithms, campaign ROAS improved by 22% within the first month. The marketing team now operates with a single source of truth across all channels, with zero data gaps between platforms.',
    metrics: [
      { label: 'Data Recovery', value: '+35%' },
      { label: 'Attribution Accuracy', value: '95%' },
      { label: 'ROAS Improvement', value: '+22%' },
      { label: 'Data Gaps', value: '0' },
    ],
    testimonial: {
      quote:
        'We had no idea how much data we were missing until DigiTitan AI showed us. The server-side tracking setup completely changed how we optimize campaigns — we finally trust our numbers.',
      author: 'Abdullah Jayed',
      role: 'CEO, FundedNext',
    },
    related: ['fintech-campaign-scaling', 'healthcare-lead-tracking', 'agency-martech-stack'],
  },

  'saas-automation-pipeline': {
    title: 'SaaS Lead Automation with n8n',
    category: 'Automation',
    description:
      'Designed and deployed 15 automated workflows for CloudTask Pro, eliminating 20+ hours of weekly manual work in lead routing, follow-ups, and CRM updates. The system transformed their sales operations from reactive to proactive.',
    client: 'CloudTask Pro',
    industry: 'SaaS',
    service: 'Automation',
    timeline: '4 weeks',
    tools: ['n8n', 'HubSpot', 'Slack', 'Google Sheets', 'Calendly'],
    challenge:
      'The CloudTask Pro sales team was spending over 20 hours every week on manual lead routing, follow-up emails, CRM data entry, and reporting. Leads would sit unassigned for hours, follow-ups were inconsistent, and the team had no systematic way to prioritize high-intent prospects. This manual bottleneck was directly limiting their ability to scale.',
    solution:
      'I built 15 interconnected n8n workflows covering the entire lead lifecycle: automated lead scoring based on behavioral signals, intelligent routing to the right sales rep based on territory and capacity, multi-step email sequences triggered by specific actions, real-time Slack notifications for high-priority leads, automatic CRM updates, and weekly performance reports compiled and delivered without human intervention.',
    result:
      'The automation system saved the team 20+ hours per week immediately. Qualified lead volume increased by 45% because no leads were falling through the cracks, and pipeline velocity tripled as follow-ups happened within minutes instead of hours. The 15 workflows now handle what previously required two full-time coordinators.',
    metrics: [
      { label: 'Hours Saved', value: '20+/wk' },
      { label: 'Qualified Leads', value: '+45%' },
      { label: 'Pipeline Velocity', value: '3x' },
      { label: 'Workflows Built', value: '15' },
    ],
    testimonial: {
      quote:
        'DigiTitan AI built us an automation engine that runs our entire lead operation. What used to take two people full-time now happens automatically, and our conversion rates have never been higher.',
      author: 'James Whitfield',
      role: 'Head of Sales, CloudTask Pro',
    },
    related: ['restaurant-automation', 'agency-martech-stack', 'healthcare-lead-tracking'],
  },

  'ecommerce-wordpress-build': {
    title: 'E-Commerce WordPress Build',
    category: 'WordPress Development',
    description:
      'Built a high-performance WooCommerce store for StyleHouse BD, taking their site from an 8-second load time to a 98 PageSpeed score. The redesign recovered 60% of lost mobile shoppers and drove a 180% increase in mobile conversions.',
    client: 'StyleHouse BD',
    industry: 'Fashion E-Commerce',
    service: 'WordPress Development',
    timeline: '5 weeks',
    tools: ['WordPress', 'Elementor Pro', 'WooCommerce', 'Cloudflare', 'GA4'],
    challenge:
      'StyleHouse BD was running on a bloated WordPress theme with an 8-second average load time. The mobile experience was particularly painful — unresponsive layouts, broken product galleries, and a checkout flow that required excessive scrolling. Analytics showed they were losing 60% of mobile shoppers before they even viewed a product, and mobile accounted for 78% of their traffic.',
    solution:
      'I rebuilt the entire store using a custom Elementor Pro design system optimized for speed and mobile-first shopping. This included aggressive image optimization with WebP conversion and lazy loading, Cloudflare CDN with full page caching, WooCommerce database optimization, a streamlined mobile checkout flow, and a custom product filtering system that loads results without page refreshes.',
    result:
      'The new store scores 98 on Google PageSpeed with a 1.2-second load time. Mobile conversions increased by 180% in the first month, bounce rate dropped by 85%, and average session duration doubled. The site now handles 3x the concurrent traffic without performance degradation.',
    metrics: [
      { label: 'PageSpeed Score', value: '98/100' },
      { label: 'Load Time', value: '1.2s' },
      { label: 'Mobile Conversions', value: '+180%' },
      { label: 'Bounce Rate', value: '-85%' },
    ],
    testimonial: {
      quote:
        'Our old site was embarrassing on mobile. DigiTitan AI rebuilt it into something that loads instantly and actually converts. Sales from mobile tripled in the first month alone.',
      author: 'Farhan Ahmed',
      role: 'Founder, StyleHouse BD',
    },
    related: ['b2b-seo-content-engine', 'fundednext-tracking-overhaul', 'fintech-campaign-scaling'],
  },

  'fintech-campaign-scaling': {
    title: 'Fintech Campaign Scaling',
    category: 'Campaign Optimization',
    description:
      'Scaled PayScale Finance from $5K to $20K monthly ad spend while improving ROAS from 2.1x to 5.2x. A complete rebuild of campaign structure, audience strategy, and tracking infrastructure made profitable scaling possible.',
    client: 'PayScale Finance',
    industry: 'Fintech',
    service: 'Campaign Optimization',
    timeline: '8 months',
    tools: ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'GA4', 'Looker Studio'],
    challenge:
      'PayScale Finance had their ROAS stuck at 2.1x with a $5K monthly ad budget, and every attempt to scale beyond that threshold resulted in diminishing returns. The campaign structure was flat with broad targeting, creative fatigue was rampant, and there was no proper conversion tracking to feed the algorithms accurate signals. They were essentially flying blind at scale.',
    solution:
      'I rebuilt the entire campaign architecture from the ground up: segmented campaigns by funnel stage and intent level, created advanced audience segments using first-party data and lookalikes, developed a dynamic creative framework with 40+ ad variations tested systematically, and implemented server-side tracking to ensure every conversion was captured and attributed correctly. Each platform received a tailored strategy — Google for high-intent search capture, Meta for prospecting and retargeting, LinkedIn for B2B decision-makers.',
    result:
      'Over 8 months, we scaled monthly spend from $5K to $20K while ROAS improved from 2.1x to 5.2x. CPA dropped by 35% even as volume increased 4x. Total revenue attributable to paid campaigns grew by 280%, and the server-side tracking setup ensured the ad platforms received accurate conversion data to optimize against.',
    metrics: [
      { label: 'ROAS', value: '5.2x' },
      { label: 'Spend Scaled', value: '4x' },
      { label: 'CPA Reduction', value: '-35%' },
      { label: 'Revenue Growth', value: '+280%' },
    ],
    testimonial: {
      quote:
        'We tried scaling our ads three times before and failed every time. DigiTitan AI rebuilt everything from scratch and we went from $5K to $20K monthly spend while more than doubling our return.',
      author: 'Nadia Rahman',
      role: 'CMO, PayScale Finance',
    },
    related: ['fundednext-tracking-overhaul', 'b2b-seo-content-engine', 'healthcare-lead-tracking'],
  },

  'b2b-seo-content-engine': {
    title: 'B2B SEO Content Engine',
    category: 'SEO & Content',
    description:
      'Grew DataSync Solutions from 800 to 42,000 monthly organic visitors through a systematic content cluster strategy. Over 12 months, organic search became their primary acquisition channel, driving 60% of total signups.',
    client: 'DataSync Solutions',
    industry: 'B2B SaaS',
    service: 'SEO & Content',
    timeline: '12 months',
    tools: ['Ahrefs', 'Surfer SEO', 'WordPress', 'Google Search Console', 'SEMrush'],
    challenge:
      'DataSync Solutions had only 800 monthly organic visitors and was 100% dependent on paid traffic for customer acquisition. Their blog had a handful of generic posts with no keyword strategy, the site had significant technical SEO issues including slow load times and poor internal linking, and competitors dominated every high-value search term in their space.',
    solution:
      'I developed a comprehensive content cluster strategy targeting 12 core topic pillars relevant to their ICP. Over 12 months, we published 48 long-form articles (2,500-4,000 words each) optimized with Surfer SEO, built 200+ high-quality backlinks through guest posting and digital PR, fixed all technical SEO issues including site speed, schema markup, and crawl errors, and created a robust internal linking architecture that passed authority to money pages.',
    result:
      'Organic traffic grew from 800 to 42,000 monthly visits. Over 180 keywords now rank in the top 10, including 45 in position 1-3. Most importantly, 60% of total signups now come from organic search, fundamentally changing their unit economics and reducing dependence on paid acquisition.',
    metrics: [
      { label: 'Monthly Traffic', value: '42K/mo' },
      { label: 'Top 10 Rankings', value: '180+' },
      { label: 'Organic Signups', value: '60%' },
      { label: 'Articles Published', value: '48' },
    ],
    testimonial: {
      quote:
        'DigiTitan AI turned our blog from an afterthought into our biggest growth channel. Going from 800 to 42,000 monthly visitors in a year seemed impossible, but the content strategy delivered consistently every single month.',
      author: 'Jennifer Park',
      role: 'Head of Marketing, DataSync Solutions',
    },
    related: ['ecommerce-wordpress-build', 'fintech-campaign-scaling', 'agency-martech-stack'],
  },

  'agency-martech-stack': {
    title: 'Agency MarTech Stack Overhaul',
    category: 'MarTech Consulting',
    description:
      'Consolidated GrowthHive Agency from 12 disconnected tools down to 4, cutting $4,800/month in redundant subscriptions. The integrated stack now provides a single source of truth and 200% efficiency gains across operations.',
    client: 'GrowthHive Agency',
    industry: 'Marketing Agency',
    service: 'MarTech Consulting',
    timeline: '8 weeks',
    tools: ['HubSpot', 'n8n', 'Slack', 'Google Workspace', 'Stripe'],
    challenge:
      'GrowthHive Agency was drowning in tool sprawl — 12 disconnected platforms with overlapping functionality, no data flowing between them, and $4,800/month in redundant subscriptions. Client data lived in silos, reporting required manual exports from five different tools, and onboarding a new team member meant training them on a dozen platforms. The inefficiency was costing them more than just money — it was costing them clients.',
    solution:
      'I conducted a full MarTech audit, mapped every workflow and data dependency, and designed a consolidated stack around 4 core tools. HubSpot became the CRM and client communication hub, n8n handled all automations and integrations, Google Workspace covered collaboration, and Stripe managed billing. I built a custom integration layer connecting everything, migrated all historical data with zero loss, and ran hands-on training sessions for the entire team.',
    result:
      'Monthly tool costs dropped by 60%, from $4,800 to $1,920. Team efficiency improved by 200% as measured by tasks completed per hour. All client data now lives in a single unified system, reporting that used to take 3 hours now generates automatically, and new team members get fully onboarded in 2 days instead of 2 weeks.',
    metrics: [
      { label: 'Cost Reduction', value: '-60%' },
      { label: 'Efficiency Gain', value: '+200%' },
      { label: 'Tool Consolidation', value: '12→4' },
      { label: 'Data Unified', value: '100%' },
    ],
    testimonial: {
      quote:
        'We were paying for 12 tools and getting value from maybe 3 of them. DigiTitan AI stripped it all back, built something clean and integrated, and now our entire operation runs on 4 tools that actually talk to each other.',
      author: 'Marcus Chen',
      role: 'Managing Director, GrowthHive Agency',
    },
    related: ['saas-automation-pipeline', 'restaurant-automation', 'fundednext-tracking-overhaul'],
  },

  'healthcare-lead-tracking': {
    title: 'Healthcare Lead Tracking',
    category: 'Tracking & Analytics',
    description:
      'Built a HIPAA-compliant server-side tracking and attribution system for MedCare Network, connecting phone calls, form submissions, and appointments back to the campaigns that drove them. The result was full visibility into marketing ROI for the first time.',
    client: 'MedCare Network',
    industry: 'Healthcare',
    service: 'Tracking & Analytics',
    timeline: '4 weeks',
    tools: ['GA4', 'GTM Server-Side', 'CallRail', 'Looker Studio', 'Google Ads'],
    challenge:
      'MedCare Network had no visibility into which campaigns drove phone calls and appointment bookings — their two most valuable conversion actions. Standard tracking solutions raised HIPAA compliance concerns, call tracking was nonexistent, and the marketing team was allocating budget based on gut feeling rather than data. Over 30% of ad spend was going to underperforming campaigns they could not identify.',
    solution:
      'I designed and implemented a fully HIPAA-compliant server-side tracking infrastructure. This included GTM server-side containers that process data without exposing PHI to third-party scripts, CallRail integration for dynamic number insertion and call attribution, a custom Looker Studio dashboard showing real-time campaign performance across all conversion types, and enhanced conversion tracking for Google Ads that maintains compliance while feeding accurate signals to the algorithm.',
    result:
      'Lead attribution accuracy improved by 40%, giving the team clear visibility into which campaigns drive actual appointments. The setup is 100% HIPAA compliant with full audit trails. By reallocating budget away from underperforming campaigns identified through the new tracking, wasted ad spend decreased by 30%. The real-time dashboard eliminated the need for weekly manual reporting.',
    metrics: [
      { label: 'Attribution Improvement', value: '+40%' },
      { label: 'HIPAA Compliant', value: '100%' },
      { label: 'Wasted Spend Cut', value: '-30%' },
      { label: 'Dashboard', value: 'Real-time' },
    ],
    testimonial: {
      quote:
        'For years we had no idea which ads brought patients through the door. DigiTitan AI built a tracking system that shows us exactly where every call and booking comes from, and it is fully HIPAA compliant. Game changer.',
      author: 'Dr. Sarah Mitchell',
      role: 'Chief Marketing Officer, MedCare Network',
    },
    related: ['fundednext-tracking-overhaul', 'fintech-campaign-scaling', 'agency-martech-stack'],
  },

  'restaurant-automation': {
    title: 'Restaurant Chain Automation',
    category: 'Automation',
    description:
      'Automated review management, booking confirmations, loyalty campaigns, and weekly reporting across 12 restaurant locations for TasteBD. The system replaced 15 hours of weekly manual work and drove a 300% increase in online reviews.',
    client: 'TasteBD Restaurant Group',
    industry: 'Food & Hospitality',
    service: 'Automation',
    timeline: '3 weeks',
    tools: ['n8n', 'Google Business', 'Mailchimp', 'WhatsApp API', 'Google Sheets'],
    challenge:
      'TasteBD was managing reviews, bookings, and promotions manually across 12 locations. Google Business reviews went unanswered for weeks, booking confirmations were inconsistent, loyalty customers received no follow-up communication, and the operations manager spent 15+ hours every week compiling performance reports from spreadsheets. The manual approach could not scale and was hurting their online reputation.',
    solution:
      'I built a suite of n8n automation workflows tailored to multi-location restaurant operations: automated review monitoring and response templates for Google Business across all 12 locations, instant WhatsApp booking confirmations with location-specific details, Mailchimp-powered loyalty email sequences triggered by visit frequency, and automated weekly performance reports aggregating data from all locations into a single dashboard delivered every Monday morning.',
    result:
      'Online reviews increased by 300% as every review now gets a timely, personalized response. Repeat visits grew by 28% thanks to the loyalty email sequences. The operations manager saves 15 hours per week with automated reporting, and all 12 locations now operate with consistent customer communication standards.',
    metrics: [
      { label: 'Review Growth', value: '+300%' },
      { label: 'Repeat Visits', value: '+28%' },
      { label: 'Hours Saved', value: '15/wk' },
      { label: 'Locations Covered', value: '12' },
    ],
    testimonial: {
      quote:
        'Managing 12 locations used to mean drowning in spreadsheets and missed reviews. DigiTitan AI automated everything — now our reviews are up 300%, customers get instant confirmations, and I get my weekends back.',
      author: 'Kamal Hossain',
      role: 'Operations Director, TasteBD Restaurant Group',
    },
    related: ['saas-automation-pipeline', 'agency-martech-stack', 'healthcare-lead-tracking'],
  },
};

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PortfolioDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { loaded } = useData();
  const { loaded: detailLoaded } = useDetailData('col_portfolio_detail_' + slug);
  const [mounted, setMounted] = useState(false);
  const [dynamicProject, setDynamicProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    if (!slug || !loaded || !detailLoaded) return;
    // Seed all projects on first visit
    for (const [pSlug, pData] of Object.entries(portfolioDetailDefaults)) {
      if (!getPortfolioDetail(pSlug)) savePortfolioDetail(pSlug, pData);
    }
    const saved = getPortfolioDetail(slug);
    if (saved) setDynamicProject(saved as ProjectData);
    setMounted(true);

    // Fire view_portfolio dataLayer event
    const projectName = saved?.title || projectMap[slug ?? '']?.title || slug
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'view_portfolio', portfolio_name: projectName, page_url: window.location.href })
  }, [slug, loaded, detailLoaded]);

  const project = (mounted && dynamicProject) ? dynamicProject : projectMap[slug ?? ''];

  if (!project) {
    return (
      <main className="min-h-screen bg-brand-darkest flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-md text-[#E7DDC6] mb-4">Project Not Found</h1>
          <p className="text-[#C9BFA6]/50 body-base mb-8">
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/portfolio" className="btn-primary">
            View All Projects
          </Link>
        </div>
      </main>
    );
  }

  const relatedSlugs = project.related;

  return (
    <main className="min-h-screen">
      {(() => { const pd = mounted ? getPortfolioDetail(slug ?? '') : null; return pd ? <PageSEO title={pd.seoTitle || project.title} description={pd.seoDescription || project.description} image={pd.seoImage} /> : null })()}

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(6,182,212,0.06) 0%, transparent 60%)' }} />

        <div className="container-main relative z-10">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-[14px] text-brand-cream/50 hover:text-brand-cream transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Portfolio
          </Link>

          <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="badge inline-block mb-4">{project.category}</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold leading-[1.08] tracking-tight text-brand-cream mb-5">{project.title}</h1>
              <p className="text-[15px] text-brand-cream-dark leading-relaxed max-w-[560px]">{project.description}</p>
              {(() => {
                const detail = mounted ? getPortfolioDetail(slug ?? '') : null;
                return detail?.image ? (
                  <div className="mt-8 aspect-[16/9] rounded-xl overflow-hidden max-w-[560px]">
                    <img src={detail.image} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                ) : null;
              })()}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="rounded-2xl bg-surface-200 border border-surface-300 p-6 relative overflow-hidden">
                <div className="absolute inset-0 card-shine pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-[13px] uppercase tracking-widest text-brand-mid/80 font-semibold mb-5 font-display">Project Overview</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Client', value: project.client },
                      { label: 'Industry', value: project.industry },
                      { label: 'Service', value: project.service },
                      { label: 'Timeline', value: project.timeline },
                    ].map((item) => (
                      <div key={item.label}>
                        <span className="text-[11px] uppercase tracking-widest text-brand-cream/30 block mb-1 font-semibold">{item.label}</span>
                        <p className="text-[14px] text-brand-cream/70">{item.value}</p>
                      </div>
                    ))}
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-brand-cream/30 block mb-2 font-semibold">Tools</span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tools.map((t) => (
                          <span key={t} className="bg-brand-mid/10 border border-brand-mid/15 px-2.5 py-1 text-[11px] text-brand-mid rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ CHALLENGE / SOLUTION / RESULT ═══ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-mid/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="container-main relative z-10">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { heading: 'The Challenge', body: project.challenge },
              { heading: 'The Solution', body: project.solution },
              { heading: 'The Result', body: project.result },
            ].map((section, i) => (
              <motion.div key={section.heading} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }} className="h-full">
                <TiltCard tiltAmount={6}>
                  <div className="p-7 rounded-2xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-500 h-full relative overflow-hidden group">
                    <div className="absolute inset-0 card-shine pointer-events-none" />
                    <div className="relative z-10">
                      <h3 className="text-lg font-display font-bold text-brand-cream mb-3">{section.heading}</h3>
                      <p className="text-sm text-brand-cream-dark leading-relaxed">{section.body}</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ KEY METRICS ═══ */}
      <section className="py-20">
        <div className="container-main">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge">Results</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">Key Results</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {project.metrics.map((metric, i) => (
              <motion.div key={metric.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-surface-200 border border-surface-300">
                <p className="text-3xl font-display font-bold gradient-text">{metric.value}</p>
                <p className="text-sm text-brand-cream-dark mt-2">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROJECT GALLERY ═══ */}
      {(() => {
        const detail = mounted ? getPortfolioDetail(slug ?? '') : null;
        const gallery = detail?.gallery;
        if (!gallery?.length) return null;
        return (
          <section className="py-20">
            <div className="container-main">
              <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="badge">Gallery</span>
                <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">Project Gallery</h2>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((img, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="aspect-[3/2] rounded-xl overflow-hidden bg-surface-200 border border-surface-300">
                    <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ═══ CLIENT TESTIMONIAL ═══ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.04) 0%, transparent 60%)' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="container-main max-w-[720px] mx-auto text-center relative z-10">
          <span className="text-[72px] font-display text-brand-mid/20 leading-none block mb-2">&ldquo;</span>
          <blockquote className="text-[20px] md:text-[26px] text-brand-cream/75 leading-[1.55] font-display italic mb-6">{project.testimonial.quote}</blockquote>
          <p className="text-[15px] text-brand-cream font-semibold">{project.testimonial.author}</p>
          <p className="text-[13px] text-brand-cream-dark mt-1">{project.testimonial.role}</p>
        </motion.div>
      </section>

      {/* ═══ RELATED PROJECTS ═══ */}
      <section className="py-20">
        <div className="container-main">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge">More Work</span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-display font-bold">More Projects</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedSlugs.map((rSlug, i) => {
              const rProject = projectMap[rSlug];
              if (!rProject) return null;
              return (
                <motion.div key={rSlug} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                  <Link href={`/portfolio/${rSlug}`} className="group block">
                    <div className="overflow-hidden rounded-2xl bg-surface-200 border border-surface-300 hover:border-brand-mid/20 transition-all duration-500">
                      <div className="aspect-[16/10] bg-gradient-to-br from-surface-200 via-brand-mid/10 to-surface-200 flex items-center justify-center">
                        <span className="text-brand-cream/10 text-[12px] font-display italic">{rProject.category}</span>
                      </div>
                      <div className="p-5">
                        <span className="text-[11px] text-brand-mid/60 uppercase tracking-wider font-semibold">{rProject.category}</span>
                        <h3 className="text-[15px] text-brand-cream/80 font-display font-bold mt-1 group-hover:text-brand-cream transition-colors">{rProject.title}</h3>
                        <p className="text-[13px] text-brand-cream-dark mt-1">{rProject.client}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

// Shared data types and localStorage persistence for home page content.
// Admin panel writes here, public home page reads from here.

export interface HeroData {
  badge: string
  heading: string
  subtitle: string
  heroImage: string
  primaryBtnText: string
  primaryBtnLink: string
  secondaryBtnText: string
  secondaryBtnLink: string
  stats: { value: string; label: string }[]
  floatingBadges: { title: string; subtitle: string; icon: string }[]
}

export interface ServiceItem {
  id: string
  title: string
  description: string
  slug: string
  icon: string
}

export interface ServicesData {
  heading: string
  subtitle: string
  linkText: string
  services: ServiceItem[]
}

export interface PortfolioProject {
  id: string
  title: string
  category: string
  description: string
  slug: string
  icon: string
  metrics: { label: string; value: string }[]
}

export interface PortfolioData {
  badge: string
  heading: string
  linkText: string
  projects: PortfolioProject[]
}

export interface Testimonial {
  id: string
  quote: string
  name: string
  company: string
  role: string
  initials: string
}

export interface TestimonialsData {
  badge: string
  heading: string
  subtitle: string
  testimonials: Testimonial[]
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
}

export interface BlogData {
  badge: string
  heading: string
  linkText: string
  posts: BlogPost[]
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQData {
  heading: string
  subtitle: string
  faqs: FAQItem[]
}

export interface SEOData {
  metaTitle: string
  metaDescription: string
  ogImage: string
}

export interface HomePageData {
  hero: HeroData
  services: ServicesData
  portfolio: PortfolioData
  testimonials: TestimonialsData
  blog: BlogData
  faq: FAQData
  seo: SEOData
}

const STORAGE_KEY = 'sabbirahsan_home_page_data'

export const defaultHomePageData: HomePageData = {
  hero: {
    badge: 'Digital Marketer & Martech Specialist',
    heading: "Let's Work Together to Create Wonders.",
    subtitle: 'A visionary martech specialist crafting data-driven growth systems. I bridge the gap between creative marketing and technical execution.',
    heroImage: '',
    primaryBtnText: 'Book Appointment',
    primaryBtnLink: '/book',
    secondaryBtnText: 'View Projects',
    secondaryBtnLink: '/portfolio',
    stats: [
      { value: '5+', label: 'Years Exp.' },
      { value: '100+', label: 'Projects' },
      { value: '98%', label: 'Satisfaction' },
    ],
    floatingBadges: [
      { title: 'Analytics', subtitle: 'GA4 & GTM', icon: 'BarChart3' },
      { title: 'Automation', subtitle: 'n8n & Zapier', icon: 'Zap' },
      { title: 'MarTech', subtitle: 'HubSpot & More', icon: 'Globe' },
    ],
  },
  services: {
    heading: 'Core Expertise',
    subtitle: 'A blend of technical engineering and marketing psychology.',
    linkText: 'View all services',
    services: [
      { id: 's1', title: 'Tracking & Analytics', description: 'Server-side tracking, GA4, GTM, and advanced conversion setup. Get accurate data to make confident marketing decisions.', slug: 'tracking-analytics', icon: 'BarChart3' },
      { id: 's2', title: 'Automation with n8n', description: 'Connect your entire stack with intelligent workflow automation. From lead routing to reporting — fully automated.', slug: 'automation-n8n', icon: 'Zap' },
      { id: 's3', title: 'Modern WordPress Dev', description: 'High-performance WordPress sites with Elementor, built for speed, SEO, and conversion optimization.', slug: 'wordpress-development', icon: 'Globe' },
      { id: 's4', title: 'Campaign Optimization', description: 'Scientific ad management across Google, Meta, and LinkedIn for maximum return on ad spend.', slug: 'campaign-optimization', icon: 'Target' },
      { id: 's5', title: 'SEO & Content Strategy', description: 'Data-driven SEO audits, keyword strategy, and content that ranks and converts.', slug: 'seo-content-strategy', icon: 'Search' },
      { id: 's6', title: 'MarTech Consulting', description: 'Stack audit, tool selection, CRM integration, and full marketing technology optimization.', slug: 'martech-consulting', icon: 'Settings2' },
      { id: 's7', title: 'Social Media Marketing', description: 'Strategic content creation, community management, and paid social across all platforms.', slug: 'social-media-marketing', icon: 'Megaphone' },
      { id: 's8', title: 'Email & CRM Systems', description: 'Email automation, lead nurturing sequences, and CRM setup for scalable growth.', slug: 'email-crm-systems', icon: 'PenTool' },
    ],
  },
  portfolio: {
    badge: 'Selected Work',
    heading: 'Results That Speak For Themselves',
    linkText: 'View all projects',
    projects: [
      { id: 'p1', title: 'FundedNext Tracking Infrastructure', category: 'Tracking', slug: 'fundednext-tracking-overhaul', icon: 'BarChart3', description: 'Rebuilt the entire tracking stack with server-side GTM, GA4, and Meta CAPI — recovering 35% of lost conversion data.', metrics: [{ label: 'Data Accuracy', value: '+35%' }, { label: 'Attribution', value: '95%' }] },
      { id: 'p2', title: 'SaaS Lead Automation with n8n', category: 'Automation', slug: 'saas-automation-pipeline', icon: 'Zap', description: 'Built 15 automated workflows for a SaaS company — from lead capture to onboarding, saving 20+ hours weekly.', metrics: [{ label: 'Hours Saved', value: '20+/wk' }, { label: 'Conversions', value: '+45%' }] },
      { id: 'p3', title: 'E-Commerce WordPress Build', category: 'WordPress', slug: 'ecommerce-wordpress-build', icon: 'Globe', description: 'Designed and built a high-performance WooCommerce store with custom Elementor widgets, achieving 98 PageSpeed score.', metrics: [{ label: 'PageSpeed', value: '98/100' }, { label: 'Load Time', value: '1.2s' }] },
      { id: 'p4', title: 'Fintech Campaign Scaling', category: 'Campaigns', slug: 'fintech-campaign-scaling', icon: 'Target', description: 'Scaled Google & Meta ad campaigns 4x while improving ROAS from 2.1x to 5.2x through scientific optimization.', metrics: [{ label: 'ROAS', value: '5.2x' }, { label: 'Scale', value: '4x' }] },
    ],
  },
  testimonials: {
    badge: 'Client Stories',
    heading: 'What Our Clients Say',
    subtitle: "Real results from real partnerships. Here's what it's like working together.",
    testimonials: [
      { id: 't1', quote: 'Working with Sabbir on our marketing automation was a game-changer. We reduced manual tasks by 70% and saw a 45% increase in qualified leads.', name: 'Michael Chen', company: 'GrowthHub', role: 'Head of Marketing', initials: 'MC' },
      { id: 't2', quote: 'The PPC campaigns Sabbir managed delivered an exceptional 8x ROAS. His data-driven approach and constant optimization made all the difference.', name: 'Emily Rodriguez', company: 'Bloom Commerce', role: 'Founder & CEO', initials: 'ER' },
      { id: 't3', quote: 'Sabbir rebuilt our entire MarTech stack from the ground up. The efficiency gains were immediate and the long-term impact has been extraordinary.', name: 'David Park', company: 'ScaleForce AI', role: 'CTO', initials: 'DP' },
      { id: 't4', quote: 'From brand strategy to execution, Sabbir delivered beyond expectations. Social engagement grew 5x and we saw record-breaking conversions.', name: 'Amara Osei', company: 'Luxe Digital', role: 'Brand Director', initials: 'AO' },
      { id: 't5', quote: 'The server-side tracking setup was flawless. We finally have accurate attribution data, and our ad spend efficiency improved by 35% overnight.', name: 'James Wilson', company: 'TechVentures', role: 'VP Growth', initials: 'JW' },
      { id: 't6', quote: 'Sabbir automated our entire lead nurturing pipeline with n8n. What used to take 15 hours a week now runs on autopilot with better results.', name: 'Sarah Ahmed', company: 'NovaBridge', role: 'Operations Lead', initials: 'SA' },
    ],
  },
  blog: {
    badge: 'Insights',
    heading: 'Latest From The Blog',
    linkText: 'Read All Articles →',
    posts: [
      { id: 'b1', title: 'Server-Side Tracking: The Complete Guide for 2026', excerpt: 'Ad blockers and iOS restrictions are killing your data. Learn how server-side tracking with GTM recovers 30-40% of lost conversions and future-proofs your analytics.', category: 'Tracking', date: 'Mar 22, 2026', readTime: '12 min' },
      { id: 'b2', title: '10 n8n Automation Workflows Every Marketer Needs', excerpt: 'From lead routing to Slack alerts to automated reporting — these 10 n8n workflows will save your team 15+ hours every week.', category: 'Automation', date: 'Mar 18, 2026', readTime: '9 min' },
      { id: 'b3', title: 'GA4 Event Tracking: Setup Guide for E-Commerce', excerpt: 'A step-by-step guide to setting up enhanced e-commerce tracking in GA4 with custom events, data layers, and Looker Studio dashboards.', category: 'Tracking', date: 'Mar 14, 2026', readTime: '14 min' },
    ],
  },
  faq: {
    heading: 'Common Questions',
    subtitle: 'Insights into how I work, my pricing, and technical process.',
    faqs: [
      { question: 'What makes you different from other digital marketers?', answer: 'I combine deep technical expertise (tracking, automation, dev) with strategic marketing thinking. Most marketers focus on one side — I bridge both, so your campaigns are not just creative but also technically sound and measurable.' },
      { question: 'Why is Server-Side Tracking (GTM/GA4) important for my business?', answer: 'Browser-based tracking loses 20-40% of data due to ad blockers and cookie restrictions. Server-side tracking captures accurate data, improves attribution, and gives you reliable insights to make better marketing decisions.' },
      { question: 'Do you build websites from scratch or use templates?', answer: 'Both, depending on your needs and budget. I build high-performance WordPress sites with Elementor for most clients, and custom Next.js/React applications for complex projects requiring advanced functionality.' },
      { question: 'How can n8n automation help my agency or business?', answer: 'n8n automates repetitive tasks like lead routing, email sequences, CRM updates, reporting, and data syncing between tools. Most clients save 10-20 hours per week and reduce human error significantly.' },
      { question: 'Do you manage ad spend directly?', answer: 'Yes. I manage campaigns across Google Ads, Meta Ads, LinkedIn Ads, and TikTok Ads. I handle strategy, creative direction, audience targeting, bid optimization, and reporting — end to end.' },
      { question: 'How much do your services cost?', answer: 'Projects typically range from $500 to $5,000+ depending on scope. I offer flexible pricing — project-based, monthly retainers, or hourly consulting. Every engagement starts with a free discovery call.' },
      { question: 'What is your typical timeline for a project?', answer: 'Small projects (tracking setup, automation): 1-2 weeks. Website builds: 3-6 weeks. Full marketing strategy + execution: ongoing monthly engagement. I always provide a clear timeline upfront.' },
      { question: 'Do you provide post-project support?', answer: 'Absolutely. All projects include 30 days of free support after delivery. I also offer ongoing maintenance and optimization retainers for clients who want continued partnership.' },
      { question: 'I have a custom tech stack. Can you integrate it?', answer: 'Yes. I specialize in connecting tools — CRMs, email platforms, analytics, payment systems, and custom APIs. If it has an API or webhook, I can integrate it into your workflow.' },
      { question: 'How do we get started?', answer: "Simple — book a free 30-minute discovery call. We'll discuss your goals, challenges, and how I can help. No commitment, no pressure. If we're a fit, I'll send a clear proposal within 48 hours." },
    ],
  },
  seo: {
    metaTitle: 'Sabbir Ahsan | Digital Marketer & MarTech Specialist',
    metaDescription: 'Transforming brands through data-driven digital strategies and cutting-edge marketing technology.',
    ogImage: '/og/home.jpg',
  },
}

// In-memory cache for home page data
let homeCache: HomePageData | null = null

export function getHomePageData(): HomePageData {
  if (homeCache) return homeCache
  if (typeof window === 'undefined') return defaultHomePageData
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaultHomePageData, ...JSON.parse(stored) }
  } catch {}
  return defaultHomePageData
}

export function saveHomePageData(data: HomePageData): void {
  homeCache = data
  // Save to Supabase (fire and forget)
  if (typeof window !== 'undefined') {
    fetch('/api/admin/data/sabbirahsan_home_page_data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: data })
    }).catch(() => {})
    // localStorage writes removed — Supabase is the source of truth
  }
}

// Deduplicated fetch — only one in-flight request at a time
let loadPromise: Promise<HomePageData> | null = null

export async function loadHomePageData(): Promise<HomePageData> {
  if (homeCache) return homeCache
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    try {
      const res = await fetch('/api/data/sabbirahsan_home_page_data', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data === 'object' && data.hero) {
          const merged: HomePageData = { ...defaultHomePageData, ...data }
          homeCache = merged
          return merged
        }
      }
    } catch {} finally {
      loadPromise = null
    }
    return getHomePageData()
  })()

  return loadPromise
}

// Force refresh from Supabase (clears cache first)
export async function refreshHomePageData(): Promise<HomePageData> {
  homeCache = null
  loadPromise = null
  return loadHomePageData()
}

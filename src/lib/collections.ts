// Shared collections for Services, Portfolio, Blog, Testimonials.
// Admin CRUD pages write here. Frontend reads here. Home page editor picks from here.
// Uses Supabase via API routes with in-memory cache + localStorage fallback.

export interface PricingFeature { text: string; included: boolean }
export interface PricingTier { name: string; price: string; description?: string; features: PricingFeature[]; highlighted?: boolean }

export interface ProcessStep { step: number; title: string; description: string }
export interface FAQItem { question: string; answer: string }

export interface ServiceDetail {
  category: string
  description: string
  heroDescription: string
  ctaPrimaryText: string
  ctaPrimaryLink: string
  ctaSecondaryText: string
  ctaSecondaryLink: string
  quickOverviewItems: { label: string; icon?: string }[]
  processSectionTitle: string
  process: ProcessStep[]
  deliverablesSectionTitle: string
  deliverables: string[]
  pricingSectionTitle: string
  pricingSectionSubtitle: string
  pricing: PricingTier[]
  faqSectionTitle: string
  faqs: FAQItem[]
  relatedSectionTitle: string
  relatedSlugs: string[]
  seoTitle?: string
  seoDescription?: string
  seoImage?: string
}

export interface ServiceItem {
  id: string
  title: string
  slug: string
  icon: string
  tagline: string
  description: string
  features: string[]
  pricing: PricingTier[]
  category: string
  active: boolean
  detail?: ServiceDetail
}

export interface PortfolioItem {
  id: string
  title: string
  slug: string
  category: string
  description: string
  icon: string
  image?: string
  metrics: { label: string; value: string }[]
  clientName: string
  industry: string
  featured: boolean
}

export interface BlogItem {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  date: string
  readTime: string
  status: 'draft' | 'published'
  featured: boolean
  image?: string
  content: string
}

export interface TestimonialItem {
  id: string
  name: string
  company: string
  role: string
  initials: string
  image?: string
  quote: string
  rating: number
  active: boolean
}

// ── Default seed data (matches frontend exactly) ──

const defaultServices: ServiceItem[] = [
  { id: 's1', title: 'Tracking & Analytics', slug: 'tracking-analytics', icon: 'BarChart3', tagline: 'Measure what matters', description: 'Server-side tracking, GA4, GTM, and advanced conversion setup. Get accurate data to make confident marketing decisions.', features: ['GA4 & GTM Setup', 'Server-Side Tracking', 'Conversion Tracking', 'Custom Dashboards', 'Attribution Modeling', 'Data Layer Implementation'], category: 'Analytics', active: true, pricing: [
    { name: 'Starter', price: '$500', features: [{ text: 'GA4 setup & configuration', included: true }, { text: 'GTM container with core tags', included: true }, { text: 'Up to 10 custom events', included: true }, { text: 'Basic conversion tracking', included: true }, { text: 'Server-side tracking', included: false }, { text: 'Attribution modeling', included: false }] },
    { name: 'Professional', price: '$1,200', highlighted: true, features: [{ text: 'Everything in Starter', included: true }, { text: 'Server-side GTM container', included: true }, { text: 'Up to 30 custom events', included: true }, { text: 'Enhanced conversions', included: true }, { text: 'Custom attribution model', included: true }, { text: 'Looker Studio dashboards', included: true }] },
    { name: 'Enterprise', price: '$2,500', features: [{ text: 'Everything in Professional', included: true }, { text: 'BigQuery data pipeline', included: true }, { text: 'Unlimited custom events', included: true }, { text: 'Multi-property architecture', included: true }, { text: 'Custom API integrations', included: true }, { text: 'Team training workshop', included: true }] },
  ] },
  { id: 's2', title: 'Automation with n8n', slug: 'automation-n8n', icon: 'Zap', tagline: 'Save 10+ hours weekly', description: 'Connect your entire stack with intelligent workflow automation. From lead routing to reporting — fully automated.', features: ['Workflow Design & Build', 'CRM Automation', 'Lead Routing & Scoring', 'Email Sequence Automation', 'Data Sync Between Tools', 'Custom API Integrations'], category: 'Automation', active: true, pricing: [
    { name: 'Starter', price: '$800', features: [{ text: '3 automated workflows', included: true }, { text: 'CRM integration', included: true }, { text: 'Email notifications', included: true }, { text: 'Basic lead routing', included: true }, { text: 'Custom API connections', included: false }, { text: 'Advanced logic & branching', included: false }] },
    { name: 'Professional', price: '$1,800', highlighted: true, features: [{ text: 'Up to 10 workflows', included: true }, { text: 'Multi-tool integrations', included: true }, { text: 'Lead scoring system', included: true }, { text: 'Advanced branching logic', included: true }, { text: 'Error handling & monitoring', included: true }, { text: 'Slack/Teams notifications', included: true }] },
    { name: 'Enterprise', price: '$3,500', features: [{ text: 'Unlimited workflows', included: true }, { text: 'Custom API development', included: true }, { text: 'Database integrations', included: true }, { text: 'Webhook management', included: true }, { text: 'Priority support (30 days)', included: true }, { text: 'Full documentation', included: true }] },
  ] },
  { id: 's3', title: 'Modern WordPress Dev', slug: 'wordpress-development', icon: 'Globe', tagline: 'Built for conversions', description: 'High-performance WordPress sites with Elementor, built for speed, SEO, and conversion optimization.', features: ['Custom Elementor Design', 'Speed Optimization', 'SEO-Ready Structure', 'Mobile-First Development', 'WooCommerce Setup', 'Ongoing Maintenance'], category: 'Development', active: true, pricing: [
    { name: 'Starter', price: '$1,500', features: [{ text: 'Up to 5 pages', included: true }, { text: 'Elementor design', included: true }, { text: 'Mobile responsive', included: true }, { text: 'Basic SEO setup', included: true }, { text: 'WooCommerce', included: false }, { text: 'Custom functionality', included: false }] },
    { name: 'Professional', price: '$3,000', highlighted: true, features: [{ text: 'Up to 15 pages', included: true }, { text: 'Custom Elementor widgets', included: true }, { text: 'Speed optimization', included: true }, { text: 'Advanced SEO setup', included: true }, { text: 'Contact form & CRM integration', included: true }, { text: 'Blog setup', included: true }] },
    { name: 'Enterprise', price: '$6,000', features: [{ text: 'Unlimited pages', included: true }, { text: 'Full WooCommerce store', included: true }, { text: 'Custom plugin development', included: true }, { text: 'Multi-language support', included: true }, { text: 'Hosting setup & migration', included: true }, { text: '60-day support', included: true }] },
  ] },
  { id: 's4', title: 'Campaign Optimization', slug: 'campaign-optimization', icon: 'Target', tagline: 'Maximum ROAS', description: 'Scientific ad management across Google, Meta, and LinkedIn for maximum return on ad spend.', features: ['Google Ads Management', 'Meta Ads (FB/IG)', 'LinkedIn Ads', 'A/B Testing', 'Audience Targeting', 'Performance Reporting'], category: 'Advertising', active: true, pricing: [
    { name: 'Starter', price: '$800/mo', features: [{ text: '1 platform management', included: true }, { text: 'Campaign setup', included: true }, { text: 'Monthly optimization', included: true }, { text: 'Basic reporting', included: true }, { text: 'A/B testing', included: false }, { text: 'Retargeting campaigns', included: false }] },
    { name: 'Professional', price: '$1,500/mo', highlighted: true, features: [{ text: '2 platforms', included: true }, { text: 'Advanced targeting', included: true }, { text: 'Bi-weekly optimization', included: true }, { text: 'A/B testing', included: true }, { text: 'Retargeting campaigns', included: true }, { text: 'Detailed reporting', included: true }] },
    { name: 'Enterprise', price: '$3,000/mo', features: [{ text: 'All platforms', included: true }, { text: 'Full-funnel strategy', included: true }, { text: 'Weekly optimization', included: true }, { text: 'Dynamic creative', included: true }, { text: 'Custom dashboard', included: true }, { text: 'Dedicated manager', included: true }] },
  ] },
  { id: 's5', title: 'SEO & Content Strategy', slug: 'seo-content-strategy', icon: 'Search', tagline: 'Rank and convert', description: 'Data-driven SEO audits, keyword strategy, and content that ranks and converts.', features: ['Technical SEO Audit', 'Keyword Research', 'On-Page Optimization', 'Content Strategy', 'Link Building', 'Monthly SEO Reports'], category: 'SEO', active: true, pricing: [
    { name: 'Starter', price: '$600/mo', features: [{ text: 'Technical SEO audit', included: true }, { text: '5 keyword targets', included: true }, { text: 'On-page optimization', included: true }, { text: 'Monthly report', included: true }, { text: 'Content creation', included: false }, { text: 'Link building', included: false }] },
    { name: 'Professional', price: '$1,200/mo', highlighted: true, features: [{ text: '15 keyword targets', included: true }, { text: '4 blog posts/month', included: true }, { text: 'On-page + technical SEO', included: true }, { text: 'Link building outreach', included: true }, { text: 'Competitor analysis', included: true }, { text: 'Bi-weekly reports', included: true }] },
    { name: 'Enterprise', price: '$2,500/mo', features: [{ text: '50+ keyword targets', included: true }, { text: '8 content pieces/month', included: true }, { text: 'Premium link building', included: true }, { text: 'Content strategy', included: true }, { text: 'Weekly reports', included: true }, { text: 'Dedicated SEO manager', included: true }] },
  ] },
  { id: 's6', title: 'MarTech Consulting', slug: 'martech-consulting', icon: 'Settings2', tagline: 'Optimize your stack', description: 'Stack audit, tool selection, CRM integration, and full marketing technology optimization.', features: ['Tech Stack Audit', 'Tool Selection & Setup', 'CRM Integration', 'Data Migration', 'Team Training', 'Vendor Management'], category: 'Consulting', active: true, pricing: [
    { name: 'Starter', price: '$1,000', features: [{ text: 'Stack audit & report', included: true }, { text: 'Tool recommendations', included: true }, { text: 'Integration plan', included: true }, { text: 'Basic implementation', included: true }, { text: 'Data migration', included: false }, { text: 'Team training', included: false }] },
    { name: 'Professional', price: '$2,500', highlighted: true, features: [{ text: 'Everything in Starter', included: true }, { text: 'Full implementation', included: true }, { text: 'Data migration', included: true }, { text: 'CRM configuration', included: true }, { text: 'Team training (2 sessions)', included: true }, { text: '30-day support', included: true }] },
    { name: 'Enterprise', price: '$5,000', features: [{ text: 'Everything in Professional', included: true }, { text: 'Custom development', included: true }, { text: 'API integrations', included: true }, { text: 'Ongoing management', included: true }, { text: 'Quarterly reviews', included: true }, { text: '90-day support', included: true }] },
  ] },
  { id: 's7', title: 'Social Media Marketing', slug: 'social-media-marketing', icon: 'Megaphone', tagline: 'Build your presence', description: 'Strategic content creation, community management, and paid social across all platforms.', features: ['Content Strategy', 'Community Management', 'Paid Social Campaigns', 'Influencer Outreach', 'Analytics & Reporting', 'Brand Voice Development'], category: 'Social', active: true, pricing: [
    { name: 'Starter', price: '$500/mo', features: [{ text: '2 platforms', included: true }, { text: '12 posts/month', included: true }, { text: 'Basic analytics', included: true }, { text: 'Monthly report', included: true }, { text: 'Community management', included: false }, { text: 'Paid social', included: false }] },
    { name: 'Professional', price: '$1,000/mo', highlighted: true, features: [{ text: '4 platforms', included: true }, { text: '20 posts/month', included: true }, { text: 'Community management', included: true }, { text: 'Stories & Reels', included: true }, { text: 'Paid social strategy', included: true }, { text: 'Bi-weekly reports', included: true }] },
    { name: 'Enterprise', price: '$2,000/mo', features: [{ text: 'All platforms', included: true }, { text: '30+ posts/month', included: true }, { text: 'Full community mgmt', included: true }, { text: 'Influencer outreach', included: true }, { text: 'Paid social execution', included: true }, { text: 'Weekly reports', included: true }] },
  ] },
  { id: 's8', title: 'Email & CRM Systems', slug: 'email-crm-systems', icon: 'PenTool', tagline: 'Scalable growth engine', description: 'Email automation, lead nurturing sequences, and CRM setup for scalable growth.', features: ['CRM Setup & Config', 'Email Template Design', 'Automation Sequences', 'Lead Scoring', 'A/B Testing', 'Deliverability Optimization'], category: 'Email', active: true, pricing: [
    { name: 'Starter', price: '$700', features: [{ text: 'CRM setup', included: true }, { text: '3 email templates', included: true }, { text: '1 automation sequence', included: true }, { text: 'Basic lead scoring', included: true }, { text: 'A/B testing', included: false }, { text: 'Advanced automations', included: false }] },
    { name: 'Professional', price: '$1,500', highlighted: true, features: [{ text: 'Full CRM configuration', included: true }, { text: '10 email templates', included: true }, { text: '5 automation sequences', included: true }, { text: 'Advanced lead scoring', included: true }, { text: 'A/B testing', included: true }, { text: 'Deliverability audit', included: true }] },
    { name: 'Enterprise', price: '$3,000', features: [{ text: 'Everything in Professional', included: true }, { text: 'Unlimited templates', included: true }, { text: 'Unlimited automations', included: true }, { text: 'Custom integrations', included: true }, { text: 'Migration from old CRM', included: true }, { text: '60-day support', included: true }] },
  ] },
]

const defaultPortfolio: PortfolioItem[] = [
  { id: 'p1', title: 'FundedNext Tracking Infrastructure', slug: 'fundednext-tracking-overhaul', category: 'Tracking', description: 'Rebuilt the entire tracking stack with server-side GTM, GA4, and Meta CAPI — recovering 35% of lost conversion data.', icon: 'BarChart3', metrics: [{ label: 'Data Accuracy', value: '+35%' }, { label: 'Attribution', value: '95%' }], clientName: 'FundedNext', industry: 'Fintech', featured: true },
  { id: 'p2', title: 'SaaS Lead Automation with n8n', slug: 'saas-automation-pipeline', category: 'Automation', description: 'Built 15 automated workflows for a SaaS company — from lead capture to onboarding, saving 20+ hours weekly.', icon: 'Zap', metrics: [{ label: 'Hours Saved', value: '20+/wk' }, { label: 'Conversions', value: '+45%' }], clientName: 'CloudMetrics', industry: 'Technology', featured: true },
  { id: 'p3', title: 'E-Commerce WordPress Build', slug: 'ecommerce-wordpress-build', category: 'WordPress', description: 'Designed and built a high-performance WooCommerce store with custom Elementor widgets, achieving 98 PageSpeed score.', icon: 'Globe', metrics: [{ label: 'PageSpeed', value: '98/100' }, { label: 'Load Time', value: '1.2s' }], clientName: 'StyleHub', industry: 'Retail', featured: true },
  { id: 'p4', title: 'Fintech Campaign Scaling', slug: 'fintech-campaign-scaling', category: 'Campaigns', description: 'Scaled Google & Meta ad campaigns 4x while improving ROAS from 2.1x to 5.2x through scientific optimization.', icon: 'Target', metrics: [{ label: 'ROAS', value: '5.2x' }, { label: 'Scale', value: '4x' }], clientName: 'PayFlow', industry: 'Fintech', featured: true },
  { id: 'p5', title: 'B2B SEO Content Engine', slug: 'b2b-seo-content-engine', category: 'SEO', description: 'Grew organic traffic from 800 to 42,000 monthly visits with a strategic content cluster and link building approach.', icon: 'Search', metrics: [{ label: 'Organic Traffic', value: '42K/mo' }, { label: 'Keywords Top 10', value: '180+' }], clientName: 'ScaleForce', industry: 'B2B SaaS', featured: false },
  { id: 'p6', title: 'Agency MarTech Stack Overhaul', slug: 'agency-martech-stack', category: 'MarTech', description: 'Consolidated 12 tools into 4, cut martech costs by 60%, and unified data flow across the entire agency.', icon: 'Settings2', metrics: [{ label: 'Cost Saved', value: '-60%' }, { label: 'Tools', value: '12→4' }], clientName: 'MenaDigital', industry: 'Agency', featured: false },
  { id: 'p7', title: 'Healthcare Lead Tracking', slug: 'healthcare-lead-tracking', category: 'Tracking', description: 'Implemented HIPAA-compliant server-side tracking for a healthcare network, improving lead attribution by 40%.', icon: 'BarChart3', metrics: [{ label: 'Attribution', value: '+40%' }, { label: 'Compliance', value: '100%' }], clientName: 'MedConnect', industry: 'Healthcare', featured: false },
  { id: 'p8', title: 'Restaurant Chain Automation', slug: 'restaurant-automation', category: 'Automation', description: 'Automated review management, booking reminders, and loyalty email flows for a 12-location restaurant chain.', icon: 'Zap', metrics: [{ label: 'Reviews', value: '+300%' }, { label: 'Repeat Visits', value: '+28%' }], clientName: 'Bella Cucina', industry: 'Food & Beverage', featured: false },
]

const defaultBlog: BlogItem[] = [
  { id: 'b1', slug: 'server-side-tracking-complete-guide', title: 'Server-Side Tracking: The Complete Guide for 2026', excerpt: 'Ad blockers and iOS restrictions are killing your data. Learn how server-side tracking with GTM recovers 30-40% of lost conversions and future-proofs your analytics.', category: 'Tracking', date: 'Mar 22, 2026', readTime: '12 min', status: 'published', featured: true, content: '' },
  { id: 'b2', slug: 'n8n-automation-marketing-workflows', title: '10 n8n Automation Workflows Every Marketer Needs', excerpt: 'From lead routing to Slack alerts to automated reporting — these 10 n8n workflows will save your team 15+ hours every week.', category: 'Automation', date: 'Mar 18, 2026', readTime: '9 min', status: 'published', featured: false, content: '' },
  { id: 'b3', slug: 'ga4-event-tracking-setup', title: 'GA4 Event Tracking: Setup Guide for E-Commerce', excerpt: 'A step-by-step guide to setting up enhanced e-commerce tracking in GA4 with custom events, data layers, and Looker Studio dashboards.', category: 'Tracking', date: 'Mar 14, 2026', readTime: '14 min', status: 'published', featured: false, content: '' },
  { id: 'b4', slug: 'wordpress-speed-optimization-2026', title: 'WordPress Speed Optimization: 98+ PageSpeed in 2026', excerpt: 'The exact steps I use to get 98+ PageSpeed scores on WordPress sites — from image optimization to server config to caching strategies.', category: 'WordPress', date: 'Mar 10, 2026', readTime: '11 min', status: 'published', featured: false, content: '' },
  { id: 'b5', slug: 'martech-stack-audit-guide', title: 'How to Audit Your MarTech Stack (and Stop Wasting Money)', excerpt: "Most companies waste 30-50% of their martech budget on overlapping tools. Here's my framework for a lean, high-performance stack.", category: 'MarTech', date: 'Mar 6, 2026', readTime: '8 min', status: 'published', featured: false, content: '' },
  { id: 'b6', slug: 'seo-content-clusters-strategy', title: 'Content Clusters: The SEO Strategy That Tripled Our Traffic', excerpt: 'How we used topic clusters and pillar pages to grow a B2B blog from 800 to 42,000 monthly organic visitors in 12 months.', category: 'SEO', date: 'Mar 2, 2026', readTime: '10 min', status: 'published', featured: false, content: '' },
  { id: 'b7', slug: 'google-ads-roas-optimization', title: 'How I Achieved 5.2x ROAS on Google Ads for a Fintech Client', excerpt: 'A detailed breakdown of the campaign structure, bidding strategy, and creative testing that took ROAS from 2.1x to 5.2x.', category: 'Strategy', date: 'Feb 26, 2026', readTime: '13 min', status: 'published', featured: false, content: '' },
  { id: 'b8', slug: 'email-automation-lead-nurturing', title: 'Email Automation: 7 Lead Nurturing Sequences That Convert', excerpt: 'These 7 email sequences have generated millions in pipeline value for my clients. Templates and logic flows included.', category: 'Automation', date: 'Feb 20, 2026', readTime: '10 min', status: 'published', featured: false, content: '' },
  { id: 'b9', slug: 'meta-conversions-api-setup', title: 'Meta Conversions API: Why You Need It and How to Set It Up', excerpt: "Meta pixel alone misses 20-30% of conversions. Here's how to implement the Conversions API for accurate Facebook & Instagram ad tracking.", category: 'Tracking', date: 'Feb 15, 2026', readTime: '8 min', status: 'published', featured: false, content: '' },
]

const defaultTestimonials: TestimonialItem[] = [
  { id: 't1', name: 'Michael Chen', company: 'GrowthHub', role: 'Head of Marketing', initials: 'MC', quote: 'Working with Sabbir on our marketing automation was a game-changer. We reduced manual tasks by 70% and saw a 45% increase in qualified leads.', rating: 5, active: true },
  { id: 't2', name: 'Emily Rodriguez', company: 'Bloom Commerce', role: 'Founder & CEO', initials: 'ER', quote: 'The PPC campaigns Sabbir managed delivered an exceptional 8x ROAS. His data-driven approach and constant optimization made all the difference.', rating: 5, active: true },
  { id: 't3', name: 'David Park', company: 'ScaleForce AI', role: 'CTO', initials: 'DP', quote: 'Sabbir rebuilt our entire MarTech stack from the ground up. The efficiency gains were immediate and the long-term impact has been extraordinary.', rating: 5, active: true },
  { id: 't4', name: 'Amara Osei', company: 'Luxe Digital', role: 'Brand Director', initials: 'AO', quote: 'From brand strategy to execution, Sabbir delivered beyond expectations. Social engagement grew 5x and we saw record-breaking conversions.', rating: 5, active: true },
  { id: 't5', name: 'James Wilson', company: 'TechVentures', role: 'VP Growth', initials: 'JW', quote: 'The server-side tracking setup was flawless. We finally have accurate attribution data, and our ad spend efficiency improved by 35% overnight.', rating: 5, active: true },
  { id: 't6', name: 'Sarah Ahmed', company: 'NovaBridge', role: 'Operations Lead', initials: 'SA', quote: 'Sabbir automated our entire lead nurturing pipeline with n8n. What used to take 15 hours a week now runs on autopilot with better results.', rating: 5, active: true },
]

// ── Portfolio detail interface ──

export interface PortfolioDetail {
  title: string
  category: string
  description: string
  image?: string
  gallery?: string[]
  client: string
  industry: string
  service: string
  timeline: string
  tools: string[]
  challenge: string
  solution: string
  result: string
  metrics: { label: string; value: string }[]
  testimonial: { quote: string; author: string; role: string }
  related: string[]
  seoTitle?: string
  seoDescription?: string
  seoImage?: string
}

// ── Blog detail interface ──

export interface BlogDetail {
  title: string
  category: string
  image?: string
  date: string
  readTime: string
  excerpt: string
  author: string
  authorRole: string
  authorInitials: string
  intro: string
  toc: { id: string; label: string; content: string }[]
  ctaHeading: string
  ctaDescription: string
  ctaButtonText: string
  ctaButtonLink: string
  ctaSubtext: string
  relatedSectionTitle: string
  featured: boolean
  seoTitle?: string
  seoDescription?: string
  seoImage?: string
}

// ── Categories ──

export interface Category {
  id: string
  name: string
  slug: string
  type: 'service' | 'portfolio' | 'blog' | 'all'
  parentId?: string
}

// 3-level hierarchy: Verticals (fixed) → Parent Categories (CRUD) → Subcategories (CRUD)
// Verticals use id prefix 'vert-', parents use 'cat-', subs use 'sub-'
const defaultCategories: Category[] = [
  // ── Verticals (fixed, not deletable) ──
  { id: 'vert-services', name: 'Services', slug: 'services', type: 'service' },
  { id: 'vert-portfolio', name: 'Portfolio', slug: 'portfolio', type: 'portfolio' },
  { id: 'vert-blog', name: 'Blog', slug: 'blog', type: 'blog' },
  // ── Service parent categories ──
  { id: 'cat-s1', name: 'Analytics', slug: 'analytics', type: 'service', parentId: 'vert-services' },
  { id: 'cat-s2', name: 'Automation', slug: 'automation', type: 'service', parentId: 'vert-services' },
  { id: 'cat-s3', name: 'Development', slug: 'development', type: 'service', parentId: 'vert-services' },
  { id: 'cat-s4', name: 'Advertising', slug: 'advertising', type: 'service', parentId: 'vert-services' },
  { id: 'cat-s5', name: 'SEO', slug: 'seo', type: 'service', parentId: 'vert-services' },
  { id: 'cat-s6', name: 'Consulting', slug: 'consulting', type: 'service', parentId: 'vert-services' },
  { id: 'cat-s7', name: 'Social', slug: 'social', type: 'service', parentId: 'vert-services' },
  { id: 'cat-s8', name: 'Email', slug: 'email', type: 'service', parentId: 'vert-services' },
  // ── Portfolio parent categories ──
  { id: 'cat-p1', name: 'Tracking', slug: 'tracking', type: 'portfolio', parentId: 'vert-portfolio' },
  { id: 'cat-p2', name: 'Automation', slug: 'automation-p', type: 'portfolio', parentId: 'vert-portfolio' },
  { id: 'cat-p3', name: 'WordPress', slug: 'wordpress', type: 'portfolio', parentId: 'vert-portfolio' },
  { id: 'cat-p4', name: 'Campaigns', slug: 'campaigns', type: 'portfolio', parentId: 'vert-portfolio' },
  { id: 'cat-p5', name: 'SEO', slug: 'seo-p', type: 'portfolio', parentId: 'vert-portfolio' },
  { id: 'cat-p6', name: 'MarTech', slug: 'martech', type: 'portfolio', parentId: 'vert-portfolio' },
  // ── Blog parent categories ──
  { id: 'cat-b1', name: 'Tracking', slug: 'tracking-b', type: 'blog', parentId: 'vert-blog' },
  { id: 'cat-b2', name: 'Automation', slug: 'automation-b', type: 'blog', parentId: 'vert-blog' },
  { id: 'cat-b3', name: 'SEO', slug: 'seo-b', type: 'blog', parentId: 'vert-blog' },
  { id: 'cat-b4', name: 'MarTech', slug: 'martech-b', type: 'blog', parentId: 'vert-blog' },
  { id: 'cat-b5', name: 'WordPress', slug: 'wordpress-b', type: 'blog', parentId: 'vert-blog' },
  { id: 'cat-b6', name: 'Strategy', slug: 'strategy', type: 'blog', parentId: 'vert-blog' },
]

// ══════════════════════════════════════════════════════════════════════════════
// Supabase-backed storage with in-memory cache + localStorage fallback
// ══════════════════════════════════════════════════════════════════════════════

// Module-level cache — populated by loadAllCollections() or preloaded data
const cache: Record<string, unknown> = {}

// Allow external population of cache (used by DataPreloader)
export function setCache(key: string, value: unknown) { cache[key] = value }

// ── Supabase API helpers ──

async function fetchFromDB(key: string): Promise<unknown | null> {
  try {
    const res = await fetch(`/api/data/${key}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function saveToDB(key: string, data: unknown): Promise<void> {
  try {
    await fetch(`/api/admin/data/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: data }),
    })
  } catch {
    // Fire-and-forget — silently fail, localStorage is the fallback
  }
}

/**
 * Fetches all main collections from Supabase and populates the in-memory cache.
 * Call this once on app/page mount: `await loadAllCollections()`
 */
export async function loadAllCollections(): Promise<void> {
  const keys = ['col_services', 'col_portfolio', 'col_blog', 'col_testimonials', 'col_categories_v2']
  const results = await Promise.all(keys.map((k) => fetchFromDB(k)))
  keys.forEach((k, i) => {
    if (results[i] != null) cache[k] = results[i]
  })
}

/**
 * Fetch a single collection/detail from Supabase and cache it.
 * Useful for loading detail pages on demand: `await loadCollection('col_blog_detail_my-slug')`
 */
export async function loadCollection(key: string): Promise<unknown | null> {
  const data = await fetchFromDB(key)
  if (data != null) cache[key] = data
  return data
}

// ── localStorage helpers (fallback during migration) ──

// localStorage reads removed — Supabase is the only source of truth
function readLocalStorage<T>(_key: string): T | null {
  return null
}

// localStorage writes removed — Supabase is the source of truth
function writeLocalStorage(_key: string, _data: unknown): void {
  // No-op: database is now the primary store
}

// ══════════════════════════════════════════════════════════════════════════════
// Public API — Synchronous get/save (backward-compatible)
// ══════════════════════════════════════════════════════════════════════════════

// ── Services ──

export const getServices = (): ServiceItem[] => {
  if (cache['col_services']) return cache['col_services'] as ServiceItem[]
  const local = readLocalStorage<ServiceItem[]>('col_services')
  if (local) return local
  return defaultServices
}

export const saveServices = (data: ServiceItem[]): void => {
  cache['col_services'] = data
  saveToDB('col_services', data)
  writeLocalStorage('col_services', data)
}

// ── Service Detail ──

export function getServiceDetail(slug: string): ServiceDetail | null {
  const key = `col_service_detail_${slug}`
  if (cache[key]) return cache[key] as ServiceDetail
  const local = readLocalStorage<ServiceDetail>(key)
  if (local) return local
  return null
}

export function saveServiceDetail(slug: string, data: ServiceDetail): void {
  const key = `col_service_detail_${slug}`
  cache[key] = data
  saveToDB(key, data)
  writeLocalStorage(key, data)
}

// ── Portfolio ──

export const getPortfolio = (): PortfolioItem[] => {
  if (cache['col_portfolio']) return cache['col_portfolio'] as PortfolioItem[]
  const local = readLocalStorage<PortfolioItem[]>('col_portfolio')
  if (local) return local
  return defaultPortfolio
}

export const savePortfolio = (data: PortfolioItem[]): void => {
  cache['col_portfolio'] = data
  saveToDB('col_portfolio', data)
  writeLocalStorage('col_portfolio', data)
}

// ── Portfolio Detail ──

export function getPortfolioDetail(slug: string): PortfolioDetail | null {
  const key = `col_portfolio_detail_${slug}`
  if (cache[key]) return cache[key] as PortfolioDetail
  const local = readLocalStorage<PortfolioDetail>(key)
  if (local) return local
  return null
}

export function savePortfolioDetail(slug: string, data: PortfolioDetail): void {
  const key = `col_portfolio_detail_${slug}`
  cache[key] = data
  saveToDB(key, data)
  writeLocalStorage(key, data)
}

// ── Blog ──

export const getBlog = (): BlogItem[] => {
  if (cache['col_blog']) return cache['col_blog'] as BlogItem[]
  const local = readLocalStorage<BlogItem[]>('col_blog')
  if (local) return local
  return defaultBlog
}

export const saveBlog = (data: BlogItem[]): void => {
  cache['col_blog'] = data
  saveToDB('col_blog', data)
  writeLocalStorage('col_blog', data)
}

// ── Blog Detail ──

export function getBlogDetail(slug: string): BlogDetail | null {
  const key = `col_blog_detail_${slug}`
  if (cache[key]) return cache[key] as BlogDetail
  const local = readLocalStorage<BlogDetail>(key)
  if (local) return local
  return null
}

export function saveBlogDetail(slug: string, data: BlogDetail): void {
  const key = `col_blog_detail_${slug}`
  cache[key] = data
  saveToDB(key, data)
  writeLocalStorage(key, data)
}

// ── Testimonials ──

export const getTestimonials = (): TestimonialItem[] => {
  if (cache['col_testimonials']) return cache['col_testimonials'] as TestimonialItem[]
  const local = readLocalStorage<TestimonialItem[]>('col_testimonials')
  if (local) return local
  return defaultTestimonials
}

export const saveTestimonials = (data: TestimonialItem[]): void => {
  cache['col_testimonials'] = data
  saveToDB('col_testimonials', data)
  writeLocalStorage('col_testimonials', data)
}

// ── Categories ──

export const getCategories = (): Category[] => {
  if (cache['col_categories_v2']) return cache['col_categories_v2'] as Category[]
  const local = readLocalStorage<Category[]>('col_categories_v2')
  if (local && local.length) return local
  // First load or version upgrade — seed defaults and clear old version
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem('col_categories') } catch {}
    writeLocalStorage('col_categories_v2', defaultCategories)
  }
  return defaultCategories
}

export const saveCategories = (data: Category[]): void => {
  cache['col_categories_v2'] = data
  saveToDB('col_categories_v2', data)
  writeLocalStorage('col_categories_v2', data)
}

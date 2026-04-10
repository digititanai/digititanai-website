'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Plus, Trash2, Check, Eye, ChevronDown, ChevronRight, ExternalLink, Star, GripVertical } from 'lucide-react'
import { getBlog, saveBlog, getBlogDetail, saveBlogDetail, loadAllCollections, loadCollection, type BlogDetail } from '@/lib/collections'
import { useData } from '@/lib/useData'
import CategoryPicker from '@/components/admin/CategoryPicker'
import ImageUploader from '@/components/admin/ImageUploader'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false, loading: () => <div className="h-[120px] rounded-xl bg-brand-darkest/40 border border-brand-mid/[0.06] animate-pulse" /> })

function SectionBlock({ title, color, defaultOpen, children }: { title: string; color: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const colors: Record<string, string> = { green: 'border-brand-mid/30 bg-brand-mid/[0.04] text-brand-mid', gold: 'border-brand-gold/30 bg-brand-gold/[0.03] text-brand-gold', blue: 'border-blue-500/30 bg-blue-500/[0.03] text-blue-400', emerald: 'border-emerald-500/30 bg-emerald-500/[0.03] text-emerald-400', amber: 'border-amber-500/30 bg-amber-500/[0.03] text-amber-400' }
  const c = colors[color] || colors.green
  return (
    <div className={`rounded-xl border-l-2 ${c.split(' ').slice(0, 2).join(' ')}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-brand-darkest/20 transition-colors">
        <span className={`text-[10px] uppercase tracking-widest font-semibold ${c.split(' ')[2]}`}>{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-brand-cream/40" /> : <ChevronRight className="w-4 h-4 text-brand-cream/30" />}
      </button>
      {open && <div className="px-5 pb-5 pt-2">{children}</div>}
    </div>
  )
}

const inp = "w-full h-10 px-3 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15"
const ta = "w-full px-3 py-2.5 text-[13px] bg-brand-darkest/40 border border-brand-mid/[0.06] rounded-xl text-brand-cream focus:outline-none focus:border-brand-mid/15 resize-none"

// Default intro seeds for hardcoded blog posts
const defaultIntroSeeds: Record<string, string> = {
  'server-side-tracking-complete-guide': `If you are running digital advertising campaigns in 2026, there is a good chance you are losing between 20% and 40% of your conversion data. Browser-based tracking — the model the industry relied on for over a decade — is fundamentally broken. Ad blockers, Intelligent Tracking Prevention on iOS and Safari, and the deprecation of third-party cookies have created a measurement gap that grows wider every quarter.

Server-side tracking solves this by moving the data collection layer from the user's browser to a server you control. In this guide, I will walk you through exactly what server-side tracking is, why it matters, how to set it up with Google Tag Manager, and when it makes sense for your business.`,

  'n8n-automation-marketing-workflows': `Marketing teams waste an extraordinary amount of time on repetitive tasks. Copying data between tools, sending follow-up messages, building weekly reports, routing leads to the right sales rep — these are all tasks that should run on autopilot. The problem is that most automation platforms charge per workflow, per execution, or per "zap," and costs spiral quickly.

**n8n** is the open-source alternative that changes this equation. Self-hosted with no execution limits, it connects to over 400 apps and lets you build workflows with a visual node editor. I have been using n8n for client work since 2024, and these are the 10 workflows that consistently deliver the most value.`,

  'ga4-event-tracking-setup': `Google Analytics 4 is fundamentally event-driven. Unlike Universal Analytics where pageviews were the core unit, GA4 treats every interaction as an event. This gives you enormous flexibility — but also means that poor event setup leads to poor data. Most GA4 implementations I audit are collecting the default automatically-tracked events but missing the custom events that actually drive business decisions.

This guide covers the complete event tracking setup for e-commerce sites, from data layer configuration to debugging to building dashboards that surface actionable insights.`,

  'wordpress-speed-optimization-2026': `A slow WordPress site is not just annoying — it is a measurable business problem. Google has confirmed that Core Web Vitals are a ranking factor, and their data shows that as page load time goes from 1 second to 3 seconds, the probability of bounce increases by 32%. For e-commerce sites, every 100ms of latency costs approximately 1% in revenue.

I have optimized over 60 WordPress sites in the past two years. The process I describe below consistently achieves 95-99 PageSpeed scores on both mobile and desktop. It is not about installing one magic plugin — it is a systematic approach to eliminating every source of bloat.`,

  'martech-stack-audit-guide': `The average company uses 91 marketing technology tools. Not a typo — 91. According to Gartner's 2025 Marketing Technology Survey, organizations utilize less than 42% of their martech stack's capabilities. That means more than half the features you are paying for go unused, while the tools you do use often duplicate each other's functionality.

I have audited martech stacks for companies ranging from 5-person startups to enterprises with 200+ employees. The pattern is remarkably consistent: too many tools, poor integration between them, and no clear understanding of which tools actually drive results. Here is the framework I use to fix it.`,

  'seo-content-clusters-strategy': `In early 2025, a B2B SaaS client came to me with a blog that had been publishing articles for two years with almost nothing to show for it. They had 87 blog posts, 800 monthly organic visitors, and zero posts ranking on page one for any meaningful keyword. The content was decent — but it was completely unstructured. Each article existed in isolation, targeting random keywords with no strategic connection between them.

Twelve months later, that same blog was generating 42,000 monthly organic visitors, ranking for 2,400+ keywords, and driving 35% of the company's qualified leads. The strategy? Topic clusters. No link building campaigns, no technical SEO tricks — just a methodical restructuring of content around carefully chosen topic clusters.`,

  'google-ads-roas-optimization': `In Q3 2025, a fintech client approached me with a Google Ads account that was "working but not great." They were spending $42,000/month on search and Performance Max campaigns, generating about $88,000 in attributed revenue — a 2.1x ROAS. Not terrible, but not enough to justify scaling. Their board wanted 4x ROAS before approving a budget increase.

Over the following 16 weeks, we restructured the account, implemented proper conversion tracking, rebuilt the audience strategy, and ran systematic creative tests. The result: 5.2x ROAS on $65,000/month spend — $338,000 in monthly revenue from Google Ads alone. Here is exactly how we did it.`,

  'email-automation-lead-nurturing': `Most businesses collect leads and then do one of two things: immediately send a sales pitch, or do nothing at all. Both approaches leave money on the table. Research from DemandGen shows that nurtured leads produce a 20% increase in sales opportunities compared to non-nurtured leads, and they make 47% larger purchases.

Email automation sequences solve this by delivering the right message at the right time based on where each lead is in their journey. I have built and optimized these seven sequences for dozens of clients across SaaS, e-commerce, professional services, and education. They work.`,

  'meta-conversions-api-setup': `If you are running Facebook or Instagram ads in 2026 and relying solely on the Meta Pixel for conversion tracking, you are flying blind. Between ad blockers, iOS App Tracking Transparency, and browser privacy features, the pixel misses 20-35% of conversion events. This means Meta's ad algorithm is optimizing on incomplete data, your reported ROAS is understated, and your audience signals are degraded.

The Meta Conversions API (CAPI) solves this by sending conversion data directly from your server to Meta's servers, bypassing the browser entirely. When used alongside the pixel (the recommended approach), you get near-complete conversion coverage and significantly better ad performance.`,
}

// Default TOC seeds for hardcoded blog posts — ensures admin shows sections for editing
const defaultTocSeeds: Record<string, { id: string; label: string; content: string }[]> = {
  'server-side-tracking-complete-guide': [
    { id: 'what-is-server-side-tracking', label: 'What Is Server-Side Tracking?', content: `Traditional web tracking works by loading JavaScript tags directly in the visitor's browser. Every time someone lands on your page, scripts from Google Analytics, Meta Pixel, LinkedIn Insight Tag, and others fire from the client side. The browser sends data directly to each vendor's servers.

**Server-side tracking** flips this model. Instead of the browser communicating with dozens of third-party endpoints, it sends a single request to your server. That server then processes the data and forwards it to Google Analytics 4, Meta Conversions API, Google Ads, and any other platform you use. The visitor's browser never interacts with third-party domains at all.

- **Client-side:** Browser \u2192 Google/Meta/LinkedIn (blocked by ad blockers)
- **Server-side:** Browser \u2192 Your Server \u2192 Google/Meta/LinkedIn (not blocked)

This is not just a workaround for ad blockers. It is a fundamental shift in how data ownership works. When your server is the intermediary, you control what data gets sent, you can enrich it before forwarding, and you maintain a first-party relationship with every data point.` },
    { id: 'why-browser-tracking-fails', label: 'Why Browser Tracking Fails', content: `The statistics are sobering. According to multiple industry reports, ad blocker usage exceeds 42% on desktop browsers globally. Apple's Intelligent Tracking Prevention limits cookie lifetimes to 7 days (or 24 hours for classified cookies). Firefox and Brave block third-party trackers entirely by default.

### The Key Failure Points

1. **Ad blockers:** uBlock Origin, AdBlock Plus, and browser-native blockers intercept requests to known tracking domains like \`google-analytics.com\` and \`connect.facebook.net\`
2. **ITP / Safari:** First-party cookies set via JavaScript are capped at 7 days. Returning visitors after a week look like new users, inflating your user counts and breaking attribution
3. **iOS App Tracking Transparency:** Over 80% of iOS users opt out of cross-app tracking, making Meta Pixel data incomplete
4. **Browser privacy updates:** Chrome's Privacy Sandbox and third-party cookie phase-out mean even Google's own browser no longer supports the old model

> "You cannot optimize what you cannot measure. If 30% of your conversions are invisible, your bidding algorithms are working with incomplete data — and your ROAS calculations are simply wrong."` },
    { id: 'how-gtm-server-containers-work', label: 'How GTM Server Containers Work', content: `Google Tag Manager's server-side container is the most popular solution for implementing server-side tracking. It runs on a cloud server (Google Cloud Platform by default, but you can use AWS or any cloud provider) and acts as a proxy between your website and marketing platforms.

The architecture has three key components:

- **Client:** Receives incoming HTTP requests from the browser. The GA4 client, for example, intercepts requests that look like GA4 measurement protocol hits
- **Tags:** Forward data to destinations — GA4, Google Ads, Meta CAPI, etc. These run on the server, not the browser
- **Transformations:** Enrich or modify data before sending. Add user IDs, hash PII, filter bot traffic, or append server-side variables

\`\`\`GTM Server Container - Cloud Run Config
# Deploy GTM Server Container on Google Cloud Run
gcloud run deploy gtm-server \\
  --image gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars CONTAINER_CONFIG="YOUR_CONFIG_STRING" \\
  --min-instances 1 \\
  --max-instances 10 \\
  --memory 256Mi
\`\`\`` },
    { id: 'setup-step-by-step', label: 'Setup Step by Step', content: `Here is the process I follow when setting up server-side tracking for clients. The entire setup typically takes 2-4 hours for an experienced implementer.

1. **Create a server container in GTM:** Go to tagmanager.google.com, create a new container, and select "Server" as the container type
2. **Provision your server:** Deploy the container image to Google Cloud Run or App Engine. Cloud Run is preferred for its auto-scaling and cost efficiency
3. **Map your custom domain:** Point a subdomain like \`track.yourdomain.com\` to your Cloud Run service. This is critical — it makes all tracking requests first-party
4. **Update your web GTM container:** Change the GA4 transport URL to point to your server container instead of Google's default endpoint
5. **Configure server-side tags:** Add GA4, Google Ads Conversion Tracking, and Meta CAPI tags in the server container
6. **Test and validate:** Use GTM's server-side preview mode to verify data is flowing correctly from browser \u2192 server \u2192 platforms
7. **Set up monitoring:** Configure Cloud Monitoring alerts for error rates, latency, and instance scaling

### Critical Configuration: First-Party Domain

The single most important step is mapping a first-party subdomain. When your tracking endpoint is \`track.yourdomain.com\` instead of \`www.google-analytics.com\`, the browser treats it as a same-site request. Ad blockers cannot distinguish it from your own API calls, ITP does not limit cookie lifetimes, and the data flows reliably.` },
    { id: 'benefits-and-when-to-use', label: 'Benefits & When to Use It', content: `After implementing server-side tracking for over 40 clients, here are the consistent benefits I see:

- **30-40% more conversion data:** Recovered events that ad blockers and ITP previously blocked
- **Improved ad platform optimization:** More complete conversion data means smarter bidding from Google and Meta's algorithms
- **Page speed improvement:** Fewer client-side scripts means faster Time to Interactive. Most clients see 200-500ms improvement
- **Data control and privacy:** You decide what PII gets forwarded. Hash emails before sending to Meta. Strip IP addresses. Comply with GDPR by design
- **Extended cookie lifetimes:** Server-set cookies bypass ITP restrictions, giving you accurate returning-visitor data

### When Is It Worth the Investment?

Server-side tracking involves ongoing hosting costs (typically $50-150/month) and requires technical expertise to maintain. It makes sense when you are spending more than $5,000/month on digital advertising, when accurate attribution is critical to business decisions, or when you operate in a privacy-regulated industry like finance or healthcare. If your [marketing analytics](/services) feel unreliable, server-side tracking is likely the highest-impact fix available.` },
  ],
  'n8n-automation-marketing-workflows': [
    { id: 'why-n8n-for-marketing', label: 'Why n8n for Marketing', content: `The short answer: cost and control. Zapier charges $49/month for 750 tasks. A single busy workflow can burn through that in a day. n8n, self-hosted on a $10/month server, gives you unlimited executions. Beyond cost, n8n offers code nodes where you can write JavaScript for complex transformations, error handling with retry logic, and the ability to keep sensitive data on your own infrastructure.

> "We switched from Zapier to n8n and went from paying $299/month for 5 workflows to $12/month for 47 workflows on a single Digital Ocean droplet." — actual client feedback after migration.` },
    { id: 'lead-management-workflows', label: 'Lead Management Workflows', content: `### 1. Intelligent Lead Routing

When a new lead submits a form on your website, this workflow evaluates their company size, industry, and inquiry type, then routes them to the appropriate sales rep in your CRM. It assigns lead scores based on form data and website behavior, and sends the assigned rep a Slack notification with full context.

\`\`\`n8n Lead Scoring Node (JavaScript)
// Score leads based on form data
const lead = $input.first().json;

let score = 0;
if (lead.company_size === 'enterprise') score += 40;
else if (lead.company_size === 'mid-market') score += 25;
else score += 10;

if (lead.budget && parseInt(lead.budget) > 10000) score += 30;
if (lead.timeline === 'immediate') score += 20;
if (lead.source === 'referral') score += 15;

// Route based on score
const assignee = score >= 60 ? 'senior-rep' : 'standard-rep';

return { ...lead, score, assignee };
\`\`\`

### 2. Email Sequence Trigger

When a lead enters your CRM with a specific tag or status, n8n triggers a personalized email sequence. Unlike rigid email platform automations, you can pull in data from multiple sources — their form answers, pages they visited, content they downloaded — and use it to customize every email.

### 3. CRM Sync Across Platforms

Most businesses use multiple tools that need to share contact data: a CRM, an email platform, an invoicing tool, and a support desk. This workflow keeps contacts synchronized across all of them. When a record updates in HubSpot, it mirrors the change in Mailchimp, Stripe, and Intercom within seconds.` },
    { id: 'communication-workflows', label: 'Communication & Alerts', content: `### 4. Slack Alerts for Key Events

Get instant Slack notifications when high-value events happen: a lead with a score above 70 fills out a form, a customer churns, ad spend exceeds the daily budget, or a website goes down. Each alert includes actionable context so the team can respond immediately.

### 5. Social Media Scheduling

Pull content from a Google Sheet or Notion database and automatically post to LinkedIn, Twitter, and Facebook at scheduled times. The workflow formats content for each platform — character limits, hashtag strategies, image dimensions — so you write once and publish everywhere.

### 6. Review Request Sequences

After a project is delivered or a product is purchased, this workflow waits a configurable number of days, then sends a personalized review request. It checks the customer's satisfaction score first — only happy customers get the ask. Negative-scoring customers trigger an internal alert for the support team instead.` },
    { id: 'reporting-and-data', label: 'Reporting & Data Workflows', content: `### 7. Automated Weekly Reports

Every Monday at 8 AM, this workflow pulls data from Google Analytics 4, Google Ads, Meta Ads, and your CRM. It compiles the numbers into a formatted report and sends it to Slack or email. No more spending Friday afternoons building spreadsheets.

- Pull GA4 metrics via the Data API
- Pull ad spend and ROAS from Google Ads and Meta Ads APIs
- Pull pipeline data from CRM
- Format into a clean Slack message with week-over-week comparisons
- Send to the #marketing-reports channel

### 8. Data Backup to Google Sheets

Critical marketing data should not live in only one platform. This workflow exports lead data, campaign performance, and conversion events to Google Sheets daily. It creates a historical archive that survives platform changes and gives non-technical team members direct access to data without logging into multiple tools.` },
    { id: 'client-operations', label: 'Client Operations', content: `### 9. Invoice Generation

For agencies and freelancers, this workflow monitors project milestones in your project management tool. When a milestone is completed, it auto-generates a draft invoice in your billing platform (Stripe, QuickBooks, or Xero), populates the line items, and sends the client a polished PDF.

### 10. Client Onboarding Automation

When a new client signs a contract, this workflow triggers a full onboarding sequence: creates a project in your PM tool, sets up a shared Google Drive folder, sends a welcome email with next steps, schedules the kickoff call via Calendly, and provisions access to shared dashboards.

If you want to implement [marketing automation](/services) workflows like these for your business, the key is starting with the three or four that save the most manual time and building from there. Each workflow typically takes 1-3 hours to build and saves 2-5 hours per week. The ROI compounds fast.` },
  ],
  'ga4-event-tracking-setup': [
    { id: 'auto-vs-custom-events', label: 'Automatically Collected vs Custom Events', content: `GA4 automatically collects certain events without any configuration: \`page_view\`, \`session_start\`, \`first_visit\`, \`user_engagement\`, and \`scroll\` (when enhanced measurement is enabled). These are useful but generic.

**Enhanced measurement events** add scroll tracking, outbound clicks, site search, video engagement, and file downloads. Enable these in your GA4 data stream settings — they require no code changes.

**Recommended events** are Google-defined events with specific parameter structures. For e-commerce, these include \`view_item\`, \`add_to_cart\`, \`begin_checkout\`, and \`purchase\`. Using Google's naming convention unlocks built-in e-commerce reports.

**Custom events** are anything unique to your business: \`pricing_page_view\`, \`demo_request\`, \`feature_comparison\`, \`calculator_used\`. These are where the real insights live.

> "The difference between a mediocre GA4 setup and a great one is not the tool — it's the 15-20 custom events that map precisely to your customer journey."` },
    { id: 'data-layer-setup', label: 'Data Layer Setup', content: `The data layer is a JavaScript object that sits on your page and holds structured information for GTM to read. It is the bridge between your website's data and your tracking tags. Without a proper data layer, you end up scraping DOM elements — brittle, unreliable, and a maintenance nightmare.

\`\`\`Data Layer Push - Product View
// Push product data when a user views a product page
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'view_item',
  ecommerce: {
    currency: 'USD',
    value: 49.99,
    items: [{
      item_id: 'SKU-12345',
      item_name: 'Premium Analytics Dashboard Template',
      item_category: 'Templates',
      item_category2: 'Analytics',
      item_brand: 'MarTech Tools',
      price: 49.99,
      quantity: 1
    }]
  }
});
\`\`\`

Every e-commerce event follows this same pattern: a \`dataLayer.push()\` with the event name and an \`ecommerce\` object containing currency, value, and an items array. Consistency is key. If your \`add_to_cart\` event uses \`product_id\` but your \`purchase\` event uses \`item_id\`, your funnel reports break.` },
    { id: 'ecommerce-tracking', label: 'E-Commerce Event Tracking', content: `A complete e-commerce tracking setup covers the full purchase funnel. Here are the events you need, in order:

1. \`view_item_list\` — Category/collection pages. Include the list name and position of each product
2. \`select_item\` — When a user clicks a product from a list
3. \`view_item\` — Product detail page views. Include all product parameters
4. \`add_to_cart\` — Fired when an item is added to cart. Include quantity and value
5. \`view_cart\` — When the cart page or drawer is opened
6. \`begin_checkout\` — First step of checkout process
7. \`add_shipping_info\` — When shipping method is selected
8. \`add_payment_info\` — When payment method is entered
9. \`purchase\` — Transaction complete. Include transaction ID, revenue, tax, shipping

For each event, create a corresponding trigger in GTM that listens for the \`dataLayer.push()\` and a GA4 event tag that forwards the data. Use a single GA4 event tag with a variable-driven event name to keep your container clean.` },
    { id: 'debugging-with-gtm', label: 'Debugging with GTM Preview Mode', content: `GTM's preview mode (Tag Assistant) is your best friend during implementation. Click "Preview" in your GTM workspace, enter your site URL, and a debug panel opens alongside your website.

- **Check data layer contents:** Click any event in the timeline and inspect the Data Layer tab to verify parameters
- **Verify tag firing:** The Tags tab shows which tags fired (or failed) on each event
- **Inspect variables:** See the resolved values of all your GTM variables at each event
- **GA4 DebugView:** Enable debug mode in GA4 to see events arrive in real-time at Admin \u2192 DebugView

A common debugging pattern: push an \`add_to_cart\` event, check that the data layer contains the correct product data, verify the GTM trigger fires, confirm the GA4 tag sends the event, and then check GA4 DebugView to see it arrive with all parameters intact.` },
    { id: 'looker-studio-dashboards', label: 'Looker Studio Dashboards', content: `Raw GA4 data becomes actionable only when it is visualized properly. Looker Studio (formerly Google Data Studio) connects directly to GA4 and lets you build dashboards that update automatically.

For e-commerce, I recommend building three core dashboards:

- **Funnel Performance:** Visualization showing drop-off rates between each e-commerce step. Identify where users abandon the journey
- **Product Performance:** Table showing each product's views, add-to-cart rate, and purchase conversion rate. Sort by revenue to find winners
- **Acquisition ROI:** Blend GA4 data with Google Ads cost data to show true ROAS by campaign, ad group, and keyword

The key to effective dashboards is limiting them to the 5-7 metrics that actually drive decisions. If your team needs help with [analytics setup and dashboard design](/services), start with the questions you want answered and work backward to the data you need.` },
  ],
  'wordpress-speed-optimization-2026': [
    { id: 'why-speed-matters', label: 'Why Speed Matters', content: `Google's March 2025 core update further increased the weight of Interaction to Next Paint (INP) as a ranking signal. INP replaced First Input Delay (FID) as the primary responsiveness metric, and it is significantly harder to pass. While FID measured only the first interaction, INP measures every interaction throughout the page session and reports the worst one.

- **SEO impact:** Pages failing Core Web Vitals are deprioritized in search results. This is not speculation — it is documented in Google Search Central
- **Conversion impact:** Deloitte research shows a 0.1s improvement in mobile site speed increases conversion rates by 8.4% for retail and 10.1% for travel
- **Ad Quality Score:** Landing page experience affects Google Ads Quality Score, which directly impacts your cost per click

> "After optimizing a client's WordPress site from a 42 to a 96 PageSpeed score, their organic traffic increased 23% within 6 weeks — without any content changes or new backlinks."` },
    { id: 'image-optimization', label: 'Image Optimization', content: `Images are responsible for 50-70% of page weight on most WordPress sites. This is the single highest-impact optimization area.

### Serve Next-Gen Formats

Convert all images to WebP or AVIF format. AVIF offers 30-50% smaller file sizes than WebP with comparable quality. Use a plugin like ShortPixel or Imagify that automatically converts uploads and serves the optimal format based on browser support.

### Responsive Images

Never serve a 2000px image to a mobile device. WordPress generates multiple sizes by default, but you need to ensure your theme uses the \`srcset\` attribute correctly. Add custom image sizes for your layout breakpoints:

\`\`\`functions.php
// Add custom image sizes for responsive loading
add_image_size('hero-desktop', 1440, 600, true);
add_image_size('hero-tablet', 768, 400, true);
add_image_size('card-thumb', 400, 300, true);

// Enable WebP support
add_filter('upload_mimes', function($mimes) {
    $mimes['webp'] = 'image/webp';
    $mimes['avif'] = 'image/avif';
    return $mimes;
});
\`\`\`

### Lazy Loading

WordPress includes native lazy loading via the \`loading="lazy"\` attribute since version 5.5. However, you should **disable** lazy loading for above-the-fold images (your hero image, logo, first visible content image) to avoid hurting Largest Contentful Paint. Use the \`wp_img_tag_add_loading_optimization_attrs\` filter to control this precisely.` },
    { id: 'caching-and-cdn', label: 'Caching & CDN Setup', content: `### Page Caching with WP Rocket

WP Rocket remains the best caching plugin for WordPress. Its key advantages over free alternatives like W3 Total Cache are simplicity, reliability, and features that actually work out of the box. Configure it with these settings:

- Enable page caching and cache preloading
- Enable mobile-specific caching (serves separate cached pages for mobile)
- Set cache lifespan to 10 hours for content sites, 1 hour for sites with dynamic pricing
- Enable critical CSS generation — this alone typically improves LCP by 1-2 seconds
- Delay JavaScript execution to reduce INP. Exclude essential above-the-fold scripts

### CDN Configuration

Cloudflare's free tier is sufficient for most WordPress sites. Set up APO (Automatic Platform Optimization) at $5/month for WordPress-specific caching at the edge. This caches full HTML pages at Cloudflare's 300+ edge locations and serves them in under 50ms globally.` },
    { id: 'code-and-database', label: 'Code & Database Cleanup', content: `Plugin bloat is the silent killer of WordPress performance. Most sites have 3-5 plugins that load CSS and JS on every page even though they are only needed on specific pages.

- **Audit your plugins:** Deactivate each plugin one by one and test page speed. You will often find one plugin adding 500ms-1s of load time
- **Conditional loading:** Use Asset CleanUp Pro or Perfmatters to disable plugin assets on pages where they are not needed. Contact Form 7 scripts do not need to load on your blog posts
- **Database cleanup:** Delete post revisions, trashed items, spam comments, and transients. WP-Optimize automates this on a schedule
- **Minimize render-blocking CSS:** Inline critical CSS and defer non-critical stylesheets. WP Rocket handles this automatically` },
    { id: 'core-web-vitals', label: 'Core Web Vitals Optimization', content: `The three Core Web Vitals are LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift). Here is how to pass all three:

1. **LCP under 2.5s:** Preload your hero image with \`<link rel="preload">\`. Use font-display: swap for web fonts. Ensure your server TTFB is under 200ms
2. **INP under 200ms:** Defer non-critical JavaScript. Break up long tasks (anything over 50ms). Avoid layout thrashing from DOM reads/writes in event handlers
3. **CLS under 0.1:** Set explicit width and height on all images and iframes. Avoid inserting content above existing content. Reserve space for ads and embeds

If your WordPress site is underperforming and you need help with [speed optimization](/services), the combination of proper image handling, caching, and code cleanup will transform your user experience and search rankings.` },
  ],
  'martech-stack-audit-guide': [
    { id: 'audit-framework', label: 'The Audit Framework', content: `A martech audit is not about cutting costs for the sake of cutting costs. It is about building a stack where every tool earns its place, data flows cleanly between systems, and your team can actually use everything effectively.

1. **Inventory everything:** List every tool, its cost, who uses it, what it does, and when it was last actively used. You will almost certainly discover tools people forgot they were paying for
2. **Map data flow:** Document how data moves between tools. Where does lead data originate? How does it get to the CRM? Do conversion events from your website reach your ad platforms? Drawing this map exposes broken connections and redundant paths
3. **Identify overlaps:** Highlight tools that serve the same function. Do you have both Mailchimp and HubSpot sending emails? Are you running Google Analytics and Mixpanel and Amplitude? Consolidate
4. **Calculate per-tool ROI:** For each tool, estimate the revenue or time savings it generates versus its total cost (subscription + implementation time + maintenance). Kill anything with negative ROI` },
    { id: 'map-data-flow', label: 'Mapping Data Flow', content: `This is the most revealing step and the one most companies skip. Create a visual diagram showing every data connection between your tools. Here is a simplified example:

\`\`\`Example Data Flow Map
Website (GTM)
  \u251c\u2500\u2500 GA4 (analytics)
  \u251c\u2500\u2500 Meta CAPI (ad tracking)
  \u251c\u2500\u2500 Google Ads (conversion tracking)
  \u2514\u2500\u2500 CRM (HubSpot)
        \u251c\u2500\u2500 Email Platform (HubSpot built-in)
        \u251c\u2500\u2500 Slack (notifications via n8n)
        \u251c\u2500\u2500 Invoicing (Stripe)
        \u2514\u2500\u2500 Reporting (Looker Studio via BigQuery)

Data Issues Found:
  \u2717 Meta Pixel duplicating CAPI events (no deduplication)
  \u2717 CRM not receiving offline conversions from sales team
  \u2717 Email segments based on stale data (no real-time sync)
  \u2713 GA4 \u2192 BigQuery export working correctly
\`\`\`

When you draw this map, you discover gaps. Maybe your CRM has customer data that never makes it to your email segmentation. Maybe your ad platforms are getting duplicate conversions because both client-side and server-side tracking fire without deduplication. These are the issues that silently degrade your marketing performance.

> "A lean martech stack with great integrations will always outperform a bloated stack with siloed data. The tools are not the strategy — the connections between them are."` },
    { id: 'common-mistakes', label: 'Common Mistakes', content: `- **Paying for enterprise tiers you do not need:** Most SMBs do not need HubSpot Enterprise at $3,600/month when Professional at $800/month covers 95% of their needs
- **Duplicate functionality:** Running separate tools for email, landing pages, and forms when your CRM does all three
- **No single source of truth:** Customer data lives in 5+ places with no sync, leading to inconsistent segments and personalization
- **Shiny object syndrome:** Adding tools because they are trending rather than because they solve a specific problem
- **No deprecation process:** Tools get added but never removed. The average company has 3-5 tools that nobody actively uses but still pay for` },
    { id: 'recommended-stack', label: 'Recommended MarTech Stack for SMBs', content: `For small to mid-size businesses spending $5K-$50K/month on marketing, here is the stack I recommend. Total cost: approximately $300-800/month depending on scale.

- **Analytics:** GA4 (free) + Looker Studio (free) + BigQuery (near-free for most volumes)
- **Tag Management:** GTM web + GTM server container ($50-150/month hosting)
- **CRM:** HubSpot Starter or Professional — covers CRM, email, forms, and landing pages
- **Automation:** n8n self-hosted ($10-20/month) for everything Zapier charges $300+/month for
- **Advertising:** Google Ads + Meta Ads with server-side conversion tracking
- **SEO:** Ahrefs or Semrush (one, not both) + Screaming Frog (free version)
- **Website:** WordPress with WP Rocket + Cloudflare, or Next.js for performance-critical sites` },
    { id: 'calculating-roi', label: 'Calculating Stack ROI', content: `For each tool, use this simple formula:

\`\`\`MarTech ROI Formula
Tool ROI = (Revenue Attributed + Time Saved \u00d7 Hourly Rate)
           \u00f7 (Subscription + Setup + Maintenance Hours \u00d7 Rate)

Example: HubSpot Professional
  Revenue attributed: $45,000/year (from email campaigns)
  Time saved: 10 hrs/week \u00d7 $50/hr = $26,000/year
  Cost: $9,600/year (subscription) + $2,400 (maintenance)
  ROI: ($45,000 + $26,000) / $12,000 = 5.9x \u2713 KEEP

Example: Unused A/B Testing Tool
  Revenue attributed: $0
  Time saved: 0 hours (nobody uses it)
  Cost: $2,400/year
  ROI: 0x \u2717 CANCEL
\`\`\`

If you need help running a thorough [martech stack audit](/services), the process typically takes 1-2 weeks and reveals $500-5,000/month in potential savings while improving data quality.` },
  ],
  'seo-content-clusters-strategy': [
    { id: 'what-are-topic-clusters', label: 'What Are Topic Clusters?', content: `A topic cluster is a group of interlinked content pieces organized around a central theme. At the center is a **pillar page** — a comprehensive, long-form piece (typically 3,000-5,000 words) that broadly covers the topic. Surrounding it are **cluster articles** — shorter, focused pieces (1,000-2,000 words each) that dive deep into specific subtopics.

The pillar page links to every cluster article. Every cluster article links back to the pillar page and to relevant sibling articles. This creates a dense internal linking structure that signals to Google: "This website has comprehensive, authoritative coverage of this topic."

- **Pillar page:** "The Complete Guide to Email Marketing" (broad, 4,000 words)
- **Cluster article:** "How to Write Subject Lines That Get Opened" (specific, 1,500 words)
- **Cluster article:** "Email Segmentation Strategies for E-Commerce" (specific, 1,200 words)
- **Cluster article:** "A/B Testing Your Email Campaigns: A Beginner's Guide" (specific, 1,300 words)
- **Cluster article:** "Email Deliverability: How to Stay Out of Spam" (specific, 1,800 words)

> "Google does not rank pages — it ranks entities. A topic cluster transforms your website from a collection of random pages into a recognized authority on a specific subject."` },
    { id: 'building-pillar-pages', label: 'Building Pillar Pages That Rank', content: `A pillar page is not just a long article. It is structurally designed to rank for high-volume, competitive head terms while serving as the hub for all related content. Here is how I build them:

1. **Target a high-volume head term:** Choose a keyword with 2,000+ monthly searches that your cluster articles will support. Example: "email marketing guide"
2. **Cover the topic broadly:** Include a section for every subtopic your cluster articles will detail. Each section is 200-400 words — enough to be useful but short enough to create demand for the deeper cluster article
3. **Use clear heading hierarchy:** Every H2 on the pillar page should map to a cluster article. This makes the linking structure natural and the content scannable
4. **Add a table of contents:** Linked TOC at the top improves UX and increases the chance of Google showing sitelinks in search results
5. **Include original data or frameworks:** Unique insights, proprietary data, or custom frameworks make your pillar page citable and link-worthy` },
    { id: 'internal-linking-strategy', label: 'Internal Linking Strategy', content: `The internal linking structure is what transforms individual articles into a topic cluster. Without proper linking, you just have a collection of related articles — not a cluster.

\`\`\`Cluster Linking Structure
PILLAR: /blog/email-marketing-guide
  \u2195 links to all cluster articles

CLUSTER: /blog/email-subject-lines
  \u2192 links to PILLAR
  \u2192 links to /blog/email-ab-testing (sibling)

CLUSTER: /blog/email-segmentation
  \u2192 links to PILLAR
  \u2192 links to /blog/email-deliverability (sibling)
  \u2192 links to /blog/email-subject-lines (sibling)

CLUSTER: /blog/email-ab-testing
  \u2192 links to PILLAR
  \u2192 links to /blog/email-subject-lines (sibling)

CLUSTER: /blog/email-deliverability
  \u2192 links to PILLAR
  \u2192 links to /blog/email-segmentation (sibling)

Rules:
  \u2713 Every cluster links to pillar (mandatory)
  \u2713 Pillar links to every cluster (mandatory)
  \u2713 Clusters link to 2-3 siblings (recommended)
  \u2713 Use descriptive anchor text (not "click here")
  \u2717 Don't over-link (max 3-5 internal links per 1000 words)
\`\`\`` },
    { id: 'keyword-mapping', label: 'Keyword Mapping Process', content: `Before writing a single word, I map out the entire cluster's keyword strategy. This prevents content cannibalization (multiple pages competing for the same keyword) and ensures complete topic coverage.

1. **Start with the head term:** Use Ahrefs or Semrush to find a broad keyword with high volume and manageable difficulty
2. **Extract subtopics:** Look at "Questions" in keyword research, "People Also Ask" in Google results, and the top-ranking pillar pages' subheadings
3. **Assign one primary keyword per article:** No two articles in the cluster should target the same primary keyword. Each article owns its keyword
4. **Identify secondary keywords:** Each article targets 3-5 secondary keywords that are semantically related to its primary keyword
5. **Validate search intent:** Check the SERPs for each keyword. If the top results are product pages, a blog post will not rank there. Choose informational keywords for blog content` },
    { id: 'case-study-results', label: 'Case Study: 800 to 42,000 Monthly Visitors', content: `For the B2B SaaS client, we built 5 topic clusters over 12 months. Here are the specifics:

- **Cluster 1 — "Project Management":** 1 pillar + 8 cluster articles. Went from 0 to 14,000 monthly organic visits
- **Cluster 2 — "Remote Team Collaboration":** 1 pillar + 6 cluster articles. Drove 9,500 monthly visits
- **Cluster 3 — "Agile Methodology":** 1 pillar + 7 cluster articles. Generated 8,200 monthly visits
- **Clusters 4 & 5:** Smaller clusters targeting long-tail terms, contributing 10,300 combined monthly visits

Total investment: 47 articles over 12 months (roughly 1 per week). Total cost: approximately $28,000 in content production. Revenue generated from organic leads in the first year: $340,000. That is a 12x return on investment.

If you are looking to implement a [content cluster SEO strategy](/services), the critical success factor is patience and consistency. Clusters take 3-6 months to start ranking. But once they do, the compounding effect of topical authority makes each new article rank faster and higher than the last.` },
  ],
  'google-ads-roas-optimization': [
    { id: 'starting-point', label: 'The Starting Point: 2.1x ROAS', content: `Before changing anything, I audited the existing account. The issues were common but severe:

- **No negative keywords:** The account was bleeding money on irrelevant search terms. "Free fintech courses," "fintech jobs," and competitor names were consuming 23% of the budget
- **Single campaign structure:** All keywords lived in one campaign with one ad group. High-intent terms competed with awareness terms for the same budget
- **Broken conversion tracking:** The primary conversion action counted page views instead of actual sign-ups. The algorithm was optimizing for the wrong goal
- **No audience signals:** Performance Max campaigns had zero audience signals, so Google was targeting broadly with no guidance

> "The most common reason for poor Google Ads performance is not bid strategy or budget — it is that the algorithm is optimizing for the wrong conversion action. Fix tracking first, always."` },
    { id: 'campaign-structure', label: 'Campaign Structure: Alpha/Beta/Gamma', content: `I restructured the account using the Alpha/Beta/Gamma framework, which segments campaigns by keyword intent and match type:

### Alpha Campaigns (Highest Intent)

Exact match keywords with proven conversion history. These are your most profitable terms — the ones where search intent perfectly matches your offer. Bid aggressively, allocate 50-60% of budget here.

### Beta Campaigns (Testing Ground)

Phrase match campaigns that discover new converting search terms. When a Beta keyword proves itself (3+ conversions at target CPA), it graduates to an Alpha campaign as an exact match keyword.

### Gamma Campaigns (Discovery)

Broad match + Smart Bidding campaigns that cast a wide net. Budget is limited (10-15%) but these campaigns consistently discover search terms you would never think of manually.

\`\`\`Campaign Structure Example
Account: Fintech Client
\u251c\u2500\u2500 [Alpha] Brand Terms (Exact Match)
\u2502   Budget: $8,000/mo | ROAS: 12.4x
\u2502   Keywords: [fintech app name], [brand + feature]
\u2502
\u251c\u2500\u2500 [Alpha] High-Intent (Exact Match)
\u2502   Budget: $25,000/mo | ROAS: 6.1x
\u2502   Keywords: [best fintech app for invoicing],
\u2502             [small business payment processing]
\u2502
\u251c\u2500\u2500 [Beta] Mid-Intent (Phrase Match)
\u2502   Budget: $18,000/mo | ROAS: 4.2x
\u2502   Keywords: "fintech invoicing", "payment app business"
\u2502
\u251c\u2500\u2500 [Gamma] Discovery (Broad Match)
\u2502   Budget: $7,000/mo | ROAS: 2.8x
\u2502   Keywords: fintech solutions, business payments
\u2502
\u2514\u2500\u2500 [PMax] Performance Max
    Budget: $7,000/mo | ROAS: 3.5x
    Audience signals: customer lists, in-market segments
\`\`\`` },
    { id: 'bidding-and-audiences', label: 'Bidding & Audience Segmentation', content: `We switched from Maximize Clicks (which the previous manager was using) to Target ROAS bidding. But Target ROAS only works when your conversion data is accurate and sufficient — at least 30 conversions in the past 30 days per campaign.

For audience segmentation, we built four key audiences:

1. **Customer Match:** Uploaded the existing customer list (hashed emails) for exclusion and lookalike targeting
2. **Website visitors:** Segmented by behavior — pricing page visitors (hot), blog readers (warm), homepage bouncers (cold)
3. **In-market segments:** Google's in-market audiences for financial services, business software, and accounting
4. **Custom intent:** Built from competitor URLs and high-intent search terms

The critical move was using audience **bid adjustments** rather than audience **targeting**. We kept campaigns open to all searchers but bid 30% higher on users who were also in our high-intent audiences. This let the algorithm find new customers while prioritizing known high-value segments.` },
    { id: 'creative-testing', label: 'Ad Creative Testing Framework', content: `We ran structured A/B tests on ad creative, changing one element at a time:

- **Headlines:** Tested benefit-driven vs. feature-driven vs. social proof headlines. Winner: social proof ("Trusted by 12,000+ Businesses") improved CTR by 34%
- **Descriptions:** Tested urgency vs. value proposition vs. objection handling. Winner: objection handling ("No setup fees. No contracts. Cancel anytime.") reduced CPA by 18%
- **Landing pages:** Tested long-form vs. short-form vs. video-led pages. Winner: short-form with embedded demo video improved conversion rate from 3.2% to 5.7%` },
    { id: 'results-breakdown', label: 'Results: The Path to 5.2x ROAS', content: `The improvements compounded over 16 weeks:

1. **Weeks 1-4:** Fixed conversion tracking and added negative keywords. ROAS jumped from 2.1x to 3.1x simply by eliminating waste
2. **Weeks 5-8:** Restructured campaigns into Alpha/Beta/Gamma. ROAS reached 3.8x as budget shifted to highest-performing terms
3. **Weeks 9-12:** Implemented audience segmentation and bid adjustments. ROAS hit 4.5x
4. **Weeks 13-16:** Creative testing wins compounded. Final ROAS: 5.2x on $65,000/month spend

The key lesson: most Google Ads accounts do not need more budget — they need better structure and accurate data. If you are struggling with [Google Ads ROAS](/services), start with an account audit before changing anything else.` },
  ],
  'email-automation-lead-nurturing': [
    { id: 'why-sequences-matter', label: 'Why Automated Sequences Beat Manual Follow-Up', content: `A sales rep can follow up with maybe 10-20 leads per day with personalized emails. An automated sequence nurtures thousands simultaneously, never forgets a follow-up, and sends at statistically optimal times. The key is that automation does not mean generic — with proper segmentation and dynamic content, automated emails can be as personalized as manually written ones.

> "The goal of email nurturing is not to sell. It is to build enough trust and demonstrate enough value that when the lead is ready to buy, you are the obvious choice."` },
    { id: 'welcome-and-nurture', label: 'Welcome & Nurture Sequences', content: `### Welcome Sequence (3-5 Emails, Days 0-7)

Triggered immediately when someone subscribes, downloads a lead magnet, or creates a free account. The welcome sequence has the highest open rates of any email type — typically 50-60%. Use this window to set expectations and deliver immediate value.

- **Email 1 (Immediate):** Deliver the promised resource. Introduce yourself. Set expectations for future emails
- **Email 2 (Day 1):** Share your most popular piece of content. Establish expertise
- **Email 3 (Day 3):** Tell your origin story or share a case study. Build connection
- **Email 4 (Day 5):** Address the #1 objection or pain point. Provide a framework or tool
- **Email 5 (Day 7):** Soft CTA — invite to book a call, start a trial, or join a community

### Nurture Sequence (Ongoing, Weekly/Bi-Weekly)

After the welcome sequence ends, leads who have not converted enter the nurture sequence. This is a longer, ongoing series that maintains mindshare and builds authority. Content includes industry insights, how-to guides, case studies, and curated resources. Keep the sales pitch to a maximum of 1 in 5 emails.` },
    { id: 'conversion-sequences', label: 'Conversion Sequences', content: `### Abandoned Cart Sequence (3 Emails, Hours 1-72)

For e-commerce businesses, abandoned cart emails recover 5-15% of lost revenue. The timing is critical:

\`\`\`Abandoned Cart Sequence Timing
Email 1: 1 hour after abandonment
  Subject: "You left something behind"
  Content: Product image, price, direct link to cart
  No discount yet

Email 2: 24 hours after abandonment
  Subject: "Still thinking it over?"
  Content: Add social proof (reviews, ratings)
  Optional: Free shipping offer

Email 3: 72 hours after abandonment
  Subject: "Last chance — 10% off your cart"
  Content: Time-limited discount code
  Urgency: "Offer expires in 24 hours"

Expected recovery rate: 8-12% of abandoned carts
\`\`\`

### Re-Engagement Sequence (3 Emails Over 2 Weeks)

Targets subscribers who have not opened an email in 60-90 days. The sequence tries to re-activate them. If they still do not engage after the third email, they are automatically removed from your list. This protects your sender reputation and deliverability.

- **Email 1:** "We miss you" — highlight what they have been missing
- **Email 2:** Offer something exclusive — a free resource, a discount, or early access
- **Email 3:** "Should we remove you?" — the breakup email. This counterintuitively gets the highest engagement of the three

### Onboarding Sequence (5-7 Emails Over 14 Days)

For SaaS and service businesses, onboarding emails reduce churn by guiding new customers to their first "aha moment." Each email focuses on one specific action: set up your profile, complete your first project, invite a team member. Do not overwhelm — one action per email.` },
    { id: 'retention-sequences', label: 'Retention & Upsell Sequences', content: `### Upsell/Cross-Sell Sequence (2-3 Emails)

Triggered when a customer reaches a specific milestone: 30 days after purchase, hitting a usage limit, or completing an onboarding phase. The key is timing the upsell when the customer has experienced enough value to want more — never before.

### Review Request Sequence (2 Emails)

Sent 7-14 days after purchase or project completion. First email asks for a rating. If positive (4-5 stars), the second email asks them to post on Google, G2, or Trustpilot with a direct link. If negative, it routes to customer support. This protects your public reputation while still collecting honest feedback.` },
    { id: 'timing-and-optimization', label: 'Timing & Optimization Best Practices', content: `- **Send times:** Tuesday-Thursday, 10 AM or 2 PM in the recipient's timezone. But test this — some audiences respond better at 7 AM or 8 PM
- **Subject lines:** Keep under 50 characters. Personalization (using their name or company) increases open rates by 22%
- **From name:** Use a person's name, not a company name. "DigiTitan AI from [Company]" outperforms "[Company] Team"
- **Unsubscribe rate:** If any email in a sequence has an unsubscribe rate above 0.5%, rewrite it immediately
- **A/B test continuously:** Test subject lines on every send. The winner becomes the default, the loser gets replaced

Building effective [email automation sequences](/services) is one of the highest-ROI marketing investments you can make. Once built, they run indefinitely, nurturing every lead through your funnel while you focus on strategy and growth.` },
  ],
  'meta-conversions-api-setup': [
    { id: 'why-pixel-alone-fails', label: 'Why the Meta Pixel Alone Is No Longer Enough', content: `The Meta Pixel is a JavaScript snippet that runs in the visitor's browser. It was designed for a world where browsers freely allowed third-party scripts to track user behavior across the web. That world no longer exists.

1. **Ad blockers:** 42% of desktop users run ad blockers that specifically target \`connect.facebook.net\`. The pixel never loads, never fires, and the conversion is invisible
2. **iOS ATT:** When users opt out of tracking on iOS (over 80% do), the pixel's ability to attribute conversions back to ad clicks is severely limited
3. **Safari ITP:** Limits first-party cookies set by JavaScript to 7 days. A user who clicks your ad on Monday and converts on the following Tuesday may not be attributed
4. **Browser privacy modes:** Firefox Enhanced Tracking Protection and Brave's shields block Meta Pixel requests by default

The cumulative effect is devastating for advertisers. If Meta's algorithm only sees 65-70% of your conversions, it makes suboptimal bidding decisions. You end up paying more for worse results, and your reported metrics do not reflect reality.

> "After implementing the Conversions API for a client spending $25K/month on Meta Ads, reported conversions increased by 28% and CPA decreased by 19% — same campaigns, same creative, just better data."` },
    { id: 'how-capi-works', label: 'How the Conversions API Works', content: `The Conversions API is a server-to-server integration. Instead of the browser sending events to Meta, your server does. The flow looks like this:

- User visits your website and performs an action (view content, add to cart, purchase)
- Your website sends the event to your server (via GTM server container, backend code, or a platform integration)
- Your server sends the event data to Meta's Conversions API endpoint, including user parameters for matching
- Meta matches the server event to the user who clicked the ad, attributing the conversion

The critical advantage: because the data travels server-to-server, ad blockers cannot intercept it. Browser privacy features do not apply. The data arrives reliably every time.` },
    { id: 'setup-via-gtm-server', label: 'Setup via GTM Server Container', content: `The most flexible and maintainable way to implement CAPI is through a GTM server-side container. If you have already set up [server-side tracking](/blog/server-side-tracking-complete-guide), adding Meta CAPI is straightforward.

1. **Generate an access token:** In Meta Events Manager, go to Settings \u2192 Conversions API \u2192 Generate Access Token. Store this securely
2. **Install the Meta CAPI tag template:** In your GTM server container, add the Facebook Conversions API tag from the Community Template Gallery
3. **Configure event mapping:** Map your GA4 events to Meta events. \`page_view\` \u2192 \`PageView\`, \`add_to_cart\` \u2192 \`AddToCart\`, \`purchase\` \u2192 \`Purchase\`
4. **Set user data parameters:** Pass hashed email, phone, first name, last name, city, state, zip, and country for event matching. The more parameters you provide, the higher the match rate
5. **Add the event ID for deduplication:** Generate a unique event ID on the client side and pass it to both the pixel AND the server-side tag

\`\`\`GTM Server - Meta CAPI Configuration
// Event mapping in GTM Server Container
// Client-side GA4 tag sends to server container
// Server container forwards to Meta CAPI

Event Mapping:
  GA4 Event          \u2192  Meta CAPI Event
  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  page_view          \u2192  PageView
  view_item          \u2192  ViewContent
  add_to_cart        \u2192  AddToCart
  begin_checkout     \u2192  InitiateCheckout
  purchase           \u2192  Purchase
  generate_lead      \u2192  Lead
  sign_up            \u2192  CompleteRegistration

User Data Parameters (hashed with SHA-256):
  em   \u2192 email address
  ph   \u2192 phone number
  fn   \u2192 first name
  ln   \u2192 last name
  ct   \u2192 city
  st   \u2192 state
  zp   \u2192 zip code
  country \u2192 country code

Event ID: Must match between pixel and CAPI
  \u2192 Generated client-side, passed to both
\`\`\`` },
    { id: 'event-matching-deduplication', label: 'Event Matching & Deduplication', content: `**Event matching** is how Meta connects a server event to a specific user. The more user parameters you provide, the higher your Event Match Quality (EMQ) score. Aim for an EMQ of 6.0 or higher (out of 10). Email and phone number are the two most impactful parameters.

**Deduplication** is critical when running the pixel and CAPI simultaneously (which you should). Without deduplication, Meta counts each conversion twice — once from the pixel and once from CAPI. The solution is simple: generate a unique \`event_id\` on the client side and include it in both the pixel event and the CAPI event. Meta automatically deduplicates events with matching event IDs.

\`\`\`Deduplication - Event ID Generation
// Generate unique event ID on the client side
// Include in both Meta Pixel and dataLayer push

const eventId = crypto.randomUUID();

// Meta Pixel (client-side)
fbq('track', 'Purchase', {
  value: 99.99,
  currency: 'USD'
}, { eventID: eventId });

// Data Layer Push (forwarded to server \u2192 CAPI)
dataLayer.push({
  event: 'purchase',
  event_id: eventId,  // Same ID sent to CAPI
  ecommerce: {
    value: 99.99,
    currency: 'USD',
    transaction_id: 'TXN-12345'
  }
});
\`\`\`` },
    { id: 'testing-and-validation', label: 'Testing & Validation', content: `After setup, validate that everything works correctly:

- **Meta Events Manager \u2192 Test Events:** Use the Test Events tab to send test conversions and verify they arrive with correct parameters
- **Check Event Match Quality:** Navigate to Data Sources \u2192 your pixel \u2192 Overview. EMQ should be 6.0+ for each event type
- **Verify deduplication:** Check that your total event count with pixel + CAPI is roughly the same as pixel alone (not double). A slight increase (10-30%) is expected — those are the previously missed events
- **Monitor in GTM Server:** Use the server container's preview mode to verify events are being forwarded with all user parameters
- **Compare before/after:** Track your reported conversions for 2 weeks before and after CAPI implementation. Expect a 15-35% increase in attributed conversions

Setting up the [Meta Conversions API](/services) is one of the most impactful improvements you can make to your Meta advertising performance. Better data leads to better optimization, which leads to lower CPAs and higher ROAS — with no changes to your creative or targeting.` },
  ],
}

export default function BlogDetailEditor() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { loaded } = useData()
  const [data, setData] = useState<BlogDetail | null>(null)
  const [postSlug, setPostSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!slug || !loaded) return
    const init = async () => {
      // Always fetch fresh from Supabase first
      await loadAllCollections()
      await loadCollection(`col_blog_detail_${slug}`)

      const post = getBlog().find((b) => b.slug === slug)
      if (post) setPostSlug(post.slug)

      const existing = getBlogDetail(slug)
      if (existing) {
        let toc = (existing.toc || []).map((t: { id: string; label: string; content?: string }) => ({ id: t.id, label: t.label, content: t.content || '' }))
        if (toc.length === 0 && defaultTocSeeds[slug]) toc = defaultTocSeeds[slug]
        const intro = (!existing.intro && defaultIntroSeeds[slug]) ? defaultIntroSeeds[slug] : (existing.intro || '')
        const image = existing.image || post?.image || ''
        setData({ ...existing, toc, intro, image })
      } else {
        // New post — seed from blog list data
        const seeded: BlogDetail = {
          title: post?.title || '', category: post?.category || '', date: post?.date || '', readTime: post?.readTime || '',
          excerpt: post?.excerpt || '', image: post?.image || '', author: 'DigiTitan AI', authorRole: 'AI-Powered Digital Solutions', authorInitials: 'DT',
          intro: defaultIntroSeeds[slug] || '', toc: defaultTocSeeds[slug] || [], ctaHeading: 'Want to implement this?', ctaDescription: "Let's discuss how to apply these strategies to your business.",
          ctaButtonText: 'Book a Free Consultation', ctaButtonLink: '/book', ctaSubtext: 'No payment required',
          relatedSectionTitle: 'Keep Reading', featured: post?.featured || false,
        }
        await saveBlogDetail(slug, seeded)
        setData(seeded)
      }
    }
    init()
  }, [slug, loaded])

  const handleSave = () => {
    if (!data || !slug) return
    setSaving(true)
    saveBlogDetail(postSlug || slug, data)
    const all = getBlog()
    const updated = all.map((b) => b.slug === slug ? { ...b, title: data.title, slug: postSlug || slug, category: data.category, date: data.date, readTime: data.readTime, excerpt: data.excerpt, featured: data.featured, image: data.image } : b)
    saveBlog(updated)
    if (postSlug && postSlug !== slug && typeof window !== 'undefined') localStorage.removeItem(`col_blog_detail_${slug}`)
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000) }, 500)
  }

  if (!data) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 text-brand-cream/40 animate-spin" /></div>

  const d = data
  const setD = (fn: (prev: BlogDetail) => BlogDetail) => { setData(fn(data)); setSaved(false) }

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/blog')} className="h-9 px-3 text-[12px] text-brand-cream/60 hover:text-brand-cream rounded-lg hover:bg-surface-100/60 transition-all inline-flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> All Posts</button>
          <div className="w-px h-5 bg-brand-mid/10" />
          <div>
            <h1 className="text-[16px] font-semibold text-brand-cream tracking-tight">{d.title || 'Blog Post'}</h1>
            <p className="text-[11px] text-brand-cream/40 font-mono">/blog/{slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer" className="h-8 px-3 text-[12px] text-brand-cream/50 hover:text-brand-cream rounded-lg hover:bg-surface-200/60 transition-all inline-flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Preview</a>
          <button onClick={handleSave} disabled={saving || saved} className="h-8 px-3.5 text-[12px] font-medium bg-brand-gold/90 text-brand-darkest rounded-lg hover:bg-brand-gold transition-all inline-flex items-center gap-1.5 disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Post Info */}
      <SectionBlock title="Post Info" color="green" defaultOpen>
        <div className="space-y-3">
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Title</label><input type="text" value={d.title} onChange={(e) => setD((p) => ({ ...p, title: e.target.value }))} className={inp + ' text-[15px] font-semibold'} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Slug</label><input type="text" value={postSlug} onChange={(e) => { setPostSlug(e.target.value); setSaved(false) }} className={inp + ' font-mono'} /></div>
            <CategoryPicker label="Category" value={d.category} onChange={(v) => setD((p) => ({ ...p, category: v }))} type="blog" multiple />
          </div>
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Excerpt</label><textarea value={d.excerpt} onChange={(e) => setD((p) => ({ ...p, excerpt: e.target.value }))} rows={3} className={ta} /></div>
          <ImageUploader label="Featured Image" value={d.image || ''} onChange={(v) => setD((p) => ({ ...p, image: v }))} hint="Recommended: 1200 x 630px (16:9 ratio) — used as hero image and social share preview" />
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Date</label><input type="text" value={d.date} onChange={(e) => setD((p) => ({ ...p, date: e.target.value }))} placeholder="Mar 22, 2026" className={inp} /></div>
            <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Read Time</label><input type="text" value={d.readTime} onChange={(e) => setD((p) => ({ ...p, readTime: e.target.value }))} placeholder="12 min" className={inp} /></div>
            <div className="flex items-end pb-1">
              <button type="button" onClick={() => setD((p) => ({ ...p, featured: !p.featured }))}
                className={`h-10 px-4 rounded-xl text-[12px] font-medium inline-flex items-center gap-2 transition-all ${d.featured ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30' : 'bg-brand-darkest/40 text-brand-cream/40 border border-brand-mid/[0.06]'}`}>
                <Star className={`w-3.5 h-3.5 ${d.featured ? 'fill-brand-gold' : ''}`} /> {d.featured ? 'Featured' : 'Not Featured'}
              </button>
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Author */}
      <SectionBlock title="Author" color="blue">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Name</label><input type="text" value={d.author} onChange={(e) => setD((p) => ({ ...p, author: e.target.value }))} className={inp} /></div>
            <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Role / Title</label><input type="text" value={d.authorRole} onChange={(e) => setD((p) => ({ ...p, authorRole: e.target.value }))} className={inp} /></div>
            <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Avatar Initials</label><input type="text" value={d.authorInitials || ''} onChange={(e) => setD((p) => ({ ...p, authorInitials: e.target.value }))} placeholder="DT" maxLength={3} className={inp} /></div>
          </div>
        </div>
      </SectionBlock>

      {/* Introduction */}
      <SectionBlock title="Introduction" color="amber" defaultOpen>
        <div className="space-y-2">
          <p className="text-[11px] text-brand-cream/35">The opening paragraphs that appear before the first content section. Type <code className="text-brand-gold/60">/</code> for formatting options.</p>
          <RichTextEditor value={d.intro || ''} onChange={(v) => setD((p) => ({ ...p, intro: v }))} placeholder="Write the introduction for this blog post..." />
        </div>
      </SectionBlock>

      {/* Content Sections */}
      <SectionBlock title="Content Sections" color="gold" defaultOpen>
        <div className="space-y-4">
          <p className="text-[11px] text-brand-cream/35 leading-relaxed">Each section becomes a heading in the Table of Contents and its content appears on the blog page. Type <code className="text-brand-gold/60">/</code> in the editor for formatting options — headings, lists, quotes, code blocks, and more.</p>
          {d.toc.map((item, i) => (
            <div key={i} className="rounded-xl border border-brand-mid/[0.08] bg-brand-darkest/30">
              {/* Section header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-brand-darkest/40 border-b border-brand-mid/[0.06]">
                <GripVertical className="w-3.5 h-3.5 text-brand-cream/20 flex-shrink-0" />
                <span className="text-[10px] text-brand-gold/60 font-mono font-bold w-5 flex-shrink-0">{i + 1}</span>
                <input type="text" value={item.label} onChange={(e) => { const newLabel = e.target.value; setD((p) => ({ ...p, toc: p.toc.map((t, j) => j === i ? { ...t, label: newLabel, id: newLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : t) })) }} placeholder="Section Heading" className="flex-1 h-8 px-2.5 text-[13px] font-semibold bg-brand-darkest/50 border border-brand-mid/[0.06] rounded-lg text-brand-cream focus:outline-none focus:border-brand-mid/15" />
                <span className="text-[10px] text-brand-cream/20 font-mono flex-shrink-0 max-w-[120px] truncate">#{item.id}</span>
                <button onClick={() => setD((p) => ({ ...p, toc: p.toc.filter((_, j) => j !== i) }))} className="p-1.5 rounded-md text-red-400/30 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0" title="Remove section"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {/* Section content */}
              <div className="px-4 py-3">
                <RichTextEditor value={item.content || ''} onChange={(v) => setD((p) => ({ ...p, toc: p.toc.map((t, j) => j === i ? { ...t, content: v } : t) }))} placeholder="Type / for commands..." />
              </div>
            </div>
          ))}
          <button onClick={() => setD((p) => ({ ...p, toc: [...p.toc, { id: '', label: '', content: '' }] }))} className="w-full py-3 border border-dashed border-brand-gold/15 rounded-xl text-[11px] text-brand-cream/40 hover:text-brand-gold hover:border-brand-gold/30 flex items-center justify-center gap-1.5 transition-all"><Plus className="w-3 h-3" /> Add Content Section</button>
        </div>
      </SectionBlock>

      {/* CTA Box */}
      <SectionBlock title="Call to Action" color="emerald">
        <div className="space-y-3">
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Heading</label><input type="text" value={d.ctaHeading} onChange={(e) => setD((p) => ({ ...p, ctaHeading: e.target.value }))} className={inp} /></div>
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Description</label><textarea value={d.ctaDescription} onChange={(e) => setD((p) => ({ ...p, ctaDescription: e.target.value }))} rows={2} className={ta} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Button Text</label><input type="text" value={d.ctaButtonText} onChange={(e) => setD((p) => ({ ...p, ctaButtonText: e.target.value }))} className={inp} /></div>
            <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Button Link</label><input type="text" value={d.ctaButtonLink} onChange={(e) => setD((p) => ({ ...p, ctaButtonLink: e.target.value }))} className={inp + ' font-mono'} /></div>
          </div>
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Subtext (below button)</label><input type="text" value={d.ctaSubtext || ''} onChange={(e) => setD((p) => ({ ...p, ctaSubtext: e.target.value }))} placeholder="No payment required" className={inp} /></div>
        </div>
      </SectionBlock>

      {/* Related Posts */}
      <SectionBlock title="Related Posts" color="green">
        <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Section Title</label><input type="text" value={d.relatedSectionTitle || ''} onChange={(e) => setD((p) => ({ ...p, relatedSectionTitle: e.target.value }))} placeholder="Keep Reading" className={inp} /></div>
      </SectionBlock>

      {/* SEO */}
      <SectionBlock title="SEO" color="blue">
        <div className="space-y-3">
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Meta Title</label><input type="text" value={d.seoTitle || ''} onChange={(e) => setD((p) => ({ ...p, seoTitle: e.target.value }))} placeholder={d.title} className={inp} /><p className="text-[10px] text-brand-cream/25 mt-1">{(d.seoTitle || d.title || '').length}/60</p></div>
          <div><label className="block text-[11px] text-brand-cream/50 uppercase tracking-wider mb-1.5 font-medium">Meta Description</label><textarea value={d.seoDescription || ''} onChange={(e) => setD((p) => ({ ...p, seoDescription: e.target.value }))} placeholder={d.excerpt} rows={2} className={ta} /><p className="text-[10px] text-brand-cream/25 mt-1">{(d.seoDescription || d.excerpt || '').length}/160</p></div>
          <ImageUploader label="OG Image" value={d.seoImage || ''} onChange={(v) => setD((p) => ({ ...p, seoImage: v }))} hint="1200x630 for social sharing" />
        </div>
      </SectionBlock>
    </div>
  )
}

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getBlogDetail, saveBlogDetail } from '@/lib/collections';
import { useData, useDetailData } from '@/lib/useData';
import PageSEO from '@/components/layout/PageSEO';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BlogPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  toc: { id: string; label: string }[];
  content: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Reusable content components                                        */
/* ------------------------------------------------------------------ */

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2
    id={id}
    className="text-[24px] font-display font-bold text-brand-cream mt-12 mb-4 scroll-mt-28"
  >
    {children}
  </h2>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[20px] font-semibold text-brand-cream mt-8 mb-3">
    {children}
  </h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[15px] leading-[1.85] text-brand-cream/80 mb-5">
    {children}
  </p>
);

const UL = ({ children }: { children: React.ReactNode }) => (
  <ul className="mb-5 space-y-2 pl-6">{children}</ul>
);

const OL = ({ children }: { children: React.ReactNode }) => (
  <ol className="mb-5 space-y-2 pl-6 counter-reset-none">{children}</ol>
);

const LI = ({ children, ordered, num }: { children: React.ReactNode; ordered?: boolean; num?: number }) => (
  <li className="flex items-start gap-3 text-[15px] text-brand-cream/75">
    <span className="text-brand-mid mt-0.5 flex-shrink-0 font-display font-bold text-[15px]">
      {ordered ? `${num}.` : '•'}
    </span>
    <span>{children}</span>
  </li>
);

const BQ = ({ children }: { children: React.ReactNode }) => (
  <blockquote className="border-l-2 border-brand-gold pl-5 italic text-brand-cream/70 my-6">
    {children}
  </blockquote>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="bg-brand-mid/10 text-brand-green-light px-1.5 py-0.5 rounded text-[13px]">
    {children}
  </code>
);

const CodeBlock = ({ title, children }: { title?: string; children: string }) => (
  <div className="my-6 overflow-hidden rounded-xl border border-brand-mid/15">
    {title && (
      <div className="bg-brand-mid/10 px-4 py-2.5 text-[12px] text-brand-green-light border-b border-brand-mid/15 font-medium font-mono">
        {title}
      </div>
    )}
    <pre className="rounded-xl bg-brand-dark p-5 text-[13px] text-brand-green-light font-mono overflow-x-auto">
      {children}
    </pre>
  </div>
);

const Strong = ({ children }: { children: React.ReactNode }) => (
  <strong className="text-brand-cream font-semibold">{children}</strong>
);

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-brand-gold hover:text-brand-gold-light underline">
    {children}
  </Link>
);

/* ------------------------------------------------------------------ */
/*  Dynamic content renderer                                           */
/* ------------------------------------------------------------------ */

function renderMarkdownContent(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let key = 0;

  // First, extract code blocks (they can contain blank lines)
  // Split into segments: text, codeblock, text, codeblock, ...
  const segments: { type: 'text' | 'code'; content: string; title?: string }[] = [];
  const codeBlockRegex = /```([^\n]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', content: match[2], title: match[1].trim() || undefined });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }
  // If no code blocks found, treat entire text as one segment
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text });
  }

  for (const segment of segments) {
    if (segment.type === 'code') {
      let title: string | undefined = undefined;
      let code = segment.content.replace(/\n$/, '');
      const lines = code.split('\n');
      const firstLine = lines[0]?.trim() || '';
      // Check if first line is a title comment: "//title", "// Title", "#title", "# Title"
      // Must NOT look like real code (no =, {, (, ;, or shebang)
      const isTitleComment = /^(\/\/|#(?!!\/))/.test(firstLine) && firstLine.length < 80 && !/[={}();]/.test(firstLine);
      if (isTitleComment) {
        title = firstLine.replace(/^\/\/\s*/, '').replace(/^#\s*/, '');
        code = lines.slice(1).join('\n').replace(/^\n/, '');
      }
      // Fall back to language tag as title if it's a descriptive name (has spaces)
      if (!title && segment.title && segment.title.includes(' ')) {
        title = segment.title;
      }
      elements.push(<CodeBlock key={key++} title={title}>{code}</CodeBlock>);
      continue;
    }

    // Process text blocks (split by blank lines)
    const blocks = segment.content.split(/\n\n+/);

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      // Heading (## or ###)
      if (/^#{2,3}\s/.test(trimmed)) {
        const level = trimmed.startsWith('### ') ? 3 : 2;
        const headingText = trimmed.replace(/^#{2,3}\s+/, '');
        if (level === 3) {
          elements.push(<H3 key={key++}>{processInline(headingText)}</H3>);
        }
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        const quoteText = trimmed.split('\n').map((l: string) => l.replace(/^>\s?/, '')).join(' ');
        elements.push(<BQ key={key++}>{processInline(quoteText)}</BQ>);
        continue;
      }

      // Unordered list (- or *)
      const listLines = trimmed.split('\n');
      if (listLines.every((l: string) => /^\s*[-*]\s/.test(l))) {
        const items = listLines.map((l: string) => l.replace(/^\s*[-*]\s+/, ''));
        elements.push(<UL key={key++}>{items.map((item: string, i: number) => <LI key={i}>{processInline(item)}</LI>)}</UL>);
        continue;
      }

      // Ordered list
      if (listLines.every((l: string) => /^\s*\d+\.\s/.test(l))) {
        const items = listLines.map((l: string) => l.replace(/^\s*\d+\.\s+/, ''));
        elements.push(<OL key={key++}>{items.map((item: string, i: number) => <LI key={i} ordered num={i + 1}>{processInline(item)}</LI>)}</OL>);
        continue;
      }

      // Table (lines with | separators and a --- divider row)
      const tableLines = trimmed.split('\n').filter((l: string) => l.trim());
      if (tableLines.length >= 2 && tableLines[0].includes('|') && tableLines.some((l: string) => /^\s*\|?\s*[-:]+[-|:\s]*$/.test(l))) {
        const dividerIdx = tableLines.findIndex((l: string) => /^\s*\|?\s*[-:]+[-|:\s]*$/.test(l));
        const headerRow = tableLines[dividerIdx - 1] || tableLines[0];
        const dividerRow = tableLines[dividerIdx];
        const bodyRows = tableLines.slice(dividerIdx + 1);
        const parseRow = (row: string) => row.split('|').map(c => c.trim()).filter((c, i, arr) => !(i === 0 && c === '') && !(i === arr.length - 1 && c === ''));
        const headers = parseRow(headerRow);
        // Parse alignment from divider row (:---, :---:, ---:)
        const alignCells = parseRow(dividerRow);
        const aligns = alignCells.map((c) => {
          const t = c.trim();
          if (t.startsWith(':') && t.endsWith(':')) return 'center';
          if (t.endsWith(':')) return 'right';
          return 'left';
        });
        elements.push(
          <div key={key++} className="my-6 overflow-x-auto rounded-xl border border-brand-mid/10">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-brand-mid/15 bg-brand-mid/5">
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-brand-cream/60" style={{ textAlign: aligns[i] || 'left' }}>{processInline(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => {
                  const cells = parseRow(row);
                  return (
                    <tr key={ri} className="border-b border-brand-mid/[0.06] last:border-0">
                      {cells.map((cell, ci) => (
                        <td key={ci} className="px-4 py-3 text-brand-cream/75" style={{ textAlign: aligns[ci] || 'left' }}>{processInline(cell)}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // Image (![alt](url))
      const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        elements.push(
          <div key={key++} className="my-6 rounded-xl overflow-hidden">
            <img src={imageMatch[2]} alt={imageMatch[1]} className="w-full h-auto rounded-xl" />
          </div>
        );
        continue;
      }

      // Regular paragraph
      elements.push(<P key={key++}>{processInline(trimmed)}</P>);
    }
  }

  return elements;
}

function processInline(text: string): React.ReactNode {
  // Process **bold**, `code`, ![image](url), and [link](url)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Image
    const imageMatch = remaining.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    // Link
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const matches = [
      boldMatch ? { idx: boldMatch.index!, type: 'bold' as const, match: boldMatch } : null,
      codeMatch ? { idx: codeMatch.index!, type: 'code' as const, match: codeMatch } : null,
      imageMatch ? { idx: imageMatch.index!, type: 'image' as const, match: imageMatch } : null,
      linkMatch ? { idx: linkMatch.index!, type: 'link' as const, match: linkMatch } : null,
    ].filter(Boolean).sort((a, b) => a!.idx - b!.idx);

    if (!matches.length) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    if (first.idx > 0) parts.push(remaining.slice(0, first.idx));

    if (first.type === 'bold') {
      parts.push(<Strong key={key++}>{first.match[1]}</Strong>);
      remaining = remaining.slice(first.idx + first.match[0].length);
    } else if (first.type === 'code') {
      parts.push(<Code key={key++}>{first.match[1]}</Code>);
      remaining = remaining.slice(first.idx + first.match[0].length);
    } else if (first.type === 'image') {
      parts.push(<img key={key++} src={first.match[2]} alt={first.match[1]} className="my-4 w-full h-auto rounded-xl" />);
      remaining = remaining.slice(first.idx + first.match[0].length);
    } else {
      parts.push(<A key={key++} href={first.match[2]}>{first.match[1]}</A>);
      remaining = remaining.slice(first.idx + first.match[0].length);
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function DynamicBlogContent({ sections }: { sections: { id: string; label: string; content: string }[] }) {
  return (
    <>
      {sections.map((section) => (
        <div key={section.id}>
          <H2 id={section.id}>{section.label}</H2>
          {renderMarkdownContent(section.content)}
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Blog post data                                                     */
/* ------------------------------------------------------------------ */

const posts: Record<string, BlogPost> = {
  'server-side-tracking-complete-guide': {
    slug: 'server-side-tracking-complete-guide',
    title: 'Server-Side Tracking: The Complete Guide for 2026',
    category: 'Tracking',
    date: 'Mar 22, 2026',
    readTime: '12 min',
    excerpt: 'Ad blockers and iOS restrictions are killing your data. Learn how server-side tracking with GTM recovers 30-40% of lost conversions.',
    toc: [
      { id: 'what-is-server-side-tracking', label: 'What Is Server-Side Tracking?' },
      { id: 'why-browser-tracking-fails', label: 'Why Browser Tracking Fails' },
      { id: 'how-gtm-server-containers-work', label: 'How GTM Server Containers Work' },
      { id: 'setup-step-by-step', label: 'Setup Step by Step' },
      { id: 'benefits-and-when-to-use', label: 'Benefits & When to Use It' },
    ],
    content: (
      <>
        <P>
          If you are running digital advertising campaigns in 2026, there is a good chance you are losing between 20% and 40% of your conversion data. Browser-based tracking — the model the industry relied on for over a decade — is fundamentally broken. Ad blockers, Intelligent Tracking Prevention on iOS and Safari, and the deprecation of third-party cookies have created a measurement gap that grows wider every quarter.
        </P>
        <P>
          Server-side tracking solves this by moving the data collection layer from the user&apos;s browser to a server you control. In this guide, I will walk you through exactly what server-side tracking is, why it matters, how to set it up with Google Tag Manager, and when it makes sense for your business.
        </P>

        <H2 id="what-is-server-side-tracking">What Is Server-Side Tracking?</H2>
        <P>
          Traditional web tracking works by loading JavaScript tags directly in the visitor&apos;s browser. Every time someone lands on your page, scripts from Google Analytics, Meta Pixel, LinkedIn Insight Tag, and others fire from the client side. The browser sends data directly to each vendor&apos;s servers.
        </P>
        <P>
          <Strong>Server-side tracking</Strong> flips this model. Instead of the browser communicating with dozens of third-party endpoints, it sends a single request to <em>your</em> server. That server then processes the data and forwards it to Google Analytics 4, Meta Conversions API, Google Ads, and any other platform you use. The visitor&apos;s browser never interacts with third-party domains at all.
        </P>
        <UL>
          <LI><Strong>Client-side:</Strong> Browser → Google/Meta/LinkedIn (blocked by ad blockers)</LI>
          <LI><Strong>Server-side:</Strong> Browser → Your Server → Google/Meta/LinkedIn (not blocked)</LI>
        </UL>
        <P>
          This is not just a workaround for ad blockers. It is a fundamental shift in how data ownership works. When your server is the intermediary, you control what data gets sent, you can enrich it before forwarding, and you maintain a first-party relationship with every data point.
        </P>

        <H2 id="why-browser-tracking-fails">Why Browser Tracking Fails in 2026</H2>
        <P>
          The statistics are sobering. According to multiple industry reports, ad blocker usage exceeds 42% on desktop browsers globally. Apple&apos;s Intelligent Tracking Prevention limits cookie lifetimes to 7 days (or 24 hours for classified cookies). Firefox and Brave block third-party trackers entirely by default.
        </P>
        <H3>The Key Failure Points</H3>
        <OL>
          <LI ordered num={1}><Strong>Ad blockers:</Strong> uBlock Origin, AdBlock Plus, and browser-native blockers intercept requests to known tracking domains like <Code>google-analytics.com</Code> and <Code>connect.facebook.net</Code></LI>
          <LI ordered num={2}><Strong>ITP / Safari:</Strong> First-party cookies set via JavaScript are capped at 7 days. Returning visitors after a week look like new users, inflating your user counts and breaking attribution</LI>
          <LI ordered num={3}><Strong>iOS App Tracking Transparency:</Strong> Over 80% of iOS users opt out of cross-app tracking, making Meta Pixel data incomplete</LI>
          <LI ordered num={4}><Strong>Browser privacy updates:</Strong> Chrome&apos;s Privacy Sandbox and third-party cookie phase-out mean even Google&apos;s own browser no longer supports the old model</LI>
        </OL>

        <BQ>
          &ldquo;You cannot optimize what you cannot measure. If 30% of your conversions are invisible, your bidding algorithms are working with incomplete data — and your ROAS calculations are simply wrong.&rdquo;
        </BQ>

        <H2 id="how-gtm-server-containers-work">How GTM Server Containers Work</H2>
        <P>
          Google Tag Manager&apos;s server-side container is the most popular solution for implementing server-side tracking. It runs on a cloud server (Google Cloud Platform by default, but you can use AWS or any cloud provider) and acts as a proxy between your website and marketing platforms.
        </P>
        <P>
          The architecture has three key components:
        </P>
        <UL>
          <LI><Strong>Client:</Strong> Receives incoming HTTP requests from the browser. The GA4 client, for example, intercepts requests that look like GA4 measurement protocol hits</LI>
          <LI><Strong>Tags:</Strong> Forward data to destinations — GA4, Google Ads, Meta CAPI, etc. These run on the server, not the browser</LI>
          <LI><Strong>Transformations:</Strong> Enrich or modify data before sending. Add user IDs, hash PII, filter bot traffic, or append server-side variables</LI>
        </UL>
        <CodeBlock title="GTM Server Container - Cloud Run Config">
{`# Deploy GTM Server Container on Google Cloud Run
gcloud run deploy gtm-server \\
  --image gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars CONTAINER_CONFIG="YOUR_CONFIG_STRING" \\
  --min-instances 1 \\
  --max-instances 10 \\
  --memory 256Mi`}
        </CodeBlock>

        <H2 id="setup-step-by-step">Setup Step by Step</H2>
        <P>
          Here is the process I follow when setting up server-side tracking for clients. The entire setup typically takes 2-4 hours for an experienced implementer.
        </P>
        <OL>
          <LI ordered num={1}><Strong>Create a server container in GTM:</Strong> Go to tagmanager.google.com, create a new container, and select &ldquo;Server&rdquo; as the container type</LI>
          <LI ordered num={2}><Strong>Provision your server:</Strong> Deploy the container image to Google Cloud Run or App Engine. Cloud Run is preferred for its auto-scaling and cost efficiency</LI>
          <LI ordered num={3}><Strong>Map your custom domain:</Strong> Point a subdomain like <Code>track.yourdomain.com</Code> to your Cloud Run service. This is critical — it makes all tracking requests first-party</LI>
          <LI ordered num={4}><Strong>Update your web GTM container:</Strong> Change the GA4 transport URL to point to your server container instead of Google&apos;s default endpoint</LI>
          <LI ordered num={5}><Strong>Configure server-side tags:</Strong> Add GA4, Google Ads Conversion Tracking, and Meta CAPI tags in the server container</LI>
          <LI ordered num={6}><Strong>Test and validate:</Strong> Use GTM&apos;s server-side preview mode to verify data is flowing correctly from browser → server → platforms</LI>
          <LI ordered num={7}><Strong>Set up monitoring:</Strong> Configure Cloud Monitoring alerts for error rates, latency, and instance scaling</LI>
        </OL>

        <H3>Critical Configuration: First-Party Domain</H3>
        <P>
          The single most important step is mapping a first-party subdomain. When your tracking endpoint is <Code>track.yourdomain.com</Code> instead of <Code>www.google-analytics.com</Code>, the browser treats it as a same-site request. Ad blockers cannot distinguish it from your own API calls, ITP does not limit cookie lifetimes, and the data flows reliably.
        </P>

        <H2 id="benefits-and-when-to-use">Benefits & When to Use Server-Side Tracking</H2>
        <P>
          After implementing server-side tracking for over 40 clients, here are the consistent benefits I see:
        </P>
        <UL>
          <LI><Strong>30-40% more conversion data:</Strong> Recovered events that ad blockers and ITP previously blocked</LI>
          <LI><Strong>Improved ad platform optimization:</Strong> More complete conversion data means smarter bidding from Google and Meta&apos;s algorithms</LI>
          <LI><Strong>Page speed improvement:</Strong> Fewer client-side scripts means faster Time to Interactive. Most clients see 200-500ms improvement</LI>
          <LI><Strong>Data control and privacy:</Strong> You decide what PII gets forwarded. Hash emails before sending to Meta. Strip IP addresses. Comply with GDPR by design</LI>
          <LI><Strong>Extended cookie lifetimes:</Strong> Server-set cookies bypass ITP restrictions, giving you accurate returning-visitor data</LI>
        </UL>

        <H3>When Is It Worth the Investment?</H3>
        <P>
          Server-side tracking involves ongoing hosting costs (typically $50-150/month) and requires technical expertise to maintain. It makes sense when you are spending more than $5,000/month on digital advertising, when accurate attribution is critical to business decisions, or when you operate in a privacy-regulated industry like finance or healthcare. If your <A href="/services">marketing analytics</A> feel unreliable, server-side tracking is likely the highest-impact fix available.
        </P>
      </>
    ),
  },

  'n8n-automation-marketing-workflows': {
    slug: 'n8n-automation-marketing-workflows',
    title: '10 n8n Automation Workflows Every Marketer Needs',
    category: 'Automation',
    date: 'Mar 18, 2026',
    readTime: '9 min',
    excerpt: 'From lead routing to Slack alerts to automated reporting — these 10 n8n workflows will save your team 15+ hours every week.',
    toc: [
      { id: 'why-n8n-for-marketing', label: 'Why n8n for Marketing' },
      { id: 'lead-management-workflows', label: 'Lead Management Workflows' },
      { id: 'communication-workflows', label: 'Communication & Alerts' },
      { id: 'reporting-and-data', label: 'Reporting & Data Workflows' },
      { id: 'client-operations', label: 'Client Operations' },
    ],
    content: (
      <>
        <P>
          Marketing teams waste an extraordinary amount of time on repetitive tasks. Copying data between tools, sending follow-up messages, building weekly reports, routing leads to the right sales rep — these are all tasks that should run on autopilot. The problem is that most automation platforms charge per workflow, per execution, or per &ldquo;zap,&rdquo; and costs spiral quickly.
        </P>
        <P>
          <Strong>n8n</Strong> is the open-source alternative that changes this equation. Self-hosted with no execution limits, it connects to over 400 apps and lets you build workflows with a visual node editor. I have been using n8n for client work since 2024, and these are the 10 workflows that consistently deliver the most value.
        </P>

        <H2 id="why-n8n-for-marketing">Why n8n Over Zapier or Make</H2>
        <P>
          The short answer: cost and control. Zapier charges $49/month for 750 tasks. A single busy workflow can burn through that in a day. n8n, self-hosted on a $10/month server, gives you unlimited executions. Beyond cost, n8n offers code nodes where you can write JavaScript for complex transformations, error handling with retry logic, and the ability to keep sensitive data on your own infrastructure.
        </P>

        <BQ>
          &ldquo;We switched from Zapier to n8n and went from paying $299/month for 5 workflows to $12/month for 47 workflows on a single Digital Ocean droplet.&rdquo; — actual client feedback after migration.
        </BQ>

        <H2 id="lead-management-workflows">Lead Management Workflows</H2>

        <H3>1. Intelligent Lead Routing</H3>
        <P>
          When a new lead submits a form on your website, this workflow evaluates their company size, industry, and inquiry type, then routes them to the appropriate sales rep in your CRM. It assigns lead scores based on form data and website behavior, and sends the assigned rep a Slack notification with full context.
        </P>
        <CodeBlock title="n8n Lead Scoring Node (JavaScript)">
{`// Score leads based on form data
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

return { ...lead, score, assignee };`}
        </CodeBlock>

        <H3>2. Email Sequence Trigger</H3>
        <P>
          When a lead enters your CRM with a specific tag or status, n8n triggers a personalized email sequence. Unlike rigid email platform automations, you can pull in data from multiple sources — their form answers, pages they visited, content they downloaded — and use it to customize every email.
        </P>

        <H3>3. CRM Sync Across Platforms</H3>
        <P>
          Most businesses use multiple tools that need to share contact data: a CRM, an email platform, an invoicing tool, and a support desk. This workflow keeps contacts synchronized across all of them. When a record updates in HubSpot, it mirrors the change in Mailchimp, Stripe, and Intercom within seconds.
        </P>

        <H2 id="communication-workflows">Communication & Alert Workflows</H2>

        <H3>4. Slack Alerts for Key Events</H3>
        <P>
          Get instant Slack notifications when high-value events happen: a lead with a score above 70 fills out a form, a customer churns, ad spend exceeds the daily budget, or a website goes down. Each alert includes actionable context so the team can respond immediately.
        </P>

        <H3>5. Social Media Scheduling</H3>
        <P>
          Pull content from a Google Sheet or Notion database and automatically post to LinkedIn, Twitter, and Facebook at scheduled times. The workflow formats content for each platform — character limits, hashtag strategies, image dimensions — so you write once and publish everywhere.
        </P>

        <H3>6. Review Request Sequences</H3>
        <P>
          After a project is delivered or a product is purchased, this workflow waits a configurable number of days, then sends a personalized review request. It checks the customer&apos;s satisfaction score first — only happy customers get the ask. Negative-scoring customers trigger an internal alert for the support team instead.
        </P>

        <H2 id="reporting-and-data">Reporting & Data Workflows</H2>

        <H3>7. Automated Weekly Reports</H3>
        <P>
          Every Monday at 8 AM, this workflow pulls data from Google Analytics 4, Google Ads, Meta Ads, and your CRM. It compiles the numbers into a formatted report and sends it to Slack or email. No more spending Friday afternoons building spreadsheets.
        </P>
        <UL>
          <LI>Pull GA4 metrics via the Data API</LI>
          <LI>Pull ad spend and ROAS from Google Ads and Meta Ads APIs</LI>
          <LI>Pull pipeline data from CRM</LI>
          <LI>Format into a clean Slack message with week-over-week comparisons</LI>
          <LI>Send to the #marketing-reports channel</LI>
        </UL>

        <H3>8. Data Backup to Google Sheets</H3>
        <P>
          Critical marketing data should not live in only one platform. This workflow exports lead data, campaign performance, and conversion events to Google Sheets daily. It creates a historical archive that survives platform changes and gives non-technical team members direct access to data without logging into multiple tools.
        </P>

        <H2 id="client-operations">Client Operations Workflows</H2>

        <H3>9. Invoice Generation</H3>
        <P>
          For agencies and freelancers, this workflow monitors project milestones in your project management tool. When a milestone is completed, it auto-generates a draft invoice in your billing platform (Stripe, QuickBooks, or Xero), populates the line items, and sends the client a polished PDF.
        </P>

        <H3>10. Client Onboarding Automation</H3>
        <P>
          When a new client signs a contract, this workflow triggers a full onboarding sequence: creates a project in your PM tool, sets up a shared Google Drive folder, sends a welcome email with next steps, schedules the kickoff call via Calendly, and provisions access to shared dashboards.
        </P>
        <P>
          If you want to implement <A href="/services">marketing automation</A> workflows like these for your business, the key is starting with the three or four that save the most manual time and building from there. Each workflow typically takes 1-3 hours to build and saves 2-5 hours per week. The ROI compounds fast.
        </P>
      </>
    ),
  },

  'ga4-event-tracking-setup': {
    slug: 'ga4-event-tracking-setup',
    title: 'GA4 Event Tracking: Setup Guide for E-Commerce',
    category: 'Tracking',
    date: 'Mar 14, 2026',
    readTime: '14 min',
    excerpt: 'A step-by-step guide to setting up enhanced e-commerce tracking in GA4 with custom events, data layers, and Looker Studio dashboards.',
    toc: [
      { id: 'auto-vs-custom-events', label: 'Auto vs Custom Events' },
      { id: 'data-layer-setup', label: 'Data Layer Setup' },
      { id: 'ecommerce-tracking', label: 'E-Commerce Tracking' },
      { id: 'debugging-with-gtm', label: 'Debugging with GTM Preview' },
      { id: 'looker-studio-dashboards', label: 'Looker Studio Dashboards' },
    ],
    content: (
      <>
        <P>
          Google Analytics 4 is fundamentally event-driven. Unlike Universal Analytics where pageviews were the core unit, GA4 treats every interaction as an event. This gives you enormous flexibility — but also means that poor event setup leads to poor data. Most GA4 implementations I audit are collecting the default automatically-tracked events but missing the custom events that actually drive business decisions.
        </P>
        <P>
          This guide covers the complete event tracking setup for e-commerce sites, from data layer configuration to debugging to building dashboards that surface actionable insights.
        </P>

        <H2 id="auto-vs-custom-events">Automatically Collected vs Custom Events</H2>
        <P>
          GA4 automatically collects certain events without any configuration: <Code>page_view</Code>, <Code>session_start</Code>, <Code>first_visit</Code>, <Code>user_engagement</Code>, and <Code>scroll</Code> (when enhanced measurement is enabled). These are useful but generic.
        </P>
        <P>
          <Strong>Enhanced measurement events</Strong> add scroll tracking, outbound clicks, site search, video engagement, and file downloads. Enable these in your GA4 data stream settings — they require no code changes.
        </P>
        <P>
          <Strong>Recommended events</Strong> are Google-defined events with specific parameter structures. For e-commerce, these include <Code>view_item</Code>, <Code>add_to_cart</Code>, <Code>begin_checkout</Code>, and <Code>purchase</Code>. Using Google&apos;s naming convention unlocks built-in e-commerce reports.
        </P>
        <P>
          <Strong>Custom events</Strong> are anything unique to your business: <Code>pricing_page_view</Code>, <Code>demo_request</Code>, <Code>feature_comparison</Code>, <Code>calculator_used</Code>. These are where the real insights live.
        </P>

        <BQ>
          &ldquo;The difference between a mediocre GA4 setup and a great one is not the tool — it&apos;s the 15-20 custom events that map precisely to your customer journey.&rdquo;
        </BQ>

        <H2 id="data-layer-setup">Data Layer Setup</H2>
        <P>
          The data layer is a JavaScript object that sits on your page and holds structured information for GTM to read. It is the bridge between your website&apos;s data and your tracking tags. Without a proper data layer, you end up scraping DOM elements — brittle, unreliable, and a maintenance nightmare.
        </P>
        <CodeBlock title="Data Layer Push - Product View">
{`// Push product data when a user views a product page
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
});`}
        </CodeBlock>
        <P>
          Every e-commerce event follows this same pattern: a <Code>dataLayer.push()</Code> with the event name and an <Code>ecommerce</Code> object containing currency, value, and an items array. Consistency is key. If your <Code>add_to_cart</Code> event uses <Code>product_id</Code> but your <Code>purchase</Code> event uses <Code>item_id</Code>, your funnel reports break.
        </P>

        <H2 id="ecommerce-tracking">E-Commerce Event Tracking</H2>
        <P>
          A complete e-commerce tracking setup covers the full purchase funnel. Here are the events you need, in order:
        </P>
        <OL>
          <LI ordered num={1}><Code>view_item_list</Code> — Category/collection pages. Include the list name and position of each product</LI>
          <LI ordered num={2}><Code>select_item</Code> — When a user clicks a product from a list</LI>
          <LI ordered num={3}><Code>view_item</Code> — Product detail page views. Include all product parameters</LI>
          <LI ordered num={4}><Code>add_to_cart</Code> — Fired when an item is added to cart. Include quantity and value</LI>
          <LI ordered num={5}><Code>view_cart</Code> — When the cart page or drawer is opened</LI>
          <LI ordered num={6}><Code>begin_checkout</Code> — First step of checkout process</LI>
          <LI ordered num={7}><Code>add_shipping_info</Code> — When shipping method is selected</LI>
          <LI ordered num={8}><Code>add_payment_info</Code> — When payment method is entered</LI>
          <LI ordered num={9}><Code>purchase</Code> — Transaction complete. Include transaction ID, revenue, tax, shipping</LI>
        </OL>
        <P>
          For each event, create a corresponding trigger in GTM that listens for the <Code>dataLayer.push()</Code> and a GA4 event tag that forwards the data. Use a single GA4 event tag with a variable-driven event name to keep your container clean.
        </P>

        <H2 id="debugging-with-gtm">Debugging with GTM Preview Mode</H2>
        <P>
          GTM&apos;s preview mode (Tag Assistant) is your best friend during implementation. Click &ldquo;Preview&rdquo; in your GTM workspace, enter your site URL, and a debug panel opens alongside your website.
        </P>
        <UL>
          <LI><Strong>Check data layer contents:</Strong> Click any event in the timeline and inspect the Data Layer tab to verify parameters</LI>
          <LI><Strong>Verify tag firing:</Strong> The Tags tab shows which tags fired (or failed) on each event</LI>
          <LI><Strong>Inspect variables:</Strong> See the resolved values of all your GTM variables at each event</LI>
          <LI><Strong>GA4 DebugView:</Strong> Enable debug mode in GA4 to see events arrive in real-time at Admin → DebugView</LI>
        </UL>
        <P>
          A common debugging pattern: push an <Code>add_to_cart</Code> event, check that the data layer contains the correct product data, verify the GTM trigger fires, confirm the GA4 tag sends the event, and then check GA4 DebugView to see it arrive with all parameters intact.
        </P>

        <H2 id="looker-studio-dashboards">Building Looker Studio Dashboards</H2>
        <P>
          Raw GA4 data becomes actionable only when it is visualized properly. Looker Studio (formerly Google Data Studio) connects directly to GA4 and lets you build dashboards that update automatically.
        </P>
        <P>
          For e-commerce, I recommend building three core dashboards:
        </P>
        <UL>
          <LI><Strong>Funnel Performance:</Strong> Visualization showing drop-off rates between each e-commerce step. Identify where users abandon the journey</LI>
          <LI><Strong>Product Performance:</Strong> Table showing each product&apos;s views, add-to-cart rate, and purchase conversion rate. Sort by revenue to find winners</LI>
          <LI><Strong>Acquisition ROI:</Strong> Blend GA4 data with Google Ads cost data to show true ROAS by campaign, ad group, and keyword</LI>
        </UL>
        <P>
          The key to effective dashboards is limiting them to the 5-7 metrics that actually drive decisions. If your team needs help with <A href="/services">analytics setup and dashboard design</A>, start with the questions you want answered and work backward to the data you need.
        </P>
      </>
    ),
  },

  'wordpress-speed-optimization-2026': {
    slug: 'wordpress-speed-optimization-2026',
    title: 'WordPress Speed Optimization: 98+ PageSpeed in 2026',
    category: 'WordPress',
    date: 'Mar 10, 2026',
    readTime: '11 min',
    excerpt: 'The exact steps I use to get 98+ PageSpeed scores on WordPress sites — from image optimization to server config to caching strategies.',
    toc: [
      { id: 'why-speed-matters', label: 'Why Speed Matters in 2026' },
      { id: 'image-optimization', label: 'Image Optimization' },
      { id: 'caching-and-cdn', label: 'Caching & CDN Setup' },
      { id: 'code-and-database', label: 'Code & Database Cleanup' },
      { id: 'core-web-vitals', label: 'Core Web Vitals Optimization' },
    ],
    content: (
      <>
        <P>
          A slow WordPress site is not just annoying — it is a measurable business problem. Google has confirmed that Core Web Vitals are a ranking factor, and their data shows that as page load time goes from 1 second to 3 seconds, the probability of bounce increases by 32%. For e-commerce sites, every 100ms of latency costs approximately 1% in revenue.
        </P>
        <P>
          I have optimized over 60 WordPress sites in the past two years. The process I describe below consistently achieves 95-99 PageSpeed scores on both mobile and desktop. It is not about installing one magic plugin — it is a systematic approach to eliminating every source of bloat.
        </P>

        <H2 id="why-speed-matters">Why Speed Matters More Than Ever in 2026</H2>
        <P>
          Google&apos;s March 2025 core update further increased the weight of Interaction to Next Paint (INP) as a ranking signal. INP replaced First Input Delay (FID) as the primary responsiveness metric, and it is significantly harder to pass. While FID measured only the first interaction, INP measures <em>every</em> interaction throughout the page session and reports the worst one.
        </P>
        <UL>
          <LI><Strong>SEO impact:</Strong> Pages failing Core Web Vitals are deprioritized in search results. This is not speculation — it is documented in Google Search Central</LI>
          <LI><Strong>Conversion impact:</Strong> Deloitte research shows a 0.1s improvement in mobile site speed increases conversion rates by 8.4% for retail and 10.1% for travel</LI>
          <LI><Strong>Ad Quality Score:</Strong> Landing page experience affects Google Ads Quality Score, which directly impacts your cost per click</LI>
        </UL>

        <BQ>
          &ldquo;After optimizing a client&apos;s WordPress site from a 42 to a 96 PageSpeed score, their organic traffic increased 23% within 6 weeks — without any content changes or new backlinks.&rdquo;
        </BQ>

        <H2 id="image-optimization">Image Optimization</H2>
        <P>
          Images are responsible for 50-70% of page weight on most WordPress sites. This is the single highest-impact optimization area.
        </P>
        <H3>Serve Next-Gen Formats</H3>
        <P>
          Convert all images to WebP or AVIF format. AVIF offers 30-50% smaller file sizes than WebP with comparable quality. Use a plugin like ShortPixel or Imagify that automatically converts uploads and serves the optimal format based on browser support.
        </P>
        <H3>Responsive Images</H3>
        <P>
          Never serve a 2000px image to a mobile device. WordPress generates multiple sizes by default, but you need to ensure your theme uses the <Code>srcset</Code> attribute correctly. Add custom image sizes for your layout breakpoints:
        </P>
        <CodeBlock title="functions.php">
{`// Add custom image sizes for responsive loading
add_image_size('hero-desktop', 1440, 600, true);
add_image_size('hero-tablet', 768, 400, true);
add_image_size('card-thumb', 400, 300, true);

// Enable WebP support
add_filter('upload_mimes', function($mimes) {
    $mimes['webp'] = 'image/webp';
    $mimes['avif'] = 'image/avif';
    return $mimes;
});`}
        </CodeBlock>
        <H3>Lazy Loading</H3>
        <P>
          WordPress includes native lazy loading via the <Code>loading=&quot;lazy&quot;</Code> attribute since version 5.5. However, you should <Strong>disable</Strong> lazy loading for above-the-fold images (your hero image, logo, first visible content image) to avoid hurting Largest Contentful Paint. Use the <Code>wp_img_tag_add_loading_optimization_attrs</Code> filter to control this precisely.
        </P>

        <H2 id="caching-and-cdn">Caching & CDN Setup</H2>
        <H3>Page Caching with WP Rocket</H3>
        <P>
          WP Rocket remains the best caching plugin for WordPress. Its key advantages over free alternatives like W3 Total Cache are simplicity, reliability, and features that actually work out of the box. Configure it with these settings:
        </P>
        <UL>
          <LI>Enable page caching and cache preloading</LI>
          <LI>Enable mobile-specific caching (serves separate cached pages for mobile)</LI>
          <LI>Set cache lifespan to 10 hours for content sites, 1 hour for sites with dynamic pricing</LI>
          <LI>Enable critical CSS generation — this alone typically improves LCP by 1-2 seconds</LI>
          <LI>Delay JavaScript execution to reduce INP. Exclude essential above-the-fold scripts</LI>
        </UL>
        <H3>CDN Configuration</H3>
        <P>
          Cloudflare&apos;s free tier is sufficient for most WordPress sites. Set up APO (Automatic Platform Optimization) at $5/month for WordPress-specific caching at the edge. This caches full HTML pages at Cloudflare&apos;s 300+ edge locations and serves them in under 50ms globally.
        </P>

        <H2 id="code-and-database">Code & Database Cleanup</H2>
        <P>
          Plugin bloat is the silent killer of WordPress performance. Most sites have 3-5 plugins that load CSS and JS on every page even though they are only needed on specific pages.
        </P>
        <UL>
          <LI><Strong>Audit your plugins:</Strong> Deactivate each plugin one by one and test page speed. You will often find one plugin adding 500ms-1s of load time</LI>
          <LI><Strong>Conditional loading:</Strong> Use Asset CleanUp Pro or Perfmatters to disable plugin assets on pages where they are not needed. Contact Form 7 scripts do not need to load on your blog posts</LI>
          <LI><Strong>Database cleanup:</Strong> Delete post revisions, trashed items, spam comments, and transients. WP-Optimize automates this on a schedule</LI>
          <LI><Strong>Minimize render-blocking CSS:</Strong> Inline critical CSS and defer non-critical stylesheets. WP Rocket handles this automatically</LI>
        </UL>

        <H2 id="core-web-vitals">Core Web Vitals Optimization</H2>
        <P>
          The three Core Web Vitals are LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift). Here is how to pass all three:
        </P>
        <OL>
          <LI ordered num={1}><Strong>LCP under 2.5s:</Strong> Preload your hero image with <Code>&lt;link rel=&quot;preload&quot;&gt;</Code>. Use font-display: swap for web fonts. Ensure your server TTFB is under 200ms</LI>
          <LI ordered num={2}><Strong>INP under 200ms:</Strong> Defer non-critical JavaScript. Break up long tasks (anything over 50ms). Avoid layout thrashing from DOM reads/writes in event handlers</LI>
          <LI ordered num={3}><Strong>CLS under 0.1:</Strong> Set explicit width and height on all images and iframes. Avoid inserting content above existing content. Reserve space for ads and embeds</LI>
        </OL>
        <P>
          If your WordPress site is underperforming and you need help with <A href="/services">speed optimization</A>, the combination of proper image handling, caching, and code cleanup will transform your user experience and search rankings.
        </P>
      </>
    ),
  },

  'martech-stack-audit-guide': {
    slug: 'martech-stack-audit-guide',
    title: 'How to Audit Your MarTech Stack (and Stop Wasting Money)',
    category: 'MarTech',
    date: 'Mar 6, 2026',
    readTime: '8 min',
    excerpt: 'Most companies waste 30-50% of their martech budget on overlapping tools. Here is my framework for a lean, high-performance stack.',
    toc: [
      { id: 'audit-framework', label: 'The Audit Framework' },
      { id: 'map-data-flow', label: 'Mapping Data Flow' },
      { id: 'common-mistakes', label: 'Common Mistakes' },
      { id: 'recommended-stack', label: 'Recommended Stack for SMBs' },
      { id: 'calculating-roi', label: 'Calculating Stack ROI' },
    ],
    content: (
      <>
        <P>
          The average company uses 91 marketing technology tools. Not a typo — 91. According to Gartner&apos;s 2025 Marketing Technology Survey, organizations utilize less than 42% of their martech stack&apos;s capabilities. That means more than half the features you are paying for go unused, while the tools you do use often duplicate each other&apos;s functionality.
        </P>
        <P>
          I have audited martech stacks for companies ranging from 5-person startups to enterprises with 200+ employees. The pattern is remarkably consistent: too many tools, poor integration between them, and no clear understanding of which tools actually drive results. Here is the framework I use to fix it.
        </P>

        <H2 id="audit-framework">The Four-Step Audit Framework</H2>
        <P>
          A martech audit is not about cutting costs for the sake of cutting costs. It is about building a stack where every tool earns its place, data flows cleanly between systems, and your team can actually use everything effectively.
        </P>
        <OL>
          <LI ordered num={1}><Strong>Inventory everything:</Strong> List every tool, its cost, who uses it, what it does, and when it was last actively used. You will almost certainly discover tools people forgot they were paying for</LI>
          <LI ordered num={2}><Strong>Map data flow:</Strong> Document how data moves between tools. Where does lead data originate? How does it get to the CRM? Do conversion events from your website reach your ad platforms? Drawing this map exposes broken connections and redundant paths</LI>
          <LI ordered num={3}><Strong>Identify overlaps:</Strong> Highlight tools that serve the same function. Do you have both Mailchimp and HubSpot sending emails? Are you running Google Analytics and Mixpanel and Amplitude? Consolidate</LI>
          <LI ordered num={4}><Strong>Calculate per-tool ROI:</Strong> For each tool, estimate the revenue or time savings it generates versus its total cost (subscription + implementation time + maintenance). Kill anything with negative ROI</LI>
        </OL>

        <H2 id="map-data-flow">Mapping Your Data Flow</H2>
        <P>
          This is the most revealing step and the one most companies skip. Create a visual diagram showing every data connection between your tools. Here is a simplified example:
        </P>
        <CodeBlock title="Example Data Flow Map">
{`Website (GTM)
  ├── GA4 (analytics)
  ├── Meta CAPI (ad tracking)
  ├── Google Ads (conversion tracking)
  └── CRM (HubSpot)
        ├── Email Platform (HubSpot built-in)
        ├── Slack (notifications via n8n)
        ├── Invoicing (Stripe)
        └── Reporting (Looker Studio via BigQuery)

Data Issues Found:
  ✗ Meta Pixel duplicating CAPI events (no deduplication)
  ✗ CRM not receiving offline conversions from sales team
  ✗ Email segments based on stale data (no real-time sync)
  ✓ GA4 → BigQuery export working correctly`}
        </CodeBlock>
        <P>
          When you draw this map, you discover gaps. Maybe your CRM has customer data that never makes it to your email segmentation. Maybe your ad platforms are getting duplicate conversions because both client-side and server-side tracking fire without deduplication. These are the issues that silently degrade your marketing performance.
        </P>

        <BQ>
          &ldquo;A lean martech stack with great integrations will always outperform a bloated stack with siloed data. The tools are not the strategy — the connections between them are.&rdquo;
        </BQ>

        <H2 id="common-mistakes">Common Mistakes I See in Every Audit</H2>
        <UL>
          <LI><Strong>Paying for enterprise tiers you do not need:</Strong> Most SMBs do not need HubSpot Enterprise at $3,600/month when Professional at $800/month covers 95% of their needs</LI>
          <LI><Strong>Duplicate functionality:</Strong> Running separate tools for email, landing pages, and forms when your CRM does all three</LI>
          <LI><Strong>No single source of truth:</Strong> Customer data lives in 5+ places with no sync, leading to inconsistent segments and personalization</LI>
          <LI><Strong>Shiny object syndrome:</Strong> Adding tools because they are trending rather than because they solve a specific problem</LI>
          <LI><Strong>No deprecation process:</Strong> Tools get added but never removed. The average company has 3-5 tools that nobody actively uses but still pay for</LI>
        </UL>

        <H2 id="recommended-stack">Recommended MarTech Stack for SMBs</H2>
        <P>
          For small to mid-size businesses spending $5K-$50K/month on marketing, here is the stack I recommend. Total cost: approximately $300-800/month depending on scale.
        </P>
        <UL>
          <LI><Strong>Analytics:</Strong> GA4 (free) + Looker Studio (free) + BigQuery (near-free for most volumes)</LI>
          <LI><Strong>Tag Management:</Strong> GTM web + GTM server container ($50-150/month hosting)</LI>
          <LI><Strong>CRM:</Strong> HubSpot Starter or Professional — covers CRM, email, forms, and landing pages</LI>
          <LI><Strong>Automation:</Strong> n8n self-hosted ($10-20/month) for everything Zapier charges $300+/month for</LI>
          <LI><Strong>Advertising:</Strong> Google Ads + Meta Ads with server-side conversion tracking</LI>
          <LI><Strong>SEO:</Strong> Ahrefs or Semrush (one, not both) + Screaming Frog (free version)</LI>
          <LI><Strong>Website:</Strong> WordPress with WP Rocket + Cloudflare, or Next.js for performance-critical sites</LI>
        </UL>

        <H2 id="calculating-roi">Calculating Stack ROI</H2>
        <P>
          For each tool, use this simple formula:
        </P>
        <CodeBlock title="MarTech ROI Formula">
{`Tool ROI = (Revenue Attributed + Time Saved × Hourly Rate)
           ÷ (Subscription + Setup + Maintenance Hours × Rate)

Example: HubSpot Professional
  Revenue attributed: $45,000/year (from email campaigns)
  Time saved: 10 hrs/week × $50/hr = $26,000/year
  Cost: $9,600/year (subscription) + $2,400 (maintenance)
  ROI: ($45,000 + $26,000) / $12,000 = 5.9x ✓ KEEP

Example: Unused A/B Testing Tool
  Revenue attributed: $0
  Time saved: 0 hours (nobody uses it)
  Cost: $2,400/year
  ROI: 0x ✗ CANCEL`}
        </CodeBlock>
        <P>
          If you need help running a thorough <A href="/services">martech stack audit</A>, the process typically takes 1-2 weeks and reveals $500-5,000/month in potential savings while improving data quality.
        </P>
      </>
    ),
  },

  'seo-content-clusters-strategy': {
    slug: 'seo-content-clusters-strategy',
    title: 'Content Clusters: The SEO Strategy That Tripled Our Traffic',
    category: 'SEO',
    date: 'Mar 2, 2026',
    readTime: '10 min',
    excerpt: 'How we used topic clusters and pillar pages to grow a B2B blog from 800 to 42,000 monthly organic visitors in 12 months.',
    toc: [
      { id: 'what-are-topic-clusters', label: 'What Are Topic Clusters?' },
      { id: 'building-pillar-pages', label: 'Building Pillar Pages' },
      { id: 'internal-linking-strategy', label: 'Internal Linking Strategy' },
      { id: 'keyword-mapping', label: 'Keyword Mapping Process' },
      { id: 'case-study-results', label: 'Case Study: 800 → 42K' },
    ],
    content: (
      <>
        <P>
          In early 2025, a B2B SaaS client came to me with a blog that had been publishing articles for two years with almost nothing to show for it. They had 87 blog posts, 800 monthly organic visitors, and zero posts ranking on page one for any meaningful keyword. The content was decent — but it was completely unstructured. Each article existed in isolation, targeting random keywords with no strategic connection between them.
        </P>
        <P>
          Twelve months later, that same blog was generating 42,000 monthly organic visitors, ranking for 2,400+ keywords, and driving 35% of the company&apos;s qualified leads. The strategy? Topic clusters. No link building campaigns, no technical SEO tricks — just a methodical restructuring of content around carefully chosen topic clusters.
        </P>

        <H2 id="what-are-topic-clusters">What Are Topic Clusters?</H2>
        <P>
          A topic cluster is a group of interlinked content pieces organized around a central theme. At the center is a <Strong>pillar page</Strong> — a comprehensive, long-form piece (typically 3,000-5,000 words) that broadly covers the topic. Surrounding it are <Strong>cluster articles</Strong> — shorter, focused pieces (1,000-2,000 words each) that dive deep into specific subtopics.
        </P>
        <P>
          The pillar page links to every cluster article. Every cluster article links back to the pillar page and to relevant sibling articles. This creates a dense internal linking structure that signals to Google: &ldquo;This website has comprehensive, authoritative coverage of this topic.&rdquo;
        </P>
        <UL>
          <LI><Strong>Pillar page:</Strong> &ldquo;The Complete Guide to Email Marketing&rdquo; (broad, 4,000 words)</LI>
          <LI><Strong>Cluster article:</Strong> &ldquo;How to Write Subject Lines That Get Opened&rdquo; (specific, 1,500 words)</LI>
          <LI><Strong>Cluster article:</Strong> &ldquo;Email Segmentation Strategies for E-Commerce&rdquo; (specific, 1,200 words)</LI>
          <LI><Strong>Cluster article:</Strong> &ldquo;A/B Testing Your Email Campaigns: A Beginner&apos;s Guide&rdquo; (specific, 1,300 words)</LI>
          <LI><Strong>Cluster article:</Strong> &ldquo;Email Deliverability: How to Stay Out of Spam&rdquo; (specific, 1,800 words)</LI>
        </UL>

        <BQ>
          &ldquo;Google does not rank pages — it ranks entities. A topic cluster transforms your website from a collection of random pages into a recognized authority on a specific subject.&rdquo;
        </BQ>

        <H2 id="building-pillar-pages">Building Pillar Pages That Rank</H2>
        <P>
          A pillar page is not just a long article. It is structurally designed to rank for high-volume, competitive head terms while serving as the hub for all related content. Here is how I build them:
        </P>
        <OL>
          <LI ordered num={1}><Strong>Target a high-volume head term:</Strong> Choose a keyword with 2,000+ monthly searches that your cluster articles will support. Example: &ldquo;email marketing guide&rdquo;</LI>
          <LI ordered num={2}><Strong>Cover the topic broadly:</Strong> Include a section for every subtopic your cluster articles will detail. Each section is 200-400 words — enough to be useful but short enough to create demand for the deeper cluster article</LI>
          <LI ordered num={3}><Strong>Use clear heading hierarchy:</Strong> Every H2 on the pillar page should map to a cluster article. This makes the linking structure natural and the content scannable</LI>
          <LI ordered num={4}><Strong>Add a table of contents:</Strong> Linked TOC at the top improves UX and increases the chance of Google showing sitelinks in search results</LI>
          <LI ordered num={5}><Strong>Include original data or frameworks:</Strong> Unique insights, proprietary data, or custom frameworks make your pillar page citable and link-worthy</LI>
        </OL>

        <H2 id="internal-linking-strategy">Internal Linking Strategy</H2>
        <P>
          The internal linking structure is what transforms individual articles into a topic cluster. Without proper linking, you just have a collection of related articles — not a cluster.
        </P>
        <CodeBlock title="Cluster Linking Structure">
{`PILLAR: /blog/email-marketing-guide
  ↕ links to all cluster articles

CLUSTER: /blog/email-subject-lines
  → links to PILLAR
  → links to /blog/email-ab-testing (sibling)

CLUSTER: /blog/email-segmentation
  → links to PILLAR
  → links to /blog/email-deliverability (sibling)
  → links to /blog/email-subject-lines (sibling)

CLUSTER: /blog/email-ab-testing
  → links to PILLAR
  → links to /blog/email-subject-lines (sibling)

CLUSTER: /blog/email-deliverability
  → links to PILLAR
  → links to /blog/email-segmentation (sibling)

Rules:
  ✓ Every cluster links to pillar (mandatory)
  ✓ Pillar links to every cluster (mandatory)
  ✓ Clusters link to 2-3 siblings (recommended)
  ✓ Use descriptive anchor text (not "click here")
  ✗ Don't over-link (max 3-5 internal links per 1000 words)`}
        </CodeBlock>

        <H2 id="keyword-mapping">Keyword Mapping Process</H2>
        <P>
          Before writing a single word, I map out the entire cluster&apos;s keyword strategy. This prevents content cannibalization (multiple pages competing for the same keyword) and ensures complete topic coverage.
        </P>
        <OL>
          <LI ordered num={1}><Strong>Start with the head term:</Strong> Use Ahrefs or Semrush to find a broad keyword with high volume and manageable difficulty</LI>
          <LI ordered num={2}><Strong>Extract subtopics:</Strong> Look at &ldquo;Questions&rdquo; in keyword research, &ldquo;People Also Ask&rdquo; in Google results, and the top-ranking pillar pages&apos; subheadings</LI>
          <LI ordered num={3}><Strong>Assign one primary keyword per article:</Strong> No two articles in the cluster should target the same primary keyword. Each article owns its keyword</LI>
          <LI ordered num={4}><Strong>Identify secondary keywords:</Strong> Each article targets 3-5 secondary keywords that are semantically related to its primary keyword</LI>
          <LI ordered num={5}><Strong>Validate search intent:</Strong> Check the SERPs for each keyword. If the top results are product pages, a blog post will not rank there. Choose informational keywords for blog content</LI>
        </OL>

        <H2 id="case-study-results">Case Study: 800 to 42,000 Monthly Visitors</H2>
        <P>
          For the B2B SaaS client, we built 5 topic clusters over 12 months. Here are the specifics:
        </P>
        <UL>
          <LI><Strong>Cluster 1 — &ldquo;Project Management&rdquo;:</Strong> 1 pillar + 8 cluster articles. Went from 0 to 14,000 monthly organic visits</LI>
          <LI><Strong>Cluster 2 — &ldquo;Remote Team Collaboration&rdquo;:</Strong> 1 pillar + 6 cluster articles. Drove 9,500 monthly visits</LI>
          <LI><Strong>Cluster 3 — &ldquo;Agile Methodology&rdquo;:</Strong> 1 pillar + 7 cluster articles. Generated 8,200 monthly visits</LI>
          <LI><Strong>Clusters 4 & 5:</Strong> Smaller clusters targeting long-tail terms, contributing 10,300 combined monthly visits</LI>
        </UL>
        <P>
          Total investment: 47 articles over 12 months (roughly 1 per week). Total cost: approximately $28,000 in content production. Revenue generated from organic leads in the first year: $340,000. That is a 12x return on investment.
        </P>
        <P>
          If you are looking to implement a <A href="/services">content cluster SEO strategy</A>, the critical success factor is patience and consistency. Clusters take 3-6 months to start ranking. But once they do, the compounding effect of topical authority makes each new article rank faster and higher than the last.
        </P>
      </>
    ),
  },

  'google-ads-roas-optimization': {
    slug: 'google-ads-roas-optimization',
    title: 'How I Achieved 5.2x ROAS on Google Ads for a Fintech Client',
    category: 'Strategy',
    date: 'Feb 26, 2026',
    readTime: '13 min',
    excerpt: 'A detailed breakdown of the campaign structure, bidding strategy, and creative testing that took ROAS from 2.1x to 5.2x.',
    toc: [
      { id: 'starting-point', label: 'The Starting Point: 2.1x ROAS' },
      { id: 'campaign-structure', label: 'Campaign Structure: Alpha/Beta/Gamma' },
      { id: 'bidding-and-audiences', label: 'Bidding & Audience Segmentation' },
      { id: 'creative-testing', label: 'Ad Creative Testing Framework' },
      { id: 'results-breakdown', label: 'Results: The Path to 5.2x' },
    ],
    content: (
      <>
        <P>
          In Q3 2025, a fintech client approached me with a Google Ads account that was &ldquo;working but not great.&rdquo; They were spending $42,000/month on search and Performance Max campaigns, generating about $88,000 in attributed revenue — a 2.1x ROAS. Not terrible, but not enough to justify scaling. Their board wanted 4x ROAS before approving a budget increase.
        </P>
        <P>
          Over the following 16 weeks, we restructured the account, implemented proper conversion tracking, rebuilt the audience strategy, and ran systematic creative tests. The result: 5.2x ROAS on $65,000/month spend — $338,000 in monthly revenue from Google Ads alone. Here is exactly how we did it.
        </P>

        <H2 id="starting-point">The Starting Point: Diagnosing the 2.1x Account</H2>
        <P>
          Before changing anything, I audited the existing account. The issues were common but severe:
        </P>
        <UL>
          <LI><Strong>No negative keywords:</Strong> The account was bleeding money on irrelevant search terms. &ldquo;Free fintech courses,&rdquo; &ldquo;fintech jobs,&rdquo; and competitor names were consuming 23% of the budget</LI>
          <LI><Strong>Single campaign structure:</Strong> All keywords lived in one campaign with one ad group. High-intent terms competed with awareness terms for the same budget</LI>
          <LI><Strong>Broken conversion tracking:</Strong> The primary conversion action counted page views instead of actual sign-ups. The algorithm was optimizing for the wrong goal</LI>
          <LI><Strong>No audience signals:</Strong> Performance Max campaigns had zero audience signals, so Google was targeting broadly with no guidance</LI>
        </UL>

        <BQ>
          &ldquo;The most common reason for poor Google Ads performance is not bid strategy or budget — it is that the algorithm is optimizing for the wrong conversion action. Fix tracking first, always.&rdquo;
        </BQ>

        <H2 id="campaign-structure">Campaign Structure: Alpha/Beta/Gamma</H2>
        <P>
          I restructured the account using the Alpha/Beta/Gamma framework, which segments campaigns by keyword intent and match type:
        </P>
        <H3>Alpha Campaigns (Highest Intent)</H3>
        <P>
          Exact match keywords with proven conversion history. These are your most profitable terms — the ones where search intent perfectly matches your offer. Bid aggressively, allocate 50-60% of budget here.
        </P>
        <H3>Beta Campaigns (Testing Ground)</H3>
        <P>
          Phrase match campaigns that discover new converting search terms. When a Beta keyword proves itself (3+ conversions at target CPA), it graduates to an Alpha campaign as an exact match keyword.
        </P>
        <H3>Gamma Campaigns (Discovery)</H3>
        <P>
          Broad match + Smart Bidding campaigns that cast a wide net. Budget is limited (10-15%) but these campaigns consistently discover search terms you would never think of manually.
        </P>
        <CodeBlock title="Campaign Structure Example">
{`Account: Fintech Client
├── [Alpha] Brand Terms (Exact Match)
│   Budget: $8,000/mo | ROAS: 12.4x
│   Keywords: [fintech app name], [brand + feature]
│
├── [Alpha] High-Intent (Exact Match)
│   Budget: $25,000/mo | ROAS: 6.1x
│   Keywords: [best fintech app for invoicing],
│             [small business payment processing]
│
├── [Beta] Mid-Intent (Phrase Match)
│   Budget: $18,000/mo | ROAS: 4.2x
│   Keywords: "fintech invoicing", "payment app business"
│
├── [Gamma] Discovery (Broad Match)
│   Budget: $7,000/mo | ROAS: 2.8x
│   Keywords: fintech solutions, business payments
│
└── [PMax] Performance Max
    Budget: $7,000/mo | ROAS: 3.5x
    Audience signals: customer lists, in-market segments`}
        </CodeBlock>

        <H2 id="bidding-and-audiences">Bidding & Audience Segmentation</H2>
        <P>
          We switched from Maximize Clicks (which the previous manager was using) to Target ROAS bidding. But Target ROAS only works when your conversion data is accurate and sufficient — at least 30 conversions in the past 30 days per campaign.
        </P>
        <P>
          For audience segmentation, we built four key audiences:
        </P>
        <OL>
          <LI ordered num={1}><Strong>Customer Match:</Strong> Uploaded the existing customer list (hashed emails) for exclusion and lookalike targeting</LI>
          <LI ordered num={2}><Strong>Website visitors:</Strong> Segmented by behavior — pricing page visitors (hot), blog readers (warm), homepage bouncers (cold)</LI>
          <LI ordered num={3}><Strong>In-market segments:</Strong> Google&apos;s in-market audiences for financial services, business software, and accounting</LI>
          <LI ordered num={4}><Strong>Custom intent:</Strong> Built from competitor URLs and high-intent search terms</LI>
        </OL>
        <P>
          The critical move was using audience <Strong>bid adjustments</Strong> rather than audience <Strong>targeting</Strong>. We kept campaigns open to all searchers but bid 30% higher on users who were also in our high-intent audiences. This let the algorithm find new customers while prioritizing known high-value segments.
        </P>

        <H2 id="creative-testing">Ad Creative Testing Framework</H2>
        <P>
          We ran structured A/B tests on ad creative, changing one element at a time:
        </P>
        <UL>
          <LI><Strong>Headlines:</Strong> Tested benefit-driven vs. feature-driven vs. social proof headlines. Winner: social proof (&ldquo;Trusted by 12,000+ Businesses&rdquo;) improved CTR by 34%</LI>
          <LI><Strong>Descriptions:</Strong> Tested urgency vs. value proposition vs. objection handling. Winner: objection handling (&ldquo;No setup fees. No contracts. Cancel anytime.&rdquo;) reduced CPA by 18%</LI>
          <LI><Strong>Landing pages:</Strong> Tested long-form vs. short-form vs. video-led pages. Winner: short-form with embedded demo video improved conversion rate from 3.2% to 5.7%</LI>
        </UL>

        <H2 id="results-breakdown">Results: The Path to 5.2x ROAS</H2>
        <P>
          The improvements compounded over 16 weeks:
        </P>
        <OL>
          <LI ordered num={1}><Strong>Weeks 1-4:</Strong> Fixed conversion tracking and added negative keywords. ROAS jumped from 2.1x to 3.1x simply by eliminating waste</LI>
          <LI ordered num={2}><Strong>Weeks 5-8:</Strong> Restructured campaigns into Alpha/Beta/Gamma. ROAS reached 3.8x as budget shifted to highest-performing terms</LI>
          <LI ordered num={3}><Strong>Weeks 9-12:</Strong> Implemented audience segmentation and bid adjustments. ROAS hit 4.5x</LI>
          <LI ordered num={4}><Strong>Weeks 13-16:</Strong> Creative testing wins compounded. Final ROAS: 5.2x on $65,000/month spend</LI>
        </OL>
        <P>
          The key lesson: most Google Ads accounts do not need more budget — they need better structure and accurate data. If you are struggling with <A href="/services">Google Ads ROAS</A>, start with an account audit before changing anything else.
        </P>
      </>
    ),
  },

  'email-automation-lead-nurturing': {
    slug: 'email-automation-lead-nurturing',
    title: 'Email Automation: 7 Lead Nurturing Sequences That Convert',
    category: 'Automation',
    date: 'Feb 20, 2026',
    readTime: '10 min',
    excerpt: 'These 7 email sequences have generated millions in pipeline value for my clients. Templates and logic flows included.',
    toc: [
      { id: 'why-sequences-matter', label: 'Why Sequences Matter' },
      { id: 'welcome-and-nurture', label: 'Welcome & Nurture Sequences' },
      { id: 'conversion-sequences', label: 'Conversion Sequences' },
      { id: 'retention-sequences', label: 'Retention & Upsell Sequences' },
      { id: 'timing-and-optimization', label: 'Timing & Optimization' },
    ],
    content: (
      <>
        <P>
          Most businesses collect leads and then do one of two things: immediately send a sales pitch, or do nothing at all. Both approaches leave money on the table. Research from DemandGen shows that nurtured leads produce a 20% increase in sales opportunities compared to non-nurtured leads, and they make 47% larger purchases.
        </P>
        <P>
          Email automation sequences solve this by delivering the right message at the right time based on where each lead is in their journey. I have built and optimized these seven sequences for dozens of clients across SaaS, e-commerce, professional services, and education. They work.
        </P>

        <H2 id="why-sequences-matter">Why Automated Sequences Beat Manual Follow-Up</H2>
        <P>
          A sales rep can follow up with maybe 10-20 leads per day with personalized emails. An automated sequence nurtures thousands simultaneously, never forgets a follow-up, and sends at statistically optimal times. The key is that automation does not mean generic — with proper segmentation and dynamic content, automated emails can be as personalized as manually written ones.
        </P>

        <BQ>
          &ldquo;The goal of email nurturing is not to sell. It is to build enough trust and demonstrate enough value that when the lead is ready to buy, you are the obvious choice.&rdquo;
        </BQ>

        <H2 id="welcome-and-nurture">1. Welcome Sequence & 2. Nurture Sequence</H2>

        <H3>Welcome Sequence (3-5 Emails, Days 0-7)</H3>
        <P>
          Triggered immediately when someone subscribes, downloads a lead magnet, or creates a free account. The welcome sequence has the highest open rates of any email type — typically 50-60%. Use this window to set expectations and deliver immediate value.
        </P>
        <UL>
          <LI><Strong>Email 1 (Immediate):</Strong> Deliver the promised resource. Introduce yourself. Set expectations for future emails</LI>
          <LI><Strong>Email 2 (Day 1):</Strong> Share your most popular piece of content. Establish expertise</LI>
          <LI><Strong>Email 3 (Day 3):</Strong> Tell your origin story or share a case study. Build connection</LI>
          <LI><Strong>Email 4 (Day 5):</Strong> Address the #1 objection or pain point. Provide a framework or tool</LI>
          <LI><Strong>Email 5 (Day 7):</Strong> Soft CTA — invite to book a call, start a trial, or join a community</LI>
        </UL>

        <H3>Nurture Sequence (Ongoing, Weekly/Bi-Weekly)</H3>
        <P>
          After the welcome sequence ends, leads who have not converted enter the nurture sequence. This is a longer, ongoing series that maintains mindshare and builds authority. Content includes industry insights, how-to guides, case studies, and curated resources. Keep the sales pitch to a maximum of 1 in 5 emails.
        </P>

        <H2 id="conversion-sequences">3. Abandoned Cart, 4. Re-Engagement, 5. Onboarding</H2>

        <H3>Abandoned Cart Sequence (3 Emails, Hours 1-72)</H3>
        <P>
          For e-commerce businesses, abandoned cart emails recover 5-15% of lost revenue. The timing is critical:
        </P>
        <CodeBlock title="Abandoned Cart Sequence Timing">
{`Email 1: 1 hour after abandonment
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

Expected recovery rate: 8-12% of abandoned carts`}
        </CodeBlock>

        <H3>Re-Engagement Sequence (3 Emails Over 2 Weeks)</H3>
        <P>
          Targets subscribers who have not opened an email in 60-90 days. The sequence tries to re-activate them. If they still do not engage after the third email, they are automatically removed from your list. This protects your sender reputation and deliverability.
        </P>
        <UL>
          <LI><Strong>Email 1:</Strong> &ldquo;We miss you&rdquo; — highlight what they have been missing</LI>
          <LI><Strong>Email 2:</Strong> Offer something exclusive — a free resource, a discount, or early access</LI>
          <LI><Strong>Email 3:</Strong> &ldquo;Should we remove you?&rdquo; — the breakup email. This counterintuitively gets the highest engagement of the three</LI>
        </UL>

        <H3>Onboarding Sequence (5-7 Emails Over 14 Days)</H3>
        <P>
          For SaaS and service businesses, onboarding emails reduce churn by guiding new customers to their first &ldquo;aha moment.&rdquo; Each email focuses on one specific action: set up your profile, complete your first project, invite a team member. Do not overwhelm — one action per email.
        </P>

        <H2 id="retention-sequences">6. Upsell Sequence & 7. Review Request</H2>

        <H3>Upsell/Cross-Sell Sequence (2-3 Emails)</H3>
        <P>
          Triggered when a customer reaches a specific milestone: 30 days after purchase, hitting a usage limit, or completing an onboarding phase. The key is timing the upsell when the customer has experienced enough value to want more — never before.
        </P>

        <H3>Review Request Sequence (2 Emails)</H3>
        <P>
          Sent 7-14 days after purchase or project completion. First email asks for a rating. If positive (4-5 stars), the second email asks them to post on Google, G2, or Trustpilot with a direct link. If negative, it routes to customer support. This protects your public reputation while still collecting honest feedback.
        </P>

        <H2 id="timing-and-optimization">Timing & Optimization Best Practices</H2>
        <UL>
          <LI><Strong>Send times:</Strong> Tuesday-Thursday, 10 AM or 2 PM in the recipient&apos;s timezone. But test this — some audiences respond better at 7 AM or 8 PM</LI>
          <LI><Strong>Subject lines:</Strong> Keep under 50 characters. Personalization (using their name or company) increases open rates by 22%</LI>
          <LI><Strong>From name:</Strong> Use a person&apos;s name, not a company name. &ldquo;Sabbir from [Company]&rdquo; outperforms &ldquo;[Company] Team&rdquo;</LI>
          <LI><Strong>Unsubscribe rate:</Strong> If any email in a sequence has an unsubscribe rate above 0.5%, rewrite it immediately</LI>
          <LI><Strong>A/B test continuously:</Strong> Test subject lines on every send. The winner becomes the default, the loser gets replaced</LI>
        </UL>
        <P>
          Building effective <A href="/services">email automation sequences</A> is one of the highest-ROI marketing investments you can make. Once built, they run indefinitely, nurturing every lead through your funnel while you focus on strategy and growth.
        </P>
      </>
    ),
  },

  'meta-conversions-api-setup': {
    slug: 'meta-conversions-api-setup',
    title: 'Meta Conversions API: Why You Need It and How to Set It Up',
    category: 'Tracking',
    date: 'Feb 15, 2026',
    readTime: '8 min',
    excerpt: 'Meta Pixel alone misses 20-30% of conversions. Here is how to implement the Conversions API for accurate Facebook & Instagram ad tracking.',
    toc: [
      { id: 'why-pixel-alone-fails', label: 'Why Pixel Alone Fails' },
      { id: 'how-capi-works', label: 'How the Conversions API Works' },
      { id: 'setup-via-gtm-server', label: 'Setup via GTM Server Container' },
      { id: 'event-matching-deduplication', label: 'Event Matching & Deduplication' },
      { id: 'testing-and-validation', label: 'Testing & Validation' },
    ],
    content: (
      <>
        <P>
          If you are running Facebook or Instagram ads in 2026 and relying solely on the Meta Pixel for conversion tracking, you are flying blind. Between ad blockers, iOS App Tracking Transparency, and browser privacy features, the pixel misses 20-35% of conversion events. This means Meta&apos;s ad algorithm is optimizing on incomplete data, your reported ROAS is understated, and your audience signals are degraded.
        </P>
        <P>
          The Meta Conversions API (CAPI) solves this by sending conversion data directly from your server to Meta&apos;s servers, bypassing the browser entirely. When used alongside the pixel (the recommended approach), you get near-complete conversion coverage and significantly better ad performance.
        </P>

        <H2 id="why-pixel-alone-fails">Why the Meta Pixel Alone Is No Longer Enough</H2>
        <P>
          The Meta Pixel is a JavaScript snippet that runs in the visitor&apos;s browser. It was designed for a world where browsers freely allowed third-party scripts to track user behavior across the web. That world no longer exists.
        </P>
        <OL>
          <LI ordered num={1}><Strong>Ad blockers:</Strong> 42% of desktop users run ad blockers that specifically target <Code>connect.facebook.net</Code>. The pixel never loads, never fires, and the conversion is invisible</LI>
          <LI ordered num={2}><Strong>iOS ATT:</Strong> When users opt out of tracking on iOS (over 80% do), the pixel&apos;s ability to attribute conversions back to ad clicks is severely limited</LI>
          <LI ordered num={3}><Strong>Safari ITP:</Strong> Limits first-party cookies set by JavaScript to 7 days. A user who clicks your ad on Monday and converts on the following Tuesday may not be attributed</LI>
          <LI ordered num={4}><Strong>Browser privacy modes:</Strong> Firefox Enhanced Tracking Protection and Brave&apos;s shields block Meta Pixel requests by default</LI>
        </OL>
        <P>
          The cumulative effect is devastating for advertisers. If Meta&apos;s algorithm only sees 65-70% of your conversions, it makes suboptimal bidding decisions. You end up paying more for worse results, and your reported metrics do not reflect reality.
        </P>

        <BQ>
          &ldquo;After implementing the Conversions API for a client spending $25K/month on Meta Ads, reported conversions increased by 28% and CPA decreased by 19% — same campaigns, same creative, just better data.&rdquo;
        </BQ>

        <H2 id="how-capi-works">How the Conversions API Works</H2>
        <P>
          The Conversions API is a server-to-server integration. Instead of the browser sending events to Meta, your server does. The flow looks like this:
        </P>
        <UL>
          <LI>User visits your website and performs an action (view content, add to cart, purchase)</LI>
          <LI>Your website sends the event to your server (via GTM server container, backend code, or a platform integration)</LI>
          <LI>Your server sends the event data to Meta&apos;s Conversions API endpoint, including user parameters for matching</LI>
          <LI>Meta matches the server event to the user who clicked the ad, attributing the conversion</LI>
        </UL>
        <P>
          The critical advantage: because the data travels server-to-server, ad blockers cannot intercept it. Browser privacy features do not apply. The data arrives reliably every time.
        </P>

        <H2 id="setup-via-gtm-server">Setup via GTM Server Container</H2>
        <P>
          The most flexible and maintainable way to implement CAPI is through a GTM server-side container. If you have already set up <A href="/blog/server-side-tracking-complete-guide">server-side tracking</A>, adding Meta CAPI is straightforward.
        </P>
        <OL>
          <LI ordered num={1}><Strong>Generate an access token:</Strong> In Meta Events Manager, go to Settings → Conversions API → Generate Access Token. Store this securely</LI>
          <LI ordered num={2}><Strong>Install the Meta CAPI tag template:</Strong> In your GTM server container, add the Facebook Conversions API tag from the Community Template Gallery</LI>
          <LI ordered num={3}><Strong>Configure event mapping:</Strong> Map your GA4 events to Meta events. <Code>page_view</Code> → <Code>PageView</Code>, <Code>add_to_cart</Code> → <Code>AddToCart</Code>, <Code>purchase</Code> → <Code>Purchase</Code></LI>
          <LI ordered num={4}><Strong>Set user data parameters:</Strong> Pass hashed email, phone, first name, last name, city, state, zip, and country for event matching. The more parameters you provide, the higher the match rate</LI>
          <LI ordered num={5}><Strong>Add the event ID for deduplication:</Strong> Generate a unique event ID on the client side and pass it to both the pixel AND the server-side tag</LI>
        </OL>
        <CodeBlock title="GTM Server - Meta CAPI Configuration">
{`// Event mapping in GTM Server Container
// Client-side GA4 tag sends to server container
// Server container forwards to Meta CAPI

Event Mapping:
  GA4 Event          →  Meta CAPI Event
  ─────────────────────────────────────
  page_view          →  PageView
  view_item          →  ViewContent
  add_to_cart        →  AddToCart
  begin_checkout     →  InitiateCheckout
  purchase           →  Purchase
  generate_lead      →  Lead
  sign_up            →  CompleteRegistration

User Data Parameters (hashed with SHA-256):
  em   → email address
  ph   → phone number
  fn   → first name
  ln   → last name
  ct   → city
  st   → state
  zp   → zip code
  country → country code

Event ID: Must match between pixel and CAPI
  → Generated client-side, passed to both`}
        </CodeBlock>

        <H2 id="event-matching-deduplication">Event Matching & Deduplication</H2>
        <P>
          <Strong>Event matching</Strong> is how Meta connects a server event to a specific user. The more user parameters you provide, the higher your Event Match Quality (EMQ) score. Aim for an EMQ of 6.0 or higher (out of 10). Email and phone number are the two most impactful parameters.
        </P>
        <P>
          <Strong>Deduplication</Strong> is critical when running the pixel and CAPI simultaneously (which you should). Without deduplication, Meta counts each conversion twice — once from the pixel and once from CAPI. The solution is simple: generate a unique <Code>event_id</Code> on the client side and include it in both the pixel event and the CAPI event. Meta automatically deduplicates events with matching event IDs.
        </P>
        <CodeBlock title="Deduplication - Event ID Generation">
{`// Generate unique event ID on the client side
// Include in both Meta Pixel and dataLayer push

const eventId = crypto.randomUUID();

// Meta Pixel (client-side)
fbq('track', 'Purchase', {
  value: 99.99,
  currency: 'USD'
}, { eventID: eventId });

// Data Layer Push (forwarded to server → CAPI)
dataLayer.push({
  event: 'purchase',
  event_id: eventId,  // Same ID sent to CAPI
  ecommerce: {
    value: 99.99,
    currency: 'USD',
    transaction_id: 'TXN-12345'
  }
});`}
        </CodeBlock>

        <H2 id="testing-and-validation">Testing & Validation</H2>
        <P>
          After setup, validate that everything works correctly:
        </P>
        <UL>
          <LI><Strong>Meta Events Manager → Test Events:</Strong> Use the Test Events tab to send test conversions and verify they arrive with correct parameters</LI>
          <LI><Strong>Check Event Match Quality:</Strong> Navigate to Data Sources → your pixel → Overview. EMQ should be 6.0+ for each event type</LI>
          <LI><Strong>Verify deduplication:</Strong> Check that your total event count with pixel + CAPI is roughly the same as pixel alone (not double). A slight increase (10-30%) is expected — those are the previously missed events</LI>
          <LI><Strong>Monitor in GTM Server:</Strong> Use the server container&apos;s preview mode to verify events are being forwarded with all user parameters</LI>
          <LI><Strong>Compare before/after:</Strong> Track your reported conversions for 2 weeks before and after CAPI implementation. Expect a 15-35% increase in attributed conversions</LI>
        </UL>
        <P>
          Setting up the <A href="/services">Meta Conversions API</A> is one of the most impactful improvements you can make to your Meta advertising performance. Better data leads to better optimization, which leads to lower CPAs and higher ROAS — with no changes to your creative or targeting.
        </P>
      </>
    ),
  },
};

/* ------------------------------------------------------------------ */
/*  Helper: get all posts as array                                     */
/* ------------------------------------------------------------------ */

const allPosts = Object.values(posts);

function getRelatedPosts(currentSlug: string): BlogPost[] {
  const current = posts[currentSlug];
  if (!current) return allPosts.slice(0, 3);

  // Prefer same category, then recent
  const sameCategory = allPosts.filter(
    (p) => p.slug !== currentSlug && p.category === current.category
  );
  const others = allPosts.filter(
    (p) => p.slug !== currentSlug && p.category !== current.category
  );
  return [...sameCategory, ...others].slice(0, 3);
}

/* ------------------------------------------------------------------ */
/*  Share Button Component                                             */
/* ------------------------------------------------------------------ */

function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const twitterUrl =
    typeof window !== 'undefined'
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`
      : '#';

  const linkedinUrl =
    typeof window !== 'undefined'
      ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
      : '#';

  return (
    <div className="flex flex-col gap-2 mt-6">
      <span className="text-[11px] uppercase tracking-[0.15em] text-brand-cream/30 font-semibold mb-1">
        Share
      </span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[13px] text-brand-cream/50 hover:text-brand-gold transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Twitter
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[13px] text-brand-cream/50 hover:text-brand-gold transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        LinkedIn
      </a>
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 text-[13px] text-brand-cream/50 hover:text-brand-gold transition-colors text-left"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  404 Component                                                      */
/* ------------------------------------------------------------------ */

function NotFoundPost() {
  return (
    <main className="min-h-screen bg-brand-darkest flex items-center justify-center">
      <div className="text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-[80px] font-display font-bold text-brand-mid/20">
            404
          </span>
          <h1 className="heading-md text-brand-cream mt-2">
            Post Not Found
          </h1>
          <p className="body-base text-brand-cream/60 mt-3 max-w-md mx-auto">
            The blog post you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/blog"
            className="btn-primary inline-block mt-8"
          >
            Back to Blog
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function BlogPostPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { loaded } = useData();
  const { loaded: detailLoaded } = useDetailData('col_blog_detail_' + slug);
  const hardcodedPost = posts[slug];
  const [dynamicPost, setDynamicPost] = useState<typeof hardcodedPost | null>(null);
  const [dynamicSections, setDynamicSections] = useState<{ id: string; label: string; content: string }[] | null>(null);
  const [dynamicIntro, setDynamicIntro] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    if (!slug || !loaded || !detailLoaded) return;
    const saved = getBlogDetail(slug);

    // For hardcoded posts: seed detail on first visit
    if (hardcodedPost && !saved) {
      saveBlogDetail(slug, {
        title: hardcodedPost.title, category: hardcodedPost.category, date: hardcodedPost.date,
        readTime: hardcodedPost.readTime, excerpt: hardcodedPost.excerpt, author: 'Sabbir Ahsan',
        authorRole: 'Digital Marketer & MarTech Specialist', authorInitials: 'SA',
        intro: '', toc: hardcodedPost.toc.map(t => ({ ...t, content: '' })), ctaHeading: 'Want to implement this?',
        ctaDescription: "Let's discuss how to apply these strategies to your business.",
        ctaButtonText: 'Book a Free Consultation', ctaButtonLink: '/book', ctaSubtext: 'No payment required',
        relatedSectionTitle: 'Keep Reading', featured: false,
      });
    }

    const detail = saved || getBlogDetail(slug);
    if (detail) {
      const tocWithContent = (detail.toc || []).map((t: { id: string; label: string; content?: string }) => ({ id: t.id, label: t.label, content: t.content || '' }));
      const introText = (detail as { intro?: string }).intro || '';
      const hasDynamicContent = introText.trim().length > 0 || tocWithContent.some((t: { content: string }) => t.content.trim().length > 0);

      if (hasDynamicContent) {
        if (introText.trim()) setDynamicIntro(introText);
        setDynamicSections(tocWithContent);
      }

      const base = hardcodedPost || { slug, title: detail.title, category: detail.category, date: detail.date, readTime: detail.readTime, excerpt: detail.excerpt, toc: [], content: null as React.ReactNode };
      setDynamicPost({ ...base, title: detail.title, category: detail.category, date: detail.date, readTime: detail.readTime, excerpt: detail.excerpt, toc: tocWithContent.length ? tocWithContent : base.toc });
    }
    setMounted(true);

    // Fire view_blog dataLayer event
    const blogTitle = detail?.title || hardcodedPost?.title || slug
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'view_blog', blog_name: blogTitle, page_url: window.location.href })
  }, [slug, loaded, detailLoaded]);

  const post = (mounted && dynamicPost) ? dynamicPost : hardcodedPost;
  const isLoading = !loaded || !detailLoaded;

  // Intersection Observer for active TOC highlighting
  useEffect(() => {
    if (!post) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    post.toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [post]);

  // Only show not-found after data has loaded — avoid flash for dynamic blogs
  if (!post && !isLoading) return <NotFoundPost />;
  if (!post) return (
    <main className="min-h-screen bg-brand-darkest">
      <section className="pt-28 pb-8">
        <div className="container-main">
          <div className="h-4 w-16 bg-brand-mid/10 rounded mb-8 animate-pulse" />
          <div className="flex items-center gap-3 mb-5">
            <div className="h-5 w-20 bg-brand-mid/10 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-brand-mid/10 rounded animate-pulse" />
          </div>
          <div className="space-y-3 mb-6">
            <div className="h-10 w-full max-w-2xl bg-brand-mid/10 rounded animate-pulse" />
            <div className="h-10 w-3/4 max-w-xl bg-brand-mid/10 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-mid/10 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-brand-mid/10 rounded animate-pulse" />
              <div className="h-3 w-40 bg-brand-mid/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
      <div className="container-main pb-10">
        <div className="aspect-[21/9] rounded-2xl bg-brand-mid/10 animate-pulse" />
      </div>
    </main>
  );

  const relatedPosts = getRelatedPosts(slug);

  return (
    <main className="min-h-screen bg-brand-darkest">
      {(() => { const bd = mounted ? getBlogDetail(slug) : null; return bd ? <PageSEO title={bd.seoTitle || post.title} description={bd.seoDescription || post.excerpt} image={bd.seoImage} /> : null })()}
      {/* ---- Header ---- */}
      <section className="pt-28 pb-8">
        <div className="container-main">
          <Link
            href="/blog"
            className="text-[14px] text-brand-green-light hover:text-brand-gold transition-colors mb-8 inline-block"
          >
            &larr; Blog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="badge">{post.category}</span>
              <span className="text-[13px] text-brand-cream/40">
                {post.date}
              </span>
              <span className="w-1 h-1 rounded-full bg-brand-mid/40" />
              <span className="text-[13px] text-brand-cream/40">
                {post.readTime} read
              </span>
            </div>

            <h1 className="heading-lg text-brand-cream leading-[1.15]">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 mt-6">
              {(() => { const bd = mounted ? getBlogDetail(slug) : null; return (<>
              <div className="w-10 h-10 rounded-full bg-brand-mid/20 border border-brand-mid/30 flex items-center justify-center text-[14px] font-display font-bold text-brand-gold">
                {bd?.authorInitials || 'SA'}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-brand-cream/90">
                  {bd?.author || 'Sabbir Ahsan'}
                </p>
                <p className="text-[12px] text-brand-cream/40">
                  {bd?.authorRole || 'Digital Marketer & MarTech Specialist'}
                </p>
              </div>
              </>)})()}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---- Hero Image Area ---- */}
      <div className="container-main pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="aspect-[21/9] rounded-2xl bg-gradient-to-br from-brand-dark via-brand-mid/20 to-brand-dark relative overflow-hidden"
        >
          {(() => { const bd = mounted ? getBlogDetail(slug) : null; return bd?.image ? (
            <img src={bd.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: 'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }} />
          ) })()}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/40 to-transparent" />
        </motion.div>
      </div>

      {/* ---- Content (two-column) ---- */}
      <div className="container-main pb-16">
        <div className="flex gap-12">
          {/* Left sidebar - TOC */}
          <aside className="hidden lg:block w-[180px] flex-shrink-0">
            <div className="sticky top-28">
              <span className="text-[11px] uppercase tracking-[0.15em] text-brand-cream/30 font-semibold">
                Contents
              </span>
              <nav className="mt-4 flex flex-col gap-2.5">
                {post.toc.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`text-[13px] leading-[1.5] transition-colors ${
                      activeSection === id
                        ? 'text-brand-gold'
                        : 'text-brand-cream/50 hover:text-brand-cream/80'
                    }`}
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <ShareButtons title={post.title} />
            </div>
          </aside>

          {/* Right content */}
          <article className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {mounted && dynamicSections ? <>{dynamicIntro && renderMarkdownContent(dynamicIntro)}<DynamicBlogContent sections={dynamicSections} /></> : post.content}
            </motion.div>
          </article>
        </div>
      </div>

      {/* ---- CTA Box ---- */}
      <div className="container-main pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-brand-mid/[0.08] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {(() => { const bd = mounted ? getBlogDetail(slug) : null; return (<>
          <div className="relative z-10">
            <h3 className="text-[22px] md:text-[26px] font-display font-bold text-brand-cream">
              {bd?.ctaHeading || 'Want to implement this?'}
            </h3>
            <p className="text-[15px] text-brand-cream/60 mt-2 max-w-md">
              {bd?.ctaDescription || "Let's discuss how to apply these strategies to your business."}
            </p>
          </div>
          <div className="relative z-10 shrink-0 text-center">
            <Link href={bd?.ctaButtonLink || '/book'} className="btn-primary">
              {bd?.ctaButtonText || 'Book a Free Consultation'}
            </Link>
            <p className="text-[12px] text-brand-cream/35 mt-2">{bd?.ctaSubtext || 'No payment required'}</p>
          </div>
          </>)})()}
        </motion.div>
      </div>

      <div className="line-divider" />

      {/* ---- Related Posts ---- */}
      <section className="py-12">
        <div className="container-main">
          <h2 className="heading-sm text-brand-cream/85 mb-10">
            {(() => { const bd = mounted ? getBlogDetail(slug) : null; return bd?.relatedSectionTitle || 'Keep Reading' })()}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((rp, i) => (
              <motion.article
                key={rp.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  href={`/blog/${rp.slug}`}
                  className="group block h-full"
                >
                  <div className="card-hover h-full overflow-hidden rounded-2xl">
                    <div className="aspect-video bg-gradient-to-br from-brand-dark via-brand-mid/20 to-brand-dark flex items-center justify-center overflow-hidden relative">
                      <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                          backgroundImage:
                            'linear-gradient(rgba(75,138,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,138,108,1) 1px, transparent 1px)',
                          backgroundSize: '32px 32px',
                        }}
                      />
                      <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700 bg-gradient-to-br from-brand-dark via-brand-mid/30 to-brand-dark" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-brand-mid">
                          {rp.category}
                        </span>
                        <span className="text-[12px] text-brand-cream/30">
                          {rp.date}
                        </span>
                      </div>
                      <h3 className="text-[15px] text-brand-cream/75 font-semibold leading-snug group-hover:text-brand-cream transition-colors">
                        {rp.title}
                      </h3>
                      <p className="mt-2 text-[13px] text-brand-cream/50 leading-[1.6] line-clamp-2">
                        {rp.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

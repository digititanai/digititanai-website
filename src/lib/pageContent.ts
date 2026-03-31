// Default content for all public pages
// Editable from admin panel via app_data key-value pairs

export interface AboutStat { value: string; label: string }
export interface AboutSkill { name: string; icon: string; desc: string }
export interface AboutExperience { year: string; role: string; company: string; desc: string }

export interface AboutPageContent {
  badge: string
  heading: string
  subtitle: string
  bio1: string
  bio2: string
  image: string
  skillsBadge: string
  skillsHeading: string
  experienceBadge: string
  experienceHeading: string
  toolsBadge: string
  toolsHeading: string
  stats: AboutStat[]
  skills: AboutSkill[]
  experiences: AboutExperience[]
  tools: string[]
}

export const defaultAboutContent: AboutPageContent = {
  badge: 'About Me',
  heading: "I'm Sabbir Ahsan",
  subtitle: 'Digital Marketer & MarTech Specialist',
  image: '',
  bio1: 'With over five years of experience in digital marketing, I specialize in bridging the gap between creative marketing strategy and technical execution. From building automated lead pipelines to scaling e-commerce revenue, I focus on systems that compound over time.',
  bio2: 'Currently serving as Head of Digital Marketing & MarTech at FundedNext, where I lead growth initiatives across paid media, SEO, marketing automation, and analytics infrastructure.',
  skillsBadge: 'Core Skills',
  skillsHeading: 'What I Bring to the Table',
  experienceBadge: 'Experience',
  experienceHeading: 'Career Journey',
  toolsBadge: 'Tech Stack',
  toolsHeading: 'Tools I Work With',
  stats: [
    { value: '5+', label: 'Years Experience' },
    { value: '100+', label: 'Projects Delivered' },
    { value: '50+', label: 'Happy Clients' },
    { value: '98%', label: 'Success Rate' },
  ],
  skills: [
    { name: 'Tracking & Analytics', icon: 'BarChart3', desc: 'GA4, GTM, Server-Side' },
    { name: 'Marketing Automation', icon: 'Zap', desc: 'n8n, HubSpot, Zapier' },
    { name: 'SEO & Content', icon: 'Search', desc: 'Technical & On-Page' },
    { name: 'PPC & Paid Media', icon: 'MousePointerClick', desc: 'Google, Meta, LinkedIn' },
    { name: 'Web Development', icon: 'Globe', desc: 'WordPress, Next.js' },
    { name: 'MarTech Consulting', icon: 'Cpu', desc: 'Stack Optimization' },
    { name: 'Data Analytics', icon: 'LineChart', desc: 'Dashboards & Reporting' },
    { name: 'Social Media', icon: 'Share2', desc: 'Strategy & Management' },
  ],
  experiences: [
    { year: '2022 – Present', role: 'Head of Digital Marketing & MarTech', company: 'FundedNext', desc: 'Leading digital strategy, marketing automation, and martech infrastructure for rapid growth.' },
    { year: '2020 – 2022', role: 'Senior Digital Marketing Manager', company: 'TechVentures Ltd.', desc: 'Managed multi-channel campaigns, grew organic traffic 400%, and built the automation stack.' },
    { year: '2018 – 2020', role: 'Digital Marketing Specialist', company: 'GrowthLab Agency', desc: 'Executed SEO, PPC, and content strategies for 20+ clients across various industries.' },
    { year: '2016 – 2018', role: 'SEO & Content Strategist', company: 'MediaPulse Digital', desc: 'Built content pipelines and SEO frameworks that consistently ranked in top 3 positions.' },
  ],
  tools: [
    'Google Analytics 4', 'Google Tag Manager', 'Google Ads', 'Meta Ads', 'n8n',
    'HubSpot', 'Ahrefs', 'SEMrush', 'WordPress', 'Elementor', 'Next.js',
    'Zapier', 'Mailchimp', 'Salesforce', 'Figma', 'Looker Studio',
  ],
}

export const defaultPageContent: Record<string, Record<string, string>> = {
  about: {
    badge: defaultAboutContent.badge,
    heading: defaultAboutContent.heading,
    subtitle: defaultAboutContent.subtitle,
    bio1: defaultAboutContent.bio1,
    bio2: defaultAboutContent.bio2,
  },
  services: {
    badge: 'Services',
    heading: 'A blend of technical engineering and marketing psychology.',
    subtitle: 'Every service is designed to solve a specific growth challenge — from tracking accuracy to pipeline automation.',
    viewDetailsText: 'View Details',
    pricingBtnText: 'Pricing',
    consultationNote: 'Book a free consultation first — no payment required to get started.',
    bookBtnText: 'Book Free Consultation',
    popularLabel: 'Most Popular',
  },
  portfolio: {
    badge: 'Portfolio',
    heading: 'Results That Speak',
    subtitle: 'Real projects, real metrics. Each case study represents a partnership built on data-driven strategy.',
  },
  blog: {
    badge: 'Blog',
    heading: 'Insights & Guides',
    subtitle: 'Practical strategies on tracking, automation, SEO, and marketing technology.',
  },
  pricing: {
    badge: 'Pricing',
    heading: 'Simple, Transparent Pricing',
    subtitle: 'Choose a plan that fits your business. No hidden fees, no surprises. All plans include a 14-day money-back guarantee.',
    ctaHeading: 'Not sure which plan is right?',
    ctaDescription: 'Book a free 30-minute consultation and I will help you find the perfect solution for your business.',
    ctaButtonText: 'Book a Free Consultation',
    ctaButtonLink: '/book',
    faqs: JSON.stringify([
      { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade your plan at any time. We will adjust billing accordingly and ensure a smooth transition.' },
      { q: 'Is there a contract or commitment?', a: 'No long-term contracts. All plans are flexible — you can cancel at any time with 30 days notice.' },
      { q: 'What payment methods do you accept?', a: 'I accept bank transfers, PayPal, and major credit/debit cards. Payment terms are discussed during consultation.' },
      { q: 'Do you offer custom packages?', a: 'Yes! If none of the standard packages fit your needs, I can create a custom proposal tailored to your specific goals and budget.' },
      { q: 'How quickly can you start?', a: 'Most projects begin within 1-2 weeks of agreement. Urgent projects can be accommodated with a priority scheduling fee.' },
      { q: 'What if I am not satisfied?', a: 'Your satisfaction is my priority. If you are not happy with the results, we will work together to make it right or I will offer a partial refund.' },
    ]),
  },
  contact: {
    badge: 'Contact',
    heading: "Let's Talk",
    subtitle: 'Have a project in mind? Send me a message or book a free consultation. I respond within 24 hours.',
    email: 'sabbirahsan73@gmail.com',
    phone: '+880 1XXX-XXXXXX',
    location: 'Dhaka, Bangladesh',
    hours: 'Sun \u2013 Thu, 10AM \u2013 6PM',
    ctaHeading: 'Prefer a live conversation?',
    ctaDescription: 'Book a free 30-minute call. No payment required \u2014 just a friendly chat about your goals.',
    ctaButtonText: 'Book a Free Call',
    ctaButtonLink: '/book',
    followHeading: 'Follow Me',
    socials: JSON.stringify([
      { label: 'LinkedIn', url: 'https://linkedin.com/in/sabbirahsan', icon: 'Linkedin' },
      { label: 'Twitter', url: 'https://x.com/sabbirahsan', icon: 'Twitter' },
      { label: 'Facebook', url: 'https://facebook.com/sabbirahsan', icon: 'Facebook' },
      { label: 'Instagram', url: 'https://instagram.com/sabbirahsan', icon: 'Instagram' },
      { label: 'YouTube', url: 'https://youtube.com/@sabbirahsan', icon: 'Youtube' },
      { label: 'GitHub', url: 'https://github.com/sabbirahsan', icon: 'Github' },
    ]),
  },
  book: {
    badge: 'Book',
    heading: 'Book a Free Consultation',
    subtitle: 'Meet first, decide later. No payment required \u2014 just a friendly conversation about your goals.',
    perks: '100% free consultation \u2014 no payment needed\nMeet first, pay only when you\u0027re ready\nNo commitment, cancel anytime',
  },
  privacy: {
    badge: 'Legal',
    heading: 'Privacy Policy',
    lastUpdated: 'Last updated: March 30, 2026',
    content: '<p>Welcome to sabbirahsan.com ("the Website"), operated by Sabbir Ahsan ("I", "me", "my"). I am committed to protecting your privacy. This Privacy Policy explains how I collect, use, and safeguard your personal information when you visit my website and use my digital marketing and MarTech consulting services.</p><h2>1. Information We Collect</h2><p>I may collect the following types of information:</p><ul><li><strong>Contact Form Submissions:</strong> Name, email address, phone number, company name, and any message you provide through the contact form.</li><li><strong>Booking Information:</strong> When you book a consultation, I collect your name, email, preferred date/time, and any details you share about your project or needs.</li><li><strong>Analytics Data:</strong> Information about how you interact with the website, including pages visited, time spent, browser type, device information, IP address, and referring URLs.</li><li><strong>Uploaded Files:</strong> If you share files (such as briefs, brand assets, or documents) through the website, those files are stored securely.</li></ul><h2>2. How We Use Your Information</h2><p>Your information is used for the following purposes:</p><ul><li>To respond to your inquiries and provide the services you request</li><li>To schedule and manage consultation bookings</li><li>To send confirmation emails and follow-ups related to your bookings</li><li>To improve the website experience through analytics and usage data</li><li>To communicate about services, updates, or relevant information (only with your consent)</li></ul><h2>3. Google Calendar &amp; Gmail Integration</h2><p>This website integrates with Google services to facilitate bookings and communication:</p><ul><li><strong>Google Calendar:</strong> When you book a consultation, a calendar event is created on my Google Calendar with the details you provide (name, email, date/time, and meeting notes).</li><li><strong>Gmail API:</strong> Confirmation and follow-up emails are sent through the Gmail API. Your email address is used solely for communication related to your booking or inquiry.</li></ul><p>These integrations only access the minimum data necessary to provide the booking and communication services. I do not read, store, or share your Gmail data beyond what is required for these functions.</p><h2>4. Cookies &amp; Analytics</h2><p>The website uses the following technologies:</p><ul><li><strong>Google Analytics:</strong> I use Google Analytics to understand website traffic and user behavior. This collects anonymized data such as pages visited, session duration, and geographic location. You can opt out by using a browser extension or adjusting your browser settings.</li><li><strong>localStorage:</strong> The website uses browser localStorage to store user preferences (such as theme settings) and session-related data. This data stays on your device and is not transmitted to any server.</li></ul><h2>5. Data Storage</h2><p>Your data is stored using the following services:</p><ul><li><strong>Supabase Database:</strong> Contact form submissions, booking records, and other structured data are stored in a Supabase PostgreSQL database with row-level security enabled.</li><li><strong>Supabase Storage:</strong> Any files you upload (documents, images, briefs) are stored in Supabase Storage with access controls to ensure only authorized parties can view them.</li></ul><p>Data is retained for as long as necessary to provide services or as required by law. You may request deletion of your data at any time.</p><h2>6. Third-Party Services</h2><p>The website relies on the following third-party services, each with their own privacy policies:</p><ul><li><strong>Google LLC</strong> &mdash; Calendar, Gmail, and Analytics services</li><li><strong>Supabase Inc.</strong> &mdash; Database hosting and file storage</li><li><strong>Vercel Inc.</strong> &mdash; Website hosting and deployment</li></ul><p>I do not sell, trade, or rent your personal information to any third party. Data is only shared with the services listed above to the extent necessary to operate the website and deliver services.</p><h2>7. Your Rights</h2><p>You have the following rights regarding your personal data:</p><ul><li><strong>Access:</strong> You can request a copy of the personal data I hold about you.</li><li><strong>Correction:</strong> You can request corrections to any inaccurate or incomplete information.</li><li><strong>Deletion:</strong> You can request that I delete your personal data, subject to any legal obligations requiring retention.</li><li><strong>Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li></ul><p>To exercise any of these rights, please contact me using the details below.</p><h2>8. Contact</h2><p>If you have any questions or concerns about this Privacy Policy, please contact me at:</p><p><strong>Sabbir Ahsan</strong><br>Dhaka, Bangladesh<br>Email: <a href="mailto:sabbirahsan73@gmail.com">sabbirahsan73@gmail.com</a><br>Website: <a href="https://sabbirahsan.com">sabbirahsan.com</a></p>',
  },
  terms: {
    badge: 'Legal',
    heading: 'Terms of Service',
    lastUpdated: 'Last updated: March 30, 2026',
    content: '<p>Welcome to sabbirahsan.com ("the Website"). These Terms of Service ("Terms") govern your use of the website and services provided by Sabbir Ahsan ("I", "me", "my"). By accessing or using the Website, you agree to be bound by these Terms.</p><h2>1. Acceptance of Terms</h2><p>By accessing, browsing, or using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the Website. I reserve the right to update these Terms at any time, and your continued use of the Website constitutes acceptance of any changes.</p><h2>2. Services Description</h2><p>I provide digital marketing and MarTech consulting services, including but not limited to:</p><ul><li>Tracking and analytics setup and optimization</li><li>Marketing automation with tools like n8n</li><li>Campaign optimization and performance marketing</li><li>WordPress development and customization</li><li>SEO and content strategy consulting</li><li>MarTech stack consulting and implementation</li><li>Online consultation bookings via the website</li></ul><p>The scope, deliverables, and timelines for any engagement will be agreed upon separately between both parties before work commences.</p><h2>3. Booking &amp; Cancellation Policy</h2><p>When booking a consultation through the Website:</p><ul><li>You must provide accurate and complete information when scheduling a booking.</li><li>Consultation bookings are subject to availability and confirmation.</li><li>Cancellations or rescheduling requests should be made at least 24 hours prior to the scheduled time.</li><li>Repeated no-shows may result in restrictions on future booking ability.</li><li>I reserve the right to cancel or reschedule bookings with reasonable notice.</li></ul><h2>4. Intellectual Property</h2><p>All content on this website, including but not limited to text, graphics, logos, images, blog posts, code, and design elements, is the intellectual property of Sabbir Ahsan unless otherwise stated. You may not reproduce, distribute, modify, or create derivative works from any content on this website without prior written permission. Any deliverables created as part of a paid engagement will be subject to the terms agreed upon in the respective project agreement.</p><h2>5. Limitation of Liability</h2><p>The website and services are provided on an "as is" and "as available" basis. To the fullest extent permitted by law, I shall not be liable for any direct, indirect, incidental, consequential, or special damages arising out of or in connection with your use of the Website or services, including but not limited to loss of data, revenue, profits, or business opportunities. While I strive to provide accurate and up-to-date information, I do not warrant that the content on the website is error-free, complete, or current.</p><h2>6. Payment Terms</h2><p>For paid services:</p><ul><li>Payment terms, amounts, and schedules will be agreed upon before any paid engagement begins.</li><li>All fees are quoted in the currency specified in the project proposal or invoice.</li><li>Payment is expected within the timeframe specified on the invoice unless otherwise agreed.</li><li>Late payments may incur additional charges or result in suspension of services.</li><li>Refund policies, if applicable, will be outlined in the individual project agreement.</li></ul><h2>7. Governing Law</h2><p>These Terms shall be governed by and construed in accordance with the laws of the People\'s Republic of Bangladesh. Any disputes arising from or related to these Terms or the use of the Website shall be subject to the exclusive jurisdiction of the courts in Dhaka, Bangladesh.</p><h2>8. Changes to Terms</h2><p>I reserve the right to modify or replace these Terms at any time. Changes will be effective immediately upon posting on the Website. The "Last updated" date at the top of this page will be revised accordingly. It is your responsibility to review these Terms periodically. Continued use of the Website after any changes constitutes acceptance of the updated Terms.</p><h2>9. Contact</h2><p>If you have any questions about these Terms of Service, please contact me at:</p><p><strong>Sabbir Ahsan</strong><br>Dhaka, Bangladesh<br>Email: <a href="mailto:sabbirahsan73@gmail.com">sabbirahsan73@gmail.com</a><br>Website: <a href="https://sabbirahsan.com">sabbirahsan.com</a></p>',
  },
  header: {
    logoFirst: 'Sabbir',
    logoSecond: 'Ahsan',
    buttonText: 'Book Appointment',
    buttonLink: '/book',
    navLinks: JSON.stringify([
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Blog', href: '/blog' },
    ]),
  },
  footer: {
    ctaHeading: 'Ready to grow your business?',
    ctaDescription: "Let's discuss how I can help you achieve your marketing goals.",
    ctaBtn1Text: 'Book a Free Call',
    ctaBtn1Link: '/book',
    ctaBtn2Text: 'Send a Message',
    ctaBtn2Link: '/contact',
    brandDescription: 'Digital marketer & martech specialist helping brands grow through data-driven strategies and intelligent automation.',
    email: 'sabbirahsan73@gmail.com',
    phone: '+880 1XXX-XXXXXX',
    location: 'Dhaka, Bangladesh',
    hours: 'Sun \u2013 Thu, 10AM \u2013 6PM',
    copyright: 'Sabbir Ahsan. All rights reserved.',
    navLinks: JSON.stringify([
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ]),
    privacyText: 'Privacy Policy',
    privacyLink: '/privacy',
    termsText: 'Terms of Service',
    termsLink: '/terms',
    navigationHeading: 'Navigation',
    servicesHeading: 'Services',
    contactHeading: 'Get in Touch',
    socialLinks: JSON.stringify([
      { label: 'LinkedIn', url: 'https://linkedin.com/in/sabbirahsan', icon: 'Linkedin' },
      { label: 'Facebook', url: 'https://facebook.com/sabbirahsan', icon: 'Facebook' },
      { label: 'Twitter', url: 'https://x.com/sabbirahsan', icon: 'Twitter' },
      { label: 'Instagram', url: 'https://instagram.com/sabbirahsan', icon: 'Instagram' },
      { label: 'YouTube', url: 'https://youtube.com/@sabbirahsan', icon: 'Youtube' },
      { label: 'GitHub', url: 'https://github.com/sabbirahsan', icon: 'Github' },
    ]),
    serviceLinks: JSON.stringify([
      { label: 'Tracking & Analytics', href: '/services/tracking-analytics' },
      { label: 'Automation with n8n', href: '/services/automation-n8n' },
      { label: 'WordPress Development', href: '/services/wordpress-development' },
      { label: 'Campaign Optimization', href: '/services/campaign-optimization' },
      { label: 'SEO & Content Strategy', href: '/services/seo-content-strategy' },
      { label: 'MarTech Consulting', href: '/services/martech-consulting' },
    ]),
  },
}

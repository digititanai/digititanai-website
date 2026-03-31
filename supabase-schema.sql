-- ============================================
-- sabbirahsan.com Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Pages table
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  short_description TEXT NOT NULL,
  full_description JSONB,
  deliverables JSONB DEFAULT '[]'::jsonb,
  pricing_tiers JSONB DEFAULT '[]'::jsonb,
  process_steps JSONB DEFAULT '[]'::jsonb,
  faq JSONB DEFAULT '[]'::jsonb,
  category TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_role TEXT,
  client_photo TEXT,
  quote TEXT NOT NULL,
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio table
CREATE TABLE portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client_name TEXT,
  industry TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  banner_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  challenge JSONB,
  solution JSONB,
  result JSONB,
  metrics JSONB DEFAULT '[]'::jsonb,
  tools_used TEXT[] DEFAULT '{}',
  testimonial_id UUID REFERENCES testimonials(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog categories
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  featured_image TEXT,
  content JSONB,
  excerpt TEXT,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  author TEXT DEFAULT 'Sabbir Ahsan',
  reading_time INT DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  publish_date TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INT DEFAULT 30 CHECK (duration_minutes IN (30, 45, 60)),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  gcal_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_interest TEXT,
  budget_range TEXT,
  message TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media library
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size_bytes INT DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings (key-value store)
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  variables JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page views (lightweight analytics)
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL,
  visitor_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_order ON services(display_order);
CREATE INDEX idx_portfolio_featured ON portfolio(is_featured);
CREATE INDEX idx_portfolio_order ON portfolio(display_order);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_publish_date ON blog_posts(publish_date);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created ON contacts(created_at);
CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_created ON page_views(created_at);
CREATE INDEX idx_media_type ON media(type);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read published pages" ON pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read portfolio" ON portfolio FOR SELECT USING (true);
CREATE POLICY "Public can read published blog posts" ON blog_posts FOR SELECT USING (status = 'published' AND publish_date <= NOW());
CREATE POLICY "Public can read blog categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Public can read active testimonials" ON testimonials FOR SELECT USING (is_active = true);

-- Public insert policies
CREATE POLICY "Public can create contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert page views" ON page_views FOR INSERT WITH CHECK (true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin full access pages" ON pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access portfolio" ON portfolio FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access blog_posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access blog_categories" ON blog_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access contacts" ON contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access media" ON media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access email_templates" ON email_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access page_views" ON page_views FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- AUTO-UPDATE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA
-- ============================================

-- Seed default pages
INSERT INTO pages (slug, title, meta_title, meta_description, sections) VALUES
('home', 'Home', 'Md Sabbir Ahsan | Digital Marketer & Martech Specialist', 'Transform your digital presence with data-driven marketing strategies. Sabbir Ahsan - Expert Digital Marketer & Martech Specialist based in Dhaka, Bangladesh.', '[]'),
('about', 'About', 'About Sabbir Ahsan | Digital Marketing Expert', 'Learn about Sabbir Ahsan''s journey in digital marketing, expertise in martech, and passion for data-driven growth strategies.', '[]'),
('services', 'Services', 'Digital Marketing Services | Sabbir Ahsan', 'Comprehensive digital marketing services including SEO, PPC, social media, marketing automation, and martech consulting.', '[]'),
('portfolio', 'Portfolio', 'Portfolio & Case Studies | Sabbir Ahsan', 'Explore successful digital marketing campaigns and case studies showcasing measurable results.', '[]'),
('blog', 'Blog', 'Digital Marketing Blog | Sabbir Ahsan', 'Insights, tips, and strategies on digital marketing, SEO, automation, and marketing technology.', '[]'),
('pricing', 'Pricing', 'Pricing Plans | Sabbir Ahsan', 'Transparent pricing for digital marketing services. Choose a plan that fits your business needs.', '[]'),
('contact', 'Contact', 'Contact Sabbir Ahsan | Get In Touch', 'Ready to transform your digital presence? Get in touch with Sabbir Ahsan for a free consultation.', '[]');

-- Seed services
INSERT INTO services (title, slug, short_description, category, display_order, pricing_tiers, deliverables, process_steps, faq) VALUES
('Digital Marketing Strategy', 'digital-marketing-strategy', 'Comprehensive digital marketing strategies tailored to your business goals, audience, and budget.', 'Strategy', 1,
  '[{"name":"Starter","price":"$499","features":["Market analysis","Channel strategy","30-day action plan","Monthly review"]},{"name":"Professional","price":"$999","features":["Everything in Starter","Competitor analysis","90-day roadmap","Bi-weekly reviews","KPI dashboard"]},{"name":"Enterprise","price":"$2,499","features":["Everything in Professional","Full audit","12-month strategy","Weekly reviews","Dedicated support"]}]',
  '["Market & competitor analysis","Target audience profiling","Channel strategy & budget allocation","KPI framework & tracking setup","Monthly strategy review & optimization"]',
  '[{"step":1,"title":"Discovery","description":"Deep dive into your business, goals, and current marketing efforts"},{"step":2,"title":"Research","description":"Market analysis, competitor audit, and audience research"},{"step":3,"title":"Strategy","description":"Develop comprehensive marketing strategy and roadmap"},{"step":4,"title":"Implementation","description":"Execute the strategy across chosen channels"},{"step":5,"title":"Optimization","description":"Monitor, analyze, and continuously optimize for better results"}]',
  '[{"question":"How long does it take to see results?","answer":"Typically 3-6 months for significant organic growth, though paid campaigns can show results within weeks."},{"question":"Do you work with small businesses?","answer":"Absolutely! Our Starter plan is designed specifically for small businesses and startups."},{"question":"What industries do you specialize in?","answer":"We have experience across e-commerce, SaaS, healthcare, education, and professional services."}]'),

('SEO & Content Marketing', 'seo-content-marketing', 'Boost your organic visibility with data-driven SEO strategies and compelling content that converts.', 'SEO', 2,
  '[{"name":"Starter","price":"$399","features":["Technical SEO audit","5 keywords optimization","2 blog posts/month","Monthly report"]},{"name":"Professional","price":"$799","features":["Everything in Starter","15 keywords","4 blog posts/month","Link building","Bi-weekly reports"]},{"name":"Enterprise","price":"$1,999","features":["Everything in Professional","50+ keywords","8 blog posts/month","Premium link building","Weekly reports","Content strategy"]}]',
  '["Technical SEO audit & fixes","Keyword research & strategy","On-page optimization","Content creation & optimization","Link building & outreach","Monthly performance reports"]',
  '[{"step":1,"title":"Audit","description":"Comprehensive technical and content SEO audit"},{"step":2,"title":"Research","description":"Keyword research and content gap analysis"},{"step":3,"title":"Optimize","description":"On-page optimization and technical fixes"},{"step":4,"title":"Create","description":"Develop high-quality, SEO-optimized content"},{"step":5,"title":"Build","description":"Earn quality backlinks through outreach"}]',
  '[{"question":"How long does SEO take to work?","answer":"SEO is a long-term investment. Expect to see meaningful improvements in 3-6 months, with compounding results over time."},{"question":"Do you guarantee first page rankings?","answer":"No ethical SEO professional can guarantee specific rankings. We focus on sustainable growth and measurable improvements."}]'),

('Marketing Automation', 'marketing-automation', 'Streamline your marketing workflows with intelligent automation that nurtures leads and drives conversions.', 'Automation', 3,
  '[{"name":"Starter","price":"$599","features":["Email automation setup","3 workflow sequences","Lead scoring","Monthly optimization"]},{"name":"Professional","price":"$1,199","features":["Everything in Starter","CRM integration","10 workflows","A/B testing","Bi-weekly optimization"]},{"name":"Enterprise","price":"$2,999","features":["Everything in Professional","Full martech stack","Unlimited workflows","Custom integrations","Dedicated support"]}]',
  '["Marketing automation platform setup","Email workflow design & implementation","Lead scoring & segmentation","CRM integration & data sync","A/B testing & optimization","ROI tracking & reporting"]',
  '[{"step":1,"title":"Assess","description":"Evaluate current tools and identify automation opportunities"},{"step":2,"title":"Design","description":"Map out customer journeys and automation workflows"},{"step":3,"title":"Build","description":"Set up automation platform and create workflows"},{"step":4,"title":"Test","description":"Thoroughly test all automations before launch"},{"step":5,"title":"Optimize","description":"Monitor performance and continuously improve"}]',
  '[{"question":"Which platforms do you work with?","answer":"HubSpot, Mailchimp, ActiveCampaign, Marketo, Pardot, and custom solutions via Zapier/Make."},{"question":"Can you integrate with our existing CRM?","answer":"Yes, we specialize in CRM integration with tools like Salesforce, HubSpot, Pipedrive, and more."}]'),

('Social Media Marketing', 'social-media-marketing', 'Build your brand presence and engage your audience across all major social media platforms.', 'Social Media', 4,
  '[{"name":"Starter","price":"$349","features":["2 platforms","12 posts/month","Basic analytics","Monthly report"]},{"name":"Professional","price":"$699","features":["4 platforms","20 posts/month","Community management","Stories & Reels","Bi-weekly reports"]},{"name":"Enterprise","price":"$1,499","features":["All platforms","30+ posts/month","Full community management","Influencer outreach","Paid social strategy","Weekly reports"]}]',
  '["Social media strategy & content calendar","Content creation & curation","Community management & engagement","Social media advertising","Influencer partnership management","Analytics & reporting"]',
  '[{"step":1,"title":"Audit","description":"Review current social presence and competitor analysis"},{"step":2,"title":"Strategy","description":"Develop platform-specific content strategy"},{"step":3,"title":"Create","description":"Design and produce engaging content"},{"step":4,"title":"Publish","description":"Schedule and publish across platforms"},{"step":5,"title":"Engage","description":"Community management and audience interaction"}]',
  '[{"question":"Which platforms do you manage?","answer":"Facebook, Instagram, LinkedIn, Twitter/X, TikTok, YouTube, and Pinterest."},{"question":"Do you create the content?","answer":"Yes, we handle content creation including graphics, copy, and short-form video."}]'),

('PPC & Paid Advertising', 'ppc-paid-advertising', 'Maximize your ROI with targeted paid advertising campaigns across Google, Meta, and more.', 'Advertising', 5,
  '[{"name":"Starter","price":"$449","features":["1 platform","Campaign setup","Ad copywriting","Monthly optimization","Basic reporting"]},{"name":"Professional","price":"$899","features":["2 platforms","Advanced targeting","A/B testing","Bi-weekly optimization","Detailed reporting"]},{"name":"Enterprise","price":"$2,199","features":["All platforms","Full-funnel strategy","Dynamic ads","Weekly optimization","Custom dashboard","Dedicated manager"]}]',
  '["Campaign strategy & setup","Ad copywriting & creative direction","Audience targeting & segmentation","Bid management & optimization","Conversion tracking setup","ROI reporting & analysis"]',
  '[{"step":1,"title":"Research","description":"Audience research and competitive analysis"},{"step":2,"title":"Setup","description":"Campaign structure, targeting, and tracking"},{"step":3,"title":"Launch","description":"Launch campaigns with optimized ad copy"},{"step":4,"title":"Monitor","description":"Daily monitoring and bid adjustments"},{"step":5,"title":"Scale","description":"Scale winning campaigns and cut underperformers"}]',
  '[{"question":"What is the minimum ad budget?","answer":"We recommend a minimum of $500/month in ad spend for meaningful results."},{"question":"Which platforms do you advertise on?","answer":"Google Ads, Meta (Facebook/Instagram), LinkedIn Ads, TikTok Ads, and Microsoft Ads."}]'),

('MarTech Consulting', 'martech-consulting', 'Optimize your marketing technology stack for maximum efficiency, integration, and data-driven decision making.', 'Consulting', 6,
  '[{"name":"Starter","price":"$799","features":["Stack audit","Tool recommendations","Integration plan","Implementation support"]},{"name":"Professional","price":"$1,599","features":["Everything in Starter","Full implementation","Data migration","Team training","30-day support"]},{"name":"Enterprise","price":"$3,999","features":["Everything in Professional","Custom development","API integrations","Ongoing management","Quarterly reviews"]}]',
  '["Marketing technology audit","Stack optimization & recommendations","Tool selection & vendor evaluation","Implementation & integration","Data migration & cleanup","Team training & documentation"]',
  '[{"step":1,"title":"Audit","description":"Comprehensive review of current marketing technology"},{"step":2,"title":"Evaluate","description":"Identify gaps, redundancies, and opportunities"},{"step":3,"title":"Recommend","description":"Propose optimized stack with business case"},{"step":4,"title":"Implement","description":"Set up, integrate, and migrate to new tools"},{"step":5,"title":"Train","description":"Team training and documentation handoff"}]',
  '[{"question":"What martech tools do you specialize in?","answer":"Google Marketing Platform, HubSpot, Salesforce Marketing Cloud, Segment, and 50+ other tools."},{"question":"Can you help with data privacy compliance?","answer":"Yes, we ensure your martech stack complies with GDPR, CCPA, and local data protection regulations."}]');

-- Seed blog categories
INSERT INTO blog_categories (name, slug, description) VALUES
('Digital Marketing', 'digital-marketing', 'Tips and strategies for digital marketing success'),
('SEO', 'seo', 'Search engine optimization guides and updates'),
('Marketing Automation', 'marketing-automation', 'Automation tools, workflows, and best practices'),
('Analytics', 'analytics', 'Data analytics, tracking, and reporting insights'),
('Social Media', 'social-media', 'Social media marketing strategies and trends');

-- Seed testimonials
INSERT INTO testimonials (client_name, client_company, client_role, quote, rating, display_order) VALUES
('Ahmed Rahman', 'TechBD Solutions', 'CEO', 'Sabbir transformed our digital marketing strategy completely. Our leads increased by 300% in just 6 months. His expertise in martech is unmatched.', 5, 1),
('Sarah Chen', 'GrowthHive Agency', 'Marketing Director', 'Working with Sabbir was a game-changer. His automation workflows saved us 20 hours per week and improved our email conversion rates by 150%.', 5, 2),
('Michael Torres', 'EcomScale', 'Founder', 'The SEO strategy Sabbir implemented took our organic traffic from 500 to 15,000 monthly visitors. Incredible ROI on our investment.', 5, 3),
('Fatima Al-Rashid', 'MenaDigital', 'Head of Growth', 'Sabbir''s martech consulting helped us integrate our entire marketing stack seamlessly. Data now flows perfectly between all our tools.', 5, 4),
('David Park', 'StartupLaunch Co', 'CTO', 'The paid advertising campaigns Sabbir managed delivered a 5x ROAS. His analytical approach to marketing is exactly what we needed.', 5, 5);

-- Seed site settings
INSERT INTO site_settings (key, value) VALUES
('site_title', '"Md Sabbir Ahsan"'),
('site_tagline', '"Digital Marketer & Martech Specialist"'),
('contact_email', '"sabbirahsan73@gmail.com"'),
('contact_phone', '"+880-1XXX-XXXXXX"'),
('contact_address', '"Dhaka, Bangladesh"'),
('office_hours', '"Sun-Thu, 10:00 AM - 6:00 PM BST"'),
('social_links', '{"facebook":"https://facebook.com/sabbirahsan","linkedin":"https://linkedin.com/in/sabbirahsan","twitter":"https://twitter.com/sabbirahsan","instagram":"https://instagram.com/sabbirahsan","github":"https://github.com/sabbirahsan","youtube":"https://youtube.com/@sabbirahsan"}'),
('primary_color', '"#4c6ef5"'),
('accent_color', '"#ff9800"'),
('animation_intensity', '"full"'),
('dark_mode_default', 'false');

-- Seed email templates
INSERT INTO email_templates (name, subject, html_body, variables) VALUES
('contact_notification', 'New Contact: {{name}} - {{service_interest}}', '<h2>New contact from {{name}}</h2><p>Email: {{email}}</p><p>Service: {{service_interest}}</p><p>Message: {{message}}</p>', '["name","email","service_interest","message"]'),
('contact_auto_reply', 'Thank you for reaching out, {{name}}!', '<h2>Hi {{name}},</h2><p>Thank you for contacting me. I will get back to you within 24 hours.</p><p>Best regards,<br>Sabbir Ahsan</p>', '["name"]'),
('booking_confirmation', 'Booking Confirmed: {{service_name}} on {{booking_date}}', '<h2>Booking Confirmed!</h2><p>Service: {{service_name}}</p><p>Date: {{booking_date}}</p><p>Time: {{booking_time}}</p>', '["service_name","booking_date","booking_time","client_name"]'),
('booking_reminder', 'Reminder: Your appointment tomorrow at {{booking_time}}', '<h2>Appointment Reminder</h2><p>Hi {{client_name}}, this is a reminder about your appointment tomorrow at {{booking_time}}.</p>', '["client_name","booking_time","service_name"]');

-- Create storage bucket for media
-- Run this in Supabase Dashboard > Storage:
-- CREATE BUCKET 'media' with public access

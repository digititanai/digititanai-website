'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
}

const allPosts: BlogPost[] = [
  {
    slug: 'ultimate-guide-digital-marketing-2026',
    title: 'The Ultimate Guide to Digital Marketing in 2026',
    excerpt:
      'Explore the latest strategies, tools, and trends shaping the digital marketing landscape this year.',
    category: 'Digital Marketing',
    date: 'Mar 20, 2026',
    readingTime: '12 min read',
  },
  {
    slug: 'seo-ranking-factors',
    title: 'Top 10 SEO Ranking Factors You Cannot Ignore',
    excerpt:
      'Stay ahead by focusing on these critical ranking factors that actually move the needle.',
    category: 'SEO',
    date: 'Mar 15, 2026',
    readingTime: '8 min read',
  },
  {
    slug: 'marketing-automation-workflows',
    title: 'How to Build Marketing Automation Workflows That Convert',
    excerpt:
      'Step-by-step guide to creating automated email sequences and lead nurturing funnels.',
    category: 'Automation',
    date: 'Mar 10, 2026',
    readingTime: '10 min read',
  },
  {
    slug: 'google-analytics-4-masterclass',
    title: 'Google Analytics 4: A Complete Masterclass',
    excerpt:
      'Learn how to set up events, conversions, and custom reports to make data-driven decisions.',
    category: 'Analytics',
    date: 'Mar 5, 2026',
    readingTime: '15 min read',
  },
  {
    slug: 'social-media-strategy-small-business',
    title: 'Social Media Strategy for Small Businesses on a Budget',
    excerpt:
      'Discover organic growth tactics that deliver real results without a massive budget.',
    category: 'Social Media',
    date: 'Feb 28, 2026',
    readingTime: '7 min read',
  },
  {
    slug: 'local-seo-domination',
    title: "Local SEO: How to Dominate Your City's Search Results",
    excerpt:
      'From Google Business Profile optimisation to local citations, learn everything about local search.',
    category: 'SEO',
    date: 'Feb 20, 2026',
    readingTime: '9 min read',
  },
];

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CategoryArchivePage() {
  const params = useParams();
  const categorySlug = (params?.category as string) ?? '';
  const categoryName = slugToName(categorySlug);

  const posts = useMemo(
    () =>
      allPosts.filter(
        (p) => p.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
      ),
    [categorySlug]
  );

  return (
    <main className="min-h-screen bg-brand-darkest">
      {/* ---- Hero ---- */}
      <section className="section-gap">
        <div className="container-main">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-[14px] text-[#C9BFA6]/35">
            <Link href="/" className="hover:text-[#B89B4A] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#4B8A6C]/30" />
            <Link
              href="/blog"
              className="hover:text-[#B89B4A] transition-colors"
            >
              Blog
            </Link>
            <ChevronRight size={14} className="text-[#4B8A6C]/30" />
            <span className="text-[#E7DDC6]/65">{categoryName}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge mb-6 inline-block">Category</span>
            <h1 className="heading-lg text-gradient-cream">
              {categoryName}
            </h1>
            <p className="mt-5 body-lg text-[#C9BFA6]/50">
              {posts.length} article{posts.length !== 1 ? 's' : ''} found.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="line-divider" />

      {/* ---- Posts Grid ---- */}
      <section className="section-gap">
        <div className="container-main">
          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="body-base text-[#C9BFA6]/40">
                No articles in this category yet.
              </p>
              <Link
                href="/blog"
                className="mt-4 inline-block text-[14px] text-[#6BA88A] hover:text-[#B89B4A] transition-colors"
              >
                Back to all posts
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block h-full"
                  >
                    <div className="card-hover h-full overflow-hidden rounded-2xl">
                      <div className="aspect-video bg-gradient-to-br from-[#215F47] to-[#4B8A6C]/40 flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#215F47] to-[#4B8A6C]/50 group-hover:scale-105 transition-transform duration-700" />
                        <span className="text-[#E7DDC6]/10 text-[12px] relative z-10 font-display italic">
                          Thumbnail
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="badge-green text-[11px]">
                            {post.category}
                          </span>
                          <span className="text-[12px] text-[#C9BFA6]/30">
                            {post.date}
                          </span>
                        </div>
                        <h3 className="text-[16px] text-[#E7DDC6]/80 font-semibold leading-snug group-hover:text-[#E7DDC6] transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-2 body-sm text-[#C9BFA6]/40 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getHomePageData } from '@/lib/homePageData'
import { getBlog, getBlogDetail, loadCollection } from '@/lib/collections'
import { useData } from '@/lib/useData'

const gradients = [
  'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(8,145,178,0.2) 50%, rgba(10,15,26,0.8) 100%)',
  'linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(30,41,59,0.6) 50%, rgba(6,182,212,0.1) 100%)',
  'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(10,15,26,0.7) 50%, rgba(8,145,178,0.15) 100%)',
]

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0, 1] } },
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  image?: string
  slug?: string
}

interface BlogData {
  badge: string
  heading: string
  linkText: string
  posts: BlogPost[]
}

export default function BlogPreview() {
  const { loaded } = useData()
  const [bData, setBData] = useState<BlogData | null>(null)

  useEffect(() => {
    if (!loaded) return
    const load = async () => {
      const blogSection = getHomePageData().blog
      const allBlog = getBlog()
      await Promise.all(allBlog.map((b) => loadCollection(`col_blog_detail_${b.slug}`)))

      const posts: BlogPost[] = blogSection.posts.map((hp: { id: string; title?: string; excerpt?: string; category?: string; date?: string; readTime?: string }) => {
        const col = allBlog.find((b) => b.id === hp.id)
        if (!col) return hp as BlogPost
        const detail = getBlogDetail(col.slug)
        return {
          id: col.id, title: col.title, excerpt: col.excerpt, category: col.category,
          date: col.date, readTime: col.readTime, image: col.image || detail?.image || '', slug: col.slug,
        }
      })

      setBData({ badge: blogSection.badge, heading: blogSection.heading, linkText: blogSection.linkText, posts })
    }
    load()
  }, [loaded])

  const badge = bData?.badge || getHomePageData().blog.badge
  const heading = bData?.heading || getHomePageData().blog.heading
  const linkText = bData?.linkText || getHomePageData().blog.linkText
  const posts = bData?.posts || []
  const gridCols = posts.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : posts.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <section className="section-gap" suppressHydrationWarning>
      <div className="container-main">
        <motion.div className="text-center mb-10 md:mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <span className="badge">{badge}</span>
          <h2 className="mt-5 heading-lg">
            Latest From The <span className="gradient-text">Blog</span>
          </h2>
        </motion.div>

        {posts.length > 0 && (
          <motion.div
            key={posts.length}
            className={`grid gap-6 items-stretch ${gridCols}`}
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {posts.map((post, idx) => (
              <motion.article key={post.id} variants={fadeUp} className="card-hover card-shine overflow-hidden cursor-pointer group h-full flex flex-col">
                <Link href={`/blog/${post.slug || post.id}`} className="flex flex-col h-full">
                  <div className="overflow-hidden">
                    <div className="aspect-[16/9] transition-transform duration-500 group-hover:scale-105 relative" style={{ background: gradients[idx % gradients.length] }}>
                      {post.image && <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />}
                    </div>
                  </div>
                  <div className="p-4 md:p-6 flex flex-col flex-1">
                    <span className="badge">{post.category}</span>
                    <h3 className="heading-sm mt-3 text-brand-cream text-[20px] line-clamp-2">{post.title}</h3>
                    <p className="body-sm mt-2 line-clamp-2 flex-1">{post.excerpt}</p>
                    <div className="mt-4 flex items-center gap-2 text-[12px] font-mono text-surface-400 tracking-wider">
                      <span>{post.date}</span>
                      <span className="w-1 h-1 rounded-full bg-surface-400" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}

        <motion.div className="mt-10 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.7 }}>
          <Link href="/blog" className="btn-ghost font-mono text-[13px] tracking-[0.05em] uppercase">{linkText}</Link>
        </motion.div>
      </div>
    </section>
  )
}

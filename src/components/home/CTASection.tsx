'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

function MagneticButton({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div style={{ x: springX, y: springY }}>
      <Link ref={ref} href={href} className={`magnetic-btn ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        {children}
      </Link>
    </motion.div>
  )
}

export default function CTASection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98])
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [4, 0, -2])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0.5])

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden perspective-2000">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <motion.div
        className="absolute inset-0"
        style={{
          y: bgY,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)',
        }}
      />

      <motion.div className="container-main relative z-10 text-center" style={{ opacity, scale, rotateX }}>
        <motion.h2
          className="heading-xl max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Ready to <span className="gradient-text">Transform</span> Your Digital Presence?
        </motion.h2>

        <motion.p
          className="mt-6 body-lg max-w-xl mx-auto text-brand-cream-dark"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Book a free discovery call and let&apos;s discuss how we can drive measurable growth for your business.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <MagneticButton href="/book" className="btn-primary animate-magnetic-pulse gap-2.5">
            Book Free Consultation
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
          <MagneticButton href="/services" className="btn-secondary gap-2.5">
            Explore Services
          </MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  )
}

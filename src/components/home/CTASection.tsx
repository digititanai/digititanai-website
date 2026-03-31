'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ── Magnetic Button ── */
function MagneticButton({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className: string;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      className={`${className} magnetic-btn`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
}

export default function CTASection() {
  return (
    <section className="section-gap">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0, 1] }}
          className="relative card-gold p-12 md:p-20 text-center overflow-hidden"
        >
          {/* Mesh gradient background */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                'radial-gradient(ellipse at 30% 30%, rgba(75,138,108,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(184,155,74,0.1) 0%, transparent 50%)',
            }}
          />

          {/* Floating gold dots */}
          <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-brand-gold/30 animate-float" />
          <div className="absolute top-12 right-16 w-1.5 h-1.5 rounded-full bg-brand-gold/20 animate-float-slow" />
          <div className="absolute bottom-10 left-20 w-1.5 h-1.5 rounded-full bg-brand-gold/25 animate-float" />
          <div className="absolute bottom-16 right-12 w-2 h-2 rounded-full bg-brand-gold/20 animate-float-slow" />
          <div className="absolute top-1/2 left-6 w-1 h-1 rounded-full bg-brand-gold/15 animate-bounce-subtle" />
          <div className="absolute top-1/3 right-8 w-1 h-1 rounded-full bg-brand-gold/15 animate-bounce-subtle" />

          {/* Content */}
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="heading-lg"
            >
              Ready to Transform Your
              <br />
              Digital Presence?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="body-lg mt-5 max-w-lg mx-auto"
            >
              Let&apos;s talk about what we can create together. From strategy to
              execution, I&apos;m here to help your brand grow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-10 flex items-center justify-center gap-4"
            >
              <MagneticButton href="/contact" className="btn-primary">
                Start a Project
              </MagneticButton>
              <MagneticButton href="/book" className="btn-secondary">
                Book a Free Call
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

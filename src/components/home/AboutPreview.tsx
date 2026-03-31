'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

/* ── Count-up hook ── */
function useCountUp(target: number, isInView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return count;
}

/* ── Stat item ── */
function StatItem({ value, suffix, label, isInView, delay }: {
  value: number;
  suffix: string;
  label: string;
  isInView: boolean;
  delay: number;
}) {
  const count = useCountUp(value, isInView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.7, ease: [0.25, 0.4, 0, 1] }}
    >
      <div className="text-[56px] font-display font-bold text-brand-cream leading-none">
        {count}{suffix}
      </div>
      <div className="w-8 h-0.5 bg-brand-gold mt-3" />
      <div className="body-sm mt-2">{label}</div>
    </motion.div>
  );
}

const stats = [
  { value: 5, suffix: '+', label: 'Years Experience' },
  { value: 100, suffix: '+', label: 'Projects Delivered' },
  { value: 50, suffix: '+', label: 'Happy Clients' },
  { value: 15, suffix: '+', label: 'Certifications' },
];

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.4, 0, 1] },
  },
};

export default function AboutPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // parallax for photo
  const photoY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={sectionRef} className="section-gap">
      <div className="container-main">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="badge">About Me</span>
        </motion.div>

        {/* Two columns */}
        <div className="mt-10 grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: 7 cols */}
          <motion.div
            className="lg:col-span-7"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="heading-lg">
              Turning Strategy Into Measurable Growth
            </motion.h2>

            <motion.p variants={fadeUp} className="body-base mt-6">
              I&apos;m Sabbir Ahsan -- a digital marketer and MarTech specialist
              with over five years of experience helping brands grow through
              data-driven strategies. I combine creative thinking with technical
              expertise to deliver measurable, lasting results.
            </motion.p>

            <motion.p variants={fadeUp} className="body-base mt-4">
              From building automated lead pipelines to scaling e-commerce
              revenue, I focus on systems that compound over time. I believe the
              best marketing feels invisible -- it just works.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8">
              <Link href="/about" className="btn-ghost">
                Learn more about me &rarr;
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: 5 cols - Photo placeholder with parallax */}
          <div className="lg:col-span-5 relative">
            {/* Decorative gold dot pattern */}
            <div className="absolute -right-4 -top-4 w-32 h-40 opacity-20">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #B89B4A 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
              />
            </div>

            <motion.div
              ref={photoRef}
              style={{ y: photoY }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden"
            >
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, #215F47 0%, #4B8A6C 50%, #215F47 100%)',
                }}
              />
              <div className="absolute inset-0 rounded-2xl border border-brand-mid/20" />
            </motion.div>
          </div>
        </div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="mt-20 pt-12 border-t border-brand-mid/10 grid grid-cols-2 md:grid-cols-4 gap-10 items-stretch"
        >
          {stats.map((stat, i) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              isInView={statsInView}
              delay={i * 0.12}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

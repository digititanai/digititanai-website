'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function SectionDivider() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scaleX = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.8])
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -10])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  return (
    <div ref={ref} className="py-4 md:py-6 perspective-1000">
      <div className="container-main">
        <motion.div
          className="h-px w-full origin-center"
          style={{
            scaleX,
            rotateY,
            opacity,
            background: 'linear-gradient(90deg, transparent, #06b6d4, #22d3ee, #06b6d4, transparent)',
            boxShadow: '0 0 8px rgba(6,182,212,0.3), 0 0 20px rgba(6,182,212,0.1)',
          }}
        />
      </div>
    </div>
  )
}

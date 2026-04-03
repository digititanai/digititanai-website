'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #06b6d4 0%, #22d3ee 50%, #06b6d4 100%)',
        boxShadow: '0 0 10px rgba(6,182,212,0.5), 0 0 30px rgba(6,182,212,0.2)',
      }}
    />
  )
}

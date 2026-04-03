'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  tiltAmount?: number
  glowColor?: string
}

export default function TiltCard({
  children,
  className = '',
  tiltAmount = 15,
  glowColor = 'rgba(6,182,212,0.15)',
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const rotateX = useTransform(smoothY, [0, 1], [tiltAmount, -tiltAmount])
  const rotateY = useTransform(smoothX, [0, 1], [-tiltAmount, tiltAmount])

  const glowX = useTransform(smoothX, [0, 1], ['0%', '100%'])
  const glowY = useTransform(smoothY, [0, 1], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        rotateX,
        rotateY,
      }}
      className={`h-full relative ${className}`}
    >
      {/* Glow layer that follows mouse */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-0"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]) => `radial-gradient(circle at ${x} ${y}, ${glowColor}, transparent 60%)`
          ),
          opacity: 0.6,
        }}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  )
}

'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  tiltIntensity?: number
  glare?: boolean
  onClick?: () => void
}

export default function Card({
  children,
  className = '',
  tiltIntensity = 10,
  glare = true,
  onClick,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: 300, damping: 20 }
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]), springConfig)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]), springConfig)

  const glareOpacity = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return

    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5

    x.set(px)
    y.set(py)
    glareOpacity.set(0.15)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    glareOpacity.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-sm hover:shadow-xl transition-shadow duration-300 ${className}`}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {children}

      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ opacity: glareOpacity }}
        />
      )}
    </motion.div>
  )
}

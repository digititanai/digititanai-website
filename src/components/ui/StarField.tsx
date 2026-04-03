'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function StarField() {
  const stars = useMemo(() => Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: random(0, 100),
    y: random(0, 100),
    size: random(1, 3),
    opacity: random(0.2, 0.8),
    duration: random(2, 6),
    delay: random(0, 4),
  })), [])

  const shootingStars = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i,
    startX: random(10, 90),
    startY: random(0, 40),
    duration: random(1.5, 3),
    delay: random(0, 12),
    repeatDelay: random(8, 20),
    angle: random(20, 50),
    length: random(80, 160),
  })), [])

  const nebulae = [
    { x: '20%', y: '15%', size: 500, color: 'rgba(6,182,212,0.04)', blur: 80 },
    { x: '70%', y: '50%', size: 400, color: 'rgba(8,145,178,0.03)', blur: 100 },
    { x: '40%', y: '75%', size: 350, color: 'rgba(34,211,238,0.02)', blur: 90 },
    { x: '85%', y: '20%', size: 300, color: 'rgba(6,182,212,0.025)', blur: 70 },
  ]

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ background: '#0a0f1a' }}>
      {/* Deep space gradient */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(10,15,26,1) 0%, rgba(10,15,26,1) 100%)',
      }} />

      {/* Nebula clouds */}
      {nebulae.map((n, i) => (
        <motion.div
          key={`nebula-${i}`}
          className="absolute rounded-full"
          style={{
            left: n.x, top: n.y,
            width: n.size, height: n.size,
            background: `radial-gradient(circle, ${n.color} 0%, transparent 70%)`,
            filter: `blur(${n.blur}px)`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
          }}
          transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Twinkling stars */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-brand-cream"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Shooting stars */}
      {shootingStars.map((s) => (
        <motion.div
          key={`shoot-${s.id}`}
          className="absolute"
          style={{
            left: `${s.startX}%`,
            top: `${s.startY}%`,
            width: s.length,
            height: 2,
            borderRadius: 1,
            background: `linear-gradient(90deg, rgba(6,182,212,0.8), rgba(226,232,240,0.6), transparent)`,
            transformOrigin: '0% 50%',
            rotate: `${s.angle}deg`,
          }}
          initial={{ scaleX: 0, opacity: 0, x: 0, y: 0 }}
          animate={{
            scaleX: [0, 1, 1, 0],
            opacity: [0, 0.9, 0.7, 0],
            x: [0, s.length * 0.8],
            y: [0, s.length * Math.tan(s.angle * Math.PI / 180) * 0.4],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            repeatDelay: s.repeatDelay,
            ease: 'easeOut',
            times: [0, 0.1, 0.7, 1],
          }}
        />
      ))}


      {/* Subtle dust particles floating upward */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute w-px bg-gradient-to-t from-brand-mid/20 to-transparent"
          style={{
            left: `${5 + i * 6.5}%`,
            bottom: 0,
            height: random(40, 120),
          }}
          animate={{
            y: [0, -200, -400],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: random(6, 14),
            repeat: Infinity,
            delay: random(0, 10),
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

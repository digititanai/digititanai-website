'use client'

import { motion } from 'framer-motion'

const particles = [
  { id: 0, x: 5, y: 8, size: 2, duration: 8, delay: 0 },
  { id: 1, x: 12, y: 25, size: 1.5, duration: 10, delay: 1 },
  { id: 2, x: 20, y: 15, size: 2.5, duration: 7, delay: 0.5 },
  { id: 3, x: 28, y: 45, size: 1, duration: 12, delay: 2 },
  { id: 4, x: 35, y: 70, size: 2, duration: 9, delay: 1.5 },
  { id: 5, x: 42, y: 30, size: 1.5, duration: 11, delay: 0.8 },
  { id: 6, x: 50, y: 55, size: 2, duration: 8, delay: 3 },
  { id: 7, x: 58, y: 12, size: 1, duration: 13, delay: 0.3 },
  { id: 8, x: 65, y: 80, size: 2.5, duration: 7, delay: 2.5 },
  { id: 9, x: 72, y: 40, size: 1.5, duration: 10, delay: 1.2 },
  { id: 10, x: 78, y: 65, size: 2, duration: 9, delay: 0.7 },
  { id: 11, x: 85, y: 20, size: 1, duration: 11, delay: 3.5 },
  { id: 12, x: 90, y: 50, size: 2, duration: 8, delay: 1.8 },
  { id: 13, x: 95, y: 85, size: 1.5, duration: 12, delay: 0.4 },
  { id: 14, x: 8, y: 60, size: 2, duration: 10, delay: 2.2 },
  { id: 15, x: 18, y: 90, size: 1, duration: 9, delay: 1.6 },
  { id: 16, x: 40, y: 5, size: 2.5, duration: 7, delay: 3.2 },
  { id: 17, x: 55, y: 92, size: 1.5, duration: 11, delay: 0.9 },
  { id: 18, x: 70, y: 10, size: 2, duration: 8, delay: 2.8 },
  { id: 19, x: 88, y: 35, size: 1, duration: 13, delay: 1.1 },
]

const orbs = [
  { x: '20%', y: '30%', size: 350, color: 'rgba(6,182,212,0.04)', duration: 20 },
  { x: '75%', y: '65%', size: 280, color: 'rgba(6,182,212,0.03)', duration: 25 },
]

export default function FloatingParticles() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {particles.map((p) => (
        <motion.div
          key={`particle-${p.id}`}
          className="absolute rounded-full bg-brand-mid/15"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
            opacity: [0.05, 0.2, 0.05],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

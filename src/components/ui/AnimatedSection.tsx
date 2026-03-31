'use client';

import { motion, type Variants } from 'framer-motion';
import React from 'react';

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface AnimatedSectionProps {
  children: React.ReactNode;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

const getVariants = (direction: AnimationDirection, duration: number): Variants => {
  const hidden: Record<string, number> = { opacity: 0 };
  const visible: Record<string, number> = { opacity: 1 };

  switch (direction) {
    case 'up':
      hidden.y = 40;
      visible.y = 0;
      break;
    case 'down':
      hidden.y = -40;
      visible.y = 0;
      break;
    case 'left':
      hidden.x = 40;
      visible.x = 0;
      break;
    case 'right':
      hidden.x = -40;
      visible.x = 0;
      break;
    case 'none':
    default:
      break;
  }

  return {
    hidden,
    visible: {
      ...visible,
      transition: {
        duration,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };
};

export default function AnimatedSection({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
  amount = 0.15,
}: AnimatedSectionProps) {
  return (
    <motion.div
      variants={getVariants(direction, duration)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

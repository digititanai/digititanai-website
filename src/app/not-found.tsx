'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-darkest px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <div className="relative mb-8">
          <span className="text-[150px] md:text-[200px] font-display font-bold text-brand-mid/10 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-mid to-brand-gold animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-cream mb-4">
          Page Not Found
        </h1>
        <p className="text-brand-cream/50 text-lg mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="h-11 px-6 text-[14px] font-medium bg-brand-gold text-brand-darkest rounded-xl hover:bg-brand-gold-light transition-colors inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="h-11 px-6 text-[14px] font-medium border border-brand-mid/20 text-brand-cream rounded-xl hover:border-brand-mid/30 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}

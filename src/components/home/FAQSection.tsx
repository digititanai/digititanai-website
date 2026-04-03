'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { loadHomePageData, getHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'

export default function FAQSection() {
  const { loaded } = useData()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [fData, setFData] = useState(() => getHomePageData().faq)
  useEffect(() => { if (loaded) loadHomePageData().then(d => setFData(d.faq)) }, [loaded])

  return (
    <section className="section-gap" suppressHydrationWarning>
      <div className="container-main">
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge">FAQ</span>
          <h2 className="mt-5 heading-lg">
            {fData.heading.split(' ').slice(0, 1).join(' ')}{' '}
            <span className="gradient-text">{fData.heading.split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="mt-4 body-base max-w-lg mx-auto">{fData.subtitle}</p>
        </motion.div>

        <div className="max-w-3xl mx-auto perspective-1000 space-y-3">
          {fData.faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="preserve-3d"
              initial={{ opacity: 0, rotateX: -15 }}
              whileInView={{ opacity: 1, rotateX: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`w-full text-left p-5 md:p-6 rounded-xl bg-surface-200 border border-surface-300/30 transition-all duration-300 group
                  ${openIndex === i ? 'bg-surface-300/50 border-brand-mid/20' : 'hover:bg-surface-300/30'}`}
                whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(6,182,212,0.06)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[15px] font-display font-semibold text-brand-cream leading-snug pr-2">
                    {faq.question}
                  </h3>
                  <motion.div
                    className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300
                      ${openIndex === i ? 'border-brand-mid/40 bg-brand-mid/10' : 'border-surface-300'}`}
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-colors ${openIndex === i ? 'text-brand-mid' : 'text-surface-400'}`} />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.4, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-[14px] leading-[1.75] text-brand-cream-dark">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

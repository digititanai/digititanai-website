'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { loadHomePageData, defaultHomePageData } from '@/lib/homePageData'
import { useData } from '@/lib/useData'

export default function FAQSection() {
  const { loaded } = useData()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [fData, setFData] = useState(defaultHomePageData.faq)
  useEffect(() => { if (loaded) loadHomePageData().then(d => setFData(d.faq)) }, [loaded])

  return (
    <section className="section-gap" suppressHydrationWarning>
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="heading-lg"
          >
            {fData.heading}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-4 body-base max-w-lg mx-auto"
          >
            {fData.subtitle}
          </motion.p>
        </div>

        {/* FAQ Grid - 2 columns */}
        <motion.div
          className="grid md:grid-cols-2 gap-4 items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {fData.faqs.map((faq, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="h-full"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`w-full h-full text-left rounded-2xl p-5 md:p-6 border transition-all duration-300 flex flex-col
                  ${openIndex === i
                    ? 'bg-brand-mid/[0.08] border-brand-mid/20'
                    : 'bg-brand-darkest/40 border-brand-mid/[0.08] hover:border-brand-mid/15'
                  }`}
              >
                <div className="flex items-center justify-between gap-4 flex-1">
                  <h3 className="text-[15px] font-semibold text-brand-cream leading-snug pr-2">
                    {faq.question}
                  </h3>
                  <div className={`w-7 h-7 rounded-full border border-brand-mid/20 flex items-center justify-center shrink-0 transition-all duration-300
                    ${openIndex === i ? 'bg-brand-gold/15 border-brand-gold/30 rotate-45' : ''}`}>
                    <Plus className={`w-3.5 h-3.5 transition-colors ${openIndex === i ? 'text-brand-gold' : 'text-brand-cream/40'}`} />
                  </div>
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
                      <p className="mt-4 text-[14px] leading-[1.7] text-brand-cream/70">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

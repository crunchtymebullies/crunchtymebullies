'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  label?: string
  heading?: string
  subheading?: string
  centered?: boolean
  id?: string
}

export default function Section({
  children,
  className = '',
  label,
  heading,
  subheading,
  centered = false,
  id,
}: SectionProps) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
      <div className="page-section">
        {(label || heading || subheading) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`mb-12 md:mb-16 ${centered ? 'text-center' : ''}`}
          >
            {label && <span className="section-label">{label}</span>}
            {heading && <h2 className="section-heading">{heading}</h2>}
            {subheading && (
              <p className={`section-subheading ${centered ? 'mx-auto' : ''}`}>
                {subheading}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  )
}

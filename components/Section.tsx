export default function Section({
  children, className = '', label, heading, subheading, dark = false, centered, ...rest
}: {
  children: React.ReactNode; className?: string; label?: string; heading?: string; subheading?: string; dark?: boolean; [key: string]: any;
}) {
  return (
    <section className={`py-20 md:py-28 ${dark ? 'bg-brand-dark' : ''} ${className}`}>
      <div className="max-w-site mx-auto px-4 md:px-8">
        {(label || heading) && (
          <div className="text-center mb-16">
            {label && <span className="section-label mb-4 block">{label}</span>}
            {heading && <h2 className="font-display text-white text-4xl md:text-5xl mb-4">{heading}</h2>}
            {subheading && <p className="text-white/40 font-body max-w-2xl mx-auto">{subheading}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

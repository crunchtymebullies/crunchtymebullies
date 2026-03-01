export default function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  const repeated = [...items, ...items, ...items, ...items]

  return (
    <div className={`overflow-hidden py-5 bg-brand-dark border-y border-white/5 ${className}`}>
      <div className="marquee-track">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="marquee-item">{item}</span>
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  )
}

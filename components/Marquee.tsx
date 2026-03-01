export default function Marquee({ items, speed = 15, className = '' }: { items: string[]; speed?: number; className?: string }) {
  const repeated = [...items, ...items, ...items, ...items]

  return (
    <div className={`overflow-hidden py-5 bg-brand-dark border-y border-white/5 ${className}`}>
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
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

'use client'

export default function HaloGlow({ 
  position = 'center', color = 'gold', size = 400, className = '' 
}: { 
  position?: 'left' | 'center' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  color?: 'gold' | 'blue' | 'emerald' | 'purple'
  size?: number
  className?: string 
}) {
  const posMap: Record<string, string> = {
    'left': 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'right': 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
    'center': 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'top-left': 'left-0 top-0 -translate-x-1/3 -translate-y-1/3',
    'top-right': 'right-0 top-0 translate-x-1/3 -translate-y-1/3',
    'bottom-left': 'left-0 bottom-0 -translate-x-1/3 translate-y-1/3',
    'bottom-right': 'right-0 bottom-0 translate-x-1/3 translate-y-1/3',
  }

  const colorMap: Record<string, string> = {
    gold: 'from-gold/[0.08] via-gold/[0.03]',
    blue: 'from-blue-500/[0.08] via-blue-500/[0.03]',
    emerald: 'from-emerald-500/[0.08] via-emerald-500/[0.03]',
    purple: 'from-purple-500/[0.08] via-purple-500/[0.03]',
  }

  return (
    <div
      className={`absolute ${posMap[position]} rounded-full bg-radial ${colorMap[color]} to-transparent pointer-events-none animate-halo-pulse ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

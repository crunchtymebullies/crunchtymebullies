'use client'

import { useEffect, useRef } from 'react'

interface Orb {
  x: number; y: number; radius: number
  vx: number; vy: number
  hue: number; alpha: number
  pulseSpeed: number; pulseOffset: number
}

export default function AuroraCanvas({ className = '', orbCount = 4, intensity = 0.12 }: { className?: string; orbCount?: number; intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = 0, h = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas.parentElement?.getBoundingClientRect()
      w = rect?.width || window.innerWidth
      h = rect?.height || window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Create orbs — gold/amber tones
    const orbs: Orb[] = Array.from({ length: orbCount }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: Math.random() * 200 + 150,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      hue: 38 + Math.random() * 12, // gold range
      alpha: intensity,
      pulseSpeed: 0.005 + Math.random() * 0.01,
      pulseOffset: Math.random() * Math.PI * 2,
    }))

    let time = 0
    const render = () => {
      time++
      ctx.clearRect(0, 0, w, h)

      for (const orb of orbs) {
        // Drift
        orb.x += orb.vx
        orb.y += orb.vy

        // Bounce off edges softly
        if (orb.x < -orb.radius) orb.x = w + orb.radius
        if (orb.x > w + orb.radius) orb.x = -orb.radius
        if (orb.y < -orb.radius) orb.y = h + orb.radius
        if (orb.y > h + orb.radius) orb.y = -orb.radius

        // Pulse
        const pulse = Math.sin(time * orb.pulseSpeed + orb.pulseOffset)
        const currentRadius = orb.radius + pulse * 40
        const currentAlpha = orb.alpha + pulse * 0.03

        // Draw radial gradient orb
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, currentRadius)
        grad.addColorStop(0, `hsla(${orb.hue}, 60%, 55%, ${currentAlpha})`)
        grad.addColorStop(0.4, `hsla(${orb.hue}, 50%, 45%, ${currentAlpha * 0.5})`)
        grad.addColorStop(1, `hsla(${orb.hue}, 40%, 35%, 0)`)

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      animId = requestAnimationFrame(render)
    }

    // Reduce frame rate on mobile for battery
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      let lastTime = 0
      const throttledRender = (now: number) => {
        if (now - lastTime > 33) { // ~30fps
          lastTime = now
          time++
          ctx.clearRect(0, 0, w, h)
          for (const orb of orbs) {
            orb.x += orb.vx
            orb.y += orb.vy
            if (orb.x < -orb.radius) orb.x = w + orb.radius
            if (orb.x > w + orb.radius) orb.x = -orb.radius
            if (orb.y < -orb.radius) orb.y = h + orb.radius
            if (orb.y > h + orb.radius) orb.y = -orb.radius
            const pulse = Math.sin(time * orb.pulseSpeed + orb.pulseOffset)
            const r = orb.radius + pulse * 40
            const a = orb.alpha + pulse * 0.03
            const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r)
            grad.addColorStop(0, `hsla(${orb.hue}, 60%, 55%, ${a})`)
            grad.addColorStop(0.4, `hsla(${orb.hue}, 50%, 45%, ${a * 0.5})`)
            grad.addColorStop(1, `hsla(${orb.hue}, 40%, 35%, 0)`)
            ctx.fillStyle = grad
            ctx.beginPath()
            ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        animId = requestAnimationFrame(throttledRender)
      }
      animId = requestAnimationFrame(throttledRender)
    } else {
      render()
    }

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [orbCount, intensity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

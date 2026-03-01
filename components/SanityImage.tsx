'use client'

import Image from 'next/image'

interface SanityImageProps {
  image: {
    asset?: { url: string }
    alt?: string
    fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
    position?: string
    opacity?: number
  }
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
}

export default function SanityImage({
  image,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes = '100vw',
}: SanityImageProps) {
  if (!image?.asset?.url) return null

  const fit = image.fit || 'cover'
  const position = image.position || 'center'
  const opacity = image.opacity ?? 100

  const style: React.CSSProperties = {
    objectFit: fit,
    objectPosition: position,
    opacity: opacity / 100,
  }

  if (fill) {
    return (
      <Image
        src={image.asset.url}
        alt={image.alt || ''}
        fill
        className={className}
        style={style}
        priority={priority}
        sizes={sizes}
      />
    )
  }

  return (
    <Image
      src={image.asset.url}
      alt={image.alt || ''}
      width={width || 800}
      height={height || 600}
      className={className}
      style={style}
      priority={priority}
      sizes={sizes}
    />
  )
}

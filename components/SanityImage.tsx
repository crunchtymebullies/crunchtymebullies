import Image from 'next/image'

export default function SanityImage({ image, className, fill, width, height, priority, sizes }: {
  image: any; className?: string; fill?: boolean; width?: number; height?: number; priority?: boolean; sizes?: string;
}) {
  if (!image?.asset?.url) return null
  const props: any = { src: image.asset.url, alt: image.alt || '', className }
  if (fill) { props.fill = true; props.sizes = sizes || '100vw' }
  else { props.width = width || 800; props.height = height || 600 }
  if (priority) props.priority = true
  return <Image {...props} />
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.crunchtymebullies.com' }],
        destination: 'https://crunchtymebullies.com/:path*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/store/:path*',
        destination: 'https://crunchtime-bullies-backend.fly.dev/store/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'testlink.vigourcreative.com' },
      { protocol: 'https', hostname: 'crunchtime-bullies-backend.fly.dev' },
      { protocol: 'https', hostname: '**.printful.com' },
      { protocol: 'https', hostname: '**.printfiles.com' },
    ],
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
import path from 'path'

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL
    if (!backend) return []
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ]
  },
  // Ensure Next.js traces files relative to the monorepo root to avoid workspace root inference issues
  outputFileTracingRoot: path.resolve(process.cwd(), '..'),
}

export default nextConfig

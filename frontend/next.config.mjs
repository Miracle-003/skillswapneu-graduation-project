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
  // Ensure Next.js traces files relative to the monorepo root to avoid workspace root inference issues
  outputFileTracingRoot: path.resolve(process.cwd(), '..'),
}

export default nextConfig

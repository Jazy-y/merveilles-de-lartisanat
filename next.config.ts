import type { NextConfig } from 'next'
import { apiSecurityHeaders, pageSecurityHeaders } from './src/lib/security-policy'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'images.squarespace-cdn.com' },
      { protocol: 'https', hostname: 'images.freeimages.com' },
      { protocol: 'https', hostname: 'maisonmedina.fr' },
      { protocol: 'https', hostname: 'www.google.com' },
      // Admin uploads stored in Vercel Blob
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  async headers() {
    return [
      // every page (the middleware only runs on admin routes)
      { source: '/((?!api/).*)', headers: pageSecurityHeaders() },
      { source: '/api/:path*', headers: apiSecurityHeaders() },
    ]
  },
  compiler: {
    // Strip console.* in production builds, keep errors for diagnostics
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
}

export default nextConfig

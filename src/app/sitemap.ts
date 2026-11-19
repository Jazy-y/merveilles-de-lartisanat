import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const locales = ['en', 'fr', 'ar']
  
  const routes = [
    '',
    '/about',
    '/products',
    '/contact',
    '/auth/signin',
    '/auth/signup',
  ]

  const sitemap: MetadataRoute.Sitemap = []

  // Add root pages for each locale
  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
      })
    })
  })

  return sitemap
}


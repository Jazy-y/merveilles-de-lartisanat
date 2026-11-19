import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
  locale?: string
}

export function generateMetadata({
  title,
  description,
  keywords,
  image = '/og-image.jpg',
  url,
  locale = 'en'
}: SEOProps): Metadata {
  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl

  return {
    title: `${title} | Arti - Tunisian Artisan Products`,
    description,
    keywords: keywords || 'Tunisian artisan products, handcrafted, pottery, textiles, jewelry, leather, traditional crafts',
    authors: [{ name: 'Arti Team' }],
    creator: 'Arti',
    publisher: 'Arti',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        'en': `${siteUrl}/en`,
        'fr': `${siteUrl}/fr`,
        'ar': `${siteUrl}/ar`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: fullUrl,
      title: `${title} | Arti`,
      description,
      siteName: 'Arti - Tunisian Artisan Products',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Arti`,
      description,
      images: [image],
      creator: '@arti_tn',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION,
    },
  }
}

export const defaultSEO = {
  title: 'Arti - Authentic Tunisian Artisan Products',
  description: 'Discover authentic Tunisian artisan products. Handcrafted treasures from the heart of Tunisia, preserving traditional craftsmanship for future generations.',
  keywords: 'Tunisian artisan products, handcrafted, pottery, textiles, jewelry, leather, traditional crafts, Tunisia',
  image: '/og-image.jpg',
}


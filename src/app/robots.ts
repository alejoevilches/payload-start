import type { MetadataRoute } from 'next'
import { getSiteSettings, getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = getSiteUrl((await getSiteSettings()).seo?.siteUrl)
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${base}/sitemap.xml`,
  }
}

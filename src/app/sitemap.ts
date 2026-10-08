import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSiteSettings, getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const base = getSiteUrl((await getSiteSettings()).seo?.siteUrl)
  const query = { limit: 0, pagination: false as const, depth: 0, where: { _status: { equals: 'published' as const } } }
  const [pages, posts] = await Promise.all([
    payload.find({ collection: 'pages', ...query }),
    payload.find({ collection: 'posts', ...query }),
  ])
  const entry = (path: string, updatedAt: string) => ({ url: `${base}${path === '/' ? '' : path}`, lastModified: updatedAt })
  return [
    ...pages.docs.filter((d) => !d.seo?.noIndex).map((d) => entry(d.slug === '/' ? '/' : `/${d.slug}`, d.updatedAt)),
    ...posts.docs.filter((d) => !d.seo?.noIndex).map((d) => entry(`/blog/${d.slug}`, d.updatedAt)),
  ]
}

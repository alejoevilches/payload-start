import type { Metadata } from 'next'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { permanentRedirect, redirect } from 'next/navigation'
import { normalizePath } from './normalizePath'

type MediaLike = { url?: string | null; alt?: string | null; sizes?: { og?: { url?: string | null } | null } | null }

type SeoDoc = {
  title: string
  excerpt?: string | null
  featuredImage?: unknown
  publishedAt?: string | null
  seo?: {
    title?: string | null
    description?: string | null
    ogTitle?: string | null
    ogDescription?: string | null
    ogImage?: unknown
    ogType?: 'website' | 'article' | null
    noIndex?: boolean | null
    noFollow?: boolean | null
    canonicalUrl?: string | null
  } | null
}

export const getSiteSettings = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'siteSettings', depth: 1 })
})

export function getSiteUrl(siteUrl?: string | null): string {
  const url = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return url.replace(/\/+$/, '')
}

const mediaUrl = (m: unknown): string | undefined => {
  if (!m || typeof m !== 'object') return undefined
  const media = m as MediaLike
  return media.sizes?.og?.url || media.url || undefined
}

type Settings = Awaited<ReturnType<typeof getSiteSettings>>

export function buildMetadata(doc: SeoDoc, settings: Settings, path: string, ogType?: 'website' | 'article'): Metadata {
  const seo = doc.seo ?? {}
  const s = settings.seo ?? {}
  const base = seo.title || doc.title
  const suffix = s.titleSuffix ?? ''
  const title = suffix && !base.includes(suffix.trim()) ? `${base}${suffix}` : base
  const description = seo.description || doc.excerpt || s.defaultDescription || undefined
  const image = mediaUrl(seo.ogImage) || mediaUrl(doc.featuredImage) || mediaUrl(s.defaultOgImage)
  const canonical = seo.canonicalUrl || normalizePath(path)
  const type = seo.ogType || ogType || 'website'

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: !seo.noIndex, follow: !seo.noFollow },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonical,
      siteName: s.siteName || undefined,
      type,
      ...(type === 'article' && doc.publishedAt ? { publishedTime: doc.publishedAt } : {}),
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      site: s.twitterHandle || undefined,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export async function handleRedirect(path: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'redirects',
    where: { from: { equals: normalizePath(path) } },
    limit: 1,
    depth: 0,
    pagination: false,
  })
  const hit = docs[0]
  if (!hit) return
  if (hit.type === '302') redirect(hit.to)
  permanentRedirect(hit.to)
}

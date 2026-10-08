import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import RenderBlocks from '@/components/RenderBlocks'
import JsonLd from '@/components/JsonLd'
import { publishedQuery } from '@/lib/published'
import { buildMetadata, getSiteSettings, handleRedirect } from '@/lib/seo'

type Params = { params: Promise<{ slug: string[] }> }

const toSlug = (slug: string[]) => slug.map(decodeURIComponent).join('/')

async function getPage(fullSlug: string) {
  const payload = await getPayload({ config })
  const { draft, where } = await publishedQuery({ slug: { equals: fullSlug } })
  const { docs } = await payload.find({ collection: 'pages', where, draft, limit: 1 })
  return docs[0]
}

export async function generateMetadata({ params }: Params) {
  const fullSlug = toSlug((await params).slug)
  const page = await getPage(fullSlug)
  if (!page) return {}
  return buildMetadata(page, await getSiteSettings(), `/${fullSlug}`)
}

export default async function Page({ params }: Params) {
  const fullSlug = toSlug((await params).slug)
  await handleRedirect(`/${fullSlug}`)
  const page = await getPage(fullSlug)
  if (!page) notFound()
  return (
    <>
      <JsonLd items={page.seo?.jsonLd} />
      <RenderBlocks blocks={page.components} />
    </>
  )
}

export const dynamic = 'force-dynamic'

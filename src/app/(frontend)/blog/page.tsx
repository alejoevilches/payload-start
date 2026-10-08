import { getPayload } from 'payload'
import config from '@payload-config'
import RenderBlocks from '@/components/RenderBlocks'
import JsonLd from '@/components/JsonLd'
import { publishedQuery } from '@/lib/published'
import { buildMetadata, getSiteSettings } from '@/lib/seo'

async function getPage() {
  const payload = await getPayload({ config })
  const { draft, where } = await publishedQuery({ slug: { equals: 'blog' } })
  const { docs } = await payload.find({ collection: 'pages', where, draft, limit: 1 })
  return docs[0]
}

export async function generateMetadata() {
  const page = await getPage()
  if (!page) return {}
  return buildMetadata(page, await getSiteSettings(), '/blog')
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }){
  const { q } = await searchParams
  const page = await getPage()
  if (!page) return;
  return (
    <>
      <JsonLd items={page.seo?.jsonLd} />
      <RenderBlocks blocks={page.components} searchParams={{ q }} />
    </>
  )
}

export const dynamic = 'force-dynamic'

import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import BlogRichText from '@/components/BlogRichText'
import JsonLd from '@/components/JsonLd'
import { formatPostDate } from '@/lib/formatPostDate'
import { publishedQuery } from '@/lib/published'
import { buildMetadata, getSiteSettings, handleRedirect } from '@/lib/seo'

type Params = { params: Promise<{ post: string }> }

async function getPost(slug: string) {
  const payload = await getPayload({ config })
  const { draft, where } = await publishedQuery({ slug: { equals: slug } })
  const { docs } = await payload.find({ collection: 'posts', where, draft, limit: 1 })
  return docs[0]
}

export async function generateMetadata({ params }: Params) {
  const { post: slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return buildMetadata(post, await getSiteSettings(), `/blog/${slug}`, 'article')
}

export default async function BlogPostPage({ params }: Params) {
  const { post: slug } = await params
  await handleRedirect(`/blog/${slug}`)
  const post = await getPost(slug)
  if (!post) notFound()
  const image = typeof post.featuredImage === 'object' ? post.featuredImage : null
  return (
    <>
      <JsonLd items={post.seo?.jsonLd} />
      <article className="prose mx-auto max-w-3xl px-5 py-10 xl:py-16">
        <header>
          {post.category && <p className="text-sm font-semibold uppercase">{post.category}</p>}
          <h1>{post.title}</h1>
          <time dateTime={post.publishedAt} className="text-sm text-muted">
            {formatPostDate(post.publishedAt)}
          </time>
          {image?.url && (
            <Image src={image.url} alt={image.alt} width={image.width ?? 1200} height={image.height ?? 630} className="h-auto w-full" priority />
          )}
        </header>
        <BlogRichText data={post.content} />
      </article>
    </>
  )
}

export const dynamic = 'force-dynamic'

import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import { normalizePath } from '@/lib/normalizePath'

type Published = { slug?: string | null; status?: string | null }
const CONTEXT_KEY = 'publishedBeforeChange'

export const rememberPublishedSlug: CollectionBeforeChangeHook = async ({ collection, data, originalDoc, operation, req }) => {
  if (operation !== 'update' || data?._status !== 'published' || !originalDoc?.id) return data
  const live = await req.payload.findByID({
    collection: collection.slug as 'pages' | 'posts',
    id: originalDoc.id,
    depth: 0,
    draft: false,
    req,
  })
  req.context[CONTEXT_KEY] = { slug: live.slug, status: live._status } satisfies Published
  return data
}

export const redirectOnSlugChange =
  (toPath: (slug: string) => string): CollectionAfterChangeHook =>
  async ({ doc, operation, req }) => {
    const before = req.context[CONTEXT_KEY] as Published | undefined
    if (operation !== 'update' || doc._status !== 'published') return doc
    if (before?.status !== 'published' || !before.slug || before.slug === doc.slug) return doc

    const oldPath = normalizePath(toPath(before.slug))
    const newPath = normalizePath(toPath(doc.slug))
    if (oldPath === '/' || newPath === '/') return doc

    await req.payload.delete({ collection: 'redirects', where: { from: { equals: newPath } }, req })
    await req.payload.update({
      collection: 'redirects',
      where: { to: { equals: oldPath } },
      data: { to: newPath },
      req,
    })
    await req.payload.delete({ collection: 'redirects', where: { from: { equals: oldPath } }, req })
    await req.payload.create({
      collection: 'redirects',
      data: { from: oldPath, to: newPath, type: '301' },
      req,
    })
    return doc
  }

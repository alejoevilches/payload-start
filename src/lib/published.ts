import { draftMode } from 'next/headers'
import type { Where } from 'payload'

export async function publishedQuery(where?: Where): Promise<{ draft: boolean; where: Where }> {
  const draft = (await draftMode()).isEnabled
  if (draft) return { draft, where: where ?? {} }
  const published: Where = { _status: { equals: 'published' } }
  return { draft, where: where ? { and: [where, published] } : published }
}

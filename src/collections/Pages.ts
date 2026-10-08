import type { CollectionConfig } from 'payload'
import { TitleSubtitleBlock } from '@/blocks/TitleSubtitle'
import { seoField } from '@/fields/seo'
import { redirectOnSlugChange, rememberPublishedSlug } from '@/hooks/redirectOnSlugChange'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    preview: ({ slug }) => `/api/preview?path=${encodeURIComponent(slug === '/' ? '/' : `/${slug}`)}`,
  },
  versions: { drafts: true, maxPerDoc: 25 },
  hooks: {
    beforeChange: [rememberPublishedSlug],
    afterChange: [redirectOnSlugChange((slug) => (slug === '/' ? '/' : `/${slug}`))],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    // Register every new block here (and add its case in components/RenderBlocks.tsx).
    { name: 'components', type: 'blocks', blocks: [TitleSubtitleBlock] },
    seoField,
  ],
}

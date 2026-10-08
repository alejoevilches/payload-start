import type { CollectionConfig } from 'payload'
import { lexicalEditor, EXPERIMENTAL_TableFeature } from '@payloadcms/richtext-lexical'
import { seoField } from '@/fields/seo'
import { redirectOnSlugChange, rememberPublishedSlug } from '@/hooks/redirectOnSlugChange'
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    preview: ({ slug }) => `/api/preview?path=${encodeURIComponent(`/blog/${slug}`)}`,
  },
  versions: { drafts: true, maxPerDoc: 25 },
  hooks: {
    beforeChange: [rememberPublishedSlug],
    afterChange: [redirectOnSlugChange((slug) => `/blog/${slug}`)],
  },
  fields: [
    {name: 'title', type: 'text', required: true},
    {name: 'slug', type: 'text', required: true, unique: true, index: true},
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          EXPERIMENTAL_TableFeature(),
          // Add BlocksFeature({ blocks: [...] }) here for custom blocks inside posts.
        ],
      }),
    },
    {name: 'publishedAt', type: 'date', required: true, defaultValue: ()=>new Date()},
    {name: 'excerpt', type: 'textarea'},
    {name: 'featuredImage', type: 'upload', relationTo: 'media'},
    {
      name: 'cta',
      type: 'group',
      label: 'Sidebar CTA',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaLink', type: 'text' },
      ],
    },
    {
      name: 'postFaq',
      type: 'group',
      label: 'FAQ',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'questions',
          type: 'array',
          fields: [
            { name: 'question', type: 'text', required: true },
            { name: 'answer', type: 'richText', required: true },
          ],
        },
      ],
    },
    // Change these options per project.
    {name: 'category', type: 'select', options: ['General', 'News']},
    seoField,
  ],
}

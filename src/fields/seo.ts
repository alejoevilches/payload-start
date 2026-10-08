import type { Field } from 'payload'

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: {
    description:
      'What Google and social networks show. If a field is left empty, the page title or the default from Site Settings is used.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Meta title',
      admin: {
        description: 'Title shown on Google. Ideal: up to 60 characters, with the main keyword first.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Meta description',
      admin: {
        description: 'Summary shown under the title on Google. Ideal: between 120 and 160 characters.',
      },
    },
    {
      type: 'collapsible',
      label: 'Open Graph (Facebook, LinkedIn, WhatsApp, X)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'ogTitle',
          type: 'text',
          label: 'OG title',
          admin: { description: 'If empty, the Meta title is used.' },
        },
        {
          name: 'ogDescription',
          type: 'textarea',
          label: 'OG description',
          admin: { description: 'If empty, the Meta description is used.' },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'OG image',
          admin: { description: 'Image shown when the link is shared. Recommended: 1200×630 px. If empty, the default image is used.' },
        },
        {
          name: 'ogType',
          type: 'select',
          label: 'OG type',
          defaultValue: 'website',
          options: [
            { label: 'Website', value: 'website' },
            { label: 'Article', value: 'article' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Advanced indexing',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'noIndex',
          type: 'checkbox',
          label: 'No index (noindex)',
          admin: { description: 'Google will not show this page in search results. It is also left out of the sitemap.' },
        },
        {
          name: 'noFollow',
          type: 'checkbox',
          label: 'No follow (nofollow)',
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          label: 'Canonical URL',
          admin: {
            description: 'Only if this page duplicates another one. Leave empty to use this page\'s own URL.',
          },
          validate: (value: unknown) => {
            if (!value) return true
            if (typeof value !== 'string') return 'Invalid URL'
            return /^(https?:\/\/|\/)/.test(value) || 'Must start with https:// or /'
          },
        },
      ],
    },
    {
      name: 'jsonLd',
      type: 'array',
      label: 'Structured data (JSON-LD)',
      labels: { singular: 'Script', plural: 'Scripts' },
      admin: {
        description:
          'schema.org scripts for this page (LocalBusiness, FAQPage, Service, etc.). Paste the JSON without the <script> tags.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'Internal name to identify it (e.g. "LocalBusiness Bellevue").' },
        },
        {
          name: 'schema',
          type: 'json',
          required: true,
          admin: { description: 'Valid JSON. If the JSON is malformed it cannot be saved.' },
        },
      ],
    },
  ],
}

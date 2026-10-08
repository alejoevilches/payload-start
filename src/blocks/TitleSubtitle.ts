import type { Block } from 'payload'

export const TitleSubtitleBlock: Block = {
  slug: 'titleSubtitle',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'subtitle', type: 'text' },
  ],
}

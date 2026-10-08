import type { Page } from '@/payload-types'
import TitleSubtitle from '@/components/ui/TitleSubtitle'

type Props = {
  blocks: Page['components']
  searchParams?: { q?: string }
}

// Add one `case` per block registered in collections/Pages.ts.
export default function RenderBlocks({ blocks }: Props) {
  return blocks?.map((block) => {
    switch (block.blockType) {
      case 'titleSubtitle': return <TitleSubtitle key={block.id} {...block} />
      default: return null
    }
  })
}

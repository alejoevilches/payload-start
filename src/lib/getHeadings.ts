import type { Post } from '@/payload-types'

export type ArticleHeading = { id: string; text: string }

type LexicalNode = {
  type: string
  tag?: string
  text?: string
  children?: LexicalNode[]
}

export function getNodeText(node: LexicalNode): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.children ?? []).map(getNodeText).join('')
}

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getHeadings(content: Post['content']): ArticleHeading[] {
  const nodes = content.root.children as LexicalNode[]
  return nodes
    .filter((node) => node.type === 'heading' && node.tag === 'h2')
    .map((node) => {
      const text = getNodeText(node)
      return { id: slugifyHeading(text), text }
    })
    .filter(({ id }) => id !== '')
}

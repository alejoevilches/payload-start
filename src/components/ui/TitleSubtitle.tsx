import type { Page } from '@/payload-types'

type Props = Extract<NonNullable<Page['components']>[number], { blockType: 'titleSubtitle' }>

export default function TitleSubtitle({ title, subtitle }: Props) {
  return (
    <section className="flex flex-col gap-3 px-5 py-16 text-center xl:px-16 xl:py-24">
      <h1 className="text-4xl font-bold text-ink xl:text-5xl">{title}</h1>
      {subtitle && <p className="text-lg text-muted">{subtitle}</p>}
    </section>
  )
}

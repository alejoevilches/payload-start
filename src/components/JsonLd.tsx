type Item = { id?: string | null; schema?: unknown }

export default function JsonLd({ items }: { items?: Item[] | null }) {
  if (!items?.length) return null
  return (
    <>
      {items.map((item, i) =>
        item.schema ? (
          <script
            key={item.id ?? i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item.schema).replace(/</g, '\\u003c') }}
          />
        ) : null,
      )}
    </>
  )
}

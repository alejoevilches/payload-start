import Link from 'next/link'
import type { Footer as FooterData, SiteSetting } from '@/payload-types'

type Props = { data: FooterData; settings: SiteSetting }

export function Footer({ data, settings }: Props) {
  const { phone, email } = settings
  return (
    <footer className="flex flex-col gap-4 border-t border-black/10 px-5 py-10 text-sm xl:px-16">
      {!!data.links?.length && (
        <ul className="flex flex-wrap gap-6">
          {data.links.map((link) => (
            <li key={link.id}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      )}
      {(phone || email) && (
        <div className="flex flex-col gap-1 text-muted">
          {phone && <a href={`tel:${phone}`}>{phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
        </div>
      )}
    </footer>
  )
}

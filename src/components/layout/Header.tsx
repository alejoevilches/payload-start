import Image from 'next/image'
import Link from 'next/link'
import type { Header as HeaderData } from '@/payload-types'

type Props = { data: HeaderData; siteName?: string | null }

export function Header({ data, siteName }: Props) {
  const logo = typeof data.logo === 'object' ? data.logo : null
  return (
    <header className="flex items-center justify-between gap-6 border-b border-black/10 px-5 py-4 xl:px-16">
      <Link href="/" className="flex items-center font-semibold">
        {logo?.url ? (
          <Image src={logo.url} alt={logo.alt || siteName || 'Home'} width={logo.width ?? 120} height={logo.height ?? 40} className="h-10 w-auto" />
        ) : (
          siteName || 'Home'
        )}
      </Link>
      <nav>
        <ul className="flex gap-6 text-sm">
          {data.navLinks?.map((link) => (
            <li key={link.id}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

'use client'

import { usePathname } from 'next/navigation'

export default function PreviewBanner() {
  const pathname = usePathname()
  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full bg-black px-4 py-2 text-sm text-white shadow-lg">
      <span>Preview mode: showing unpublished drafts</span>
      <a href={`/api/exit-preview?path=${encodeURIComponent(pathname)}`} className="font-semibold underline">
        Exit
      </a>
    </div>
  )
}

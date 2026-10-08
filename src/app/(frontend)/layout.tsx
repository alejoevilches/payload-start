import React from 'react'
import './styles.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import { getSiteSettings, getSiteUrl } from '@/lib/seo'
import { draftMode } from 'next/headers'
import PreviewBanner from '@/components/PreviewBanner'
import { TrackingBody, TrackingHead } from '@/components/Tracking'

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteSettings()
  return {
    metadataBase: new URL(getSiteUrl(seo?.siteUrl)),
    title: seo?.siteName || 'Site',
    description: seo?.defaultDescription || undefined,
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payload = await getPayload({ config })
  const [headerData, footerData, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'header' }),
    payload.findGlobal({ slug: 'footer' }),
    payload.findGlobal({ slug: 'siteSettings' }),
  ])
  const { isEnabled: isPreview } = await draftMode()

  return (
    <html lang="en">
      <body>
        <TrackingBody gtmId={siteSettings.tracking?.gtmId} />
        <Header data={headerData} siteName={siteSettings.seo?.siteName} />
        <main>{children}</main>
        <Footer data={footerData} settings={siteSettings} />
        <TrackingHead {...siteSettings.tracking} />
        {isPreview && <PreviewBanner />}
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { client, SITE_SETTINGS_QUERY } from '@/lib/sanity'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await client.fetch(SITE_SETTINGS_QUERY).catch(() => null)
  return (
    <>
      <Header logoUrl={settings?.logo?.asset?.url} announcement={settings?.announcement} />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

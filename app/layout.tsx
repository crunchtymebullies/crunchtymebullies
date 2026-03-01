import type { Metadata } from 'next'
import { Josefin_Sans, Poppins } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

// Bleu Belle custom font - will be loaded from /app/fonts/
// For now using Georgia as fallback until the .ttf is added
const bleuBelle = localFont({
  src: './fonts/BleuBelle.ttf',
  variable: '--font-bleu-belle',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})

export const metadata: Metadata = {
  title: {
    default: 'Crunchtime Bullies | Premium American Bully Breeding',
    template: '%s | Crunchtime Bullies',
  },
  description:
    'Premium American Bully breeding program. Quality bloodlines, health-tested puppies, and professional breeding services.',
  keywords: [
    'american bully',
    'bully puppies',
    'crunchtime bullies',
    'american bully breeder',
    'bully puppies for sale',
    'premium bully breeding',
  ],
  openGraph: {
    title: 'Crunchtime Bullies',
    description: 'Premium American Bully Breeding',
    url: 'https://crunchtymebullies.com',
    siteName: 'Crunchtime Bullies',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${josefin.variable} ${poppins.variable} ${bleuBelle.variable}`}>
      <body className="grain">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Josefin_Sans, Poppins } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

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

const bleuBelle = localFont({
  src: './fonts/BleuBelle.ttf',
  variable: '--font-bleu-belle',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})

export const metadata: Metadata = {
  title: {
    default: 'Crunchtyme Bullies — Premium Bullies. Working Family Prices.',
    template: '%s | Crunchtyme Bullies',
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
    title: 'Crunchtyme Bullies',
    description: 'Premium American Bully Breeding',
    url: 'https://crunchtymebullies.com',
    siteName: 'Crunchtyme Bullies',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${josefin.variable} ${poppins.variable} ${bleuBelle.variable}`}>
      <body >
        {children}
      </body>
    </html>
  )
}

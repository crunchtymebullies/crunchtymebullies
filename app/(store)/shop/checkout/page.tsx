import type { Metadata } from 'next'
import CheckoutFlow from './CheckoutFlow'

export const metadata: Metadata = {
  title: 'Checkout — Crunchtyme Bullies Shop',
  description: 'Complete your order',
}

export default function CheckoutPage() {
  return <CheckoutFlow />
}

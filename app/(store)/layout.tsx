import { CartProvider } from '@/components/store/CartProvider'
import StoreHeader from '@/components/store/StoreHeader'
import CartDrawer from '@/components/store/CartDrawer'
import BottomNav from '@/components/store/BottomNav'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="store-shell min-h-screen bg-[#050507] text-white">
        <StoreHeader />
        <main className="pb-20 md:pb-0">{children}</main>
        <CartDrawer />
        <BottomNav />
      </div>
    </CartProvider>
  )
}

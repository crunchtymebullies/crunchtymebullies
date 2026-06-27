# 04 — The Online Store (shop, checkout, accounts)

In `app/(store)/`, powered by **Medusa** (catalog/cart/orders) + **Stripe** (payments) + **Printful** (print/ship). Layout wraps with cart + customer context, store header, cart drawer, mobile bottom nav.

## Pages
| Page | URL | File |
|------|-----|------|
| Shop grid | `/shop` | `app/(store)/shop/page.tsx` → `ShopGrid.tsx` |
| Product detail | `/shop/[handle]` | `app/(store)/shop/[handle]/page.tsx` → `ProductDetail.tsx` |
| Checkout | `/shop/checkout` | `app/(store)/shop/checkout/page.tsx` → `CheckoutFlow.tsx` |
| Account / orders | `/account` | `app/(store)/account/page.tsx` → `AccountFlow.tsx` |

Products/prices/images from Medusa (synced from Printful). **Medusa amounts = decimal dollars.**

## Checkout (`CheckoutFlow.tsx`)
Information → Shipping → Payment (Stripe Payment Element) → Complete. Pay button disabled until the card field is ready. Optional "create a password" makes a customer account. On success: cart → Medusa order → forwarded to Printful.

### Payment plumbing
- Medusa Stripe `capture: true` → card **charged** on confirm.
- Stripe webhook → Medusa `/hooks/payment/stripe_stripe` → order flips to **Paid**.
- Both required; without them orders authorize-but-don't-charge (fixed).

## Fulfillment (auto)
`app/api/order/fulfill/route.ts` posts to Printful with **`confirm=true`** → Printful auto-charges owner + prints + ships. Idempotent. Manual re-trigger:
`curl -X POST https://crunchtymebullies.com/api/order/fulfill -H 'Content-Type: application/json' --data '{"order_id":"<id>"}'`
Requires funded Printful billing. Safe (only approved products are orderable).

## Shipping
Flat **$8.49**; **free at $40+** merchandise (Medusa price rule `item_total >= 40` on Standard Shipping). Measured on product value only (no flip-flop). Flat, not Printful live rates.

## Cart & accounts
- `components/store/CartProvider.tsx` (cart id in localStorage `ct-cart-id`); `CartDrawer.tsx` checkout button uses shared back-stack helper.
- `/shop?recover=<cart_id>` restores a cart (abandoned-cart emails).
- `/account` (`AccountFlow.tsx`): register/login/order history (optional). `lib/customer-api.ts`; JWT in localStorage `ct-customer-jwt`; logged-in calls link orders to the account.

## Key files
`lib/store-api.ts`, `lib/customer-api.ts`, `app/(store)/shop/checkout/CheckoutFlow.tsx`, `app/api/order/fulfill/route.ts`.

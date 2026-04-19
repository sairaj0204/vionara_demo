# Vionara Application Stabilization & Refactor Plan

This document outlines the step-by-step strategy to resolve all core issues in your eCommerce platform, ordered exactly as required.

## Phase 1: Core Flow Debugging (Critical)
- **Cart Context Mutation Fix**: The current `CartContext.jsx` mutates state directly (`existing.quantity += quantity`), causing hydration and session persistence bugs, especially in React Strict Mode. We will transition this to functional deep-copy updates.
- **Session Preservation**: In `AuthContext.jsx`, if `getProfile()` fails due to network issues, it incorrectly clears `vionara_token` and logs the user out. We will modify this to ONLY log out on HTTP `401 Unauthorized`.
- **Checkout Integrity**: Refactor `api/orders/route.js` to strictly dictate prices via Server calculation.

## Phase 2: Payment System Fix (Razorpay)
Currently, your app creates an order, trusts the frontend for `paymentInfo`, and marks it. This is vulnerable. We will implement robust checkout:

- **1. Backend Controlled Pricing**: Make a single DB order creation endpoint `/api/orders` that computes the total. It will store the Order as `pending`, generate a Razorpay order via Razorpay API, and return the `razorpayOrderId`.
- **2. Secure Verification**: Frontend runs Razorpay checkout and posts back to `/api/payment/verify` with `{ orderId, razorpayPaymentId, razorpaySignature }`.
- **3. Finalize Order**: The backend verifies the HMAC SHA256 signature. If valid, the database order status is updated to `paid`/`confirmed`, generating the successful invoice.

## Phase 3: Delivery API Integration (Shiprocket)
- **Automatic Sync**: Upon successful payment verification in Phase 2, the server will call our new generic Shiprocket service (`lib/shiprocket.js`) to generate a shipping order using `SHIPROCKET_EMAIL` & `SHIPROCKET_PASSWORD`.
- **Order Model Improvements**: Extend the Mongoose `Order` model to contain `shiprocketOrderId`, `awbCode`, `courierName`, and `trackingUrl`.
- **User / Admin Visibility**:
  - Update `src/pages/admin/AdminOrders.jsx` to display Shiprocket tracking strings and links.
  - Update `src/pages/MyOrders.jsx` & `OrderTracking.jsx` so users can track their Shiprocket AWB live.

## Phase 4: Testing & Edge Cases
- Add explicit error boundaries (`error.jsx`) to handle crashes in core areas.
- Wrap API integrations (Razorpay & Shiprocket) in rigorous `try/catch` with retry mechanics (especially for Shiprocket auth caching).
- Verify failed and duplicate payment intents.

## Phase 5: Performance Optimization
- Replace raw `<img />` tags in product listings (`Home.jsx`, `Shop.jsx`, `ProductDetail.jsx`) with Next.js specific `<Image />` for lazy-loading and AVIF/WebP formats.
- Preload critical components using React Suspense and custom skeleton loaders.
- Reduce blocking `framer-motion` delays to improve "Time to Interactive".

## Open Questions
> [!IMPORTANT]
> - Do you already have `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` set in your `.env`? Or are you using an API token directly?
> - For Phase 2, the prompt states "After verification: Create order in database". Typically, eCommerce platforms create a *Pending* DB order first before launching Razorpay, then verify and mark Paid. If you strictly prefer no DB order until payment succeeds, we must pass the entire cart info via signed JWT or cache. Pending Order DB is highly recommended. Is creating a Pending DB order acceptable?

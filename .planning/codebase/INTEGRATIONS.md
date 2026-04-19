# External Integrations

## Database — MongoDB Atlas

- **ODM:** Mongoose v9.4.1
- **Connection:** `src/lib/db.js` — singleton pattern using `global.mongoose` cache
- **URI:** `MONGODB_URI` env var (MongoDB Atlas cluster)
- **Models:** 9 Mongoose models in `src/models/`

### Data Models

| Model | File | Key Fields |
|---|---|---|
| `User` | `src/models/User.js` | name, email, phone, password, role, addresses, wishlist, OTP fields |
| `Product` | `src/models/Product.js` | name, slug, price, mrp, category (ref), images, stock, reviews (embedded), tags |
| `Order` | `src/models/Order.js` | user (ref), orderNumber, items, shippingAddress, paymentInfo, orderStatus, tracking |
| `Category` | `src/models/Category.js` | name, slug (auto-generated via slugify), thumbnail, banner |
| `Cart` | `src/models/Cart.js` | user (ref, unique), items (product ref + quantity + size) |
| `Coupon` | `src/models/Coupon.js` | code, discountType, discountValue, validity dates, usage limits |
| `PromoBanner` | `src/models/PromoBanner.js` | messages, speed, colors, isActive |
| `Setting` | `src/models/Setting.js` | key-value store for dynamic CMS settings |
| `PendingUser` | `src/models/PendingUser.js` | Temporary OTP registration (TTL index for auto-expiry) |

## Authentication — JWT + OTP

- **JWT:** `jsonwebtoken` — tokens signed with `JWT_SECRET`, 7-day expiry
- **Password hashing:** `bcryptjs` with 12 salt rounds
- **OTP flow:** 6-digit code, SHA-256 hashed, 5-minute TTL, max 5 attempts, 30s resend cooldown
- **Token storage:** Client-side `localStorage` (`vionara_token`)
- **Auth middleware:** `src/lib/auth.js` — `getUserFromToken()` and `verifyAdmin()` read Bearer token from headers

### Auth endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/login` | Email/phone + password login |
| `POST /api/auth/register` | Registration (legacy) |
| `POST /api/auth/signup/otp/request` | OTP-based signup flow |
| `POST /api/auth/signup/otp/verify` | Verify signup OTP |
| `POST /api/auth/signup/otp/resend` | Resend signup OTP |
| `GET /api/auth/profile` | Get authenticated user profile |
| `POST /api/admin/login` | Admin login (separate route) |

## Email — Nodemailer (SMTP)

- **Transport:** Gmail SMTP (`smtp.gmail.com:587`)
- **Purpose:** OTP delivery for signup verification
- **Config:** `src/lib/messaging.js`
- **Template:** Branded HTML email with Vionara styling

## SMS — Twilio (Configured, Not Active)

- **Library:** Native `fetch` to Twilio REST API (no SDK)
- **Purpose:** Phone OTP delivery
- **Config:** `src/lib/messaging.js` — requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- **Status:** Code exists but env vars are placeholders

## Payment — Razorpay

- **API endpoints defined** in `src/services/api.js`:
  - `POST /api/payment/create-order`
  - `POST /api/payment/verify`
- **Status:** Test keys in `.env` (placeholder values)
- **Note:** API route handlers for payment are not yet implemented in `src/app/api/`

## Shipping — Shiprocket

- **API endpoints defined** in `src/services/api.js`:
  - `POST /api/shipping/check-pincode`
  - `POST /api/shipping/calculate`
  - `POST /api/shipping/create-shipment`
  - `GET /api/shipping/track/{orderId}`
  - `POST /api/shipping/cancel/{orderId}`
- **Status:** Endpoints defined client-side but no server-side route handlers exist yet

## Image Storage — Cloudinary

- **Library:** `cloudinary` v2 SDK
- **Upload route:** `src/app/api/upload/route.js`
- **Folder:** `vionara_products`
- **Flow:** FormData → Buffer → Cloudinary upload stream → returns `secure_url` + `public_id`
- **Config:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Image Search — Google Vision API

- **API Key:** `GOOGLE_VISION_API_KEY` in `.env`
- **Client-side:** `searchByImageApi()` in `src/services/api.js` — converts blob/base64 to FormData
- **Status:** Endpoint reference exists but server-side handler implementation unclear

## Google OAuth (Planned)

- **Config:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` in `.env`
- **Status:** Placeholder values, no active OAuth flow implemented

## API Proxy (Next.js Rewrites)

The Next.js frontend proxies API calls to a separate backend server:

```javascript
// next.config.mjs
{
  source: '/api/:path*',
  destination: 'http://localhost:4000/api/:path*',
}
```

This means the app has a **dual architecture**:
1. Next.js API routes in `src/app/api/` (primary, used when backend is unavailable)
2. External Express backend on port 4000 (proxied via rewrites)

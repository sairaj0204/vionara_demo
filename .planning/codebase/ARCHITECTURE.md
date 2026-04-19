# Architecture

## Pattern: Full-Stack Next.js App Router + Separate Backend

Vionara is a **luxury jewellery e-commerce platform** built as a Next.js 16 App Router application with a hybrid architecture:

1. **Next.js Frontend (this repo)** — React UI + API Route Handlers (port 5173/3000)
2. **External Express Backend** — proxied via Next.js rewrites to `localhost:4000`

The frontend contains its own API routes (`src/app/api/`) that serve as the primary API layer, with demo/fallback data when MongoDB is unavailable. The Express backend (separate `server` directory, not in this workspace) is proxied for legacy API compatibility.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Browser Client                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │ AuthCtx  │  │ CartCtx  │  │ WishlistCtx/Theme │ │
│  └────┬─────┘  └────┬─────┘  └─────────┬─────────┘ │
│       └──────────────┴──────────────────┘           │
│                      │ axios                         │
└──────────────────────┼───────────────────────────────┘
                       │ /api/*
          ┌────────────┼────────────────┐
          ▼                             ▼
┌──────────────────┐        ┌──────────────────┐
│  Next.js API     │        │  Express Backend  │
│  Route Handlers  │        │  (port 4000)      │
│  src/app/api/    │        │  via rewrites     │
└────────┬─────────┘        └──────────────────┘
         │
         ▼
┌──────────────────┐    ┌──────────────┐    ┌──────────────┐
│  MongoDB Atlas   │    │  Cloudinary  │    │  Gmail SMTP  │
│  (Mongoose)      │    │  (Images)    │    │  (Nodemailer)│
└──────────────────┘    └──────────────┘    └──────────────┘
```

## Layers

### 1. Presentation Layer (React Components)

- **Route Group Layouts:** `(public)` has Navbar + Footer; `(admin)` is bare wrapper
- **Page Components:** `src/pages/` contains full-page React components (e.g., `Home.jsx`, `Shop.jsx`, `ProductDetail.jsx`)
- **UI Components:** `src/components/` for shared layout, product, auth, admin, and UI elements
- **State Management:** React Context API (4 providers) — no Redux or Zustand

### 2. Client Service Layer

- **Single API module:** `src/services/api.js` — axios instance with Bearer token interceptor
- **~60 exported API functions** covering auth, products, cart, wishlist, orders, coupons, payments, shipping, reviews, admin, settings, uploads

### 3. Server API Layer (Next.js Route Handlers)

- **API Routes:** `src/app/api/` — RESTful handlers using `NextResponse`
- **Auth middleware:** `src/lib/auth.js` — `getUserFromToken()` reads JWT from Authorization header
- **Admin gates:** `verifyAdmin()` checks user role before allowing admin operations
- **Fallback mode:** Product/category routes return demo data when `MONGODB_URI` is unset

### 4. Data Layer

- **Mongoose models:** 9 models in `src/models/`
- **Connection singleton:** `src/lib/db.js` — cached `global.mongoose` pattern
- **Demo data:** `src/utils/data.js` + `src/lib/catalog.js` for offline fallback

## Data Flow

### Product Listing
```
Browser → getProducts() [services/api.js]
       → GET /api/products [app/api/products/route.js]
       → connectDB() → Product.find().populate('category')
       → normalizeProduct() → JSON response
```

### User Authentication
```
Browser → login() [AuthContext.jsx]
       → loginUser() [services/api.js]
       → POST /api/auth/login [app/api/auth/login/route.js]
       → User.findOne() + comparePassword()
       → generateAuthToken() → token stored in localStorage
```

### OTP Signup
```
Browser → requestSignupOtp() [AuthContext.jsx]
       → POST /api/auth/signup/otp/request
       → requestSignupOtp() [lib/signup-otp.js]
       → PendingUser created → sendVerificationCode() [lib/messaging.js]
       → OTP sent via SMTP → user verifies → User created
```

## Key Abstractions

| Abstraction | Location | Purpose |
|---|---|---|
| `normalizeProduct()` | `src/lib/catalog.js` | Standardizes product shape (ObjectId → string, category resolution) |
| `resolveAuthIdentifier()` | `src/lib/auth-utils.js` | Unifies email/phone login into single identifier |
| `buildIdentifierQuery()` | `src/lib/auth-utils.js` | Creates MongoDB query from email or phone |
| `applyThemeToDOM()` | `src/context/ThemeContext.jsx` | Sets CSS custom properties from DB-stored theme |
| `getDemoProducts()` | `src/lib/catalog.js` | Returns hardcoded products when no DB |

## Entry Points

| Entry Point | File | Purpose |
|---|---|---|
| Root Layout | `src/app/layout.jsx` | HTML skeleton, fonts, Providers wrapper |
| Public Layout | `src/app/(public)/layout.jsx` | Navbar + Footer |
| Admin Layout | `src/app/(admin)/layout.jsx` | Bare wrapper |
| Homepage | `src/app/(public)/page.jsx` | Renders `<Home />` |
| API Entry | `src/app/api/*/route.js` | 20+ API route handlers |

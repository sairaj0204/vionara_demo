# Project Structure

## Top-Level Layout

```
vionara-main/
├── .env                    # Environment variables (secrets, API keys)
├── .gitignore              # Standard Next.js + /public/uploads/, .env*
├── AGENTS.md               # AI agent rules (Next.js breaking changes notice)
├── CLAUDE.md               # AI context (minimal)
├── README.md               # Project readme
├── eslint.config.mjs       # ESLint flat config (core-web-vitals)
├── jsconfig.json           # Path alias: @/* → ./src/*
├── next.config.mjs         # Next.js config (images, API rewrites)
├── package.json            # Dependencies and scripts
├── postcss.config.mjs      # PostCSS with Tailwind v4
├── public/                 # Static assets (hero images, logos, lookbook)
└── src/                    # Application source code
```

## Source Directory (`src/`)

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── (admin)/            # Admin route group
│   │   ├── layout.jsx      # Bare admin layout
│   │   └── admin/          # Admin pages
│   │       ├── page.jsx             # Admin root
│   │       ├── analytics/page.jsx   # Analytics dashboard
│   │       ├── banners/page.jsx     # Banner management
│   │       ├── cms/                 # CMS sub-pages
│   │       │   ├── page.jsx
│   │       │   ├── offers/page.jsx
│   │       │   ├── product-badges/page.jsx
│   │       │   └── reviews/page.jsx
│   │       ├── coupons/page.jsx
│   │       ├── customers/page.jsx
│   │       ├── dashboard/page.jsx
│   │       ├── inventory/page.jsx
│   │       ├── orders/page.jsx
│   │       ├── products/page.jsx
│   │       └── settings/page.jsx
│   │
│   ├── (public)/           # Public-facing route group
│   │   ├── layout.jsx      # Navbar + Footer
│   │   ├── page.jsx        # Homepage
│   │   ├── about/page.jsx
│   │   ├── account/page.jsx
│   │   ├── addresses/page.jsx
│   │   ├── auth/
│   │   │   ├── page.jsx
│   │   │   └── verify/page.jsx
│   │   ├── cart/page.jsx
│   │   ├── checkout/page.jsx
│   │   ├── collections/[category]/page.jsx  # Dynamic category
│   │   ├── gift-card/page.jsx
│   │   ├── my-orders/page.jsx
│   │   ├── product/[slug]/page.jsx          # Dynamic product
│   │   ├── profile/page.jsx
│   │   ├── shop/page.jsx
│   │   ├── wishlist/page.jsx
│   │   ├── track-order/page.jsx
│   │   └── [info pages]                     # FAQ, privacy, terms, etc.
│   │
│   ├── api/                # Next.js API Route Handlers
│   │   ├── admin/
│   │   │   ├── analytics/route.js
│   │   │   ├── login/route.js
│   │   │   └── stats/route.js
│   │   ├── auth/
│   │   │   ├── login/route.js
│   │   │   ├── profile/route.js
│   │   │   ├── register/route.js
│   │   │   └── signup/otp/{request,verify,resend}/route.js
│   │   ├── cart/
│   │   │   ├── route.js
│   │   │   └── [itemId]/route.js
│   │   ├── categories/route.js
│   │   ├── orders/route.js
│   │   ├── products/
│   │   │   ├── route.js
│   │   │   ├── [id]/related/route.js
│   │   │   └── slug/[slug]/route.js
│   │   ├── promo-banner/route.js
│   │   ├── reviews/[productId]/route.js
│   │   ├── settings/
│   │   │   ├── route.js
│   │   │   ├── hero/route.js
│   │   │   ├── new-arrivals-banner/route.js
│   │   │   └── theme/route.js
│   │   ├── upload/route.js
│   │   ├── upload-base64/route.js
│   │   └── wishlist/route.js
│   │
│   ├── globals.css         # Global styles + Tailwind theme + keyframes
│   ├── layout.js           # Duplicate layout (unused?)
│   ├── layout.jsx          # Root layout (fonts, Providers)
│   ├── dashboard/page.jsx  # Standalone dashboard page
│   ├── login/page.jsx      # Standalone login page
│   ├── orders/page.jsx     # Standalone orders page
│   └── products/page.jsx   # Standalone products page
│
├── components/             # Reusable React components
│   ├── ImageMigrator.jsx   # localStorage → public migration tool
│   ├── Providers.jsx       # Context provider composition
│   ├── admin/
│   │   ├── AdminLayout.jsx
│   │   └── AdminProtectedRoute.jsx
│   ├── auth/
│   │   └── AuthVerifyPage.jsx
│   ├── home/
│   │   ├── HeroBanner.jsx
│   │   └── Home.jsx
│   ├── layout/
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── product/
│   │   ├── ProductCard.jsx
│   │   └── ProductCarousel.jsx
│   ├── profile/
│   │   └── AccountLayout.jsx
│   └── ui/
│       ├── ImageSearchDrawer.jsx
│       ├── ImageSearchModal.jsx
│       ├── LoginModal.jsx
│       └── ScrollToTop.jsx
│
├── context/                # React Context providers
│   ├── AuthContext.jsx     # User auth state, login/logout, OTP flows
│   ├── CartContext.jsx     # Local cart (localStorage-based)
│   ├── ThemeContext.jsx    # Dynamic theme (CSS vars from DB)
│   └── WishlistContext.jsx # Hybrid wishlist (localStorage + API)
│
├── lib/                    # Server-side utility modules
│   ├── admin-metrics.js    # Dashboard stats & analytics builders
│   ├── auth-utils.js       # OTP generation, JWT tokens, identifier resolution
│   ├── auth.js             # getUserFromToken(), verifyAdmin()
│   ├── catalog.js          # Product normalization, demo product helpers
│   ├── db.js               # MongoDB connection singleton
│   ├── heroSlides.js       # Hero banner slide defaults
│   ├── messaging.js        # Email/SMS OTP delivery (Nodemailer, Twilio)
│   ├── settings.js         # Default CMS settings, theme, banner configs
│   └── signup-otp.js       # Full signup OTP flow (request, verify, resend)
│
├── models/                 # Mongoose data models
│   ├── Cart.js
│   ├── Category.js
│   ├── Coupon.js
│   ├── Order.js
│   ├── PendingUser.js
│   ├── Product.js
│   ├── PromoBanner.js
│   ├── Setting.js
│   └── User.js
│
├── pages/                  # Legacy page components (imported by App Router pages)
│   ├── Home.jsx            # Main homepage component (24KB)
│   ├── Shop.jsx            # Product listing (15KB)
│   ├── ProductDetail.jsx   # Single product view (29KB)
│   ├── CartPage.jsx        # Cart page (29KB)
│   ├── Checkout.jsx        # Checkout flow (26KB)
│   ├── MyAccount.jsx       # Account management (50KB — largest file)
│   ├── AuthPage.jsx        # Login/register form
│   ├── [other pages]       # Profile, Orders, Wishlist, etc.
│   ├── admin/              # Admin page components (13 files)
│   └── info/               # Static info pages (7 files)
│
├── services/
│   └── api.js              # Axios HTTP client with ~60 API functions
│
└── utils/
    ├── data.js             # Demo/seed data (products, categories)
    └── migrateImages.js    # Image migration utility
```

## Key Locations

| Need | Location |
|---|---|
| Add a new public page | `src/app/(public)/[route]/page.jsx` |
| Add a new admin page | `src/app/(admin)/admin/[route]/page.jsx` |
| Add a new API endpoint | `src/app/api/[route]/route.js` |
| Add a new data model | `src/models/[Model].js` |
| Add a client API function | `src/services/api.js` |
| Add a React context | `src/context/[Name]Context.jsx` + wire in `Providers.jsx` |
| Modify global styles | `src/app/globals.css` |
| Add a reusable component | `src/components/[category]/[Name].jsx` |
| Server-side utility | `src/lib/[name].js` |

## Naming Conventions

| Convention | Example |
|---|---|
| Page components | PascalCase (`Home.jsx`, `ProductDetail.jsx`) |
| API routes | kebab-case directories, `route.js` files |
| Models | PascalCase singular (`Product.js`, `User.js`) |
| Context files | PascalCase + `Context` suffix (`AuthContext.jsx`) |
| Lib modules | kebab-case (`auth-utils.js`, `admin-metrics.js`) |
| CSS classes | kebab-case BEM-ish (`btn-gold`, `section-title`, `filter-tab`) |
| Route groups | Parenthesized (`(public)`, `(admin)`) |

## Static Assets (`public/`)

- `vionara-logo.png` — Brand logo
- `hero-*.png` — Hero banner images (4 variants)
- `lookbook-*.png/jpg` — Lookbook gallery images
- Standard Next.js SVGs (`next.svg`, `vercel.svg`, `file.svg`, etc.)

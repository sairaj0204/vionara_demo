# Concerns

## 🔴 Critical — Security

### 1. Secrets Committed to Repository

**File:** `.env`

The `.env` file contains **real credentials** that should never be in source control:
- MongoDB Atlas connection string with real username/password
- SMTP App Password for Gmail
- Cloudinary API secret
- Google Vision API key
- JWT secret key

**Impact:** Anyone with repo access has full database and email access.
**Fix:** Rotate all credentials immediately. Ensure `.env` is in `.gitignore` (it is, but the file may have been committed before the rule was added).

### 2. Malformed Cloudinary Environment Variable

**File:** `.env` line 26

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dosqjayxq"="511991948913671"
```

This line has a syntax error — it appears to combine the cloud name and API key into one variable. The `CLOUDINARY_API_KEY` variable is missing entirely.

**Impact:** Cloudinary uploads may fail or use the wrong credentials.
**Fix:** Split into separate variables:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dosqjayxq
CLOUDINARY_API_KEY=511991948913671
```

### 3. No Rate Limiting on API Routes

API routes have no rate limiting protection. While the OTP flow has attempt limits (5 max), the login endpoint, product endpoints, and other routes are unprotected.

**Impact:** Vulnerable to brute-force attacks and API abuse.

### 4. localStorage Token Storage

**File:** `src/context/AuthContext.jsx`

JWT tokens are stored in `localStorage`, which is accessible to any JavaScript on the page and vulnerable to XSS attacks. HttpOnly cookies would be more secure.

## 🟠 High — Architectural Issues

### 5. Dual Page Architecture (Legacy + App Router)

**Files:** `src/pages/` (legacy) + `src/app/(public)/` (App Router)

The project has a confusing dual structure:
- `src/app/(public)/page.jsx` — thin App Router pages that import from…
- `src/pages/Home.jsx` — large page components with full logic

This means page components in `src/pages/` are **not** Next.js Pages Router pages. They're regular React components imported by App Router pages. The naming is misleading and the `src/pages/` directory conflicts with Next.js conventions.

**Impact:** Confusing for developers; `'use client'` boundaries aren't optimal.

### 6. Dual Backend Architecture

**Files:** `next.config.mjs` (rewrites)

The app proxies `/api/*` to both:
1. Local Next.js route handlers (`src/app/api/`)
2. External Express backend (port 4000) via rewrites

It's unclear which backend handles which requests, and there appear to be **duplicate implementations** for some endpoints.

**Impact:** Maintenance burden, potential inconsistencies between backends.

### 7. Massive Component Files

Several components exceed 20KB, making them hard to maintain:

| File | Size | Lines |
|---|---|---|
| `src/pages/MyAccount.jsx` | 50 KB | ~1200+ |
| `src/pages/ProductDetail.jsx` | 29 KB | ~700+ |
| `src/pages/CartPage.jsx` | 29 KB | ~700+ |
| `src/pages/Checkout.jsx` | 26 KB | ~600+ |
| `src/pages/Home.jsx` | 24 KB | ~550+ |

**Fix:** Break into smaller sub-components.

### 8. Duplicate Root Layout

**Files:** `src/app/layout.js` + `src/app/layout.jsx`

Two layout files exist at the root level. Only one should be active.

**Impact:** Potential build issues or unpredictable behavior.

## 🟡 Medium — Code Quality

### 9. Cart Not Synced with Backend

**File:** `src/context/CartContext.jsx`

The cart uses only `localStorage` for storage — no API calls to persist on the server. The `Cart` model exists in `src/models/Cart.js` and cart API routes exist, but the frontend CartContext doesn't use them.

**Impact:** Cart data lost on browser clear; no cross-device cart sync.

### 10. Missing API Route Implementations

Several API functions are defined in `src/services/api.js` but have **no corresponding server-side route handlers** in `src/app/api/`:

- `POST /api/payment/create-order` — Razorpay payment
- `POST /api/payment/verify` — Payment verification
- `POST /api/shipping/*` — All Shiprocket endpoints
- `POST /api/products/search-by-image` — Image search
- `GET /api/products/search/suggestions` — Search suggestions
- `GET /api/products/admin/all` — Admin product listing
- `POST /api/products/bulk-upload` — Bulk product upload
- `PUT /api/products/:id` — Product update
- `DELETE /api/products/:id` — Product delete
- `POST /api/coupons/*` — Coupon CRUD
- `PUT /api/orders/:id/status` — Order status update
- Auth endpoints: forgot-password, login OTP, 2FA, addresses, users list

**Impact:** Clicking related UI features will result in 404 errors.

### 11. Hardcoded Demo Data

**File:** `src/utils/data.js` (14 KB)

Large amounts of hardcoded demo product data. While useful for development, this inflates the bundle size.

### 12. `react-router-dom` Installed But Not Needed

**File:** `package.json`

The app uses Next.js App Router for routing. `react-router-dom` (^7.14.0) is installed but may only be used in legacy page components or not at all.

**Impact:** Unnecessary bundle size (~40KB).

### 13. Empty/Stub Files

| File | Content |
|---|---|
| `src/pages/Home_clean.jsx` | Empty (49 bytes) |
| `src/pages/GiftCard.jsx` | Stub (946 bytes) |
| `src/pages/RingSize.jsx` | Stub (960 bytes) |
| `src/pages/SavedPayments.jsx` | Stub (976 bytes) |

## 🟢 Low — Minor Issues

### 14. No Automated Tests

See `TESTING.md` — zero test coverage increases risk of regressions.

### 15. Console Logging in Production Code

Multiple files contain `console.log` and `console.error` statements that should be cleaned up or replaced with a proper logging framework.

### 16. Missing Error Boundaries

No React Error Boundaries are implemented. Uncaught errors in any component will crash the entire app.

### 17. No Image Optimization

**File:** `next.config.mjs`

`images.unoptimized: true` disables Next.js image optimization entirely. All images are served at full resolution.

**Impact:** Poor performance, especially on mobile.

### 18. Placeholder External Service Credentials

Several `.env` variables have placeholder values that will cause runtime failures:
- `RAZORPAY_KEY_ID=rzp_test_your_key_here`
- `RAZORPAY_KEY_SECRET=your_razorpay_secret`
- `SHIPROCKET_EMAIL=your_email@example.com`
- `GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID`

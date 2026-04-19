# Technology Stack

## Languages & Runtime

| Technology | Version | Purpose |
|---|---|---|
| JavaScript (ES Modules) | ES2022+ | Primary language |
| Node.js | ≥18 (required by Next.js 16) | Server runtime |
| CSS | Tailwind v4 + vanilla | Styling |

- **No TypeScript** — project uses plain `.js` / `.jsx` with `jsconfig.json` path aliases (`@/*` → `./src/*`).

## Framework

| Framework | Version | Notes |
|---|---|---|
| **Next.js** | **16.2.2** | App Router architecture |
| React | 19.2.4 | Latest concurrent features |
| React DOM | 19.2.4 | — |

### Next.js App Router Configuration

- Route groups: `(public)` and `(admin)` under `src/app/`
- API routes under `src/app/api/` using Route Handlers (`route.js`)
- Rewrites proxy `/api/*` → `http://localhost:4000/api/*` and `/uploads/*` → `http://localhost:4000/uploads/*` (see `next.config.mjs`)
- Images: `unoptimized: true`, accepts remote patterns from any host

## Key Dependencies

### Production

| Package | Version | Purpose |
|---|---|---|
| `axios` | ^1.14.0 | HTTP client (API service layer) |
| `bcryptjs` | ^3.0.3 | Password hashing |
| `cloudinary` | ^2.9.0 | Image upload/storage |
| `framer-motion` | ^12.38.0 | Animations and page transitions |
| `jsonwebtoken` | ^9.0.3 | JWT auth token generation/verification |
| `lucide-react` | ^1.7.0 | Icon library |
| `mongoose` | ^9.4.1 | MongoDB ODM |
| `nodemailer` | ^8.0.5 | SMTP email (OTP delivery) |
| `react-hot-toast` | ^2.6.0 | Toast notifications |
| `react-icons` | ^5.6.0 | Additional icon set |
| `react-router-dom` | ^7.14.0 | Client routing (legacy pages) |
| `recharts` | ^3.8.1 | Admin analytics charts |
| `slugify` | ^1.6.9 | URL slug generation |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | ^4 | Utility-first CSS |
| `@tailwindcss/postcss` | ^4 | PostCSS integration |
| `eslint` | ^9 | Linting |
| `eslint-config-next` | 16.2.2 | Next.js ESLint rules |

## Configuration Files

| File | Purpose |
|---|---|
| `next.config.mjs` | Next.js config: image remote patterns, API rewrites |
| `postcss.config.mjs` | PostCSS with `@tailwindcss/postcss` plugin |
| `eslint.config.mjs` | ESLint flat config with `eslint-config-next/core-web-vitals` |
| `jsconfig.json` | Path alias `@/*` → `./src/*` |
| `.env` | Environment variables (MongoDB, JWT, SMTP, Cloudinary, Razorpay, etc.) |
| `.gitignore` | Standard Next.js ignores + `/public/uploads/`, `.env*` |

## Environment Variables

| Variable | Category | Description |
|---|---|---|
| `PORT` | Server | Local dev port (5000) |
| `MONGODB_URI` | Database | MongoDB Atlas connection string |
| `JWT_SECRET` | Auth | JWT signing secret |
| `JWT_EXPIRE` | Auth | Token expiry (7d) |
| `RAZORPAY_KEY_ID` | Payment | Razorpay test key |
| `RAZORPAY_KEY_SECRET` | Payment | Razorpay secret |
| `SHIPROCKET_EMAIL` | Shipping | Shiprocket credentials |
| `SHIPROCKET_PASSWORD` | Shipping | Shiprocket credentials |
| `CLIENT_URL` | General | Frontend URL |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email | Gmail SMTP for OTP |
| `EMAIL_FROM` | Email | Sender address |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth | Google OAuth (not yet active) |
| `GOOGLE_VISION_API_KEY` | AI | Image search |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Media | Cloudinary cloud name |
| `CLOUDINARY_API_SECRET` | Media | Cloudinary API secret |

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

## Fonts

Loaded via Google Fonts in root layout (`src/app/layout.jsx`):
- **Playfair Display** — headings (`--font-heading`)
- **Outfit** — body text (`--font-body`)

## Design Tokens (CSS)

Defined in `src/app/globals.css` via Tailwind v4 `@theme`:
- Colors: `gold`, `gold-light`, `gold-dark`, `beige-light`, `beige`, `charcoal`, `charcoal-light`, `ivory`, `ivory-dark`
- Dynamic theme variables: `--theme-primary`, `--theme-bg`, `--theme-text`, `--theme-secondary` (overridden at runtime by `ThemeContext`)

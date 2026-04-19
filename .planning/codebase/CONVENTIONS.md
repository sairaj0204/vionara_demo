# Code Conventions

## Language & Module System

- **ES Modules** throughout — `import`/`export` syntax, `.mjs` for Node config files
- **No TypeScript** — plain JavaScript with `jsconfig.json` path aliases
- **Path aliases:** `@/*` resolves to `./src/*`

## Component Patterns

### React Components

- **Functional components only** — no class components anywhere
- **Named exports** for context hooks and providers: `export const useAuth = () => useContext(AuthContext)`
- **Default exports** for page/component files: `export default function Home() {}`
- **'use client'** directive at top of interactive components (layouts, providers, pages with state)
- **No server components explicitly** — most pages delegate to `src/pages/` components which are all client-side

### File Organization

```jsx
// Typical component structure:
'use client';

import { useState, useEffect } from 'react';          // React
import { motion } from 'framer-motion';                // Third-party
import { useAuth } from '@/context/AuthContext';        // Internal context
import { getProducts } from '@/services/api';           // Internal API
import ProductCard from '@/components/product/ProductCard'; // Internal components

export default function Shop() {
    // State declarations
    const [products, setProducts] = useState([]);
    const { user } = useAuth();

    // Effects
    useEffect(() => { ... }, []);

    // Handlers
    const handleFilter = () => { ... };

    // Render
    return ( ... );
}
```

### Context Pattern

All contexts follow the same structure:
1. Create context with `createContext()`
2. Export custom hook: `export const useXxx = () => useContext(XxxContext)`
3. Export provider component: `export const XxxProvider = ({ children }) => { ... }`
4. Provider wraps children with `<XxxContext.Provider value={{...}}>`

Provider composition in `src/components/Providers.jsx`:
```
ThemeProvider → AuthProvider → CartProvider → WishlistProvider → InnerProviders
```

## API Route Patterns

### Server-Side Route Handlers

```javascript
// Standard pattern for API routes:
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { hasMongoConfig } from '@/lib/settings';
import Model from '@/models/Model';

export async function GET(req) {
    // 1. Check if MongoDB is configured (fallback to demo data if not)
    if (!hasMongoConfig()) {
        return NextResponse.json({ success: true, data: demoData, fallback: true });
    }

    try {
        // 2. Connect to DB
        await connectDB();

        // 3. Query
        const results = await Model.find().lean();

        // 4. Return uniform response shape
        return NextResponse.json({ success: true, count: results.length, data: results });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
```

### Response Shape

All API responses follow: `{ success: boolean, message?: string, [data fields] }`

### Admin Protection

```javascript
const adminUser = await verifyAdmin();
if (!adminUser) {
    return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
}
```

## Client-Side API Pattern

Single axios instance with Bearer token interceptor in `src/services/api.js`:

```javascript
const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('vionara_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Functions are one-liners:
export const getProducts = (params) => API.get('/products', { params });
export const createProduct = (data) => API.post('/products', data);
```

## State Management

- **No global state library** — React Context only
- **localStorage** used for persistence:
  - `vionara_token` — JWT auth token
  - `vionara_cart` — cart items (JSON)
  - `vionara_wishlist` — wishlist for unauthenticated users

## Styling Conventions

### CSS Architecture

- **Tailwind CSS v4** utility classes for layout and spacing
- **Custom CSS** in `globals.css` for reusable component classes
- **Inline styles** used occasionally in page components
- **CSS layers:** `@layer base`, `@layer components`, `@layer utilities`

### Button Classes

```css
.btn-gold        /* Gold background, white text, hover effects */
.btn-outline-gold /* Gold border, transparent bg */
.btn-dark        /* Dark charcoal background */
```

### Animation Classes

```css
.animate-fade-in    /* opacity 0→1 */
.animate-slide-up   /* translate up + fade */
.animate-scale-in   /* scale 0.92→1 + fade */
.text-shimmer-gold  /* Gold gradient shimmer effect */
```

### Glassmorphism

```css
.glass-dark    /* rgba(0,0,0,0.45) + blur(12px) */
.glass-light   /* rgba(255,255,255,0.75) + blur(16px) */
```

## Error Handling

### Server-Side

- Try/catch in every route handler
- Fallback to demo data on DB errors (graceful degradation)
- Console logging with emoji prefixes: `✅`, `❌`
- Custom error classes: `SignupOtpError` with status and extra fields

### Client-Side

- `.catch(console.error)` for non-critical operations (wishlist fetch)
- Toast notifications for user-facing errors via `react-hot-toast`
- Auth errors trigger token cleanup: `localStorage.removeItem('vionara_token')`

## Mongoose Model Pattern

```javascript
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    // Fields with defaults, validation, refs
}, { timestamps: true });

// Hooks (pre-save, pre-validate)
schema.pre('save', async function() { ... });

// Instance methods
schema.methods.comparePassword = async function(candidate) { ... };

// Indexes
schema.index({ name: 'text', description: 'text' });

// Prevent model recompilation in Next.js hot reload
export default mongoose.models.Model || mongoose.model('Model', schema);
```

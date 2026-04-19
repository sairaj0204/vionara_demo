# Testing

## Current State: No Tests

The Vionara codebase currently has **no automated tests** of any kind:

- ❌ No unit tests
- ❌ No integration tests
- ❌ No end-to-end tests
- ❌ No test framework installed
- ❌ No test runner configured
- ❌ No `test` script in `package.json`
- ❌ No CI/CD pipeline

## Test Files Found

```
(none)
```

No `.test.js`, `.spec.js`, or `__tests__/` directories exist anywhere in the project.

## Code Quality Tools

| Tool | Status | Config |
|---|---|---|
| ESLint | ✅ Installed | `eslint.config.mjs` — Next.js core-web-vitals rules |
| TypeScript | ❌ Not used | — |
| Prettier | ❌ Not installed | — |
| Husky/lint-staged | ❌ Not installed | — |
| Jest/Vitest | ❌ Not installed | — |
| Playwright/Cypress | ❌ Not installed | — |

## Manual Verification

Development currently relies on:
- Manual browser testing
- Console logging with emoji markers (`✅`, `❌`)
- Demo/fallback data mode for offline development

## Recommended Test Strategy

### Priority Areas for Testing

1. **Auth flows** (`src/lib/signup-otp.js`, `src/lib/auth-utils.js`) — critical business logic with OTP generation, verification, and rate limiting
2. **Product normalization** (`src/lib/catalog.js`) — data transformation used across the app
3. **API routes** (`src/app/api/`) — request validation, error handling, auth middleware
4. **Cart/Wishlist context** — localStorage operations and state management

### Suggested Framework

- **Vitest** — fast, Vite-compatible, ESM-native (aligns with project's ES Modules usage)
- **React Testing Library** — for component testing
- **MSW (Mock Service Worker)** — for mocking API calls in integration tests

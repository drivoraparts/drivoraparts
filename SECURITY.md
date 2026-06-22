# DrivoraParts Security Hardening

## API Security Middleware

**File:** `middleware.ts`  
**Matcher:** `/api/*`, `/admin/*`

| Route pattern | Limit | Window |
|---------------|-------|--------|
| Default `/api/*` | 60 req | 1 min |
| `/api/checkout` | 10 req | 1 min |
| `/api/admin/login` | 5 req | 15 min |
| `/api/analytics`, `/api/cart`, `/api/stock`, `/api/orders` | 30 req | 1 min |

Features:
- Edge-safe in-memory rate limiter (`lib/security/rate-limit.ts`)
- Abuse detection for rapid repeat POSTs (`lib/security/abuse.ts`)
- Structured JSON request logging (`lib/security/request-log.ts`)
- Admin session enforcement on protected API routes (`lib/security/api-access.ts`)

## Admin Security

| Control | Implementation |
|---------|----------------|
| Session TTL | 24 hours (`lib/auth/session.ts`) |
| Logout | `POST /api/auth/logout` (+ legacy `/api/admin/logout`) |
| Login brute-force | 5 attempts / 15 min per IP (`lib/auth/login-rate-limit.ts`) |
| Cookie | httpOnly, secure in production, sameSite=lax |
| Page protection | Middleware on all `/admin/*` except `/admin/login` |

## Protected Endpoints

| Endpoint | Access |
|----------|--------|
| `GET /api/orders` | Admin only |
| `POST/PATCH/DELETE /api/stock` | Admin only |
| `GET /api/analytics` | Admin only |
| `GET /api/live-users` | Admin only |
| `/api/admin/*` | Admin only (except login) |
| `POST /api/auth/logout` | Admin only |
| `POST /api/analytics` | Public (rate limited) |
| `GET /api/product` | Public (cached 60s) |
| `POST /api/checkout` | Public (strict validation + rate limited) |

## Payment Safety

- **Server-side pricing:** `lib/checkout/validate-items.ts` ignores client prices; locks from catalog
- **Order state machine:** `lib/orders/state-machine.ts`
  - `pending → processing → paid → failed → refunded` (+ shipped/delivered/cancelled)
- **Webhook verification:** `lib/payments/webhook-verify.ts` + Cryptomus HMAC
- **DB migration:** run `supabase/migrations/002_order_failed_status.sql`

## Monitoring

- Structured JSON logs via `lib/monitoring/logger.ts`
- Persisted to `activity_logs` + `admin_audit_logs`
- Admin UI: **`/admin/logs`**

## Abuse Protection

- Checkout: max 3 hits/min, 2s minimum interval per fingerprint
- Analytics/cart/stock: flood thresholds in `lib/security/abuse.ts`
- Invalid payloads logged with IP metadata

## Deployment

1. Run migration `002_order_failed_status.sql`
2. Ensure `AUTH_SECRET`, admin credentials, Supabase keys are set
3. Verify rate limits in staging before paid traffic

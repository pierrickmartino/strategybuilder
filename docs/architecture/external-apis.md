# External APIs

## Institutional Market Data API
- **Purpose:** Provide historical and near-real-time crypto data for backtests and paper trades.
- **Documentation:** https://docs.kaiko.com/
- **Base URL(s):** https://gateway.kaiko.com
- **Authentication:** API key in `Authorization` header
- **Rate Limits:** Enterprise SLA 200 req/minute (burst 400)

**Key Endpoints Used:**
- `GET /v2/data/trades.v1/exchanges/{exchange}/instrument/{pair}` – trade history

**Integration Notes:** Cache candles in Redis for short windows, implement retry/backoff, store API key in AWS Secrets Manager.

## Stripe Billing API
- **Purpose:** Manage subscriptions, quotas, invoices, and premium upgrades.
- **Documentation:** https://stripe.com/docs/api
- **Base URL(s):** https://api.stripe.com
- **Authentication:** Bearer token (secret key)
- **Rate Limits:** Stripe-managed; respect idempotency keys for retries

**Key Endpoints Used:**
- `POST /v1/checkout/sessions` – start upgrade flow

**Integration Notes:** Webhooks (invoice.paid, customer.subscription.updated) processed via FastAPI with signature verification and replay protection.

## Supabase Admin API
- **Purpose:** Manage elevated user operations (invites, metadata sync, role promotion) and inspect auth audits.
- **Documentation:** https://supabase.com/docs/reference/admin/introduction
- **Base URL(s):** https://{project}.supabase.co
- **Authentication:** Supabase service-role key (JWT)
- **Rate Limits:** 500 requests/minute; coalesce metadata writes and prefer SQL policies for bulk changes

**Key Endpoints Used:**
- `POST /auth/v1/admin/users` – provision elevated reviewer/educator accounts
- `PATCH /auth/v1/admin/users/{id}` – update `app_metadata.roles`

**Integration Notes:** Store the service-role key in AWS Secrets Manager, issue requests from FastAPI only, audit each mutation via the ComplianceEvent log.

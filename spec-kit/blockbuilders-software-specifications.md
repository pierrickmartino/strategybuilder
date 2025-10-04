# Blockbuilders – Software Requirements Specification (SRS)

## System Design
- Web application enabling visual drag-and-drop strategy creation for crypto traders.  
- Modular block system: Data, Indicators, Signals, Risk, Execution.  
- Real-time validation of connections.  
- Backtesting engine running deterministic simulations on BTC/ETH OHLCV daily data.  
- Results dashboard with KPIs, equity curves, and logs.  
- Paper-trading scheduler to simulate live-like performance.  
- Strategy versioning and comparison view.  
- Onboarding layer with templates and guided walkthrough.  

## Architecture pattern
- **Frontend**: Next.js SPA + SSR hybrid for responsive, fast UI.  
- **Backend**: FastAPI microservice for data processing, validation, backtesting, and paper-trading orchestration.  
- **Storage**: Supabase (Postgres) for strategy data, user management extensions, and logs.  
- **Deployment**: Vercel (frontend), managed API backend (containerized or hosted service).  
- **Integration**: Stripe (payments), Clerk (authentication/identity).  

## State management
- **Frontend**:  
  - React Query / TanStack Query for API state & caching.  
  - Local UI state via React hooks & Context (Canvas interactions).  
  - React Flow for canvas node/edge state.  
- **Backend**: Database persistence with Postgres (Supabase).  

## Data flow
1. **User Action** → drag block on Canvas → local React Flow state.  
2. **Validation Engine (frontend + backend check)** → instant feedback on connections.  
3. **Backtest Request** → API call to FastAPI → loads OHLCV data → runs deterministic simulation.  
4. **Results** → FastAPI returns KPIs, logs, equity curve → displayed in Dashboard.  
5. **Paper-Trading** → scheduled jobs (FastAPI + Supabase cron/queue) → logs stored and surfaced in UI.  

## Technical Stack
- **Frontend**: Next.js, React, TailwindCSS, Shadcn UI, Lucide Icons, React Flow, Sonner Toast.  
- **Backend**: FastAPI (Python).  
- **Database**: Supabase (Postgres + Row Level Security).  
- **Auth**: Clerk (user accounts, sessions, roles).  
- **Payments**: Stripe (subscriptions, billing).  
- **Deployment**: Vercel (frontend), containerized FastAPI on cloud service.  

## Authentication Process
- Users sign up/login via Clerk.  
- JWT session tokens exchanged with FastAPI for API calls.  
- Supabase row-level security enforced via JWT claims.  
- Role-based access for free vs paid subscription tiers (via Stripe + Clerk sync).  

## Route Design
- `/` → Landing page / marketing.  
- `/canvas` → Drag-and-drop strategy builder.  
- `/backtests` → Backtesting history and results dashboard.  
- `/paper-trading` → Scheduled runs, monitoring.  
- `/library` → Strategy library with filters and version history.  
- `/compare` → Comparison view for strategies.  
- `/auth/*` → Clerk-managed routes (login, signup, profile).  
- `/settings` → User profile, subscription, preferences.  

## API Design
- `POST /api/strategy` → create new strategy.  
- `GET /api/strategy/{id}` → retrieve strategy.  
- `PUT /api/strategy/{id}` → update strategy.  
- `DELETE /api/strategy/{id}` → delete strategy.  
- `POST /api/backtest` → run backtest on strategy.  
- `GET /api/backtest/{id}` → get backtest results.  
- `POST /api/paper-trading/schedule` → schedule paper-trading.  
- `GET /api/paper-trading/{id}` → fetch logs & KPIs.  
- `GET /api/templates` → list starter templates.  

## Database Design ERD
**Entities:**
- **Users** (Clerk-managed, synced into Supabase).  
- **Strategies** (id, user_id, metadata, blocks JSON, versioning).  
- **Backtests** (id, strategy_id, parameters, results JSON, created_at).  
- **PaperTradingRuns** (id, strategy_id, schedule, status, logs JSON).  
- **Templates** (id, name, description, blocks JSON, visibility).  
- **Subscriptions** (id, user_id, tier, Stripe metadata).  

**Relationships:**
- User → Strategies (1:N)  
- Strategy → Backtests (1:N)  
- Strategy → PaperTradingRuns (1:N)  
- Templates (global/shared, some user-specific)  
- User → Subscription (1:1 via Stripe)  

# TaxWise — Project Context

This file is meant to be handed to a human or an AI assistant to get full context on
the project in one read. It covers what the app does, how it's built, how the pieces
fit together, and what's deliberately simplified.

---

## 1. What this is

TaxWise is a full-stack web app for **Indian individual income tax planning**. A user
enters their salary, HRA details and common deductions once; the app computes their
tax liability under **both** the old and new income tax regimes side by side, tells
them which is cheaper and by how much, and (if they create an account) lets them save
calculations, see a dashboard of their history, and export results as PDF or Excel.

It supports **FY 2024-25** and **FY 2025-26** slab rules. It is a planning/estimation
tool, not a filing tool — it does not connect to the Income Tax Department or generate
an ITR.

---

## 2. Tech stack

**Backend** — `backend/taxwisebe`
- Java 26, Spring Boot 4.x
- Spring Web, Spring Data JPA, Spring Security, Bean Validation
- MySQL (via `mysql-connector-j` / JPA `ddl-auto=update`)
- JWT auth via `io.jsonwebtoken` (jjwt 0.12.x)
- Maven build (`pom.xml`)

**Frontend** — `frontend/taxwise`
- React 19 + Vite 8 (rolldown-vite), plain CSS (no Tailwind/CSS-in-JS)
- `react-router-dom` v7 for routing
- `@tanstack/react-query` v5 for server-state/data fetching
- `react-hook-form` for form state & validation
- `axios` for HTTP, with a JWT-attaching interceptor
- `recharts` for charts, `lucide-react` for icons, `react-hot-toast` for notifications
- `jspdf` (PDF export) and `xlsx`/SheetJS (Excel export), both lazy-loaded via dynamic
  `import()` so they don't bloat the main bundle
- `oxlint` for linting

Both projects were empty framework scaffolds when this build started; everything
under `src/` was written from scratch across 5 build sessions.

---

## 3. Repository layout

```
backend/taxwisebe/
  pom.xml
  src/main/java/com/tax/
    entity/          User, TaxCalculation, Role, TaxRegime
    repository/       Spring Data JPA repositories
    security/         JwtService, JwtAuthFilter, UserPrincipal, CustomUserDetailsService
    config/           SecurityConfig, CorsConfig
    taxengine/        Pure tax computation engine (no Spring/DB dependency)
    service/          TaxService, TaxHistoryService, AuthService, UserService
    controller/       AuthController, UserController, TaxController
    dto/              Request/response DTOs (auth/, tax/)
    exception/        GlobalExceptionHandler + custom exceptions
  src/main/resources/application.properties

frontend/taxwise/
  src/
    api/              client.js (axios+JWT interceptor), auth.js, tax.js
    context/           AuthContext.jsx (global auth state, localStorage-persisted)
    components/
      layout/          TopNav, Footer, AppLayout
      auth/            AuthLayout, ProtectedRoute, GuestRoute
      calculator/       TaxCalculatorForm, RegimeReceipt, ComparisonChart
      dashboard/        StatCard, RegimeSplitChart, TrendChart
      history/          HistoryDetail
      common/           Modal, LoadingSpinner, PlaceholderPage, RegimeBadge
    pages/              LandingPage, LoginPage, RegisterPage, CalculatorPage,
                        DashboardPage, HistoryPage, ProfilePage, NotFoundPage
    utils/              format.js, sanitizeTaxPayload.js, exportPdf.js, exportExcel.js
    hooks/              useDebouncedValue.js
    index.css           Design tokens + global styles (read this first for styling)
```

---

## 4. Backend details

### Data model
- **User**: id, fullName, email (unique), password (BCrypt hash), pan (optional),
  role (`USER`/`ADMIN`), createdAt/updatedAt, one-to-many `TaxCalculation`.
- **TaxCalculation**: a full snapshot of one saved calculation — every input field
  (income, HRA inputs, deduction amounts, age) *and* every derived output field
  (standard deduction, HRA exemption, total deductions, taxable income, tax before
  cess, rebate, surcharge, cess, total tax liability, take-home annual/monthly,
  comparison-regime tax) plus `label`, `financialYear`, `regime`, `createdAt`.
  Storing outputs alongside inputs means history/PDF/Excel exports never need to
  re-run the engine.

### Auth
Stateless JWT. `POST /api/auth/register` and `/api/auth/login` return
`{ token, userId, fullName, email, role }`. Every other authenticated request sends
`Authorization: Bearer <token>`; `JwtAuthFilter` validates it and populates the
Spring Security context. Passwords are BCrypt-hashed, never stored/returned in plain
text.

### Tax engine (`com.tax.taxengine`)
Pure, dependency-free classes — no Spring, no persistence — so the math is easy to
read and unit test in isolation:
- `TaxSlabProvider` — registry of slab tables per financial year (`2024-25`, `2025-26`).
  **Add a new FY here** when a future Budget changes the slabs.
- `FinancialYearTaxConfig` — one year's slabs (new regime; old regime by age band:
  <60 / 60-80 / 80+), standard deduction, and Section 87A rebate threshold/amount,
  for both regimes.
- `TaxCalculatorEngine` — runs one regime end-to-end: standard deduction → (old
  regime only) HRA exemption + 80C/80D/80CCD(1B)/24(b) deductions → taxable income →
  slab tax → 87A rebate → surcharge → 4% health & education cess → total liability →
  take-home.
- Every `/api/tax/calculate` call internally also computes the *other* regime
  (`calculateOther`) so the response always includes a same-inputs comparison.

**Deliberate simplifications** (documented so nobody mistakes this for a CA-grade
filing tool):
- No marginal relief at the Section 87A rebate boundary or surcharge boundaries.
- Surcharge slabs are evaluated against **taxable income**, not total income.
- 80D uses simple age-based caps (₹25k / ₹50k) rather than modelling parents'
  insurance separately.
- "Other deductions" is a single free-form bucket (80E/80G/80TTA/etc.), uncapped —
  it trusts the user's self-certified number.
- Employer NPS contribution (Section 80CCD(2), allowed under *both* regimes) is not
  modelled — only employee-side 80CCD(1B) (old regime only) is.

### API reference

| Method | Path | Auth? | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account, returns JWT |
| POST | `/api/auth/login` | No | Returns JWT |
| GET | `/api/users/me` | Yes | Current profile |
| PUT | `/api/users/me` | Yes | Update name/PAN |
| PUT | `/api/users/me/password` | Yes | Change password |
| POST | `/api/tax/calculate` | No | Compute tax for one regime + comparison, nothing saved |
| GET | `/api/tax/financial-years` | No | Supported FY list |
| GET | `/api/tax/slabs/{fy}` | No | Slab tables + limits for a FY (both regimes, all age bands) |
| POST | `/api/tax/history` | Yes | Save a calculation |
| GET | `/api/tax/history` | Yes | List saved calculations (summary) |
| GET | `/api/tax/history/{id}` | Yes | Full detail of one saved calculation |
| DELETE | `/api/tax/history/{id}` | Yes | Delete (ownership-checked) |
| GET | `/api/tax/dashboard` | Yes | Totals, averages, regime split, recent trend |

All responses are wrapped in `ApiResponse<T> { success, message, data, timestamp }`.

### Configuration
`application.properties` reads everything from environment variables with sane
local defaults: `DB_URL`/`DB_USERNAME`/`DB_PASSWORD`, `JWT_SECRET`,
`JWT_EXPIRATION_MS`, `CORS_ALLOWED_ORIGINS`, `SERVER_PORT`. **Change `JWT_SECRET` in
any real deployment** — the checked-in default is a placeholder for local dev only.

---

## 5. Frontend details

### Design system ("ledger & passbook")
Defined entirely in `src/index.css` as CSS custom properties — read this file before
changing any styling. Deep navy (`--color-navy`) + ledger green (`--color-emerald`)
+ turmeric gold (`--color-gold`) on warm paper (`--color-paper`). Type: **Fraunces**
(display headings), **Inter** (body/UI), **IBM Plex Mono** (every rupee figure —
tabular numerals, so amounts always align like ledger entries; see the `.figure`
utility class). Signature visual motif: a perforated "receipt" card
(`.regime-receipt`, also used standalone on the landing page) with rotated
rubber-stamp-style badges (`.stamp`) for regime labels.

### Routing (`src/App.jsx`)
- Public: `/` (landing), `/calculator` (works without login)
- Guest-only (redirect to `/dashboard` if already logged in): `/login`, `/register`
- Protected (redirect to `/login` if not authenticated): `/dashboard`, `/history`,
  `/profile`
- `*` → 404 page

### State
- **Auth**: `AuthContext` — token + user kept in React state and mirrored to
  `localStorage` (`taxwise_token`, `taxwise_user`). A response interceptor in
  `api/client.js` force-logs-out on any `401`. Login/register hydrate the *full*
  profile (including PAN/join date, which aren't in the auth response) via one
  extra `GET /api/users/me` call right after persisting the token.
- **Server data**: everything else goes through React Query (`useQuery`/
  `useMutation`), keyed per-endpoint, with cache invalidation on mutations (e.g.
  deleting a history entry invalidates both the history list and dashboard query).

### The calculator flow (`CalculatorPage.jsx`)
`TaxCalculatorForm` owns its own `react-hook-form` instance and reports live values
up via `watch()`; the parent debounces those values (450ms,
`useDebouncedValue`) and — once `annualGrossIncome` is a positive number — fires
**two parallel** `POST /api/tax/calculate` calls (`regime: 'OLD'` and
`regime: 'NEW'`) so both receipts get their full breakdown, not just a single
comparison number. Results render as a savings banner, a `recharts` bar chart, and
two `RegimeReceipt` cards. Logged-in users get a "Save this estimate" button per
receipt (`POST /api/tax/history`); guests see a banner nudging them to sign up.

### Exports
- `utils/exportPdf.js` — hand-draws a one-page PDF with raw `jsPDF` primitives
  (no `autotable` plugin) to match the app's visual language exactly.
- `utils/exportExcel.js` — `SheetJS` (`xlsx`) workbook of the full saved history.
- Both libraries are dynamically `import()`-ed inside these functions so they load
  only when the user actually exports something.

### Environment
`frontend/taxwise/.env.example` documents `VITE_API_BASE_URL` (defaults to
`http://localhost:8080/api`). Copy it to `.env.local` and adjust if the backend
runs elsewhere.

---

## 6. Running it locally

**Backend** (needs a local MySQL instance, or adjust `DB_URL`):
```bash
cd backend/taxwisebe
./mvnw spring-boot:run
```
Defaults to `http://localhost:8080`, DB `taxwise_db` (auto-created), `ddl-auto=update`
(tables auto-created/updated from entities — fine for dev, use a migration tool
like Flyway/Liquibase before any real production use).

**Frontend**:
```bash
cd frontend/taxwise
npm install
npm run dev
```
Defaults to `http://localhost:5173`, expects the API at `http://localhost:8080/api`.

Build note: this project was built without Maven Central access in the sandbox
used to write it, so the backend was carefully hand-reviewed but **not yet
compiled**. The frontend *was* installed, built (`npm run build`), linted
(`npm run lint` — 0 errors), and smoke-tested with the dev server for every route
in this same sandbox. Run `./mvnw spring-boot:run` first thing to confirm the
backend compiles clean in your own environment, and fix forward from there if
anything's off — the code was written carefully but this is the one part that
couldn't be verified end-to-end before delivery.

---

## 7. Known gaps / good next steps

- No password-reset ("forgot password") flow yet.
- No pagination on `/api/tax/history` — fine for personal use, would need it if
  history grows very large.
- No automated tests (unit tests for the tax engine would be high-value — it's
  pure functions, easy to test against known official examples).
- No rate limiting on auth endpoints.
- Only two financial years are configured; extend `TaxSlabProvider` for future
  Budgets.
- No dark mode (design tokens are structured to make this addable later — swap the
  `:root` palette values).

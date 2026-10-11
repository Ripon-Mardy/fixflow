# FixFlow — Smart Maintenance Management for Property Managers

> **Maintenance, without the mess.**
> One place to manage property maintenance requests, technicians, tenants, and repairs.

FixFlow is a production-style SaaS built to show what a real maintenance
management platform for small property-management companies and landlords looks
like — not a CRUD toy. It covers the full journey:

**Tenant reports an issue → Manager reviews it → Technician is assigned →
Technician updates progress → Tenant sees status → Manager monitors everything.**

---

## The problem it solves

Property managers receive maintenance requests through WhatsApp, phone calls,
emails and spreadsheets. Requests get lost, tenants don't know what's happening,
technicians don't have enough information, and managers have no central overview.

FixFlow replaces that with a single system of record: a guided intake form, a
prioritised request queue, technician assignment by skill and availability, a
full activity timeline per request, automatic notifications, and analytics that
update themselves.

---

## Features

| Area                      | What's included                                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Maintenance requests**  | Guided creation form, 8 categories, 4 priorities, 7-stage status flow, human-readable references (`FX-2026-1048`), photo attachments                                                 |
| **Request workspace**     | Description, issue & completion photos, full activity timeline, public comments and internal notes, manager/technician actions                                                       |
| **Manager dashboard**     | Live stats (open, urgent, in progress, resolved this month, avg resolution), request table with search + filters + sort + pagination, urgent queue, property status, recent activity |
| **Technician experience** | Focused "assigned to me" view, urgent / today / completed counts, status updates and completion photos from the field                                                                |
| **Tenant experience**     | My requests, statuses, recent updates, home info, one-click new request                                                                                                              |
| **Properties**            | Property cards, occupancy, per-property units/tenants/requests and performance stats                                                                                                 |
| **Tenants & technicians** | Searchable directories, individual profiles with history and performance                                                                                                             |
| **Calendar**              | Month / week / day views of scheduled visits, reschedule inline                                                                                                                      |
| **Analytics**             | Requests over time, by category, by priority, technician & property performance (Recharts)                                                                                           |
| **Notifications**         | In-app notification center with read/unread state, per-request links                                                                                                                 |
| **Global search**         | `⌘K` / `Ctrl K` command palette across requests, properties, tenants, technicians                                                                                                    |
| **Admin panel**           | Separate console at `/admin`: overview + charts, user CRUD, property & unit management, all requests, categories CRUD, audit-style activity logs, integration status                 |
| **Role-based access**     | `ADMIN`, `MANAGER`, `TECHNICIAN`, `TENANT` — each with a tailored experience and enforced permissions                                                                                |
| **Polish**                | Skeleton loaders, empty states, friendly error boundaries, toasts, responsive layout, light/dark theme, subtle Framer Motion                                                         |

---

## Tech stack

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**-style components (Radix primitives) + **Lucide** icons
- **Prisma** ORM + **PostgreSQL**
- **React Hook Form** + **Zod** for forms and validation
- **Recharts** for analytics
- **Framer Motion** for animation
- **Server Actions** for every mutation; **server components** for data loading

No paid external services are required. Email/SMS, file uploads, auth and
payments are stubbed behind clean service interfaces so real providers can be
connected later without touching call sites.

---

## Architecture

```
app/
  (marketing)/        Public site — /, /features, /how-it-works, /pricing, /contact
  (auth)/             /login, /register, /forgot-password (demo auth)
  dashboard/          Role-aware app (manager / technician / tenant)
    requests/[id]/    Request workspace with actions & timeline
    properties/ tenants/ technicians/ calendar/ analytics/ notifications/ settings/
  admin/              Separate admin console (ADMIN only)
components/
  ui/                 Reusable primitives (button, dialog, table, select, …)
  marketing/ dashboard/ admin/ forms/ charts/
lib/
  auth/               Session cookie, RBAC helpers, auth server actions
  actions/            Server actions (requests, admin, notifications, profile, search)
  queries/            Reusable, typed read queries per domain
  services/           Side-effect abstractions (notifications, storage, activity, reference)
  validations/        Zod schemas
  constants.ts nav.ts utils.ts
prisma/
  schema.prisma       User, Property, Unit, Category, MaintenanceRequest,
                      RequestComment, RequestAttachment, Notification,
                      TechnicianProfile, ActivityLog
  seed.ts seed-data.ts
```

---

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database

### 1. Install

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

| Variable              | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string used by Prisma                                      |
| `AUTH_SECRET`         | Long random string used to sign the demo session cookie (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app (e.g. `http://localhost:3000`)                               |

`.env` is git-ignored — never commit it.

### 3. Database

```bash
npx prisma generate       # generate the client
npx prisma migrate dev    # create the schema (name it e.g. "init")
npx prisma db seed        # load realistic demo data
```

Convenience scripts are also available:

```bash
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run db:reset     # prisma migrate reset (drops, re-migrates, re-seeds)
npm run db:studio    # prisma studio
```

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>. The admin console is at
<http://localhost:3000/admin>.

---

## Demo accounts

Every seeded account uses the password **`Demo123!`** (bcrypt-hashed in the
database). The login page lists them with one-click sign-in.

| Role       | Email                     |
| ---------- | ------------------------- |
| Admin      | `admin@fixflow.demo`      |
| Manager    | `manager@fixflow.demo`    |
| Technician | `technician@fixflow.demo` |
| Tenant     | `tenant@fixflow.demo`     |

### What the seed creates

- 1 admin, 3 managers, 8 technicians (with profiles), 35 tenants
- 6 properties, ~59 units
- 64 maintenance requests across every status and priority
- 400+ timeline events, comments and activity-log entries
- Notifications for managers, technicians and tenants
- 8 issue categories

---

## Available routes

**Public:** `/` · `/features` · `/how-it-works` · `/pricing` · `/contact`
`/login` · `/register` · `/forgot-password`

**App (`/dashboard`):** dashboard (role-aware) · `requests` · `requests/new` ·
`requests/[id]` · `properties` · `properties/[id]` · `tenants` · `tenants/[id]` ·
`technicians` · `technicians/[id]` · `calendar` · `analytics` · `notifications` ·
`settings`

**Admin (`/admin`):** overview · `users` · `properties` · `requests` ·
`technicians` · `categories` · `activity` · `settings`

---

## Scripts

| Script              | Purpose                              |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | `prisma generate` + production build |
| `npm run start`     | Serve the production build           |
| `npm run lint`      | ESLint                               |
| `npm run typecheck` | `tsc --noEmit`                       |
| `npm run db:*`      | Prisma helpers (see above)           |

---

## Demo mode & production path

This project runs entirely locally with no paid dependencies. To take it to
production:

| Concern      | Demo implementation   | Where to connect the real thing                     |
| ------------ | --------------------- | --------------------------------------------------- |
| Auth         | Signed session cookie | `lib/auth/session.ts` → Auth.js / Clerk             |
| Email / SMS  | Console log only      | `lib/services/notifications.ts` → SendGrid / Twilio |
| File uploads | Curated sample images | `lib/services/storage.ts` → S3 / R2 / UploadThing   |
| Payments     | Static pricing page   | not implemented — add Stripe                        |

---

## Future improvements

- Real authentication and password reset
- Live file uploads with image optimisation
- Email / SMS / push notification delivery
- Tenant mobile app / PWA
- SLA timers and escalation rules
- Vendor / third-party contractor management
- CSV / PDF exports for analytics
- Multi-tenant organisations and billing

---

_FixFlow is a portfolio demonstration. Company names, testimonials, pricing and
data are fictional._
# fixflow

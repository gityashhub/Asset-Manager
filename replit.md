# Maison Tempus — MEAN Stack Watch Store

A complete production-ready e-commerce store for luxury watches, built on the
MEAN stack (MongoDB Atlas + Express + Angular + Node.js).

## Stack

- **MongoDB Atlas** (via `MONGODB_URI` secret) with Mongoose ODM
- **Express 4** REST API with MVC structure, JWT auth, bcrypt password hashing
- **Angular 18** standalone components, lazy-loaded routes, route guards, JWT HTTP interceptor
- **Node.js 20**, pnpm workspaces

## Project Layout

```
backend/                       Express + Mongoose API (port 5000)
  src/
    config/db.js               Mongo connection
    models/                    User, Product, Cart, Order, Payment
    controllers/               auth, product, cart, order, payment, user, admin
    routes/                    REST routes mounted under /api
    middleware/                auth (JWT), errorHandler, notFound
    services/cart.service.js   Cart aggregation helpers
    scripts/seed.js            Seeds 12 watches + admin user
    app.js, server.js
frontend/                      Angular 18 app (port 5173)
  proxy.conf.json              Dev proxy /api -> localhost:5000
  src/app/
    core/                      services, guards, interceptors, models
    shared/components/         header, footer, product-card
    pages/                     home, products, product-detail, cart,
                               checkout, payment, orders, order-detail,
                               login, register, admin/*
    app.config.ts, app.routes.ts
scripts/public-proxy.cjs       Tiny HTTP proxy: 8081 -> localhost:5000 so the
                               default Replit dev domain (externalPort 80)
                               serves the Angular dev server.
```

## Workflows

- **Backend** — `BACKEND_PORT=3001 pnpm --filter @workspace/backend run dev` on port 3001 (console)
- **Start application** — runs the public-URL proxy (`scripts/public-proxy.cjs`, port 8081 → 5000) alongside `PORT=5000 pnpm --filter @workspace/frontend run start` on port 5000 (webview). The proxy makes the dev server reachable from the default Replit dev domain (port 80).

## Environment

- `MONGODB_URI` (secret) — MongoDB Atlas connection string
- `SESSION_SECRET` (secret) — used as JWT signing fallback if `JWT_SECRET` is not set
- `JWT_SECRET` (optional) — JWT signing key (defaults to `SESSION_SECRET`)

## Seeding

```
pnpm --filter @workspace/backend run seed
```

Creates the catalogue and an admin account:

- **Admin login:** `admin@watchstore.test` / `admin1234`

## Features

- JWT auth with role-based access (user/admin), bcrypt-hashed passwords
- REST APIs: products, users, cart, orders, payments, admin
- Angular HTTP interceptor attaches JWT, route guards for `/account/*` and `/admin/*`
- Lazy-loaded feature routes
- Realistic dummy checkout with two methods:
  - **UPI** — decorative QR + GPay/PhonePe/Paytm/BHIM badges, UPI ID validation
    (`name@bank` regex), 1.8 s processing spinner, txn ID receipt, order → `paid`
  - **Cash on Delivery** — address confirmation screen, 0.9 s placement,
    payment status `pending` (collect on delivery), order → `confirmed`
- Orders sync to admin (`/api/orders/all`) immediately with method + status badges
- Admin orders page (`/admin/orders`) shows order count tiles, status filter, refresh, empty/error states, and expandable details (items, shipping address, totals)
- **AI Watch Concierge** — floating chat widget on every page powered by Groq + Llama 3.3. Backend endpoint `POST /api/ai/concierge` injects the live product catalogue into the system prompt and parses `[PICK]` markers to render clickable product cards that link to `/product/:id`. Rate-limited to 20 req/min/IP. Requires `GROQ_API_KEY` secret.
- Robust image fallback: every `<img>` for product/order items has an `(error)`
  handler that swaps in a known-good Unsplash watch photo
- Brand: **Watch Hub** — Fraunces serif (display) + Inter sans (body), warm brass accent (`#b8884a`), fully responsive layout (mobile hamburger nav, fluid type via `clamp()`, sticky filter on shop, table-scroll utility for wide tables)

## Notes

- The user explicitly chose Angular + MongoDB despite Replit's recommendations.
- The previous `artifacts/api-server` and `artifacts/mockup-sandbox` scaffolds
  were removed during the Replit migration — they were unrelated to this app.
- Do not disable `minimumReleaseAge` in `pnpm-workspace.yaml`.
- The Angular dev server (`@angular-devkit/build-angular:application` builder)
  has its host check disabled via `disableHostCheck: true` in `angular.json` so
  that the Replit dev domain can reach it.

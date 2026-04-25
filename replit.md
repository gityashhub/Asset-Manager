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
artifacts/                     (Replit artifact scaffolds — unused by MEAN app)
```

## Workflows

- **Backend** — `pnpm --filter @workspace/backend run dev` on port 5000 (console)
- **Start application** — `pnpm --filter @workspace/frontend run start` on port 5173 (webview)

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
- Simulated payment service that returns success / failure / pending
- Light luxury "Maison Tempus" theme

## Notes

- The user explicitly chose Angular + MongoDB despite Replit's recommendations.
- The MEAN app is intentionally outside the Replit artifact system; the
  `artifacts/api-server` and `artifacts/mockup-sandbox` workflows are leftover
  scaffolds and unrelated to this product.
- Do not disable `minimumReleaseAge` in `pnpm-workspace.yaml`.

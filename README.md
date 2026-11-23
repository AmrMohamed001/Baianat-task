<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

A multi-vendor e-commerce backend. Clients shop from many stores in one cart and pay once. Each store (vendor) gets its own order and its share of the money, and the platform keeps a commission.

**Stack:** NestJS 12 · GraphQL (Apollo) · PostgreSQL 16 (TypeORM) · Redis 7 (BullMQ) · Stripe · AWS S3


## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Setup in detail](#setup-in-detail)
- [Configuration](#configuration)
- [Stripe webhooks](#stripe-webhooks)
- [Observability](#observability)
- [Using the API](#using-the-api)
- [Design notes](#design-notes)
- [Database and migrations](#database-and-migrations)
- [Resources](#resources)

## Features

| Area | What it does |
|---|---|
| Auth | Register as a client or vendor, log in with a JWT. The first Super Admin is created by a migration. |
| Vendors | Admins approve or reject new stores. Only verified vendors can sell. Each vendor has its own commission rate. |
| Products | Categories, images uploaded straight to S3, Arabic and English full-text search, filters and sorting, soft delete. |
| Shopping | Cart, wishlist, one checkout for many vendors, Stripe payments, cancellation and refunds. |
| Money | A wallet per vendor plus one platform wallet, with a ledger of every sale, payout and refund. |
| Social | Follow vendors, review vendors (1 to 5 stars), popular products and popular vendors. |
| Notifications | Emails on payment and order changes, sent from a Redis queue. |
| Protection | Rate limits: 200 requests per minute, and 5 per hour for login, register, checkout, refund and payout. |
| Languages | Messages and names in Arabic (default) or English, chosen with `Accept-Language` or `?lang=en`. |

## Requirements

| Tool | Why |
|---|---|
| [Docker](https://docs.docker.com/get-docker/) with Docker Compose | Runs the API, PostgreSQL and Redis |
| A [Stripe](https://dashboard.stripe.com/register) account (test mode is free) | The API does not start without a Stripe secret key |
| [Stripe CLI](https://docs.stripe.com/stripe-cli) | Sends payment events to your local API |
| Node.js 24 | Only if you run the app outside Docker |

These ports must be free: **3000** (API), **5433** (PostgreSQL) and **6379** (Redis).

## Quick start

```bash
git clone <repo-url> starter-ql && cd starter-ql
cp .env.example .env
# fill in ADMIN_PASSWORD, JWT_SECRET and STRIPE_SECRET_KEY in .env

docker compose up --build -d
docker compose exec server npm run migration:run
```

Open <http://localhost:3000/graphql> and log in as `admin` with your `ADMIN_PASSWORD`. Each step is explained below.

## Setup in detail

### 1. Create the env file

```bash
cp .env.example .env
```

`.env.example` already has working values for local development. To start the app you must fill in `ADMIN_PASSWORD`, `JWT_SECRET` and `STRIPE_SECRET_KEY`. The rest can wait until you use payments, emails or image uploads. Every variable is explained in [Configuration](#configuration).

### 2. Start the stack

```bash
docker compose up --build -d
```

| Service | Container | Address on your machine |
|---|---|---|
| API (watch mode, reloads when you edit `src/`) | `server-container` | <http://localhost:3000> |
| PostgreSQL 16 | `starter-ql-db-1` | `localhost:5433` |
| Redis 7 | `starter-ql-redis-1` | `localhost:6379` |

Follow the API logs with `docker compose logs -f server`.

### 3. Run the migrations (this also seeds the admin)

The app never changes the database by itself. Run the migrations once, and again after every pull that adds new ones:

```bash
docker compose exec server npm run migration:run
```

This creates every table and seeds:

- **The Super Admin**: username `admin`, with `ADMIN_PASSWORD`, `ADMIN_EMAIL` and `ADMIN_FULLNAME` from your `.env`. The migration stops with an error if `ADMIN_PASSWORD` is empty.
- **The admin's wallet**, marked as the platform wallet that receives commissions.

There is no other seed data. Use the [Playground examples](docs/playground-examples.md) to create a category, a vendor, products and an order.

### 4. Check it works

Open <http://localhost:3000/graphql> and run:

```graphql
mutation {
  login(input: { emailOrUsername: "admin", password: "your-admin-password" }) {
    accessToken
    user { username role }
  }
}
```

You should get a token and `role: SuperAdmin`.

### Changing `.env` later

The API container reads `.env` when it is created, so a plain restart does not pick up changes. Recreate it:

```bash
docker compose up -d --force-recreate server
```

## Configuration

All settings live in `.env` (copy it from [.env.example](.env.example)). Each feature below lists the variables it reads. Anything marked *optional* can stay empty while you try the app.

### Server

The API listens on `PORT` and writes request logs. Set these in `.env`:

- `PORT`: port the API listens on, `3000`.
- `NODE_ENV`: `development` or `production`. In `production`, GraphQL errors hide stack traces and SQL logging is off.
- `OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET` (optional): Nest Observe monitoring keys, from `npx @nestjs/observe link`.

### Database

PostgreSQL holds all the data. With Docker Compose these values also create the database on the first start. Set these in `.env`:

- `DB_HOSTER`: database host, `db` (the Compose service name).
- `DB_PORT`: database port, `5432` inside Docker. From your machine it is `5433`.
- `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`: database login and name.
- `DB_POOL`: maximum connections in the pool, such as `10`.

Compose only reads the username, password and name the first time it creates the database volume. To change them later, run `docker compose down -v` to start from an empty database.

### First admin

The migrations create one Super Admin so you can log in. Its username is always `admin`. Set these in `.env` **before** running the migrations:

- `ADMIN_PASSWORD`: the admin's password. The migration stops with an error if it is empty.
- `ADMIN_EMAIL`: the admin's email.
- `ADMIN_FULLNAME`: the admin's full name.

`ADMIN_USERNAME` is in `.env.example` but nothing reads it.

### Authentication

Clients sign up with `registerClient` (which also creates their empty cart) and vendors with `registerVendor`. Both get a JWT from `login`. Send it as `Authorization: Bearer <token>`. The `me` query returns the logged-in user.

Set these in `.env`:

- `JWT_SECRET`: a long random string, for example from `openssl rand -hex 32`.
- `JWT_EXPIRES_IN`: token lifetime, such as `1d`, `12h` or `900` (seconds).

### Vendors and commission

Every new vendor starts as `Pending` until an admin approves it, and gets a commission rate that the platform keeps from each of its orders. An admin can change a vendor's rate later with `setVendorCommission`. See [Commission and rounding](#commission-and-rounding).

Set this in `.env`:

- `DT_COMMISSION_RATE`: commission percent given to new vendors, such as `10` or `2.5`.

### Payments (Stripe)

`checkout` creates a Stripe payment, and Stripe tells the API when it succeeds. The API will not start without the secret key. Set these in `.env`:

- `STRIPE_SECRET_KEY`: your secret key from Stripe dashboard → Developers → API keys (`sk_test_...` in test mode).
- `STRIPE_WEBHOOK_SECRET`: signing secret of the webhook, `whsec_...`. Locally it is printed by `stripe listen`, see [Stripe webhooks](#stripe-webhooks).
- `Publishable` (optional): publishable key (`pk_test_...`) for your frontend. The API does not read it.

### Emails and queue

Emails (payment confirmed, order status changed, order refunded) are queued in Redis and sent in the background. Set these in `.env`:

- `REDIS_HOST`, `REDIS_PORT`: where Redis is, `redis` and `6379` in Docker.
- `SMTP_HOST`, `SMTP_PORT`: your mail server, for example `smtp.gmail.com` and `587`.
- `SMTP_USER`, `SMTP_PASS`: the mail account. For Gmail, use an [app password](https://support.google.com/accounts/answer/185833).
- `MAIL_FROM`: the "from" address on every email.

Without the `SMTP_*` values the app still runs, and only the email jobs fail (see the logs).

### Image uploads (S3)

Product images and profile photos go from the browser straight to S3. Set these in `.env`:

- `AWS_REGION`: region of the bucket, such as `us-east-1`.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: keys of an IAM user that can read and write the bucket.
- `S3_BUCKET`: the bucket name.
- `S3_BASE_URL`: start of the public address of uploaded files, used to build image URLs. Use `https://<bucket>.s3.<region>.amazonaws.com`, or your CDN domain.
- `S3_UPLOAD_EXPIRES_SECONDS`: how long an upload link stays valid, `300` is five minutes.
- `S3_FORCE_PATH_STYLE`: keep it `false` on AWS. `true` puts the bucket name in the path instead of the hostname, which only some S3-compatible services need.
- `S3_ENDPOINT` (optional): leave it empty on AWS, the SDK finds S3 by itself. Set it only for an S3-compatible service.

The bucket must allow public reads on `products/*` and `users/*` so image links open, and its CORS rules must allow uploads from your frontend's address.

## Stripe webhooks

Payments are confirmed by Stripe, not by the client. After a payment, Stripe calls `POST /webhooks/stripe`, and only then are the orders marked paid and the wallets credited. Locally, the Stripe CLI forwards those calls to your machine.

### 1. Forward events to the API

```bash
stripe login
stripe listen --forward-to localhost:3000/webhooks/stripe
```

It prints a signing secret:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxx
```

Put it in `.env` as `STRIPE_WEBHOOK_SECRET`, recreate the API container, and keep `stripe listen` running:

```bash
docker compose up -d --force-recreate server
```

The secret stays the same each time you run `stripe listen` with the same account.

### 2. Pay for a checkout without a frontend

Run `checkout` in the Playground and copy the `paymentIntentId`. Then confirm it with a Stripe test card:

```bash
# successful payment
stripe payment_intents confirm pi_xxx --payment-method pm_card_visa --return-url https://example.com

# declined payment
stripe payment_intents confirm pi_xxx --payment-method pm_card_chargeDeclined --return-url https://example.com
```

`stripe listen` shows the events arriving with `[200]`. Then check `myOrders`: a successful payment shows `paymentStatus: Paid`, and a declined one shows `Failed` with the orders `Cancelled`.

### Events the API handles

| Stripe event | What happens |
|---|---|
| `payment_intent.succeeded` | Checkout and orders become `Paid`, the cart is emptied, vendor and platform wallets are credited, and a confirmation email is queued. |
| `payment_intent.payment_failed`, `payment_intent.canceled` | Checkout and orders become `Failed`, pending orders are `Cancelled`, and their stock is returned. |
| `charge.refunded` | Logged only. Refunds are started by the API itself. |

Each event is processed **once**: its id is saved in `sys_stripe_events`, and a repeated delivery is ignored.

`stripe trigger payment_intent.succeeded` creates a payment the app knows nothing about, so the API only logs "unknown payment intent". Use the `confirm` commands above to test real checkouts.

## Observability

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

This project is already instrumented. To connect it, run this and approve the code it prints at [observe.nestjs.com/link](https://observe.nestjs.com/link) - signing up for free if you have no account:

```bash
$ npx @nestjs/observe link
```

It writes the app key and secret into `.env` and makes every `nest start` script (`start`, `start:dev`, `start:debug`) load it. In production, set `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` in the environment instead.

Or do it by hand: create an application and an API key at [observe.nestjs.com](https://observe.nestjs.com), and set the pair as `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` in the environment the app runs in.

The free plan needs no payment details and covers 300,000 events a month. You can also browse the [live demo](https://www.observe-demo.nestjs.com/dashboard) first - the whole dashboard over a busy service's data, with nothing to install.

## Using the API

Everything goes through GraphQL at **`/graphql`**. The only REST route is the Stripe webhook.

- **Playground:** <http://localhost:3000/graphql>, with the schema and autocomplete.
- **Examples:** [docs/playground-examples.md](docs/playground-examples.md), a full walkthrough from a new vendor to a refunded order.
- **Schema file:** [src/schema.gql](src/schema.gql), regenerated every time the app starts.

### Authentication

Log in, then send the token on every request:

```
Authorization: Bearer <accessToken>
```

A token stops working when it expires (`JWT_EXPIRES_IN`), when the user changes their password, or when an admin deactivates the user.

### Roles

| Role | Can do |
|---|---|
| Visitor (no token) | Browse and search products, categories, vendors, reviews, popular lists. Register and log in. |
| Client | Cart, wishlist, checkout, see and cancel own orders, follow and review vendors, profile photo. |
| Vendor | Once verified: manage own products and images, see and update own orders, see own wallet. |
| Super Admin | Approve or reject vendors, set commissions, manage users and categories, see all orders and transactions, refund orders, pay out vendors. |

### Image uploads

Files go from the browser straight to S3. They never pass through the API:

```
browser ──1. createProductImageUpload──▶ API   (returns url, fields, key)
browser ──2. POST the file to url──────▶ S3
browser ──3. addProductImages(key)─────▶ API   (checks the file arrived, size and type, then saves it)
browser ◀─4. image url──────────────────  API   (S3_BASE_URL + key)
```

Profile photos work the same way with `createProfilePhotoUpload` and `setProfilePhoto`. Accepted types are JPEG, PNG and WEBP.

### Pagination, sorting and errors

- Lists take `page` (from 1) and `limit` (1 to 100, default 20), and return `data`, `total`, `page`, `limit` and `totalPages`.
- `products` sorts by `createdAt` or `price`, `ASC` or `DESC`. With `search`, the best matches come first. For a logged-in client, products from vendors they follow come before everything else.
- Errors come back in the GraphQL `errors` array with a translated `message` and a `code`, for example `UNAUTHENTICATED`, `FORBIDDEN`, `BAD_REQUEST` or `TOO_MANY_REQUESTS`.

## Design notes

### Money in cents

Every amount is an **integer number of cents**, stored as PostgreSQL `bigint`: prices, cart totals, orders, commissions, wallet balances and transactions. `2500` means 25.00 USD. Integers never have rounding errors such as `0.1 + 0.2 = 0.30000000000000004`, and Stripe also works in cents. The API takes and returns cents, and the frontend formats them.

The only non-money number is the commission **rate**, a percent stored as `numeric(5,2)` (for example `12.50`).

### One checkout, one order per vendor

A cart can hold products from many vendors. `checkout`:

1. locks the cart and the product rows, so two checkouts cannot sell the same last item,
2. groups the items by vendor,
3. creates **one checkout** (what the client pays, a single Stripe payment) and **one order per vendor** (what each vendor ships),
4. copies each product's name and price into the order items, so later product edits do not change past orders,
5. takes the quantities out of stock,
6. creates the Stripe payment for the checkout total.

A client can only have one `Pending` checkout at a time. Calling `checkout` again returns the same one with its payment secret.

### Commission and rounding

Each order stores its own `commissionAmount`, computed **at checkout** from the vendor's rate at that moment:

```
commissionAmount = round(orderTotal × commissionRate / 100)     (rounded to whole cents, halves up)
vendorShare      = orderTotal − commissionAmount
```

The vendor's share is the remainder, not rounded separately, so **vendor share + commission = order total, exactly, to the cent**.

Example: an order of 1,999 cents at 12.5% gives `round(249.875) = 250` cents commission and `1,749` cents for the vendor.

Changing a vendor's rate only affects later checkouts.

### Wallets and the ledger

There is one wallet per vendor and one **platform wallet** (`type = Platform`), which receives the commissions. Every change of balance writes a row in `sys_transactions`, so the transactions are a full ledger that explains every balance.

| Event | Vendor wallet | Platform wallet |
|---|---|---|
| Payment succeeds (`Sale`) | + vendor share | + commission |
| Admin pays the vendor (`Payout`) | − amount | |
| Order refunded (`Refund`) | − vendor share | − commission |

- Amounts are signed: positive adds to the balance, negative takes from it.
- Each change locks the wallet row and runs in the same database transaction as the order update, so a balance never drifts from its ledger.
- A balance can never go below zero. The API checks first, and the database has a `CHECK (balance >= 0)` constraint as well.
- Each transaction stores the `orderId`, the Stripe `paymentIntentId`, the Stripe `stripeRefundId` for refunds, and who made it (`createdBy`, empty for the system).

### Refunds

An admin calls `refundOrder` on a paid order:

- If the order is not cancelled yet, it is cancelled, the stock is returned and the money is refunded.
- If it is already cancelled, only the money is refunded.

A refund takes the vendor share and the commission back from both wallets, refunds the order total on Stripe, and marks the order `Refunded`. An order can only be refunded once. Stripe receives an idempotency key, so a retry cannot refund twice.

### Order status

Every change is saved in `sys_order_status_history` with who made it, and both the client and the vendor get an email.

| Status | Meaning | Set by |
|---|---|---|
| `Pending` | Created at checkout, waiting to be handled. | System (checkout) |
| `Processing` | The vendor is preparing it. | Vendor or admin |
| `Shipped` | On its way. | Vendor or admin |
| `Delivered` | Received. **Final.** | Vendor or admin |
| `Cancelled` | Stopped, stock returned, refunded if it was paid. **Final.** | Client (only while `Pending`), vendor, admin, or the system when payment fails |

Rules:

- `Delivered` and `Cancelled` are final. Nothing can change them.
- No order can go back to `Pending`.
- A vendor can only change its own orders.
- Between the other statuses the API does not force an order. A vendor may go from `Pending` straight to `Shipped`, for example.
- Two changes at the same moment cannot both win. The second one gets "order already changed".

Payment status is tracked separately on the checkout and on each order:

| Payment status | Meaning |
|---|---|
| `Pending` | Waiting for Stripe. |
| `Paid` | Stripe confirmed the payment. |
| `Failed` | The payment was declined or cancelled. The pending orders are cancelled. |
| `Refunded` | The order's money was returned. |

### Full-text search

`products(search: "...")` searches product names and descriptions in Arabic and English with PostgreSQL's built-in full-text search. No search server is needed.

- **Indexing:** `sys_products` has two columns that PostgreSQL fills by itself, one for Arabic and one for English, each with a GIN index. Names count more than descriptions.
- **Typing:** write it like a search engine: `wireless headphones`, `"noise cancelling"`, `headphones or earbuds`, `headphones -wired`.
- **Language:** Arabic letters search the Arabic text, Latin letters the English text. Mixed text must match both, and numbers like `42` match either.
- **Order:** best match first. `sortBy` only breaks ties between equal matches.

### Popularity

Both lists count only orders that are **paid and not cancelled**. Both take an optional `from` and `to` date range on the order date, and both are paginated.

**Popular products:** ranked by units sold.

```
totalQuantity = sum of the quantities of the product in those orders
```

Ties go to the product sold most recently, then to the lower product id.

**Popular vendors:** ranked by a score from 0 to 1 that mixes rating and sales.

```
score = 0.4 × (averageRating / 5)  +  0.6 × (sales / (sales + 10))
```

- `averageRating` is the vendor's all-time average review, 0 when it has no reviews. The date range does not apply to it.
- `sales` is the number of paid, not cancelled orders in the date range.
- `sales / (sales + 10)` grows quickly at first and flattens out: 10 sales give 0.5, 40 sales give 0.8. That way a few big sellers cannot push everyone else off the list.
- Only verified vendors with at least one review or one sale are listed.
- Ties go to the vendor with more sales, then to the lower vendor id.

Example: a rating of 4.5 with 10 sales gives `0.4 × 0.9 + 0.6 × 0.5 = 0.66`.

### Ratings

A client can leave one review per vendor. After every review change, the vendor's `averageRating` (one decimal) and `reviewsCount` are recalculated and stored on the vendor, so lists can sort by them without counting reviews each time.

### Rate limits

| What | Limit |
|---|---|
| Every request | 200 per minute per IP |
| `login`, `registerClient`, `registerVendor`, `checkout`, `refundOrder`, `payoutVendor` | 5 per hour per IP |

Going over returns `TOO_MANY_REQUESTS`. The counters live in memory: restarting the API resets them, and each running copy of the API counts separately.

## Database and migrations

**ERD:** [database.dbml](database.dbml). Paste it into <https://dbdiagram.io/d> to see the diagram.

Conventions:

- Table names start with `sys_`, and columns are camelCase.
- Statuses and roles are PostgreSQL enums, not lookup tables.
- Products are soft deleted (`deletedAt`), so past orders still point at them.
- `synchronize` is off. Every schema change is a migration in [src/database/migrations](src/database/migrations).

| Command | What it does |
|---|---|
| `npm run migration:show` | List migrations, `[X]` means applied |
| `npm run migration:run` | Apply all pending migrations |
| `npm run migration:revert` | Undo the last applied migration |
| `npm run migration:generate --name=AddSomething` | Create a migration from your entity changes |
| `npm run migration:create --name=AddSomething` | Create an empty migration |

With Docker, run them in the container: `docker compose exec server npm run migration:run`.

To start over with an empty database:

```bash
docker compose down -v        # deletes the database volume
docker compose up -d
docker compose exec server npm run migration:run
```


## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observe](https://observe.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

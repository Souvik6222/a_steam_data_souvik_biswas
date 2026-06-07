# 🎮 Steam Data API

A production-ready **REST API** for Steam game data built with **Express 5** and **MongoDB/Mongoose 9**.
Exposes 80+ endpoints covering game CRUD, analytics, search, auth, admin, recommendations, and more — every route ships with **HEAD + OPTIONS** support.

---


## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 (ES Modules) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose 9 |
| Auth | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` |
| Validation | `express-validator` |
| Rate Limiting | `express-rate-limit` |
| Dev Server | `nodemon` |

---

## Quick Start

```bash
# 1. Clone
git clone <repo-url>
cd a_steam_data_souvik_biswas

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret (see below)

# 4. Seed the database
#    Place your Steam JSON dataset at src/data/games.json first
npm run seed

# 5. Start development server
npm run dev
```

The API is available at `http://localhost:5000`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the server listens on |
| `MONGO_URI` | **Yes** | — | Full MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret key used to sign/verify JWTs |
| `NODE_ENV` | No | `development` | `development` \| `production` |
| `SEED_FILE` | No | `src/data/games.json` | Custom path for `npm run seed:custom` |

**Example `.env`:**

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/steam_data
JWT_SECRET=my_super_secret_key_change_me
NODE_ENV=development
```

---

## Database Seeding

### Step 1 — Place the dataset

Place your Steam dataset JSON at:

```
src/data/games.json
```

The file must be a JSON **array** of objects (or an object whose values are records).
Expected fields per record:

| Field | Type | Example |
|---|---|---|
| `appid` | string | `"3057270"` |
| `name` | string | `"Seafarer's Gambit"` |
| `release_date` | string | `"Jul 5, 2024"` |
| `genres` | `;`-delimited string | `"Action;Indie;RPG"` |
| `categories` | `;`-delimited string | `"Single-player;Family Sharing"` |
| `price` | string | `"3.99"` |
| `recommendations` | string | `"142"` |
| `developer` | string | `"Bouncy Rocket Studios"` |
| `publisher` | string | `"Bouncy Rocket Studios"` |

> `src/data/games.json` and `src/data/*.json` are git-ignored — dataset files can be 50 MB+.

### Step 2 — Seed

```bash
npm run seed
```

To use a file at a custom path:

```bash
SEED_FILE=./a_steam_data_2021_2025.json npm run seed:custom
```

The script clears the collection first (`Game.deleteMany({})`), then bulk-inserts in batches of 500.

---

## Folder Structure

```
├── server.js                      # Express entry point — app setup, mount order
├── package.json
├── .env / .env.example
├── .gitignore
│
└── src/
    ├── config/
    │   └── db.js                  # Mongoose connection factory
    │
    ├── controllers/               # HTTP adapters — all wrapped with catchAsync
    │   ├── gameController.js      # CRUD + 30 sub-resource handlers
    │   ├── authController.js      # Register, login, profile, password flows
    │   ├── jwtController.js       # Token generation, verification, revocation
    │   ├── adminController.js     # Admin-only game list, analytics, reports
    │   ├── analyticsController.js # Revenue, distribution, trend aggregations
    │   ├── statsController.js     # Counts, averages, top-rated
    │   ├── searchController.js    # Full-text regex search
    │   ├── advancedController.js  # Random, compare, timeline, news, logs
    │   ├── notificationController.js # In-memory notification CRUD
    │   └── userController.js      # Legacy pre-v1 user endpoints
    │
    ├── data/
    │   ├── .gitkeep               # Keeps directory in git
    │   └── games.json             # ← Place dataset here (git-ignored)
    │
    ├── middlewares/
    │   ├── authMiddleware.js      # JWT verification — attaches req.user
    │   ├── errorHandler.js        # Global 4-arg error handler (AppError aware)
    │   ├── errorMiddleware.js     # notFound + available-routes registry
    │   ├── rateLimiter.js         # express-rate-limit configurations
    │   ├── requestLogger.js       # Console + in-memory ring buffer (last 100)
    │   ├── roleMiddleware.js      # roleGuard('admin') factory
    │   └── validate.js            # express-validator rule chains
    │
    ├── models/
    │   ├── Game.js                # Mongoose Game schema (compound indexes, virtuals)
    │   └── User.js                # Mongoose User schema (bcrypt password hashing)
    │
    ├── routes/                    # Express routers — HEAD + OPTIONS on every path
    │   ├── gameRoutes.js          # /api/games (static filters before param routes)
    │   ├── authRoutes.js          # /api/v1/auth
    │   ├── jwtRoutes.js           # /api/v1/jwt
    │   ├── analyticsRoutes.js     # /api/v1/analytics
    │   ├── statsRoutes.js         # /api/v1/stats
    │   ├── adminRoutes.js         # /api/v1/admin (JWT + admin)
    │   ├── advancedRoutes.js      # /api/v1 (random, trending, compare…)
    │   ├── systemRoutes.js        # /api/v1 (health, system/info, version)
    │   ├── searchRoutes.js        # /api/v1/search
    │   ├── notificationRoutes.js  # /api/v1/notifications
    │   ├── protectedRoutes.js     # /api/v1/protected (JWT)
    │   ├── middlewareRoutes.js    # /api/v1/middleware (demo)
    │   └── userRoutes.js          # /api/users (legacy)
    │
    ├── scripts/
    │   └── seed.js                # Database seed script
    │
    ├── services/                  # Business logic — throws AppError for domain errors
    │   ├── gameService.js         # Core game operations + advanced queries
    │   ├── authService.js         # Auth flows (register, login, OTP, reset)
    │   ├── searchService.js       # Regex search with pagination
    │   └── userService.js         # Legacy user service
    │
    └── utils/
        ├── AppError.js            # Custom error class: message + statusCode
        ├── catchAsync.js          # HOF: (fn) => (req,res,next) => Promise.catch(next)
        ├── httpMethods.js         # addHeadOptions() — HEAD + OPTIONS factory
        ├── buildFilter.js         # Query-string → Mongoose filter builder
        ├── paginate.js            # Standardised pagination helper
        └── generateToken.js       # JWT sign helper
```

---

## Authentication

### 1. Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Souvik",
  "email": "souvik@example.com",
  "password": "secret123"
}
```

### 2. Login — get token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "souvik@example.com",
  "password": "secret123"
}
```

Response includes `data.token`.

### 3. Use the token

Add the header to every protected request:

```http
Authorization: Bearer <token>
```

---

## API Route Reference

> Base URL: `http://localhost:5000`
> All `/api/v1/...` routes support **HEAD** and **OPTIONS** in addition to the listed methods.

### 🎮 Games — `/api/games`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/games` | — | List games (paginated, filterable) |
| `POST` | `/api/games` | — | Create a game |
| `GET` | `/api/games/:appid` | — | Get game by appid |
| `PUT` | `/api/games/:appid` | — | Replace game document |
| `PATCH` | `/api/games/:appid` | — | Partial update |
| `DELETE` | `/api/games/:appid` | — | Hard delete |
| `GET` | `/api/games/:appid/exists` | — | Check existence |
| `GET` | `/api/games/:appid/summary` | — | Lightweight summary |
| `PATCH` | `/api/games/:appid/archive` | — | Soft delete |
| `PATCH` | `/api/games/:appid/restore` | — | Restore soft-deleted |
| `GET` | `/api/games/:appid/related` | — | Related by genre |
| `GET` | `/api/games/:appid/screenshots` | — | Screenshots |
| `GET` | `/api/games/:appid/trailers` | — | Trailers |
| `GET` | `/api/games/:appid/reviews` | — | Reviews list |
| `POST` | `/api/games/:appid/reviews` | — | Add review |
| `PATCH` | `/api/games/:appid/reviews/:reviewId` | — | Update review |
| `DELETE` | `/api/games/:appid/reviews/:reviewId` | — | Delete review |
| `GET` | `/api/games/:appid/dlc` | — | DLC list |
| `GET` | `/api/games/:appid/achievements` | — | Achievements |
| `GET` | `/api/games/:appid/leaderboard` | — | Leaderboard |
| `GET` | `/api/games/:appid/updates` | — | Update history |
| `GET` | `/api/games/:appid/news` | — | News articles |
| `GET` | `/api/games/:appid/system-requirements` | — | Sys requirements |
| `GET` | `/api/games/:appid/update-history` | — | Raw update history |

### 🔍 Filters — `/api/games/filter/...`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/games/filter/free-to-play` | Free games |
| `GET` | `/api/games/filter/paid` | Paid games |
| `GET` | `/api/games/filter/discounted` | Discounted games |
| `GET` | `/api/games/filter/early-access` | Early access |
| `GET` | `/api/games/filter/vr-only` | VR-only games |
| `GET` | `/api/games/filter/multiplayer` | Multiplayer games |
| `GET` | `/api/games/filter/singleplayer` | Singleplayer games |
| `GET` | `/api/games/filter/coop` | Co-op games |
| `GET` | `/api/games/filter/horror` | Horror games |
| `GET` | `/api/games/filter/indie` | Indie games |
| `GET` | `/api/games/filter/top-rated` | Top rated (≥8) |

### 📊 Sort — `/api/games/sort/...`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/games/sort/rating-desc` | By rating |
| `GET` | `/api/games/sort/price-desc` | By price |
| `GET` | `/api/games/sort/downloads-desc` | By downloads |
| `GET` | `/api/games/sort/releaseDate-desc` | By release date |
| `GET` | `/api/games/sort/popularity-desc` | By popularity |

### 🔎 Search — `/api/v1/search`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/search?q=&page=&limit=` | Full-text search |

### 📈 Analytics — `/api/v1/analytics`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/analytics/top-rated` | Top 10 by rating |
| `GET` | `/api/v1/analytics/most-downloaded` | Top 10 by downloads |
| `GET` | `/api/v1/analytics/revenue` | Revenue by developer |
| `GET` | `/api/v1/analytics/platform-distribution` | Games per platform |
| `GET` | `/api/v1/analytics/genre-distribution` | Games per genre |
| `GET` | `/api/v1/analytics/trending` | Trending (last 6 months) |
| `GET` | `/api/v1/analytics/release-trends` | Games per release year |
| `GET` | `/api/v1/analytics/review-analysis` | Avg review score |
| `GET` | `/api/v1/analytics/wishlist-analysis` | Top by downloads proxy |
| `GET` | `/api/v1/analytics/user-activity` | Per-developer summary |

### 📉 Stats — `/api/v1/stats`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/stats/count` | Total game count |
| `GET` | `/api/v1/stats/top-rated` | Top 10 by rating |
| `GET` | `/api/v1/stats/most-downloaded` | Top 10 by downloads |
| `GET` | `/api/v1/stats/average-price` | Avg / min / max price |
| `GET` | `/api/v1/stats/average-rating` | Avg / min / max rating |
| `GET` | `/api/v1/stats/genre-count` | Count per genre |
| `GET` | `/api/v1/stats/platform-count` | Count per platform |
| `GET` | `/api/v1/stats/free-to-play-count` | Free-to-play count |
| `GET` | `/api/v1/stats/multiplayer-count` | Multiplayer count |
| `GET` | `/api/v1/stats/monthly-releases` | Releases per month |

### 🚀 Advanced — `/api/v1`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/games/random` | Random game |
| `GET` | `/api/v1/trending/games` | Top 10 trending (last 90 days) |
| `GET` | `/api/v1/compare/games/:id1/:id2` | Side-by-side comparison |
| `GET` | `/api/v1/recommendations/games/:appid` | Genre recommendations |
| `GET` | `/api/v1/timeline/game/:appid` | Update timeline |
| `GET` | `/api/v1/activity/logs` | Last 20 request logs |
| `GET` | `/api/v1/news/latest` | Latest news (mock) |
| `GET` | `/api/v1/news/trending` | Trending news (mock) |

### 🔐 Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | — | Register (email + password ≥ 6) |
| `POST` | `/api/v1/auth/login` | — | Login → returns `token` |
| `GET` | `/api/v1/auth/profile` | JWT | Get own profile |
| `PATCH` | `/api/v1/auth/profile` | JWT | Update profile |
| `POST` | `/api/v1/auth/forgot-password` | — | Request reset token |
| `POST` | `/api/v1/auth/reset-password` | — | Reset with token |
| `POST` | `/api/v1/auth/change-password` | JWT | Change password |
| `POST` | `/api/v1/auth/send-otp` | — | Send OTP |
| `POST` | `/api/v1/auth/verify-email` | — | Verify OTP |

### 🔑 JWT — `/api/v1/jwt` *(all routes require JWT)*

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/jwt/profile` | JWT-decoded profile |
| `GET` | `/api/v1/jwt/dashboard` | Dashboard snapshot |
| `POST` | `/api/v1/jwt/generate-token` | Generate token (admin) |
| `POST` | `/api/v1/jwt/verify-token` | Verify a token |
| `POST` | `/api/v1/jwt/refresh-token` | Refresh a token |
| `DELETE` | `/api/v1/jwt/revoke-token` | Revoke current token |
| `GET` | `/api/v1/jwt/private-games` | Auth-gated game list |
| `GET` | `/api/v1/jwt/private-analytics` | Auth-gated analytics |

### 🛡️ Admin — `/api/v1/admin` *(JWT + admin role)*

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/admin/games` | All games incl. archived |
| `GET` | `/api/v1/admin/analytics` | Aggregated admin analytics |
| `GET` | `/api/v1/admin/reports` | Summary reports |

### 🔔 Notifications — `/api/v1/notifications`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/notifications` | List all (in-memory) |
| `PATCH` | `/api/v1/notifications/read/:id` | Mark as read |
| `DELETE` | `/api/v1/notifications/:id` | Delete |

### ⚙️ System — `/api/v1`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Status + uptime + timestamp |
| `GET` | `/api/v1/system/info` | Node version, env, DB status |
| `GET` | `/api/v1/system/version` | Version from package.json |

---

## Error Response Shape

All errors return:

```json
{
  "success": false,
  "message": "Game not found.",
  "error": "<stack trace — development only>"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request / validation failed |
| `401` | Missing or invalid JWT |
| `403` | Insufficient role (non-admin on admin routes) |
| `404` | Resource not found |
| `409` | Duplicate `appid` |
| `422` | express-validator rule violation |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |

---

## npm Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `nodemon server.js` | Dev server with auto-restart |
| `npm start` | `node server.js` | Production server |
| `npm run seed` | `node src/scripts/seed.js` | Seed from `src/data/games.json` |
| `npm run seed:custom` | `node src/scripts/seed.js` | Seed from `SEED_FILE` env var |
<div align="center">

<img src="https://img.shields.io/badge/NEXUS-Steam%20Analytics%20Hub-e85d22?style=for-the-badge&logo=steam&logoColor=white" />

# NEXUS — Steam Games Analytics & Management Dashboard

**A production-style full-stack web application for exploring, curating, and analyzing Steam game data.**

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)

</div>

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         NEXUS — Application Flow                         │
└──────────────────────────────────────────────────────────────────────────┘

  ╔═══════════════════════════════╗
  ║   🖥️  FRONTEND  (React/Vite) ║
  ║  ─────────────────────────── ║
  ║  📄 Pages & Layouts          ║
  ║     LandingPage, Dashboard   ║
  ║     Registry, Analytics      ║
  ║                              ║
  ║  🗄️  Redux Toolkit Store      ║
  ║     Auth State, Game Cache   ║
  ║                              ║
  ║  📡 Axios Service (api.js)   ║
  ╚═══════════╤══════════════════╝
              │
              │  ┌──────────────────────────────────────────┐
              │  │     🔁  INTERCEPTOR LAYER                │
              │  │  ──────────────────────────────────────  │
              ├──►  ➡️ Request Interceptor                  │
              │  │     Reads localStorage → injects JWT     │
              │  │     Bearer token on every request        │
              │  │                                          │
              │  │  ⬅️ Response Interceptor                 │
              │  │     401 → clears token, triggers logout  │
              │  │     Normalizes all error payloads        │
              └──┤                                          │
                 └────────────────┬─────────────────────────┘
                                  │
                                  ▼ HTTP Requests
  ╔═══════════════════════════════════════════════════════╗
  ║   ⚙️  BACKEND  (Node.js / Express API)               ║
  ║  ──────────────────────────────────────────────────  ║
  ║   server.js ─── Middleware Stack ─── Master Router   ║
  ║                                                      ║
  ║  🛡️  Security Middleware Pipeline:                   ║
  ║     CORS → express.json → Morgan logger              ║
  ║     → Custom logger → Rate limiter (100/15min)       ║
  ║                                                      ║
  ║  🔀  API Routes (/api/v1/)                           ║
  ║     /auth        /games         /analytics           ║
  ║     /stats       /search        /admin               ║
  ║     /jwt         /filter        /trending            ║
  ║                                                      ║
  ║  📦  Controllers → Services → Mongoose Queries       ║
  ╚════════════════════════╤══════════════════════════════╝
                           │
                           ▼ Mongoose ODM
  ╔══════════════════════════════════════════════════╗
  ║   🍃  DATABASE  (MongoDB)                        ║
  ║  ──────────────────────────────────────────────  ║
  ║   👤 User Collection                             ║
  ║      name · email · password (bcrypt) · role     ║
  ║                                                  ║
  ║   🎮 Game Collection                             ║
  ║      appid · title · genre · price · rating      ║
  ║      platforms · tags · reviews · dlc            ║
  ╚══════════════════════════════════════════════════╝

  ╔═════════════════════════════════════════════════════════════════╗
  ║   🛠️  DEVELOPER TOOLCHAIN                                      ║
  ║  ─────────────────────────────────────────────────────────── ║
  ║   📥 seedData.js         → Bulk-load game catalog from JSON   ║
  ║   👑 createAdmin.js      → Provision an admin user via CLI    ║
  ║   📬 generatePostman.js  → Compile live routes → Postman JSON ║
  ║   🌐 homepageRenderer.js → Serve interactive API docs at /    ║
  ╚═════════════════════════════════════════════════════════════════╝
```

---

## 📁 Directory Structure

<details>
<summary><b>Click to expand the full project tree</b></summary>

```
a_steam_data_souvik_biswas/
│
├── 📄 README.md                              ← You are here
├── 📬 Steam_Games_API.postman_collection.json ← Auto-generated Postman collection
├── 🎤 presentation_script.md                 ← Slide-by-slide presentation guide
│
├── 🖥️  frontend/                             ← Vite + React Application
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.development                      ← VITE_API_URL config
│   └── src/
│       ├── App.jsx & main.jsx
│       ├── index.css                         ← Lumina theme system
│       ├── components/                       ← Reusable UI blocks
│       ├── hooks/                            ← Custom React hooks
│       ├── layouts/                          ← Dashboard shell layout
│       ├── pages/
│       │   ├── LandingPage.jsx               ← Aurora-animated hero page
│       │   ├── auth/                         ← Login · Register · ForgotPassword
│       │   ├── dashboard/                    ← Dashboard · Analytics · Registry · Admin
│       │   └── games/                        ← GameDetails · CreateGame · EditGame
│       ├── routes/
│       │   ├── AppRouter.jsx                 ← Route definitions
│       │   └── ProtectedRoute.jsx            ← JWT-guarded route wrapper
│       ├── services/
│       │   └── api.js                        ← Central Axios instance + interceptors
│       └── store/                            ← Redux Toolkit slices & store config
│
└── ⚙️  backend/                              ← Node.js + Express Server
    ├── server.js                             ← Application entry point
    ├── package.json
    ├── .env                                  ← Secrets (never commit)
    ├── data/
    │   └── sample-games.json                 ← Seed dataset (1000+ games)
    └── src/
        ├── config/
        │   ├── db.js                         ← MongoDB connection
        │   └── routesSpec.js                 ← API metadata catalogue
        ├── models/
        │   ├── User.js                       ← User schema + bcrypt hooks
        │   └── Game.js                       ← Game schema
        ├── controllers/                      ← HTTP request handlers
        ├── services/                         ← Mongoose queries & business logic
        ├── routes/
        │   ├── index.js                      ← Master router
        │   ├── auth.routes.js
        │   ├── game.routes.js
        │   ├── filter.routes.js
        │   ├── analytics.routes.js
        │   ├── stats.routes.js
        │   ├── search.routes.js
        │   ├── admin.routes.js
        │   └── jwt.routes.js
        ├── middlewares/
        │   ├── auth.middleware.js            ← JWT verification
        │   ├── admin.middleware.js           ← Role guard
        │   ├── error.middleware.js           ← Global error handler
        │   ├── rateLimiter.middleware.js     ← 100 req/15min (10 on auth)
        │   └── logger.middleware.js          ← Custom request logger
        ├── utils/
        │   ├── apiResponse.js               ← Standardized { success, message, data }
        │   ├── asyncHandler.js              ← try/catch wrapper
        │   ├── pagination.js                ← Page + limit helpers
        │   ├── routeScanner.js              ← Live Express stack crawler
        │   └── homepageRenderer.js          ← Interactive HTML API docs
        └── scripts/
            ├── seedData.js                  ← Load JSON into MongoDB
            ├── createAdmin.js               ← Provision admin user via CLI
            ├── generatePostman.js           ← Auto-generate Postman collection
            └── testConnection.js            ← Verify DB connectivity
```

</details>

---

## 🚀 Quick Start

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | v18+ |
| MongoDB | Local or Atlas |
| npm | v9+ |

---

### 1️⃣ Backend Setup

```bash
# Install dependencies
cd backend
npm install

# Create your .env file
cp .env.example .env   # then edit with your values
```

```env
# backend/.env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/steam_games_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash
# Seed game data
npm run seed

# Create an admin user
node src/scripts/createAdmin.js

# Start dev server (auto-restart on save)
npm run dev
```

> ✅ Server is live at `http://localhost:5000`  
> ✅ Open in browser to view the **interactive API documentation**

---

### 2️⃣ Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start the Vite dev server
npm run dev
```

> ✅ App is live at `http://localhost:5173`

```env
# frontend/.env.development  (already included)
VITE_API_URL=http://localhost:5000
```

---

## 📡 API Endpoints Overview

> **Legend:** 🟢 Public — 🔒 Auth Required — 🛡️ Admin Only

### Authentication — `/api/v1/auth`

| Method | Endpoint | Access |
|--------|----------|--------|
| `POST` | `/register` | 🟢 Public |
| `POST` | `/login` | 🟢 Public |
| `GET` | `/profile` | 🔒 Auth |
| `PATCH` | `/profile` | 🔒 Auth |
| `POST` | `/change-password` | 🔒 Auth |

### Games — `/api/v1/games`

| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/` | 🟢 Public |
| `GET` | `/:appid` | 🟢 Public |
| `GET` | `/random` | 🟢 Public |
| `POST` | `/` | 🛡️ Admin |
| `PUT` | `/:appid` | 🛡️ Admin |
| `DELETE` | `/:appid` | 🛡️ Admin |
| `POST` | `/:appid/reviews` | 🔒 Auth |

### Analytics — `/api/v1/analytics/games`

| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/top-rated` | 🟢 Public |
| `GET` | `/most-downloaded` | 🟢 Public |
| `GET` | `/revenue` | 🟢 Public |
| `GET` | `/genre-distribution` | 🟢 Public |
| `GET` | `/platform-distribution` | 🟢 Public |
| `GET` | `/trending` | 🟢 Public |
| `GET` | `/release-trends` | 🟢 Public |

> 📬 **Import the full Postman collection** → [`Steam_Games_API.postman_collection.json`](./Steam_Games_API.postman_collection.json)

---

## 🛠️ Developer Scripts

| Script | Command | What It Does |
|--------|---------|--------------|
| Start server | `npm start` | Run in production mode |
| Dev server | `npm run dev` | Nodemon auto-restart |
| Seed games | `npm run seed` | Bulk-load `sample-games.json` into MongoDB |
| Create admin | `node src/scripts/createAdmin.js` | Provision `admin@example.com` with role `admin` |
| Generate Postman | `node src/scripts/generatePostman.js` | Compile live routes into Postman JSON |
| Test DB | `npm run test:db` | Verify MongoDB connection |

---

## 🔐 Security Model

```
Request Received
      │
      ▼
  [CORS Check]  ──── blocked? ──→  403 Forbidden
      │
      ▼
  [Rate Limiter] ─── too many? ──→ 429 Too Many Requests
      │
      ▼
  [Route Match]  ─── no match? ──→ 404 Not Found
      │
      ▼
  [Auth Middleware] ─ no token? ──→ 401 Unauthorized
  (protected routes)
      │
      ▼
  [Admin Middleware] ─ wrong role? → 403 Forbidden
  (admin routes)
      │
      ▼
  [Controller → Service → DB]
      │
      ▼
  { success: true, message: "...", data: { ... } }
```

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 19 + Vite 8 |
| State Management | Redux Toolkit |
| HTTP Client | Axios (with interceptors) |
| UI Styling | Tailwind CSS v4 + Material UI |
| Backend Framework | Node.js + Express 4 |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| Rate Limiting | express-rate-limit |
| API Documentation | Dynamic route scanner + HTML renderer |
| Dev Tools | Nodemon, Postman collection generator |

---

## 📝 License

MIT — This is a learning and portfolio project by **Souvik Biswas**.

# NEXUS — Full-Stack Steam Games Analytics & Management Dashboard

This is the backend subdirectory documentation. For the full-stack project guide (including frontend instructions and architecture design), please see the root [README.md](../README.md).

---

## Backend Directory Overview

This folder (`backend/`) is self-contained — all application code lives in `src/`, and `server.js` is the entry point.

### Backend Project Structure

```
backend/
├── server.js              ← Entry point (starts the server)
├── package.json           ← Dependencies and npm scripts
├── .env                   ← Secrets (never commit to git)
├── .gitignore
├── README.md
├── data/
│   └── sample-games.json  ← Sample dataset for seeding
└── src/
    ├── config/db.js       ← MongoDB connection
    ├── models/            ← Game & User schemas
    ├── controllers/       ← HTTP handlers (req -> res)
    ├── services/          ← Business logic + database queries
    ├── routes/            ← URL -> controller mapping
    ├── middlewares/       ← Auth, logging, errors, rate limits
    ├── utils/             ← asyncHandler, apiResponse, pagination
    └── scripts/
        ├── seedData.js    ← Load JSON games into MongoDB
        ├── createAdmin.js ← CLI script to seed administrator accounts
        └── generatePostman.js ← Dynamic Postman generator script
```

For configuration, database seeding, running the server, and full endpoint lists, see the main [README.md](../README.md).

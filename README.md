# ShopScore — Store Rating Platform

ShopScore is a full-stack web application where users can discover registered stores and submit 1–5 star ratings. The application provides a shared authentication system serving three distinct roles:

- **`ADMIN`**: Manages platform statistics, provisions store and user accounts (including Admin and Store Owner roles), and manages stores and owner assignments.
- **`USER`**: Registers publicly, browses stores, searches by name/address, submits and modifies ratings (1–5 stars).
- **`STORE_OWNER`**: Views performance metrics, average ratings, and individual reviews for their assigned stores.

---

## Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Axios, Lucide React
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL 16 (running via Docker Compose)
- **ORM & Migrations**: Prisma
- **Authentication**: JWT with secure Bearer token & HTTP-only cookie support, bcrypt password hashing
- **Validation**: Zod (authoritative server validation and client feedback)
- **Testing**: Node.js native test runner + Supertest

---

## Development Environment (WSL + Docker)

This application is built for development in **VS Code using WSL (Ubuntu)** with **PostgreSQL running inside a Docker container**. Both the backend API and frontend React client run natively inside WSL, connecting to PostgreSQL over `localhost:5432`.

### Prerequisites

1. **Windows 10/11 with WSL 2** (Ubuntu 22.04 or 24.04 recommended)
2. **Docker Desktop** installed on Windows with **WSL 2 backend integration** enabled for your Ubuntu distro
3. **Node.js** (v20+ or v22+) & **npm** installed inside WSL

---

## Step-by-Step Setup Instructions

All commands below should be executed from your **WSL terminal**.

### 1. Clone & Enter Project Root

```bash
git clone <repository-url> ShopScore
cd ShopScore
```

### 2. Configure Environment Files

Copy the provided environment templates:

```bash
# 1. Project Root (Docker Compose PostgreSQL settings)
cp .env.example .env

# 2. Backend (Express API & Prisma connection settings)
cp backend/.env.example backend/.env
```

> **Security Note**: Never commit `.env` files. Both are ignored in `.gitignore`.

---

### 3. Start PostgreSQL with Docker Compose

From the project root:

```bash
docker compose up -d
```

Verify that the container is running and healthy:

```bash
docker compose ps
# Expected status: shopscore_postgres ... Up (healthy)
```

---

### 4. Setup Backend, Run Migrations & Seed Data

Navigate to the `backend` folder, install packages, and initialize the database:

```bash
cd backend
npm install

# Verify database connection to container
npm run db:check

# Apply Prisma migrations
npx prisma migrate deploy

# Populate initial Admin, Store Owner, demo users, stores, and ratings
npm run seed
```

Start the backend development server:

```bash
npm run dev
# Server listening on http://localhost:5000
```

---

### 5. Setup & Run Frontend

In a separate WSL terminal window:

```bash
cd frontend
npm install
npm run dev
# Vite dev server running on http://localhost:5173
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## Pre-Seeded Demo Accounts

The database seed script (`npm run seed`) provisions accounts for all 3 roles:

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **`ADMIN`** | `admin@shopscore.com` | `Admin@12345` | Platform statistics, user creation, store creation & assignment |
| **`STORE_OWNER`** | `owner@shopscore.com` | `Owner@12345` | Owned store metrics and customer rating inspection |
| **`USER`** | `alice.shopper@example.com` | `User@12345` | Store discovery and rating submission / editing |
| **`USER`** | `bob.reviewer@example.com` | `User@12345` | Store discovery and rating submission / editing |

*(Quick-fill demo buttons are also provided directly on the Login page for rapid evaluation.)*

---

## Validation Rules Reference

Validation is enforced on the frontend and authoritatively on the backend via Zod:

- **Name**: 20–60 characters inclusive.
- **Address**: Maximum 400 characters.
- **Password**: 8–16 characters, containing at least one uppercase letter and at least one special character (`!@#$%^&*...`).
- **Email**: Standard valid email format, unique across users.
- **Rating**: Integer from 1 to 5 inclusive. Composite unique constraint `(userId, storeId)` guarantees 1 rating per user per store (updates modify existing record).

---

## Docker Compose Management Cheat Sheet

Run from project root:

| Action | Command |
|---|---|
| Start PostgreSQL container | `docker compose up -d` |
| View container health | `docker compose ps` |
| View live PostgreSQL logs | `docker compose logs -f postgres` |
| Restart database | `docker compose restart postgres` |
| Stop database (persists volume) | `docker compose down` |
| Stop & wipe database volume (reset) | `docker compose down -v` |

---

## Running Automated Tests

Run backend integration and validation tests from `backend`:

```bash
cd backend
npm test
```

Run TypeScript compilation check:

```bash
npm run build
```

Run Frontend production build check:

```bash
cd frontend
npm run build
```

---

## API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Public registration (normal users only)
- `POST /api/auth/login` — Single login endpoint for all roles
- `GET /api/auth/me` — Authenticated user profile
- `POST /api/auth/change-password` — Change password for authenticated user
- `POST /api/auth/logout` — Clear auth cookie

### Stores & Ratings (`/api/stores`, `/api/ratings`)
- `GET /api/stores` — Browse stores with search (name/address), sort, overall rating, and user submitted rating
- `GET /api/stores/:id` — Single store details
- `POST /api/ratings` — Submit or update rating (1–5) for a store (normal users only)
- `GET /api/ratings/:storeId` — Get authenticated user's rating for a store

### Admin (`/api/admin`)
- `GET /api/admin/dashboard` — Platform counts: users, stores, ratings
- `GET /api/admin/users` — Search, filter by role, sort, and paginate users
- `POST /api/admin/users` — Create admin, store owner, or normal user
- `GET /api/admin/users/:id` — User details (includes store ratings for store owners)
- `GET /api/admin/stores` — List stores with overall rating and owner details
- `POST /api/admin/stores` — Create store and assign a store owner

### Store Owner (`/api/owner`)
- `GET /api/owner/stores` — View stores owned by authenticated owner
- `GET /api/owner/stores/:storeId/ratings` — View customer reviews with strict data isolation

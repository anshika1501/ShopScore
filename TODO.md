# ShopScore - Development Roadmap & Task Tracker

This file tracks the stage-by-stage implementation of the ShopScore store rating platform as specified in `AGENTS.md`.

---

## Stages Overview

- [x] **Stage 1: Infrastructure & Environment Setup**
  - [x] Create `.gitignore` to protect sensitive files and ignore build artifacts
  - [x] Configure root `docker-compose.yml` for PostgreSQL 16 with persistent named volume
  - [x] Define Docker Compose `.env.example` in project root
  - [x] Define backend environment template `backend/.env.example`
  - [x] Update `README.md` with complete WSL + Docker workflow and container commands
  - [x] Commit Stage 1 changes

- [x] **Stage 2: Database Schema & Entity Relationships**
  - [x] Initialize backend package structure and install Prisma & dependencies
  - [x] Finalize Prisma schema (`User`, `Store`, `Rating`, `Role` enum) respecting 1:N owner cardinality and composite unique `(userId, storeId)`
  - [x] Add automated DB connectivity check utility (`npm run db:check`)
  - [x] Generate Prisma client bindings and prepare initial migration SQL (`20261004000000_init`)
  - [x] Implement seed script (`backend/prisma/seed.ts`) with initial Admin and demo data
  - [x] Commit Stage 2 changes

- [x] **Stage 3: Backend Foundation & Authentication System**
  - [x] Configure Express server with security headers (Helmet), CORS, body parser with limits, and centralized error handling
  - [x] Implement Zod validation schemas for registration, login, and password changes
  - [x] Implement password hashing with bcrypt
  - [x] Implement JWT generation, cookie/bearer token handling, and auth middleware (`requireAuth`, `requireRole`)
  - [x] Implement Auth routes: `/api/auth/register` (strictly normal users only), `/api/auth/login`, `/api/auth/me`, `/api/auth/change-password`, `/api/auth/logout`
  - [x] Add automated unit and integration tests (17 tests passing across validation, JWT, and API boundaries)
  - [x] Commit Stage 3 changes

- [x] **Stage 4: Admin Management APIs**
  - [x] Implement Admin Dashboard statistics endpoint (`/api/admin/dashboard`)
  - [x] Implement Admin User Management: list users with search (name, email, address), role filter, whitelisted sorting, and pagination
  - [x] Implement Admin User Creation: create `ADMIN`, `STORE_OWNER`, and `USER` accounts with validation
  - [x] Implement Admin Store Management: create store and associate with a verified `STORE_OWNER`
  - [x] Implement Admin User Details endpoint (`/api/admin/users/:id`), including store rating summaries for store owners
  - [x] Add automated tests for Admin authorization guards, schemas, and query filters (27 total tests passing)
  - [x] Commit Stage 4 changes

- [x] **Stage 5: Store Browsing, Rating & Store Owner APIs**
  - [x] Implement Public/User Store Listing (`/api/stores`) with name/address search, sorting, and rating aggregates
  - [x] Implement User Rating endpoints (`/api/ratings`): create or update (upsert) 1-5 rating per user-store
  - [x] Implement Store Owner APIs (`/api/owner/stores`, `/api/owner/stores/:storeId/ratings`) with strict store data isolation
  - [x] Add automated tests for rating boundaries (1-5), duplicate rating updates, and store-owner isolation (41 total tests passing)
  - [x] Commit Stage 5 changes

- [x] **Stage 6: Frontend Foundation & Shared Authentication UI**
  - [x] Initialize React + Vite frontend with Tailwind CSS and React Router
  - [x] Configure Axios API client with centralized error and auth handling (`frontend/src/services/api.ts`)
  - [x] Build shared Auth Context, route guards (`ProtectedRoute` with role redirection)
  - [x] Build shared navigation and responsive layout with role badges and mobile support
  - [x] Build Login, Public Registration (with real-time criteria validation), and Change Password pages
  - [x] Commit Stage 6 changes

- [ ] **Stage 7: Normal User Experience**
  - [ ] Build Store Discovery page with live search (name/address) and sorting
  - [ ] Build interactive 1-5 star Rating submission and modification modal/component
  - [ ] Display overall store rating and user's submitted rating ("Not rated" fallback)
  - [ ] Commit Stage 7 changes

- [ ] **Stage 8: Administrator & Store Owner Portals**
  - [ ] Build Admin Dashboard with platform stat counters
  - [ ] Build Admin User Management view with search, filter by role, column sort, pagination, and user creation form
  - [ ] Build Admin Store Management view with store creation and store owner assignment
  - [ ] Build Store Owner Dashboard showing owned store(s) average ratings and customer rating details
  - [ ] Commit Stage 8 changes

- [ ] **Stage 9: End-to-End Verification & Final Polish**
  - [ ] Run full test suite across auth, roles, ratings, and store owner data isolation
  - [ ] Verify production build for backend and frontend
  - [ ] Finalize documentation and verify setup steps from scratch
  - [ ] Commit Stage 9 changes

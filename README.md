# ShopScore — Store Rating Platform

ShopScore is a full-stack web application where users can discover registered stores and submit 1–5 star ratings. The platform provides a single unified login system serving three roles:

- **ADMIN**: Manages platform statistics, stores, users, and store owner assignments.
- **USER**: Signs up publicly, browses stores, searches by name/address, and submits or modifies ratings.
- **STORE_OWNER**: Accesses store performance metrics, average ratings, and reviews submitted for their assigned store(s).

---

## Architecture & Technology Stack

- **Frontend**: React (Vite), React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL 16 (running via Docker Compose)
- **ORM & Migrations**: Prisma
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod (strict client and authoritative server validation)
- **Containerization**: Docker Compose with named persistent volumes

---

## Development Environment (WSL + Docker)

This project is designed for development inside **VS Code using WSL (Ubuntu)** with **PostgreSQL managed via Docker Compose**. The backend and frontend run directly in the WSL environment and communicate with the containerized PostgreSQL exposed on `localhost:5432`.

### Prerequisites

- Windows with **WSL 2** (Ubuntu recommended)
- **Docker Desktop** with WSL 2 integration enabled
- **Node.js** (v20+ or v22+) & **npm** installed in WSL
- **Git**

---

## Getting Started

### 1. Clone & Setup Workspace

Open your WSL terminal and clone the repository:

```bash
git clone <repo-url> ShopScore
cd ShopScore
```

### 2. Configure Environment Variables

1. **Root (Docker Compose Environment)**:
   ```bash
   cp .env.example .env
   ```

2. **Backend (Application & Prisma Environment)**:
   ```bash
   cp backend/.env.example backend/.env
   ```

> **Note**: Never commit `.env` files containing actual passwords or secret keys. `.env.example` templates are provided with safe placeholders.

---

## Managing PostgreSQL with Docker Compose

Run all Docker commands from the project root inside your WSL terminal:

| Operation | Command |
|---|---|
| **Start Database** | `docker compose up -d` |
| **Check Container Health** | `docker compose ps` |
| **View Database Logs** | `docker compose logs -f postgres` |
| **Inspect Container Details** | `docker inspect shopscore_postgres` |
| **Restart Database** | `docker compose restart postgres` |
| **Stop Database (Persists Data)** | `docker compose down` |
| **Reset Database (Clears Volume)** | `docker compose down -v` |

---

## Verifying the Database Connection

Before running database migrations or starting the backend, verify that PostgreSQL is running and healthy:

1. **Verify container health status**:
   ```bash
   docker compose ps
   ```
   *Expected output*: `shopscore_postgres` status should indicate `Up (healthy)`.

2. **Test direct database readiness via Docker**:
   ```bash
   docker compose exec postgres pg_isready -U shopscore -d shopscore_dev
   ```
   *Expected output*: `shopscore_dev:5432 - accepting connections`

3. **Verify port exposure on localhost from WSL**:
   ```bash
   nc -zv localhost 5432
   # or
   curl -v telnet://localhost:5432
   ```

---

## Project Structure

```text
ShopScore/
├── backend/                  # Express API, Prisma schema, services, routes
│   ├── prisma/               # Schema and migrations
│   ├── src/                  # Application source code
│   └── .env.example          # Backend environment template
├── frontend/                 # React + Vite application (Stage 6+)
├── docker-compose.yml        # PostgreSQL container with persistent volume
├── .env.example              # Docker Compose environment template
├── .gitignore                # Git ignore rules for secrets and build artifacts
├── AGENTS.md                 # Product specifications and core rules
├── TODO.md                   # Stage-by-stage implementation tracker
└── README.md                 # Setup and run instructions
```

---

## Development Roadmap & Next Steps

See [TODO.md](TODO.md) for the live implementation tracker across all 9 stages.

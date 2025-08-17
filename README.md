# Shri Mandarathi — Monorepo

Full-stack e-commerce application (Next.js frontend + Node/Express TypeScript backend with Prisma + PostgreSQL). This README explains the project, tech stack, repository structure, environment variables, and detailed steps to run, build, and deploy the project.

---

## Project overview

- Frontend: Next.js app (React 19, TypeScript) used for the storefront and account flow.
- Backend: Node.js + Express written in TypeScript, uses Prisma as ORM with PostgreSQL database.
- Features: Product catalog with variants, user authentication (JWT), cart, orders, addresses, image uploads (Cloudinary or local `uploads/` fallback), role-based access (ADMIN/CUSTOMER).

---

## Tech stack

- Frontend
  - Next.js (app directory)
  - React 19 + TypeScript
  - Tailwind CSS
  - Radix UI and various UI utilities (lucide/react icons, sonner, zustand, zod, react-hook-form)
- Backend
  - Node.js + Express 5
  - TypeScript
  - Prisma ORM (schema in `backend/prisma/schema.prisma`)
  - PostgreSQL
  - Authentication: JWT
  - Password hashing: bcrypt
  - File uploads: multer + Cloudinary (optional)
- Tooling
  - pnpm (repo contains pnpm-lock.yaml), Node >= 18 recommended
  - Prisma CLI
  - TypeScript compiler

---

## Repo structure (high level)

- `frontend/` — Next.js frontend
  - `app/` — Next.js app pages and layout
  - `components/` — UI components
  - `public/` — static assets
  - `package.json`, `pnpm-lock.yaml`
- `backend/` — Express API
  - `src/` — TypeScript source
  - `prisma/schema.prisma` — database schema and models
  - `uploads/` — local uploads fallback
  - `package.json`, `pnpm-lock.yaml`
- root `README.md` (this file)

---

## Prerequisites

- Node.js (recommended >= 18.x)
- pnpm (recommended) or npm/yarn
- PostgreSQL database (local or hosted)
- (Optional) Cloudinary account for image hosting
- (Optional) Docker if you prefer containerized Postgres

Install pnpm globally (if not installed):

PowerShell:

```powershell
npm i -g pnpm
```

---

## Environment variables

Create `.env` files for backend and frontend as needed. Example variables below.

Backend: `backend/.env` (required)

```env
# Postgres connection
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# JWT
JWT_SECRET=your_jwt_secret_here

# Backend port (optional)
PORT=5000

# Frontend origin used for CORS (optional)
FRONTEND_ORIGIN=http://localhost:3000

# Cloudinary (optional - enable cloud uploads if set)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Frontend: `frontend/.env.local` (if you need to override origin or API URL)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Notes:
- Keep `.env` files out of version control.
- `DATABASE_URL` must point to a working Postgres instance.

---

## Backend — Detailed setup

1. Open a terminal and go to the backend folder:

```powershell
cd backend
```

2. Install dependencies (pnpm shown; use `npm install` or `yarn` if you prefer):

```powershell
pnpm install
```

3. Ensure `backend/.env` is created and `DATABASE_URL` + `JWT_SECRET` are set.

4. Generate Prisma client:

```powershell
pnpm prisma generate
```

5. Run migrations / apply existing migrations

- If you are developing locally and want to run migrations and create a new migration from schema changes:

```powershell
pnpm prisma migrate dev --name init
```

- If you are deploying to a remote DB and want to apply existing migrations without creating new ones:

```powershell
pnpm prisma migrate deploy
```

6. Optional: inspect the database with Prisma Studio

```powershell
pnpm prisma studio
```

7. Build & run the backend

- Build (transpile TypeScript to `dist/`):

```powershell
pnpm run build
```

- Start (uses `dist/index.js`):

```powershell
pnpm start
```

8. Development run

The repo's `dev` script compiles TypeScript then runs `node dist/index.js`. For iterative development you may prefer `ts-node-dev` or `nodemon` + `tsc --watch`. Example with `pnpm` (install a dev runner if you want):

```powershell
# install if you want faster dev iteration
pnpm add -D ts-node-dev
# run (example)
pnpx ts-node-dev --respawn --transpile-only src/index.ts
```

Default backend port: 5000 (configurable via `PORT` env var). API root: `http://localhost:5000/api`.

Important API routes (mounted in `src/index.ts`):
- `POST /api/auth` — authentication routes (login/register)
- `GET/POST /api/categories` — category endpoints
- `GET/POST /api/products` — product endpoints
- `GET/POST /api/orders` — order endpoints
- `GET/POST /api/cart` — cart endpoints
- `GET/POST /api/addresses` — address management
- `GET/POST /api/users` — user management

Uploads fallback: static files served from `/uploads` when Cloudinary is not configured.

---

## Frontend — Detailed setup

1. Change into frontend directory:

```powershell
cd frontend
```

2. Install dependencies:

```powershell
pnpm install
```

3. Local development:

```powershell
pnpm dev
```

This starts Next.js on `http://localhost:3000` by default.

4. Build and production preview:

```powershell
pnpm build
pnpm start
```

If the frontend expects an API URL, set `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

---

## Running the full stack locally

Open two terminals (PowerShell):

Terminal 1 — backend:

```powershell
cd backend; pnpm install; pnpm prisma generate; pnpm run build; pnpm start
```

Terminal 2 — frontend:

```powershell
cd frontend; pnpm install; pnpm dev
```

Browse: https://localhost:3000 (or http://localhost:3000) and backend at http://localhost:5000

---

## Database schema (summary)

The main models are defined in `backend/prisma/schema.prisma`:
- User (id, name, email, password, role, addresses, orders, cart)
- Product (with Category relation and ProductVariant relations)
- ProductVariant (size, price, stock, sku)
- Category
- Order and OrderItem (order snapshot, shipping/billing info)
- Cart and CartItem
- Address
- Enums: Role (ADMIN/CUSTOMER), OrderStatus

For any schema change:
1. Update `schema.prisma`.
2. Run `pnpm prisma migrate dev --name your_change` (local dev) or create/commit SQL migration.
3. Run `pnpm prisma generate` to refresh the client.

---

## Cloudinary / uploads

- The backend supports Cloudinary when the following vars are set in `backend/.env`:
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET

If Cloudinary is not configured, the API serves images from the `backend/uploads/` directory via `/uploads` static route.

---

## Deployment notes

- Frontend: deploy to Vercel (Next.js) or any static host that supports Node when using server features. Set `NEXT_PUBLIC_API_URL` to the deployed backend API.
- Backend: deploy to any Node-hosting provider (Render, Fly.io, Heroku, Azure, AWS). Ensure `DATABASE_URL` and `JWT_SECRET` (and Cloudinary keys if used) are set as environment variables in the host.
- Run database migrations during deploy (e.g., CI step: `pnpm prisma migrate deploy`).
- For production, use `pnpm build` on backend then run `pnpm start` (or a process manager like PM2).

Docker: you can run Postgres in Docker and set `DATABASE_URL` to the container IP or service name in a `docker-compose` file.

---

## Troubleshooting & tips

- If TypeScript build fails, ensure `@types/node` is installed and `tsconfig.json` options match your Node version.
- If Prisma client errors after schema change, run `pnpm prisma generate`.
- If images are 404, check Cloudinary env vars or that `backend/uploads/` contains the files and backend static route is reachable.
- Ports: frontend 3000, backend 5000 by default. Update `.env` to change.

---

## Contributing

- Open an issue describing the change or bug.
- Make changes on a feature branch and open a pull request to `main`.
- Ensure DB migrations are created for schema changes.

---

## License

This repository does not include a license file. Add a LICENSE if you plan to open-source the code.

---

If you want, I can also:
- add `.env.example` files under `backend/` and `frontend/`
- add a `docker-compose.yml` for local Postgres and running the stack in containers
- add a small DEV script using `ts-node-dev` for faster backend development

Tell me which of the above you'd like me to add or if you want the README edited for tone or length.

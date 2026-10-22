# NanoTech Solution - Enterprise Monorepo

Welcome to **NanoTech Solution**, official hardware & e-commerce platform for Itahari-6, Sunsari, Nepal.

This repository is organized as a **clean, decoupled monorepo** with npm workspaces separating the **Frontend** and **Backend** into industry-standard modular packages.

---

## 📁 Project Architecture

```
nanotech/
├── package.json                 # Monorepo root workspace orchestrator
├── package-lock.json
├── .gitignore                   # Unified ignore rules
├── .env.example                 # Root environment variables guide
├── README.md                    # Project documentation
│
├── frontend/                    # 🌐 Client-Side React SPA (Vite + TailwindCSS)
│   ├── index.html               # Main HTML entry point
│   ├── vite.config.ts           # Vite build config with reverse proxy to backend
│   ├── tsconfig.json            # Frontend TypeScript configuration
│   ├── package.json             # Frontend dependencies & scripts
│   ├── .env.example             # Frontend environment variables
│   ├── public/                  # Static assets & icons
│   └── src/                     # React application source
│       ├── App.tsx              # Root application router & view switcher
│       ├── main.tsx             # React DOM mounting entry
│       ├── index.css            # Global Tailwind & design system styles
│       ├── components/          # Modular UI components
│       │   ├── admin/           # Admin dashboard, inventory, sidebar & account
│       │   ├── auth/            # Authentication modals & forms
│       │   ├── cart/            # Shopping cart drawer & actions
│       │   ├── checkout/        # Checkout & order placement
│       │   ├── rbac/            # Role-Based Access Control views
│       │   ├── products/        # Product cards, grids, filters
│       │   └── common/          # Modals, toasts, alerts, headers
│       ├── pages/               # Page views & standalone sections
│       ├── context/             # React context state (Auth, Cart, RBAC, Admin)
│       ├── lib/                 # Client utilities, Supabase & API clients
│       ├── data/                # Static catalogs & taxonomy
│       └── types/               # Frontend TypeScript interfaces
│
├── backend/                     # ⚙️ Server-Side API (Express + TypeScript)
│   ├── package.json             # Backend dependencies & scripts
│   ├── tsconfig.json            # Backend Node.js TypeScript configuration
│   ├── .env.example             # Backend environment variables
│   ├── database/                # Database schemas & SQL definitions
│   │   └── supabase_schema.sql  # Supabase schema definitions
│   └── src/
│       ├── server.ts            # HTTP server entry point & static SPA hosting
│       ├── app.ts               # Express application setup & CORS configuration
│       ├── config.ts            # Environment variables & Supabase/Gemini config
│       ├── store.ts             # In-memory store, sessions, and audit logging
│       ├── types.ts             # Backend TypeScript interfaces & types
│       ├── middleware/          # Express middleware (authentication, RBAC)
│       │   └── auth.ts
│       └── routes/              # Modular Express API routers
│           ├── auth.routes.ts   # Authentication & session endpoints
│           ├── admin.routes.ts  # Admin management & operations
│           ├── products.routes.ts # Product & category APIs
│           ├── orders.routes.ts # Order creation, status & sync
│           ├── ai.routes.ts     # Gemini AI advisor & description generator
│           └── diagnostics.routes.ts # System health & diagnostics
│
└── api/                         # 🚀 Serverless deployment entry (Vercel)
    └── index.ts                 # Vercel serverless function router
```

---

## 🚀 Quick Start

### 1. Install Dependencies
Run from the root directory to install all packages for both Frontend and Backend:

```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the `backend/` and `frontend/` folders:

```bash
# In backend:
cp backend/.env.example backend/.env

# In frontend:
cp frontend/.env.example frontend/.env
```

### 3. Run Development Servers
Start both Frontend and Backend concurrently with a single command:

```bash
npm run dev
```

- **Frontend**: Accessible at `http://localhost:3000`
- **Backend API**: Accessible at `http://localhost:5000/api`
- Vite automatically proxies `/api/*` requests to the Backend server during development.

---

## 🛠️ Monorepo Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Run both Frontend & Backend concurrently |
| `npm run dev:frontend` | Start Vite frontend dev server only (`port 3000`) |
| `npm run dev:backend` | Start Express backend API server with hot-reload (`port 5000`) |
| `npm run build` | Build both Frontend and Backend packages |
| `npm run build:frontend` | Compile frontend production bundle to `frontend/dist` |
| `npm run build:backend` | Compile backend TypeScript to `backend/dist` |
| `npm run start` | Start the production backend server |
| `npm run lint` | Run TypeScript type checks across all workspaces |

---

## 📦 Production Deployment

### Option A: Vercel
The repository includes a ready-to-deploy `vercel.json` pointing to `frontend/dist` with serverless routing to `api/index.ts`.

### Option B: Unified Node.js Server
When deployed as a single Node.js service (e.g. Render, Railway, Docker):
1. Run `npm run build`
2. Start with `npm run start`
The Express server will automatically serve both the `/api/*` endpoints and the compiled React SPA static files from `frontend/dist`.

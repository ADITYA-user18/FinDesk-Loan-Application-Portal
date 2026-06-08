# FinDesk — Loan Application Portal

> A high-performance, responsive, and secure Loan Application Portal designed for inclusive FinTech operations. Built using the **PERN stack (PostgreSQL, Express, React, Node)** with a stunning Black & Gold theme, role-based JWT authentication, and native-grade custom components.

**Live Demo:**  https://fin-desk-loan-application-portal.vercel.app/

**GitHub Repository:**  https://github.com/ADITYA-user18/FinDesk-Loan-Application-Portal

---

## 📸 Screenshots


<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/7047d5b5-349b-4ab2-a46f-41609d0d35f5" />


---

## 🛠 Tech Stack

| Layer | Technology | Key Function / Role |
|---|---|---|
| **Frontend** | React 18, React Router v6, Axios, Lucide Icons | Component-driven UI, lazy-loaded routes, dynamic styling |
| **Backend** | Node.js + Express, Morgan, Helmet, CORS | REST API, rate-limiting, secure headers, API request logging |
| **Database** | PostgreSQL (Neon) | Relational storage, schema constraints, custom indices |
| **Auth** | JSON Web Token (JWT) | Secure session management stored in `httpOnly` cookies |
| **Styling** | Vanilla CSS Grid & Flexbox | Customized design system, Dark/Light theme toggle persistence |

---

## ✅ Assessment Requirements Met

### 1. Backend REST API
- `POST /api/applications` — Submit a new loan application. Enforces name, mobile, minimum amount (₹1,000), purpose, and language.
- `GET /api/applications` — Returns all applications sorted by latest first. Supports `?status=` status filter and `?search=` search string.
- `PATCH /api/applications/:id/status` — Updates status to `approved` or `rejected` (Agent role only).
- `GET /api/summary` — Returns total applications count, total loan amount requested, average amount, and status counts.
- **Strict Validation:** Returns `400 Bad Request` with structured JSON errors if parameters are invalid.
- **Security:** Relies on parameterised queries (SQL injection protection) and environment variables for sensitive DB strings.

### 2. Frontend React Client
- **Apply Page:** Intuitive form with client-side validation. Pre-fills applicant name/mobile for logged-in borrowers. Displays reference UUID with a copy button on success.
- **Dashboard Page:** Interactive table showing applications, search filter input, status tabs, and a visual Stats Bar.
- **Status Change:** Agents can click on any row to open the status modal, approving or rejecting the application. State updates instantly in-place without page reload.

### 3. Database Schema & Migrations
- Standard SQL schema featuring a pgcrypto UUID primary key, amount decimal type, and check constraints.
- Fully idempotent migration scripts:
  - `backend/migrations/001_init.sql` (Initial applications table and indices)
  - `backend/migrations/002_users.sql` (Authentication tables and relations)

---

## ⭐ Advanced Production-Ready Features (Added Extras)

To go beyond the minimum requirements, the following features have been added:

1. **Role-Based Authentication (JWT + httpOnly Cookies):**
   - Implemented JWT session tokens stored in secure, `httpOnly` cookies. This is protected against XSS attacks since client-side JavaScript cannot read the token.
   - Distinct roles: **Borrower** (can only apply and see their own applications) and **Agent** (can view all applications, search, filter, and approve/reject).

2. **Persistent Theme Engine:**
   - Swappable Dark (default pure `#080808` black with golden highlights) and Light themes.
   - Setting persists across sessions using `localStorage` and a top-level HTML attribute hook.

3. **Optimized Custom Form Elements:**
   - Replaced default, browser-native `<select>` dropdowns with a custom-built, fully styled `CustomSelect` component that supports responsive heights, active icons, outside click dismiss, and key listener support.

4. **Performance Optimizations:**
   - **Code Splitting:** Lazy-loaded React pages (`React.lazy` + `Suspense`) divide the main bundle into 10 separate modules, boosting initial load speed.
   - **Memoization:** Optimized renders using `useMemo`, `useCallback`, and `React.memo` to limit child tree updates.
   - **Single-Query Stats:** The summary endpoint aggregates all statistics using a single database query with SQL filters rather than running multiple sequential counts.
   - **Database Indexing:** Created B-Tree indexes on `status`, `created_at DESC`, `name`, `mobile`, and `user_id` to ensure optimal performance as table size scales.

5. **Security Hardening:**
   - **Helmet:** Adds secure headers preventing clickjacking and scripting threats.
   - **CORS Allowlist:** Only allows incoming requests from the production React host.
   - **Rate Limiting:** Prevents brute force and denial of service attacks by limiting clients to 200 API calls per 15 minutes.
   - **Body Size Caps:** Cap JSON request payloads to 10KB to prevent memory exhaustion attacks.

---

## 🚀 Step-by-Step Deployment Guide

### Phase 1: Database Setup (Neon)
1. Register for a free account at [Neon](https://neon.tech).
2. Create a project named `FinDesk`.
3. Open the **SQL Editor** in the Neon console.
4. Copy and execute `backend/migrations/001_init.sql` to initialize the database schema and indexes.
5. Copy and execute `backend/migrations/002_users.sql` to enable authentication tables and foreign key relations.
6. Copy your database connection string from the dashboard (looks like: `postgresql://neondb_owner:npg_...aws.neon.tech/neondb?sslmode=require`).

### Phase 2: API Backend Deployment (Render)
1. Sign up on [Render](https://render.com) and link your GitHub profile.
2. Click **New** -> **Web Service** and choose your repository.
3. Use the following configuration:
   - **Name:** `findesk-api`
   - **Runtime:** `Node`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
4. Under **Environment Variables**, add:
   - `DATABASE_URL` = (Your Neon connection string)
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (A long, random secret phrase, e.g. `48db078693c13de5f32a76efc25e83a4`)
   - `FRONTEND_URL` = (Your Vercel URL, e.g., `https://findesk-portal.vercel.app`)
5. Click **Deploy**. Note the live URL provided by Render (e.g. `https://findesk-api.onrender.com`).

### Phase 3: Frontend Deployment (Vercel)
1. Sign up on [Vercel](https://vercel.com) and link your GitHub profile.
2. Click **Add New** -> **Project** and select your repository.
3. Use the following configuration:
   - **Framework Preset:** `Vite` (auto-detected)
   - **Root Directory:** `frontend`
   - **Build & Development Settings:** Leave defaults
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = (Your Render backend URL, e.g., `https://findesk-api.onrender.com`)
5. Click **Deploy**. Note the URL (e.g., `https://findesk-portal.vercel.app`).
6. **Handshake completion:** Go back to Render's Env settings for your Web Service and ensure `FRONTEND_URL` exactly matches this Vercel URL (without a trailing slash). Save to trigger a quick redeploy.

---

## 💻 Local Setup (in 5 Minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL database instance

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd vitto-loan-portal
```

### 2. Configure Backend
1. Execute the migration scripts `backend/migrations/001_init.sql` and `backend/migrations/002_users.sql` on your local database.
2. Navigate to `/backend` and copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. Set `DATABASE_URL` and `JWT_SECRET` inside `.env`.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
   *API will start on `http://localhost:5000`*

### 3. Configure Frontend
1. Navigate to `/frontend`:
   ```bash
   cd ../frontend
   npm install
   ```
2. The environment variables are preconfigured in `.env.local` pointing to `http://localhost:5000`.
3. Run:
   ```bash
   npm run dev
   ```
   *Frontend will start on `http://localhost:5173`*

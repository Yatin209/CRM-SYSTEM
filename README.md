# NexaCRM

NexaCRM is a MERN-style enterprise CRM built around Zoho CRM-inspired workflows: leads, accounts, customers, pipeline stages, follow-ups, tasks, communications, analytics, role-aware dashboards, and reports.

## Stack

- Frontend: React, Vite, Tailwind CSS, Bootstrap, React Router, Recharts, React Hook Form, Zod, Framer Motion, Lucide React
- Backend: Node.js, Express, MVC/service structure, JWT auth, HttpOnly refresh cookies, Mongoose models, validation, Helmet, rate limiting, Winston logging
- Database: MongoDB Atlas-ready, with a local in-memory fallback for demo runs

## Run Locally

```bash
npm run install:all
npm run dev
```

Frontend: `http://localhost:5174`

Backend: `http://localhost:5000/api/health`

Demo users all use password `Nexa@123`.

- `admin@nexacrm.com` Administrator
- `manager@nexacrm.com` Manager
- `sales@nexacrm.com` Sales Executive
- `support@nexacrm.com` Customer Support Executive

## MongoDB Atlas

Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`. Without this value, the API starts in demo memory mode so the project remains runnable.
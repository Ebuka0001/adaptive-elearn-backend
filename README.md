# Adaptive E-Learn — Backend

**Project:** Adaptive E-Learn — a gamified adaptive e‑learning platform  
**Repo:** `adaptive-elearn-backend`  
**Owner:** Ebuka (GitHub: `Ebuka0001`)

---

## 🚀 What this backend does

- **Authentication** – register/login for `student`, `lecturer`, and `admin`.
- **Role‑based access** – protected routes for each role.
- **Course & Lesson management** – lecturers can create courses, lessons, and upload PDF files.
- **Adaptive quizzing** – students fetch questions adapted to their mastery level; submissions update points, level, and mastery.
- **Gamification** – points, levels, badges, leaderboard.
- **Enrollment** – students can enroll in courses; track progress.
- **Lecturer dashboard** – stats and courses with enrollment counts.
- **Admin panel** – manage users, view system statistics.
- **Password reset** – token‑based (mock email for demo).
- **Email verification** – optional mock flow.

---

## 🛠 Tech stack

- **Node.js** (v16+)
- **Express** – web framework
- **MongoDB Atlas** + **Mongoose** – database
- **JWT** – authentication
- **bcryptjs** – password hashing
- **multer** – file uploads (PDF only)
- **helmet** – security headers
- **express-rate-limit** – basic rate limiting
- **nodemon** – development
- **Redis** – optional for idempotency (falls back gracefully)

---

## Quick start — run locally (copy / paste)

> Make sure you are in the project root: `C:\Users\user\Desktop\Adaptive-elearn\adaptive-elearn-backend`

1. Install dependencies (only once)
```powershell
npm install
```

2. Create a local `.env` from the example (Windows PowerShell):
```powershell
copy .env.example .env
```
3. Edit `.env` in VSCode and fill **only local values** (do NOT commit `.env`):
- `MONGO_URI` → put your Atlas connection string (replace `REPLACE_WITH_PASSWORD` with the real DB password).
- `JWT_SECRET` → a long secret string (e.g. `my_super_secret_for_dev_12345`).

4. (Optional) Seed database with sample data:
```powershell
node seed.js
```

5. Start dev server:
```powershell
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB connected
```

---

## Pre-seeded dev credentials (from seed.js)
- **student**: `student1@example.com` / `P@ssword123`  
- **lecturer**: `lecturer@example.com` / `LectPass123`

Use these to test endpoints immediately.

---

## Important files & folders
```
server.js                 # app entry
config/db.js              # mongoose connection
routes/                   # api routes (auth, questions, attempts, gamification, etc.)
controllers/              # route handlers
services/                 # adaptive logic, badge logic
models/                   # Mongoose models: User, Question, Course, Lesson, Badge, Attempt
middleware/               # authMiddleware, roleMiddleware
seed.js                   # seed script (creates sample data)
.env.example              # example env (safe to commit)
api-spec.yaml             # minimal OpenAPI contract (import to Postman/Thunder Client)
README.md                 # this file
```

---

## API (high-level) — import `api-spec.yaml` for exact shapes
Samples (use Thunder Client / Postman or curl / PowerShell):

**Login**
```
POST /api/auth/login
Body JSON:
{ "email": "student1@example.com", "password": "P@ssword123" }
Response JSON:
{ "token": "<JWT>", "user": { name, email, role, points, level, mastery } }
```

**Get next adaptive question**
```
GET /api/questions/next
Headers: Authorization: Bearer <token>
Response: question object (text, type, choices, difficulty, points, lessonId)
```

**Submit attempt**
```
POST /api/attempts
Headers: Authorization: Bearer <token>
Body JSON:
{ "questionId": "<id>", "givenAnswer":"..." }
Response: { attempt: {...}, user: { points, level, mastery, unlockedBadges } }
```

**Leaderboard**
```
GET /api/gamification/leaderboard
Headers: Authorization: Bearer <token>
Response: array of users ordered by points
```

---

## How frontend developers should use this repo
1. Clone the repo and run locally.
2. Import `api-spec.yaml` into Postman / Thunder Client — it contains example requests/responses.
3. Use seeded accounts or run `node seed.js`.
4. Frontend should call `GET /api/questions/next` then `POST /api/attempts` and react to `unlockedBadges` in responses.

---

## Security & secrets
- **Never** commit `.env`. `.env.example` is safe and should remain committed.
- If `.env` was accidentally pushed to GitHub with real credentials: rotate database credentials immediately (change Atlas DB user password) and regenerate JWT secret if needed.

---

## Deploy notes (short)
Recommended: Render for backend + Vercel/Netlify for frontend.

Render basic steps:
1. Create Render account and connect GitHub.
2. Create a Web Service and point to this repo.
3. Set Build Command: `npm install`
4. Start Command: `npm start` (ensure `"start": "node server.js"` in package.json)
5. Add environment variables (MONGO_URI, JWT_SECRET) in Render dashboard.
6. Deploy and copy public URL into frontend env.

---

## Troubleshooting common issues
- `MongoDB connected` not printed → check `MONGO_URI` and Atlas IP whitelist.
- `401 Unauthorized` → missing/invalid `Authorization: Bearer <token>` header.
- `Email already registered` → use seeded user or delete duplicate in Atlas Data Explorer.
- CORS errors → make sure frontend `VITE_API_BASE_URL` matches backend URL and backend CORS allows that origin.

---

## Contact & collaboration
- Repo: `https://github.com/Ebuka0001/adaptive-elearn-backend`
- If you are the frontend dev, import `api-spec.yaml` and message me (Ebuka) to coordinate changes to the contract.

---

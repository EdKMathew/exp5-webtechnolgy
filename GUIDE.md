# Experiment 5 – Security, Version Control, CI/CD and Cloud Deployment
TechFest 2026 Portal – step-by-step guide mapped to your lab manual (steps 1–18)

## What changed from your original zip
Your zip was a frontend only. The manual needs a login, a feedback box, cookies and a database, so I added:

| Folder | What it is |
|---|---|
| `frontend/` | Your React app + `Login`, `Feedback` pages, `api.js` (axios), Registration now saves to Atlas, lazy-loaded routes, `public/_redirects` + `_headers` |
| `backend/` | Express + MongoDB API: auth (bcrypt + JWT cookie), feedback, registrations, Helmet, mongo-sanitize, express-validator, rate-limit, 6 Jest/Supertest tests |
| `.github/workflows/ci.yml` | CI: installs, runs backend tests, builds frontend on every push |

Run locally (two terminals):
```bash
cd backend  && cp .env.example .env   # fill MONGO_URI + JWT_SECRET
npm install && npm run dev
cd frontend && cp .env.example .env
npm install && npm run dev            # http://localhost:5173
```

---
## Steps 1–2: Accounts and test copy
Create GitHub, MongoDB Atlas, Render, Netlify (or Vercel) accounts. Check `git --version`.
```bash
cp -r techfest2026 techfest2026-demo     # throw-away copy for attacks
```
In the **demo copy only**: set `INSECURE_DEMO=true` in `backend/.env` and `VITE_UNSAFE_DEMO=true` in `frontend/.env`. This switches the protections off so you can show the "before". Never deploy these settings.

## Step 3: NoSQL injection (before → after)
Register a normal user in the demo copy, then attack:
```bash
curl -i -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":{"$ne":null},"password":{"$ne":null}}'
```
- **Before** (`INSECURE_DEMO=true`): `200 Logged in` without knowing any password. Screenshot it.
- **After** (`INSECURE_DEMO=false`, restart): `400`. Screenshot it.
- Fix = `app.use(helmet())`, `app.use(mongoSanitize())` (`backend/app.js`) + `express-validator` rules and a safe query using `String(email)` + bcrypt (`routes/auth.js`).

## Step 4: XSS (before → after)
Go to `/feedback`. **Use this payload, not `<script>`:**
```
<img src=x onerror=alert('hi')>
```
Browsers do not run `<script>` inserted through `innerHTML`, so the manual's literal example will not pop up even in the vulnerable version. `onerror` is the standard working equivalent. Mention this in your record.
- **Before** (`VITE_UNSAFE_DEMO=true`): alert pops up (`dangerouslySetInnerHTML` in `Feedback.jsx`).
- **After** (`false`): the text shows literally as plain text. React escapes `{f.message}`.
- Extra layer: `frontend/public/_headers` sets a CSP (`script-src 'self'`) that also blocks inline handlers once deployed.

## Step 5: Safe cookies + CSRF
`routes/auth.js` sets the token as `httpOnly`, `secure` (production), `sameSite`.
- Before: in demo mode open DevTools console, log in, run `document.cookie` and the token is visible.
- After: `document.cookie` does not show it; DevTools → Application → Cookies shows HttpOnly ✓ Secure ✓ SameSite.
- CSRF note for the record: an evil site can make your logged-in browser send a request to the API. `SameSite` stops the browser attaching the cookie on cross-site requests. In production Netlify and Render are different sites, so `sameSite` must be `none` (with `secure`). That is why `app.js` also rejects state-changing requests whose `Origin` is not your frontend URL.

## Steps 6–10: Git
```bash
git init -b main
git add . && git commit -m "first version: TechFest portal with API"

# branching (step 8)
git checkout -b feature-page
# edit something small, e.g. add a line to Contact.jsx
git commit -am "add contact hours" && git checkout main
git merge feature-page

# merge conflict on purpose (step 9): change the SAME line on both branches
git checkout -b branch-a  # change the Phone line in frontend/src/pages/Contact.jsx
git commit -am "phone A"
git checkout main && git checkout -b branch-b   # change the same Phone line differently
git commit -am "phone B"
git checkout main && git merge branch-a && git merge branch-b   # CONFLICT
# open Contact.jsx, keep the right line, delete <<<<<<< ======= >>>>>>> markers
git add . && git commit -m "resolve merge conflict in Contact"

git log --oneline --graph --all     # screenshot this for the record
```
Step 10: create an empty repo on github.com, then:
```bash
git remote add origin https://github.com/<you>/techfest2026.git
git push -u origin main
```
Check `git status` first: `.env` and `node_modules` must not appear.

## Step 11: CI
`.github/workflows/ci.yml` is already written. After you push, open the repo's **Actions** tab.
1. Break a test (e.g. change `expect(res.status).toBe(200)` to `500` in `backend/tests/api.test.js`), push, screenshot the red run.
2. Fix it, push, screenshot the green run.

## Step 12: MongoDB Atlas
Create a free cluster, then a database user, then Network Access. Use `0.0.0.0/0` because Render's free tier has no fixed IP. Copy the connection string and put it in `backend/.env` as `MONGO_URI` (add `/techfest2026` before the `?`).

## Step 13: Backend on Render
New → Web Service → connect GitHub repo.

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Env vars | `MONGO_URI`, `JWT_SECRET` (long random string), `NODE_ENV=production`, `CLIENT_URL=<your Netlify URL, no trailing slash>` |

Test `https://<name>.onrender.com/api/health`. The free tier sleeps when idle, so the first request can be slow. Deploy order: Render first (put a placeholder `CLIENT_URL`), then Netlify, then update `CLIENT_URL` on Render with the real Netlify URL.

## Step 14: Frontend on Netlify
Connect the repo, Base directory `frontend`, Build `npm run build`, Publish `frontend/dist`. Env var: `VITE_API_URL=https://<name>.onrender.com`.
- The React Router redirect rule is already in `frontend/public/_redirects`.
- Edit `frontend/public/_headers` and replace `YOUR-API.onrender.com` with your real API host, otherwise the CSP blocks API calls.
- For Vercel, `frontend/vercel.json` provides the rewrite; set the same env var.

## Step 15: Test live
Open the site (check the 🔒 and `https://`). Submit the Register form, then Atlas → Browse Collections → `registrations` shows the entry. Also create an account, log in, post feedback. Log in/out must work on the live site (cookie is cross-site, so test in a normal window, not with third-party cookies blocked).

## Step 16: Speed (sizes)
`npm run build` in `frontend`. Your original app (before): **JS 168.78 kB (54.88 kB gzip), 184K dist**. Now: main chunk 167.19 kB (54.63 kB gzip) with each page as its own small chunk loaded on demand, gallery images `loading="lazy"`. Be honest in the record: the saving is on-demand loading and fewer bytes on first paint, not a big drop in the single bundle size, since React + Router are most of it. Show the DevTools Network tab with the images/chunks loading only when you open Gallery.

## Step 17: Lighthouse (before → after)
For a genuine "before", first deploy with these 5 items removed, run Lighthouse (F12 → Lighthouse → Analyze, save report), then add them back as a branch `feature-perf` and merge (doubles as your branching evidence):

| Fix | Where |
|---|---|
| Meta description | `frontend/index.html` |
| Image alt text, width/height | `frontend/src/pages/Gallery.jsx` |
| `loading="lazy"` on images | `frontend/src/pages/Gallery.jsx` |
| Form labels linked to inputs (`htmlFor`/`id`) | `Registration.jsx`, `Login.jsx`, `Feedback.jsx` |
| `<main>` landmark + lazy routes | `frontend/src/App.jsx` |
| Cache headers + security headers | `frontend/public/_headers` |

## Step 18: Report checklist
- Architecture diagram: `React (Netlify) → Express API (Render) → MongoDB Atlas`
- 3 live URLs (frontend, API `/api/health`, Atlas cluster)
- Security note: NoSQL injection, XSS, cookie/CSRF, each with before/after screenshots
- `git log --oneline --graph --all` screenshot + GitHub repo; red and green CI screenshots
- Lighthouse before/after, Network-tab screenshot, screenshots of the live site on mobile and desktop (Chrome DevTools device mode, plus one other browser such as Firefox/Edge) for sub-question 8
- Result line

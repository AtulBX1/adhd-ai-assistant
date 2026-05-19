# Deploying ADHD AI Assistant on Render.com

## Prerequisites

| Tool | Required Version |
|------|-----------------|
| Python | 3.10+ |
| pip | Latest |
| Node.js | Not required (frontend is plain HTML) |
| Groq API Key | Free at [console.groq.com](https://console.groq.com) |

---

## Required Environment Variables

### Backend (`adhd-assistant-backend`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key — get it free at console.groq.com | `gsk_xxxxxxxxxxxx` |
| `ALLOWED_ORIGINS` | ✅ Yes | Comma-separated list of frontend URLs allowed to call the API | `https://adhd-assistant-frontend.onrender.com` |
| `PORT` | Auto | Injected by Render automatically — do not set manually | `10000` |
| `FLASK_ENV` | Optional | Set to `production` | `production` |

> **⚠️ NEVER commit your `GROQ_API_KEY` to source control.** The `.env` file is already in `.gitignore`.

---

## Step-by-Step Render Deployment

### Step 1 — Push to GitHub

Make sure all changes are committed and pushed:

```bash
git add .
git commit -m "chore: prepare for Render.com deployment"
git push origin main
```

---

### Step 2 — Deploy the Backend (Web Service)

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo (`adhd-ai-assistant`)
3. Configure the service:
   - **Name**: `adhd-assistant-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
4. Set Environment Variables (under **Environment**):
   - `GROQ_API_KEY` → your actual Groq API key
   - `ALLOWED_ORIGINS` → leave blank for now (you'll update after frontend deploys)
   - `FLASK_ENV` → `production`
5. Click **Create Web Service**
6. Wait for the build to finish. You'll get a URL like:
   ```
   https://adhd-assistant-backend.onrender.com
   ```
7. Test the health check:
   ```
   https://adhd-assistant-backend.onrender.com/health
   ```
   Should return: `{"status": "ok"}`

---

### Step 3 — Deploy the Frontend (Static Site)

1. Go to [render.com](https://render.com) → **New** → **Static Site**
2. Connect the same GitHub repo
3. Configure:
   - **Name**: `adhd-assistant-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `echo "No build step required"`
   - **Publish Directory**: `.` (dot — the `frontend/` folder itself)
4. Click **Create Static Site**
5. You'll get a URL like:
   ```
   https://adhd-assistant-frontend.onrender.com
   ```

---

### Step 4 — Connect Frontend to Backend

1. Open `frontend/config.js` in your editor
2. Set your backend URL:
   ```js
   window.API_BASE_URL = 'https://adhd-assistant-backend.onrender.com';
   ```
3. Commit and push:
   ```bash
   git add frontend/config.js
   git commit -m "chore: set production backend URL"
   git push
   ```
   Render will automatically redeploy the static site.

4. Back in Render, update the backend's `ALLOWED_ORIGINS` env var:
   ```
   https://adhd-assistant-frontend.onrender.com
   ```
   Then click **Save Changes** — Render will redeploy the backend automatically.

---

### Step 5 — Using render.yaml (Alternative — Blueprint Deploy)

If you prefer automated setup, Render can read `render.yaml` at the root:

1. Go to Render → **New** → **Blueprint**
2. Connect your repo — Render will detect `render.yaml` and create both services at once
3. You'll still need to set `GROQ_API_KEY` and `ALLOWED_ORIGINS` manually in the dashboard (marked `sync: false` for security)

---

## Verifying the Deployment

```bash
# 1. Backend health check
curl https://adhd-assistant-backend.onrender.com/health
# Expected: {"status": "ok"}

# 2. API status check
curl https://adhd-assistant-backend.onrender.com/status
# Expected: {"api_configured": true, "model": "llama-3.3-70b-versatile", "success": true}

# 3. Test a chat message
curl -X POST https://adhd-assistant-backend.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "mode": "minimal"}'
# Expected: {"response": "...", "success": true}
```

Visit `https://adhd-assistant-frontend.onrender.com` — the status dot in the sidebar should turn green and show the model name.

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/AtulBX1/adhd-ai-assistant
cd adhd-ai-assistant

# 2. Set up backend
cd backend
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
pip install -r requirements.txt
python app.py
# Backend runs on http://127.0.0.1:5000

# 3. Open frontend (new terminal, no server needed)
# Open frontend/index.html directly in your browser
# OR serve it with any static server:
cd ../frontend
python -m http.server 3000
# Visit http://localhost:3000
```

---

## Common Issues & Fixes

### 🔴 CORS Error in Browser Console
**Symptom**: `Access-Control-Allow-Origin` error when frontend tries to call backend.

**Fix**: Make sure `ALLOWED_ORIGINS` on the backend includes your **exact** frontend URL (no trailing slash):
```
ALLOWED_ORIGINS=https://adhd-assistant-frontend.onrender.com
```

---

### 🔴 Status Dot Shows "Server offline"
**Symptom**: The status indicator stays red after page load.

**Fix 1**: Check `frontend/config.js` has the correct backend URL.  
**Fix 2**: Check the backend service is running in Render — look for green "Live" status.  
**Fix 3**: On Render's free tier, services **spin down after 15 minutes of inactivity**. The first request after wake-up takes ~30 seconds. Wait and retry.

---

### 🔴 Backend Build Fails
**Symptom**: Render build log shows package installation errors.

**Fix**: The `requirements.txt` is in `backend/`. Make sure **Root Directory** is set to `backend` in the Render dashboard.

---

### 🔴 "GROQ_API_KEY is not set" Error
**Symptom**: `/status` returns `{"api_configured": false}`.

**Fix**: Go to Render → your backend service → **Environment** tab → add `GROQ_API_KEY` with your key from [console.groq.com](https://console.groq.com).

---

### 🟡 Frontend Shows Blank Page
**Symptom**: Render static site URL shows nothing.

**Fix**: Make sure **Publish Directory** is set to `.` (not `dist` or `build`) since this is a plain HTML project with no build step.

---

## Architecture Overview

```
Render Static Site                 Render Web Service
┌─────────────────────┐            ┌──────────────────────────┐
│  frontend/          │  HTTPS     │  backend/                │
│  ├── index.html     │ ─────────► │  ├── app.py (Flask)      │
│  ├── config.js      │  /chat     │  ├── api/gemini.py       │
│  ├── scripts/       │  /status   │  │   (Groq client)       │
│  │   └── main.js    │  /health   │  └── utils/prompts.py    │
│  └── styles/        │            │                          │
│      └── main.css   │            │  Uses: GROQ_API_KEY      │
└─────────────────────┘            │  Model: llama-3.3-70b    │
                                   └──────────────────────────┘
```

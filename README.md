# ADHD AI Assistant

A complete, modern chat application designed specifically to support individuals with ADHD. The assistant provides four interaction modes tailored to different cognitive needs and states. Powered by the **Groq API** (llama-3.3-70b-versatile).

🌐 **Live Demo:** [https://adhd-assistant-3eau.onrender.com](https://adhd-assistant-3eau.onrender.com)

---
## Preview 
<img width="1917" height="968" alt="Screenshot 2026-05-19 130817" src="https://github.com/user-attachments/assets/43f18a50-9451-4490-b5ef-2fbfc940604d" />

## Features

- **Four Specialized Modes:**
  - **Minimal** — Brief, concise responses. Perfect when feeling overwhelmed.
  - **Direct** — Reality-focused, action-oriented advice to cut through distractions.
  - **Supportive** — Gentle, encouraging guidance that validates ADHD challenges.
  - **Structured** — Step-by-step, highly organized responses to break down complex tasks.
- **Modern UI** — Clean, responsive layout that works on desktop, tablet, and mobile.
- **Accessibility** — Support for dark/light themes and reduced motion preferences.
- **Local History** — Chat history and preferences persist securely in your browser.
- **Test Mode** — Develop and test the UI without consuming API credits.

---

## Local Development Setup

### Prerequisites
- Python 3.8+
- A free [Groq API key](https://console.groq.com/keys)

> **No virtual environment required** — you can install dependencies globally or use one optionally.

---

### 1. Get a Groq API Key

1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign in or create a free account
3. Click **"Create API Key"**
4. Copy your key (keep it secure!)

---

### 2. Backend Setup

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy the example env file
cp .env.example .env
```

Open `.env` and set your key:
```
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend:
```bash
python app.py
```

You should see the server running at `http://127.0.0.1:5000`.

---

### 3. Frontend Setup

The frontend is plain HTML/CSS/JS — no build step needed.

**Option A — Open directly:**
```
Open frontend/index.html in your browser
```

**Option B — Serve locally (recommended):**
```bash
cd frontend
python -m http.server 8000
```
Then open `http://localhost:8000`

> The frontend automatically falls back to `http://127.0.0.1:5000` when `window.API_BASE_URL` is empty, so no config changes are needed for local development.

---

### Running After Setup

**Terminal 1 — Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 — Frontend:**
```bash
cd frontend
python -m http.server 8000
```

---

## Production Deployment (Render.com)

The app is deployed as two separate services on Render:

| Service | Type | URL |
|---|---|---|
| Backend (Flask) | Web Service | `https://adhd-ai-assistant.onrender.com` |
| Frontend (Static) | Static Site | `https://adhd-assistant-3eau.onrender.com` |

### Backend Environment Variables (set in Render dashboard)

| Key | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `ALLOWED_ORIGINS` | `https://adhd-assistant-3eau.onrender.com` |
| `PORT` | `10000` |

### Frontend Config

`frontend/config.js` sets the backend URL for production:
```js
window.API_BASE_URL = 'https://adhd-ai-assistant.onrender.com';
```

> For local development, leave this as an empty string `''` — the app will fall back to `127.0.0.1:5000` automatically.

---

## Troubleshooting

**"Network error — make sure the backend is running"**
- Locally: ensure `python app.py` is running in the `backend/` folder
- Production: check Render backend service logs for crash errors

**API Authentication Failed**
- Verify `GROQ_API_KEY` in `backend/.env` matches exactly what you copied from Groq console
- On Render: confirm the key is set in the Environment tab

**Changes in CSS/JS not reflecting**
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

**Backend slow on first request (Render free tier)**
- Free tier services sleep after 15 minutes of inactivity
- The first request after sleep takes ~30 seconds to wake up — this is normal

**Rate Limit Exceeded**
- You're sending too many requests too quickly — wait a moment and retry
- Toggle **Test Mode ON** in the sidebar to test the UI without hitting the API

---

## Project Structure

```
adhd-ai-assistant/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variable template
│   └── .env                # Your local secrets (never commit this)
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── config.js           # API base URL config
│   └── scripts/
│       └── main.js         # Frontend logic
├── render.yaml             # Render deployment config
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Plain HTML, CSS, JavaScript |
| Backend | Python, Flask |
| AI Model | Groq API — llama-3.3-70b-versatile |
| Hosting | Render.com |

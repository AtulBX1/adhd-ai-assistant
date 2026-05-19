# ADHD AI Assistant

A complete, modern chat application designed specifically to support individuals with ADHD. The assistant provides different interaction modes (Minimal, Direct, Supportive, Structured) tailored to different cognitive needs and states. Powered by Google Gemini API.

## Features

- **Four Specialized Modes**:
  - **Minimal**: Brief, concise responses. Perfect when feeling overwhelmed.
  - **Direct**: Reality-focused, action-oriented advice to cut through distractions.
  - **Supportive**: Gentle, encouraging guidance that validates ADHD challenges.
  - **Structured**: Step-by-step, highly organized responses to break down complex tasks.
- **Modern UI**: Clean, responsive layout that works on desktop, tablet, and mobile.
- **Accessibility**: Support for dark/light themes and reduced motion preferences.
- **Local History**: Chat history and preferences persist securely in your browser.
- **Test Mode**: Develop and test the UI without consuming API credits.

---

## Setup (First Time)

Follow these instructions to get the application running on your local machine.

### 1. Get a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click on "Create API key".
4. Copy your API key (keep it secure!).

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   
   # macOS/Linux
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up your environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` in a text editor and replace `your_google_api_key_here` with your actual API key.

6. Start the backend server:
   ```bash
   python app.py
   ```
   You should see a message indicating the server is running on `http://127.0.0.1:5000`.

### 3. Frontend Setup

The frontend consists of static files and doesn't require complex build steps.

1. Open the `frontend/index.html` file directly in your web browser.
   - Alternatively, you can serve it locally for a better experience:
     ```bash
     cd frontend
     python -m http.server 8000
     ```
     Then open `http://localhost:8000` in your browser.

---

## Running (After Setup)

To use the application after the initial setup, you need to run the backend and open the frontend.

**Terminal 1 (Backend):**
```bash
cd backend
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
python app.py
```

**Terminal 2 (Frontend):**
Open `frontend/index.html` in your browser, or start a simple HTTP server:
```bash
cd frontend
python -m http.server 8000
```

---

## Troubleshooting

- **Server Error (500) / "Cannot connect to backend server"**:
  - Ensure the backend terminal is open and `python app.py` is running without errors.
  - Check that you are accessing the frontend via HTTP (if running the server) or the file protocol, and that your CORS configuration allows the connection.

- **API Not Configured / Authentication Failed**:
  - Double-check that your `GOOGLE_API_KEY` in the `backend/.env` file is exactly what you copied from Google AI Studio.
  - Ensure you saved the `.env` file correctly.

- **Rate Limit Exceeded**:
  - You are making too many requests in a short period. Wait a few moments and try again. 
  - To test UI interactions without hitting limits, toggle **Test Mode** to ON in the sidebar.

- **Changes in CSS/JS not reflecting**:
  - Clear your browser cache or perform a hard refresh (`Ctrl + F5` or `Cmd + Shift + R`).
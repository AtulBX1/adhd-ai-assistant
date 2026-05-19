# ADHD AI Assistant - Complete Refactor Prompt (MASTER)

You are an expert full-stack developer. Your task is to completely refactor an ADHD AI Assistant application to fix critical issues and improve the user experience.

## CURRENT PROJECT STATE

The project is a Flask + Vanilla JavaScript chat application that currently:
- Uses Anthropic Claude API (paid, limited credits)
- Has basic HTML/CSS UI (not responsive, not modern)
- Uses Claude 3 Haiku model
- Has incomplete prompt implementation (all modes return the same generic response)
- Lacks proper error handling and conversation history
- Has poor accessibility and no theme system

**Project Structure**:
```
adhd-ai-assistant/
├── backend/
│   ├── app.py                    # Flask app
│   ├── api/
│   │   └── claude.py            # Uses Anthropic API (NEEDS REPLACEMENT)
│   ├── utils/
│   │   ├── __init__.py
│   │   └── prompts.py           # Prompts not implemented properly
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── index.html               # Basic HTML
    ├── styles/main.css         # Basic styling
    └── scripts/main.js         # Vanilla JavaScript
```

---

## ISSUES TO FIX

### 1. **API Key & Cost Problem** (CRITICAL)
- **Issue**: Hardcoded to use Anthropic Claude API with limited free credits
- **Fix**: Migrate to Google Gemini API (free tier with generous credits)
- **Files affected**: `backend/api/claude.py` (delete), `backend/app.py`, `backend/requirements.txt`, `backend/.env.example`

### 2. **Incomplete Prompts** (CRITICAL)
- **Issue**: All 4 modes (minimal, direct, supportive, structured) return the SAME generic prompt
- **Current code in prompts.py**:
  ```python
  def get_direct_adhd_prompt(): return get_minimal_testing_prompt()  # WRONG - returns same
  def get_supportive_adhd_prompt(): return get_minimal_testing_prompt()  # WRONG - returns same
  def get_structured_adhd_prompt(): return get_minimal_testing_prompt()  # WRONG - returns same
  ```
- **Fix**: Create 4 distinct, substantive prompts for ADHD support
- **Files affected**: `backend/utils/prompts.py`

### 3. **Frontend UI/UX Issues** (HIGH PRIORITY)
- **Issues**:
  - Basic HTML with no modern styling
  - Not responsive (doesn't work on mobile/tablet)
  - No dark/light theme toggle
  - No loading indicators or animations
  - Poor message differentiation (user vs assistant messages look the same)
  - No accessibility features
  - No chat history visualization
- **Fix**: Complete redesign using Stitch UI framework
- **Files affected**: `frontend/index.html`, `frontend/styles/main.css`, `frontend/scripts/main.js`

### 4. **Missing Features & Error Handling** (MEDIUM PRIORITY)
- **Issues**:
  - No input validation
  - No proper error messages
  - No logging system
  - No conversation history (despite structure for it)
  - Missing .env.example file
  - No clear setup instructions
- **Fix**: Add utilities for validation and logging, improve error handling
- **Files affected**: `backend/app.py`, `backend/utils/`, `README.md`

---

## REQUIREMENTS & SPECIFICATIONS

### BACKEND REQUIREMENTS

#### 1. Replace Claude API with Google Gemini API
**File**: Create `backend/api/gemini.py`

Requirements:
- Use `google-generativeai` library (pip install google-generativeai)
- Create `GeminiAPI` class with same interface as old `ClaudeAPI`
- Use model: `gemini-2.0-flash` (free and fast)
- Implement `send_message(message, system_prompt, conversation_history)` method
- Handle these errors gracefully:
  - `ResourceExhausted` → Rate limit message to user
  - `Unauthenticated` → API key invalid message
  - `InvalidArgument` → Input validation error message
- Return same format as Claude: `{"content": str, "model": str, "usage": {}, "error": bool}`
- Log all API calls and errors

#### 2. Update Flask App
**File**: Modify `backend/app.py`

Requirements:
- Replace `from api.claude import ClaudeAPI` with `from api.gemini import GeminiAPI`
- Initialize GeminiAPI instead of ClaudeAPI
- Keep all existing endpoints working (/chat, /modes, /status, /clear-history)
- Improve error handling for all endpoints
- Add logging for requests and responses
- Validate user input (message length, mode validation)
- Test mode should still work (returns mock responses)

#### 3. Implement Proper ADHD Support Prompts
**File**: Rewrite `backend/utils/prompts.py`

Requirements:
- Create 4 distinct system prompts:

**Minimal Mode** (Quick, efficient):
```
Brief, concise responses
Avoid lengthy explanations
Focus on clarity
Keep it short - people with ADHD struggle with information overload
```

**Direct Mode** (Reality-focused, action-oriented):
```
Cut through distractions
Provide actionable advice
Reality-check when needed (without being harsh)
Focus on practical next steps
Be honest and straightforward
```

**Supportive Mode** (Gentle, encouraging, validating):
```
Validate real ADHD challenges
Provide gentle guidance
Celebrate small wins
Remember: ADHD is a neurodevelopmental difference, not laziness
Be warm and understanding
```

**Structured Mode** (Step-by-step, organized):
```
Break everything into numbered steps
Provide clear organization
Explain the "why" behind each step
Anticipate common obstacles
Use clear formatting with headers and bullet points
```

- All prompts should:
  - Be ADHD-aware and supportive
  - Address actual ADHD challenges
  - Be distinct from each other (not variations of the same theme)
  - Be between 100-200 words each

#### 4. Update Requirements & Environment
**File**: Modify `backend/requirements.txt`

Requirements:
- Remove: `anthropic==0.52.2`
- Add: `google-generativeai>=0.3.0`
- Ensure `python-dotenv>=1.1.0` is present
- Pin versions for stability

**File**: Create `backend/.env.example`

Requirements:
```
# Google Gemini API Configuration
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Server Configuration
SERVER_HOST=127.0.0.1
SERVER_PORT=5000

# CORS Configuration
CORS_ORIGINS=http://127.0.0.1:5000,http://localhost:3000
```

---

### FRONTEND REQUIREMENTS

#### 1. Complete HTML Redesign
**File**: Rewrite `frontend/index.html`

Requirements:
- Use Stitch UI components (include CDN links)
- Include Font Awesome icons CDN
- Responsive meta tags and charset
- Structure:
  - Header with app title and theme toggle button
  - Sidebar with:
    - Mode selector (4 buttons: minimal, direct, supportive, structured)
    - Mode description text
    - Test mode toggle
    - Status indicator (API status, message count)
    - Help section
  - Main chat area with:
    - Messages display container
    - Typing indicator (hidden by default)
    - Input form with message input and send button
    - Character counter (0/5000)
- All buttons must be accessible (proper labels and ARIA)
- Use semantic HTML5 elements

#### 2. Complete CSS Redesign
**File**: Rewrite `frontend/styles/main.css`

Requirements:
- CSS Variables for:
  - Colors (primary, secondary, success, warning, danger, info)
  - Light & Dark theme colors
  - Spacing (xs, sm, md, lg, xl, 2xl)
  - Typography (font families, sizes)
  - Transitions and animations
  
- Responsive Design:
  - Desktop (1200px+): Full sidebar + main content
  - Tablet (768px-1200px): Sidebar collapses, main content expands
  - Mobile (<768px): Single column, stacked layout
  - Touch targets minimum 44px height

- Message Styling:
  - User messages: Right-aligned, blue background
  - Assistant messages: Left-aligned, light gray background
  - System messages: Centered, yellow/info background
  - Each message type has different styling

- Theme Support:
  - Light theme (default)
  - Dark theme (triggered by .theme-dark class on body)
  - All colors must work in both themes
  - Theme toggle button changes icon (moon ↔ sun)

- Interactive Elements:
  - Smooth hover effects
  - Active/focused states
  - Loading spinner animation
  - Typing indicator animation (3 bouncing dots)
  - Toast notifications (slide in from right)
  - Smooth transitions (200-300ms)

- Accessibility:
  - High contrast in dark mode
  - Focus visible states
  - Proper line heights (1.6+)
  - No text smaller than 11px
  - Semantic color usage

#### 3. Complete JavaScript Rewrite
**File**: Rewrite `frontend/scripts/main.js`

Requirements:
- Use class-based architecture
- Constructor should:
  - Initialize DOM element references
  - Load saved state from localStorage
  - Set up event listeners
  - Check API status
  
- Core Features:
  - **Message Management**:
    - Add messages to chat display
    - Differentiate user/assistant/system messages
    - Save chat history to localStorage
    - Load chat history on page load
    - Auto-scroll to latest message
  
  - **Mode Selection**:
    - 4 buttons for modes (minimal, direct, supportive, structured)
    - Show description text when mode selected
    - Update current mode indicator
    - Save selected mode to localStorage
  
  - **Theme Toggle**:
    - Light/dark theme toggle
    - Save preference to localStorage
    - Update icon (moon ↔ sun)
    - Change body class accordingly
  
  - **Test Mode**:
    - Toggle button for test mode (ON/OFF)
    - When ON: Return mock responses
    - When OFF: Make real API calls
    - Show status in button text
  
  - **Sending Messages**:
    - Send on button click OR Enter key
    - Show typing indicator while waiting
    - Display error messages as assistant messages
    - Clear input after sending
    - Update character counter
    - Validate input (not empty, max 5000 chars)
  
  - **Error Handling**:
    - Show toast notifications for errors
    - Graceful handling of:
      - Cannot connect to server
      - API rate limit exceeded
      - Invalid API key
      - Network timeouts
    - User-friendly error messages
  
  - **UI Feedback**:
    - Typing indicator (3 animated dots)
    - Loading state for send button
    - Message count display
    - API status indicator
    - Character counter
  
- API Integration:
  - POST to `http://127.0.0.1:5000/chat`
  - Send: `{message, mode, test_mode}`
  - Handle success and error responses
  - Check /status endpoint on load

- Storage:
  - Save theme preference (localStorage)
  - Save selected mode (localStorage)
  - Save chat messages (localStorage)
  - Persist across page reloads

---

## STEP-BY-STEP IMPLEMENTATION

### STEP 1: Backend API Migration (Do First)
1. Create new `backend/api/gemini.py` file (complete implementation)
2. Modify `backend/app.py` to:
   - Import GeminiAPI instead of ClaudeAPI
   - Initialize GeminiAPI
   - Keep all endpoints working
3. Update `backend/requirements.txt`:
   - Remove anthropic
   - Add google-generativeai
4. Create `backend/.env.example` with Gemini config
5. Update `backend/utils/prompts.py` with 4 distinct prompts

**VALIDATION**: Backend should start without errors, /status should show Gemini API initialized

### STEP 2: Frontend HTML & CSS (Do Second)
1. Completely rewrite `frontend/index.html`:
   - Use Stitch UI CDN
   - Modern semantic HTML
   - Accessible labels and ARIA
2. Completely rewrite `frontend/styles/main.css`:
   - CSS variables for theming
   - Responsive grid layout
   - Light & dark themes
   - Smooth animations

**VALIDATION**: Page should load without errors, sidebar visible, messages display properly, theme toggle works

### STEP 3: Frontend JavaScript (Do Third)
1. Completely rewrite `frontend/scripts/main.js`:
   - Class-based architecture
   - Full error handling
   - localStorage integration
   - All 4 mode types work
   - Theme toggle works
   - Test mode works

**VALIDATION**: Can send messages (test mode), UI responds smoothly, theme toggles, chat persists on reload

### STEP 4: Testing & Documentation (Do Last)
1. Test all 4 modes produce different responses
2. Test API with valid key (real API call)
3. Test error handling (invalid key, rate limit)
4. Test responsive design (mobile/tablet/desktop)
5. Test dark/light theme
6. Create or update README with:
   - Quick start instructions
   - Setup steps
   - How to get Gemini API key
   - Running instructions
   - Troubleshooting

---

## DELIVERABLES CHECKLIST

### Backend
- [ ] `backend/api/gemini.py` created and working
- [ ] `backend/app.py` updated to use Gemini
- [ ] `backend/requirements.txt` updated
- [ ] `backend/.env.example` created
- [ ] `backend/utils/prompts.py` has 4 distinct prompts
- [ ] No Anthropic references remain in code
- [ ] Backend starts without errors
- [ ] /status endpoint shows Gemini API
- [ ] /chat endpoint works with both test and live mode

### Frontend
- [ ] `frontend/index.html` complete redesign
- [ ] `frontend/styles/main.css` with themes and responsive design
- [ ] `frontend/scripts/main.js` complete rewrite
- [ ] All buttons work (mode selection, theme toggle, test mode, send)
- [ ] Messages display correctly (user/assistant/system differentiated)
- [ ] Chat history persists across page reloads
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark/light theme toggle works
- [ ] No console errors
- [ ] Loading indicators and animations work

### Documentation
- [ ] README.md updated with clear setup instructions
- [ ] .env.example shows all required variables
- [ ] Quick start guide included
- [ ] Troubleshooting section included
- [ ] Setup takes less than 10 minutes

---

## FINAL RUNNING INSTRUCTIONS (REQUIRED IN OUTPUT)

When complete, provide instructions:

```
## Setup (First Time)

1. Get API key: https://makersuite.google.com/app/apikey

2. Backend:
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and add GOOGLE_API_KEY=xxx
   python app.py

3. Frontend:
   # Open frontend/index.html in browser
   # Or use: cd frontend && python -m http.server 8000

## Running (After Setup)

Terminal 1:
   cd backend && source venv/bin/activate && python app.py

Terminal 2:
   Open frontend/index.html in browser
```

---

## SUCCESS CRITERIA

The refactor is complete when:

✅ Backend starts with `python app.py` (no Anthropic API)
✅ Frontend loads with modern UI (no basic HTML look)
✅ All 4 modes produce different responses (not the same generic prompt)
✅ Dark/light theme toggle works
✅ Chat history persists across page reloads
✅ Responsive on mobile/tablet/desktop
✅ No console errors in browser
✅ All error messages are user-friendly
✅ Setup takes less than 10 minutes with clear instructions
✅ Code is clean, well-organized, and commented
✅ Ready for production use

---

## IMPORTANT NOTES

1. **API Key Security**: Never commit .env file to git (add to .gitignore)
2. **CSS Variables**: Use var(--color-primary) for colors, not hardcoded hex
3. **Dark Mode**: All colors must work in both light AND dark themes
4. **Responsive**: Test at 480px, 768px, 1024px, 1200px widths
5. **Accessibility**: Add title attributes and aria-labels to all interactive elements
6. **Test Mode**: Keep for development - helps debug without API calls
7. **Error Messages**: Should tell user WHAT went wrong and HOW to fix it
8. **Performance**: Keep JavaScript execution smooth (no blocking calls)

---

## QUESTIONS TO ANSWER WHILE IMPLEMENTING

Before you say you're done, answer:

1. Can I see all 4 modes produce visibly different responses?
2. Does the UI look professional and modern?
3. Do I need to adjust anything on mobile (test in DevTools)?
4. Are error messages clear and helpful?
5. Does chat history persist when I reload the page?
6. Does dark mode work properly (all text readable)?
7. Did I remove ALL Anthropic/Claude references?
8. Is the setup simple enough for a non-developer?
9. Are there any console errors or warnings?
10. Is the code commented and well-organized?

If you can answer YES to all 10, you're done.

---

## FINAL OUTPUT MUST INCLUDE

1. All updated/created code files
2. Clear step-by-step running instructions
3. Verification that all 4 modes work
4. Confirmation that API migrated to Gemini
5. Confirmation that UI is responsive and has dark mode
6. README with complete setup guide

---

**Status**: Ready for implementation
**Estimated Time**: 8-12 hours
**Complexity**: Medium-High
**Priority**: All phases critical

Begin implementation now. Complete all sections. The app must be production-ready with clear setup and running instructions included.

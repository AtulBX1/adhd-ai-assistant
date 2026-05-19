/* =========================================
   FOCUS — ADHD AI Assistant
   Main Application Script
   ========================================= */

class FocusApp {
    constructor() {
        // ── DOM References ──────────────────────────────
        this.$ = (id) => document.getElementById(id);
        this.chatMessages    = this.$('chat-messages');
        this.messageInput    = this.$('message-input');
        this.sendBtn         = this.$('send-btn');
        this.charCount       = this.$('char-count');
        this.typingIndicator = this.$('typing-indicator');
        this.welcomeScreen   = this.$('welcome-screen');
        this.modeSelector    = this.$('mode-selector');
        this.themeToggle     = this.$('theme-toggle');
        this.themeIcon       = this.$('theme-icon');
        this.testModeToggle  = this.$('test-mode-toggle');
        this.statusDot       = this.$('status-dot');
        this.statusText      = this.$('status-text');
        this.clearChatBtn    = this.$('clear-chat-btn');
        this.toastContainer  = this.$('toast-container');
        this.topbarPip       = this.$('topbar-mode-pip');
        this.topbarLabel     = this.$('topbar-mode-label');
        this.searchBtn       = this.$('search-btn');
        this.searchBar       = this.$('search-bar');
        this.searchInput     = this.$('search-input');
        this.searchCount     = this.$('search-count');
        this.searchClose     = this.$('search-close');
        this.exportBtn       = this.$('export-btn');
        this.menuOpenBtn     = this.$('menu-open-btn');
        this.sidebarCloseBtn = this.$('sidebar-close');
        this.sidebar         = document.querySelector('.sidebar');

        // ── State ────────────────────────────────────────
        this.messages    = [];
        this.currentMode = 'minimal';
        this.testMode    = false;
        this.isTyping    = false;
        // API base URL — set window.API_BASE_URL in config.js for production.
        // Falls back to localhost for local development.
        this.apiUrl      = (window.API_BASE_URL && window.API_BASE_URL.trim() !== '')
                             ? window.API_BASE_URL.trim().replace(/\/$/, '')
                             : 'http://127.0.0.1:5000';
        this.maxChars    = 5000;
        this.searchActive = false;

        // Mode config (color + label)
        this.modeConfig = {
            minimal:    { color: 'var(--accent-blue)',   label: 'Minimal Mode',    icon: 'fa-bolt' },
            direct:     { color: 'var(--accent-orange)', label: 'Direct Mode',     icon: 'fa-bullseye' },
            supportive: { color: 'var(--accent-green)',  label: 'Supportive Mode', icon: 'fa-heart' },
            structured: { color: 'var(--accent-purple)', label: 'Structured Mode', icon: 'fa-list-ol' },
        };

        this.init();
    }

    init() {
        this.loadPersistedState();
        this.bindEvents();
        this.checkApiStatus();
        this.renderAllMessages();
        this.autoResizeTextarea();
        this.initPomodoro();
        this.initTasks();
    }

    // ──────────────────────────────────────────────────
    // PERSISTENCE
    // ──────────────────────────────────────────────────

    loadPersistedState() {
        // Theme
        const theme = localStorage.getItem('focus_theme') || 'dark';
        this.setTheme(theme, false);

        // Mode
        const mode = localStorage.getItem('focus_mode') || 'minimal';
        this.setMode(mode, false);

        // Messages
        try {
            const saved = localStorage.getItem('focus_messages');
            this.messages = saved ? JSON.parse(saved) : [];
        } catch { this.messages = []; }
    }

    saveMessages() {
        localStorage.setItem('focus_messages', JSON.stringify(this.messages));
    }

    // ──────────────────────────────────────────────────
    // EVENT BINDING
    // ──────────────────────────────────────────────────

    bindEvents() {
        // Mode selection
        document.querySelectorAll('.mode-card').forEach(btn => {
            btn.addEventListener('click', () => this.setMode(btn.dataset.mode, true));
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            this.setTheme(current === 'dark' ? 'light' : 'dark', true);
        });

        // Test mode
        this.testModeToggle.addEventListener('change', () => {
            this.testMode = this.testModeToggle.checked;
            this.showToast(`Test Mode ${this.testMode ? 'ON' : 'OFF'}`, 'info');
        });

        // Input
        this.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.autoResizeTextarea();
        });

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Clear chat
        this.clearChatBtn.addEventListener('click', () => {
            if (confirm('Clear all chat history?')) this.clearChat();
        });

        // Suggestion chips
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.messageInput.value = chip.dataset.prompt;
                this.updateCharCount();
                this.sendMessage();
            });
        });

        // Search
        this.searchBtn.addEventListener('click', () => this.toggleSearch());
        this.searchClose.addEventListener('click', () => this.closeSearch());
        this.searchInput.addEventListener('input', () => this.doSearch());
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.toggleSearch();
            }
            if (e.key === 'Escape' && this.searchActive) {
                this.closeSearch();
            }
        });

        // Export
        this.exportBtn.addEventListener('click', () => this.exportChat());

        // Mobile sidebar
        this.menuOpenBtn?.addEventListener('click', () => this.sidebar.classList.add('open'));
        this.sidebarCloseBtn?.addEventListener('click', () => this.sidebar.classList.remove('open'));
        document.addEventListener('click', (e) => {
            if (this.sidebar.classList.contains('open') &&
                !this.sidebar.contains(e.target) &&
                e.target !== this.menuOpenBtn) {
                this.sidebar.classList.remove('open');
            }
        });
    }

    // ──────────────────────────────────────────────────
    // THEME
    // ──────────────────────────────────────────────────

    setTheme(theme, save) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        this.themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        if (save) localStorage.setItem('focus_theme', theme);
    }

    // ──────────────────────────────────────────────────
    // MODE
    // ──────────────────────────────────────────────────

    setMode(mode, addSystemMsg) {
        this.currentMode = mode;
        localStorage.setItem('focus_mode', mode);

        const config = this.modeConfig[mode];

        // Update mode cards
        document.querySelectorAll('.mode-card').forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });

        // Update topbar
        this.topbarPip.style.background = config.color;
        this.topbarLabel.textContent = config.label;

        if (addSystemMsg && this.messages.length > 0) {
            this.pushMessage('system', `Switched to ${config.label}`);
        }
    }

    // ──────────────────────────────────────────────────
    // MESSAGES
    // ──────────────────────────────────────────────────

    renderAllMessages() {
        // Clear existing (except welcome screen)
        const existing = this.chatMessages.querySelectorAll('.message');
        existing.forEach(el => el.remove());

        if (this.messages.length === 0) {
            this.welcomeScreen?.classList.remove('hidden');
        } else {
            this.welcomeScreen?.classList.add('hidden');
            this.messages.forEach(msg => this.renderMessage(msg, false));
        }

        this.scrollToBottom();
    }

    renderMessage(msg, animate = true) {
        if (msg.role === 'system') {
            const el = document.createElement('div');
            el.className = 'message system-msg';
            el.innerHTML = `<div class="msg-bubble">${this.escapeHtml(msg.content)}</div>`;
            this.chatMessages.appendChild(el);
            return;
        }

        const config = this.modeConfig[this.currentMode];
        const isUser = msg.role === 'user';
        const el = document.createElement('div');
        el.className = `message ${isUser ? 'user' : 'assistant'}-msg`;
        if (!animate) el.style.animation = 'none';

        const avatarIcon = isUser ? 'fa-user' : `fa-bolt`;
        const senderName = isUser ? 'You' : 'Focus';
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        el.innerHTML = `
            <div class="msg-header">
                <div class="msg-avatar">
                    <i class="fa-solid ${avatarIcon}"></i>
                </div>
                <span class="msg-sender">${senderName}</span>
                <span class="msg-time">${time}</span>
            </div>
            <div class="msg-bubble">${isUser ? this.escapeHtml(msg.content) : this.parseMarkdown(msg.content)}</div>
            <div class="msg-actions">
                <button class="msg-action-btn copy-btn" title="Copy">
                    <i class="fa-regular fa-copy"></i> Copy
                </button>
            </div>
        `;

        el.querySelector('.copy-btn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(msg.content).then(() => {
                this.showToast('Copied to clipboard', 'success');
            });
        });

        this.chatMessages.appendChild(el);
    }

    pushMessage(role, content) {
        const msg = { role, content, timestamp: new Date().toISOString(), mode: this.currentMode };
        this.messages.push(msg);
        this.saveMessages();

        this.welcomeScreen?.classList.add('hidden');
        this.renderMessage(msg, true);
        this.scrollToBottom();
    }

    clearChat() {
        this.messages = [];
        this.saveMessages();
        const existing = this.chatMessages.querySelectorAll('.message');
        existing.forEach(el => el.remove());
        this.welcomeScreen?.classList.remove('hidden');
        this.showToast('Chat cleared', 'success');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 50);
    }

    // ──────────────────────────────────────────────────
    // MARKDOWN PARSER (lightweight, ADHD-optimized)
    // ──────────────────────────────────────────────────

    parseMarkdown(text) {
        if (!text) return '';

        let html = text
            // Escape HTML first
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            // Code blocks (must come before inline code)
            .replace(/```[\w]*\n?([\s\S]*?)```/gm, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Headers
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Horizontal rule
            .replace(/^---$/gm, '<hr>')
            // Blockquotes
            .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
            // Checkboxes
            .replace(/^- \[x\] (.*$)/gim, '<li style="list-style:none">✅ $1</li>')
            .replace(/^- \[ \] (.*$)/gim, '<li style="list-style:none">⬜ $1</li>')
            // Unordered list items
            .replace(/^[-*] (.*$)/gm, '<li>$1</li>')
            // Ordered list items
            .replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

        // Wrap consecutive <li> in <ul>
        html = html.replace(/(<li>.*<\/li>(\n|$))+/g, match => `<ul>${match}</ul>`);

        // Paragraphs — split by double newline
        html = html
            .split(/\n\n/)
            .map(block => {
                // Don't wrap blocks that are already block elements
                if (/^<(h[1-6]|ul|ol|pre|blockquote|hr)/.test(block.trim())) return block;
                return block.trim() ? `<p>${block.replace(/\n/g, '<br>')}</p>` : '';
            })
            .join('');

        return html;
    }

    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }

    // ──────────────────────────────────────────────────
    // SEND MESSAGE
    // ──────────────────────────────────────────────────

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || this.isTyping) return;

        // Close mobile sidebar
        this.sidebar.classList.remove('open');

        // Add user message
        this.pushMessage('user', text);
        this.messageInput.value = '';
        this.updateCharCount();
        this.autoResizeTextarea();

        // Show typing
        this.setTyping(true);

        // Build conversation history for context (last 20 messages)
        const history = this.messages
            .slice(-21, -1) // exclude the message we just pushed
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({ role: m.role, content: m.content }));

        try {
            const res = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    mode: this.currentMode,
                    test_mode: this.testMode,
                    conversation_history: history  // ← NEW: send history
                })
            });

            const data = await res.json();
            this.setTyping(false);

            if (res.ok && data.success) {
                this.pushMessage('assistant', data.response);
            } else {
                const err = data.error || 'Something went wrong';
                this.showToast(err, 'error');
                this.pushMessage('system', `⚠️ ${err}`);
            }
        } catch (e) {
            this.setTyping(false);
            this.showToast('Could not reach the server', 'error');
            this.pushMessage('system', '⚠️ Network error — make sure the backend is running.');
        }
    }

    setTyping(show) {
        this.isTyping = show;
        this.typingIndicator.classList.toggle('hidden', !show);
        this.sendBtn.disabled = show || this.messageInput.value.trim().length === 0;
        this.messageInput.disabled = show;
        if (!show) {
            this.messageInput.focus();
            this.scrollToBottom();
        }
    }

    // ──────────────────────────────────────────────────
    // INPUT UTILITIES
    // ──────────────────────────────────────────────────

    updateCharCount() {
        const len = this.messageInput.value.length;
        this.charCount.textContent = `${len}/${this.maxChars}`;
        this.charCount.className = 'char-count';
        if (len >= this.maxChars) {
            this.charCount.classList.add('limit');
        } else if (len >= this.maxChars * 0.85) {
            this.charCount.classList.add('near');
        }
        this.sendBtn.disabled = len === 0 || this.isTyping;
    }

    autoResizeTextarea() {
        const ta = this.messageInput;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    }

    // ──────────────────────────────────────────────────
    // API STATUS
    // ──────────────────────────────────────────────────

    async checkApiStatus() {
        try {
            const res = await fetch(`${this.apiUrl}/status`);
            const data = await res.json();
            if (data.success && data.api_configured) {
                this.statusDot.className = 'status-dot online';
                this.statusText.textContent = data.model || 'Connected';
            } else {
                this.statusDot.className = 'status-dot offline';
                this.statusText.textContent = 'API not configured';
            }
        } catch {
            this.statusDot.className = 'status-dot offline';
            this.statusText.textContent = 'Server offline';
        }
    }

    // ──────────────────────────────────────────────────
    // SEARCH
    // ──────────────────────────────────────────────────

    toggleSearch() {
        this.searchActive = !this.searchActive;
        this.searchBar.classList.toggle('hidden', !this.searchActive);
        if (this.searchActive) {
            this.searchInput.focus();
        } else {
            this.clearSearchHighlights();
            this.searchInput.value = '';
            this.searchCount.textContent = '';
        }
    }

    closeSearch() {
        this.searchActive = false;
        this.searchBar.classList.add('hidden');
        this.clearSearchHighlights();
        this.searchInput.value = '';
        this.searchCount.textContent = '';
    }

    doSearch() {
        this.clearSearchHighlights();
        const q = this.searchInput.value.trim();
        if (!q) { this.searchCount.textContent = ''; return; }

        const bubbles = this.chatMessages.querySelectorAll('.msg-bubble');
        let count = 0;
        const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

        bubbles.forEach(bubble => {
            const text = bubble.textContent;
            if (regex.test(text)) {
                // Highlight in the text nodes only (not inside HTML tags)
                bubble.innerHTML = bubble.innerHTML.replace(regex, match => {
                    count++;
                    return `<mark class="search-highlight">${match}</mark>`;
                });
            }
        });

        this.searchCount.textContent = count ? `${count} result${count > 1 ? 's' : ''}` : 'No results';
        if (count) {
            const first = this.chatMessages.querySelector('.search-highlight');
            first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    clearSearchHighlights() {
        this.chatMessages.querySelectorAll('.search-highlight').forEach(el => {
            el.replaceWith(document.createTextNode(el.textContent));
        });
    }

    // ──────────────────────────────────────────────────
    // EXPORT
    // ──────────────────────────────────────────────────

    exportChat() {
        if (!this.messages.length) { this.showToast('Nothing to export', 'warning'); return; }

        const lines = this.messages
            .filter(m => m.role !== 'system')
            .map(m => {
                const who = m.role === 'user' ? 'You' : 'Focus';
                const time = new Date(m.timestamp).toLocaleString();
                return `[${time}] ${who}:\n${m.content}\n`;
            });

        const blob = new Blob([`FOCUS — Chat Export\n${'='.repeat(40)}\n\n${lines.join('\n')}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focus-chat-${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Chat exported!', 'success');
    }

    // ──────────────────────────────────────────────────
    // TOAST NOTIFICATIONS
    // ──────────────────────────────────────────────────

    showToast(message, type = 'info') {
        const icons = { info: 'fa-circle-info', error: 'fa-circle-exclamation', success: 'fa-circle-check', warning: 'fa-triangle-exclamation' };
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
        this.toastContainer.appendChild(el);

        setTimeout(() => {
            el.classList.add('hiding');
            setTimeout(() => el.remove(), 300);
        }, 3500);
    }

    // ──────────────────────────────────────────────────
    // POMODORO TIMER (NEW FEATURE)
    // ──────────────────────────────────────────────────

    initPomodoro() {
        this.pom = {
            duration: 25 * 60,
            breakDuration: 5 * 60,
            longBreak: 15 * 60,
            remaining: 25 * 60,
            isRunning: false,
            isBreak: false,
            sessions: 0,
            interval: null,
        };

        this.$('pom-toggle').addEventListener('click', () => this.pomToggle());
        this.$('pom-reset').addEventListener('click', () => this.pomReset());
        this.$('pom-skip').addEventListener('click', () => this.pomSkip());
    }

    pomToggle() {
        this.pom.isRunning = !this.pom.isRunning;
        const btn = this.$('pom-toggle');
        const icon = this.$('pom-icon');

        if (this.pom.isRunning) {
            icon.className = 'fa-solid fa-pause';
            btn.classList.add('running');
            this.pom.interval = setInterval(() => this.pomTick(), 1000);
        } else {
            icon.className = 'fa-solid fa-play';
            btn.classList.remove('running');
            clearInterval(this.pom.interval);
        }
    }

    pomTick() {
        this.pom.remaining--;
        this.pomUpdateDisplay();
        if (this.pom.remaining <= 0) {
            this.pomComplete();
        }
    }

    pomComplete() {
        clearInterval(this.pom.interval);
        this.pom.isRunning = false;
        this.$('pom-icon').className = 'fa-solid fa-play';
        this.$('pom-toggle').classList.remove('running');

        if (!this.pom.isBreak) {
            this.pom.sessions++;
            this.$('pom-count').textContent = this.pom.sessions;
            const breakLen = this.pom.sessions % 4 === 0 ? this.pom.longBreak : this.pom.breakDuration;
            this.pom.isBreak = true;
            this.pom.remaining = breakLen;
            this.showToast('Focus session done! Take a break 🎉', 'success');
            this.$('pomodoro-label').textContent = this.pom.sessions % 4 === 0 ? 'Long Break' : 'Break';
            this.$('pom-progress').classList.add('break');
        } else {
            this.pom.isBreak = false;
            this.pom.remaining = this.pom.duration;
            this.showToast('Break over — let\'s focus! ⚡', 'info');
            this.$('pomodoro-label').textContent = 'Focus';
            this.$('pom-progress').classList.remove('break');
        }

        this.pomUpdateDisplay();
    }

    pomReset() {
        clearInterval(this.pom.interval);
        this.pom.isRunning = false;
        this.pom.isBreak = false;
        this.pom.remaining = this.pom.duration;
        this.$('pom-icon').className = 'fa-solid fa-play';
        this.$('pom-toggle').classList.remove('running');
        this.$('pomodoro-label').textContent = 'Focus';
        this.$('pom-progress').classList.remove('break');
        this.pomUpdateDisplay();
    }

    pomSkip() {
        this.pomComplete();
    }

    pomUpdateDisplay() {
        const m = Math.floor(this.pom.remaining / 60).toString().padStart(2, '0');
        const s = (this.pom.remaining % 60).toString().padStart(2, '0');
        this.$('pomodoro-time').textContent = `${m}:${s}`;

        const total = this.pom.isBreak
            ? (this.pom.sessions % 4 === 0 ? this.pom.longBreak : this.pom.breakDuration)
            : this.pom.duration;
        const pct = ((total - this.pom.remaining) / total) * 100;
        this.$('pom-progress').style.width = `${pct}%`;

        // Update page title with timer
        document.title = this.pom.isRunning
            ? `${this.$('pomodoro-time').textContent} — Focus`
            : 'Focus — ADHD AI Assistant';
    }

    // ──────────────────────────────────────────────────
    // QUICK TASKS (NEW FEATURE)
    // ──────────────────────────────────────────────────

    initTasks() {
        try {
            this.tasks = JSON.parse(localStorage.getItem('focus_tasks') || '[]');
        } catch { this.tasks = []; }

        this.$('add-task-btn').addEventListener('click', () => this.openTaskModal());
        this.$('task-modal-close').addEventListener('click', () => this.closeTaskModal());
        this.$('task-modal-cancel').addEventListener('click', () => this.closeTaskModal());
        this.$('task-modal-save').addEventListener('click', () => this.saveTask());
        this.$('task-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveTask();
        });

        this.renderTasks();
    }

    openTaskModal() {
        this.$('task-modal').classList.remove('hidden');
        setTimeout(() => this.$('task-input').focus(), 50);
    }

    closeTaskModal() {
        this.$('task-modal').classList.add('hidden');
        this.$('task-input').value = '';
    }

    saveTask() {
        const text = this.$('task-input').value.trim();
        if (!text) return;
        this.tasks.push({ id: Date.now(), text, done: false });
        this.persistTasks();
        this.renderTasks();
        this.closeTaskModal();
        this.showToast('Task added!', 'success');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) task.done = !task.done;
        this.persistTasks();
        this.renderTasks();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.persistTasks();
        this.renderTasks();
    }

    persistTasks() {
        localStorage.setItem('focus_tasks', JSON.stringify(this.tasks));
    }

    renderTasks() {
        const list = this.$('task-list');
        list.innerHTML = '';

        if (!this.tasks.length) {
            list.innerHTML = '<div class="task-empty">No tasks yet. Add one above!</div>';
            return;
        }

        this.tasks.forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-item';
            el.innerHTML = `
                <div class="task-check ${task.done ? 'done' : ''}" data-id="${task.id}" title="Mark complete"></div>
                <span class="task-text ${task.done ? 'done' : ''}">${this.escapeHtmlSimple(task.text)}</span>
                <button class="task-delete" data-id="${task.id}" title="Delete">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
            el.querySelector('.task-check').addEventListener('click', () => this.toggleTask(task.id));
            el.querySelector('.task-delete').addEventListener('click', () => this.deleteTask(task.id));
            list.appendChild(el);
        });
    }

    escapeHtmlSimple(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

// ── Boot ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FocusApp();
});
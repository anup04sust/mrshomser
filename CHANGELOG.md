# Changelog

All notable changes to Mr Shomser will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Voice AI integration
- Document understanding
- Export conversations
- Advanced dark mode
- Rate limiting for APIs

---

## [0.2.0] - 2026-03-23

### Added
- **User Authentication** - JWT-based login and registration system
- **User Management** - Profile with username display in sidebar
- **Logout Functionality** - Secure session termination
- **API Endpoints** - `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Password Security** - bcrypt hashing for passwords
- **Session Persistence** - 30-day JWT tokens with HTTP-only cookies
- **User Avatar** - Pencil icon for user messages
- **Chat Bubble Icon** - Custom SVG for assistant messages
- **Comprehensive Documentation** - DOCUMENTATION.md, API.md, INSTALL.md
- **Environment Example** - .env.example file for easy setup
- **License** - MIT License added
- **Enhanced .gitignore** - Better coverage of DDEV, IDE, and temp files

### Changed
- Header tagline - Now shows "Your AI Companion" instead of username
- Sidebar - Dynamic login/logout button based on auth state
- Authentication flow - Now uses API instead of localStorage only
- MongoDB schema - Added users collection

### Fixed
- Ollama connectivity - Moved Ollama into project Docker network
- Nginx timeouts - Increased to 300s for LLM streaming responses
- Chat API - Now properly streams responses from Ollama

### Security
- Added JWT authentication
- HTTP-only cookies prevent XSS attacks
- Password hashing with bcrypt (10 rounds)
- Secure cookie settings for production

---

## [0.1.0] - 2026-03-22

### Added
- **Initial Release** - Basic chat interface with local LLM
- **Next.js 16** - Modern React framework
- **Ollama Integration** - Local AI model support (qwen3.5:4b)
- **MongoDB Storage** - Persistent chat history
- **Chat Interface** - Real-time streaming responses
- **Multi-chat Support** - Multiple conversation threads
- **Markdown Support** - Code blocks, formatting, syntax highlighting
- **English Support** - English mixed responses
- **DDEV Setup** - Complete development environment
- **Sidebar** - Chat history and navigation
- **Guest Mode** - Try without registration
- **Dark Mode** - Initial theme support
- **Mobile Responsive** - Works on all screen sizes

### Technical
- Next.js API Routes for backend
- Server-Sent Events (SSE) for streaming
- MongoDB for data persistence
- TailwindCSS for styling
- TypeScript for type safety
- DDEV + Docker for development

---

## Version History

- **0.2.0** - User authentication and comprehensive documentation
- **0.1.0** - Initial release with basic chat functionality

---

## Migration Guides

### Upgrading from 0.1.0 to 0.2.0

1. **Install new dependencies:**
   ```bash
   ddev exec pnpm install
   ```

2. **Add JWT secret to .env.local:**
   ```env
   JWT_SECRET=your-generated-secret-here
   ```

3. **Restart DDEV:**
   ```bash
   ddev restart
   ```

4. **Existing chats** will remain in guest mode. Users need to register to link chats to accounts.

---

## Breaking Changes

### 0.2.0
- None - Backwards compatible with 0.1.0

---

*For full details, see commits on GitHub: https://github.com/yourusername/mrshomser/commits*

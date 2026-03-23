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

## [1.0.0] - 2026-03-23

### 🎉 Major Release - Production Ready

This release marks the first stable version of Mr Shomser with comprehensive features, documentation, and optimizations.

### Added
- **DevDoc Page** - Comprehensive developer documentation at `/devdoc` with tech stack, API reference, setup guide
- **About Page** - Project information and mission at `/about`
- **Contact Page** - Developer contact information at `/contact`
- **Privacy Policy** - Privacy policy page at `/privacy`
- **Terms & Conditions** - Terms of service at `/terms`
- **OffcanvasMenu Component** - Right sidebar navigation menu with DevDoc, About, Contact, Privacy, Terms
- **Environment Template** - `.env.example` file for easier project setup
- **Test Scripts** - Chat testing scripts for development and debugging
- **Documentation Files** - `BANGLA_REMOVAL_SUMMARY.md`, `LOGOUT_FIX.md`, complete troubleshooting guides

### Changed
- **Branding Update** - Consistent "Mr Shomser" branding throughout (was: mrSomsher/Somsher)
- **AI Model** - Switched to `phi3:mini` (2.3GB, English-optimized) from `qwen3.5:4b`
- **Language Support** - Removed all Bengali/Bangla content, now English-only for better quality
- **README Overhaul** - Complete rewrite with comprehensive DDEV setup, troubleshooting, features
- **Menu Structure** - Replaced "Home" with "DevDoc" in right sidebar menu
- **System Prompt** - Updated to English-only confident assistant personality
- **Documentation** - Updated all docs (API.md, DOCUMENTATION.md, INSTALL.md, CONTRIBUTING.md)
- **Logout Flow** - Enhanced to clear both cookies, localStorage, and force page reload

### Fixed
- **Logout Bug** - Now properly clears session cookies and chat history
- **Cookie Management** - Explicit `maxAge=0` for proper cookie deletion
- **Session Persistence** - Guest sessions properly isolated with 30-day expiry
- **Branding Consistency** - Fixed all instances of incorrect brand name

### Improved
- **Performance** - Optimized for phi3:mini (10-15s response times on CPU)
- **Developer Experience** - Complete DDEV setup guide with all commands
- **Error Handling** - Better error messages and troubleshooting documentation
- **Code Quality** - Consistent TypeScript types, proper linting

### Removed
- All Bengali/Bangla text from UI components
- Bilingual placeholders and system prompts
- Bangladesh-specific references
- Unnecessary language switching features

### Documentation
- 📖 Complete README with project overview, setup, troubleshooting
- 💻 DevDoc page with technical reference
- 🔌 API documentation with endpoint details
- 📚 Installation guide with DDEV workflow
- 🐛 Troubleshooting guide for common issues

### Technical Highlights
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Ollama (phi3:mini), MongoDB
- **Development**: DDEV, Docker, pnpm
- **Features**: Streaming AI chat, multi-chat support, JWT auth, guest sessions
- **Performance**: 2.3GB model, 512 token limit, SSE streaming

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

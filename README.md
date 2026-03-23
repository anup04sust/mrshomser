# 🤖 Mr Shomser - AI Assistant

> A self-hosted AI chat assistant powered by local LLMs, built with Next.js 16 and Ollama

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Ollama](https://img.shields.io/badge/Ollama-phi3:mini-purple?style=flat)](https://ollama.ai/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![DDEV](https://img.shields.io/badge/DDEV-Docker-blue?style=flat&logo=docker)](https://ddev.com/)

---

## 📖 Overview

**Mr Shomser** is a privacy-first, self-hosted AI assistant that provides intelligent chat responses using local LLM inference. No data leaves your server - all AI processing happens on your machine using Ollama.

### Key Features

✅ **Real-time AI Chat** - Streaming responses using Server-Sent Events (SSE)  
✅ **Chat Persistence** - MongoDB-backed conversation history  
✅ **User Authentication** - JWT-based auth with guest sessions  
✅ **Multi-chat Support** - Multiple conversation threads  
✅ **Markdown Rendering** - Code blocks, formatting, syntax highlighting  
✅ **Dark Mode** - Full dark theme support  
✅ **Mobile Responsive** - Works seamlessly on all devices  
✅ **Privacy-First** - 100% self-hosted, no external API calls  
✅ **Fast Performance** - Optimized phi3:mini model (10-15s response time)

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Markdown** - Message rendering with code highlighting

### Backend
- **Next.js API Routes** - Serverless-style API endpoints
- **Ollama** - Local LLM inference engine (phi3:mini - 2.3GB)
- **MongoDB** - NoSQL database for chat persistence
- **JWT** - Secure authentication tokens

### Development
- **DDEV** - Docker-based local development environment
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting and formatting

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have these installed:

- [DDEV](https://ddev.com/get-started/) (v1.22+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- [pnpm](https://pnpm.io/installation) (v8+) - Optional, DDEV includes it

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mrshomser
   ```

2. **Start DDEV environment**
   ```bash
   ddev start
   ```
   
   This will:
   - Create Docker containers (web, db, ollama)
   - Set up nginx, MongoDB, and Ollama
   - Configure networking and SSL certificates

3. **Install dependencies**
   ```bash
   ddev exec pnpm install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` if needed (default values work with DDEV):
   ```env
   OLLAMA_API_URL=http://ollama:11434
   OLLAMA_MODEL=phi3:mini
   MONGODB_URI=mongodb://db:db@mongo:27017/mrshomser?authSource=admin
   MONGODB_DB=mrshomser
   NEXT_PUBLIC_APP_NAME=Mr Shomser
   JWT_SECRET=your-secret-key-change-in-production
   ```

5. **Pull the AI model**
   ```bash
   ddev exec -s ollama "ollama pull phi3:mini"
   ```
   
   This downloads the phi3:mini model (~2.3GB). Wait for completion.

6. **Start the development server**
   ```bash
   ddev exec pnpm dev --hostname 0.0.0.0
   ```
   
   Or run in background:
   ```bash
   ddev exec "pnpm dev --hostname 0.0.0.0 > /tmp/nextjs.log 2>&1 &"
   ```

7. **Access the application**
   
   Open your browser and visit:
   - **Primary URL:** https://mrshomser.ddev.site
   - **Alternative:** http://mrshomser.ddev.site:33000

---

## 🔧 DDEV Commands

### Essential Commands

```bash
# Start the project
ddev start

# Stop the project
ddev stop

# Restart the project
ddev restart

# View logs
ddev logs
ddev logs -f  # Follow logs

# Execute commands inside container
ddev exec <command>

# SSH into web container
ddev ssh

# View project info
ddev describe

# Destroy project (removes containers, keeps code)
ddev delete

# Completely remove including database
ddev delete --omit-snapshot
```

### Development Workflow

```bash
# Install packages
ddev exec pnpm install <package-name>

# Run Next.js commands
ddev exec pnpm build
ddev exec pnpm dev
ddev exec pnpm lint

# Database operations
ddev exec mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin

# Check Ollama models
ddev exec -s ollama "ollama list"

# Pull different model
ddev exec -s ollama "ollama pull <model-name>"

# Monitor Next.js logs
ddev exec tail -f /tmp/nextjs.log
```

---

## 📁 Project Structure

```
mrshomser/
├── .ddev/                  # DDEV configuration
│   ├── config.yaml         # Main DDEV config
│   └── nginx_full/         # Nginx configuration
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── chat/         # Chat streaming endpoint
│   │   └── chats/        # Chat management
│   ├── components/       # React components
│   │   ├── ChatInterface.tsx
│   │   ├── Sidebar.tsx
│   │   ├── AuthModal.tsx
│   │   └── OffcanvasMenu.tsx
│   ├── lib/              # Utility libraries
│   │   ├── mongodb.ts    # MongoDB connection
│   │   └── session.ts    # Session management
│   ├── types/            # TypeScript types
│   ├── about/            # About page
│   ├── contact/          # Contact page
│   ├── devdoc/           # Developer documentation
│   ├── privacy/          # Privacy policy
│   ├── terms/            # Terms & conditions
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── public/               # Static assets
├── .env.local           # Environment variables (gitignored)
├── .env.example         # Example environment file
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.ts   # Tailwind configuration
└── next.config.ts       # Next.js configuration
```

---

## 🌐 Available Pages

| URL | Description |
|-----|-------------|
| `/` | Main chat interface |
| `/about` | Project information |
| `/devdoc` | Developer documentation |
| `/contact` | Contact information |
| `/privacy` | Privacy policy |
| `/terms` | Terms & conditions |

---

## 🔌 API Endpoints

### Chat API
- `POST /api/chat` - Stream AI responses (SSE)

### Chat Management
- `GET /api/chats` - Get all chats for session
- `POST /api/chats` - Create new chat
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout (clear session)
- `GET /api/auth/me` - Get current user

📚 **Full API documentation:** Visit `/devdoc` or see [API.md](API.md)

---

## 🎨 Features in Detail

### AI Chat Streaming
- Real-time response streaming using Server-Sent Events
- Truncation detection when token limit is reached
- "Continue Response" button for incomplete answers
- Markdown rendering with code syntax highlighting

### Chat Management
- Multiple conversation threads
- Auto-generated chat titles from first message
- Delete individual chats
- Create new chat at any time
- Session-based isolation (guest or authenticated)

### Authentication
- Guest sessions (no account needed)
- User registration and login
- JWT token-based authentication
- Secure password hashing with bcrypt
- Session persistence for 30 days

### User Interface
- Clean, modern design with Tailwind CSS
- Dark mode support
- Mobile-responsive offcanvas navigation
- Real-time typing indicators
- Copy message functionality
- Smooth animations and transitions

---

## 🔧 Configuration

### Changing AI Model

Edit `.env.local`:
```env
OLLAMA_MODEL=phi3:mini  # Current model (fast, good quality)
# OLLAMA_MODEL=llama2   # Alternative: Llama 2
# OLLAMA_MODEL=mistral  # Alternative: Mistral
```

Pull the model:
```bash
ddev exec -s ollama "ollama pull <model-name>"
```

Restart the app:
```bash
ddev exec pkill -f next-server
ddev exec pnpm dev --hostname 0.0.0.0
```

### Model Recommendations

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| `phi3:mini` | 2.3GB | Fast | Good | ✅ Recommended for CPU |
| `tinyllama:1.1b` | 637MB | Very Fast | Fair | Testing only |
| `llama2` | 3.8GB | Slow | Excellent | GPU recommended |
| `mistral` | 4.1GB | Slow | Excellent | GPU recommended |

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
ddev stop
ddev start
```

### Next.js Not Starting
```bash
# Check if running
ddev exec "ps aux | grep next"

# Kill and restart
ddev exec pkill -f next-server
ddev exec pnpm dev --hostname 0.0.0.0
```

### Ollama Model Not Found
```bash
# Check available models
ddev exec -s ollama "ollama list"

# Pull the model
ddev exec -s ollama "ollama pull phi3:mini"
```

### Database Connection Error
```bash
# Check MongoDB is running
ddev exec mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --eval "db.serverStatus()"

# Restart DDEV
ddev restart
```

### Clear Chat History
```bash
# Clear all chats
ddev exec mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin \
  --eval "db.chats.deleteMany({})"
```

---

## 📚 Documentation

- 📖 [Full Documentation](DOCUMENTATION.md) - Complete guide
- 🚀 [Installation Guide](INSTALL.md) - Detailed setup
- 🔌 [API Reference](API.md) - API endpoints
- 💻 [Developer Docs](https://mrshomser.ddev.site/devdoc) - Technical details
- 📝 [Contributing](CONTRIBUTING.md) - How to contribute
- 📋 [Changelog](CHANGELOG.md) - Version history

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Anup Biswas**  
Technical Lead & Solution Architect  
14+ years experience in enterprise web applications

- 💼 [LinkedIn](https://linkedin.com/in/anup-biswas)
- 🐙 [GitHub](https://github.com/anupbiswas)
- 🌐 [Drupal.org](https://drupal.org/u/anup-biswas)
- 📧 [Email](mailto:anup.cse7@gmail.com)

---

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - Local LLM inference
- [Next.js](https://nextjs.org/) - React framework
- [DDEV](https://ddev.com/) - Development environment
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## ⭐ Show Your Support

If you find this project helpful, please give it a ⭐️ on GitHub!

---

**Built with ❤️ using Next.js, Ollama, and DDEV**


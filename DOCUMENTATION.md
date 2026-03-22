# mrSomsher Documentation

Complete documentation for mrSomsher (সবজান্তা শমসের) - A self-hosted AI assistant.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites

- **DDEV** (v1.25.1+)
- **Docker** & **Docker Compose**
- **Node.js** 20+
- **pnpm** (recommended) or npm
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mrshomser.git
   cd mrshomser
   ```

2. **Start DDEV**
   ```bash
   ddev start
   ```

3. **Install dependencies**
   ```bash
   ddev exec pnpm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

5. **Pull Ollama model**
   ```bash
   ddev exec -s ollama "ollama pull qwen3.5:4b"
   ```

6. **Access the application**
   - Main site: https://mrshomser.ddev.site
   - Next.js dev: https://mrshomser.ddev.site:3001

---

## Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Ollama Configuration
OLLAMA_API_URL=http://ollama:11434
OLLAMA_MODEL=qwen3.5:4b

# MongoDB Configuration
MONGODB_URI=mongodb://db:db@mongo:27017/mrshomser?authSource=admin
MONGODB_DB=mrshomser

# App Configuration
NEXT_PUBLIC_APP_NAME=mrSomsher

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456
```

### DDEV Services

The project includes several Docker services:

- **web** - Next.js application (Node.js 20)
- **mongo** - MongoDB database
- **ollama** - Ollama LLM runtime
- **ddev-router** - Traefik reverse proxy

---

## API Reference

### Base URL

```
https://mrshomser.ddev.site/api
```

### Authentication Endpoints

#### Register User

**POST** `/api/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - User already exists
- `500` - Server error

---

#### Login

**POST** `/api/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Sets HTTP-only cookie:** `auth_token` (JWT, 30-day expiration)

**Error Responses:**
- `400` - Missing credentials
- `401` - Invalid credentials
- `500` - Server error

---

#### Logout

**POST** `/api/auth/logout`

Logs out the current user by clearing the auth token.

**Response (200):**
```json
{
  "success": true
}
```

---

#### Get Current User

**GET** `/api/auth/me`

Returns the currently authenticated user.

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Response (401 - Not Authenticated):**
```json
{
  "user": null
}
```

---

### Chat Endpoints

#### Send Chat Message

**POST** `/api/chat`

Sends a message to the AI and receives a streaming response.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": true
}
```

**Response (Streaming):**

Content-Type: `text/event-stream`

```
data: {"content":"Hello"}

data: {"content":"!"}

data: {"content":" How"}

data: [DONE]
```

**Non-Streaming Response (stream: false):**
```json
{
  "message": {
    "role": "assistant",
    "content": "Hello! I'm doing well, thanks for asking..."
  },
  "model": "qwen3.5:4b"
}
```

**Error Responses:**
- `400` - Invalid message format
- `500` - LLM error

---

#### Get All Chats

**GET** `/api/chats`

Retrieves all chat sessions for the current user.

**Response (200):**
```json
{
  "chats": [
    {
      "id": "chat_123456",
      "title": "Hello conversation",
      "messages": [
        {
          "id": "msg_1",
          "role": "user",
          "content": "Hello",
          "timestamp": 1710000000000
        },
        {
          "id": "msg_2",
          "role": "assistant",
          "content": "Hi there!",
          "timestamp": 1710000001000
        }
      ],
      "createdAt": 1710000000000,
      "updatedAt": 1710000001000
    }
  ]
}
```

---

#### Create New Chat

**POST** `/api/chats`

Creates a new chat session.

**Request Body:**
```json
{
  "title": "New Chat",
  "messages": []
}
```

**Response (200):**
```json
{
  "chat": {
    "id": "chat_789012",
    "title": "New Chat",
    "messages": [],
    "createdAt": 1710000000000,
    "updatedAt": 1710000000000
  }
}
```

---

#### Update Chat

**PUT** `/api/chats/[id]`

Updates an existing chat session.

**Request Body:**
```json
{
  "title": "Updated Title",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "Hello",
      "timestamp": 1710000000000
    }
  ]
}
```

**Response (200):**
```json
{
  "chat": {
    "id": "chat_123456",
    "title": "Updated Title",
    "messages": [...],
    "updatedAt": 1710000002000
  }
}
```

---

#### Delete Chat

**DELETE** `/api/chats/[id]`

Deletes a chat session.

**Response (200):**
```json
{
  "success": true
}
```

---

## Usage Guide

### Basic Usage

1. **Access the app** at https://mrshomser.ddev.site
2. **Create an account** or use as guest
3. **Start chatting** by typing a message
4. **View history** in the sidebar
5. **Create new chats** with the "New Chat" button

### Features

#### Chat Interface
- **Streaming responses** - Real-time AI responses
- **Markdown support** - Code blocks, lists, formatting
- **Chat history** - Persistent conversation storage
- **Multi-chat** - Multiple conversation threads

#### Authentication
- **JWT-based** - Secure token authentication
- **HTTP-only cookies** - XSS protection
- **30-day sessions** - Long-lasting login
- **Guest mode** - Try without registration

#### AI Personality
- **Bangla + English** - Bilingual support
- **Context-aware** - Bangladesh-specific knowledge
- **Confident tone** - Helpful but not boring
- **Practical focus** - Real-world solutions

---

## Development

### Project Structure

```
mrshomser/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── chat/        # Chat streaming endpoint
│   │   └── chats/       # Chat CRUD operations
│   ├── components/       # React components
│   │   ├── AuthModal.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── MarkdownMessage.tsx
│   │   └── Sidebar.tsx
│   ├── lib/             # Utilities
│   │   ├── mongodb.ts
│   │   └── session.ts
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── public/              # Static assets
├── .ddev/              # DDEV configuration
│   ├── docker-compose.mongo.yaml
│   ├── docker-compose.ollama.yaml
│   └── nginx/          # Nginx config
├── .env.local          # Environment variables
└── package.json        # Dependencies
```

### Tech Stack

- **Frontend:** Next.js 16, React 19, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **AI:** Ollama (qwen3.5:4b)
- **Auth:** JWT + bcrypt
- **Dev Environment:** DDEV + Docker

### Development Commands

```bash
# Start development server
ddev exec pnpm dev

# Build for production
ddev exec pnpm build

# Run production build
ddev exec pnpm start

# Type check
ddev exec pnpm type-check

# Lint
ddev exec pnpm lint

# Access MongoDB
ddev mongodb

# View logs
ddev logs -f

# Restart services
ddev restart

# Stop services
ddev stop
```

### Adding New AI Models

1. **Pull the model:**
   ```bash
   ddev exec -s ollama "ollama pull modelname:tag"
   ```

2. **Update environment:**
   ```env
   OLLAMA_MODEL=modelname:tag
   ```

3. **Restart the app:**
   ```bash
   ddev restart
   ```

---

## Troubleshooting

### Common Issues

#### 1. Port Conflicts

**Issue:** Port 80 or other ports already in use

**Solution:**
```bash
# Check what's using the port
sudo lsof -i :80

# Stop DDEV and restart
ddev stop
ddev start
```

---

#### 2. Ollama Not Responding

**Issue:** Chat API returns 504 or timeouts

**Solution:**
```bash
# Check Ollama is running
ddev exec curl http://ollama:11434/api/tags

# Restart Ollama
ddev restart

# Check logs
ddev logs -s ollama
```

---

#### 3. MongoDB Connection Failed

**Issue:** Can't connect to database

**Solution:**
```bash
# Verify MongoDB is running
ddev describe

# Check connection string
cat .env.local | grep MONGODB_URI

# Restart MongoDB
ddev restart
```

---

#### 4. Authentication Not Working

**Issue:** Login/register fails

**Solution:**
```bash
# Check JWT_SECRET is set
cat .env.local | grep JWT_SECRET

# Clear cookies and try again
# Or use incognito mode

# Check API logs
ddev logs -f web
```

---

#### 5. Next.js Build Errors

**Issue:** Dependencies or build failures

**Solution:**
```bash
# Clean install
ddev exec rm -rf node_modules .next
ddev exec pnpm install
ddev exec pnpm build

# Clear cache
ddev exec pnpm store prune
```

---

### Debug Mode

Enable verbose logging:

```bash
# View all logs
ddev logs -f

# View web container logs only
ddev logs -f -s web

# View specific service
ddev logs -f -s ollama
```

---

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  name: String,
  password: String (bcrypt hashed),
  createdAt: Number (timestamp),
  updatedAt: Number (timestamp)
}
```

### Chats Collection

```javascript
{
  _id: ObjectId,
  sessionId: String (user session ID),
  title: String,
  messages: [
    {
      id: String,
      role: String ("user" | "assistant"),
      content: String,
      timestamp: Number
    }
  ],
  createdAt: Number,
  updatedAt: Number
}
```

---

## Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Regular updates** - Keep dependencies updated
4. **Strong passwords** - Enforce minimum 6 characters
5. **Rate limiting** - Consider adding rate limits to APIs
6. **Input validation** - Sanitize user inputs
7. **Secure cookies** - HTTP-only, SameSite, Secure flags

---

## Performance Optimization

### Tips

1. **Model Selection** - Use smaller models for faster responses
2. **Streaming** - Always use streaming for better UX
3. **Database Indexes** - Add indexes for sessionId, email
4. **Caching** - Cache static assets
5. **CDN** - Use CDN for production

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## Support

- **Issues:** https://github.com/yourusername/mrshomser/issues
- **Email:** support@dreamsteps.io
- **Docs:** https://mrshomser.ddev.site/docs

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Ollama** - Local LLM runtime
- **Next.js** - React framework
- **DDEV** - Development environment
- **MongoDB** - Database
- **Community** - All contributors

---

*Documentation last updated: March 23, 2026*

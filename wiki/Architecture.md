# Architecture

Technical overview of Mr Shomser's system architecture and design decisions.

---

## 🏗️ System Overview

Mr Shomser is built as a modern full-stack application using Next.js 16 with a focus on privacy, performance, and developer experience.

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React Components (Next.js 16 App Router)        │  │
│  │  • ChatInterface  • Sidebar  • AuthModal         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS / WebSocket (SSE)
┌─────────────────────▼───────────────────────────────────┐
│                   WEB SERVER (nginx)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Next.js Server (Node.js 20)                     │  │
│  │  • API Routes  • Server Components  • SSR        │  │
│  └──────────────────────────────────────────────────┘  │
└────────┬────────────────────────┬────────────────────────┘
         │                        │
    ┌────▼────┐              ┌────▼────┐
    │ MongoDB │              │ Ollama  │
    │ Database│              │ phi3:mini│
    └─────────┘              └─────────┘
```

---

## 📦 Component Architecture

### Frontend Layer

#### 1. **app/page.tsx** - Home Page
- Entry point of the application
- Renders ChatInterface component
- Server-side rendered

#### 2. **app/components/ChatInterface.tsx**
- Main chat UI component
- Manages chat state and messages
- Handles SSE streaming
- Integrates Sidebar and AuthModal

**Key Responsibilities:**
- Message state management
- API communication
- Real-time streaming
- User authentication state

```typescript
// State Management
const [chats, setChats] = useState<Chat[]>([]);
const [currentChatId, setCurrentChatId] = useState<string | null>(null);
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [userName, setUserName] = useState<string | null>(null);
```

#### 3. **app/components/Sidebar.tsx**
- Chat history navigation
- New chat creation
- Delete chat functionality
- Login/logout buttons

#### 4. **app/components/AuthModal.tsx**
- Login form
- Registration form
- Input validation
- Error handling

#### 5. **app/components/OffcanvasMenu.tsx**
- Right sidebar navigation
- Links to About, DevDoc, Contact, etc.
- Mobile-responsive

#### 6. **app/components/MarkdownMessage.tsx**
- Renders AI responses with markdown
- Syntax highlighting for code blocks
- Copy functionality
- Uses react-markdown + react-syntax-highlighter

---

### Backend Layer

#### API Routes (app/api/)

**1. Chat API** - `/api/chat/route.ts`
```typescript
POST /api/chat
├─ Validate session
├─ Extract user message
├─ Build context from chat history
├─ Stream to Ollama (POST /api/generate)
├─ Return SSE response
└─ Save to MongoDB
```

**Flow:**
1. Receive message + chatId
2. Fetch chat history from MongoDB
3. Build conversation context
4. Forward to Ollama with streaming
5. Stream chunks back to client via SSE
6. Update MongoDB with complete response

**2. Chat Management** - `/api/chats/route.ts`
```typescript
GET /api/chats        → List all chats
POST /api/chats       → Create new chat
GET /api/chats/:id    → Get specific chat
PUT /api/chats/:id    → Update chat
DELETE /api/chats/:id → Delete chat
```

**3. Authentication** - `/api/auth/`
```typescript
POST /api/auth/register → Create user
POST /api/auth/login    → Authenticate user
POST /api/auth/logout   → Clear session
GET /api/auth/me        → Get current user
```

---

### Data Layer

#### MongoDB Collections

**1. users**
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,          // Unique index
  password: String,       // bcrypt hashed
  createdAt: Date,
  updatedAt: Date
}
```

**2. chats**
```javascript
{
  _id: ObjectId,
  sessionId: String,      // JWT token or guest session
  title: String,          // Auto-generated from first message
  messages: [
    {
      role: 'user' | 'assistant',
      content: String,
      timestamp: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `users.email` - Unique
- `chats.sessionId` - For fast session queries

---

### AI Layer (Ollama)

#### Model Configuration
```javascript
{
  model: 'phi3:mini',
  stream: true,
  options: {
    num_ctx: 2048,        // Context window
    num_predict: 512,     // Max tokens per response
    temperature: 0.7,     // Creativity (0-1)
    top_p: 0.9,          // Nucleus sampling
    top_k: 40            // Top-k sampling
  }
}
```

#### Ollama API Communication
```
Client → Next.js API → Ollama Container
                      ↓
                POST /api/generate
                {
                  "model": "phi3:mini",
                  "prompt": "...",
                  "stream": true,
                  "system": "You are Mr. Shomser..."
                }
                      ↓
                Streaming Response
                {"response": "chunk1"}
                {"response": "chunk2"}
                {"done": false}
                {"done": true}
```

---

## 🔐 Authentication Flow

### Registration Flow
```
1. User submits form (username, email, password)
2. Backend validates input
3. Check if user exists (email unique)
4. Hash password with bcrypt (10 rounds)
5. Save to MongoDB users collection
6. Generate JWT token (30-day expiry)
7. Set httpOnly cookie
8. Return user data
```

### Login Flow
```
1. User submits credentials (email, password)
2. Find user by email in MongoDB
3. Compare password with bcrypt
4. Generate JWT token
5. Set httpOnly cookie
6. Return user data
```

### Session Management
```
Guest Session:
└─ Generate UUID on first visit
   └─ Store in cookie (mrshomser_session)
      └─ Valid for 30 days

Authenticated Session:
└─ Login/Register
   └─ Generate JWT with user ID
      └─ Store in auth_token cookie (httpOnly)
         └─ Valid for 30 days
```

---

## 🔄 Real-time Streaming (SSE)

### Server-Sent Events Flow

```javascript
// Client (ChatInterface.tsx)
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message, chatId })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  
  // Process chunks
  const text = decoder.decode(value);
  // Parse SSE format: "data: {...}\n\n"
}

// Server (api/chat/route.ts)
const stream = new ReadableStream({
  async start(controller) {
    // Forward Ollama stream to client
    for await (const chunk of ollamaResponse) {
      controller.enqueue(
        `data: ${JSON.stringify({ chunk })}\n\n`
      );
    }
    controller.close();
  }
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  }
});
```

---

## 🐳 Docker Architecture (DDEV)

### Container Structure

```
mrshomser_project/
├─ web (nginx + Next.js)
│  ├─ nginx: Port 443 (HTTPS), 80 (HTTP)
│  ├─ Next.js: Port 3000
│  └─ Node: v20
│
├─ db (MongoDB)
│  ├─ Port: 27017
│  ├─ Database: mrshomser
│  └─ Auth: db:db@mongo
│
└─ ollama (AI Service)
   ├─ Port: 11434
   ├─ Model: phi3:mini (2.3GB)
   └─ API: http://ollama:11434
```

### Network Communication

All containers share a Docker network:
```
web container:
  → MongoDB: mongodb://db:db@mongo:27017
  → Ollama: http://ollama:11434

Client browser:
  → Web: https://mrshomser.ddev.site
           ↓
        nginx (reverse proxy)
           ↓
        Next.js (port 3000)
```

---

## 📂 File Structure

```
mrshomser/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── me/route.ts
│   │   ├── chat/route.ts         # Chat streaming
│   │   └── chats/                # Chat CRUD
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── components/               # React Components
│   │   ├── ChatInterface.tsx     # Main chat UI
│   │   ├── Sidebar.tsx           # Chat history
│   │   ├── AuthModal.tsx         # Login/Register
│   │   ├── OffcanvasMenu.tsx     # Navigation
│   │   └── MarkdownMessage.tsx   # Message renderer
│   ├── lib/                      # Utilities
│   │   ├── mongodb.ts            # DB connection
│   │   └── session.ts            # Session helpers
│   ├── types/                    # TypeScript types
│   │   └── chat.ts
│   ├── utils/                    # Helper functions
│   │   └── chatStorage.ts
│   ├── about/page.tsx            # About page
│   ├── devdoc/page.tsx           # Developer docs
│   ├── contact/page.tsx          # Contact page
│   ├── privacy/page.tsx          # Privacy policy
│   ├── terms/page.tsx            # Terms of service
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── .ddev/                        # DDEV configuration
│   ├── config.yaml               # Main config
│   └── nginx_full/               # Nginx config
├── public/                       # Static assets
├── wiki/                         # Wiki pages
├── .env.local                    # Environment vars
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
└── next.config.ts                # Next.js config
```

---

## 🔧 Key Design Decisions

### 1. Why Next.js 16 App Router?
- **Server Components** - Better performance
- **API Routes** - Serverless-style endpoints
- **SSR/SSG** - SEO-friendly
- **File-based routing** - Intuitive structure

### 2. Why Ollama?
- **Local inference** - Complete privacy
- **Easy setup** - One command to pull models
- **Model flexibility** - Switch models easily
- **No API costs** - Free forever

### 3. Why MongoDB?
- **Flexible schema** - Easy to evolve
- **JSON-like documents** - Natural for JS
- **Good performance** - Fast queries
- **Easy replication** - Scalable

### 4. Why SSE over WebSocket?
- **Simpler implementation** - HTTP-based
- **Better for one-way streaming** - AI responses
- **Auto-reconnect** - Built into browsers
- **Firewall friendly** - Works everywhere

### 5. Why JWT for Auth?
- **Stateless** - No server-side session store
- **Scalable** - Works with multiple servers
- **Standard** - Well-understood
- **Secure** - HttpOnly cookies prevent XSS

---

## 🚀 Performance Optimizations

### 1. Streaming Response
- Chunks sent as generated (no buffering)
- User sees response immediately
- Lower perceived latency

### 2. Client-side Caching
- Chat list cached in React state
- Reduces API calls
- Faster navigation

### 3. Optimized Model
- phi3:mini (2.3GB) - Small, fast
- 512 token limit - Quick responses
- CPU-optimized - No GPU needed

### 4. Database Indexing
- Email unique index - Fast login
- SessionId index - Fast chat queries

---

## 🔒 Security Considerations

### 1. Authentication
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens in httpOnly cookies
- ✅ CSRF protection via SameSite
- ✅ Secure cookies in production

### 2. Data Privacy
- ✅ All AI processing local
- ✅ No external API calls
- ✅ Session isolation
- ✅ User data encrypted at rest

### 3. Input Validation
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ XSS prevention (React escaping)
- ✅ SQL injection prevention (MongoDB)

---

## 📈 Scalability

### Current Limitations
- Single-server architecture
- No load balancing
- Local storage only

### Scaling Options

**Horizontal Scaling:**
1. Multiple Next.js instances behind load balancer
2. Shared MongoDB cluster (replica set)
3. Distributed Ollama instances

**Vertical Scaling:**
1. More CPU cores - Faster inference
2. More RAM - Larger models
3. GPU - 10x faster inference

**Database Scaling:**
1. MongoDB sharding for large datasets
2. Read replicas for high traffic
3. Redis cache for frequent queries

---

## 📚 Related Documentation

- [API Reference](API-Reference) - Complete API docs
- [Database Schema](Database-Schema) - MongoDB structure
- [Security Best Practices](Security-Best-Practices) - Hardening guide
- [Performance Tuning](Performance-Tuning) - Optimization tips

---

**Questions? Open an [issue on GitHub](https://github.com/anup04sust/mrshomser/issues)**

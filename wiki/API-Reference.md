# API Reference

Complete reference for all API endpoints in Mr Shomser.

---

## 📚 Table of Contents

- [Authentication](#authentication)
- [Chat API](#chat-api)
- [Chat Management](#chat-management)
- [User Management](#user-management)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

All authenticated endpoints require a JWT token in cookies.

### Token Types

1. **auth_token** - User authentication token (30 days)
2. **mrshomser_session** - Session identifier for guest users (30 days)

### Headers

```http
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2026-03-24T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Invalid input (missing fields, weak password)
- `409` - User already exists
- `500` - Server error

**Validation Rules:**
- Username: 3-20 characters, alphanumeric + underscore
- Email: Valid email format
- Password: Minimum 8 characters, at least one uppercase, one lowercase, one number

---

### POST /api/auth/login

Login with existing credentials.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

**Security:**
- Password is hashed with bcrypt (10 rounds)
- Token expires in 30 days
- HttpOnly cookie prevents XSS attacks

---

### POST /api/auth/logout

Logout and clear session.

**Request:**
```http
POST /api/auth/logout
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Behavior:**
- Clears `auth_token` cookie
- Clears `mrshomser_session` cookie
- Sets both cookies with `maxAge: 0`
- Creates new guest session on client side

---

### GET /api/auth/me

Get current user information.

**Request:**
```http
GET /api/auth/me
Cookie: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK` (Authenticated)
```json
{
  "authenticated": true,
  "user": {
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Response:** `200 OK` (Guest)
```json
{
  "authenticated": false,
  "user": null
}
```

**Errors:**
- `401` - Invalid or expired token
- `500` - Server error

---

## 💬 Chat API

### POST /api/chat

Stream AI responses using Server-Sent Events (SSE).

**Request:**
```http
POST /api/chat
Content-Type: application/json
Cookie: mrshomser_session=abc123...

{
  "message": "What is Next.js?",
  "chatId": "chat_1234567890",
  "continueFrom": null
}
```

**Parameters:**
- `message` (string, required) - User's message
- `chatId` (string, required) - Chat identifier
- `continueFrom` (string, optional) - Continue from truncated response

**Response:** `200 OK`
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"chunk":"Next"}

data: {"chunk":".js"}

data: {"chunk":" is"}

data: {"chunk":" a"}

data: {"chunk":" React"}

data: {"chunk":" framework"}

data: {"done":true}
```

**Response Format:**

Each SSE event contains JSON:
```typescript
// Regular chunk
{ chunk: string }

// Completion
{ done: true }

// Truncation detected
{ truncated: true, done: true }

// Error
{ error: string }
```

**Errors:**
- `400` - Missing message or chatId
- `401` - Invalid session
- `500` - Ollama connection error
- `503` - Ollama service unavailable

**Example Client (JavaScript):**
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    message: 'Hello!',
    chatId: 'chat_123'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      
      if (data.chunk) {
        console.log('Chunk:', data.chunk);
      }
      if (data.done) {
        console.log('Done!');
      }
      if (data.error) {
        console.error('Error:', data.error);
      }
    }
  }
}
```

---

## 📋 Chat Management

### GET /api/chats

Get all chats for current session.

**Request:**
```http
GET /api/chats
Cookie: mrshomser_session=abc123...
```

**Response:** `200 OK`
```json
{
  "chats": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Introduction to Next.js",
      "sessionId": "abc123...",
      "createdAt": "2026-03-24T10:00:00.000Z",
      "updatedAt": "2026-03-24T10:15:00.000Z",
      "messages": [
        {
          "role": "user",
          "content": "What is Next.js?",
          "timestamp": "2026-03-24T10:00:00.000Z"
        },
        {
          "role": "assistant",
          "content": "Next.js is a React framework...",
          "timestamp": "2026-03-24T10:00:15.000Z"
        }
      ]
    }
  ]
}
```

**Errors:**
- `401` - Invalid session
- `500` - Database error

---

### POST /api/chats

Create a new chat.

**Request:**
```http
POST /api/chats
Content-Type: application/json
Cookie: mrshomser_session=abc123...

{
  "title": "New Conversation"
}
```

**Response:** `201 Created`
```json
{
  "chat": {
    "_id": "65f1234567890abcdef12345",
    "title": "New Conversation",
    "sessionId": "abc123...",
    "messages": [],
    "createdAt": "2026-03-24T11:00:00.000Z",
    "updatedAt": "2026-03-24T11:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Missing title
- `401` - Invalid session
- `500` - Database error

---

### GET /api/chats/:id

Get a specific chat by ID.

**Request:**
```http
GET /api/chats/65f1234567890abcdef12345
Cookie: mrshomser_session=abc123...
```

**Response:** `200 OK`
```json
{
  "chat": {
    "_id": "65f1234567890abcdef12345",
    "title": "Introduction to Next.js",
    "sessionId": "abc123...",
    "messages": [...],
    "createdAt": "2026-03-24T10:00:00.000Z",
    "updatedAt": "2026-03-24T10:15:00.000Z"
  }
}
```

**Errors:**
- `401` - Invalid session
- `404` - Chat not found
- `500` - Database error

---

### PUT /api/chats/:id

Update a chat (title or add messages).

**Request:**
```http
PUT /api/chats/65f1234567890abcdef12345
Content-Type: application/json
Cookie: mrshomser_session=abc123...

{
  "title": "Updated Title",
  "messages": [
    {
      "role": "user",
      "content": "New message",
      "timestamp": "2026-03-24T11:00:00.000Z"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "chat": {
    "_id": "65f1234567890abcdef12345",
    "title": "Updated Title",
    "messages": [...],
    "updatedAt": "2026-03-24T11:00:00.000Z"
  }
}
```

**Errors:**
- `401` - Invalid session
- `404` - Chat not found
- `500` - Database error

---

### DELETE /api/chats/:id

Delete a specific chat.

**Request:**
```http
DELETE /api/chats/65f1234567890abcdef12345
Cookie: mrshomser_session=abc123...
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

**Errors:**
- `401` - Invalid session
- `404` - Chat not found
- `500` - Database error

---

## 🚨 Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details (optional)"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful request |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input or malformed request |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Authenticated but no permission |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists |
| `500` | Internal Server Error | Server-side error |
| `503` | Service Unavailable | External service (Ollama) unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | Request validation failed |
| `MISSING_FIELD` | Required field missing |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `USER_EXISTS` | User already registered |
| `SESSION_INVALID` | Invalid or expired session |
| `CHAT_NOT_FOUND` | Chat doesn't exist |
| `OLLAMA_ERROR` | Ollama service error |
| `DATABASE_ERROR` | MongoDB connection error |

---

## 🛡️ Rate Limiting

Currently, there are no rate limits enforced. **Recommendation:** Implement rate limiting in production.

**Future Implementation:**
- 100 requests per minute per IP
- 20 chat requests per minute per session
- 5 login attempts per hour per IP

---

## 📝 TypeScript Types

### Request/Response Types

```typescript
// Authentication
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    username: string;
    email: string;
  };
  token: string;
}

// Chat
interface ChatRequest {
  message: string;
  chatId: string;
  continueFrom?: string;
}

interface ChatChunk {
  chunk?: string;
  done?: boolean;
  truncated?: boolean;
  error?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  title: string;
  sessionId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 🧪 Testing

### cURL Examples

**Register:**
```bash
curl -X POST https://mrshomser.ddev.site/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test1234!"}'
```

**Login:**
```bash
curl -X POST https://mrshomser.ddev.site/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

**Get Chats:**
```bash
curl https://mrshomser.ddev.site/api/chats \
  -b cookies.txt
```

**Send Chat Message:**
```bash
curl -X POST https://mrshomser.ddev.site/api/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"message":"Hello!","chatId":"chat_123"}' \
  --no-buffer
```

---

## 📚 Related Documentation

- [Architecture](Architecture) - System design
- [Database Schema](Database-Schema) - MongoDB structure
- [Authentication](Authentication) - Auth flow details
- [Troubleshooting](Troubleshooting) - Common API issues

---

**Need help with the API? Open an [issue on GitHub](https://github.com/anup04sust/mrshomser/issues)**

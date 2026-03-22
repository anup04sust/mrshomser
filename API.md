# API Quick Reference

Quick reference guide for mrSomsher API endpoints.

## Base URL

```
https://mrshomser.ddev.site/api
```

## Authentication

All auth endpoints set/clear HTTP-only JWT cookies.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user |

## Chats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chats` | Get all chats |
| POST | `/chats` | Create new chat |
| PUT | `/chats/[id]` | Update chat |
| DELETE | `/chats/[id]` | Delete chat |
| POST | `/chat` | Send message (streaming) |

## Request Examples

### Register
```bash
curl -X POST https://mrshomser.ddev.site/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

### Login
```bash
curl -X POST https://mrshomser.ddev.site/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "secure123"
  }'
```

### Send Message (Streaming)
```bash
curl -X POST https://mrshomser.ddev.site/api/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'
```

### Get Chats
```bash
curl https://mrshomser.ddev.site/api/chats \
  -b cookies.txt
```

### Create Chat
```bash
curl -X POST https://mrshomser.ddev.site/api/chats \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "New Chat",
    "messages": []
  }'
```

### Delete Chat
```bash
curl -X DELETE https://mrshomser.ddev.site/api/chats/chat_123 \
  -b cookies.txt
```

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not logged in |
| 404 | Not Found |
| 409 | Conflict - User already exists |
| 500 | Server Error |

## Error Response Format

```json
{
  "error": "Error message here"
}
```

## Success Response Format

### Auth Success
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

### Chat Success
```json
{
  "chat": {
    "id": "chat_123",
    "title": "Chat Title",
    "messages": [...],
    "createdAt": 1710000000000,
    "updatedAt": 1710000000000
  }
}
```

## Rate Limiting

Currently no rate limiting is implemented. Consider adding in production.

## Authentication Flow

1. Register or login → Receive JWT in HTTP-only cookie
2. Cookie auto-sent with subsequent requests
3. Logout → Cookie cleared
4. Token expires after 30 days

## WebSocket / Streaming

The `/api/chat` endpoint supports Server-Sent Events (SSE) for streaming responses.

**Content-Type:** `text/event-stream`

**Format:**
```
data: {"content":"Hello"}

data: {"content":"!"}

data: [DONE]
```

For full documentation, see [DOCUMENTATION.md](DOCUMENTATION.md)

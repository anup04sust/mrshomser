# Installation Guide

Complete installation guide for Mr Shomser.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Required Software

- **Operating System:** Linux, macOS, or Windows (WSL2)
- **DDEV:** v1.25.1 or higher
- **Docker:** 20.10+ & Docker Compose v2+
- **Git:** Any recent version
- **Node.js:** 20+ (managed by DDEV)
- **pnpm:** 10+ (managed by DDEV)

### Hardware Requirements

- **CPU:** 4+ cores recommended (for Ollama)
- **RAM:** 8GB minimum, 16GB recommended
- **Disk:** 20GB free space (for models and data)
- **GPU:** Optional (speeds up AI inference)

---

## Installation Steps

### 1. Install Prerequisites

#### Install DDEV

**macOS:**
```bash
brew install ddev
```

**Linux:**
```bash
curl -fsSL https://ddev.com/install.sh | bash
```

**Windows (WSL2):**
```bash
curl -fsSL https://ddev.com/install.sh | bash
```

#### Verify Installation
```bash
ddev version
docker version
```

---

### 2. Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/mrshomser.git

# Navigate to project directory
cd mrshomser
```

---

### 3. Start DDEV

```bash
# Start DDEV services (web, MongoDB, Ollama)
ddev start
```

Expected output:
```
Starting mrshomser...
✓ Network created
✓ Containers started
✓ Services healthy
✓ Next.js running at https://mrshomser.ddev.site
```

---

### 4. Install Dependencies

```bash
# Install Node.js packages
ddev exec pnpm install
```

This will install:
- Next.js
- React
- TailwindCSS
- MongoDB driver
- JWT & bcrypt
- And all other dependencies

---

### 5. Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Ollama Configuration
OLLAMA_API_URL=http://ollama:11434
OLLAMA_MODEL=qwen3.5:4b

# MongoDB Configuration
MONGODB_URI=mongodb://db:db@mongo:27017/mrshomser?authSource=admin
MONGODB_DB=mrshomser

# App Configuration
NEXT_PUBLIC_APP_NAME=Mr Shomser

# JWT Secret - CHANGE THIS!
JWT_SECRET=generate-a-random-secret-key-here
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 6. Pull AI Model

```bash
# Pull the Qwen 3.5 model (4B parameters)
ddev exec -s ollama "ollama pull qwen3.5:4b"
```

This downloads ~3.4GB. Expected output:
```
pulling manifest
pulling 81fb60c7daa8: 100% ▕████████████████▏ 3.4 GB
verifying sha256 digest
writing manifest
success
```

**Alternative models:**
```bash
# Smaller/faster model
ddev exec -s ollama "ollama pull gemma3:4b"

# Larger/better model
ddev exec -s ollama "ollama pull qwen3.5:14b"
```

---

### 7. Verify Installation

```bash
# Check all services are running
ddev status
```

Expected output:
```
✓ web - OK
✓ mongo - OK
✓ ollama - OK
```

---

## Configuration

### Ports

Default ports:
- **HTTPS:** 443 → https://mrshomser.ddev.site
- **HTTP:** 80 (redirects to HTTPS)
- **Next.js Dev:** 3001 → https://mrshomser.ddev.site:3001
- **MongoDB:** 27017 (internal)
- **Ollama:** 11434 (internal)

### Services Configuration

#### MongoDB

Location: `.ddev/docker-compose.mongo.yaml`

```yaml
services:
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"  # Expose to host
    volumes:
      - mongo:/data/db
```

#### Ollama

Location: `.ddev/docker-compose.ollama.yaml`

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    expose:
      - "11434"  # Internal only
    volumes:
      - ollama-data:/root/.ollama
```

#### Nginx Timeouts

Location: `.ddev/nginx/nginx-site.conf`

```nginx
# Increase timeouts for LLM streaming
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;
send_timeout 300s;
```

---

## Verification

### 1. Test Web Access

```bash
# Should show HTML
curl https://mrshomser.ddev.site -k
```

### 2. Test MongoDB

```bash
# Connect to MongoDB
ddev mongodb

# Or check connection
ddev exec "curl -s http://mongo:27017" | head
```

### 3. Test Ollama

```bash
# List installed models
ddev exec -s ollama "ollama list"

# Test chat
ddev exec -s ollama "ollama run qwen3.5:4b 'Hello'"
```

### 4. Test API

```bash
# Test chat endpoint
curl -X POST https://mrshomser.ddev.site/api/chat \
  -H "Content-Type: application/json" \
  -k \
  -d '{
    "messages": [{"role": "user", "content": "hi"}],
    "stream": false
  }'
```

---

## Post-Installation

### Access the Application

1. Open browser: https://mrshomser.ddev.site
2. Create an account or use guest mode
3. Start chatting!

### Useful Commands

```bash
# View logs
ddev logs -f

# Restart services
ddev restart

# Stop services
ddev stop

# SSH into container
ddev ssh

# Run commands in Ollama
ddev exec -s ollama "ollama --help"

# Database access
ddev mongodb
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find what's using port 80
sudo lsof -i :80

# Or let DDEV use alternate port (33000)
# It will happen automatically
```

### Cannot Connect to MongoDB

```bash
# Restart MongoDB
ddev restart

# Check MongoDB is running
ddev describe | grep mongo

# Test connection
ddev exec "mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin"
```

### Ollama Not Responding

```bash
# Check Ollama service
ddev logs -s ollama

# Verify model is installed
ddev exec -s ollama "ollama list"

# Re-pull model if needed
ddev exec -s ollama "ollama pull qwen3.5:4b"
```

### Next.js Build Errors

```bash
# Clean and reinstall
ddev exec "rm -rf node_modules .next"
ddev exec "pnpm install"
ddev restart
```

### Permission Errors

```bash
# Fix ownership (Linux)
sudo chown -R $USER:$USER .

# Or run with correct permissions
ddev exec "chown -R $(id -u):$(id -g) /var/www/html"
```

---

## Uninstallation

To completely remove Mr Shomser:

```bash
# Stop and remove containers
ddev delete -O

# Remove project files
cd ..
rm -rf mrshomser

# Optional: Remove DDEV volumes
docker volume prune
```

---

## Next Steps

- Read [DOCUMENTATION.md](DOCUMENTATION.md) for full API reference
- See [API.md](API.md) for quick API guide
- Check [README.md](README.md) for project overview

---

## Getting Help

- **Issues:** https://github.com/yourusername/mrshomser/issues
- **Discussions:** https://github.com/yourusername/mrshomser/discussions
- **Email:** support@dreamsteps.io

---

*Installation guide last updated: March 23, 2026*

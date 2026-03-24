# Installation Guide

Complete step-by-step guide to install and configure Mr Shomser on your local machine.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Minimum Version | Purpose | Download |
|----------|----------------|---------|----------|
| **DDEV** | 1.22+ | Development environment | [ddev.com/get-started](https://ddev.com/get-started/) |
| **Docker Desktop** | 20.10+ | Container runtime | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| **Git** | 2.30+ | Version control | [git-scm.com](https://git-scm.com/) |

### Optional (Included in DDEV)
- **pnpm** 8+ (for local development outside DDEV)
- **Node.js** 20+ (for local development outside DDEV)

### System Requirements

**Minimum:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 10GB free space
- OS: Linux, macOS, or Windows (WSL2)

**Recommended:**
- CPU: 8 cores
- RAM: 16GB
- Storage: 20GB free space (SSD preferred)
- GPU: Not required (CPU inference works great)

---

## 🚀 Installation Steps

### Step 1: Verify Prerequisites

Check that Docker is running:
```bash
docker --version
docker ps
```

Check that DDEV is installed:
```bash
ddev version
```

Expected output:
```
DDEV version v1.22.0 or higher
```

---

### Step 2: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/anup04sust/mrshomser.git

# Navigate to project directory
cd mrshomser
```

**Alternative:** Download and extract the ZIP file from GitHub.

---

### Step 3: Start DDEV Environment

```bash
ddev start
```

This command will:
- ✅ Create Docker containers (web, db, ollama)
- ✅ Set up nginx web server
- ✅ Configure MongoDB database
- ✅ Set up Ollama AI service
- ✅ Configure SSL certificates
- ✅ Set up networking

**Expected output:**
```
Successfully started mrshomser
Project can be reached at:
- https://mrshomser.ddev.site
- http://mrshomser.ddev.site:33000
```

**First-time setup:** This may take 3-5 minutes to download and configure all containers.

---

### Step 4: Install Dependencies

```bash
ddev exec pnpm install
```

This installs all Node.js dependencies including:
- Next.js and React
- MongoDB client
- JWT and bcrypt for authentication
- React Markdown and syntax highlighting
- TypeScript types

**Expected output:**
```
dependencies installed successfully
```

---

### Step 5: Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

The `.env.local` file should contain:
```env
# Ollama Configuration
OLLAMA_API_URL=http://ollama:11434
OLLAMA_MODEL=phi3:mini

# MongoDB Configuration
MONGODB_URI=mongodb://db:db@mongo:27017/mrshomser?authSource=admin
MONGODB_DB=mrshomser

# App Configuration
NEXT_PUBLIC_APP_NAME=Mr Shomser

# JWT Secret (IMPORTANT: Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456
```

**⚠️ Important:** Change `JWT_SECRET` to a strong random string for production!

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

---

### Step 6: Pull the AI Model

Pull the phi3:mini model (2.3GB):
```bash
ddev exec -s ollama "ollama pull phi3:mini"
```

This downloads the AI model. **It may take 5-10 minutes** depending on your internet speed.

**Progress:**
```
pulling manifest
pulling 61e88e884507... 100% ▕████████████████▏ 2.3 GB
verifying sha256 digest
writing manifest
success
```

---

### Step 7: Start the Development Server

```bash
ddev exec pnpm dev --hostname 0.0.0.0
```

Or run in background:
```bash
ddev exec "pnpm dev --hostname 0.0.0.0 > /tmp/nextjs.log 2>&1 &"
```

**Expected output:**
```
▲ Next.js 16.2.1
- Local:        http://localhost:3000
- Network:      http://0.0.0.0:3000

✓ Ready in 2.5s
```

---

### Step 8: Access the Application

Open your browser and visit:

**Primary URL:**
```
https://mrshomser.ddev.site
```

**Alternative URL:**
```
http://mrshomser.ddev.site:33000
```

You should see the Mr Shomser chat interface! 🎉

---

## ✅ Verify Installation

### Test the AI Model

1. Open https://mrshomser.ddev.site
2. Type a message: "Hello, introduce yourself"
3. Wait 10-15 seconds
4. You should receive an AI response

### Check Services

Verify all services are running:
```bash
# Check containers
ddev describe

# Check Ollama
ddev exec -s ollama "ollama list"

# Check MongoDB
ddev exec mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --eval "db.serverStatus()"

# Check Next.js
ddev exec "ps aux | grep next"
```

---

## 🔧 Post-Installation Configuration

### Optional: Pull Additional Models

Try different models for comparison:
```bash
# Smaller, faster model
ddev exec -s ollama "ollama pull tinyllama:1.1b"

# Larger, higher quality models (GPU recommended)
ddev exec -s ollama "ollama pull llama2"
ddev exec -s ollama "ollama pull mistral"
```

Update `.env.local` to use a different model:
```env
OLLAMA_MODEL=tinyllama:1.1b
```

### Optional: Customize App Name

Edit `.env.local`:
```env
NEXT_PUBLIC_APP_NAME=My AI Assistant
```

Restart the app to see changes.

---

## 🐛 Troubleshooting Installation

### Problem: DDEV won't start

**Solution 1:** Ensure Docker is running
```bash
docker ps
```

**Solution 2:** Restart Docker Desktop

**Solution 3:** Remove old DDEV project
```bash
ddev delete
ddev start
```

---

### Problem: Can't access https://mrshomser.ddev.site

**Solution 1:** Check DDEV is running
```bash
ddev describe
```

**Solution 2:** Use alternative URL
```
http://mrshomser.ddev.site:33000
```

**Solution 3:** Check /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
Should contain:
```
127.0.0.1 mrshomser.ddev.site
```

---

### Problem: Ollama model won't download

**Solution 1:** Check internet connection

**Solution 2:** Check disk space
```bash
df -h
```

**Solution 3:** Manually pull with docker
```bash
ddev ssh -s ollama
ollama pull phi3:mini
exit
```

---

### Problem: Next.js won't start

**Solution 1:** Check if port 3000 is available
```bash
ddev exec "lsof -i :3000"
```

**Solution 2:** Kill existing process
```bash
ddev exec pkill -f next-server
```

**Solution 3:** Check logs
```bash
ddev exec tail -f /tmp/nextjs.log
```

---

### Problem: MongoDB connection error

**Solution 1:** Verify MongoDB is running
```bash
ddev exec mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --eval "db.serverStatus()"
```

**Solution 2:** Restart DDEV
```bash
ddev restart
```

**Solution 3:** Check environment variables
```bash
cat .env.local
```

---

## 📚 Next Steps

Now that you have Mr Shomser installed:

1. **[Quick Start Guide](Quick-Start)** - Take a tour of the features
2. **[User Guide](User-Guide)** - Learn how to use all features
3. **[Configuration](Configuration)** - Customize your setup
4. **[API Reference](API-Reference)** - Build integrations

---

## 🆘 Need Help?

- 📖 Read the [FAQ](FAQ)
- 🐛 Check [Troubleshooting Guide](Troubleshooting)
- 💬 Open an [Issue on GitHub](https://github.com/anup04sust/mrshomser/issues)
- 📧 Email: anup.cse7@gmail.com

---

**Congratulations! You've successfully installed Mr Shomser! 🎉**

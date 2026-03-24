# Troubleshooting Guide

Common issues and solutions for Mr Shomser deployment and operation.

---

## 🔍 Quick Diagnostics

Run these commands to check system health:

```bash
# Check DDEV status
ddev describe

# Check all containers
ddev exec "ps aux"

# Check Ollama
ddev exec -s ollama "ollama list"

# Check MongoDB
ddev exec mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --eval "db.serverStatus()"

# Check Next.js
ddev logs | tail -50
```

---

## 🚨 Common Issues

### 1. DDEV Won't Start

**Symptom:**
```bash
$ ddev start
Error: Failed to start mrshomser
```

**Possible Causes & Solutions:**

#### Solution A: Docker not running
```bash
# Check Docker status
docker ps

# If error, start Docker Desktop
# Mac: Open Docker Desktop app
# Linux: sudo systemctl start docker
# Windows: Start Docker Desktop
```

#### Solution B: Port conflict
```bash
# Find what's using ports
lsof -i :80
lsof -i :443

# Kill the process or change DDEV ports
ddev config --web-http-port=8080 --web-https-port=8443
ddev start
```

#### Solution C: Corrupt DDEV project
```bash
# Remove and recreate
ddev delete --omit-snapshot
ddev start
```

---

### 2. Can't Access https://mrshomser.ddev.site

**Symptom:**
Browser shows "This site can't be reached"

**Solutions:**

#### Solution A: Check /etc/hosts
```bash
# Mac/Linux
cat /etc/hosts | grep mrshomser

# Should see:
# 127.0.0.1 mrshomser.ddev.site

# If missing, add it:
sudo nano /etc/hosts
# Add: 127.0.0.1 mrshomser.ddev.site
```

#### Solution B: Use alternative URL
```
http://mrshomser.ddev.site:33000
```

#### Solution C: Restart DDEV
```bash
ddev restart
```

---

### 3. Ollama Model Won't Download

**Symptom:**
```bash
$ ddev exec -s ollama "ollama pull phi3:mini"
Error: connection timeout
```

**Solutions:**

#### Solution A: Check internet connection
```bash
# Test connectivity
curl -I https://ollama.ai

# Check disk space
df -h
# Ensure at least 5GB free
```

#### Solution B: Manual pull
```bash
# SSH into ollama container
ddev ssh -s ollama

# Pull model
ollama pull phi3:mini

# Verify
ollama list

# Exit
exit
```

#### Solution C: Use smaller model first
```bash
# Try tiny model (637MB)
ddev exec -s ollama "ollama pull tinyllama:1.1b"

# Update .env.local
OLLAMA_MODEL=tinyllama:1.1b
```

---

### 4. Next.js Won't Start

**Symptom:**
```bash
$ ddev exec pnpm dev
Error: address already in use :::3000
```

**Solutions:**

#### Solution A: Kill existing process
```bash
# Find Next.js process
ddev exec "ps aux | grep next"

# Kill by PID
ddev exec kill -9 <PID>

# Or kill all node processes
ddev exec pkill -f next-server

# Restart
ddev exec pnpm dev --hostname 0.0.0.0
```

#### Solution B: Check logs
```bash
# View recent logs
ddev logs -f

# Check specific log file
ddev exec tail -f /tmp/nextjs.log
```

#### Solution C: Clear cache
```bash
# Remove .next directory
ddev exec rm -rf .next

# Reinstall dependencies
ddev exec rm -rf node_modules
ddev exec pnpm install

# Rebuild
ddev exec pnpm build
ddev exec pnpm dev --hostname 0.0.0.0
```

---

### 5. MongoDB Connection Error

**Symptom:**
```
Error: Failed to connect to MongoDB
MongoNetworkError: connection timeout
```

**Solutions:**

#### Solution A: Verify MongoDB is running
```bash
# Check container
ddev describe | grep mongo

# Test connection
ddev exec mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --eval "db.serverStatus()"
```

#### Solution B: Check environment variables
```bash
# Verify .env.local
cat .env.local

# Should contain:
# MONGODB_URI=mongodb://db:db@mongo:27017/mrshomser?authSource=admin
# MONGODB_DB=mrshomser
```

#### Solution C: Restart MongoDB container
```bash
# Restart entire DDEV
ddev restart

# Or restart MongoDB specifically
docker restart ddev-mrshomser-db
```

---

### 6. AI Responses Not Streaming

**Symptom:**
User sends message but no AI response appears

**Solutions:**

#### Solution A: Check Ollama connectivity
```bash
# Test Ollama API
ddev exec curl http://ollama:11434/api/tags

# Should return JSON with models
```

#### Solution B: Verify model is loaded
```bash
ddev exec -s ollama "ollama list"

# Should show phi3:mini
```

#### Solution C: Check browser console
```javascript
// Open DevTools (F12)
// Look for errors in Console tab
// Common issues:
// - CORS errors
// - Network timeout
// - SSE connection failed
```

#### Solution D: Test with curl
```bash
# Test chat endpoint directly
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -b "mrshomser_session=test123" \
  -d '{"message":"Hello","chatId":"test"}' \
  --no-buffer
```

---

### 7. Login/Registration Not Working

**Symptom:**
User submits form but nothing happens or errors appear

**Solutions:**

#### Solution A: Check API endpoint
```bash
# Test register endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"test",
    "email":"test@example.com",
    "password":"Test1234!"
  }'
```

#### Solution B: Verify MongoDB users collection
```bash
# Connect to MongoDB
ddev exec mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin

# Check users
db.users.find()

# Exit
exit
```

#### Solution C: Check JWT secret
```bash
# Verify JWT_SECRET in .env.local
grep JWT_SECRET .env.local

# Should NOT be empty
```

---

### 8. Slow AI Responses

**Symptom:**
Responses take 30+ seconds instead of 10-15s

**Solutions:**

#### Solution A: Check CPU usage
```bash
# Monitor CPU
top

# Check if other processes using CPU
# Close unnecessary applications
```

#### Solution B: Try smaller/faster model
```bash
# Pull tinyllama (much faster)
ddev exec -s ollama "ollama pull tinyllama:1.1b"

# Update .env.local
OLLAMA_MODEL=tinyllama:1.1b

# Restart
ddev restart
```

#### Solution C: Reduce context window
Edit Ollama request in `app/api/chat/route.ts`:
```typescript
options: {
  num_ctx: 1024,      // Reduce from 2048
  num_predict: 256,   // Reduce from 512
}
```

---

### 9. Chat History Not Saving

**Symptom:**
Messages disappear after page refresh

**Solutions:**

#### Solution A: Check session cookie
```javascript
// Open DevTools → Application → Cookies
// Look for: mrshomser_session
// If missing, check browser settings
```

#### Solution B: Verify MongoDB write
```bash
# Check if chats are being saved
ddev exec mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin

# Query chats
db.chats.find().pretty()

# If empty, check API logs
```

#### Solution C: Check browser localStorage
```javascript
// Open DevTools Console
console.log(localStorage);

// If blocked, disable strict privacy mode
```

---

### 10. SSL Certificate Error

**Symptom:**
Browser shows "Your connection is not private"

**Solutions:**

#### Solution A: Trust DDEV certificate
```bash
# Regenerate certificates
ddev delete
ddev start

# Mac: Trust certificate in Keychain Access
# Linux: Add to trusted certificates
```

#### Solution B: Use HTTP instead
```
http://mrshomser.ddev.site:33000
```

---

## 🔧 Advanced Troubleshooting

### Enable Debug Mode

Create `.ddev/docker-compose.debug.yaml`:
```yaml
version: '3.6'
services:
  web:
    environment:
      - DEBUG=1
      - VERBOSE=1
```

Restart:
```bash
ddev restart
```

### Check All Logs

```bash
# DDEV logs
ddev logs

# Next.js logs
ddev exec tail -f /tmp/nextjs.log

# Nginx logs
ddev logs -s web

# MongoDB logs
ddev logs -s db

# Ollama logs
ddev logs -s ollama
```

### Network Debugging

```bash
# Check DNS resolution
ddev exec nslookup mrshomser.ddev.site

# Check port connectivity
ddev exec telnet mongo 27017
ddev exec telnet ollama 11434

# Check network interfaces
ddev exec ifconfig
```

---

## 📊 Performance Profiling

### Monitor Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats ddev-mrshomser-web

# Memory usage
ddev exec free -h

# Disk usage
ddev exec df -h
```

### Profile AI Response Time

```bash
# Time a chat request
time curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -b "mrshomser_session=test" \
  -d '{"message":"Hello","chatId":"test"}' \
  --no-buffer > /dev/null
```

---

## 🆘 Last Resort Solutions

### Complete Reset

```bash
# Stop DDEV
ddev stop

# Remove all data (WARNING: Deletes database!)
ddev delete --omit-snapshot

# Remove node_modules
rm -rf node_modules .next

# Start fresh
ddev start
ddev exec pnpm install
ddev exec -s ollama "ollama pull phi3:mini"
ddev exec pnpm dev --hostname 0.0.0.0
```

### Docker Clean Up

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Nuclear option (removes everything!)
docker system prune -a --volumes
```

---

## 📚 Related Documentation

- [Installation Guide](Installation-Guide) - Initial setup
- [Configuration](Configuration) - Environment settings
- [Architecture](Architecture) - System design
- [FAQ](FAQ) - Common questions

---

## 💬 Still Having Issues?

If you've tried everything and still facing problems:

1. **Check GitHub Issues:** [github.com/anup04sust/mrshomser/issues](https://github.com/anup04sust/mrshomser/issues)
2. **Open New Issue:** Provide full error logs and steps to reproduce
3. **Email Support:** anup.cse7@gmail.com

**When reporting issues, include:**
- Operating system and version
- DDEV version (`ddev version`)
- Docker version (`docker --version`)
- Error messages (full output)
- Steps to reproduce
- What you've already tried

---

**Most issues can be solved with `ddev restart` or checking logs! 🔧**

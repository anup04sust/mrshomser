# FAQ - Frequently Asked Questions

Answers to common questions about Mr Shomser.

---

## General Questions

### What is Mr Shomser?

Mr Shomser is a **self-hosted AI chat assistant** that runs entirely on your local machine. It uses [Ollama](https://ollama.ai/) to run AI models locally, ensuring complete privacy - no data ever leaves your server.

### Is it free?

**Yes, completely free!** 
- ✅ No subscription fees
- ✅ No API costs
- ✅ No hidden charges
- ✅ Open source (MIT License)

The only cost is your hardware and electricity to run it.

### Why "Mr Shomser"?

The name comes from combining playfulness with capability - an AI assistant with personality that's practical and helpful.

---

## Setup & Installation

### What do I need to run Mr Shomser?

**Required:**
- DDEV (v1.22+)
- Docker Desktop
- 8GB RAM minimum
- 10GB free disk space

**Optional:**
- GPU (makes responses faster, but works fine on CPU)

### How long does setup take?

**About 10 minutes:**
- 2-3 minutes: DDEV start
- 5-7 minutes: Download AI model (2.3GB)
- 1 minute: Start the app

### Can I run this on Windows?

**Yes!** Install:
1. Docker Desktop for Windows
2. WSL2 (Windows Subsystem for Linux)
3. DDEV

Then follow the [Installation Guide](Installation-Guide).

### Can I run this on a Raspberry Pi?

**Technically yes, but not recommended:**
- Responses will be very slow (2-5 minutes)
- Only tiny models (tinyllama) will work
- Limited RAM may cause crashes

Better to use a laptop or desktop PC.

---

## AI & Models

### Which AI model does it use?

By default: **phi3:mini** (2.3GB)
- Fast on CPU (10-15 second responses)
- Good quality English responses  
- Low memory usage

You can switch to other models like llama2, mistral, etc.

### Can I use ChatGPT or Claude models?

**No.** Those are cloud-only models from OpenAI and Anthropic. Mr Shomser uses **local open-source models** from Ollama.

### How do I change the AI model?

```bash
# Pull a different model
ddev exec -s ollama "ollama pull llama2"

# Update .env.local
OLLAMA_MODEL=llama2

# Restart
ddev restart
```

See [Model Selection](Model-Selection) for all options.

### Why are responses slower than ChatGPT?

**Three reasons:**
1. **Hardware:** ChatGPT runs on massive GPU clusters; you're running on CPU
2. **Model size:** Smaller models = faster but less capable
3. **Privacy tradeoff:** Your data stays private, but processing is local

With a GPU, responses can be 10x faster!

### Can I run multiple models at once?

**Not simultaneously,** but you can:
1. Pull multiple models
2. Switch between them by changing `OLLAMA_MODEL`
3. Restart the app

Each model loads into memory when needed.

---

## Privacy & Security

### Is my data really private?

**100% private!** 
- All AI processing happens locally
- No external API calls
- No telemetry or tracking
- No data sent to cloud

Your conversations never leave your machine.

### Can others see my chats?

**Only if they have access to your computer.**

Chats are stored in your local MongoDB database. If you're concerned:
- Use strong user passwords
- Enable disk encryption
- Don't share your computer

### Is it secure?

**Yes, with standard web security:**
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens in httpOnly cookies
- ✅ CSRF protection
- ✅ Input validation

For production deployment, see [Security Best Practices](Security-Best-Practices).

---

## Features & Usage

### Can I use it on my phone?

**Yes!** The interface is mobile-responsive:
- Works on iOS Safari
- Works on Android Chrome
- Access from any device on your local network

Just visit `https://mrshomser.ddev.site` from your phone (if on same WiFi).

### Can I access it from another computer?

**Yes, on your local network:**

1. Get your computer's IP address:
   ```bash
   hostname -I  # Linux
   ipconfig     # Windows
   ifconfig     # Mac
   ```

2. Update `.ddev/config.yaml`:
   ```yaml
   additional_fqdns:
     - mrshomser.local
   additional_hostnames:
     - your-computer-name.local
   ```

3. Access from other devices:
   ```
   http://YOUR_IP:33000
   ```

For internet access, see [Production Deployment](Production-Deployment).

### Does it support voice input?

**Not yet.** Voice input is planned for a future release (v2.0).

### Can I export my chats?

**Not yet.** Export/import functionality is planned. Current workaround:

```bash
# Export MongoDB data
ddev exec mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --eval "db.chats.find()" > chats.json
```

### Can I customize the AI personality?

**Yes!** Edit `app/api/chat/route.ts`:

```typescript
const SYSTEM_PROMPT = `You are Mr. Shomser, a helpful AI assistant. 
Your personality:
- Friendly and professional
- Clear and concise
- Add your traits here...
`;
```

Restart the app to see changes.

---

## Performance

### Why do responses take 10-15 seconds?

**Normal for CPU inference:**
- Model processes ~30-50 tokens/second
- 512 token limit ÷ 40 tokens/sec ≈ 13 seconds

**Speed it up:**
- Use smaller model (tinyllama: 2-3 seconds)
- Use GPU (10x faster: 1-2 seconds)
- Reduce token limit in config

### Will a GPU make it faster?

**Yes, dramatically!** 

| Hardware | Speed |
|----------|-------|
| CPU (Intel i7) | 10-15 seconds |
| GPU (RTX 3060) | 1-2 seconds |
| GPU (RTX 4090) | 0.5-1 second |

Configure Ollama to use GPU - see [Performance Tuning](Performance-Tuning).

### Why does the first response take longer?

**Model loading:** First request loads the model into memory (~5-10 second delay). Subsequent requests are faster.

---

## Development

### Can I contribute to the project?

**Yes, absolutely!** 

See [Contributing Guide](Contributing):
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Check [good first issues](https://github.com/anup04sust/mrshomser/labels/good%20first%20issue).

### Can I use this for commercial projects?

**Yes!** Mr Shomser is licensed under the [MIT License](https://opensource.org/licenses/MIT):
- ✅ Use commercially
- ✅ Modify the code
- ✅ Distribute it
- ✅ Private use

Just keep the attribution and license notice.

### How do I add a new API endpoint?

1. Create file: `app/api/yourroute/route.ts`
2. Export GET/POST/PUT/DELETE functions
3. Follow Next.js App Router conventions

See [API Reference](API-Reference) for examples.

---

## Deployment & Hosting

### Can I deploy this to production?

**Yes!** See [Production Deployment](Production-Deployment) for:
- VPS hosting (DigitalOcean, AWS, etc.)
- Docker Compose setup
- Nginx configuration
- SSL certificates
- Security hardening

### What are the hosting costs?

**Example (DigitalOcean):**
- $12/month: 2 vCPUs, 4GB RAM (slow but works)
- $24/month: 2 vCPUs, 8GB RAM (optimal)
- $48/month: 4 vCPUs, 16GB RAM (fast)

**vs ChatGPT Plus:** $20/month per user

If you have **5+ users**, self-hosting is cheaper!

### Can I host it for multiple users?

**Yes!** The authentication system supports multiple users:
- Each user gets their own account
- Conversations are isolated
- All users share the same AI model

For high traffic, see [Scalability](Architecture#scalability).

---

## Troubleshooting

### My AI responses are gibberish

**Check model:**
```bash
ddev exec -s ollama "ollama list"
```

If wrong model, pull correct one:
```bash
ddev exec -s ollama "ollama pull phi3:mini"
```

Update `.env.local`:
```env
OLLAMA_MODEL=phi3:mini
```

### Chat history disappeared

**Check session cookie:**
1. Open DevTools (F12)
2. Go to Application → Cookies
3. Look for `mrshomser_session`

If missing, your browser may be blocking cookies.

### Everything is slow

**Check resources:**
```bash
# CPU and memory usage
docker stats
```

If maxed out:
- Close other applications
- Try smaller model (tinyllama)
- Add more RAM

See [Troubleshooting](Troubleshooting) for more issues.

---

## Comparison

### Mr Shomser vs ChatGPT

| Feature | Mr Shomser | ChatGPT Plus |
|---------|-----------|-------------|
| **Cost** | Free | $20/month |
| **Privacy** | 100% local | Data sent to OpenAI |
| **Speed** | 10-15s (CPU) | 2-3s |
| **Quality** | Good | Excellent |
| **Offline** | ✅ Yes | ❌ No |
| **Customizable** | ✅ Yes | ❌ Limited |
| **Open Source** | ✅ Yes | ❌ No |

### Mr Shomser vs GitHub Copilot

Different use cases:
- **Copilot:** Code completion in IDE
- **Mr Shomser:** General chat assistant

You can use both!

### Mr Shomser vs LM Studio

| Feature | Mr Shomser | LM Studio |
|---------|-----------|-----------|
| **Type** | Web app | Desktop app |
| **Setup** | Command-line | GUI installer |
| **Multi-user** | ✅ Yes | ❌ No |
| **Features** | Chat + Auth + History | Chat only |
| **Deployment** | Server-ready | Local only |

---

## Future Features

### What's coming in v2.0?

Planned features:
- 🎤 Voice input/output
- 📄 Document upload and analysis
- 🔌 Plugin system
- 📊 Usage analytics
- 🌍 Multi-language support
- 📱 Mobile apps (iOS/Android)

See [Roadmap](Roadmap) for details.

### Can I request a feature?

**Yes!** Open a [Feature Request](https://github.com/anup04sust/mrshomser/issues/new) on GitHub.

---

## Getting Help

### Where can I get help?

1. **Read the docs:**
   - [Troubleshooting Guide](Troubleshooting)
   - [Installation Guide](Installation-Guide)
   - [User Guide](User-Guide)

2. **Search GitHub Issues:**
   - [Existing issues](https://github.com/anup04sust/mrshomser/issues)

3. **Ask for help:**
   - Open a new issue
   - Email: anup.cse7@gmail.com

### How do I report a bug?

Open a [Bug Report](https://github.com/anup04sust/mrshomser/issues/new) with:
- Steps to reproduce
- Expected vs actual behavior
- Error messages
- Your system info (OS, DDEV version, etc.)

---

## Miscellaneous

### What does "DDEV" mean?

**DDEV** is a **Docker-based development environment** tool that makes it easy to set up complex local development environments with databases, web servers, and custom services.

### Why MongoDB instead of PostgreSQL?

**Flexibility:** MongoDB's JSON-like documents are natural for JavaScript and easy to evolve without migrations.

### Can I switch to PostgreSQL?

**Yes, but requires code changes:**
1. Modify `app/lib/mongodb.ts` to use PostgreSQL client
2. Update schemas to SQL tables
3. Change queries to SQL

Not recommended unless you have specific requirements.

---

**Still have questions? [Open an issue on GitHub](https://github.com/anup04sust/mrshomser/issues) or email anup.cse7@gmail.com**

# Welcome to Mr Shomser Wiki 🤖

> A privacy-first, self-hosted AI chat assistant powered by local LLMs

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/anup04sust/mrshomser/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Ollama](https://img.shields.io/badge/Ollama-phi3%3Amini-purple.svg)](https://ollama.ai/)

---

## 📚 Overview

**Mr Shomser** is a production-ready, self-hosted AI assistant that runs entirely on your local machine. No data leaves your server, no API costs, complete privacy and control.

### Why Mr Shomser?

- 🔒 **100% Privacy** - All data stays on your server
- 💰 **Zero Cost** - No monthly subscriptions or API fees
- ⚡ **Fast Performance** - Optimized for CPU inference (10-15s response time)
- 🎯 **Production Ready** - Complete authentication, persistence, and documentation
- 🛠️ **Developer Friendly** - Full API, comprehensive docs, easy setup with DDEV

---

## 🚀 Quick Navigation

### Getting Started
- **[Installation Guide](Installation-Guide)** - Complete setup instructions
- **[Quick Start](Quick-Start)** - Get running in 5 minutes
- **[Configuration](Configuration)** - Environment variables and settings
- **[First Chat](First-Chat)** - Your first conversation setup

### Usage & Features
- **[User Guide](User-Guide)** - How to use all features
- **[Authentication](Authentication)** - Login, register, guest sessions
- **[Multi-Chat Management](Multi-Chat-Management)** - Managing multiple conversations
- **[Markdown Support](Markdown-Support)** - Formatting and code blocks

### Development
- **[API Reference](API-Reference)** - Complete API documentation
- **[Architecture](Architecture)** - System design and components
- **[Database Schema](Database-Schema)** - MongoDB collections and structure
- **[Contributing](Contributing)** - How to contribute to the project

### Deployment & Operations
- **[Production Deployment](Production-Deployment)** - Deploy to production
- **[Docker Guide](Docker-Guide)** - Container-based deployment
- **[Performance Tuning](Performance-Tuning)** - Optimize for your hardware
- **[Troubleshooting](Troubleshooting)** - Common issues and solutions

### Advanced Topics
- **[Model Selection](Model-Selection)** - Choosing the right AI model
- **[Custom Models](Custom-Models)** - Using different Ollama models
- **[Security Best Practices](Security-Best-Practices)** - Hardening your deployment
- **[Backup & Recovery](Backup-Recovery)** - Data backup strategies

### Reference
- **[FAQ](FAQ)** - Frequently Asked Questions
- **[Changelog](Changelog)** - Version history
- **[Roadmap](Roadmap)** - Future features and plans
- **[Glossary](Glossary)** - Technical terms explained

---

## 🎯 Key Features

### Core Functionality
- ✅ **Real-time AI Streaming** - Server-Sent Events (SSE) for live responses
- ✅ **Chat Persistence** - MongoDB-backed conversation history
- ✅ **Multi-Chat Support** - Multiple conversation threads
- ✅ **User Authentication** - JWT-based with guest sessions
- ✅ **Markdown Rendering** - Full markdown with code syntax highlighting

### User Experience
- ✅ **Dark Mode** - Beautiful dark theme interface
- ✅ **Mobile Responsive** - Works perfectly on all devices
- ✅ **Auto-save** - Never lose your conversations
- ✅ **Quick Actions** - Copy messages, continue truncated responses
- ✅ **Session Management** - 30-day guest sessions

### Technical Excellence
- ✅ **TypeScript** - Type-safe development
- ✅ **Next.js 16** - App Router with React 19
- ✅ **API Routes** - RESTful endpoints with proper error handling
- ✅ **Ollama Integration** - Seamless local LLM inference
- ✅ **DDEV Setup** - One-command development environment

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19, TypeScript | UI framework and type safety |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Backend** | Next.js API Routes | Serverless-style endpoints |
| **AI Engine** | Ollama (phi3:mini 2.3GB) | Local LLM inference |
| **Database** | MongoDB | Chat and user persistence |
| **Auth** | JWT + bcrypt | Secure authentication |
| **Dev Env** | DDEV + Docker | Containerized development |
| **Package Manager** | pnpm | Fast, efficient dependencies |

---

## 📊 Project Stats

- **Version:** 1.0.0 (Production Ready)
- **Model Size:** 2.3GB (phi3:mini)
- **Response Time:** 10-15 seconds (CPU)
- **Token Limit:** 512 tokens per response
- **Context Window:** 2048 tokens
- **Lines of Code:** 3,500+
- **Languages:** TypeScript, TSX, CSS

---

## 🎓 Learning Resources

### For Beginners
1. Start with **[Quick Start](Quick-Start)** to get the app running
2. Read **[User Guide](User-Guide)** to understand features
3. Check **[FAQ](FAQ)** for common questions

### For Developers
1. Review **[Architecture](Architecture)** to understand the system
2. Study **[API Reference](API-Reference)** for integration
3. Follow **[Contributing](Contributing)** to make changes

### For DevOps
1. Read **[Production Deployment](Production-Deployment)** for hosting
2. Check **[Performance Tuning](Performance-Tuning)** for optimization
3. Review **[Security Best Practices](Security-Best-Practices)**

---

## 🤝 Community & Support

### Get Help
- 📖 **[FAQ](FAQ)** - Answers to common questions
- 🐛 **[Troubleshooting](Troubleshooting)** - Solve common issues
- 💬 **[GitHub Issues](https://github.com/anup04sust/mrshomser/issues)** - Report bugs
- 📧 **Email:** anup.cse7@gmail.com

### Contribute
- 🔧 **[Contributing Guide](Contributing)** - How to contribute
- 🎯 **[Good First Issues](https://github.com/anup04sust/mrshomser/labels/good%20first%20issue)** - Start here
- 🗺️ **[Roadmap](Roadmap)** - Planned features

### Stay Updated
- ⭐ **Star the repo** on [GitHub](https://github.com/anup04sust/mrshomser)
- 📋 **Watch releases** for updates
- 💼 **Follow on [LinkedIn](https://linkedin.com/in/anup-biswas)**

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Feel free to use, modify, and distribute this project for personal or commercial purposes.

---

## 👨‍💻 About the Developer

**Anup Biswas**  
Technical Lead & Solution Architect  
14+ years in enterprise web applications

- 💼 [LinkedIn](https://linkedin.com/in/anup-biswas)
- 🐙 [GitHub](https://github.com/anupbiswas)
- 🌐 [Drupal.org](https://drupal.org/u/anup-biswas)
- 📧 anup.cse7@gmail.com

---

## 🙏 Acknowledgments

This project is built with amazing open-source technologies:

- **[Ollama](https://ollama.ai/)** - Local LLM inference engine
- **[Next.js](https://nextjs.org/)** - React framework
- **[MongoDB](https://www.mongodb.com/)** - Database
- **[DDEV](https://ddev.com/)** - Development environment
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework

---

## 🚀 Ready to Get Started?

👉 **[Installation Guide](Installation-Guide)** - Set up Mr Shomser in 5 minutes  
👉 **[Quick Start](Quick-Start)** - Your first conversation  
👉 **[User Guide](User-Guide)** - Learn all the features

---

**Built with ❤️ for privacy-conscious developers**

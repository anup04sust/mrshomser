# Model Selection Guide

Choose the right AI model for your needs and hardware.

---

## 🎯 Quick Recommendations

| Your Situation | Recommended Model | Size |
|----------------|------------------|------|
| **First time / Testing** | phi3:mini | 2.3GB |
| **CPU only** | phi3:mini | 2.3GB |
| **Fast responses needed** | tinyllama:1.1b | 637MB |
| **Best quality (GPU)** | llama2 or mistral | 3.8-4.1GB |
| **Limited RAM (< 8GB)** | tinyllama:1.1b | 637MB |
| **Best balanced** | phi3:mini | 2.3GB ⭐ **Default** |

---

## 📊 Available Models Comparison

### Small Models (< 2GB)

#### tinyllama:1.1b
- **Size:** 637MB
- **Pros:** Very fast (2-3 seconds), minimal RAM
- **Cons:** Limited quality, may make mistakes
- **Best for:** Testing, low-end hardware, quick replies
- **Speed:** ⚡⚡⚡⚡⚡ (5/5)
- **Quality:** ⭐⭐ (2/5)

```bash
ddev exec -s ollama "ollama pull tinyllama:1.1b"
```

---

### Medium Models (2-3GB)

#### phi3:mini ⭐ **RECOMMENDED**
- **Size:** 2.3GB
- **Pros:** Great balance, good English, CPU-friendly
- **Cons:** Slightly slower than tinyllama
- **Best for:** Most users, production use
- **Speed:** ⚡⚡⚡⚡ (4/5)
- **Quality:** ⭐⭐⭐⭐ (4/5)

```bash
ddev exec -s ollama "ollama pull phi3:mini"
```

**Why phi3:mini is default:**
- Optimized by Microsoft for efficiency
- Great English comprehension
- Works well on CPU
- Small enough for 8GB RAM systems

---

### Large Models (3-5GB)

#### llama2
- **Size:** 3.8GB
- **Pros:** Excellent quality, versatile
- **Cons:** Slower on CPU (20-30 seconds)
- **Best for:** GPU users, quality over speed
- **Speed:** ⚡⚡ (2/5 on CPU), ⚡⚡⚡⚡⚡ (5/5 on GPU)
- **Quality:** ⭐⭐⭐⭐⭐ (5/5)

```bash
ddev exec -s ollama "ollama pull llama2"
```

#### mistral
- **Size:** 4.1GB
- **Pros:** High quality, good reasoning
- **Cons:** Requires GPU for good speed
- **Best for:** Complex questions, GPU hardware
- **Speed:** ⚡⚡ (2/5 on CPU), ⚡⚡⚡⚡⚡ (5/5 on GPU)
- **Quality:** ⭐⭐⭐⭐⭐ (5/5)

```bash
ddev exec -s ollama "ollama pull mistral"
```

---

### Specialized Models

#### codellama
- **Size:** 3.8GB
- **Specialization:** Code generation and explanation
- **Best for:** Programming help, code review
- **Speed:** ⚡⚡ (2/5 on CPU)
- **Quality (code):** ⭐⭐⭐⭐⭐ (5/5)

```bash
ddev exec -s ollama "ollama pull codellama"
```

#### llama2-uncensored
- **Size:** 3.8GB
- **Note:** No content filtering
- **Caution:** May generate inappropriate content
- **Best for:** Creative writing, fiction

```bash
ddev exec -s ollama "ollama pull llama2-uncensored"
```

---

## 💻 Hardware Requirements

### RAM Requirements

| Model | Minimum RAM | Recommended RAM |
|-------|------------|----------------|
| tinyllama:1.1b | 4GB | 6GB |
| phi3:mini | 6GB | 8GB |
| llama2 | 8GB | 12GB |
| mistral | 10GB | 16GB |

**Formula:** Model size × 1.5 = required RAM

**Why?** Models need extra memory for inference and context.

---

### CPU vs GPU

#### CPU Performance

| Processor | phi3:mini Speed | llama2 Speed |
|-----------|----------------|-------------|
| Intel i5 (4 cores) | 15-20s | 30-40s |
| Intel i7 (8 cores) | 10-15s | 20-30s |
| AMD Ryzen 5 | 12-18s | 25-35s |
| AMD Ryzen 7 | 8-12s | 18-25s |
| Apple M1 | 8-10s | 15-20s |
| Apple M2 | 6-8s | 12-15s |

#### GPU Performance

| GPU | phi3:mini Speed | llama2 Speed |
|-----|----------------|-------------|
| GTX 1660 | 2-3s | 4-5s |
| RTX 3060 | 1-2s | 2-3s |
| RTX 4070 | 0.5-1s | 1-2s |
| RTX 4090 | 0.3-0.5s | 0.5-1s |

**GPU = 10-20x faster!**

---

## 🔄 Changing Models

### Step 1: Pull the new model

```bash
# List available models
ddev exec -s ollama "ollama list"

# Pull desired model
ddev exec -s ollama "ollama pull <model-name>"

# Example
ddev exec -s ollama "ollama pull llama2"
```

### Step 2: Update environment variable

Edit `.env.local`:
```env
# Change from:
OLLAMA_MODEL=phi3:mini

# To:
OLLAMA_MODEL=llama2
```

### Step 3: Restart the application

```bash
# Kill Next.js
ddev exec pkill -f next-server

# Restart
ddev exec pnpm dev --hostname 0.0.0.0
```

Or restart entire DDEV:
```bash
ddev restart
```

---

## ⚙️ Model Configuration

### Default Settings

Located in `app/api/chat/route.ts`:

```typescript
const ollamaResponse = await fetch(`${OLLAMA_API_URL}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: process.env.OLLAMA_MODEL || 'phi3:mini',
    prompt: fullPrompt,
    stream: true,
    system: SYSTEM_PROMPT,
    options: {
      num_ctx: 2048,        // Context window
      num_predict: 512,     // Max output tokens
      temperature: 0.7,     // Creativity (0-1)
      top_p: 0.9,          // Nucleus sampling
      top_k: 40,           // Top-k sampling
    }
  })
});
```

### Tuning Parameters

#### num_ctx (Context Window)
- **What it is:** How much conversation history the model remembers
- **Default:** 2048 tokens
- **Trade-off:** More context = slower, better understanding

```typescript
num_ctx: 1024  // Faster, less context
num_ctx: 4096  // Slower, more context
```

#### num_predict (Max Tokens)
- **What it is:** Maximum response length
- **Default:** 512 tokens (~400 words)
- **Trade-off:** Longer = more complete but slower

```typescript
num_predict: 256   // Shorter, faster
num_predict: 1024  // Longer, slower
```

#### temperature (Creativity)
- **What it is:** How creative/random the responses are
- **Default:** 0.7
- **Range:** 0.0 (deterministic) to 1.0 (very creative)

```typescript
temperature: 0.3   // More focused, factual
temperature: 0.9   // More creative, varied
```

#### top_p (Nucleus Sampling)
- **What it is:** Probability cutoff for word selection
- **Default:** 0.9
- **Range:** 0.0 to 1.0

```typescript
top_p: 0.5   // More conservative
top_p: 0.95  // More diverse
```

---

## 🎯 Use Case Recommendations

### For General Chat
**Best:** phi3:mini
```bash
ddev exec -s ollama "ollama pull phi3:mini"
```
**Config:**
```typescript
num_ctx: 2048
num_predict: 512
temperature: 0.7
```

---

### For Coding Help
**Best:** codellama
```bash
ddev exec -s ollama "ollama pull codellama"
```
**Config:**
```typescript
num_ctx: 4096      // More context for code
num_predict: 1024  // Longer code blocks
temperature: 0.3   // More precise
```

---

### For Creative Writing
**Best:** llama2
```bash
ddev exec -s ollama "ollama pull llama2"
```
**Config:**
```typescript
num_ctx: 2048
num_predict: 1024  // Longer stories
temperature: 0.9   // More creative
```

---

### For Quick Answers
**Best:** tinyllama:1.1b
```bash
ddev exec -s ollama "ollama pull tinyllama:1.1b"
```
**Config:**
```typescript
num_ctx: 1024      // Less context
num_predict: 256   // Shorter answers
temperature: 0.5   // Focused
```

---

## 📈 Benchmarks

### Response Time (CPU: Intel i7-10700K)

| Model | First Response | Subsequent | Quality |
|-------|---------------|-----------|---------|
| tinyllama:1.1b | 2-3s | 1-2s | Fair |
| phi3:mini | 10-15s | 8-12s | Good |
| llama2 | 25-35s | 20-30s | Excellent |
| mistral | 30-40s | 25-35s | Excellent |

### Response Time (GPU: RTX 3060)

| Model | First Response | Subsequent | Quality |
|-------|---------------|-----------|---------|
| tinyllama:1.1b | 0.5s | 0.3s | Fair |
| phi3:mini | 1-2s | 0.8-1.5s | Good |
| llama2 | 2-3s | 1.5-2.5s | Excellent |
| mistral | 3-4s | 2-3s | Excellent |

---

## 🔍 Model Details

### Browse All Models

Visit Ollama library: https://ollama.ai/library

Popular models:
- **phi3** family (mini, medium, large)
- **llama2** family (7b, 13b, 70b)
- **mistral** (7b, instruct)
- **codellama** (code, python, instruct)
- **vicuna** (7b, 13b)
- **orca-mini** (3b, 7b, 13b)

### Model Tags

```bash
# List available tags for a model
ddev exec -s ollama "ollama list"

# Example: llama2 variants
llama2:latest      # 7B model (3.8GB)
llama2:13b         # 13B model (7.3GB)
llama2:70b         # 70B model (39GB)
llama2:7b-chat     # Chat-optimized 7B
```

---

## 🛠️ Advanced: Custom Models

### Creating a Custom Model

Create `Modelfile`:
```dockerfile
FROM phi3:mini

# Set parameters
PARAMETER temperature 0.8
PARAMETER num_ctx 4096

# Set system prompt
SYSTEM """
You are a helpful coding assistant specialized in JavaScript.
You provide clear, concise code examples with explanations.
"""
```

Create custom model:
```bash
ddev exec -s ollama "ollama create my-custom-model -f Modelfile"
```

Use it:
```env
OLLAMA_MODEL=my-custom-model
```

---

## 📚 Related Documentation

- [Installation Guide](Installation-Guide) - Setup models
- [Performance Tuning](Performance-Tuning) - Optimize speed
- [Architecture](Architecture) - How models integrate
- [Troubleshooting](Troubleshooting) - Model issues

---

**Need help choosing? Start with phi3:mini - it works great for most users! ⭐**

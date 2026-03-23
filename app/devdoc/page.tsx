import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Developer Documentation - Mr Shomser',
  description: 'Complete developer documentation for Mr Shomser AI Assistant',
};

export default function DevDocPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="Mr Shomser"
                width={64}
                height={64}
                className="mb-6 hover:scale-110 transition-transform cursor-pointer"
              />
            </Link>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Developer Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Technical guide for Mr Shomser AI Assistant
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <a
            href="#tech-stack"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="text-2xl mb-2">🏗️</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Tech Stack</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Architecture & technologies</p>
          </a>
          <a
            href="#api-docs"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="text-2xl mb-2">🔌</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">API Reference</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Endpoints & usage</p>
          </a>
          <a
            href="#setup"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Setup Guide</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Installation & configuration</p>
          </a>
        </div>

        {/* Tech Stack */}
        <section id="tech-stack" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
            <span>🏗️</span>
            Tech Stack
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Frontend</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">▸</span>
                  <strong>Next.js 16</strong> - React framework with App Router
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">▸</span>
                  <strong>TypeScript</strong> - Type-safe development
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">▸</span>
                  <strong>Tailwind CSS</strong> - Utility-first styling
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">▸</span>
                  <strong>React Markdown</strong> - Message rendering
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Backend</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">▸</span>
                  <strong>Next.js API Routes</strong> - Serverless functions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">▸</span>
                  <strong>Ollama</strong> - Local LLM inference (phi3:mini)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">▸</span>
                  <strong>MongoDB</strong> - Chat persistence
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">▸</span>
                  <strong>JWT Auth</strong> - User authentication
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Development Environment</h4>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <strong>DDEV</strong> - Docker-based local development with nginx, PHP-FPM, MongoDB, and Ollama containers
            </p>
          </div>
        </section>

        {/* API Documentation */}
        <section id="api-docs" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
            <span>🔌</span>
            API Reference
          </h2>

          {/* Chat API */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Chat API</h3>
            
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-mono rounded">POST</span>
                <code className="text-sm text-gray-900 dark:text-white">/api/chat</code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Stream AI responses using Server-Sent Events (SSE)</p>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  View Request/Response Examples
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request Body:</p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "messages": [
    {
      "role": "user",
      "content": "Hello, who are you?"
    }
  ]
}`}</pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response (SSE Stream):</p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`data: {"content":"Hello"}
data: {"content":"!"}
data: {"content":" I"}
data: {"content":"'m"}
data: {"content":" Mr"}
data: {"content":" Shomser"}
data: {"truncated":true,"message":"[Response truncated]"}`}</pre>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Chats API */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Chats Management</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm font-mono rounded">GET</span>
                  <code className="text-sm text-gray-900 dark:text-white">/api/chats</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get all chats for current session</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-mono rounded">POST</span>
                  <code className="text-sm text-gray-900 dark:text-white">/api/chats</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create a new chat</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-mono rounded">PUT</span>
                  <code className="text-sm text-gray-900 dark:text-white">/api/chats/:id</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update chat messages and metadata</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-mono rounded">DELETE</span>
                  <code className="text-sm text-gray-900 dark:text-white">/api/chats/:id</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delete a chat permanently</p>
              </div>
            </div>
          </div>

          {/* Auth API */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Authentication</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-mono rounded">POST</span>
                  <code className="text-sm text-gray-900 dark:text-white">/api/auth/register</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Register new user account</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-mono rounded">POST</span>
                  <code className="text-sm text-gray-900 dark:text-white">/api/auth/login</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Login with credentials</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-mono rounded">POST</span>
                  <code className="text-sm text-gray-900 dark:text-white">/api/auth/logout</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Logout and clear session cookies</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm font-mono rounded">GET</span>
                  <code className="text-sm text-gray-900 dark:text-white">/api/auth/me</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get current user info</p>
              </div>
            </div>
          </div>
        </section>

        {/* Setup Guide */}
        <section id="setup" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
            <span>⚙️</span>
            Setup Guide
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Prerequisites</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  DDEV (Docker-based development environment)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Node.js 18+ / pnpm
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Ollama (for local LLM)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  MongoDB
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Installation</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">1. Start DDEV:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`ddev start`}</pre>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">2. Install dependencies:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`ddev exec pnpm install`}</pre>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">3. Configure environment:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`cp .env.example .env.local
# Edit .env.local with your configuration`}</pre>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">4. Start development server:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`ddev exec pnpm dev`}</pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Environment Variables</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`# Ollama Configuration
OLLAMA_API_URL=http://ollama:11434
OLLAMA_MODEL=phi3:mini

# MongoDB Configuration
MONGODB_URI=mongodb://db:db@mongo:27017/mrshomser?authSource=admin
MONGODB_DB=mrshomser

# App Configuration
NEXT_PUBLIC_APP_NAME=Mr Shomser

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456`}</pre>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
            <span>✨</span>
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">🤖 AI Streaming</h4>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Real-time streaming responses using Server-Sent Events (SSE) for instant feedback
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">💾 Chat Persistence</h4>
              <p className="text-sm text-purple-800 dark:text-purple-400">
                MongoDB-backed chat history with session-based isolation
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">🔐 Authentication</h4>
              <p className="text-sm text-green-800 dark:text-green-400">
                JWT-based auth with guest sessions, no account required for basic use
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">⚡ Performance</h4>
              <p className="text-sm text-orange-800 dark:text-orange-400">
                Optimized phi3:mini model for fast CPU inference (10-15s response time)
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg border border-pink-200 dark:border-pink-800">
              <h4 className="font-semibold text-pink-900 dark:text-pink-300 mb-2">🎨 Dark Mode</h4>
              <p className="text-sm text-pink-800 dark:text-pink-400">
                Full dark mode support with Tailwind CSS theme switching
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">📱 Responsive</h4>
              <p className="text-sm text-indigo-800 dark:text-indigo-400">
                Mobile-first design with offcanvas navigation for small screens
              </p>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
            <span>📖</span>
            Additional Resources
          </h2>

          <div className="space-y-4">
            <Link
              href="/"
              className="block p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span>🏠</span>
                Home - Try the Chat
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Experience the AI assistant in action
              </p>
            </Link>

            <Link
              href="/about"
              className="block p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span>👤</span>
                About - Project Overview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learn about the project and developer
              </p>
            </Link>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span>💻</span>
                GitHub Repository
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View source code and contribute
              </p>
            </a>
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Mr Shomser
          </Link>
        </div>
      </div>
    </div>
  );
}

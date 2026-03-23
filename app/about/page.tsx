import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'About - Mr Shomser',
  description: 'Learn about Mr Shomser - Your AI-powered assistant built with modern tech stack',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.svg"
              alt="Mr Shomser"
              width={100}
              height={100}
              className="mx-auto"
            />
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Mr Shomser
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your Smartest AI Companion
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            What is Mr Shomser?
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mr Shomser is a playful yet powerful AI assistant designed to feel like your smartest 
              (and slightly overconfident) friend. Built with cutting-edge technology, it provides 
              intelligent responses to help you with various tasks and questions.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Whether you need programming advice, learning resources, or just want to chat about 
              technology, Mr Shomser is here to help with practical solutions and friendly guidance.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 mt-8">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Next.js 16</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Modern React framework for production-grade applications
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Ollama</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Local LLM for privacy-first AI conversations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">DB</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">MongoDB</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  NoSQL database for flexible data storage
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">DDEV</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Docker-based development environment
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 mt-8">
            Key Features
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Self-Hosted & Private</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your conversations stay on your device. No data sent to external servers.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">�</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Context-Aware</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Provides intelligent, context-aware responses tailored to your needs.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Fast & Responsive</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built with modern tech stack for instant responses and smooth experience.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🍪</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Local Storage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chats saved in your browser for 30 days. No account required.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Developer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            About the Developer
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Anup Biswas</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Technical Lead & Solution Architect
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                With 14+ years of experience in designing and delivering enterprise-grade digital platforms, 
                specializing in solution architecture, full-stack development, and modern web technologies.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Location:</strong> Dhaka, Bangladesh
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:anup04sust@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    anup04sust@gmail.com
                  </a>
                </p>
              </div>
            </div>
            <div className="flex md:flex-col gap-3">
              <a
                href="https://linkedin.com/in/anup04sust"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              <a
                href="https://github.com/anup04sust"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                GitHub
              </a>
              <a
                href="https://www.drupal.org/u/anup04sust"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.78 5.113C14.09 3.425 12.48 1.815 11.998 0c-.48 1.815-2.09 3.425-3.778 5.113-2.534 2.53-5.405 5.4-5.405 9.702a9.184 9.184 0 1018.368 0c0-4.303-2.871-7.171-5.405-9.702M8.18 18.104a7.485 7.485 0 01-1.69-3.06.738.738 0 111.38-.516 5.978 5.978 0 001.351 2.45c.319.319.14.897-.322.897a.527.527 0 01-.72-.771"/>
                </svg>
                Drupal
              </a>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Chat
          </Link>
        </div>
      </div>
    </div>
  );
}

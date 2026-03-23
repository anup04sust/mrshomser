import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Mr Shomser',
  description: 'Privacy policy for Mr Shomser AI assistant',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.svg"
              alt="Mr Shomser"
              width={80}
              height={80}
              className="mx-auto"
            />
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: March 23, 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              At Mr Shomser, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, and protect your information when you use our AI assistant service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We collect the following types of information:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li><strong>Chat Messages:</strong> Your conversations with the AI assistant</li>
              <li><strong>User Name:</strong> Optional name for personalization (stored locally)</li>
              <li><strong>Browser Data:</strong> Standard browser information (user agent, language preference)</li>
              <li><strong>Usage Data:</strong> How you interact with the service (timestamps, features used)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your information is used for:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li>Providing AI-powered chat responses</li>
              <li>Maintaining chat history for your convenience</li>
              <li>Improving the quality and accuracy of responses</li>
              <li>Monitoring and improving service performance</li>
              <li>Debugging and fixing technical issues</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Data Storage & Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Local Storage:</strong> Chat history is stored in your browser&apos;s local storage 
              for up to 30 days. You can clear this at any time through your browser settings.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              <strong>Database Storage:</strong> Chats are also stored in our MongoDB database to enable 
              cross-device synchronization (if logged in). All data is encrypted in transit and at rest.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Self-Hosted AI Model
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Mr Shomser uses Ollama, a self-hosted AI model. This means:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li>Your conversations are NOT sent to third-party AI services (like OpenAI or Google)</li>
              <li>AI processing happens on our own servers</li>
              <li>We have full control over data privacy and security</li>
              <li>No external companies have access to your chat data</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Data Sharing & Third Parties
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We do NOT sell, rent, or share your personal information with third parties. 
              Your chat data remains private and is only accessible to you and our service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Cookies & Tracking
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We use minimal cookies and browser storage only for essential functionality:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li>Session management (keeping you logged in if you register)</li>
              <li>Preserving your chat history locally</li>
              <li>Remembering your preferences (theme, language)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We do NOT use tracking cookies, analytics, or advertising cookies.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Your Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Delete:</strong> Delete your chats individually or clear all data</li>
              <li><strong>Export:</strong> Download your chat history</li>
              <li><strong>Opt-out:</strong> Stop using the service at any time</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Chat history is automatically retained for 30 days in browser storage. 
              Database records are kept until you manually delete them or clear your account.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Mr Shomser is not intended for children under 13. We do not knowingly collect 
              personal information from children. If you believe a child has provided us with 
              personal information, please contact us to have it removed.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Changes to Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any 
              significant changes by updating the &quot;Last updated&quot; date. Your continued use of 
              Mr Shomser constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              If you have questions or concerns about this Privacy Policy, please contact:
              <br /><br />
              <strong>Email:</strong>{' '}
              <a href="mailto:anup04sust@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                anup04sust@gmail.com
              </a>
              <br />
              <strong>Developer:</strong> Anup Biswas
              <br />
              <strong>Location:</strong> Dhaka, Bangladesh
            </p>
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

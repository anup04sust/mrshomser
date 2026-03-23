'use client';

import { useState } from 'react';
import { Chat } from '../types/chat';
import Image from 'next/image';
import AuthModal from './AuthModal';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  userName?: string;
  onUserLogin?: (userName: string) => void;
  onUserLogout?: () => void;
}

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle,
  userName,
  onUserLogin,
  onUserLogout,
}: SidebarProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem('userName');
      localStorage.clear(); // Clear all localStorage
      
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'same-origin' // Ensure cookies are sent
      });
      
      // Force page reload to create new guest session with fresh state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, force reload to clear state
      window.location.href = '/';
    }
  };
  const sortedChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-full bg-gray-900 text-white flex flex-col transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } w-64`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-2">
          {sortedChats.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm">
              No chats yet.<br />Start a new conversation!
            </div>
          ) : (
            <div className="space-y-1">
              {sortedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    chat.id === currentChatId
                      ? 'bg-gray-800'
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="flex-1 truncate text-sm">{chat.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 hover:bg-gray-700 rounded transition-opacity"
                    title="Delete chat"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Guest User */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="relative flex-shrink-0">
              <Image
                src="/user-avatar.svg"
                alt={userName || 'Guest'}
                width={32}
                height={32}
                className="w-8 h-8 p-[3px] rounded-full ring-2 ring-gray-700"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-white">{userName || 'Guest'}</div>
            </div>

            {/* Login/Logout Button */}
            {!userName ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-md transition-all transform hover:scale-105"
              >
                Login
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="flex-shrink-0 p-2 hover:bg-gray-800 rounded-md transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={onUserLogin}
      />
    </>
  );
}

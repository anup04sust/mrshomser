'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { Message, Chat } from '../types/chat';
import Sidebar from './Sidebar';
import MarkdownMessage from './MarkdownMessage';
import OffcanvasMenu from './OffcanvasMenu';

// Helper function to detect incomplete responses
function isResponseIncomplete(content: string): boolean {
  if (!content || content.trim().length === 0) return false;
  
  // Check for unclosed code blocks
  const codeBlockMatches = content.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    return true;
  }
  
  // Check if ends with incomplete sentence indicators
  const trimmed = content.trim();
  const lastChar = trimmed[trimmed.length - 1];
  
  // If ends with mid-word indicators or incomplete punctuation
  if ([',', ':', ';', '-', '(', '[', '{'].includes(lastChar)) {
    return true;
  }
  
  // Check if last line appears incomplete (e.g., "# Create a")
  const lines = content.split('\n');
  const lastLine = lines[lines.length - 1].trim();
  
  // If last line is very short and doesn't end with punctuation (for code/comments)
  if (lastLine.length > 0 && lastLine.length < 50) {
    const endsWithPunctuation = /[.!?;}\])>\"`']$/.test(lastLine);
    const startsWithCodeComment = /^(#|\/\/|<!--)/.test(lastLine);
    
    if (startsWithCodeComment && !endsWithPunctuation) {
      return true;
    }
  }
  
  return false;
}

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [truncatedMessages, setTruncatedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.user) {
          setUserName(data.user.name);
          localStorage.setItem('userName', data.user.name);
        } else {
          // Check localStorage as fallback
          const savedUser = localStorage.getItem('userName');
          if (savedUser) {
            setUserName(savedUser);
          }
        }
      } catch (error) {
        // Fallback to localStorage
        const savedUser = localStorage.getItem('userName');
        if (savedUser) {
          setUserName(savedUser);
        }
      }
    };
    checkAuth();
  }, []);

  // Load chats from API on mount
  useEffect(() => {
    console.log('ChatInterface mounted, loading chats...');
    // Add a safety timeout
    const timeout = setTimeout(() => {
      console.log('Safety timeout reached - forcing load complete');
      setIsFetching(false);
    }, 3000);
    
    loadChats().finally(() => clearTimeout(timeout));
  }, []);

  const handleUserLogout = async () => {
    // Clear user state
    setUserName('');
    
    // Clear all chats and current chat
    setChats([]);
    setCurrentChatId(null);
    
    // Reload chats which will create a new guest session
    await loadChats();
  };

  const loadChats = async () => {
    try {
      console.log('loadChats() called');
      setIsFetching(true);
      setLoadError(false);
      const response = await fetch('/api/chats');
      console.log('API response:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded chats:', data);
        setChats(data.chats || []);
        if (data.chats && data.chats.length > 0) {
          setCurrentChatId(data.chats[0].id);
        }
      } else {
        console.error('API error:', response.status);
        setLoadError(true);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setLoadError(true);
    } finally {
      console.log('Setting isFetching to false');
      setIsFetching(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, currentChatId]);

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const generateTitle = (firstMessage: string): string => {
    const cleaned = firstMessage.trim().substring(0, 50);
    return cleaned.length < firstMessage.trim().length ? `${cleaned}...` : cleaned;
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat', messages: [] }),
      });

      if (response.ok) {
        const data = await response.json();
        setChats(prev => [data.chat, ...prev]);
        setCurrentChatId(data.chat.id);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId) {
          const remaining = chats.filter(chat => chat.id !== chatId);
          setCurrentChatId(remaining[0]?.id || null);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const updateChat = async (chatId: string, updates: Partial<Chat>) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Don't update state from server - keep local state as source of truth during conversation
        // Only update if we need to sync specific fields
        const data = await response.json();
        // Optionally update only non-message fields like title
        setChats(prev => prev.map(chat => 
          chat.id === chatId ? { ...chat, title: data.chat.title, updatedAt: data.chat.updatedAt } : chat
        ));
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    let chatId = currentChatId;

    // Create new chat if none exists
    if (!chatId) {
      try {
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: generateTitle(input),
            messages: [],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setChats(prev => [data.chat, ...prev]);
          chatId = data.chat.id;
          setCurrentChatId(chatId);
        } else {
          console.error('Failed to create chat');
          return;
        }
      } catch (error) {
        console.error('Error creating chat:', error);
        return;
      }
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    // Optimistically update UI
    const currentChatData = chats.find(c => c.id === chatId);
    const updatedMessages = [...(currentChatData?.messages || []), userMessage];
    
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? {
            ...chat,
            messages: updatedMessages,
            title: chat.messages.length === 0 ? generateTitle(input) : chat.title,
            updatedAt: Date.now(),
          }
        : chat
    ));

    setInput('');
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? {
            ...chat,
            messages: [...chat.messages, assistantMessage],
            updatedAt: Date.now(),
          }
        : chat
    ));

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                
                // Handle content chunks
                if (parsed.content) {
                  accumulatedContent += parsed.content;
                  
                  // Update message in real-time
                  setChats(prev => prev.map(chat =>
                    chat.id === chatId
                      ? {
                          ...chat,
                          messages: chat.messages.map(msg =>
                            msg.id === assistantMessage.id
                              ? { ...msg, content: accumulatedContent }
                              : msg
                          ),
                        }
                      : chat
                  ));
                }
                
                // Handle truncation warning
                if (parsed.truncated && parsed.message) {
                  accumulatedContent += parsed.message;
                  
                  // Mark this message as truncated
                  setTruncatedMessages(prev => new Set(prev).add(assistantMessage.id));
                  
                  // Update with truncation warning
                  setChats(prev => prev.map(chat =>
                    chat.id === chatId
                      ? {
                          ...chat,
                          messages: chat.messages.map(msg =>
                            msg.id === assistantMessage.id
                              ? { ...msg, content: accumulatedContent }
                              : msg
                          ),
                        }
                      : chat
                  ));
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Check if response appears incomplete (client-side detection)
      if (accumulatedContent && isResponseIncomplete(accumulatedContent)) {
        setTruncatedMessages(prev => new Set(prev).add(assistantMessage.id));
      }

      // Save to database after streaming completes
      if (chatId && accumulatedContent) {
        // Update local state one final time to ensure we have the complete message
        setChats(prev => prev.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ),
                updatedAt: Date.now(),
              }
            : chat
        ));

        // Save to database (this won't replace local state anymore)
        const chatToUpdate = chats.find(c => c.id === chatId);
        if (chatToUpdate) {
          const finalMessages = chatToUpdate.messages.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: accumulatedContent }
              : msg
          );
          
          await updateChat(chatId, {
            messages: finalMessages,
            title: chatToUpdate.messages.length === 2 ? generateTitle(userMessage.content) : chatToUpdate.title,
          });
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error sending message:', error);
        
        // Update with error message
        setChats(prev => prev.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: 'Sorry, something went wrong. Please try again! 😅' }
                    : msg
                ),
              }
            : chat
        ));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const continueResponse = async () => {
    if (isLoading || !currentChatId) return;
    
    const continuationMessage = 'Please continue from where you left off.';
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: continuationMessage,
      timestamp: Date.now(),
    };

    // Optimistically update UI
    const currentChatData = chats.find(c => c.id === currentChatId);
    const updatedMessages = [...(currentChatData?.messages || []), userMessage];
    
    setChats(prev => prev.map(chat =>
      chat.id === currentChatId
        ? {
            ...chat,
            messages: updatedMessages,
            updatedAt: Date.now(),
          }
        : chat
    ));

    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setChats(prev => prev.map(chat =>
      chat.id === currentChatId
        ? {
            ...chat,
            messages: [...chat.messages, assistantMessage],
            updatedAt: Date.now(),
          }
        : chat
    ));

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                
                // Handle content chunks
                if (parsed.content) {
                  accumulatedContent += parsed.content;
                  
                  // Update message in real-time
                  setChats(prev => prev.map(chat =>
                    chat.id === currentChatId
                      ? {
                          ...chat,
                          messages: chat.messages.map(msg =>
                            msg.id === assistantMessage.id
                              ? { ...msg, content: accumulatedContent }
                              : msg
                          ),
                        }
                      : chat
                  ));
                }
                
                // Handle truncation warning
                if (parsed.truncated && parsed.message) {
                  accumulatedContent += parsed.message;
                  
                  // Mark this message as truncated
                  setTruncatedMessages(prev => new Set(prev).add(assistantMessage.id));
                  
                  // Update with truncation warning
                  setChats(prev => prev.map(chat =>
                    chat.id === currentChatId
                      ? {
                          ...chat,
                          messages: chat.messages.map(msg =>
                            msg.id === assistantMessage.id
                              ? { ...msg, content: accumulatedContent }
                              : msg
                          ),
                        }
                      : chat
                  ));
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Check if response appears incomplete (client-side detection)
      if (accumulatedContent && isResponseIncomplete(accumulatedContent)) {
        setTruncatedMessages(prev => new Set(prev).add(assistantMessage.id));
      }

      // Save to database after streaming completes
      if (currentChatId && accumulatedContent) {
        setChats(prev => prev.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ),
                updatedAt: Date.now(),
              }
            : chat
        ));

        const chatToUpdate = chats.find(c => c.id === currentChatId);
        if (chatToUpdate) {
          const finalMessages = chatToUpdate.messages.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: accumulatedContent }
              : msg
          );
          
          await updateChat(currentChatId, {
            messages: finalMessages,
          });
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error continuing response:', error);
        
        setChats(prev => prev.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: 'Sorry, something went wrong. Please try again! 😅' }
                    : msg
                ),
              }
            : chat
        ));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="flex flex-col items-center gap-6 px-6 max-w-2xl">
          <Image
            src="/logo.svg"
            alt="Mr Shomser"
            width={80}
            height={80}
            className="animate-pulse"
          />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Mr Shomser
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Your smartest (slightly overconfident) AI friend
            </p>
          </div>
          
          {/* Tech Stack */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Application Stack
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  TS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">Next.js 16</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">React Framework</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">Ollama</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Local LLM</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  DB
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">MongoDB</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">NoSQL Database</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">DDEV</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Dev Environment</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Self-hosted
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Privacy-first
              </span>
              <span className="flex items-center gap-1">
                � Context-aware
              </span>
            </div>
          </div>
          
          {loadError ? (
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Failed to load chats. Please check your connection.
              </p>
              <button
                onClick={loadChats}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <span className="ml-2">Loading your chats...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={selectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userName={userName}
        onUserLogin={(name) => setUserName(name)}
        onUserLogout={handleUserLogout}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Image
                src="/logo.svg"
                alt="mrshomser"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">mrshomser</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your AI Companion</p>
              </div>
            </div>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 group"
              aria-label="Open menu"
              title="Open menu"
            >
              <svg
                className="w-5 h-5 transition-all duration-300 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Image
                src="/logo.svg"
                alt="mrshomser"
                width={80}
                height={80}
                className="mb-6 opacity-80"
              />
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                What can I help you with?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-2">
                Ask me anything. I&apos;m here to help with practical solutions!
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
                🍪 Your chats are saved in this browser session for 30 days
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  { icon: '💡', text: 'What can you help me with?', query: 'What can you help me with?' },
                  { icon: '🌐', text: 'Create a website', query: 'How do I create a website?' },
                  { icon: '💻', text: 'Programming advice', query: 'Best programming languages to learn in 2026?' },
                  { icon: '📚', text: 'Learning resources', query: 'Where can I find good online courses for programming?' },
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(example.query)}
                    className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">{example.icon}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{example.text}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.filter(m => m.role === 'user' || m.content).map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <Image
                        src="/chat-bubble.svg"
                        alt="Mr Shomser"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                  )}
                  <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div
                      className={`group relative ${
                        message.role === 'user'
                          ? 'max-w-[80%] bg-blue-600 text-white rounded-2xl px-4 py-3'
                          : 'w-full'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      ) : (
                        <>
                          <MarkdownMessage content={message.content} />
                          {message.content && (
                            <div className="mt-3 flex items-center gap-2">
                              {truncatedMessages.has(message.id) && (
                                <button
                                  onClick={continueResponse}
                                  disabled={isLoading}
                                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                  title="Continue the response"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                                  </svg>
                                  Continue Response
                                </button>
                              )}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => copyMessage(message.content)}
                                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                  title="Copy message"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Image
                          src="/user-avatar.svg"
                          alt="User"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Image
                      src="/chat-bubble.svg"
                      alt="Mr Shomser"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={sendMessage} className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Message Mr Shomser..."
                className="w-full px-4 py-3 pr-24 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '200px' }}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                {isLoading ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Stop generating"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
      
      {/* Offcanvas menu */}
      <OffcanvasMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

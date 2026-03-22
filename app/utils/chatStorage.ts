import { Chat, ChatState } from '../types/chat';

const STORAGE_KEY = 'mrsomsher_chats';

export const chatStorage = {
  // Load all chats from localStorage
  loadChats: (): ChatState => {
    if (typeof window === 'undefined') {
      return { chats: [], currentChatId: null };
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
    
    return { chats: [], currentChatId: null };
  },

  // Save chat state to localStorage
  saveChats: (state: ChatState): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  },

  // Get a specific chat by ID
  getChat: (chatId: string): Chat | null => {
    const state = chatStorage.loadChats();
    return state.chats.find(chat => chat.id === chatId) || null;
  },

  // Update a specific chat
  updateChat: (chatId: string, updates: Partial<Chat>): void => {
    const state = chatStorage.loadChats();
    const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
      state.chats[chatIndex] = {
        ...state.chats[chatIndex],
        ...updates,
        updatedAt: Date.now(),
      };
      chatStorage.saveChats(state);
    }
  },

  // Delete a chat
  deleteChat: (chatId: string): void => {
    const state = chatStorage.loadChats();
    state.chats = state.chats.filter(chat => chat.id !== chatId);
    
    if (state.currentChatId === chatId) {
      state.currentChatId = state.chats[0]?.id || null;
    }
    
    chatStorage.saveChats(state);
  },

  // Clear all chats
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};

/**
 * Session context for managing chat sessions across the application
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ChatSession, SessionState } from '../types/chat.types';
import { v4 as uuidv4 } from 'uuid';

interface SessionContextType {
  // State
  currentSessionId: string | null;
  sessions: Map<string, ChatSession>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createNewSession: () => Promise<string>;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => void;
  clearCurrentSession: () => Promise<void>;
  loadActiveSessions: () => Promise<void>;
  getSessionMessages: (sessionId: string) => any[];
  updateSessionLastMessage: (sessionId: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  SESSIONS: 'talk2tables_sessions',
  ACTIVE_SESSION: 'talk2tables_active_session',
  MESSAGES_PREFIX: 'talk2tables_chat_messages_',
  LEGACY_MESSAGES: 'talk2tables_chat_messages',
};

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [state, setState] = useState<SessionState>({
    sessions: new Map(),
    activeSessionId: null,
    isLoading: false,
    error: null,
  });

  // Migrate legacy data on first load
  const migrateLegacyData = useCallback(() => {
    try {
      const legacyData = localStorage.getItem(STORAGE_KEYS.LEGACY_MESSAGES);
      if (legacyData) {
        // Create a default session for legacy data
        const defaultSessionId = 'default_' + uuidv4().substring(0, 8);
        const defaultSession: ChatSession = {
          id: defaultSessionId,
          title: 'Previous Conversations',
          createdAt: new Date(),
          lastMessageAt: new Date(),
          messageCount: JSON.parse(legacyData).length || 0,
          isActive: true,
        };
        
        // Save legacy messages to new format
        localStorage.setItem(
          `${STORAGE_KEYS.MESSAGES_PREFIX}${defaultSessionId}`,
          legacyData
        );
        
        // Remove legacy key
        localStorage.removeItem(STORAGE_KEYS.LEGACY_MESSAGES);
        
        // Save session metadata
        const sessions = new Map<string, ChatSession>();
        sessions.set(defaultSessionId, defaultSession);
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(Array.from(sessions.entries())));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, defaultSessionId);
        
        return { sessions, activeSessionId: defaultSessionId };
      }
    } catch (error) {
      console.error('Failed to migrate legacy data:', error);
    }
    return null;
  }, []);

  // Load sessions from localStorage
  const loadSessions = useCallback(() => {
    try {
      // First check for legacy data migration
      const migrationResult = migrateLegacyData();
      if (migrationResult) {
        setState(prev => ({
          ...prev,
          sessions: migrationResult.sessions,
          activeSessionId: migrationResult.activeSessionId,
        }));
        return;
      }

      // Load existing sessions
      const sessionsData = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const activeSessionId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      
      if (sessionsData) {
        const sessionsArray = JSON.parse(sessionsData);
        const sessions = new Map<string, ChatSession>(
          sessionsArray.map(([id, session]: [string, any]) => [
            id,
            {
              ...session,
              createdAt: new Date(session.createdAt),
              lastMessageAt: new Date(session.lastMessageAt),
            },
          ])
        );
        
        setState(prev => ({
          ...prev,
          sessions,
          activeSessionId,
        }));
      } else {
        // No sessions exist, will create one after initial load
        setState(prev => ({
          ...prev,
          sessions: new Map(),
          activeSessionId: null,
        }));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setState(prev => ({ ...prev, error: 'Failed to load sessions' }));
    }
  }, [migrateLegacyData]);

  // Save sessions to localStorage
  const saveSessions = useCallback((sessions: Map<string, ChatSession>) => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(Array.from(sessions.entries()))
      );
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  }, []);

  // Create a new session
  const createNewSession = useCallback(async (): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Generate a new session ID (will be replaced by API response)
      const tempSessionId = 'session_' + uuidv4().substring(0, 8);
      let sessionId = tempSessionId;
      
      // Try to call the API to create a new session
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/sessions/new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          sessionId = data.thread_id || tempSessionId;
        }
      } catch (apiError) {
        console.warn('API session creation failed, using local session:', apiError);
      }
      
      // Create new session using functional state update
      setState(prev => {
        const newSession: ChatSession = {
          id: sessionId,
          title: `Chat ${prev.sessions.size + 1}`,
          createdAt: new Date(),
          lastMessageAt: new Date(),
          messageCount: 0,
          isActive: true,
        };
        
        const updatedSessions = new Map(prev.sessions);
        updatedSessions.set(sessionId, newSession);
        
        // Save to localStorage
        try {
          localStorage.setItem(
            STORAGE_KEYS.SESSIONS,
            JSON.stringify(Array.from(updatedSessions.entries()))
          );
          localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, sessionId);
        } catch (saveError) {
          console.error('Failed to save session to localStorage:', saveError);
        }
        
        return {
          ...prev,
          sessions: updatedSessions,
          activeSessionId: sessionId,
          isLoading: false,
        };
      });
      
      return sessionId;
    } catch (error) {
      console.error('Failed to create new session:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to create new session' 
      }));
      throw error;
    }
  }, []);

  // Switch to a different session
  const switchSession = useCallback((sessionId: string) => {
    if (state.sessions.has(sessionId)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, sessionId);
      setState(prev => ({ ...prev, activeSessionId: sessionId }));
    }
  }, [state.sessions]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Try to call the API to delete the session
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/sessions/${sessionId}`,
          {
            method: 'DELETE',
          }
        );
        
        if (!response.ok && response.status !== 404) {
          console.warn('API session deletion returned error:', response.status);
        }
      } catch (apiError) {
        console.warn('API session deletion failed, continuing with local deletion:', apiError);
      }
      
      // Remove from local storage
      localStorage.removeItem(`${STORAGE_KEYS.MESSAGES_PREFIX}${sessionId}`);
      
      // Use functional state update to avoid stale closure
      setState(prev => {
        const updatedSessions = new Map(prev.sessions);
        updatedSessions.delete(sessionId);
        
        // If this was the active session, switch to another
        let newActiveSessionId = prev.activeSessionId;
        if (prev.activeSessionId === sessionId) {
          if (updatedSessions.size > 0) {
            newActiveSessionId = Array.from(updatedSessions.keys())[0];
          } else {
            // No sessions left, will need to create one
            newActiveSessionId = null;
          }
        }
        
        // Save to localStorage
        try {
          localStorage.setItem(
            STORAGE_KEYS.SESSIONS,
            JSON.stringify(Array.from(updatedSessions.entries()))
          );
          if (newActiveSessionId) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, newActiveSessionId);
          }
        } catch (saveError) {
          console.error('Failed to save after deletion:', saveError);
        }
        
        return {
          ...prev,
          sessions: updatedSessions,
          activeSessionId: newActiveSessionId,
          isLoading: false,
        };
      });
      
      // If no sessions left, create a new one
      const currentState = await new Promise<SessionState>(resolve => {
        setState(prev => {
          resolve(prev);
          return prev;
        });
      });
      
      if (currentState.sessions.size === 0) {
        await createNewSession();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to delete session' 
      }));
    }
  }, [createNewSession]);

  // Clear current session (remove messages but keep session)
  const clearCurrentSession = useCallback(async () => {
    if (!state.activeSessionId) return;
    
    try {
      // Try to call the API to clear the session
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/sessions/${state.activeSessionId}`,
          {
            method: 'DELETE',
          }
        );
        
        if (!response.ok && response.status !== 404) {
          console.warn('API session clear returned error:', response.status);
        }
      } catch (apiError) {
        console.warn('API session clear failed, continuing with local clear:', apiError);
      }
      
      // Clear messages from localStorage
      localStorage.removeItem(`${STORAGE_KEYS.MESSAGES_PREFIX}${state.activeSessionId}`);
      
      // Update session metadata
      const updatedSessions = new Map(state.sessions);
      const session = updatedSessions.get(state.activeSessionId);
      if (session) {
        session.messageCount = 0;
        session.lastMessageAt = new Date();
        updatedSessions.set(state.activeSessionId, session);
        saveSessions(updatedSessions);
        
        setState(prev => ({
          ...prev,
          sessions: updatedSessions,
        }));
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, [state.activeSessionId, state.sessions, saveSessions]);

  // Update session title
  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    const updatedSessions = new Map(state.sessions);
    const session = updatedSessions.get(sessionId);
    if (session) {
      session.title = title;
      updatedSessions.set(sessionId, session);
      saveSessions(updatedSessions);
      
      setState(prev => ({
        ...prev,
        sessions: updatedSessions,
      }));
    }
  }, [state.sessions, saveSessions]);

  // Load active sessions from API
  const loadActiveSessions = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/sessions`,
        {
          method: 'GET',
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        // This could be used to sync with backend sessions
        console.log('Active sessions from API:', data.active_sessions);
      }
    } catch (error) {
      console.error('Failed to load active sessions from API:', error);
    }
  }, []);

  // Get messages for a specific session
  const getSessionMessages = useCallback((sessionId: string): any[] => {
    try {
      const messagesData = localStorage.getItem(`${STORAGE_KEYS.MESSAGES_PREFIX}${sessionId}`);
      if (messagesData) {
        return JSON.parse(messagesData);
      }
    } catch (error) {
      console.error('Failed to load session messages:', error);
    }
    return [];
  }, []);

  // Update session's last message timestamp and count
  const updateSessionLastMessage = useCallback((sessionId: string) => {
    const updatedSessions = new Map(state.sessions);
    const session = updatedSessions.get(sessionId);
    if (session) {
      session.lastMessageAt = new Date();
      const messages = getSessionMessages(sessionId);
      session.messageCount = messages.length;
      updatedSessions.set(sessionId, session);
      saveSessions(updatedSessions);
      
      setState(prev => ({
        ...prev,
        sessions: updatedSessions,
      }));
    }
  }, [state.sessions, saveSessions, getSessionMessages]);

  // Initialize on mount
  useEffect(() => {
    loadSessions();
  }, []); // Only run once on mount

  // Create default session if none exists after initial load
  useEffect(() => {
    // Small delay to ensure loadSessions has completed
    const timer = setTimeout(() => {
      if (!state.isLoading && state.sessions.size === 0 && !state.activeSessionId) {
        createNewSession();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Only run once after mount

  const value: SessionContextType = {
    currentSessionId: state.activeSessionId,
    sessions: state.sessions,
    isLoading: state.isLoading,
    error: state.error,
    createNewSession,
    switchSession,
    deleteSession,
    updateSessionTitle,
    clearCurrentSession,
    loadActiveSessions,
    getSessionMessages,
    updateSessionLastMessage,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
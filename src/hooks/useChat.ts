/**
 * Custom hook for chat state management and API interactions
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, QueryResult } from '../types/chat.types';
import { apiService } from '../services/api';
import { useSession } from '../contexts/SessionContext';

interface UseChatProps {
  maxMessages?: number;
  persistMessages?: boolean;
  sessionId?: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
  isTyping: boolean;
}

const STORAGE_KEY_PREFIX = 'talk2tables_chat_messages_';

export const useChat = ({
  maxMessages = 100,
  persistMessages = true,
  sessionId: overrideSessionId
}: UseChatProps = {}): UseChatReturn => {
  const { currentSessionId, updateSessionLastMessage } = useSession();
  const activeSessionId = overrideSessionId || currentSessionId;
  
  // Load messages from localStorage if persistence is enabled
  const loadPersistedMessages = useCallback((): ChatMessage[] => {
    if (!persistMessages || !activeSessionId) return [];
    
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${activeSessionId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load persisted messages:', error);
    }
    return [];
  }, [persistMessages, activeSessionId]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const lastUserMessageRef = useRef<string>('');

  // Load messages when session changes
  useEffect(() => {
    if (activeSessionId) {
      const loadedMessages = loadPersistedMessages();
      setMessages(loadedMessages);
      // Set session ID in API service
      apiService.setSessionId(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, loadPersistedMessages]);
  
  // Persist messages to localStorage when they change
  useEffect(() => {
    if (persistMessages && messages.length > 0 && activeSessionId) {
      try {
        const storageKey = `${STORAGE_KEY_PREFIX}${activeSessionId}`;
        localStorage.setItem(storageKey, JSON.stringify(messages));
        // Update session's last message time
        updateSessionLastMessage(activeSessionId);
      } catch (error) {
        console.warn('Failed to persist messages:', error);
      }
    }
  }, [messages, persistMessages, activeSessionId, updateSessionLastMessage]);

  // Helper function to add a message
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      timestamp: new Date(),
      ...message
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Limit messages to maxMessages if specified
      if (maxMessages > 0 && updated.length > maxMessages) {
        return updated.slice(-maxMessages);
      }
      return updated;
    });

    return newMessage.id;
  }, [maxMessages]);

  // Helper function to update a message
  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  // Process query results from assistant response
  const processQueryResults = useCallback((content: string): QueryResult | undefined => {
    try {
      // Look for JSON blocks in the response that might contain query results
      const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.data && Array.isArray(parsed.data)) {
          return {
            success: true,
            data: parsed.data,
            columns: parsed.columns || Object.keys(parsed.data[0] || {}),
            row_count: parsed.data.length
          };
        }
      }
      
      // Look for other indicators of query results
      if (content.includes('Query executed successfully') || 
          content.includes('rows returned') ||
          content.toLowerCase().includes('select ')) {
        // This might be a query response, but we couldn't parse structured data
        return {
          success: true,
          data: [],
          columns: [],
          row_count: 0
        };
      }
    } catch (error) {
      console.warn('Failed to process query results:', error);
    }
    
    return undefined;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) {
      return;
    }

    // Store the user message for potential retry
    lastUserMessageRef.current = content;
    
    // Clear any previous errors
    setError(null);
    setIsLoading(true);

    // Add user message
    addMessage({
      role: 'user',
      content: content.trim()
    });

    // Add loading assistant message
    const assistantMessageId = addMessage({
      role: 'assistant',
      content: '',
      isLoading: true
    });

    try {
      // Simulate typing delay
      setIsTyping(true);
      const typingDelay = parseInt(
        import.meta.env?.VITE_TYPING_DELAY || 
        process.env.REACT_APP_TYPING_DELAY || 
        '1000'
      );
      await new Promise(resolve => setTimeout(resolve, typingDelay));
      setIsTyping(false);

      // Prepare messages for API (include recent context)
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the current user message
      recentMessages.push({
        role: 'user',
        content: content.trim()
      });

      // Send to API with session ID
      const response = await apiService.sendChatCompletion({
        messages: recentMessages,
        max_tokens: 2000,
        temperature: 0.7
      }, activeSessionId || undefined);

      if (response.choices && response.choices.length > 0) {
        const choice = response.choices[0];
        const assistantResponse = choice.message.content;
        
        // First try to get query results from the response structure
        let queryResult = choice.query_result || undefined;
        
        // If not found, fall back to parsing from content
        if (!queryResult) {
          queryResult = processQueryResults(assistantResponse);
        }

        // Extract graph data from response (new feature)
        const graphData = choice.graph || null;
        
        // Debug logging for graph data
        console.log('API Response choice:', choice);
        console.log('Extracted graph data:', graphData);
        if (graphData) {
          console.log('Graph data structure:', JSON.stringify(graphData, null, 2));
        }

        // Update the assistant message with the response
        updateMessage(assistantMessageId, {
          content: assistantResponse,
          isLoading: false,
          queryResult,
          graph: graphData
        });
      } else {
        throw new Error('No response from assistant');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Update the assistant message with error
      updateMessage(assistantMessageId, {
        content: `Sorry, I encountered an error: ${errorMessage}`,
        isLoading: false,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [messages, isLoading, addMessage, updateMessage, processQueryResults]);

  const retryLastMessage = useCallback(async () => {
    if (lastUserMessageRef.current) {
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    if (persistMessages && activeSessionId) {
      const storageKey = `${STORAGE_KEY_PREFIX}${activeSessionId}`;
      localStorage.removeItem(storageKey);
    }
  }, [persistMessages, activeSessionId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    isTyping
  };
};
/**
 * Type definitions for chat interface and API responses
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
  queryResult?: QueryResult;
}

export interface QueryResult {
  success: boolean;
  data?: Array<Record<string, any>>;
  columns?: string[];
  error?: string;
  row_count?: number;
  execution_time?: number;
}

export interface ChatCompletionRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string | null;
    query_result?: QueryResult;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ApiError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: number;
  mcp_server_status?: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  error?: string;
  fastapi_status: 'connected' | 'disconnected' | 'error';
  mcp_status: 'connected' | 'disconnected' | 'error';
}

/**
 * Session management types
 */
export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  isActive: boolean;
}

export interface SessionCreateResponse {
  success: boolean;
  thread_id: string;
  message: string;
}

export interface SessionClearResponse {
  success: boolean;
  message: string;
  thread_id: string;
  cleared_components: string[];
}

export interface SessionListResponse {
  success: boolean;
  active_sessions: string[];
  session_count: number;
}

export interface SessionState {
  sessions: Map<string, ChatSession>;
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}
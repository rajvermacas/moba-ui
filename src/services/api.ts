/**
 * API service for communicating with FastAPI backend
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ChatCompletionRequest, 
  ChatCompletionResponse, 
  HealthResponse, 
  ApiError,
  SessionCreateResponse,
  SessionClearResponse,
  SessionListResponse
} from '../types/chat.types';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;
  private currentSessionId: string | null = null;

  constructor() {
    // Support both Vite and CRA environment variables
    this.baseURL = import.meta.env?.VITE_API_BASE_URL || 
                   process.env.REACT_APP_API_BASE_URL || 
                   'http://localhost:8001';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 1800000, // 30 minute timeout for complex queries
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        const debug = import.meta.env?.VITE_DEBUG === 'true' || 
                      process.env.REACT_APP_DEBUG === 'true';
        if (debug) {
          console.log('API Request:', config.method?.toUpperCase(), config.url);
        }
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        const debug = import.meta.env?.VITE_DEBUG === 'true' || 
                      process.env.REACT_APP_DEBUG === 'true';
        if (debug) {
          console.log('API Response:', response.status, response.config.url);
        }
        return response;
      },
      (error) => {
        console.error('API Response Error:', error?.response?.status, error?.response?.data);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const apiError: ApiError = error.response.data;
      if (apiError?.error?.message) {
        return new Error(apiError.error.message);
      }
      return new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response
      return new Error('Network error: Unable to connect to server');
    } else {
      // Something else happened
      return new Error(`Request error: ${error.message}`);
    }
  }

  /**
   * Set the current session ID for API calls
   */
  setSessionId(sessionId: string | null): void {
    this.currentSessionId = sessionId;
  }

  /**
   * Send a chat completion request
   */
  async sendChatCompletion(request: ChatCompletionRequest, sessionId?: string): Promise<ChatCompletionResponse> {
    try {
      const headers: any = {};
      const activeSessionId = sessionId || this.currentSessionId;
      
      if (activeSessionId) {
        headers['X-Thread-Id'] = activeSessionId;
      }
      
      const response: AxiosResponse<ChatCompletionResponse> = await this.client.post(
        '/chat/completions',
        request,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Chat completion error:', error);
      throw error;
    }
  }

  /**
   * Check server health status
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response: AxiosResponse<HealthResponse> = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  /**
   * Get MCP server status
   */
  async getMcpStatus(): Promise<any> {
    try {
      const response = await this.client.get('/mcp/status');
      return response.data;
    } catch (error) {
      console.error('MCP status error:', error);
      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<any> {
    try {
      const response = await this.client.get('/models');
      return response.data;
    } catch (error) {
      console.error('List models error:', error);
      throw error;
    }
  }

  /**
   * Test integration endpoints
   */
  async testIntegration(): Promise<any> {
    try {
      const response = await this.client.get('/test/integration');
      return response.data;
    } catch (error) {
      console.error('Integration test error:', error);
      throw error;
    }
  }

  /**
   * Get base URL for debugging
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Test basic connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.checkHealth();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Session Management APIs
   */
  
  /**
   * Create a new session
   */
  async createNewSession(): Promise<SessionCreateResponse> {
    try {
      const response: AxiosResponse<SessionCreateResponse> = await this.client.post('/sessions/new');
      return response.data;
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  /**
   * Clear/delete a specific session
   */
  async clearSession(threadId: string): Promise<SessionClearResponse> {
    try {
      const response: AxiosResponse<SessionClearResponse> = await this.client.delete(`/sessions/${threadId}`);
      return response.data;
    } catch (error) {
      console.error('Clear session error:', error);
      throw error;
    }
  }

  /**
   * List all active sessions
   */
  async listSessions(): Promise<SessionListResponse> {
    try {
      const response: AxiosResponse<SessionListResponse> = await this.client.get('/sessions');
      return response.data;
    } catch (error) {
      console.error('List sessions error:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;
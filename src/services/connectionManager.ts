/**
 * Singleton Connection Manager
 * Manages connection status checks completely outside React lifecycle
 */

import { ConnectionStatus, McpServerStatus } from '../types/chat.types';
import { apiService } from './api';

type ConnectionListener = (status: ConnectionStatus) => void;

class ConnectionManager {
  private static instance: ConnectionManager | null = null;
  private status: ConnectionStatus;
  private listeners: Set<ConnectionListener>;
  private intervalId: NodeJS.Timeout | undefined;
  private isInitialized: boolean;
  private checkInterval: number;
  
  private constructor() {
    console.log('[ConnectionManager] Creating singleton instance');
    this.status = {
      isConnected: false,
      lastChecked: new Date(),
      fastapi_status: 'disconnected',
      mcp_status: 'disconnected'
    };
    this.listeners = new Set();
    this.intervalId = undefined;
    this.isInitialized = false;
    this.checkInterval = 30000; // 30 seconds default
  }

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  async checkStatus(): Promise<void> {
    const now = new Date();
    console.log('[ConnectionManager] Checking status at:', now.toISOString());
    
    try {
      // Check FastAPI server health
      console.log('[ConnectionManager] Calling /health endpoint');
      const healthResponse = await apiService.checkHealth();
      const fastapiConnected = healthResponse.status === 'healthy';
      
      let mcpConnected = false;
      let mcpError: string | undefined;
      let mcpServers: McpServerStatus[] = [];

      try {
        // Check MCP server status through FastAPI
        console.log('[ConnectionManager] Calling /mcp/status endpoint');
        const mcpResponse = await apiService.getMcpStatus();
        mcpConnected = mcpResponse.connected === true;
        
        // Parse individual MCP servers
        if (mcpResponse.servers && Array.isArray(mcpResponse.servers)) {
          mcpServers = mcpResponse.servers.map((serverName: string) => ({
            name: serverName,
            status: mcpConnected ? 'connected' : 'error'
          } as McpServerStatus));
        }
        
        if (!mcpConnected && mcpResponse.error) {
          mcpError = mcpResponse.error;
        }
      } catch (mcpErr) {
        mcpError = mcpErr instanceof Error ? mcpErr.message : 'MCP connection failed';
      }

      const newStatus: ConnectionStatus = {
        isConnected: fastapiConnected && mcpConnected,
        lastChecked: now,
        fastapi_status: fastapiConnected ? 'connected' : 'error',
        mcp_status: mcpConnected ? 'connected' : 'error',
        mcp_servers: mcpServers,
        error: !fastapiConnected 
          ? 'FastAPI server unreachable'
          : !mcpConnected 
            ? `MCP server issue: ${mcpError || 'Connection failed'}`
            : undefined
      };
      
      console.log('[ConnectionManager] Status updated:', newStatus);
      this.updateStatus(newStatus);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection check failed';
      
      const errorStatus: ConnectionStatus = {
        isConnected: false,
        lastChecked: now,
        fastapi_status: 'error',
        mcp_status: 'disconnected',
        mcp_servers: [],
        error: errorMessage
      };
      
      console.log('[ConnectionManager] Error checking status:', errorStatus);
      this.updateStatus(errorStatus);
    }
  }

  private updateStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
    // Notify all listeners
    this.listeners.forEach(listener => {
      listener(newStatus);
    });
  }

  startMonitoring(intervalMs: number = 30000): void {
    if (this.isInitialized) {
      console.log('[ConnectionManager] Already initialized, skipping');
      return;
    }

    console.log('[ConnectionManager] Starting monitoring with interval:', intervalMs);
    this.isInitialized = true;
    this.checkInterval = intervalMs;
    
    // Initial check
    this.checkStatus();
    
    // Set up interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      this.checkStatus();
    }, this.checkInterval);
  }

  stopMonitoring(): void {
    console.log('[ConnectionManager] Stopping monitoring');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isInitialized = false;
  }

  subscribe(listener: ConnectionListener): () => void {
    console.log('[ConnectionManager] Component subscribing');
    this.listeners.add(listener);
    
    // Immediately provide current status to new subscriber
    listener(this.status);
    
    // Return unsubscribe function
    return () => {
      console.log('[ConnectionManager] Component unsubscribing');
      this.listeners.delete(listener);
    };
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isMonitoring(): boolean {
    return this.isInitialized;
  }

  // Manual refresh
  async refresh(): Promise<void> {
    await this.checkStatus();
  }
}

// Create and export singleton instance
export const connectionManager = ConnectionManager.getInstance();

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    connectionManager.stopMonitoring();
  });
}
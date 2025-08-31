/**
 * Hook for monitoring connection status to FastAPI and MCP servers
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionStatus, McpServerStatus } from '../types/chat.types';
import { apiService } from '../services/api';

interface UseConnectionStatusProps {
  checkInterval?: number;
  autoStart?: boolean;
}

interface UseConnectionStatusReturn {
  status: ConnectionStatus;
  checkStatus: () => Promise<void>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  isMonitoring: boolean;
}

export const useConnectionStatus = ({
  checkInterval = 30000, // 30 seconds
  autoStart = true
}: UseConnectionStatusProps = {}): UseConnectionStatusReturn => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastChecked: new Date(),
    fastapi_status: 'disconnected',
    mcp_status: 'disconnected'
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const hasInitialized = useRef(false);

  const checkStatus = useCallback(async () => {
    const now = new Date();
    
    try {
      // Check FastAPI server health
      const healthResponse = await apiService.checkHealth();
      const fastapiConnected = healthResponse.status === 'healthy';
      
      let mcpConnected = false;
      let mcpError: string | undefined;
      let mcpServers: McpServerStatus[] = [];

      try {
        // Check MCP server status through FastAPI
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

      setStatus({
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
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection check failed';
      
      setStatus({
        isConnected: false,
        lastChecked: now,
        fastapi_status: 'error',
        mcp_status: 'disconnected',
        mcp_servers: [],
        error: errorMessage
      });
    }
  }, []);

  const startMonitoring = useCallback(() => {
    if (intervalRef.current) {
      return; // Already monitoring
    }

    setIsMonitoring(true);
    
    // Initial check
    checkStatus();
    
    // Set up interval
    intervalRef.current = setInterval(checkStatus, checkInterval);
  }, [checkStatus, checkInterval]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Auto-start monitoring if enabled
  useEffect(() => {
    if (autoStart) {
      // Prevent double initialization in StrictMode
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        setIsMonitoring(true);
        
        // Initial check
        checkStatus();
        
        // Set up interval
        intervalRef.current = setInterval(checkStatus, checkInterval);
      }
    }

    // Cleanup on unmount
    return () => {
      // Don't reset hasInitialized here to prevent re-initialization in StrictMode
      setIsMonitoring(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [autoStart, checkStatus, checkInterval]);

  // Handle window focus - check status when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (isMonitoring) {
        checkStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isMonitoring, checkStatus]);

  return {
    status,
    checkStatus,
    startMonitoring,
    stopMonitoring,
    isMonitoring
  };
};
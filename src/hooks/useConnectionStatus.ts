/**
 * Hook for monitoring connection status to FastAPI and MCP servers
 * This is a React wrapper around the singleton ConnectionManager
 */

import { useState, useEffect, useCallback } from 'react';
import { ConnectionStatus } from '../types/chat.types';
import { connectionManager } from '../services/connectionManager';

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
  console.log('[useConnectionStatus] Hook initialized with autoStart:', autoStart);
  
  // Local state for triggering React re-renders
  const [status, setStatus] = useState<ConnectionStatus>(connectionManager.getStatus());
  const [isMonitoring, setIsMonitoring] = useState<boolean>(connectionManager.isMonitoring());

  // Subscribe to connection manager updates
  useEffect(() => {
    console.log('[useConnectionStatus] Setting up subscription');
    
    // Subscribe to status updates
    const unsubscribe = connectionManager.subscribe((newStatus) => {
      console.log('[useConnectionStatus] Received status update:', newStatus);
      setStatus(newStatus);
    });

    // Start monitoring if autoStart is true and not already monitoring
    if (autoStart && !connectionManager.isMonitoring()) {
      console.log('[useConnectionStatus] Auto-starting monitoring');
      connectionManager.startMonitoring(checkInterval);
      setIsMonitoring(true);
    } else if (connectionManager.isMonitoring()) {
      console.log('[useConnectionStatus] Monitoring already active');
      setIsMonitoring(true);
    }

    // Cleanup: unsubscribe but don't stop monitoring (other components might be using it)
    return () => {
      console.log('[useConnectionStatus] Cleaning up subscription');
      unsubscribe();
    };
  }, []); // Empty deps - only run once on mount

  // Manual check status
  const checkStatus = useCallback(async () => {
    console.log('[useConnectionStatus] Manual refresh requested');
    await connectionManager.refresh();
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    console.log('[useConnectionStatus] Start monitoring requested');
    connectionManager.startMonitoring(checkInterval);
    setIsMonitoring(true);
  }, [checkInterval]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    console.log('[useConnectionStatus] Stop monitoring requested');
    connectionManager.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  // Handle window focus - check status when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (isMonitoring) {
        console.log('[useConnectionStatus] Window focused, refreshing status');
        connectionManager.refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isMonitoring]);

  return {
    status,
    checkStatus,
    startMonitoring,
    stopMonitoring,
    isMonitoring
  };
};
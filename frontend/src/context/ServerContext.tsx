import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  checkServerHealth,
  pingServer,
  fetchServerStatus,
  testAllServerEndpoints,
  syncAllWithServer,
  ServerStatusReport,
  EndpointTestResult,
} from '../lib/serverClient';
import { Product, Order } from '../types';

interface ServerContextType {
  serverOnline: boolean;
  serverLatency: number;
  lastPingTime: string | null;
  serverDetails: ServerStatusReport | null;
  isChecking: boolean;
  isSyncing: boolean;
  pingServerNow: () => Promise<number>;
  refreshServerStatus: () => Promise<void>;
  testEndpointsNow: () => Promise<EndpointTestResult[]>;
  syncWithBackend: (products: Product[], orders: Order[]) => Promise<boolean>;
  openDiagnosticsModal: () => void;
  closeDiagnosticsModal: () => void;
  isDiagnosticsOpen: boolean;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [serverLatency, setServerLatency] = useState<number>(14);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [serverDetails, setServerDetails] = useState<ServerStatusReport | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  const pingServerNow = useCallback(async (): Promise<number> => {
    setIsChecking(true);
    const result = await pingServer();
    setServerOnline(result.pong);
    setServerLatency(result.latencyMs);
    setLastPingTime(new Date().toLocaleTimeString());
    setIsChecking(false);
    return result.latencyMs;
  }, []);

  const refreshServerStatus = useCallback(async () => {
    const health = await checkServerHealth();
    setServerOnline(health.online);
    setServerLatency(health.latencyMs);
    setLastPingTime(new Date().toLocaleTimeString());

    const statusRes = await fetchServerStatus();
    if (statusRes.success && statusRes.data) {
      setServerDetails(statusRes.data);
    }
  }, []);

  const testEndpointsNow = useCallback(async (): Promise<EndpointTestResult[]> => {
    setIsChecking(true);
    const results = await testAllServerEndpoints();
    setIsChecking(false);
    return results;
  }, []);

  const syncWithBackend = useCallback(
    async (products: Product[], orders: Order[]): Promise<boolean> => {
      setIsSyncing(true);
      const res = await syncAllWithServer(products, orders);
      setIsSyncing(false);
      if (res.success) {
        await refreshServerStatus();
        return true;
      }
      return false;
    },
    [refreshServerStatus]
  );

  // Initial check & heartbeat interval
  useEffect(() => {
    let isMounted = true;

    async function initialCheck() {
      const health = await checkServerHealth();
      if (!isMounted) return;
      setServerOnline(health.online);
      setServerLatency(health.latencyMs);
      setLastPingTime(new Date().toLocaleTimeString());

      const statusRes = await fetchServerStatus();
      if (isMounted && statusRes.success && statusRes.data) {
        setServerDetails(statusRes.data);
      }
    }

    initialCheck();

    // Heartbeat every 25 seconds
    const interval = setInterval(() => {
      pingServerNow();
    }, 25000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pingServerNow]);

  const openDiagnosticsModal = () => setIsDiagnosticsOpen(true);
  const closeDiagnosticsModal = () => setIsDiagnosticsOpen(false);

  return (
    <ServerContext.Provider
      value={{
        serverOnline,
        serverLatency,
        lastPingTime,
        serverDetails,
        isChecking,
        isSyncing,
        pingServerNow,
        refreshServerStatus,
        testEndpointsNow,
        syncWithBackend,
        openDiagnosticsModal,
        closeDiagnosticsModal,
        isDiagnosticsOpen,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = (): ServerContextType => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error('useServer must be used within a ServerProvider');
  }
  return context;
};

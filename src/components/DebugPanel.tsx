import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface DebugPanelProps {
  isVisible?: boolean;
}

interface ConnectionInfo {
  status: 'online' | 'offline' | 'checking';
  lastSync: string | null;
  syncStatus: string;
  dataCount: {
    people: number;
    villageEntries: number;
    cityEntries: number;
    dairyEntries: number;
    payments: number;
  };
  environment: {
    hasSupabaseUrl: boolean;
    hasSupabaseKey: boolean;
    isProduction: boolean;
  };
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible = false }) => {
  const [showPanel, setShowPanel] = useState(isVisible);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Safely get context data with error handling
  const dataContext = useData();
  const authContext = useAuth();

  useEffect(() => {
    try {
      if (!dataContext || !authContext) {
        setError('Context not available');
        return;
      }

      const info: ConnectionInfo = {
        status: dataContext.isOffline ? 'offline' : 'online',
        lastSync: dataContext.lastSyncTime ? dataContext.lastSyncTime.toLocaleString() : null,
        syncStatus: dataContext.syncStatus || 'idle',
        dataCount: {
          people: dataContext.data?.people?.length || 0,
          villageEntries: dataContext.data?.villageEntries?.length || 0,
          cityEntries: dataContext.data?.cityEntries?.length || 0,
          dairyEntries: dataContext.data?.dairyEntries?.length || 0,
          payments: dataContext.data?.payments?.length || 0,
        },
        environment: {
          hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          isProduction: import.meta.env.PROD,
        }
      };

      setConnectionInfo(info);
      setError(null);
    } catch (err) {
      console.error('Error in DebugPanel:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  }, [
    dataContext?.isOffline,
    dataContext?.lastSyncTime,
    dataContext?.syncStatus,
    dataContext?.data,
    authContext?.user
  ]);

  const handleSyncData = async () => {
    try {
      if (dataContext?.syncData) {
        await dataContext.syncData();
      }
    } catch (err) {
      console.error('Sync error:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    }
  };

  const handleClearLocalData = () => {
    try {
      if (dataContext?.clearLocalData) {
        dataContext.clearLocalData();
      }
    } catch (err) {
      console.error('Clear data error:', err);
      setError(err instanceof Error ? err.message : 'Clear data failed');
    }
  };

  if (!showPanel) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowPanel(true)}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          aria-label="Show debug panel"
        >
          🐛 Debug
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-sm">
        <div className="flex justify-between items-start">
          <div>
            <strong className="font-bold">Debug Panel Error:</strong>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setShowPanel(false)}
            className="text-red-700 hover:text-red-900"
            aria-label="Close debug panel"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 shadow-lg rounded-lg p-4 max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Debug Panel</h3>
        <button
          onClick={() => setShowPanel(false)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close debug panel"
        >
          ×
        </button>
      </div>

      {connectionInfo && (
        <div className="space-y-2 text-sm">
          {/* Connection Status */}
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className={`capitalize ${
              connectionInfo.status === 'online' ? 'text-green-600' : 'text-red-600'
            }`}>
              {connectionInfo.status === 'online' ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>

          {/* User Info */}
          <div className="flex justify-between">
            <span className="font-medium">User:</span>
            <span className="text-gray-600 truncate ml-2">
              {authContext?.user?.email || 'Not logged in'}
            </span>
          </div>

          {/* Sync Status */}
          <div className="flex justify-between">
            <span className="font-medium">Sync:</span>
            <span className={`capitalize ${
              connectionInfo.syncStatus === 'syncing' ? 'text-blue-600' : 
              connectionInfo.syncStatus === 'error' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {connectionInfo.syncStatus === 'syncing' && '🔄 '}
              {connectionInfo.syncStatus === 'error' && '❌ '}
              {connectionInfo.syncStatus}
            </span>
          </div>

          {/* Last Sync */}
          {connectionInfo.lastSync && (
            <div className="flex justify-between">
              <span className="font-medium">Last Sync:</span>
              <span className="text-gray-600 text-xs">
                {connectionInfo.lastSync}
              </span>
            </div>
          )}

          {/* Data Counts */}
          <div className="border-t pt-2 mt-2">
            <div className="font-medium mb-1">Local Data:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>People: {connectionInfo.dataCount.people}</div>
              <div>Village: {connectionInfo.dataCount.villageEntries}</div>
              <div>City: {connectionInfo.dataCount.cityEntries}</div>
              <div>Dairy: {connectionInfo.dataCount.dairyEntries}</div>
              <div>Payments: {connectionInfo.dataCount.payments}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSyncData}
              disabled={dataContext?.isLoading || connectionInfo.syncStatus === 'syncing'}
              className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {connectionInfo.syncStatus === 'syncing' ? 'Syncing...' : 'Retry Sync'}
            </button>
            
            <button
              onClick={handleClearLocalData}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
              title="Clear all local data"
            >
              Clear
            </button>
          </div>

          {/* Storage Mode Info */}
          <div className="border-t pt-2 mt-2">
            <div className="text-xs text-gray-500">
              {connectionInfo.status === 'offline' ? (
                <>
                  <strong>Local Storage Mode</strong><br />
                  Data stored locally. Configure Supabase for sync.
                </>
              ) : (
                <>
                  <strong>Multi-Device Sync</strong><br />
                  Data synced to cloud automatically.
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {dataContext?.isLoading && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Loading data...
        </div>
      )}
    </div>
  );
};

// Named export only to match existing import
// Remove default export to avoid conflicts
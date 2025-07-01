import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

export function ConnectionStatus() {
  const { isOffline, syncStatus, syncData } = useData();

  if (!isOffline && syncStatus === 'idle') {
    return null; // Don't show anything when online and synced
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
        isOffline 
          ? 'bg-orange-100 text-orange-800 border border-orange-200'
          : syncStatus === 'syncing'
          ? 'bg-blue-100 text-blue-800 border border-blue-200'
          : syncStatus === 'error'
          ? 'bg-red-100 text-red-800 border border-red-200'
          : 'bg-green-100 text-green-800 border border-green-200'
      }`}>
        {isOffline ? (
          <>
            <WifiOff className="w-4 h-4" />
            Offline Mode
          </>
        ) : syncStatus === 'syncing' ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Syncing...
          </>
        ) : syncStatus === 'error' ? (
          <>
            <AlertCircle className="w-4 h-4" />
            Sync Error
            <button
              onClick={syncData}
              className="ml-2 px-2 py-1 bg-red-200 hover:bg-red-300 rounded text-xs transition-colors"
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            Online
          </>
        )}
      </div>
    </div>
  );
}
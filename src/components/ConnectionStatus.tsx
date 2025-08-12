import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, Users, Database } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { hasSupabaseCredentials } from '../lib/supabase';

export function ConnectionStatus() {
  const { isOffline, syncStatus, syncData } = useData();
  const { user } = useAuth();
  const [activeDevices, setActiveDevices] = React.useState(1);
  const [connectionDetails, setConnectionDetails] = React.useState<string>('');

  React.useEffect(() => {
    // Simulate active device detection (in real app, this would come from Supabase presence)
    const deviceId = localStorage.getItem('deviceId') || Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
    
    // Update last seen timestamp
    if (user && !isOffline) {
      localStorage.setItem('lastSeen', new Date().toISOString());
    }
    
    // Set connection details for debugging
    if (hasSupabaseCredentials()) {
      const url = import.meta.env.VITE_SUPABASE_URL;
      setConnectionDetails(url ? `${url.split('//')[1]?.split('.')[0]}.supabase.co` : 'Invalid URL');
    } else {
      setConnectionDetails('Configure .env file to enable sync');
    }
  }, [user, isOffline]);

  if (!isOffline && syncStatus === 'idle') {
    // Show minimal online indicator only if we have real Supabase credentials
    if (!hasSupabaseCredentials()) {
      return (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-medium shadow-sm cursor-help" title="Configure Supabase credentials in .env file to enable cloud sync">
            <Database className="w-3 h-3" />
            <span>Local Only</span>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-medium shadow-sm cursor-help" title={`Connected to ${connectionDetails}`}>
          <Wifi className="w-3 h-3" />
          <span>Online</span>
          {activeDevices > 1 && (
            <>
              <Users className="w-3 h-3 ml-1" />
              <span>{activeDevices}</span>
            </>
          )}
        </div>
      </div>
    );
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
            <span>Online</span>
            {connectionDetails && (
              <span className="hidden sm:inline text-xs opacity-75 ml-1">
                ({connectionDetails.split(':')[1]?.trim()})
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
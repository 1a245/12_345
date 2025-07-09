import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Wifi, WifiOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export function DeviceSync() {
  const { isOffline, syncStatus, syncData } = useData();
  const { user } = useAuth();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'desktop' as 'desktop' | 'mobile' | 'tablet',
    name: 'Unknown Device'
  });

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*Tablet)/i.test(userAgent);
    
    setDeviceInfo({
      type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      name: getDeviceName()
    });

    // Update last sync time
    const savedSyncTime = localStorage.getItem('lastSyncTime');
    if (savedSyncTime) {
      setLastSyncTime(savedSyncTime);
    }
  }, []);

  useEffect(() => {
    if (syncStatus === 'idle' && !isOffline) {
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now);
    }
  }, [syncStatus, isOffline]);

  const getDeviceName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    return 'Web Browser';
  };

  const getDeviceIcon = () => {
    switch (deviceInfo.type) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleManualSync = async () => {
    await syncData();
  };

  if (!user) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getDeviceIcon()}
          <div>
            <h3 className="text-sm font-medium text-gray-900">Device Sync</h3>
            <p className="text-xs text-gray-500">{deviceInfo.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isOffline ? (
            <div className="flex items-center gap-1 text-orange-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-xs font-medium">Offline</span>
            </div>
          ) : syncStatus === 'syncing' ? (
            <div className="flex items-center gap-1 text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">Syncing...</span>
            </div>
          ) : syncStatus === 'error' ? (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Error</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-xs font-medium">Synced</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Connection Status:</span>
          <span className={isOffline ? 'text-orange-600' : 'text-green-600'}>
            {isOffline ? 'Offline Mode' : 'Online'}
          </span>
        </div>
        
        {lastSyncTime && (
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Last Sync:</span>
            <span>{formatLastSync(lastSyncTime)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>User:</span>
          <span className="truncate max-w-32">{user.email}</span>
        </div>
      </div>

      {(isOffline || syncStatus === 'error') && (
        <button
          onClick={handleManualSync}
          disabled={syncStatus === 'syncing'}
          className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          {syncStatus === 'syncing' ? 'Syncing...' : 'Retry Sync'}
        </button>
      )}

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
        <p className="font-medium mb-1">Multi-Device Ready</p>
        <p>Your data syncs automatically across all your devices. Changes made on one device will appear on others when online.</p>
      </div>
    </div>
  );
}
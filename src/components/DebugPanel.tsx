import React, { useState, useEffect } from 'react';
import { Bug, Copy, Check, RefreshCw, Database, Wifi, AlertTriangle } from 'lucide-react';
import { supabase, hasSupabaseCredentials } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const { user } = useAuth();
  const { isOffline, syncStatus } = useData();

  const debugInfo = {
    // Environment Variables
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not set',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
      `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'Not set',
    
    // Credentials Check
    hasCredentials: hasSupabaseCredentials(),
    
    // App State
    isAuthenticated: !!user,
    userEmail: user?.email || 'Not logged in',
    isOffline,
    syncStatus,
    
    // Browser Info
    userAgent: navigator.userAgent,
    online: navigator.onLine,
    
    // Network Info
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt
    } : 'Not available'
  };

  const runConnectionTest = async () => {
    setTesting(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Basic fetch to Supabase
      const test1Start = Date.now();
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        results.tests.push({
          name: 'Basic Supabase Connection',
          status: response.ok ? 'PASS' : 'FAIL',
          time: Date.now() - test1Start,
          details: `Status: ${response.status} ${response.statusText}`
        });
      } catch (error: any) {
        results.tests.push({
          name: 'Basic Supabase Connection',
          status: 'FAIL',
          time: Date.now() - test1Start,
          details: error.message
        });
      }

      // Test 2: Supabase client connection
      const test2Start = Date.now();
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        results.tests.push({
          name: 'Supabase Client Query',
          status: error ? 'FAIL' : 'PASS',
          time: Date.now() - test2Start,
          details: error ? error.message : 'Query successful'
        });
      } catch (error: any) {
        results.tests.push({
          name: 'Supabase Client Query',
          status: 'FAIL',
          time: Date.now() - test2Start,
          details: error.message
        });
      }

      // Test 3: DNS Resolution
      const test3Start = Date.now();
      try {
        const url = new URL(import.meta.env.VITE_SUPABASE_URL);
        const response = await fetch(`https://dns.google/resolve?name=${url.hostname}&type=A`);
        const dnsData = await response.json();
        results.tests.push({
          name: 'DNS Resolution',
          status: dnsData.Status === 0 ? 'PASS' : 'FAIL',
          time: Date.now() - test3Start,
          details: dnsData.Status === 0 ? `Resolved to: ${dnsData.Answer?.[0]?.data}` : 'DNS resolution failed'
        });
      } catch (error: any) {
        results.tests.push({
          name: 'DNS Resolution',
          status: 'FAIL',
          time: Date.now() - test3Start,
          details: error.message
        });
      }

      // Test 4: Network latency
      const test4Start = Date.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { method: 'HEAD' });
        results.tests.push({
          name: 'Internet Connectivity',
          status: 'PASS',
          time: Date.now() - test4Start,
          details: 'Internet connection working'
        });
      } catch (error: any) {
        results.tests.push({
          name: 'Internet Connectivity',
          status: 'FAIL',
          time: Date.now() - test4Start,
          details: error.message
        });
      }

    } catch (error: any) {
      results.error = error.message;
    }

    setTestResults(results);
    setTesting(false);
  };

  const copyDebugInfo = async () => {
    const info = JSON.stringify({ debugInfo, testResults }, null, 2);
    try {
      await navigator.clipboard.writeText(info);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bug className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Debug Panel</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Environment Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Environment
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div><strong>Supabase URL:</strong> {debugInfo.supabaseUrl}</div>
                <div><strong>Supabase Key:</strong> {debugInfo.supabaseKey}</div>
                <div><strong>Has Credentials:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    debugInfo.hasCredentials ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {debugInfo.hasCredentials ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Connection Status
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div><strong>User:</strong> {debugInfo.userEmail}</div>
                <div><strong>Is Offline:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    debugInfo.isOffline ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {debugInfo.isOffline ? 'YES' : 'NO'}
                  </span>
                </div>
                <div><strong>Sync Status:</strong> {debugInfo.syncStatus}</div>
                <div><strong>Browser Online:</strong> {debugInfo.online ? 'YES' : 'NO'}</div>
              </div>
            </div>

            {/* Connection Tests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Connection Tests
                </h4>
                <button
                  onClick={runConnectionTest}
                  disabled={testing}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-400"
                >
                  <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? 'Testing...' : 'Run Tests'}
                </button>
              </div>

              {testResults && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="text-xs text-gray-500">
                    Last run: {new Date(testResults.timestamp).toLocaleString()}
                  </div>
                  {testResults.tests.map((test: any, index: number) => (
                    <div key={index} className="border-l-4 pl-3 py-2" style={{
                      borderColor: test.status === 'PASS' ? '#10b981' : '#ef4444'
                    }}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{test.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          test.status === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {test.details} ({test.time}ms)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Network Info */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Network Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(debugInfo.connection, null, 2)}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={copyDebugInfo}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Debug Info'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
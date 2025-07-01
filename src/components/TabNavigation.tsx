import React from 'react';
import { Settings, Eye, CreditCard, PlusCircle, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConnectionStatus } from './ConnectionStatus';

interface TabNavigationProps {
  activeMainTab: string;
  activeSubTab: string;
  onMainTabChange: (tab: string) => void;
  onSubTabChange: (tab: string) => void;
}

export function TabNavigation({ activeMainTab, activeSubTab, onMainTabChange, onSubTabChange }: TabNavigationProps) {
  const { logout, user } = useAuth();

  const mainTabs = [
    { id: 'entry', label: 'ENTRY', icon: PlusCircle },
    { id: 'view', label: 'VIEW', icon: Eye },
    { id: 'setting', label: 'SETTING', icon: Settings },
    { id: 'payment', label: 'PAYMENT', icon: CreditCard }
  ];

  const subTabs = [
    { id: 'village', label: 'VILLAGE' },
    { id: 'city', label: 'CITY' },
    { id: 'dairy', label: 'DAIRY' }
  ];

  return (
    <>
      <ConnectionStatus />
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900">M13</h1>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex space-x-1 mb-4">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onMainTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium rounded-t-lg transition-all ${
                    activeMainTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex space-x-1 pb-4">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSubTabChange(tab.id)}
                className={`px-4 py-2 font-medium rounded-lg transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
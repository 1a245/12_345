import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Login } from './components/Login';
import { TabNavigation } from './components/TabNavigation';
import { SettingsManager } from './components/settings/SettingsManager';
import { VillageEntry } from './components/entry/VillageEntry';
import { CityEntry } from './components/entry/CityEntry';
import { DairyEntry } from './components/entry/DairyEntry';
import { PaymentManager } from './components/payment/PaymentManager';
import { ViewManager } from './components/view/ViewManager';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState('entry');
  const [activeSubTab, setActiveSubTab] = useState('village');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderTabContent = () => {
    const key = `${activeMainTab}-${activeSubTab}`;
    
    switch (key) {
      case 'entry-village':
        return <VillageEntry />;
      case 'entry-city':
        return <CityEntry />;
      case 'entry-dairy':
        return <DairyEntry />;
      case 'view-village':
        return <ViewManager category="village" />;
      case 'view-city':
        return <ViewManager category="city" />;
      case 'view-dairy':
        return <ViewManager category="dairy" />;
      case 'setting-village':
        return <SettingsManager category="village" />;
      case 'setting-city':
        return <SettingsManager category="city" />;
      case 'setting-dairy':
        return <SettingsManager category="dairy" />;
      case 'payment-village':
        return <PaymentManager category="village" />;
      case 'payment-city':
        return <PaymentManager category="city" />;
      case 'payment-dairy':
        return <PaymentManager category="dairy" />;
      default:
        return <VillageEntry />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TabNavigation
        activeMainTab={activeMainTab}
        activeSubTab={activeSubTab}
        onMainTabChange={setActiveMainTab}
        onSubTabChange={setActiveSubTab}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
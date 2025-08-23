import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, hasSupabaseCredentials } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppData, Person, VillageEntry, CityEntry, DairyEntry, Payment } from '../types';

interface DataContextType {
  data: AppData;
  isLoading: boolean;
  isOffline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  addPerson: (person: Omit<Person, 'id'>) => Promise<void>;
  updatePerson: (id: string, person: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  addVillageEntry: (entry: Omit<VillageEntry, 'id'>) => Promise<void>;
  updateVillageEntry: (id: string, entry: Partial<VillageEntry>) => Promise<void>;
  deleteVillageEntry: (id: string) => Promise<void>;
  addCityEntry: (entry: Omit<CityEntry, 'id'>) => Promise<void>;
  updateCityEntry: (id: string, entry: Partial<CityEntry>) => Promise<void>;
  deleteCityEntry: (id: string) => Promise<void>;
  addDairyEntry: (entry: Omit<DairyEntry, 'id'>) => Promise<void>;
  updateDairyEntry: (id: string, entry: Partial<DairyEntry>) => Promise<void>;
  deleteDairyEntry: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  syncData: () => Promise<void>;
}

const initialData: AppData = {
  people: [],
  villageEntries: [],
  cityEntries: [],
  dairyEntries: [],
  payments: []
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [localData, setLocalData] = useLocalStorage<AppData>('m13-offline-data', initialData);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setData(initialData);
    }
  }, [user]);

  const checkConnection = async (): Promise<boolean> => {
    try {
      // If we don't have real Supabase credentials, return false (offline mode)
      if (!hasSupabaseCredentials()) {
        console.log('❌ No valid Supabase credentials found');
        return false;
      }

      console.log('🔍 Testing Supabase connection...');
      
      // Test connection with a simple query and proper timeout handling
      const connectionPromise = supabase
        .from('users')
        .select('count')
        .limit(1);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 8000);
      });
      
      const { error } = await Promise.race([connectionPromise, timeoutPromise]);
      
      if (error) {
        console.log('❌ Supabase query failed:', error.message);
        return false;
      }

      console.log('✅ Supabase connection successful');
      return true;
    } catch (error: any) {
      console.log('❌ Connection test failed:', error.message || error);
      // Handle specific error types
      if (error.name === 'AbortError' || error.message === 'Connection timeout') {
        console.log('Connection timed out - using offline mode');
      } else if (error.message === 'Failed to fetch') {
        console.log('Network error - check internet connection');
      }
      return false;
    }
  };

  // Helper function to check if we have local data worth syncing
  const hasLocalData = (): boolean => {
    const hasData = localData && (
      (localData.people && localData.people.length > 0) || 
      (localData.villageEntries && localData.villageEntries.length > 0) || 
      (localData.cityEntries && localData.cityEntries.length > 0) || 
      (localData.dairyEntries && localData.dairyEntries.length > 0) || 
      (localData.payments && localData.payments.length > 0)
    );
    
    console.log('📊 Local data check:', {
      hasData,
      people: localData?.people?.length || 0,
      villageEntries: localData?.villageEntries?.length || 0,
      cityEntries: localData?.cityEntries?.length || 0,
      dairyEntries: localData?.dairyEntries?.length || 0,
      payments: localData?.payments?.length || 0
    });
    
    return hasData;
  };

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const isOnline = await checkConnection();
      setIsOffline(!isOnline);
      
      console.log(`🌐 Connection status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);

      if (isOnline) {
        console.log('Loading data from Supabase for user:', user.id);
        
        // Check if this is the first time loading cloud data
        const { data: existingPeople, error: countError } = await supabase
          .from('people')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .limit(1);
        
        const cloudHasData = !countError && existingPeople && existingPeople.length > 0;
        const localHasData = hasLocalData();
        
        // If cloud is empty but we have local data, upload it first
        if (!cloudHasData && localHasData) {
          console.log('🔄 First time sync - uploading local data to cloud...');
          try {
            await uploadLocalDataToCloud();
            console.log('✅ Local data uploaded successfully');
          } catch (error) {
            console.error('❌ Failed to upload local data:', error);
            // Continue with loading existing cloud data
          }
        }
        
        // Load data from Supabase with error handling for each table
        const [peopleRes, villageRes, cityRes, dairyRes, paymentsRes] = await Promise.allSettled([
          supabase.from('people').select('*').eq('user_id', user.id),
          supabase.from('village_entries').select('*').eq('user_id', user.id),
          supabase.from('city_entries').select('*').eq('user_id', user.id),
          supabase.from('dairy_entries').select('*').eq('user_id', user.id),
          supabase.from('payments').select('*').eq('user_id', user.id)
        ]);

        // Helper function to extract data from settled promises
        const extractData = (result: PromiseSettledResult<any>, tableName: string) => {
          if (result.status === 'fulfilled' && !result.value.error) {
            return result.value.data || [];
          } else {
            console.error(`Failed to load ${tableName}:`, result.status === 'fulfilled' ? result.value.error : result.reason);
            return [];
          }
        };

        const cloudData: AppData = {
          people: extractData(peopleRes, 'people').map((p: any) => ({
            id: p.id,
            name: p.name,
            value: p.value,
            category: p.category
          })),
          villageEntries: extractData(villageRes, 'village_entries').map((v: any) => ({
            id: v.id,
            personId: v.person_id,
            personName: v.person_name,
            date: v.date,
            mMilk: v.m_milk,
            mFat: v.m_fat,
            eMilk: v.e_milk,
            eFat: v.e_fat,
            mFatKg: v.m_fat_kg,
            eFatKg: v.e_fat_kg,
            rate: v.rate,
            amount: v.amount
          })),
          cityEntries: extractData(cityRes, 'city_entries').map((c: any) => ({
            id: c.id,
            personId: c.person_id,
            personName: c.person_name,
            date: c.date,
            value: c.value,
            rate: c.rate,
            amount: c.amount
          })),
          dairyEntries: extractData(dairyRes, 'dairy_entries').map((d: any) => ({
            id: d.id,
            personId: d.person_id,
            personName: d.person_name,
            date: d.date,
            session: d.session,
            milk: d.milk,
            fat: d.fat,
            meter: d.meter,
            rate: d.rate,
            fatKg: d.fat_kg,
            meterKg: d.meter_kg,
            fatAmount: d.fat_amount,
            meterAmount: d.meter_amount,
            totalAmount: d.total_amount
          })),
          payments: extractData(paymentsRes, 'payments').map((p: any) => ({
            id: p.id,
            personId: p.person_id,
            personName: p.person_name,
            date: p.date,
            amount: p.amount,
            comment: p.comment,
            type: p.type,
            category: p.category
          }))
        };

        console.log('Successfully loaded cloud data:', {
          people: cloudData.people.length,
          villageEntries: cloudData.villageEntries.length,
          cityEntries: cloudData.cityEntries.length,
          dairyEntries: cloudData.dairyEntries.length,
          payments: cloudData.payments.length
        });

        setData(cloudData);
        setLocalData(cloudData); // Cache for offline use
        setLastSyncTime(new Date());
      } else {
        console.log('Using cached offline data');
        // Use cached offline data
        setData(localData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setData(localData);
      setIsOffline(true);
    }

    setIsLoading(false);
  };

  const uploadLocalDataToCloud = async () => {
    if (!user || isOffline) return;
    
    console.log('📤 Uploading local data to cloud...');
    
    if (!hasLocalData()) {
      console.log('No local data to upload');
      return;
    }
    
    try {
      // Upload people
      if (localData.people && localData.people.length > 0) {
        const peopleToUpload = localData.people.map(person => ({
          id: person.id,
          user_id: user.id,
          name: person.name,
          value: person.value,
          category: person.category
        }));
        
        const { error: peopleError } = await supabase
          .from('people')
          .upsert(peopleToUpload, { onConflict: 'id' });
        
        if (peopleError) {
          console.error('Failed to upload people:', peopleError);
          throw peopleError;
        } else {
          console.log(`✅ Uploaded ${peopleToUpload.length} people`);
        }
      }
      
      // Upload village entries
      if (localData.villageEntries && localData.villageEntries.length > 0) {
        const villageEntriesToUpload = localData.villageEntries.map(entry => ({
          id: entry.id,
          user_id: user.id,
          person_id: entry.personId,
          person_name: entry.personName,
          date: entry.date,
          m_milk: entry.mMilk,
          m_fat: entry.mFat,
          e_milk: entry.eMilk,
          e_fat: entry.eFat,
          m_fat_kg: entry.mFatKg,
          e_fat_kg: entry.eFatKg,
          rate: entry.rate,
          amount: entry.amount
        }));
        
        const { error: villageError } = await supabase
          .from('village_entries')
          .upsert(villageEntriesToUpload, { onConflict: 'id' });
        
        if (villageError) {
          console.error('Failed to upload village entries:', villageError);
          throw villageError;
        } else {
          console.log(`✅ Uploaded ${villageEntriesToUpload.length} village entries`);
        }
      }
      
      // Upload city entries
      if (localData.cityEntries && localData.cityEntries.length > 0) {
        const cityEntriesToUpload = localData.cityEntries.map(entry => ({
          id: entry.id,
          user_id: user.id,
          person_id: entry.personId,
          person_name: entry.personName,
          date: entry.date,
          value: entry.value,
          rate: entry.rate,
          amount: entry.amount
        }));
        
        const { error: cityError } = await supabase
          .from('city_entries')
          .upsert(cityEntriesToUpload, { onConflict: 'id' });
        
        if (cityError) {
          console.error('Failed to upload city entries:', cityError);
          throw cityError;
        } else {
          console.log(`✅ Uploaded ${cityEntriesToUpload.length} city entries`);
        }
      }
      
      // Upload dairy entries
      if (localData.dairyEntries && localData.dairyEntries.length > 0) {
        const dairyEntriesToUpload = localData.dairyEntries.map(entry => ({
          id: entry.id,
          user_id: user.id,
          person_id: entry.personId,
          person_name: entry.personName,
          date: entry.date,
          session: entry.session,
          milk: entry.milk,
          fat: entry.fat,
          meter: entry.meter,
          rate: entry.rate,
          fat_kg: entry.fatKg,
          meter_kg: entry.meterKg,
          fat_amount: entry.fatAmount,
          meter_amount: entry.meterAmount,
          total_amount: entry.totalAmount
        }));
        
        const { error: dairyError } = await supabase
          .from('dairy_entries')
          .upsert(dairyEntriesToUpload, { onConflict: 'id' });
        
        if (dairyError) {
          console.error('Failed to upload dairy entries:', dairyError);
          throw dairyError;
        } else {
          console.log(`✅ Uploaded ${dairyEntriesToUpload.length} dairy entries`);
        }
      }
      
      // Upload payments
      if (localData.payments && localData.payments.length > 0) {
        const paymentsToUpload = localData.payments.map(payment => ({
          id: payment.id,
          user_id: user.id,
          person_id: payment.personId,
          person_name: payment.personName,
          date: payment.date,
          amount: payment.amount,
          comment: payment.comment,
          type: payment.type,
          category: payment.category
        }));
        
        const { error: paymentsError } = await supabase
          .from('payments')
          .upsert(paymentsToUpload, { onConflict: 'id' });
        
        if (paymentsError) {
          console.error('Failed to upload payments:', paymentsError);
          throw paymentsError;
        } else {
          console.log(`✅ Uploaded ${paymentsToUpload.length} payments`);
        }
      }
      
      console.log('🎉 Local data upload completed successfully!');
      
    } catch (error) {
      console.error('❌ Failed to upload local data:', error);
      throw error;
    }
  };

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const syncData = async () => {
    if (!user) return;
    
    console.log('Starting data sync...');

    setSyncStatus('syncing');
    try {
      // First check if we can connect
      const isOnline = await checkConnection();
      setIsOffline(!isOnline);
      
      if (isOnline) {
        // Check if we have local data to upload
        if (hasLocalData()) {
          console.log('📤 Uploading local data before sync...');
          try {
            await uploadLocalDataToCloud();
          } catch (error) {
            console.error('Upload failed during sync:', error);
            // Continue with sync even if upload fails
          }
        }
        
        // Then reload data from cloud
        await loadData();
        setSyncStatus('idle');
        setLastSyncTime(new Date());
        console.log('Sync completed successfully');
      } else {
        console.log('Cannot sync - offline');
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  };

  // Person operations
  const addPerson = async (person: Omit<Person, 'id'>) => {
    if (!user) return;

    const newPerson = { ...person, id: generateId() };
    
    // Update local state immediately
    setData(prev => ({
      ...prev,
      people: [...prev.people, newPerson]
    }));

    // Update local cache first
    setLocalData(prev => ({
      ...prev,
      people: [...prev.people, newPerson]
    }));

    if (!isOffline) {
      try {
        const { error } = await supabase.from('people').upsert({
          id: newPerson.id,
          user_id: user.id,
          name: person.name,
          value: person.value,
          category: person.category
        }, { onConflict: 'id' });
        
        if (error) {
          console.error('Failed to sync person to cloud:', error);
        }
      } catch (error) {
        console.error('Failed to sync person to cloud:', error);
      }
    }
  };

  const updatePerson = async (id: string, updatedPerson: Partial<Person>) => {
    if (!user) return;

    setData(prev => ({
      ...prev,
      people: prev.people.map(p => p.id === id ? { ...p, ...updatedPerson } : p)
    }));

    setLocalData(prev => ({
      ...prev,
      people: prev.people.map(p => p.id === id ? { ...p, ...updatedPerson } : p)
    }));

    if (!isOffline) {
      try {
        await supabase
          .from('people')
          .update({
            name: updatedPerson.name,
            value: updatedPerson.value,
            category: updatedPerson.category,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to sync person update to cloud:', error);
      }
    }
  };

  const deletePerson = async (id: string) => {
    if (!user) return;

    setData(prev => ({
      ...prev,
      people: prev.people.filter(p => p.id !== id)
    }));

    setLocalData(prev => ({
      ...prev,
      people: prev.people.filter(p => p.id !== id)
    }));

    if (!isOffline) {
      try {
        await supabase
          .from('people')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to sync person deletion to cloud:', error);
      }
    }
  };

  // Village entry operations
  const addVillageEntry = async (entry: Omit<VillageEntry, 'id'>) => {
    if (!user) return;

    const newEntry = { ...entry, id: generateId() };
    
    setData(prev => ({
      ...prev,
      villageEntries: [...prev.villageEntries, newEntry]
    }));

    setLocalData(prev => ({
      ...prev,
      villageEntries: [...prev.villageEntries, newEntry]
    }));

    if (!isOffline) {
      try {
        const { error } = await supabase.from('village_entries').upsert({
          id: newEntry.id,
          user_id: user.id,
          person_id: entry.personId,
          person_name: entry.personName,
          date: entry.date,
          m_milk: entry.mMilk,
          m_fat: entry.mFat,
          e_milk: entry.eMilk,
          e_fat: entry.eFat,
          m_fat_kg: entry.mFatKg,
          e_fat_kg: entry.eFatKg,
          rate: entry.rate,
          amount: entry.amount
        }, { onConflict: 'id' });
        
        if (error) {
          console.error('Failed to sync village entry to cloud:', error);
        }
      } catch (error) {
        console.error('Failed to sync village entry to cloud:', error);
      }
    }
  };

  const updateVillageEntry = async (id: string, updatedEntry: Partial<VillageEntry>) => {
    if (!user) return;

    setData(prev => ({
      ...prev,
      villageEntries: prev.villageEntries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
    }));

    if (!isOffline) {
      try {
        await supabase
          .from('village_entries')
          .update({
            person_id: updatedEntry.personId,
            person_name: updatedEntry.personName,
            date: updatedEntry.date,
            m_milk: updatedEntry.mMilk,
            m_fat: updatedEntry.mFat,
            e_milk: updatedEntry.eMilk,
            e_fat: updatedEntry.eFat,
            m_fat_kg: updatedEntry.mFatKg,
            e_fat_kg: updatedEntry.eFatKg,
            rate: updatedEntry.rate,
            amount: updatedEntry.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to sync village entry update to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      villageEntries: prev.villageEntries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
    }));
  };

  const deleteVillageEntry = async (id: string) => {
    if (!user) return;

    setData(prev => ({
      ...prev,
      villageEntries: prev.villageEntries.filter(e => e.id !== id)
    }));

    if (!isOffline) {
      try {
        await supabase
          .from('village_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to sync village entry deletion to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      villageEntries: prev.villageEntries.filter(e => e.id !== id)
    }));
  };

  // City entry operations
  const addCityEntry = async (entry: Omit<CityEntry, 'id'>) => {
    if (!user) return;

    const newEntry = { ...entry, id: generateId() };
    
    setData(prev => ({
      ...prev,
      cityEntries: [...prev.cityEntries, newEntry]
    }));

    if (!isOffline) {
      try {
        await supabase.from('city_entries').insert({
          id: newEntry.id,
          user_id: user.id,
          person_id: entry.personId,
          person_name: entry.personName,
          date: entry.date,
          value: entry.value,
          rate: entry.rate,
          amount: entry.amount
        });
      } catch (error) {
        console.error('Failed to sync city entry to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      cityEntries: [...prev.cityEntries, newEntry]
    }));
  };

  const updateCityEntry = async (id: string, updatedEntry: Partial<CityEntry>) => {
    if (!user) return;

    setData(prev => ({
      ...prev,
      cityEntries: prev.cityEntries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
    }));

    if (!isOffline) {
      try {
        await supabase
          .from('city_entries')
          .update({
            person_id: updatedEntry.personId,
            person_name: updatedEntry.personName,
            date: updatedEntry.date,
            value: updatedEntry.value,
            rate: updatedEntry.rate,
            amount: updatedEntry.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to sync city entry update to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      cityEntries: prev.cityEntries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
    }));
  };

  const deleteCityEntry = async (id: string) => {
    if (!user) return;

    setData(prev => ({
      ...prev,
      cityEntries: prev.cityEntries.filter(e => e.id !== id)
    }));

    if (!isOffline) {
      try {
        await supabase
          .from('city_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to sync city entry deletion to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      cityEntries: prev.cityEntries.filter(e => e.id !== id)
    }));
  };

  // Dairy entry operations
  const addDairyEntry = async (entry: Omit<DairyEntry, 'id'>) => {
    if (!user) return;

    const newEntry = { ...entry, id: generateId() };
    
    setData(prev => ({
      ...prev,
      dairyEntries: [...prev.dairyEntries, newEntry]
    }));

    if (!isOffline) {
      try {
        await supabase.from('dairy_entries').insert({
          id: newEntry.id,
          user_id: user.id,
          person_id: entry.personId,
          person_name: entry.personName,
          date: entry.date,
          session: entry.session,
          milk: entry.milk,
          fat: entry.fat,
          meter: entry.meter,
          rate: entry.rate,
          fat_kg: entry.fatKg,
          meter_kg: entry.meterKg,
          fat_amount: entry.fatAmount,
          meter_amount: entry.meterAmount,
          total_amount: entry.totalAmount
        });
      } catch (error) {
        console.error('Failed to sync dairy entry to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      dairyEntries: [...prev.dairyEntries, newEntry]
    }));
  };

  const updateDairyEntry = async (id: string, updatedEntry: Partial<DairyEntry>) => {
    if (!user) return;

    setData(prev => ({
      ...prev,
      dairyEntries: prev.dairyEntries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
    }));

    if (!isOffline) {
      try {
        await supabase
          .from('dairy_entries')
          .update({
            person_id: updatedEntry.personId,
            person_name: updatedEntry.personName,
            date: updatedEntry.date,
            session: updatedEntry.session,
            milk: updatedEntry.milk,
            fat: updatedEntry.fat,
            meter: updatedEntry.meter,
            rate: updatedEntry.rate,
            fat_kg: updatedEntry.fatKg,
            meter_kg: updatedEntry.meterKg,
            fat_amount: updatedEntry.fatAmount,
            meter_amount: updatedEntry.meterAmount,
            total_amount: updatedEntry.totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to sync dairy entry update to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      dairyEntries: prev.dairyEntries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
    }));
  };

  const deleteDairyEntry = async (id: string) => {
    if (!user) return;

    setData(prev => ({
      ...prev,
      dairyEntries: prev.dairyEntries.filter(e => e.id !== id)
    }));

    if (!isOffline) {
      try {
        await supabase
          .from('dairy_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to sync dairy entry deletion to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      dairyEntries: prev.dairyEntries.filter(e => e.id !== id)
    }));
  };

  // Payment operations
  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    if (!user) return;

    const newPayment = { ...payment, id: generateId() };
    
    setData(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment]
    }));

    if (!isOffline) {
      try {
        await supabase.from('payments').insert({
          id: newPayment.id,
          user_id: user.id,
          person_id: payment.personId,
          person_name: payment.personName,
          date: payment.date,
          amount: payment.amount,
          comment: payment.comment,
          type: payment.type,
          category: payment.category
        });
      } catch (error) {
        console.error('Failed to sync payment to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment]
    }));
  };

  const updatePayment = async (id: string, updatedPayment: Partial<Payment>) => {
    if (!user) return;

    setData(prev => ({
      ...prev,
      payments: prev.payments.map(p => p.id === id ? { ...p, ...updatedPayment } : p)
    }));

    if (!isOffline) {
      try {
        await supabase
          .from('payments')
          .update({
            person_id: updatedPayment.personId,
            person_name: updatedPayment.personName,
            date: updatedPayment.date,
            amount: updatedPayment.amount,
            comment: updatedPayment.comment,
            type: updatedPayment.type,
            category: updatedPayment.category,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to sync payment update to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      payments: prev.payments.map(p => p.id === id ? { ...p, ...updatedPayment } : p)
    }));
  };

  const deletePayment = async (id: string) => {
    if (!user) return;

    setData(prev => ({
      ...prev,
      payments: prev.payments.filter(p => p.id !== id)
    }));

    if (!isOffline) {
      try {
        await supabase
          .from('payments')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to sync payment deletion to cloud:', error);
      }
    }

    setLocalData(prev => ({
      ...prev,
      payments: prev.payments.filter(p => p.id !== id)
    }));
  };

  return (
    <DataContext.Provider value={{
      data,
      isLoading,
      isOffline,
      syncStatus,
      lastSyncTime,
      addPerson,
      updatePerson,
      deletePerson,
      addVillageEntry,
      updateVillageEntry,
      deleteVillageEntry,
      addCityEntry,
      updateCityEntry,
      deleteCityEntry,
      addDairyEntry,
      updateDairyEntry,
      deleteDairyEntry,
      addPayment,
      updatePayment,
      deletePayment,
      syncData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
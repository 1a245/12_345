import React, { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppData, Person, VillageEntry, CityEntry, DairyEntry, Payment } from '../types';

interface DataContextType {
  data: AppData;
  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (id: string, person: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  addVillageEntry: (entry: Omit<VillageEntry, 'id'>) => void;
  updateVillageEntry: (id: string, entry: Partial<VillageEntry>) => void;
  deleteVillageEntry: (id: string) => void;
  addCityEntry: (entry: Omit<CityEntry, 'id'>) => void;
  updateCityEntry: (id: string, entry: Partial<CityEntry>) => void;
  deleteCityEntry: (id: string) => void;
  addDairyEntry: (entry: Omit<DairyEntry, 'id'>) => void;
  updateDairyEntry: (id: string, entry: Partial<DairyEntry>) => void;
  deleteDairyEntry: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
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
  const [data, setData] = useLocalStorage<AppData>('m13-data', initialData);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addPerson = (person: Omit<Person, 'id'>) => {
    setData(prev => ({
      ...prev,
      people: [...prev.people, { ...person, id: generateId() }]
    }));
  };

  const updatePerson = (id: string, updatedPerson: Partial<Person>) => {
    setData(prev => ({
      ...prev,
      people: prev.people.map(p => p.id === id ? { ...p, ...updatedPerson } : p)
    }));
  };

  const deletePerson = (id: string) => {
    setData(prev => ({
      ...prev,
      people: prev.people.filter(p => p.id !== id)
    }));
  };

  const addVillageEntry = (entry: Omit<VillageEntry, 'id'>) => {
    setData(prev => ({
      ...prev,
      villageEntries: [...prev.villageEntries, { ...entry, id: generateId() }]
    }));
  };

  const updateVillageEntry = (id: string, updatedEntry: Partial<VillageEntry>) => {
    setData(prev => ({
      ...prev,
      villageEntries: prev.villageEntries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
    }));
  };

  const deleteVillageEntry = (id: string) => {
    setData(prev => ({
      ...prev,
      villageEntries: prev.villageEntries.filter(e => e.id !== id)
    }));
  };

  const addCityEntry = (entry: Omit<CityEntry, 'id'>) => {
    setData(prev => ({
      ...prev,
      cityEntries: [...prev.cityEntries, { ...entry, id: generateId() }]
    }));
  };

  const updateCityEntry = (id: string, updatedEntry: Partial<CityEntry>) => {
    setData(prev => ({
      ...prev,
      cityEntries: prev.cityEntries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
    }));
  };

  const deleteCityEntry = (id: string) => {
    setData(prev => ({
      ...prev,
      cityEntries: prev.cityEntries.filter(e => e.id !== id)
    }));
  };

  const addDairyEntry = (entry: Omit<DairyEntry, 'id'>) => {
    setData(prev => ({
      ...prev,
      dairyEntries: [...prev.dairyEntries, { ...entry, id: generateId() }]
    }));
  };

  const updateDairyEntry = (id: string, updatedEntry: Partial<DairyEntry>) => {
    setData(prev => ({
      ...prev,
      dairyEntries: prev.dairyEntries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
    }));
  };

  const deleteDairyEntry = (id: string) => {
    setData(prev => ({
      ...prev,
      dairyEntries: prev.dairyEntries.filter(e => e.id !== id)
    }));
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    setData(prev => ({
      ...prev,
      payments: [...prev.payments, { ...payment, id: generateId() }]
    }));
  };

  const updatePayment = (id: string, updatedPayment: Partial<Payment>) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(p => p.id === id ? { ...p, ...updatedPayment } : p)
    }));
  };

  const deletePayment = (id: string) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.filter(p => p.id !== id)
    }));
  };

  return (
    <DataContext.Provider value={{
      data,
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
      deletePayment
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
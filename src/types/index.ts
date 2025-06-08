export interface User {
  id: string;
  username: string;
  password: string;
}

export interface Person {
  id: string;
  name: string;
  value: number;
  category: 'village' | 'city' | 'dairy';
}

export interface VillageEntry {
  id: string;
  personId: string;
  personName: string;
  date: string;
  mMilk: number;
  mFat: number;
  eMilk: number;
  eFat: number;
  mFatKg: number;
  eFatKg: number;
  rate: number;
  amount: number;
}

export interface CityEntry {
  id: string;
  personId: string;
  personName: string;
  date: string;
  value: number;
  rate: number;
  amount: number;
}

export interface DairyEntry {
  id: string;
  personId: string;
  personName: string;
  date: string;
  session: 'morning' | 'evening';
  milk: number;
  fat: number;
  meter: number;
  rate: number;
  fatKg: number;
  meterKg: number;
  fatAmount: number;
  meterAmount: number;
  totalAmount: number;
}

export interface Payment {
  id: string;
  personId: string;
  personName: string;
  date: string;
  amount: number;
  comment: string;
  type: 'given' | 'received';
  category: 'village' | 'city' | 'dairy';
}

export interface AppData {
  people: Person[];
  villageEntries: VillageEntry[];
  cityEntries: CityEntry[];
  dairyEntries: DairyEntry[];
  payments: Payment[];
}
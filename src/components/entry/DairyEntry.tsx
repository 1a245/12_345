import React, { useState } from 'react';
import { Save, Sun, Moon, Edit2, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../Calendar';
import { useData } from '../../context/DataContext';

export function DairyEntry() {
  const { data, addDairyEntry, updateDairyEntry } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [selectedSession, setSelectedSession] = useState<'morning' | 'evening'>('morning');
  const [formData, setFormData] = useState({
    milk: '',
    fat: '',
    meter: ''
  });

  const dairyPeople = data.people.filter(p => p.category === 'dairy');
  const selectedPerson = dairyPeople.find(p => p.id === selectedPersonId);

  const existingEntry = data.dairyEntries.find(
    e => e.personId === selectedPersonId && e.date === selectedDate && e.session === selectedSession
  );

  const calculateValues = () => {
    const milk = parseFloat(formData.milk) || 0;
    const fat = parseFloat(formData.fat) || 0;
    const meter = parseFloat(formData.meter) || 0;
    const rate = selectedPerson?.value || 0;

    const fatKg = (milk * fat) / 1000;
    const meterKg = (((meter * 25) + 14 + (2 * fat)) * milk) / 10000;
    const fatAmount = (fatKg * rate * 60) / 100;
    const meterAmount = (meterKg * (rate / 327)) * 100;
    const totalAmount = fatAmount + meterAmount;

    return { fatKg, meterKg, fatAmount, meterAmount, totalAmount, rate };
  };

  const { fatKg, meterKg, fatAmount, meterAmount, totalAmount, rate } = calculateValues();

  const handleSave = () => {
    if (!selectedPersonId || !selectedPerson) return;

    const entryData = {
      personId: selectedPersonId,
      personName: selectedPerson.name,
      date: selectedDate,
      session: selectedSession,
      milk: parseFloat(formData.milk) || 0,
      fat: parseFloat(formData.fat) || 0,
      meter: parseFloat(formData.meter) || 0,
      rate,
      fatKg,
      meterKg,
      fatAmount,
      meterAmount,
      totalAmount
    };

    if (existingEntry) {
      updateDairyEntry(existingEntry.id, entryData);
    } else {
      addDairyEntry(entryData);
    }

    setFormData({ milk: '', fat: '', meter: '' });
    setSelectedPersonId('');
  };

  const handleClear = () => {
    setFormData({ milk: '', fat: '', meter: '' });
  };

  React.useEffect(() => {
    if (existingEntry) {
      setFormData({
        milk: existingEntry.milk.toString(),
        fat: existingEntry.fat.toString(),
        meter: existingEntry.meter.toString()
      });
    } else {
      setFormData({ milk: '', fat: '', meter: '' });
    }
  }, [existingEntry]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dairy Entry</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Select Date
          </h3>
          <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Person
            </label>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a person...</option>
              {dairyPeople.map(person => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedSession('morning')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedSession === 'morning'
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Sun className="w-4 h-4" />
                Morning
              </button>
              <button
                onClick={() => setSelectedSession('evening')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedSession === 'evening'
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Moon className="w-4 h-4" />
                Evening
              </button>
            </div>
          </div>

          {selectedPersonId && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {selectedSession === 'morning' ? '🌅' : '🌙'} {selectedSession.charAt(0).toUpperCase() + selectedSession.slice(1)} Entry for {selectedPerson?.name} - {selectedDate}
                </h4>
                {existingEntry && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <Edit2 className="w-3 h-3" />
                    Editing Existing Entry
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MILK
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.milk}
                    onChange={(e) => setFormData(prev => ({ ...prev, milk: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FAT
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fat}
                    onChange={(e) => setFormData(prev => ({ ...prev, fat: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    METER
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.meter}
                    onChange={(e) => setFormData(prev => ({ ...prev, meter: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RATE
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {rate.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FATKG
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {fatKg.toFixed(4)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    METERKG
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {meterKg.toFixed(4)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FAT/AMOUNT
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{fatAmount.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    METER/AMOUNT
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{meterAmount.toFixed(2)}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    TOTAL AMOUNT
                  </label>
                  <div className="text-xl font-bold text-green-900">
                    ₹{totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {existingEntry ? 'Update Entry' : 'Save Entry'}
                </button>
                <button
                  onClick={handleClear}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Form
                </button>
              </div>

              {existingEntry && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> An entry already exists for this person on {selectedDate} ({selectedSession} session). 
                    Making changes will update the existing entry.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
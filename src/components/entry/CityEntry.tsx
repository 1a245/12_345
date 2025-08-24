import React, { useState } from 'react';
import { Save, Edit2, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../Calendar';
import { useData } from '../../context/DataContext';

export function CityEntry() {
  const { data, addCityEntry, updateCityEntry } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [value, setValue] = useState('');

  const cityPeople = data.people.filter(p => p.category === 'city');
  const selectedPerson = cityPeople.find(p => p.id == selectedPersonId);
  
  const existingEntry = data.cityEntries.find(
    e => e.personId === selectedPersonId && e.date === selectedDate
  );

  const handleSave = () => {
    if (!selectedPersonId || !selectedPerson || !value) return;

    const entryData = {
      personId: selectedPersonId,
      personName: selectedPerson.name,
      date: selectedDate,
      value: parseFloat(value),
      rate: selectedPerson.value,
      amount: parseFloat(value) * selectedPerson.value
    };

    if (existingEntry) {
      updateCityEntry(existingEntry.id, entryData);
    } else {
      addCityEntry(entryData);
    }

    setValue('');
    setSelectedPersonId('');
  };

  const handleClear = () => {
    setValue('');
  };

  React.useEffect(() => {
    if (existingEntry) {
      setValue(existingEntry.value.toString());
    } else {
      setValue('');
    }
  }, [existingEntry]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">City Entry</h2>

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
              {cityPeople.map(person => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPersonId && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Entry for {selectedPerson?.name} - {selectedDate}
                </h4>
                {existingEntry && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <Edit2 className="w-3 h-3" />
                    Editing Existing Entry
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter value"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedPerson?.value.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Amount
                    </label>
                    <div className="text-xl font-bold text-blue-900">
                      ₹{((parseFloat(value) || 0) * (selectedPerson?.value || 0)).toFixed(2)}
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
                      <strong>Note:</strong> An entry already exists for this person on {selectedDate}. 
                      Making changes will update the existing entry.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
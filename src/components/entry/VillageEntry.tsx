import React, { useState } from "react";
import { Save, Edit2, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../Calendar";
import { useData } from "../../context/DataContext";
import { Person, VillageEntry as VillageEntryType } from "../../types";

export function VillageEntry() {
  const { data, addVillageEntry, updateVillageEntry } = useData();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState({
    mMilk: "",
    mFat: "",
    eMilk: "",
    eFat: "",
  });

  const villagePeople = data.people.filter((p) => p.category === "village");
  console.log("kamaldata", selectedPerson);

  const existingEntry = data.villageEntries.find(
    (e) => e.personId === selectedPerson?.id && e.date === selectedDate
  );

  const calculateValues = () => {
    const mMilk = parseFloat(formData.mMilk) || 0;
    const mFat = parseFloat(formData.mFat) || 0;
    const eMilk = parseFloat(formData.eMilk) || 0;
    const eFat = parseFloat(formData.eFat) || 0;
    const rate = selectedPerson?.value || 0;

    const mFatKg = mMilk * mFat;
    const eFatKg = eMilk * eFat;
    const amount = rate * (mFatKg + eFatKg);

    return { mFatKg, eFatKg, rate, amount };
  };

  const { mFatKg, eFatKg, rate, amount } = calculateValues();

  const handleSave = () => {
    if (!selectedPerson) return;

    const entryData = {
      personId: selectedPerson.id,
      personName: selectedPerson.name,
      date: selectedDate,
      mMilk: parseFloat(formData.mMilk) || 0,
      mFat: parseFloat(formData.mFat) || 0,
      eMilk: parseFloat(formData.eMilk) || 0,
      eFat: parseFloat(formData.eFat) || 0,
      mFatKg,
      eFatKg,
      rate,
      amount,
    };

    if (existingEntry) {
      updateVillageEntry(existingEntry.id, entryData);
    } else {
      addVillageEntry(entryData);
    }

    // Clear form after save
    setFormData({ mMilk: "", mFat: "", eMilk: "", eFat: "" });
    setSelectedPerson(null);
  };

  const handleClear = () => {
    setFormData({ mMilk: "", mFat: "", eMilk: "", eFat: "" });
  };

  React.useEffect(() => {
    if (existingEntry) {
      setFormData({
        mMilk: existingEntry.mMilk.toString(),
        mFat: existingEntry.mFat.toString(),
        eMilk: existingEntry.eMilk.toString(),
        eFat: existingEntry.eFat.toString(),
      });
    } else {
      setFormData({ mMilk: "", mFat: "", eMilk: "", eFat: "" });
    }
  }, [existingEntry]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Village Entry</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Select Date
          </h3>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Person
            </label>
            <select
              value={selectedPerson?.id}
              onChange={(e) => {
                console.log("e.target.value", e.target.value, villagePeople);
                setSelectedPerson(
                  villagePeople.find((p) => p.id == e.target.value) || null
                );
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a person...</option>
              {villagePeople.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPerson?.id && (
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

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    M/MILK
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.mMilk}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        mMilk: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    M/FAT
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.mFat}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, mFat: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E/MILK
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.eMilk}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        eMilk: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E/FAT
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.eFat}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, eFat: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    M/FATKG
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {mFatKg.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E/FATKG
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {eFatKg.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RATE
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {rate.toFixed(2)}
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    AMOUNT
                  </label>
                  <div className="text-xl font-bold text-blue-900">
                    ₹{amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {existingEntry ? "Update Entry" : "Save Entry"}
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
                    <strong>Note:</strong> An entry already exists for this
                    person on {selectedDate}. Making changes will update the
                    existing entry.
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

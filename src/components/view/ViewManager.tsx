import React, { useState } from 'react';
import { Filter, Download, Calendar, User, FileText, Calculator } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { LedgerView } from './LedgerView';

interface ViewManagerProps {
  category: 'village' | 'city' | 'dairy';
}

export function ViewManager({ category }: ViewManagerProps) {
  const { data } = useData();
  const [viewType, setViewType] = useState<'data' | 'ledger'>('data');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedPeriod, setSelectedPeriod] = useState<'1-15' | '16-31' | '1-10' | '11-20' | '21-31'>('1-15');
  
  // New state for village date range
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonthForVillage, setSelectedMonthForVillage] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [startDate, setStartDate] = useState('1');
  const [endDate, setEndDate] = useState('15');

  const people = data.people.filter(p => p.category === category);

  if (viewType === 'ledger') {
    return <LedgerView category={category} />;
  }

  const getFilteredData = () => {
    switch (category) {
      case 'village':
        return data.villageEntries.filter(entry => {
          const matchesPerson = !selectedPerson || entry.personId === selectedPerson;
          const entryDate = new Date(entry.date);
          const entryYear = entryDate.getFullYear();
          const entryMonth = entryDate.getMonth() + 1;
          const entryDay = entryDate.getDate();
          
          const matchesYear = entryYear === parseInt(selectedYear);
          const matchesMonth = entryMonth === parseInt(selectedMonthForVillage);
          const matchesDateRange = entryDay >= parseInt(startDate) && entryDay <= parseInt(endDate);
          
          return matchesPerson && matchesYear && matchesMonth && matchesDateRange;
        });

      case 'city':
        return data.cityEntries.filter(entry => {
          const matchesPerson = !selectedPerson || entry.personId === selectedPerson;
          const matchesMonth = entry.date.startsWith(selectedMonth);
          return matchesPerson && matchesMonth;
        });

      case 'dairy':
        return data.dairyEntries.filter(entry => {
          const matchesPerson = !selectedPerson || entry.personId === selectedPerson;
          const entryDate = new Date(entry.date);
          const day = entryDate.getDate();
          
          let matchesPeriod = true;
          if (selectedPeriod === '1-10') {
            matchesPeriod = day >= 1 && day <= 10;
          } else if (selectedPeriod === '11-20') {
            matchesPeriod = day >= 11 && day <= 20;
          } else if (selectedPeriod === '21-31') {
            matchesPeriod = day >= 21 && day <= 31;
          }
          
          return matchesPerson && matchesPeriod;
        });

      default:
        return [];
    }
  };

  const filteredData = getFilteredData();

  const calculateTotals = () => {
    switch (category) {
      case 'village':
        const villageData = filteredData as any[];
        return {
          totalAmount: villageData.reduce((sum, entry) => sum + entry.amount, 0),
          totalEntries: villageData.length
        };

      case 'city':
        const cityData = filteredData as any[];
        return {
          totalAmount: cityData.reduce((sum, entry) => sum + entry.amount, 0),
          totalEntries: cityData.length
        };

      case 'dairy':
        const dairyData = filteredData as any[];
        return {
          totalAmount: dairyData.reduce((sum, entry) => sum + entry.totalAmount, 0),
          totalEntries: dairyData.length
        };

      default:
        return { totalAmount: 0, totalEntries: 0 };
    }
  };

  const { totalAmount, totalEntries } = calculateTotals();

  const handleExport = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${category}-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = () => {
    let headers = '';
    let rows = '';

    switch (category) {
      case 'village':
        headers = 'Date,Person,M/Milk,M/Fat,E/Milk,E/Fat,M/FatKg,E/FatKg,Rate,Amount\n';
        rows = filteredData.map((entry: any) => 
          `${entry.date},${entry.personName},${entry.mMilk},${entry.mFat},${entry.eMilk},${entry.eFat},${entry.mFatKg},${entry.eFatKg},${entry.rate},${entry.amount}`
        ).join('\n');
        break;

      case 'city':
        headers = 'Date,Person,Value,Rate,Amount\n';
        rows = filteredData.map((entry: any) => 
          `${entry.date},${entry.personName},${entry.value},${entry.rate},${entry.amount}`
        ).join('\n');
        break;

      case 'dairy':
        headers = 'Date,Person,Session,Milk,Fat,Meter,Rate,FatKg,MeterKg,Fat Amount,Meter Amount,Total Amount\n';
        rows = filteredData.map((entry: any) => 
          `${entry.date},${entry.personName},${entry.session},${entry.milk},${entry.fat},${entry.meter},${entry.rate},${entry.fatKg},${entry.meterKg},${entry.fatAmount},${entry.meterAmount},${entry.totalAmount}`
        ).join('\n');
        break;
    }

    return headers + rows;
  };

  const renderTableHeaders = () => {
    switch (category) {
      case 'village':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">M/Milk</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">M/Fat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E/Milk</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E/Fat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
          </tr>
        );

      case 'city':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
          </tr>
        );

      case 'dairy':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milk</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
          </tr>
        );
    }
  };

  const renderTableRows = () => {
    return filteredData.map((entry: any) => {
      switch (category) {
        case 'village':
          return (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.personName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.mMilk.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.mFat.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.eMilk.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.eFat.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{entry.amount.toFixed(2)}</td>
            </tr>
          );

        case 'city':
          return (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.personName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.value.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.rate.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{entry.amount.toFixed(2)}</td>
            </tr>
          );

        case 'dairy':
          return (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.personName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  entry.session === 'morning' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {entry.session}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.milk.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.fat.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{entry.totalAmount.toFixed(2)}</td>
            </tr>
          );
      }
    });
  };

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push(i.toString());
  }

  // Generate month options
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Generate day options
  const dayOptions = [];
  for (let i = 1; i <= 31; i++) {
    dayOptions.push(i.toString());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 capitalize">
          {category} View
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('data')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewType === 'data'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Data View
            </button>
            <button
              onClick={() => setViewType('ledger')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewType === 'ledger'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Ledger View
            </button>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Person
            </label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All People</option>
              {people.map(person => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {category === 'village' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <select
                  value={selectedMonthForVillage}
                  onChange={(e) => setSelectedMonthForVillage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <select
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {dayOptions.map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <select
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {dayOptions.map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {category === 'city' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {category === 'dairy' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1-10">1st - 10th</option>
                <option value="11-20">11th - 20th</option>
                <option value="21-31">21st - 31st</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">Total Entries</p>
              <p className="text-2xl font-bold text-blue-900">{totalEntries}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">₹</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-900">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Data Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              {renderTableHeaders()}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No data found matching the selected filters.
                  </td>
                </tr>
              ) : (
                renderTableRows()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
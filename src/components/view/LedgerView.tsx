import React, { useState } from 'react';
import { Calculator, Download, User, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface LedgerViewProps {
  category: 'village' | 'city' | 'dairy';
}

export function LedgerView({ category }: LedgerViewProps) {
  const { data } = useData();
  const [selectedPerson, setSelectedPerson] = useState('');
  
  // Use unified date range for all categories
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(currentDate.toISOString().split('T')[0]);

  const people = data.people.filter(p => p.category === category);

  const calculateLedgerData = () => {
    const ledgerData: Array<{
      personId: string;
      personName: string;
      totalEarnings: number;
      totalPayments: number;
      netAmount: number;
      entries: Array<{
        date: string;
        type: 'entry' | 'payment';
        amount: number;
        description: string;
      }>;
    }> = [];

    const filteredPeople = selectedPerson ? people.filter(p => p.id === selectedPerson) : people;

    // Helper function to check if date is in range
    const isDateInRange = (date: string) => {
      return date >= startDate && date <= endDate;
    };

    filteredPeople.forEach(person => {
      const personEntries: Array<{
        date: string;
        type: 'entry' | 'payment';
        amount: number;
        description: string;
      }> = [];

      let totalEarnings = 0;
      let totalPayments = 0;

      // Get entries based on category - filter by date range
      if (category === 'village') {
        const entries = data.villageEntries.filter(e => 
          e.personId === person.id && isDateInRange(e.date)
        );
        entries.forEach(entry => {
          totalEarnings += entry.amount;
          personEntries.push({
            date: entry.date,
            type: 'entry',
            amount: entry.amount,
            description: `Village Entry - M/Milk: ${entry.mMilk}, E/Milk: ${entry.eMilk}`
          });
        });
      } else if (category === 'city') {
        const entries = data.cityEntries.filter(e => 
          e.personId === person.id && isDateInRange(e.date)
        );
        entries.forEach(entry => {
          totalEarnings += entry.amount;
          personEntries.push({
            date: entry.date,
            type: 'entry',
            amount: entry.amount,
            description: `City Entry - Value: ${entry.value}`
          });
        });
      } else if (category === 'dairy') {
        const entries = data.dairyEntries.filter(e => 
          e.personId === person.id && isDateInRange(e.date)
        );
        entries.forEach(entry => {
          totalEarnings += entry.totalAmount;
          personEntries.push({
            date: entry.date,
            type: 'entry',
            amount: entry.totalAmount,
            description: `Dairy Entry - ${entry.session} - Milk: ${entry.milk}, Fat: ${entry.fat}`
          });
        });
      }

      // Get payments - filter by date range
      const payments = data.payments.filter(p => 
        p.personId === person.id && p.category === category && isDateInRange(p.date)
      );

      payments.forEach(payment => {
        totalPayments += payment.amount;
        personEntries.push({
          date: payment.date,
          type: 'payment',
          amount: -payment.amount,
          description: `Payment - ${payment.comment || 'No comment'}`
        });
      });

      // Sort entries by date
      personEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      ledgerData.push({
        personId: person.id,
        personName: person.name,
        totalEarnings,
        totalPayments,
        netAmount: totalEarnings - totalPayments,
        entries: personEntries
      });
    });

    return ledgerData;
  };

  const ledgerData = calculateLedgerData();

  const handleExportLedger = () => {
    let csvContent = 'Person,Date,Type,Amount,Description,Running Balance\n';
    
    ledgerData.forEach(person => {
      let runningBalance = 0;
      person.entries.forEach(entry => {
        runningBalance += entry.amount;
        csvContent += `${person.personName},${entry.date},${entry.type},${entry.amount.toFixed(2)},"${entry.description}",${runningBalance.toFixed(2)}\n`;
      });
      csvContent += '\n'; // Empty line between people
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${category}-ledger-${startDate}-to-${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalEarnings = ledgerData.reduce((sum, person) => sum + person.totalEarnings, 0);
  const totalPayments = ledgerData.reduce((sum, person) => sum + person.totalPayments, 0);
  const totalNet = totalEarnings - totalPayments;

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 capitalize flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          {category} Ledger
        </h2>
        <button
          onClick={handleExportLedger}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Ledger
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                const today = new Date();
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              This Month
            </button>
          </div>
        </div>

        {/* Date Range Display */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Ledger from:</strong> {formatDateForDisplay(startDate)} to {formatDateForDisplay(endDate)}
            {selectedPerson && (
              <span className="ml-2">
                <strong>for:</strong> {people.find(p => p.id === selectedPerson)?.name}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-900">₹{totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-600">Total Payments</p>
              <p className="text-2xl font-bold text-red-900">₹{totalPayments.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className={`border rounded-lg p-6 ${totalNet >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center">
            <Calculator className={`w-8 h-8 mr-3 ${totalNet >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <div>
              <p className={`text-sm font-medium ${totalNet >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net Amount</p>
              <p className={`text-2xl font-bold ${totalNet >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>₹{totalNet.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Details */}
      <div className="space-y-6">
        {ledgerData.map(person => (
          <div key={person.personId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg font-medium text-gray-900">{person.personName}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                  <span className="text-green-600 font-medium">
                    Earnings: ₹{person.totalEarnings.toFixed(2)}
                  </span>
                  <span className="text-red-600 font-medium">
                    Payments: ₹{person.totalPayments.toFixed(2)}
                  </span>
                  <span className={`font-bold ${person.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    Net: ₹{person.netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {person.entries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      let runningBalance = 0;
                      return person.entries.map((entry, index) => {
                        runningBalance += entry.amount;
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                entry.type === 'entry' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {entry.type === 'entry' ? 'Entry' : 'Payment'}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{entry.description}</td>
                            <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                              entry.amount >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {entry.amount >= 0 ? '+' : ''}₹{entry.amount.toFixed(2)}
                            </td>
                            <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                              runningBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
                            }`}>
                              ₹{runningBalance.toFixed(2)}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                No transactions found for this person in the selected date range.
              </div>
            )}
          </div>
        ))}
      </div>

      {ledgerData.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No ledger data found for the selected filters.
        </div>
      )}
    </div>
  );
}
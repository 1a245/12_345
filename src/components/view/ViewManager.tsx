import React, { useState } from 'react';
import { Filter, Download, Calendar, User, FileText, Calculator, Share2, FileDown } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { LedgerView } from './LedgerView';
import { ShareModal } from './ShareModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ViewManagerProps {
  category: 'village' | 'city' | 'dairy';
}

export function ViewManager({ category }: ViewManagerProps) {
  const { data } = useData();
  const [viewType, setViewType] = useState<'data' | 'ledger'>('data');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Unified date range state for all categories
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(currentDate.toISOString().split('T')[0]);

  const people = data.people.filter(p => p.category === category);

  if (viewType === 'ledger') {
    return <LedgerView category={category} />;
  }

  const getFilteredData = () => {
    const filterByDateRange = (entryDate: string) => {
      return entryDate >= startDate && entryDate <= endDate;
    };

    switch (category) {
      case 'village':
        return data.villageEntries.filter(entry => {
          const matchesPerson = !selectedPerson || entry.personId === selectedPerson;
          const matchesDateRange = filterByDateRange(entry.date);
          return matchesPerson && matchesDateRange;
        });

      case 'city':
        return data.cityEntries.filter(entry => {
          const matchesPerson = !selectedPerson || entry.personId === selectedPerson;
          const matchesDateRange = filterByDateRange(entry.date);
          return matchesPerson && matchesDateRange;
        });

      case 'dairy':
        return data.dairyEntries.filter(entry => {
          const matchesPerson = !selectedPerson || entry.personId === selectedPerson;
          const matchesDateRange = filterByDateRange(entry.date);
          return matchesPerson && matchesDateRange;
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

  const getDateRangeString = () => {
    return `${startDate}_to_${endDate}`;
  };

  const getSelectedPersonName = () => {
    if (!selectedPerson) return 'All_Customers';
    const person = people.find(p => p.id === selectedPerson);
    return person ? person.name.replace(/\s+/g, '_') : 'Unknown_Customer';
  };

  const generateFileName = (type: 'csv' | 'pdf') => {
    const customerName = getSelectedPersonName();
    const dateRange = getDateRangeString();
    const extension = type === 'csv' ? 'csv' : 'pdf';
    return `${customerName}_${category}_${dateRange}.${extension}`;
  };

  const handleExport = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', generateFileName('csv'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePDFDownload = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`${category.toUpperCase()} DATA REPORT`, 20, 20);
    
    // Add filters info
    doc.setFontSize(12);
    const customerName = getSelectedPersonName().replace(/_/g, ' ');
    const dateRangeDisplay = `${startDate} to ${endDate}`;
    doc.text(`Customer: ${customerName}`, 20, 35);
    doc.text(`Date Range: ${dateRangeDisplay}`, 20, 45);
    doc.text(`Total Entries: ${totalEntries}`, 20, 55);
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 20, 65);

    // Prepare table data
    let headers: string[] = [];
    let rows: any[][] = [];

    switch (category) {
      case 'village':
        headers = ['Date', 'Person', 'M/Milk', 'M/Fat', 'E/Milk', 'E/Fat', 'Amount'];
        rows = filteredData.map((entry: any) => [
          entry.date,
          entry.personName,
          entry.mMilk.toFixed(2),
          entry.mFat.toFixed(2),
          entry.eMilk.toFixed(2),
          entry.eFat.toFixed(2),
          `₹${entry.amount.toFixed(2)}`
        ]);
        break;

      case 'city':
        headers = ['Date', 'Person', 'Value', 'Rate', 'Amount'];
        rows = filteredData.map((entry: any) => [
          entry.date,
          entry.personName,
          entry.value.toFixed(2),
          entry.rate.toFixed(2),
          `₹${entry.amount.toFixed(2)}`
        ]);
        break;

      case 'dairy':
        headers = ['Date', 'Person', 'Session', 'Milk', 'Fat', 'Total Amount'];
        rows = filteredData.map((entry: any) => [
          entry.date,
          entry.personName,
          entry.session,
          entry.milk.toFixed(2),
          entry.fat.toFixed(2),
          `₹${entry.totalAmount.toFixed(2)}`
        ]);
        break;
    }

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 75,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    // Save PDF
    doc.save(generateFileName('pdf'));
  };

  const handleShare = () => {
    const customerName = getSelectedPersonName().replace(/_/g, ' ');
    const dateRangeDisplay = `${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`;
    const deviceInfo = `Generated on ${new Date().toLocaleDateString()} from M13 Business Management`;
    
    const shareData = {
      title: `${category.toUpperCase()} Data Report`,
      content: `Report for ${customerName}\nDate Range: ${dateRangeDisplay}\nTotal Entries: ${totalEntries}\nTotal Amount: ₹${totalAmount.toFixed(2)}\n\n${deviceInfo}`,
      fileName: generateFileName('csv'),
      csvContent: generateCSV()
    };

    setShowShareModal(true);
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
        headers = 'Date,Person,Session,Milk,Fat,Meter,Rate,Fat Amount,Meter Amount,Total Amount\n';
        rows = filteredData.map((entry: any) => 
          `${entry.date},${entry.personName},${entry.session},${entry.milk},${entry.fat},${entry.meter},${entry.rate},${entry.fatAmount},${entry.meterAmount},${entry.totalAmount}`
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meter</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
          </tr>
        );
    }
  };

  const renderTableRows = () => {
    // Sort data by date (newest first)
    const sortedData = [...filteredData].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sortedData.map((entry: any) => {
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.meter.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{entry.totalAmount.toFixed(2)}</td>
            </tr>
          );
      }
    });
  };

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
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handlePDFDownload}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Filter Data</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Select Person
            </label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            <strong>Viewing data from:</strong> {formatDateForDisplay(startDate)} to {formatDateForDisplay(endDate)}
            {selectedPerson && (
              <span className="ml-2">
                <strong>for:</strong> {people.find(p => p.id === selectedPerson)?.name}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-full mr-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total Entries</p>
              <p className="text-3xl font-bold text-blue-900">{totalEntries}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-600 rounded-full mr-4 flex items-center justify-center">
              <span className="text-white font-bold text-lg">₹</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Total Amount</p>
              <p className="text-3xl font-bold text-green-900">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Data Records</h3>
            <div className="text-sm text-gray-600">
              {totalEntries} {totalEntries === 1 ? 'record' : 'records'} found
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              {renderTableHeaders()}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No data found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try adjusting your date range or person filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                renderTableRows()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        data={{
          title: `${category.toUpperCase()} Data Report`,
          content: `Report for ${getSelectedPersonName().replace(/_/g, ' ')}\nDate Range: ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}\nTotal Entries: ${totalEntries}\nTotal Amount: ₹${totalAmount.toFixed(2)}`,
          fileName: generateFileName('csv'),
          csvContent: generateCSV()
        }}
      />
    </div>
  );
}
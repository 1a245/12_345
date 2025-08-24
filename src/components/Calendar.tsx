import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const days = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-10" />;
          }

          const dateString = formatDate(year, month, day);
          const isSelected = selectedDate === dateString;
          const isToday = dateString === new Date().toISOString().split('T')[0];

          return (
            <button
              key={day}
              onClick={() => onDateSelect(dateString)}
              className={`h-10 text-sm rounded-lg transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg'
                  : isToday
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
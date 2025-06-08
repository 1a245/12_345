import React, { useState } from 'react';
import { Save, Edit2, Trash2 } from 'lucide-react';
import { Calendar } from '../Calendar';
import { useData } from '../../context/DataContext';
import { Payment } from '../../types';

interface PaymentManagerProps {
  category: 'village' | 'city' | 'dairy';
}

export function PaymentManager({ category }: PaymentManagerProps) {
  const { data, addPayment, updatePayment, deletePayment } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const people = data.people.filter(p => p.category === category);
  const selectedPerson = people.find(p => p.id === selectedPersonId);
  
  const payments = data.payments.filter(p => 
    p.category === category && p.date === selectedDate
  );

  const paymentType = category === 'village' ? 'given' : 'received';
  const paymentLabel = category === 'village' ? 'GIVEN PAYMENT' : 'RECEIVED PAYMENT';

  const handleSave = () => {
    if (!selectedPersonId || !selectedPerson || !amount) return;

    const paymentData = {
      personId: selectedPersonId,
      personName: selectedPerson.name,
      date: selectedDate,
      amount: parseFloat(amount),
      comment: comment.trim(),
      type: paymentType as 'given' | 'received',
      category
    };

    if (editingId) {
      updatePayment(editingId, paymentData);
      setEditingId(null);
    } else {
      addPayment(paymentData);
    }

    setAmount('');
    setComment('');
    setSelectedPersonId('');
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPersonId(payment.personId);
    setAmount(payment.amount.toString());
    setComment(payment.comment);
    setEditingId(payment.id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setAmount('');
    setComment('');
    setSelectedPersonId('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 capitalize">
        {category} Payments
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date</h3>
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
              {people.map(person => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPersonId && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                {paymentLabel} for {selectedPerson?.name} - {selectedDate}
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter comment (optional)"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? 'Update' : 'Save'} Payment
                  </button>
                  {editingId && (
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {payments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Payments for {selectedDate}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.personName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {payment.comment || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(payment)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => deletePayment(payment.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
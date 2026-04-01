import React, { useState } from 'react';
import API_BASE_URL from '../config';

const CompleteChoreModal = ({ onClose, chore, user, refreshChores }) => {
  const [secretKey, setSecretKey] = useState('');

  const handleComplete = async () => {
    await fetch(`${API_BASE_URL}/api/chore/${chore._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: user._id,
        secretKey: chore.addedByParent ? secretKey : null,
      }),
    });
    refreshChores((prev) => !prev);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
        <h2 className="text-lg font-bold mb-2">Complete Chore</h2>
        <p className="text-sm text-gray-500 mb-4">"{chore.description}"</p>
        {chore.addedByParent && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Secret Key</label>
            <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={handleComplete} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium">
            Complete (+{chore.addedByParent ? 10 : 5} coins)
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CompleteChoreModal;

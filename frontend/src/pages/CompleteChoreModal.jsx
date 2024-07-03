import React, { useState } from 'react';

const CompleteChoreModal = ({ onClose, chore, user, refreshChores }) => {
  const [secretKey, setSecretKey] = useState('');

  const handleComplete = async () => {
    const body = {
      userId: user._id,
      secretKey: chore.addedByParent ? secretKey : null,
    };

    await fetch(`http://localhost:5000/api/chore/${chore._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    refreshChores((prev) => !prev); // Trigger a refresh
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl mb-4">Complete Chore</h2>
        {chore.addedByParent && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="secretKey">Parent Secret Key</label>
            <input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Complete Chore
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteChoreModal;

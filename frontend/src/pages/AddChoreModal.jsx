import React, { useState } from 'react';

const AddChoreModal = ({ onClose, user, refreshChores }) => {
  const [description, setDescription] = useState('');
  const [isParent, setIsParent] = useState(false);
  const [secretKey, setSecretKey] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const chore = {
      userId: user._id,
      description,
      date: new Date(),
      addedByParent: isParent,
      secretKey: isParent ? secretKey : null,
    };

    await fetch('http://localhost:5000/api/chore/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chore),
    });

    refreshChores((prev) => !prev); // Trigger a refresh
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl mb-4">Add Chore</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          {user.age <= 16 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="isParent">Add as Parent</label>
              <input
                id="isParent"
                type="checkbox"
                checked={isParent}
                onChange={() => setIsParent(!isParent)}
                className="mr-2"
              />
            </div>
          )}
          {isParent && (
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
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Chore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChoreModal;

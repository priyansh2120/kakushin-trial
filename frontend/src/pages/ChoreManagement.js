import React, { useState, useEffect } from 'react';
import AddChoreModal from './AddChoreModal';
import CompleteChoreModal from './CompleteChoreModal';
import GenerateSecretKeyModal from './GenerateSecretKeyModal.jsx';
import { useNavigate } from 'react-router-dom';

const ChoreManagement = () => {
  const [chores, setChores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(false);
  const [selectedChore, setSelectedChore] = useState(null);
  const [refreshChores, setRefreshChores] = useState(false);
  const userId = localStorage.getItem('userId');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetch(`http://localhost:5000/api/extras/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('User data:', data);
        setUser(data);
      });
  }, [userId]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/chore/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched chores:', data);
        setChores(data);
      });
  }, [userId, refreshChores]);

  const handleAddChore = () => setShowAddModal(true);
  const handleCompleteChore = (chore) => {
    setSelectedChore(chore);
    setShowCompleteModal(true);
  };

  const handleGenerateSecretKey = () => setShowSecretKeyModal(true);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chore Dashboard</h1>
        <div>
          {user && user.age < 16 && (
            <button
              onClick={handleGenerateSecretKey}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-4"
            >
              Generate Secret Key
            </button>
          )}
          <button
            onClick={handleAddChore}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Chore
          </button>
        </div>
      </div>
      <div>
        <h2 className="text-xl mb-4">Today's Chores</h2>
        <ul>
          {chores
            .filter(chore => !chore.isCompleted && new Date(chore.dateAdded).toDateString() === new Date().toDateString())
            .map(chore => (
              <li key={chore._id} className="mb-2">
                <div className="flex justify-between items-center p-4 bg-gray-100 rounded">
                  <span>{chore.description}</span>
                  <button
                    onClick={() => handleCompleteChore(chore)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Mark as Complete
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>
      <div className="mt-6">
        <h2 className="text-xl mb-4">Missed Chores</h2>
        <ul>
          {chores
            .filter(chore => !chore.isCompleted && new Date(chore.dateAdded) < new Date())
            .map(chore => (
              <li key={chore._id} className="mb-2">
                <div className="flex justify-between items-center p-4 bg-red-100 rounded">
                  <span>{chore.description}</span>
                  <button
                    onClick={() => handleCompleteChore(chore)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Complete Now
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>
      {showAddModal && <AddChoreModal onClose={() => setShowAddModal(false)} user={user} refreshChores={setRefreshChores} />}
      {showCompleteModal && <CompleteChoreModal onClose={() => setShowCompleteModal(false)} chore={selectedChore} user={user} refreshChores={setRefreshChores} />}
      {showSecretKeyModal && <GenerateSecretKeyModal onClose={() => setShowSecretKeyModal(false)} user={user} />}
    </div>
  );
};

export default ChoreManagement;

import React, { useState } from "react";
import API_BASE_URL from "../config";

const GenerateSecretKeyModal = ({ onClose, user }) => {
  const [secretKey, setSecretKey] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE_URL}/api/chore/generateSecretKey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId: user._id, secretKey }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
        <h2 className="text-lg font-bold mb-2">Generate Parent Secret Key</h2>
        <p className="text-sm text-gray-500 mb-4">This key is needed by parents to assign and verify chores.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium">Generate Key</button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateSecretKeyModal;

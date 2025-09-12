'use client';

import { useState } from 'react';

interface MaintenanceFormProps {
  onClose: () => void;
}

export default function MaintenanceForm({ onClose }: MaintenanceFormProps) {
  const [roomNumber, setRoomNumber] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Maintenance reported:', { roomNumber, issueDescription });
    // Add API call here to report maintenance
    onClose();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Report Maintenance Issues</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Room Number</label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Issue Description</label>
          <textarea
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
import React, { useState } from 'react';

export const CreateQuest = ({ onQuestCreated }) => {
  const [questData, setQuestData] = useState({
    title: '',
    description: '',
    category: 'Daily',
    xpReward: 50,
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setQuestData({ ...questData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questData),
      });

      if (!response.ok) throw new Error('Failed to create quest');

      const data = await response.json();
      setStatus('Quest created successfully!');
      setQuestData({ title: '', description: '', category: 'Daily', xpReward: 50 });
      
      if (onQuestCreated) onQuestCreated(data);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '4px',
    marginBottom: '12px',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #ccc' }}>
      <h3 style={{ color: '#1a1a1a', textAlign: 'center', marginBottom: '16px' }}>⚔️ Create New Quest</h3>
      
      {status && <p style={{ color: status.includes('successfully') ? 'green' : 'red', textAlign: 'center' }}>{status}</p>}

      <form onSubmit={handleSubmit}>
        <label style={{ color: '#333', fontWeight: 'bold' }}>Quest Title:</label>
        <input
          type="text"
          name="title"
          placeholder="e.g., Complete Math Assignment"
          value={questData.title}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label style={{ color: '#333', fontWeight: 'bold' }}>Description:</label>
        <textarea
          name="description"
          placeholder="Quest details..."
          value={questData.description}
          onChange={handleChange}
          rows="3"
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <label style={{ color: '#333', fontWeight: 'bold' }}>Category:</label>
        <select name="category" value={questData.category} onChange={handleChange} style={inputStyle}>
          <option value="Daily">Daily Quest</option>
          <option value="Weekly">Weekly Boss</option>
          <option value="Side Quest">Side Quest</option>
        </select>

        <label style={{ color: '#333', fontWeight: 'bold' }}>XP Reward:</label>
        <input
          type="number"
          name="xpReward"
          value={questData.xpReward}
          onChange={handleChange}
          min="10"
          max="500"
          style={inputStyle}
        />

        <button
          type="submit"
          style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ➕ Add Quest
        </button>
      </form>
    </div>
  );
};
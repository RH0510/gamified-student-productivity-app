import React, { useState, useEffect } from 'react';
import API from '../axios';

export const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await API.get('/habits');
      setHabits(res.data);
    } catch (err) {
      console.error('Failed to fetch habits', err);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      const res = await API.post('/habits', { title });
      setHabits([res.data, ...habits]);
      setTitle('');
    } catch (err) {
      setMessage('Failed to create habit');
    }
  };

  const handleCompleteHabit = async (id) => {
    try {
      const res = await API.put(`/habits/${id}/complete`);
      setMessage(res.data.message);
      fetchHabits();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error completing habit');
    }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '12px', marginTop: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>🔥 Daily Habit Streaks</h3>
      {message && <p style={{ fontSize: '0.85rem', color: '#0066cc', marginBottom: '0.8rem' }}>{message}</p>}
      
      <form onSubmit={handleCreateHabit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="New Habit (e.g., Daily Coding Practice)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          required
        />
        <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Add Habit
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {habits.map((habit) => (
          <li key={habit._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <strong>{habit.title}</strong>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Streak: {habit.streakCount} Days</div>
            </div>
            <button
              onClick={() => handleCompleteHabit(habit._id)}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Check-in
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
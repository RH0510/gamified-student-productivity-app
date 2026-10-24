import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  
  // Auth & User State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);

  // Gamification & Task State
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskXp, setTaskXp] = useState(10);

  // Fetch tasks when logged in
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setMessage('Logged in successfully!');
      } else {
        setMessage('Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Authentication error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;

    try {
      const res = await axios.post(
        'http://localhost:5000/api/tasks',
        { title: taskTitle, description: taskDesc, xpReward: Number(taskXp) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([res.data, ...tasks]);
      setTaskTitle('');
      setTaskDesc('');
      setTaskXp(10);
    } catch (err) {
      setMessage('Failed to create task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update tasks state locally
      setTasks(tasks.map(t => t._id === taskId ? res.data.task : t));

      // Update user XP & Level
      if (user) {
        setUser({ ...user, xp: res.data.user.xp, level: res.data.user.level });
      }

      if (res.data.leveledUp) {
        alert(`🎉 LEVEL UP! You reached Level ${res.data.user.level}!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setTasks([]);
    setMessage('Logged out successfully.');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '1rem' }}>
      <h1>🎮 Gamified Productivity App</h1>

      {!token ? (
        <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {!isLogin && (
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" style={{ padding: '0.6rem', cursor: 'pointer' }}>
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      ) : (
        <div>
          {/* User Stats Card */}
          <div style={{ background: '#f4f4f9', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h3>Welcome back, {user?.username || 'Hero'}! ⭐</h3>
            <p><strong>Level:</strong> {user?.level || 1} | <strong>XP:</strong> {user?.xp || 0} Points</p>
            <button onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>Logout</button>
          </div>

          {/* Add Task Form */}
          <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h4>Add New Quest / Task</h4>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input
                type="text"
                placeholder="Task Title (e.g., Complete Chapter 3 OS Notes)"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Description (Optional)"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
              />
              <label>
                XP Reward:
                <input
                  type="number"
                  value={taskXp}
                  onChange={(e) => setTaskXp(e.target.value)}
                  style={{ marginLeft: '0.5rem', width: '60px' }}
                  min="5"
                  max="100"
                />
              </label>
              <button type="submit" style={{ padding: '0.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                + Add Quest
              </button>
            </form>
          </div>

          {/* Tasks List */}
          <h3>Active Quests</h3>
          {tasks.length === 0 ? (
            <p>No active quests. Create one above to start earning XP!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tasks.map((task) => (
                <li
                  key={task._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                    background: task.completed ? '#e9ecef' : '#fff'
                  }}
                >
                  <div>
                    <strong style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.title}
                    </strong>
                    {task.description && <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#666' }}>{task.description}</p>}
                    <span style={{ fontSize: '0.8rem', color: '#007bff' }}>+{task.xpReward} XP</span>
                  </div>
                  {!task.completed ? (
                    <button
                      onClick={() => handleCompleteTask(task._id)}
                      style={{ background: '#007bff', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Complete
                    </button>
                  ) : (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Done</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {message && <p style={{ marginTop: '1rem', color: 'darkblue' }}>{message}</p>}
    </div>
  );
}

export default App;
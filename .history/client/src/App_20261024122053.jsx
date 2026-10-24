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
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskCategory, setTaskCategory] = useState('Academic');

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
        { 
          title: taskTitle, 
          description: taskDesc, 
          xpReward: Number(taskXp),
          priority: taskPriority,
          category: taskCategory
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([res.data, ...tasks]);
      setTaskTitle('');
      setTaskDesc('');
      setTaskXp(10);
      setTaskPriority('Medium');
      setTaskCategory('Academic');
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

      setTasks(tasks.map(t => t._id === taskId ? res.data.task : t));

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

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t._id !== taskId));
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

  // Level Progress Calculations (100 XP per level threshold)
  const currentXp = user?.xp || 0;
  const currentLevel = user?.level || 1;
  const xpForNextLevel = 100;
  const xpInCurrentLevel = currentXp % xpForNextLevel;
  const progressPercent = Math.min((xpInCurrentLevel / xpForNextLevel) * 100, 100);

  return (
    <div style={{ maxWidth: '680px', margin: '2rem auto', fontFamily: 'system-ui, sans-serif', padding: '1.5rem', color: '#1a1a1a' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🎮 Quest Log & Productivity</h1>

      {!token ? (
        <div style={{ border: '1px solid #e0e0e0', padding: '2rem', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0 }}>{isLogin ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
              required
            />
            <button type="submit" style={{ padding: '0.75rem', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <p style={{ marginTop: '1.2rem', textAlign: 'center' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: '#0066cc', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      ) : (
        <div>
          {/* User Banner */}
          <div style={{ background: '#1e293b', color: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Welcome back, {user?.username || 'Hero'}! ⭐</h2>
                <p style={{ margin: '0.4rem 0 0', color: '#94a3b8' }}>Level {currentLevel} Adventurer</p>
              </div>
              <button onClick={handleLogout} style={{ background: '#334155', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                Logout
              </button>
            </div>

            {/* XP Bar */}
            <div style={{ marginTop: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', color: '#cbd5e1' }}>
                <span>XP Progress</span>
                <span>{xpInCurrentLevel} / {xpForNextLevel} XP</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#334155', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #22c55e)', transition: 'width 0.3s ease-in-out' }}></div>
              </div>
            </div>
          </div>

          {/* Add Quest Form */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.8rem' }}>+ Create New Quest</h3>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input
                type="text"
                placeholder="Quest Title (e.g., Complete Software Engineering Lab)"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                required
              />
              <input
                type="text"
                placeholder="Description (Optional)"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  XP:
                  <input
                    type="number"
                    value={taskXp}
                    onChange={(e) => setTaskXp(e.target.value)}
                    style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '60px' }}
                    min="5"
                    max="100"
                  />
                </label>
                <label style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Priority:
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </label>
                <label style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Category:
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Academic">Academic</option>
                    <option value="IT Project">IT Project</option>
                    <option value="Personal">Personal</option>
                  </select>
                </label>
              </div>
              <button type="submit" style={{ padding: '0.65rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.4rem' }}>
                Add Quest
              </button>
            </form>
          </div>

          {/* Quest List */}
          <h3>Active Quests</h3>
          {tasks.length === 0 ? (
            <p style={{ color: '#64748b' }}>No active quests. Create one above to start earning XP!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {tasks.map((task) => {
                const priorityColor = task.priority === 'High' ? '#dc2626' : task.priority === 'Medium' ? '#d97706' : '#2563eb';
                return (
                  <li
                    key={task._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '0.6rem',
                      background: task.completed ? '#f8fafc' : '#fff'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold', color: '#475569' }}>
                          {task.category}
                        </span>
                        <span style={{ fontSize: '0.75rem', background: priorityColor, color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                          {task.priority}
                        </span>
                      </div>
                      <strong style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#94a3b8' : '#0f172a' }}>
                        {task.title}
                      </strong>
                      {task.description && <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{task.description}</p>}
                      <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 'bold', display: 'inline-block', marginTop: '0.3rem' }}>+{task.xpReward} XP</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {!task.completed ? (
                        <button
                          onClick={() => handleCompleteTask(task._id)}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                        >
                          Complete
                        </button>
                      ) : (
                        <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '0.5rem' }}>✓ Done</span>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {message && <p style={{ marginTop: '1rem', color: '#1e40af', textAlign: 'center' }}>{message}</p>}
    </div>
  );
}

export default App;
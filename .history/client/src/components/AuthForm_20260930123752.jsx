import React, { useState, useContext } from 'react';
import { AuthContext } from '../api/context/AuthContext';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  
  const { login, register } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setFormData({ username: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        setMessage('Login successful!');
      } else {
        await register(formData.username, formData.email, formData.password);
        setMessage('Registration successful! You can now log in.');
        setIsLogin(true);
        setFormData({ username: '', email: '', password: '' });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'An error occurred.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '4px',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    color: '#333333',
    fontWeight: '500'
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#1a1a1a', textAlign: 'center', marginBottom: '20px' }}>
        {isLogin ? 'Login' : 'Register'}
      </h2>
      
      {message && (
        <p style={{ color: message.includes('successful') ? '#28a745' : '#dc3545', textAlign: 'center', fontWeight: 'bold' }}>
          {message}
        </p>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Username:</label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {!isLogin && (
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Password:</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          onClick={handleToggleMode}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Body Parser Middleware
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);

// Connect Database & Start Server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/productivity_app')
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Database connection error:', err));
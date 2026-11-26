const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Root Status Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'TaskFlow API Engine',
    status: 'online',
    version: '1.0.0',
    healthCheck: '/api/v1/health'
  });
});

// Health Check Endpoints (both /api/v1/health and /health)
const handleHealthCheck = (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.status(200).json({
    success: true,
    message: 'TaskFlow API Engine is operational.',
    database: states[dbState] || 'unknown',
    timestamp: new Date().toISOString()
  });
};
app.get('/api/v1/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// Database availability middleware for data endpoints
const checkDbConnection = (req, res, next) => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently disconnected. Please ensure MONGODB_URI is configured in Render environment variables and IP 0.0.0.0/0 is whitelisted in MongoDB Atlas.'
    });
  }
  next();
};

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Mount routes with /api/v1 and fallback root paths to eliminate any possible URL mismatch
app.use('/api/v1/auth', checkDbConnection, authRoutes);
app.use('/auth', checkDbConnection, authRoutes);

app.use('/api/v1/projects', checkDbConnection, projectRoutes);
app.use('/projects', checkDbConnection, projectRoutes);

app.use('/api/v1/tasks', checkDbConnection, taskRoutes);
app.use('/tasks', checkDbConnection, taskRoutes);

app.use('/api/v1/comments', checkDbConnection, commentRoutes);
app.use('/comments', checkDbConnection, commentRoutes);

app.use('/api/v1/dashboard', checkDbConnection, dashboardRoutes);
app.use('/dashboard', checkDbConnection, dashboardRoutes);

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on path ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[TaskFlow Server] Express API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
});

module.exports = app;

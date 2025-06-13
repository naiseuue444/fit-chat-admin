const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Import routes
const whatsappRoutes = require('./routes/whatsapp.routes');
const { supabase } = require('./utils/supabase');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// API Routes
app.use('/api/gyms/:gymId/whatsapp', (req, res, next) => {
  req.gymId = req.params.gymId;
  next();
}, whatsappRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Fit-Chat Backend API is running',
    docs: 'API documentation will be available at /api-docs'
  });
});

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize WhatsApp service
const WhatsAppService = require('./services/whatsapp.service');

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Handle gym room joining
  socket.on('join_gym', (gymId) => {
    if (gymId) {
      const room = `gym_${gymId}`;
      socket.join(room);
      console.log(`Client joined room: ${room}`);
      
      // Get the WhatsApp client status for this gym
      const client = WhatsAppService.getGymClient(gymId);
      if (client) {
        // Send current status
        if (client.isConnected) {
          socket.emit('whatsapp_status', { status: 'connected' });
        } else if (client.qrCode) {
          socket.emit('whatsapp_qr', { qr: client.qrCode });
        }
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider whether to restart the process in production
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join gym room if gymId is provided
  socket.on('join_gym', (gymId) => {
    if (gymId) {
      socket.join(`gym_${gymId}`);
      console.log(`Client joined gym room: gym_${gymId}`);
      
      // Get the WhatsApp client for this gym
      const client = WhatsAppService.getGymClient(gymId);
      if (client) {
        // Send current status
        if (client.isConnected) {
          socket.emit('ready');
        } else if (client.qrCode) {
          socket.emit('qr', client.qrCode);
        }
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io available in routes
app.set('io', io);

// Serve static files from the React frontend app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

// API Status
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Fit-Chat API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

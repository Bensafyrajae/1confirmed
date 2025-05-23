const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const WebSocketService = require('./services/WebSocketService');
const { errorHandler } = require('./middleware/error');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const templateRoutes = require('./routes/templateRoutes');
const messageRoutes = require('./routes/messageRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const statsRoutes = require('./routes/statsRoutes');
const NotificationService = require('./services/notificationService');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/stats', statsRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Start notification processor
const notificationProcessor = setInterval(() => {
    NotificationService.processScheduledNotifications()
        .catch(err => console.error('Error processing notifications:', err));
}, 60000); // Check for notifications every minute

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    clearInterval(notificationProcessor);
    server.close(() => {
        console.log('Server closed');
    });
});

module.exports = { app, server };
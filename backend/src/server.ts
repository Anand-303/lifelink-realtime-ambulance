import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth';
// import userRoutes from './routes/user';
import ambulanceRoutes from './routes/ambulance';
import bloodDonationRoutes from './routes/bloodDonation';
import bloodInventoryRoutes from './routes/bloodInventory';
import campaignRoutes from './routes/campaign';
import chatRoutes from './routes/chat';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);

// Socket.io CORS: in development allow common localhost ports (CRA may use 3001 if 3000 is taken)
const socketCorsOrigins =
  process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL || 'http://localhost:3000'
    : [
        process.env.CLIENT_URL,
        'http://localhost:3000',
        'http://localhost:3001',
      ].filter((o): o is string => Boolean(o));

const io = new Server(server, {
  cors: {
    origin: socketCorsOrigins,
    methods: ['GET', 'POST'],
  },
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle ambulance location updates
  socket.on('updateAmbulanceLocation', (data) => {
    // Broadcast the updated location to all connected clients
    io.emit('ambulanceLocationUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('MediConnect API is running');
});

// Register routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/blood-donation', bloodDonationRoutes);
app.use('/api/blood-inventory', bloodInventoryRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api', chatRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
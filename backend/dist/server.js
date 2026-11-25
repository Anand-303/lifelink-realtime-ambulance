"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
// import userRoutes from './routes/user';
const ambulance_1 = __importDefault(require("./routes/ambulance"));
const bloodDonation_1 = __importDefault(require("./routes/bloodDonation"));
const bloodInventory_1 = __importDefault(require("./routes/bloodInventory"));
const campaign_1 = __importDefault(require("./routes/campaign"));
const chat_1 = __importDefault(require("./routes/chat"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
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
app.get('/api/status', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});
// Root endpoint
app.get('/', (req, res) => {
    res.send('MediConnect API is running');
});
// Register routes
app.use('/api/auth', auth_1.default);
// app.use('/api/users', userRoutes);
app.use('/api/ambulance', ambulance_1.default);
app.use('/api/blood-donation', bloodDonation_1.default);
app.use('/api/blood-inventory', bloodInventory_1.default);
app.use('/api/campaigns', campaign_1.default);
app.use('/api', chat_1.default);
// MongoDB Connection
mongoose_1.default
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
//# sourceMappingURL=server.js.map
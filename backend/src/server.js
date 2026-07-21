const express = require('express');
const serverless = require('aws-serverless-express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const prisma = require('./config/database');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const barangRoutes = require('./routes/barangRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const statsRoutes = require('./routes/statsRoutes');
const stationRoutes = require('./routes/stationRoutes');
const klaimRoutes = require('./routes/klaimRoutes');
const notifikasiRoutes = require('./routes/notifikasiRoutes');
const qrRoutes = require('./routes/qrRoutes');
const matchingRoutes = require('./routes/matchingRoutes');

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/klaim', klaimRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/matching', matchingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API Running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Export for Vercel
const server = serverless.createServer(app);
module.exports = app;
module.exports.handler = (event, context) => {
  serverless.proxy(server, event, context);
};

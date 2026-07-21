const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

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

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// STATIC FILES
// ============================================

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, '..', config.upload.dir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

// ============================================
// API ROUTES
// ============================================

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'KAI Finder API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File terlalu besar. Maksimal 5MB.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// ============================================
// START SERVER (for local development)
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start server
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║   🚂  KAI Finder Backend Server                      ║
║   Server running on: http://localhost:${config.port}              ║
║   Environment: ${config.nodeEnv.padEnd(15)}                         ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server if not in Vercel
if (process.env.VERCEL !== '1') {
  startServer();
}

// Export for Vercel
module.exports = app;

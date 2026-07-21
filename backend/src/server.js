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

// CORS - allow all origins for Vercel
app.use(cors({
  origin: true,
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// STATIC FILES (only in Node, not serverless)
// ============================================

if (typeof window === 'undefined' && !process.env.VERCEL) {
  const uploadsDir = path.join(__dirname, '..', config.upload.dir);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
}

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
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File terlalu besar. Maksimal 5MB.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ============================================
// EXPORT FOR VERCEL
// ============================================

module.exports = app;

const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');

// Verify JWT Token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token tidak ditemukan',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret);

      // Ambil user dari database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          nama: true,
          role: true,
          stasiun_id: true,
          is_active: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Akun tidak aktif',
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error pada autentikasi',
    });
  }
};

// Role-based access control
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke resource ini',
        requiredRoles: allowedRoles,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

// Optional auth - allow guest but attach user if token exists
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          nama: true,
          role: true,
          stasiun_id: true,
          is_active: true,
        },
      });

      if (user && user.is_active) {
        req.user = user;
      }
    } catch (jwtError) {
      // Token invalid, continue as guest
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth,
};

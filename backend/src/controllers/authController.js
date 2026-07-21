const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config');
const { z } = require('zod');

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  no_hp: z.string().optional(),
  role: z.enum(['PENUMPANG']).default('PENUMPANG'), // Default role for registration
});

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password diperlukan'),
});

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { userId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

// ============================================
// REGISTER
// ============================================
const register = async (req, res) => {
  try {
    const { email, password, nama, no_hp, role } = registerSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        no_hp,
        role: role || 'PENUMPANG',
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        created_at: true,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user.id);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user,
        ...tokens,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: error.errors,
      });
    }

    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// LOGIN
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        nama: true,
        role: true,
        stasiun_id: true,
        is_active: true,
        stasiun: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Akun tidak aktif. Hubungi administrator.',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nama: user.nama,
          role: user.role,
          stasiun: user.stasiun,
        },
        ...tokens,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: error.errors,
      });
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// REFRESH TOKEN
// ============================================
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token diperlukan',
      });
    }

    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          nama: true,
          role: true,
          is_active: true,
        },
      });

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'User tidak valid atau tidak aktif',
        });
      }

      const tokens = generateTokens(user.id);

      res.json({
        success: true,
        data: {
          user,
          ...tokens,
        },
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token tidak valid atau expired',
      });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nama: true,
        no_hp: true,
        role: true,
        stasiun_id: true,
        stasiun: {
          select: {
            id: true,
            nama: true,
            kode: true,
            tipe: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// LOGOUT
// ============================================
const logout = async (req, res) => {
  // Di implementasi nyata, mungkin perlu blacklist token
  // Untuk simplicity, client akan delete token dari storage
  res.json({
    success: true,
    message: 'Logout berhasil',
  });
};

// ============================================
// CHANGE PASSWORD
// ============================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan baru diperlukan',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama salah',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: 'Password berhasil diubah',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
const updateProfile = async (req, res) => {
  try {
    const { nama, no_hp } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        nama: nama || req.user.nama,
        no_hp: no_hp !== undefined ? no_hp : req.user.no_hp,
      },
      select: {
        id: true,
        email: true,
        nama: true,
        no_hp: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile berhasil diupdate',
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  changePassword,
  updateProfile,
};

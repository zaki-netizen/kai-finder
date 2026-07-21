const prisma = require('../config/database');

// ============================================
// GET NOTIFICATIONS
// ============================================
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      user_id: req.user.id,
    };

    if (unread_only === 'true') {
      where.is_read = false;
    }

    const [notifikasi, unreadCount] = await Promise.all([
      prisma.notifikasi.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.notifikasi.count({
        where: { user_id: req.user.id, is_read: false },
      }),
    ]);

    res.json({
      success: true,
      data: notifikasi,
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// MARK AS READ
// ============================================
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notifikasi = await prisma.notifikasi.findUnique({
      where: { id },
    });

    if (!notifikasi) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan',
      });
    }

    if (notifikasi.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke notifikasi ini',
      });
    }

    await prisma.notifikasi.update({
      where: { id },
      data: { is_read: true },
    });

    res.json({
      success: true,
      message: 'Notifikasi ditandai sudah dibaca',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// MARK ALL AS READ
// ============================================
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notifikasi.updateMany({
      where: {
        user_id: req.user.id,
        is_read: false,
      },
      data: { is_read: true },
    });

    res.json({
      success: true,
      message: 'Semua notifikasi ditandai sudah dibaca',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// DELETE NOTIFICATION
// ============================================
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notifikasi = await prisma.notifikasi.findUnique({
      where: { id },
    });

    if (!notifikasi) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan',
      });
    }

    if (notifikasi.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses',
      });
    }

    await prisma.notifikasi.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Notifikasi dihapus',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// CREATE NOTIFICATION (Internal)
// ============================================
const createNotification = async (userId, judul, pesan, type = 'INFO', data = null) => {
  try {
    await prisma.notifikasi.create({
      data: {
        user_id: userId,
        judul,
        pesan,
        type,
        data,
      },
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// ============================================
// GET AUDIT LOG (Admin)
// ============================================
const getAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 50, user_id, action, entity_type, start_date, end_date } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (user_id) where.user_id = user_id;
    if (action) where.action = action;
    if (entity_type) where.entity_type = entity_type;
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at.gte = new Date(start_date);
      if (end_date) where.created_at.lte = new Date(end_date);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, nama: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// QR CODE GENERATION
// ============================================
const QRCode = require('qrcode');
const config = require('../config');

const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    const barang = await prisma.barang.findUnique({
      where: { id },
    });

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan',
      });
    }

    // Generate QR URL
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/barang/${barang.kode}`;

    // Generate QR Code as base64
    const qrCodeBase64 = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1E3A5F',
        light: '#FFFFFF',
      },
    });

    // Update barang with QR URL
    await prisma.barang.update({
      where: { id },
      data: { qr_code: qrUrl },
    });

    res.json({
      success: true,
      data: {
        qr_code: qrCodeBase64,
        url: qrUrl,
        kode: barang.kode,
      },
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getAuditLog,
  generateQRCode,
};

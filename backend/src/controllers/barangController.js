const prisma = require('../config/database');
const { z } = require('zod');
const QRCode = require('qrcode');

// Custom datetime validator that accepts various formats
const datetimeString = z.string().refine(
  (val) => {
    if (!val) return true; // optional
    // Accept ISO format or datetime-local format
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: 'Format tanggal tidak valid' }
);

// Validation schemas
const createBarangSchema = z.object({
  nama: z.string().min(1, 'Nama barang wajib diisi'),
  kategori_id: z.string().min(1, 'Kategori wajib dipilih'),
  warna: z.string().optional().nullable(),
  deskripsi: z.string().optional().nullable(),
  ciri_khas: z.string().optional().nullable(),
  tipe_transport: z.enum(['KRL', 'KA_JARAK_JAUH']),
  jalur: z.string().optional().nullable(),
  tujuan: z.string().optional().nullable(),
  stasiun_id: z.string().min(1, 'Stasiun wajib dipilih'),
  no_kereta: z.string().optional().nullable(),
  nama_kereta: z.string().optional().nullable(),
  relasi: z.string().optional().nullable(),
  gerbong: z.string().optional().nullable(),
  kursi: z.string().optional().nullable(),
  tanggal_perjalanan: datetimeString.optional().nullable(),
  lokasi_penyimpanan: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  ditemukan_at: z.string().min(1, 'Tanggal ditemukan wajib diisi'),
});

const updateBarangSchema = createBarangSchema.partial();

// Generate kode barang
const generateKodeBarang = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.barang.count({
    where: {
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  const num = String(count + 1).padStart(4, '0');
  return `BRG-${year}-${num}`;
};

// ============================================
// GET ALL BARANG
// ============================================
const getAllBarang = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      kategori_id,
      stasiun_id,
      tipe_transport,
      jalur,
      tujuan,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (status) where.status = status;
    if (kategori_id) where.kategori_id = kategori_id;
    if (stasiun_id) where.stasiun_id = stasiun_id;
    if (tipe_transport) where.tipe_transport = tipe_transport;
    if (jalur) where.jalur = { contains: jalur, mode: 'insensitive' };
    if (tujuan) where.tujuan = { contains: tujuan, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } },
        { warna: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Validate sortBy
    const allowedSortBy = ['created_at', 'nama', 'ditemukan_at', 'updated_at'];
    const validSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const [barang, total] = await Promise.all([
      prisma.barang.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [validSortBy]: validSortOrder },
        include: {
          kategori: { select: { id: true, nama: true, icon: true } },
          stasiun: { select: { id: true, nama: true, kode: true } },
          foto: {
            where: { is_primary: true },
            take: 1,
          },
          creator: { select: { id: true, nama: true } },
          _count: { select: { klaim: true } },
        },
      }),
      prisma.barang.count({ where }),
    ]);

    res.json({
      success: true,
      data: barang,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all barang error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// GET BARANG BY ID
// ============================================
const getBarangById = async (req, res) => {
  try {
    const { id } = req.params;

    const barang = await prisma.barang.findUnique({
      where: { id },
      include: {
        kategori: true,
        stasiun: true,
        foto: {
          orderBy: { is_primary: 'desc' },
        },
        creator: { select: { id: true, nama: true, role: true } },
        klaim: {
          where: { status: 'APPROVED' },
          take: 1,
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan',
      });
    }

    res.json({
      success: true,
      data: barang,
    });
  } catch (error) {
    console.error('Get barang by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// CREATE BARANG
// ============================================
const createBarang = async (req, res) => {
  try {
    const data = createBarangSchema.parse(req.body);

    // Generate kode barang
    const kode = await generateKodeBarang();

    // Generate QR Code URL
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/barang/${kode}`;

    const barang = await prisma.barang.create({
      data: {
        kode,
        ...data,
        ditemukan_at: new Date(data.ditemukan_at),
        tanggal_perjalanan: data.tanggal_perjalanan
          ? new Date(data.tanggal_perjalanan)
          : null,
        created_by: req.user.id,
        qr_code: qrUrl,
      },
      include: {
        kategori: true,
        stasiun: true,
        foto: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'CREATE',
        entity_type: 'barang',
        entity_id: barang.id,
        new_value: barang,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Barang berhasil ditambahkan',
      data: barang,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: error.errors,
      });
    }

    console.error('Create barang error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// UPDATE BARANG
// ============================================
const updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateBarangSchema.parse(req.body);

    // Get existing barang
    const existingBarang = await prisma.barang.findUnique({
      where: { id },
    });

    if (!existingBarang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan',
      });
    }

    // Check if user has permission (creator or admin)
    if (existingBarang.created_by !== req.user.id &&
        !['ADMIN_PUSAT', 'ADMIN_STASIUN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk mengupdate barang ini',
      });
    }

    const barang = await prisma.barang.update({
      where: { id },
      data: {
        ...data,
        ditemukan_at: data.ditemukan_at
          ? new Date(data.ditemukan_at)
          : existingBarang.ditemukan_at,
        tanggal_perjalanan: data.tanggal_perjalanan
          ? new Date(data.tanggal_perjalanan)
          : existingBarang.tanggal_perjalanan,
      },
      include: {
        kategori: true,
        stasiun: true,
        foto: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'UPDATE',
        entity_type: 'barang',
        entity_id: barang.id,
        old_value: existingBarang,
        new_value: barang,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      },
    });

    res.json({
      success: true,
      message: 'Barang berhasil diupdate',
      data: barang,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: error.errors,
      });
    }

    console.error('Update barang error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// DELETE BARANG
// ============================================
const deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing barang
    const existingBarang = await prisma.barang.findUnique({
      where: { id },
      include: { foto: true, klaim: true },
    });

    if (!existingBarang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan',
      });
    }

    // Check if barang has active claims
    const activeKlaim = existingBarang.klaim.filter(
      (k) => k.status === 'PENDING' || k.status === 'APPROVED'
    );

    if (activeKlaim.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus barang dengan klaim aktif',
      });
    }

    // Only ADMIN_PUSAT or creator can delete
    if (existingBarang.created_by !== req.user.id && req.user.role !== 'ADMIN_PUSAT') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk menghapus barang ini',
      });
    }

    // Delete barang (cascade will delete foto)
    await prisma.barang.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'DELETE',
        entity_type: 'barang',
        entity_id: id,
        old_value: existingBarang,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      },
    });

    res.json({
      success: true,
      message: 'Barang berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete barang error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// UPDATE STATUS BARANG
// ============================================
const updateStatusBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['AKTIF', 'DIKLAIM', 'DIAMBIL', 'ARCHIVE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid',
      });
    }

    const existingBarang = await prisma.barang.findUnique({
      where: { id },
    });

    if (!existingBarang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan',
      });
    }

    const barang = await prisma.barang.update({
      where: { id },
      data: {
        status,
        diambil_at: status === 'DIAMBIL' ? new Date() : null,
      },
    });

    res.json({
      success: true,
      message: 'Status barang berhasil diupdate',
      data: barang,
    });
  } catch (error) {
    console.error('Update status barang error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// GET BARANG BY KRL
// ============================================
const getBarangKRL = async (req, res) => {
  try {
    const { page = 1, limit = 12, ...filters } = req.query;

    const result = await getAllBarang({
      ...req,
      query: {
        ...filters,
        tipe_transport: 'KRL',
        status: filters.status || 'AKTIF',
        page,
        limit,
      },
    });

    res.json(result);
  } catch (error) {
    console.error('Get barang KRL error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// GET BARANG BY KA
// ============================================
const getBarangKA = async (req, res) => {
  try {
    const { page = 1, limit = 12, ...filters } = req.query;

    const result = await getAllBarang({
      ...req,
      query: {
        ...filters,
        tipe_transport: 'KA_JARAK_JAUH',
        status: filters.status || 'AKTIF',
        page,
        limit,
      },
    });

    res.json(result);
  } catch (error) {
    console.error('Get barang KA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getAllBarang,
  getBarangById,
  createBarang,
  updateBarang,
  deleteBarang,
  updateStatusBarang,
  getBarangKRL,
  getBarangKA,
};

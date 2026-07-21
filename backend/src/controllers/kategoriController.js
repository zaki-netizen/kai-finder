const prisma = require('../config/database');
const { z } = require('zod');

// Validation schemas
const createKategoriSchema = z.object({
  nama: z.string().min(1, 'Nama kategori wajib diisi'),
  deskripsi: z.string().optional(),
  icon: z.string().optional(),
  masa_simpan: z.number().int().positive().default(30),
});

const updateKategoriSchema = createKategoriSchema.partial();

// ============================================
// GET ALL KATEGORI
// ============================================
const getAllKategori = async (req, res) => {
  try {
    const kategori = await prisma.kategori.findMany({
      orderBy: { nama: 'asc' },
      include: {
        _count: {
          select: { barang: true },
        },
      },
    });

    res.json({
      success: true,
      data: kategori,
    });
  } catch (error) {
    console.error('Get all kategori error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// GET KATEGORI BY ID
// ============================================
const getKategoriById = async (req, res) => {
  try {
    const { id } = req.params;

    const kategori = await prisma.kategori.findUnique({
      where: { id },
      include: {
        _count: {
          select: { barang: true },
        },
      },
    });

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan',
      });
    }

    res.json({
      success: true,
      data: kategori,
    });
  } catch (error) {
    console.error('Get kategori by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// CREATE KATEGORI
// ============================================
const createKategori = async (req, res) => {
  try {
    const data = createKategoriSchema.parse(req.body);

    // Check if nama already exists
    const existing = await prisma.kategori.findUnique({
      where: { nama: data.nama },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori sudah ada',
      });
    }

    const kategori = await prisma.kategori.create({
      data,
    });

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: kategori,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: error.errors,
      });
    }

    console.error('Create kategori error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// UPDATE KATEGORI
// ============================================
const updateKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateKategoriSchema.parse(req.body);

    const existing = await prisma.kategori.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan',
      });
    }

    // Check if new nama conflicts
    if (data.nama && data.nama !== existing.nama) {
      const conflicting = await prisma.kategori.findUnique({
        where: { nama: data.nama },
      });

      if (conflicting) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori sudah ada',
        });
      }
    }

    const kategori = await prisma.kategori.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: 'Kategori berhasil diupdate',
      data: kategori,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: error.errors,
      });
    }

    console.error('Update kategori error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// DELETE KATEGORI
// ============================================
const deleteKategori = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.kategori.findUnique({
      where: { id },
      include: { _count: { select: { barang: true } } },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan',
      });
    }

    if (existing._count.barang > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus kategori. Terdapat ${existing._count.barang} barang yang menggunakan kategori ini.`,
      });
    }

    await prisma.kategori.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Kategori berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete kategori error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
};

const prisma = require('../config/database');

// ============================================
// GET ALL KLAIM (Admin)
// ============================================
const getAllKlaim = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { nama_pengklaim: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { barang: { nama: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [klaim, total] = await Promise.all([
      prisma.klaim.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          barang: {
            select: {
              id: true,
              nama: true,
              kode: true,
              stasiun: { select: { nama: true } },
              foto: { where: { is_primary: true }, take: 1 },
            },
          },
          user: { select: { id: true, nama: true } },
        },
      }),
      prisma.klaim.count({ where }),
    ]);

    res.json({
      success: true,
      data: klaim,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('Get all klaim error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// GET KLAIM BY ID
// ============================================
const getKlaimById = async (req, res) => {
  try {
    const { id } = req.params;

    const klaim = await prisma.klaim.findUnique({
      where: { id },
      include: {
        barang: { include: { kategori: true, stasiun: true } },
        user: true,
      },
    });

    if (!klaim) {
      return res.status(404).json({ success: false, message: 'Klaim tidak ditemukan' });
    }

    res.json({ success: true, data: klaim });
  } catch (error) {
    console.error('Get klaim by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// VERIFY KLAIM
// ============================================
const verifyKlaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, alasan_tolak } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }

    const klaim = await prisma.klaim.findUnique({ where: { id }, include: { barang: true } });

    if (!klaim) {
      return res.status(404).json({ success: false, message: 'Klaim tidak ditemukan' });
    }

    if (klaim.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Klaim sudah diproses' });
    }

    // Update klaim
    const updated = await prisma.klaim.update({
      where: { id },
      data: {
        status,
        verified_by: req.user.id,
        verified_at: new Date(),
        alasan_tolak: status === 'REJECTED' ? alasan_tolak : null,
        kode_verifikasi: status === 'APPROVED' ? Math.random().toString(36).substring(2, 8).toUpperCase() : null,
      },
    });

    // Update status barang jika disetujui
    if (status === 'APPROVED') {
      await prisma.barang.update({
        where: { id: klaim.barang_id },
        data: { status: 'DIKLAIM' },
      });

      // Buat notifikasi
      await prisma.notifikasi.create({
        data: {
          user_id: klaim.user_id,
          judul: 'Klaim Disetujui',
          pesan: `Klaim untuk ${klaim.barang.nama} telah disetujui. Kode verifikasi: ${updated.kode_verifikasi}`,
          type: 'SUCCESS',
        },
      });
    } else {
      await prisma.notifikasi.create({
        data: {
          user_id: klaim.user_id,
          judul: 'Klaim Ditolak',
          pesan: `Maaf klaim untuk ${klaim.barang.nama} ditolak. Alasan: ${alasan_tolak || 'Tidak ada alasan'}`,
          type: 'ERROR',
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'UPDATE',
        entity_type: 'klaim',
        entity_id: id,
        new_value: { status },
      },
    });

    res.json({ success: true, message: status === 'APPROVED' ? 'Klaim disetujui' : 'Klaim ditolak', data: updated });
  } catch (error) {
    console.error('Verify klaim error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// GET MY KLAIM
// ============================================
const getMyKlaim = async (req, res) => {
  try {
    const klaim = await prisma.klaim.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      include: {
        barang: {
          select: { id: true, nama: true, kode: true, foto: { where: { is_primary: true }, take: 1 }, stasiun: { select: { nama: true } } },
        },
      },
    });

    res.json({ success: true, data: klaim });
  } catch (error) {
    console.error('Get my klaim error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// CREATE KLAIM (Penumpang)
// ============================================
const createKlaim = async (req, res) => {
  try {
    const { barang_id, nama_pengklaim, no_hp, email, no_tiket, bukti_ktp, bukti_kepemilikan, deskripsi, warna_barang, ciri_khas_barang } = req.body;

    if (!barang_id || !nama_pengklaim || !no_hp || !email || !bukti_ktp || !bukti_kepemilikan || !deskripsi) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    // Cek apakah barang ada dan masih aktif
    const barang = await prisma.barang.findUnique({ where: { id: barang_id } });
    if (!barang) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan' });
    }
    if (barang.status !== 'AKTIF') {
      return res.status(400).json({ success: false, message: 'Barang ini sudah tidak tersedia untuk diklaim' });
    }

    // Cek apakah sudah ada klaim pending untuk barang ini dari user yang sama
    if (req.user?.id) {
      const existingKlaim = await prisma.klaim.findFirst({
        where: { barang_id, user_id: req.user.id, status: 'PENDING' },
      });
      if (existingKlaim) {
        return res.status(400).json({ success: false, message: 'Anda sudah mengajukan klaim untuk barang ini' });
      }
    }

    const klaim = await prisma.klaim.create({
      data: {
        barang_id,
        user_id: req.user?.id || null,
        nama_pengklaim,
        no_hp,
        email,
        no_tiket: no_tiket || null,
        bukti_ktp,
        bukti_kepemilikan,
        deskripsi,
        warna_barang: warna_barang || null,
        ciri_khas_barang: ciri_khas_barang || null,
        status: 'PENDING',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user?.id,
        action: 'CREATE',
        entity_type: 'klaim',
        entity_id: klaim.id,
        new_value: { barang_id, nama_pengklaim },
      },
    });

    res.status(201).json({ success: true, message: 'Klaim berhasil diajukan', data: klaim });
  } catch (error) {
    console.error('Create klaim error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// CONFIRM PICKUP
// ============================================
const confirmPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_verifikasi, ttd_pengambilan } = req.body;

    const klaim = await prisma.klaim.findUnique({ where: { id }, include: { barang: true } });

    if (!klaim) {
      return res.status(404).json({ success: false, message: 'Klaim tidak ditemukan' });
    }

    if (klaim.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Klaim belum atau tidak disetujui' });
    }

    // Verifikasi kode
    if (klaim.kode_verifikasi !== kode_verifikasi) {
      return res.status(400).json({ success: false, message: 'Kode verifikasi salah' });
    }

    // Update klaim dan barang
    await prisma.$transaction([
      prisma.klaim.update({
        where: { id },
        data: { ttd_pengambilan: ttd_pengambilan || null },
      }),
      prisma.barang.update({
        where: { id: klaim.barang_id },
        data: { status: 'DIAMBIL', diambil_at: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          user_id: req.user.id,
          action: 'UPDATE',
          entity_type: 'klaim',
          entity_id: id,
          new_value: { action: 'PICKUP_CONFIRMED' },
        },
      }),
    ]);

    res.json({ success: true, message: 'Pengambilan barang berhasil dikonfirmasi' });
  } catch (error) {
    console.error('Confirm pickup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllKlaim, getKlaimById, verifyKlaim, getMyKlaim, createKlaim, confirmPickup };

const prisma = require('../config/database');

// ============================================
// GET DASHBOARD STATS
// ============================================
const getDashboardStats = async (req, res) => {
  try {
    // Get counts for different statuses
    const [
      totalBarang,
      barangAktif,
      barangDiklaim,
      barangDiambil,
      barangArchive,
      totalKlaim,
      klaimPending,
      klaimApproved,
      klaimRejected,
      totalUsers,
      totalPetugas,
    ] = await Promise.all([
      prisma.barang.count(),
      prisma.barang.count({ where: { status: 'AKTIF' } }),
      prisma.barang.count({ where: { status: 'DIKLAIM' } }),
      prisma.barang.count({ where: { status: 'DIAMBIL' } }),
      prisma.barang.count({ where: { status: 'ARCHIVE' } }),
      prisma.klaim.count(),
      prisma.klaim.count({ where: { status: 'PENDING' } }),
      prisma.klaim.count({ where: { status: 'APPROVED' } }),
      prisma.klaim.count({ where: { status: 'REJECTED' } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PETUGAS' } }),
    ]);

    // Get barang by category
    const barangByKategori = await prisma.barang.groupBy({
      by: ['kategori_id'],
      _count: true,
      where: { status: 'AKTIF' },
    });

    // Get kategori names
    const kategoris = await prisma.kategori.findMany({
      where: { id: { in: barangByKategori.map((b) => b.kategori_id) } },
      select: { id: true, nama: true, icon: true },
    });

    const kategoriMap = {};
    kategoris.forEach((k) => {
      kategoriMap[k.id] = k;
    });

    const topKategori = barangByKategori
      .map((b) => ({
        ...kategoriMap[b.kategori_id],
        count: b._count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get barang by station
    const barangByStation = await prisma.barang.groupBy({
      by: ['stasiun_id'],
      _count: true,
      where: { status: 'AKTIF' },
    });

    const stations = await prisma.station.findMany({
      where: { id: { in: barangByStation.map((b) => b.stasiun_id) } },
      select: { id: true, nama: true, kode: true },
    });

    const stationMap = {};
    stations.forEach((s) => {
      stationMap[s.id] = s;
    });

    const topStations = barangByStation
      .map((b) => ({
        ...stationMap[b.stasiun_id],
        count: b._count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get weekly data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyBarang = await prisma.barang.findMany({
      where: {
        created_at: { gte: sevenDaysAgo },
      },
      select: {
        created_at: true,
        status: true,
      },
    });

    // Group by date
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = weeklyBarang.filter(
        (b) => b.created_at.toISOString().split('T')[0] === dateStr
      );

      dailyStats.push({
        date: dateStr,
        label: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        ditemukan: dayData.length,
        diambil: dayData.filter((b) => b.status === 'DIAMBIL').length,
      });
    }

    res.json({
      success: true,
      data: {
        barang: {
          total: totalBarang,
          aktif: barangAktif,
          diklaim: barangDiklaim,
          diambil: barangDiambil,
          archive: barangArchive,
        },
        klaim: {
          total: totalKlaim,
          pending: klaimPending,
          approved: klaimApproved,
          rejected: klaimRejected,
          approval_rate: totalKlaim > 0
            ? Math.round((klaimApproved / totalKlaim) * 100)
            : 0,
        },
        users: {
          total: totalUsers,
          petugas: totalPetugas,
        },
        top_kategori: topKategori,
        top_stations: topStations,
        daily_stats: dailyStats,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// GET BARANG STATS
// ============================================
const getBarangStats = async (req, res) => {
  try {
    const stats = await getDashboardStats(req, res);

    // Return just barang stats
    if (stats.json) {
      return res.json({
        success: true,
        data: {
          total: stats.json.data.barang.total,
          aktif: stats.json.data.barang.aktif,
          diklaim: stats.json.data.barang.diklaim,
          diambil: stats.json.data.barang.diambil,
          archive: stats.json.data.barang.archive,
          by_kategori: stats.json.data.top_kategori,
          by_station: stats.json.data.top_stations,
        },
      });
    }
  } catch (error) {
    console.error('Get barang stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// GET KLAIM STATS
// ============================================
const getKlaimStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.klaim.count(),
      prisma.klaim.count({ where: { status: 'PENDING' } }),
      prisma.klaim.count({ where: { status: 'APPROVED' } }),
      prisma.klaim.count({ where: { status: 'REJECTED' } }),
    ]);

    // Get average verification time
    const approvedKlaim = await prisma.klaim.findMany({
      where: {
        status: 'APPROVED',
        verified_at: { not: null },
      },
      select: {
        created_at: true,
        verified_at: true,
      },
      take: 100,
      orderBy: { verified_at: 'desc' },
    });

    let avgVerificationTime = 0;
    if (approvedKlaim.length > 0) {
      const totalTime = approvedKlaim.reduce((sum, k) => {
        const diff = k.verified_at - k.created_at;
        return sum + diff / (1000 * 60 * 60); // Convert to hours
      }, 0);
      avgVerificationTime = Math.round(totalTime / approvedKlaim.length * 10) / 10;
    }

    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        approval_rate: total > 0 ? Math.round((approved / total) * 100) : 0,
        rejection_rate: total > 0 ? Math.round((rejected / total) * 100) : 0,
        avg_verification_hours: avgVerificationTime,
      },
    });
  } catch (error) {
    console.error('Get klaim stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// EXPORT REPORT
// ============================================
const exportReport = async (req, res) => {
  try {
    const { type = 'barang', format = 'json', start_date, end_date } = req.query;

    const where = {};
    if (start_date) {
      where.created_at = { ...where.created_at, gte: new Date(start_date) };
    }
    if (end_date) {
      where.created_at = { ...where.created_at, lte: new Date(end_date) };
    }

    if (type === 'barang') {
      const barang = await prisma.barang.findMany({
        where,
        include: {
          kategori: true,
          stasiun: true,
          creator: { select: { nama: true } },
        },
        orderBy: { created_at: 'desc' },
      });

      return res.json({
        success: true,
        data: barang,
        meta: {
          type: 'barang',
          total: barang.length,
          generated_at: new Date().toISOString(),
        },
      });
    }

    if (type === 'klaim') {
      const klaim = await prisma.klaim.findMany({
        where,
        include: {
          barang: { select: { nama: true, kode: true } },
          user: { select: { nama: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
      });

      return res.json({
        success: true,
        data: klaim,
        meta: {
          type: 'klaim',
          total: klaim.length,
          generated_at: new Date().toISOString(),
        },
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid report type',
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getDashboardStats,
  getBarangStats,
  getKlaimStats,
  exportReport,
};

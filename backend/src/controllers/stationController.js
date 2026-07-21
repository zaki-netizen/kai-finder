const prisma = require('../config/database');

// ============================================
// GET ALL STATIONS
// ============================================
const getAllStations = async (req, res) => {
  try {
    const { tipe } = req.query;

    const where = {};
    if (tipe === 'KRL') {
      where.tipe = { has: 'KRL' };
    } else if (tipe === 'KA_JARAK_JAUH') {
      where.tipe = { has: 'KA_JARAK_JAUH' };
    }

    const stations = await prisma.station.findMany({
      where,
      orderBy: { nama: 'asc' },
    });

    res.json({
      success: true,
      data: stations,
    });
  } catch (error) {
    console.error('Get all stations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// GET STATION BY ID
// ============================================
const getStationById = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await prisma.station.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            barang: true,
          },
        },
      },
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Stasiun tidak ditemukan',
      });
    }

    res.json({
      success: true,
      data: station,
    });
  } catch (error) {
    console.error('Get station by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getAllStations,
  getStationById,
};

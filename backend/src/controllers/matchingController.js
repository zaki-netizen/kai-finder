const prisma = require('../config/database');

// Simple string similarity function (Levenshtein-based)
const similarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();

  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0 || len2 === 0) return 0;
  if (len1 === len2 && str1 === str2) return 100;

  const matrix = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const score = ((maxLen - distance) / maxLen) * 100;

  return Math.round(score);
};

// Calculate match score between lost item and found item
const calculateMatchScore = (lostItem, foundItem) => {
  let totalScore = 0;
  let weightTotal = 0;

  const checks = [
    { field: 'nama', lost: lostItem.nama_barang, found: foundItem.nama, weight: 40 },
    { field: 'deskripsi', lost: lostItem.deskripsi, found: foundItem.deskripsi, weight: 25 },
    { field: 'warna', lost: lostItem.warna, found: foundItem.warna, weight: 20 },
    { field: 'kategori', lost: lostItem.kategori_id, found: foundItem.kategori_id, weight: 15 },
  ];

  for (const check of checks) {
    if (check.lost && check.found) {
      if (check.field === 'kategori') {
        // Direct match for kategori
        totalScore += check.lost === check.found ? check.weight : 0;
      } else {
        const score = similarity(check.lost, check.found);
        totalScore += (score / 100) * check.weight;
      }
      weightTotal += check.weight;
    } else {
      weightTotal += check.weight;
    }
  }

  return Math.round((totalScore / weightTotal) * 100);
};

// ============================================
// SEARCH MATCHING - Find matching found items
// ============================================
const searchMatching = async (req, res) => {
  try {
    const { q, kategori_id, tipe_transport, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Kata kunci minimal 2 karakter',
      });
    }

    // Get all active found items
    const foundItems = await prisma.barang.findMany({
      where: {
        status: 'AKTIF',
        tipe_transport: tipe_transport || undefined,
        kategori_id: kategori_id || undefined,
      },
      include: {
        kategori: true,
        stasiun: true,
        foto: { where: { is_primary: true }, take: 1 },
      },
    });

    // Calculate match score for each item
    const matched = foundItems.map((item) => {
      const lostItem = {
        nama_barang: q,
        deskripsi: q,
        warna: q,
        kategori_id: kategori_id
      };

      const score = calculateMatchScore(lostItem, item);

      return {
        ...item,
        match_score: score,
        match_reasons: getMatchReasons(lostItem, item),
      };
    });

    // Filter items with score >= 30%
    const results = matched
      .filter((item) => item.match_score >= 30)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: results,
      meta: {
        query: q,
        total_found: foundItems.length,
        total_matched: results.length,
      },
    });
  } catch (error) {
    console.error('Search matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Get reasons for match
const getMatchReasons = (lostItem, foundItem) => {
  const reasons = [];

  if (lostItem.nama_barang && foundItem.nama) {
    const score = similarity(lostItem.nama_barang, foundItem.nama);
    if (score >= 50) {
      reasons.push({ field: 'nama', score, label: 'Nama mirip' });
    }
  }

  if (lostItem.warna && foundItem.warna) {
    const score = similarity(lostItem.warna, foundItem.warna);
    if (score >= 50) {
      reasons.push({ field: 'warna', score, label: 'Warna sama' });
    }
  }

  if (lostItem.kategori_id === foundItem.kategori_id) {
    reasons.push({ field: 'kategori', score: 100, label: 'Kategori sama' });
  }

  return reasons;
};

module.exports = {
  searchMatching,
  calculateMatchScore,
};

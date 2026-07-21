const { upload } = require('../middleware/upload');
const prisma = require('../config/database');
const { uploadToSupabase, deleteFromSupabase, isSupabaseConfigured } = require('../config/supabase');

// ============================================
// UPLOAD FOTO BARANG (Supabase Storage)
// ============================================
const uploadFotoBarang = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('Files:', req.files?.length);
    console.log('Supabase Configured:', isSupabaseConfigured());

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diupload',
      });
    }

    const { barang_id } = req.body;

    if (!barang_id) {
      return res.status(400).json({
        success: false,
        message: 'ID barang wajib disediakan',
      });
    }

    // Verify barang exists
    const barang = await prisma.barang.findUnique({
      where: { id: barang_id },
    });

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan',
      });
    }

    // Check if this is the first photo (make it primary)
    const existingPhotos = await prisma.barangFoto.count({
      where: { barang_id },
    });

    // Upload to Supabase
    const uploadResults = [];
    let uploadError = null;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const result = await uploadToSupabase(file, 'barang');

      if (result.success) {
        uploadResults.push({
          ...result,
          is_primary: existingPhotos === 0 && i === 0,
        });
        console.log('✅ Uploaded:', result.url);
      } else {
        console.error('❌ Upload failed:', result.error);
        uploadError = result.error;
      }
    }

    if (uploadResults.length === 0) {
      return res.status(500).json({
        success: false,
        message: `Gagal upload ke storage: ${uploadError || 'Unknown error'}`,
      });
    }

    // Save to database
    const fotoRecords = await Promise.all(
      uploadResults.map((result) => {
        return prisma.barangFoto.create({
          data: {
            barang_id,
            url: result.url,
            thumbnail: result.url,
            is_primary: result.is_primary || false,
          },
        });
      })
    );

    res.status(201).json({
      success: true,
      message: `${uploadResults.length} foto berhasil diupload`,
      data: fotoRecords,
    });
  } catch (error) {
    console.error('Upload foto error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saat upload foto: ' + error.message,
    });
  }
};

// ============================================
// DELETE FOTO
// ============================================
const deleteFoto = async (req, res) => {
  try {
    const { id } = req.params;

    const foto = await prisma.barangFoto.findUnique({
      where: { id },
    });

    if (!foto) {
      return res.status(404).json({
        success: false,
        message: 'Foto tidak ditemukan',
      });
    }

    // Check permission (barang creator or admin)
    const barang = await prisma.barang.findUnique({
      where: { id: foto.barang_id },
    });

    if (barang.created_by !== req.user.id && !['ADMIN_PUSAT', 'ADMIN_STASIUN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk menghapus foto ini',
      });
    }

    // Delete from database first
    await prisma.barangFoto.delete({
      where: { id },
    });

    // Delete from Supabase (extract key from URL)
    try {
      // Extract path from Supabase URL
      const urlParts = foto.url.split('/storage/v2/object/');
      if (urlParts.length > 1) {
        const key = decodeURIComponent(urlParts[1].split('/').slice(1).join('/'));
        await deleteFromSupabase(key);
      }
    } catch (e) {
      console.error('Failed to delete from Supabase:', e);
    }

    // If deleted photo was primary, make another one primary
    if (foto.is_primary) {
      const anotherPhoto = await prisma.barangFoto.findFirst({
        where: { barang_id: foto.barang_id },
        orderBy: { created_at: 'asc' },
      });

      if (anotherPhoto) {
        await prisma.barangFoto.update({
          where: { id: anotherPhoto.id },
          data: { is_primary: true },
        });
      }
    }

    res.json({
      success: true,
      message: 'Foto berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete foto error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ============================================
// UPLOAD FOTO KLAIM (BUKTI KEPEMILIKAN)
// ============================================
const uploadFotoKlaim = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diupload',
      });
    }

    // Upload to Supabase
    const uploadResults = [];
    let uploadError = null;

    for (const file of req.files) {
      const result = await uploadToSupabase(file, 'klaim');

      if (result.success) {
        uploadResults.push(result);
      } else {
        console.error('Supabase upload failed:', result.error);
        uploadError = result.error;
      }
    }

    if (uploadResults.length === 0) {
      return res.status(500).json({
        success: false,
        message: `Gagal upload ke storage: ${uploadError || 'Unknown error'}`,
      });
    }

    const fotoRecords = uploadResults.map((result) => ({
      url: result.url,
      filename: result.filename || result.key,
      originalname: result.originalname || result.filename,
      size: result.size,
    }));

    res.status(201).json({
      success: true,
      message: `${uploadResults.length} foto berhasil diupload`,
      data: fotoRecords,
    });
  } catch (error) {
    console.error('Upload foto klaim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saat upload foto',
    });
  }
};

module.exports = {
  uploadFotoBarang,
  deleteFoto,
  uploadFotoKlaim,
};

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

// ============================================
// GET ALL USERS (Admin only)
// ============================================
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          nama: true,
          no_hp: true,
          role: true,
          stasiun_id: true,
          stasiun: { select: { id: true, nama: true, kode: true } },
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// GET USER BY ID
// ============================================
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nama: true,
        no_hp: true,
        role: true,
        stasiun_id: true,
        stasiun: { select: { id: true, nama: true, kode: true } },
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// CREATE USER (Admin only)
// ============================================
const createUser = async (req, res) => {
  try {
    const { email, password, nama, no_hp, role, stasiun_id } = req.body;

    // Validation
    if (!email || !password || !nama || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, nama, dan role wajib diisi' });
    }

    if (!['ADMIN_PUSAT', 'ADMIN_STASIUN', 'PETUGAS', 'PENUMPANG'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role tidak valid' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    // If role is ADMIN_STASIUN or PETUGAS, stasiun_id should be provided
    if (['ADMIN_STASIUN', 'PETUGAS'].includes(role) && !stasiun_id) {
      return res.status(400).json({ success: false, message: 'Stasiun wajib dipilih untuk petugas atau admin stasiun' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        no_hp: no_hp || null,
        role,
        stasiun_id: ['ADMIN_STASIUN', 'PETUGAS'].includes(role) ? stasiun_id : null,
      },
      select: {
        id: true,
        email: true,
        nama: true,
        no_hp: true,
        role: true,
        stasiun_id: true,
        stasiun: { select: { id: true, nama: true } },
        is_active: true,
        created_at: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'CREATE',
        entity_type: 'user',
        entity_id: user.id,
        new_value: { email, nama, role },
      },
    });

    res.status(201).json({ success: true, message: 'User berhasil dibuat', data: user });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// UPDATE USER (Admin only)
// ============================================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nama, no_hp, role, stasiun_id, is_active } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Cannot update own account role
    if (id === req.user.id && role && role !== existingUser.role) {
      return res.status(400).json({ success: false, message: 'Tidak dapat mengubah role akun sendiri' });
    }

    // Build update data
    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (no_hp !== undefined) updateData.no_hp = no_hp;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Handle stasiun_id
    if (stasiun_id !== undefined) {
      if (['ADMIN_STASIUN', 'PETUGAS'].includes(role || existingUser.role) && !stasiun_id) {
        return res.status(400).json({ success: false, message: 'Stasiun wajib dipilih untuk petugas atau admin stasiun' });
      }
      updateData.stasiun_id = stasiun_id || null;
    }

    // If changing email, check if new email is available
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
      }
      updateData.email = email;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nama: true,
        no_hp: true,
        role: true,
        stasiun_id: true,
        stasiun: { select: { id: true, nama: true } },
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'UPDATE',
        entity_type: 'user',
        entity_id: id,
        old_value: { nama: existingUser.nama, role: existingUser.role },
        new_value: updateData,
      },
    });

    res.json({ success: true, message: 'User berhasil diupdate', data: user });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// CHANGE USER PASSWORD (Admin only)
// ============================================
const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'UPDATE',
        entity_type: 'user',
        entity_id: id,
        new_value: { action: 'PASSWORD_CHANGED' },
      },
    });

    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// DELETE USER (Admin only)
// ============================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cannot delete own account
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Cannot delete ADMIN_PUSAT if there's only one
    if (user.role === 'ADMIN_PUSAT') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN_PUSAT' } });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Tidak dapat menghapus admin pusat terakhir' });
      }
    }

    await prisma.user.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: req.user.id,
        action: 'DELETE',
        entity_type: 'user',
        entity_id: id,
        old_value: { email: user.email, nama: user.nama, role: user.role },
      },
    });

    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
};

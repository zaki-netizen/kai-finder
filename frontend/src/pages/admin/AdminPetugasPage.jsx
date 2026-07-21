import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { userAPI, stationsAPI } from '@/lib/api';

export default function AdminPetugasPage() {
  const [petugas, setPetugas] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [filterRole, setFilterRole] = useState('');
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_hp: '',
    password: '',
    role: 'PETUGAS',
    stasiun_id: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, [filterRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, stationsRes] = await Promise.all([
        userAPI.getAll({}),
        stationsAPI.getAll(),
      ]);
      // Filter out PENUMPANG role for this page
      const filteredUsers = (usersRes.data.data || []).filter(u => u.role !== 'PENUMPANG');
      setPetugas(filteredUsers);
      setStations(stationsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nama) newErrors.nama = 'Nama wajib diisi';
    if (!formData.email) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email tidak valid';
    if (!editingId && !formData.password) newErrors.password = 'Password wajib diisi';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (['ADMIN_STASIUN', 'PETUGAS'].includes(formData.role) && !formData.stasiun_id) {
      newErrors.stasiun_id = 'Stasiun wajib dipilih';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const submitData = {
        ...formData,
        stasiun_id: ['ADMIN_STASIUN', 'PETUGAS'].includes(formData.role) ? formData.stasiun_id : null,
      };

      if (editingId) {
        // If editing, only send password if it's changed
        const updateData = { ...submitData };
        if (!formData.password) delete updateData.password;
        await userAPI.update(editingId, updateData);
        toast.success('Petugas berhasil diupdate');
      } else {
        await userAPI.create(submitData);
        toast.success('Petugas berhasil ditambahkan');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const handleEdit = (petugasData) => {
    setEditingId(petugasData.id);
    setFormData({
      nama: petugasData.nama,
      email: petugasData.email,
      no_hp: petugasData.no_hp || '',
      password: '',
      role: petugasData.role,
      stasiun_id: petugasData.stasiun_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus petugas ini?')) return;
    try {
      await userAPI.delete(id);
      toast.success('Petugas berhasil dihapus');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nama: '',
      email: '',
      no_hp: '',
      password: '',
      role: 'PETUGAS',
      stasiun_id: '',
    });
    setErrors({});
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN_PUSAT':
        return <span className="badge bg-purple-100 text-purple-800">Admin Pusat</span>;
      case 'ADMIN_STASIUN':
        return <span className="badge bg-blue-100 text-blue-800">Admin Stasiun</span>;
      case 'PETUGAS':
        return <span className="badge bg-green-100 text-green-800">Petugas</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-800">{role}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kelola Petugas</h1>
            <p className="text-gray-500">Kelola akun petugas dan admin stasiun</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Tambah Petugas
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{petugas.length}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCog className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {petugas.filter((p) => p.role === 'PETUGAS').length}
                </p>
                <p className="text-sm text-gray-500">Petugas</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {petugas.filter((p) => p.role === 'ADMIN_STASIUN').length}
                </p>
                <p className="text-sm text-gray-500">Admin Stasiun</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-kai-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Petugas</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">No. HP</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stasiun</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {petugas.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-kai-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {p.nama.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium">{p.nama}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {p.email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {p.no_hp || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">{getRoleBadge(p.role)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {p.stasiun?.nama || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit Petugas' : 'Tambah Petugas Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nama Lengkap *</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className={cn('input', errors.nama && 'input-error')}
                  placeholder="Nama lengkap"
                />
                {errors.nama && <p className="text-sm text-red-500 mt-1">{errors.nama}</p>}
              </div>

              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn('input', errors.email && 'input-error')}
                  placeholder="email@contoh.com"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="label">No. HP</label>
                <input
                  type="tel"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleChange}
                  className="input"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="label">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="PETUGAS">Petugas</option>
                  <option value="ADMIN_STASIUN">Admin Stasiun</option>
                </select>
              </div>

              <div>
                <label className="label">Stasiun *</label>
                <select
                  name="stasiun_id"
                  value={formData.stasiun_id}
                  onChange={handleChange}
                  className={cn('input', errors.stasiun_id && 'input-error')}
                >
                  <option value="">Pilih Stasiun</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama}</option>
                  ))}
                </select>
                {errors.stasiun_id && <p className="text-sm text-red-500 mt-1">{errors.stasiun_id}</p>}
              </div>

              <div>
                <label className="label">
                  Password {editingId && '(kosongkan jika tidak diubah)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={cn('input pr-10', errors.password && 'input-error')}
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

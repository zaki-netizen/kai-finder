import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Plus,
  Loader2,
  MapPin,
  Package,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import { barangAPI, kategoriAPI, stationsAPI } from '@/lib/api';
import { formatDateTime, getStatusBadge, getStatusLabel, cn } from '@/lib/utils';

export default function AdminBarangPage() {
  const navigate = useNavigate();

  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    kategori_id: '',
    stasiun_id: '',
    tipe_transport: '',
  });
  const [kategori, setKategori] = useState([]);
  const [stations, setStations] = useState([]);
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  // Dropdown & Delete state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchFilters();
    fetchBarang();
  }, [page, filters]);

  const fetchFilters = async () => {
    try {
      const [katRes, statRes] = await Promise.all([
        kategoriAPI.getAll(),
        stationsAPI.getAll(),
      ]);
      setKategori(katRes.data.data);
      setStations(statRes.data.data);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const fetchBarang = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        ...filters,
      };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await barangAPI.getAll(params);
      setBarang(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch barang:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBarang();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    setOpenDropdownId(null); // Close dropdown
    try {
      await barangAPI.updateStatus(id, status);
      toast.success('Status berhasil diupdate');
      fetchBarang();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Gagal mengupdate status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteClick = (item) => {
    setOpenDropdownId(null); // Close dropdown
    setDeleteModal({ show: true, item });
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;

    setDeletingId(deleteModal.item.id);
    try {
      await barangAPI.delete(deleteModal.item.id);
      toast.success('Barang berhasil dihapus');
      setDeleteModal({ show: false, item: null });
      fetchBarang();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus');
    } finally {
      setDeletingId(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <h1 className="text-2xl font-bold">Kelola Barang</h1>
        <p className="text-gray-500">Kelola semua barang ditemukan</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Filter */}
        <div className="card p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari barang..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input w-auto"
              >
                <option value="">Semua Status</option>
                <option value="AKTIF">Tersedia</option>
                <option value="DIKLAIM">Diklaim</option>
                <option value="DIAMBIL">Diambil</option>
                <option value="ARCHIVE">Arsip</option>
              </select>
              <select
                value={filters.tipe_transport}
                onChange={(e) => handleFilterChange('tipe_transport', e.target.value)}
                className="input w-auto"
              >
                <option value="">Semua Tipe</option>
                <option value="KRL">KRL</option>
                <option value="KA_JARAK_JAUH">KA Jarak Jauh</option>
              </select>
              <button type="submit" className="btn-primary">
                Cari
              </button>
              <button
                type="button"
                onClick={fetchBarang}
                className="btn-outline"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pagination.total || 0}</p>
                <p className="text-sm text-gray-500">Total Barang</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {barang.filter((b) => b.status === 'AKTIF').length}
                </p>
                <p className="text-sm text-gray-500">Tersedia</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {barang.filter((b) => b.status === 'DIKLAIM').length}
                </p>
                <p className="text-sm text-gray-500">Diklaim</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Archive className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {barang.filter((b) => b.status === 'DIAMBIL').length}
                </p>
                <p className="text-sm text-gray-500">Diambil</p>
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
          ) : barang.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada barang</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Barang</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Kategori</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Lokasi</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tanggal</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {barang.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.foto?.[0] ? (
                            <img
                              src={item.foto[0].thumbnail || item.foto[0].url}
                              alt={item.nama}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.nama}</p>
                            <p className="text-xs text-gray-500">{item.kode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">
                          {item.kategori?.icon} {item.kategori?.nama}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {item.stasiun?.nama}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.tipe_transport === 'KRL' ? item.jalur : item.nama_kereta}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${getStatusBadge(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(item.ditemukan_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/barang/${item.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Lihat"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Link>
                          <Link
                            to={`/petugas/edit-barang/${item.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </Link>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            </button>
                            {openDropdownId === item.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                                {item.status === 'AKTIF' && (
                                  <button
                                    onClick={() => handleUpdateStatus(item.id, 'DIKLAIM')}
                                    disabled={updatingId === item.id}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                  >
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                    Tandai Diklaim
                                  </button>
                                )}
                                {item.status === 'DIKLAIM' && (
                                  <button
                                    onClick={() => handleUpdateStatus(item.id, 'DIAMBIL')}
                                    disabled={updatingId === item.id}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Tandai Diambil
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'ARCHIVE')}
                                  disabled={updatingId === item.id}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                >
                                  <Archive className="h-4 w-4 text-purple-500" />
                                  Arsipkan
                                </button>
                                <div className="border-t my-1" />
                                <button
                                  onClick={() => handleDeleteClick(item)}
                                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Hapus Barang
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Halaman {page} dari {pagination.totalPages} ({pagination.total} barang)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost px-3 py-1"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="btn-ghost px-3 py-1"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hapus Barang</h3>
                  <p className="text-sm text-red-600">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Apakah Anda yakin ingin menghapus barang berikut?
              </p>

              {/* Item Preview */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                {deleteModal.item.foto?.[0] ? (
                  <img
                    src={deleteModal.item.foto[0].thumbnail || deleteModal.item.foto[0].url}
                    alt={deleteModal.item.nama}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{deleteModal.item.nama}</p>
                  <p className="text-sm text-gray-500">{deleteModal.item.kode}</p>
                  <span className={`badge ${getStatusBadge(deleteModal.item.status)} mt-1`}>
                    {getStatusLabel(deleteModal.item.status)}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                ⚠️ Semua data terkait barang ini akan ikut dihapus, termasuk foto dan riwayat klaim.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, item: null })}
                disabled={deletingId}
                className="btn-outline"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingId}
                className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

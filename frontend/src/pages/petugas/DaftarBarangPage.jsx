import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  Search,
  Plus,
  Filter,
  Loader2,
  MapPin,
  Clock,
  Package,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { barangAPI } from '@/lib/api';
import { formatDateTime, getStatusBadge, getStatusLabel } from '@/lib/utils';

export default function DaftarBarangPage() {
  const navigate = useNavigate();

  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    tipe_transport: '',
  });
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchBarang();
  }, [page, filters]);

  const fetchBarang = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        ...filters,
      };

      // Remove empty filters
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

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      return;
    }

    setDeletingId(id);
    try {
      await barangAPI.delete(id);
      toast.success('Barang berhasil dihapus');
      fetchBarang();
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus barang';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Daftar Barang</h1>
                <p className="text-sm text-gray-500">
                  {pagination.total || 0} barang ditemukan
                </p>
              </div>
            </div>

            <Link to="/petugas/tambah-barang" className="btn-primary">
              <Plus className="h-4 w-4" />
              Tambah Barang
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama barang, deskripsi..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input pl-10"
                />
              </div>
            </form>

            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input w-auto"
              >
                <option value="">Semua Status</option>
                <option value="AKTIF">Tersedia</option>
                <option value="DIKLAIM">Diklaim</option>
                <option value="DIAMBIL">Sudah Diambil</option>
                <option value="ARCHIVE">Diarsipkan</option>
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
              <p className="text-gray-500">Belum ada barang ditemukan</p>
              <Link to="/petugas/tambah-barang" className="btn-primary mt-4">
                Tambah Barang Pertama
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Barang
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Lokasi
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      Aksi
                    </th>
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
                            <div className="font-medium">{item.nama}</div>
                            <div className="text-sm text-gray-500">
                              {item.kode}
                            </div>
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
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {item.stasiun?.nama}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {item.tipe_transport === 'KRL'
                              ? item.jalur
                              : item.nama_kereta}
                          </div>
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
                            title="Lihat Detail"
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
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-2 hover:bg-red-50 rounded-lg"
                            title="Hapus"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </button>
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
              <div className="text-sm text-gray-500">
                Menampilkan {(page - 1) * 12 + 1} -{' '}
                {Math.min(page * 12, pagination.total)} dari {pagination.total}
              </div>
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
    </div>
  );
}

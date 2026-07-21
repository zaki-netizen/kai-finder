import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Loader2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Phone,
  Mail,
  FileText,
  Image,
  AlertTriangle,
} from 'lucide-react';
import { klaimAPI } from '@/lib/api';
import { formatDateTime, formatRelativeTime, cn } from '@/lib/utils';

export default function VerifikasiKlaimPage() {
  const navigate = useNavigate();

  const [klaim, setKlaim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: 'PENDING',
  });
  const [page, setPage] = useState(1);
  const [selectedKlaim, setSelectedKlaim] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchKlaim();
  }, [page, filters]);

  const fetchKlaim = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await klaimAPI.getAll(params);
      setKlaim(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch klaim:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchKlaim();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const openDetail = async (item) => {
    try {
      const response = await klaimAPI.getById(item.id);
      setSelectedKlaim(response.data.data);
    } catch (error) {
      console.error('Failed to fetch klaim detail:', error);
      toast.error('Gagal memuat detail');
    }
  };

  const closeDetail = () => {
    setSelectedKlaim(null);
  };

  const handleVerify = async (status, alasan = '') => {
    if (!selectedKlaim) return;

    if (status === 'REJECTED' && !alasan) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }

    setProcessing(true);
    try {
      await klaimAPI.verify(selectedKlaim.id, {
        status,
        alasan_tolak: alasan,
      });

      toast.success(
        status === 'APPROVED' ? 'Klaim disetujui!' : 'Klaim ditolak'
      );
      closeDetail();
      fetchKlaim();
    } catch (error) {
      console.error('Verify failed:', error);
      toast.error('Gagal memproses klaim');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'badge-warning';
      case 'APPROVED':
        return 'badge-success';
      case 'REJECTED':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Menunggu';
      case 'APPROVED':
        return 'Disetujui';
      case 'REJECTED':
        return 'Ditolak';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <h1 className="text-2xl font-bold">Verifikasi Klaim</h1>
        <p className="text-gray-500">Periksa dan verifikasi klaim barang dari penumpang</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Filter Bar */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau nomor tiket..."
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
                <option value="PENDING">Menunggu</option>
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
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
          ) : klaim.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada klaim</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Pengklaim
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Barang
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
                  {klaim.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{item.nama_pengklaim}</p>
                          <p className="text-sm text-gray-500">{item.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.barang?.foto?.[0] ? (
                            <img
                              src={item.barang.foto[0].thumbnail || item.barang.foto[0].url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.barang?.nama}</p>
                            <p className="text-sm text-gray-500">
                              {item.barang?.stasiun?.nama}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${getStatusBadge(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatRelativeTime(item.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(item)}
                          className="btn-ghost px-3 py-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </button>
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
                Halaman {page} dari {pagination.totalPages}
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

      {/* Detail Modal */}
      {selectedKlaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDetail}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Detail Klaim</h2>
              <button
                onClick={closeDetail}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`badge ${getStatusBadge(selectedKlaim.status)} text-sm`}>
                  {getStatusLabel(selectedKlaim.status)}
                </span>
                <span className="text-sm text-gray-500">
                  Diajukan {formatDateTime(selectedKlaim.created_at)}
                </span>
              </div>

              {/* Info Pengklaim */}
              <div>
                <h3 className="font-semibold mb-3">Identitas Pengklaim</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-500">Nama</p>
                    <p className="font-medium">{selectedKlaim.nama_pengklaim}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedKlaim.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">No. HP</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedKlaim.no_hp}
                    </p>
                  </div>
                  {selectedKlaim.no_tiket && (
                    <div>
                      <p className="text-sm text-gray-500">No. Tiket</p>
                      <p className="font-medium">{selectedKlaim.no_tiket}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Barang */}
              <div>
                <h3 className="font-semibold mb-3">Barang yang Diklaim</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    {selectedKlaim.barang?.foto?.[0] ? (
                      <img
                        src={selectedKlaim.barang.foto[0].url}
                        alt=""
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{selectedKlaim.barang?.nama}</p>
                      <p className="text-sm text-gray-500">
                        Kode: {selectedKlaim.barang?.kode}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedKlaim.barang?.stasiun?.nama}
                      </p>
                      <p className="text-sm text-gray-500">
                        Lokasi: {selectedKlaim.barang?.lokasi_penyimpanan}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deskripsi Pengklaim */}
              <div>
                <h3 className="font-semibold mb-3">Deskripsi dari Pengklaim</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Deskripsi</p>
                    <p className="font-medium">{selectedKlaim.deskripsi}</p>
                  </div>
                  {selectedKlaim.warna_barang && (
                    <div>
                      <p className="text-sm text-gray-500">Warna</p>
                      <p className="font-medium">{selectedKlaim.warna_barang}</p>
                    </div>
                  )}
                  {selectedKlaim.ciri_khas_barang && (
                    <div>
                      <p className="text-sm text-gray-500">Ciri Khas</p>
                      <p className="font-medium">{selectedKlaim.ciri_khas_barang}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bukti */}
              <div>
                <h3 className="font-semibold mb-3">Bukti Kepemilikan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Foto KTP</p>
                    <img
                      src={selectedKlaim.bukti_ktp}
                      alt="KTP"
                      className="w-full rounded-lg border"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Bukti Kepemilikan</p>
                    <img
                      src={selectedKlaim.bukti_kepemilikan}
                      alt="Bukti"
                      className="w-full rounded-lg border"
                    />
                  </div>
                </div>
              </div>

              {/* Alasan Penolakan (if rejected) */}
              {selectedKlaim.status === 'REJECTED' && selectedKlaim.alasan_tolak && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 font-medium mb-1">Alasan Penolakan:</p>
                  <p className="text-red-700">{selectedKlaim.alasan_tolak}</p>
                </div>
              )}

              {/* Kode Verifikasi (if approved) */}
              {selectedKlaim.status === 'APPROVED' && selectedKlaim.kode_verifikasi && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium mb-1">Kode Verifikasi:</p>
                  <p className="text-2xl font-bold text-green-700 font-mono">
                    {selectedKlaim.kode_verifikasi}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Berikan kode ini kepada pengklaim saat pengambilan barang
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedKlaim.status === 'PENDING' && (
              <div className="sticky bottom-0 bg-white border-t p-4 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerify('APPROVED')}
                    disabled={processing}
                    className="btn-primary flex-1 py-3"
                  >
                    {processing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Setujui Klaim
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const alasan = prompt('Masukkan alasan penolakan:');
                      if (alasan) handleVerify('REJECTED', alasan);
                    }}
                    disabled={processing}
                    className="btn bg-red-500 text-white flex-1 py-3 hover:bg-red-600"
                  >
                    <XCircle className="h-5 w-5" />
                    Tolak Klaim
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

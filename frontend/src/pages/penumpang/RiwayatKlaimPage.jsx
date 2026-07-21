import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package, FileSearch, Search } from 'lucide-react';
import { klaimAPI } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export default function RiwayatKlaimPage() {
  const [klaim, setKlaim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchKlaim();
  }, []);

  const fetchKlaim = async () => {
    try {
      const res = await klaimAPI.getMy();
      setKlaim(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch klaim:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Menunggu Verifikasi';
      case 'APPROVED':
        return 'Disetujui';
      case 'REJECTED':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'APPROVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      default:
        return '📋';
    }
  };

  const filteredKlaim = filter === 'ALL' ? klaim : klaim.filter(k => k.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-kai-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Klaim</h1>
        <p className="text-gray-500 mt-1">
          Lacak status klaim barang Anda
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status === 'ALL' ? 'Semua' : getStatusLabel(status)}
            {status !== 'ALL' && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {klaim.filter(k => k.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Klaim List */}
      {filteredKlaim.length > 0 ? (
        <div className="space-y-4">
          {filteredKlaim.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.barang?.foto?.[0] ? (
                      <img
                        src={item.barang.foto[0].thumbnail || item.barang.foto[0].url}
                        alt={item.barang?.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{item.barang?.nama}</h3>
                        <p className="text-sm text-gray-500">{item.barang?.kode}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>
                        {getStatusIcon(item.status)} {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Tanggal Klaim</p>
                        <p className="font-medium">{formatDateTime(item.created_at)}</p>
                      </div>
                      {item.barang?.stasiun && (
                        <div>
                          <p className="text-gray-500">Lokasi</p>
                          <p className="font-medium">{item.barang.stasiun.nama}</p>
                        </div>
                      )}
                    </div>

                    {item.status === 'REJECTED' && item.alasan_tolak && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Alasan penolakan:</strong> {item.alasan_tolak}
                        </p>
                      </div>
                    )}

                    {item.status === 'APPROVED' && item.kode_verifikasi && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          <strong>Kode Verifikasi:</strong> {item.kode_verifikasi}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Tunjukkan kode ini saat mengambil barang
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t flex gap-3">
                  <Link
                    to={`/barang/${item.barang_id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Lihat Detail Barang
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FileSearch className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'ALL' ? 'Belum Ada Klaim' : `Tidak Ada Klaim ${getStatusLabel(filter)}`}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === 'ALL'
              ? 'Anda belum mengajukan klaim apapun'
              : `Tidak ada klaim dengan status "${getStatusLabel(filter)}"`
            }
          </p>
          <Link to="/krl" className="btn-primary">
            <Search className="h-4 w-4 mr-2" />
            Cari Barang
          </Link>
        </div>
      )}
    </div>
  );
}

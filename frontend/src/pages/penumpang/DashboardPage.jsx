import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Package, FileSearch, Bell, ArrowRight, Heart } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { klaimAPI, barangAPI } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export default function PenumpangDashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myKlaim: 0,
    pendingKlaim: 0,
    approvedKlaim: 0,
    myBarangHilang: 0,
  });
  const [recentKlaim, setRecentKlaim] = useState([]);
  const [recentBarangHilang, setRecentBarangHilang] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user's klaim
      const klaimRes = await klaimAPI.getMy();
      const klaimData = klaimRes.data.data || [];
      setRecentKlaim(klaimData.slice(0, 3));

      setStats({
        myKlaim: klaimData.length,
        pendingKlaim: klaimData.filter(k => k.status === 'PENDING').length,
        approvedKlaim: klaimData.filter(k => k.status === 'APPROVED').length,
        myBarangHilang: 0, // Will add later if barang_hilang API exists
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-kai-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {user?.nama}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Temukan barang hilang Anda atau lacak klaim yang sudah diajukan
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          to="/krl"
          className="card p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Cari Barang KRL</h3>
              <p className="text-blue-100 text-sm mt-1">
                Jelajahi barang ditemukan di KRL Commuter Line
              </p>
            </div>
            <ArrowRight className="h-8 w-8 text-white/50" />
          </div>
        </Link>

        <Link
          to="/ka"
          className="card p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-purple-500 to-purple-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Cari Barang KA</h3>
              <p className="text-purple-100 text-sm mt-1">
                Temukan barang di Kereta Api Jarak Jauh
              </p>
            </div>
            <ArrowRight className="h-8 w-8 text-white/50" />
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileSearch className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.myKlaim}</p>
              <p className="text-sm text-gray-500">Total Klaim</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pendingKlaim}</p>
              <p className="text-sm text-gray-500">Menunggu</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approvedKlaim}</p>
              <p className="text-sm text-gray-500">Disetujui</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.myBarangHilang}</p>
              <p className="text-sm text-gray-500">Barang Dicari</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Klaim */}
        <div className="card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold">Klaim Saya</h2>
            <Link
              to="/penumpang/riwayat-klaim"
              className="text-sm text-kai-primary hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="divide-y">
            {recentKlaim.length > 0 ? (
              recentKlaim.map((klaim) => (
                <div key={klaim.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{klaim.barang?.nama}</p>
                      <p className="text-sm text-gray-500">
                        Diajukan: {formatDateTime(klaim.created_at)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(klaim.status)}`}>
                      {getStatusLabel(klaim.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FileSearch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada klaim</p>
                <Link
                  to="/krl"
                  className="text-sm text-kai-primary hover:underline mt-2 inline-block"
                >
                  Cari barang dulu
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="card">
          <div className="p-4 border-b">
            <h2 className="font-bold">Tips Mencari Barang</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Cek Katalog Barang</p>
                <p className="text-xs text-gray-500">
                  Jelajahi katalog barang ditemukan untuk menemukan barang Anda
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">Ajukan Klaim</p>
                <p className="text-xs text-gray-500">
                  Sediakan bukti kepemilikan yang valid untuk verifikasi
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">Fitur "Kemungkinan Milik Saya"</p>
                <p className="text-xs text-gray-500">
                  Sistem akan memberi tahu jika ada barang yang cocok dengan deskripsi Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

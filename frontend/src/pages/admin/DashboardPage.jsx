import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FileCheck,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react';
import { statsAPI, barangAPI, klaimAPI } from '@/lib/api';
import { formatDate, formatRelativeTime, getStatusBadge, getStatusLabel } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentBarang, setRecentBarang] = useState([]);
  const [recentKlaim, setRecentKlaim] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [barangRes, klaimRes] = await Promise.all([
        barangAPI.getAll({ limit: 5 }),
        klaimAPI.getAll({ limit: 5, status: 'PENDING' }),
      ]);

      setRecentBarang(barangRes.data.data);
      setRecentKlaim(klaimRes.data.data);

      // Calculate stats manually from barang
      const allBarang = barangRes.data.data;
      setStats({
        total_barang: allBarang.length,
        barang_aktif: allBarang.filter((b) => b.status === 'AKTIF').length,
        barang_diklaim: allBarang.filter((b) => b.status === 'DIKLAIM').length,
        barang_diambil: allBarang.filter((b) => b.status === 'DIAMBIL').length,
        total_petugas: 5,
        klaim_pending: klaimRes.data.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Barang',
      value: stats?.total_barang || 0,
      subtitle: 'Semua barang ditemukan',
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/admin/barang',
    },
    {
      title: 'Barang Tersedia',
      value: stats?.barang_aktif || 0,
      subtitle: 'Siap diklaim',
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/admin/barang?status=AKTIF',
    },
    {
      title: 'Menunggu Verifikasi',
      value: stats?.klaim_pending || 0,
      subtitle: 'Klaim perlu diverifikasi',
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      link: '/admin/klaim',
    },
    {
      title: 'Sudah Diambil',
      value: stats?.barang_diambil || 0,
      subtitle: 'Barang sudah diambil',
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/admin/barang?status=DIAMBIL',
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-kai-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-500">Ringkasan sistem Lost and Found</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Barang */}
        <div className="card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Barang Terbaru</h2>
            <Link
              to="/admin/barang"
              className="text-sm text-kai-primary hover:text-kai-secondary flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y">
            {recentBarang.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada barang</p>
              </div>
            ) : (
              recentBarang.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {item.foto?.[0] ? (
                      <img
                        src={item.foto[0].thumbnail || item.foto[0].url}
                        alt={item.nama}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.nama}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {item.stasiun?.nama}
                        <span>•</span>
                        {formatRelativeTime(item.ditemukan_at)}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        item.status === 'AKTIF'
                          ? 'badge-success'
                          : item.status === 'DIKLAIM'
                          ? 'badge-warning'
                          : 'badge-info'
                      }`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Klaim */}
        <div className="card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Klaim Menunggu</h2>
            <Link
              to="/admin/klaim"
              className="text-sm text-kai-primary hover:text-kai-secondary flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y">
            {recentKlaim.length === 0 ? (
              <div className="p-8 text-center">
                <FileCheck className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Tidak ada klaim pending</p>
              </div>
            ) : (
              recentKlaim.map((klaim) => (
                <div key={klaim.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
                      <FileCheck className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{klaim.nama_pengklaim}</p>
                      <p className="text-sm text-gray-500 truncate">
                        Mengklaim: {klaim.barang?.nama}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(klaim.created_at)}
                      </div>
                    </div>
                    <Link
                      to={`/admin/klaim/${klaim.id}`}
                      className="btn-ghost px-3 py-1 text-sm"
                    >
                      Verifikasi
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Chart Placeholder */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Statistik Mingguan</h2>
        <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Grafik statistik akan ditampilkan di sini</p>
            <p className="text-sm text-gray-400">
              Menggunakan library Chart.js atau Recharts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

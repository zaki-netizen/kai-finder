import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, CheckCircle, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { barangAPI, statsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function PetugasDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentBarang, setRecentBarang] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [barangRes, statsRes] = await Promise.all([
        barangAPI.getAll({ limit: 5 }),
        statsAPI.getDashboard(),
      ]);

      setRecentBarang(barangRes.data.data);
      setStats(statsRes.data.data);
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
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Barang Tersedia',
      value: stats?.barang_aktif || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Menunggu Klaim',
      value: stats?.barang_diklaim || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Sudah Diambil',
      value: stats?.barang_diambil || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Petugas</h1>
          <p className="text-gray-500">Selamat datang kembali!</p>
        </div>
        <Link to="/petugas/tambah-barang" className="btn-primary">
          <Plus className="h-4 w-4" />
          Tambah Barang
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Barang Terbaru</h2>
            <Link
              to="/petugas/daftar-barang"
              className="text-kai-primary hover:text-kai-secondary flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="divide-y">
          {recentBarang.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada barang ditemukan</p>
              <Link to="/petugas/tambah-barang" className="btn-primary mt-4">
                Tambah Barang Pertama
              </Link>
            </div>
          ) : (
            recentBarang.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/barang/${item.id}`}
                        className="font-medium hover:text-kai-primary"
                      >
                        {item.nama}
                      </Link>
                      <span
                        className={`badge ${
                          item.status === 'AKTIF'
                            ? 'badge-success'
                            : item.status === 'DIKLAIM'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {item.status === 'AKTIF'
                          ? 'Tersedia'
                          : item.status === 'DIKLAIM'
                          ? 'Diklaim'
                          : 'Diambil'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{item.stasiun?.nama}</span>
                      <span>•</span>
                      <span>{formatDate(item.ditemukan_at)}</span>
                    </div>
                  </div>
                  <Link
                    to={`/barang/${item.id}`}
                    className="btn-ghost px-3"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/petugas/tambah-barang" className="card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-kai-primary/10 rounded-xl flex items-center justify-center">
              <Plus className="h-6 w-6 text-kai-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Tambah Barang Baru</h3>
              <p className="text-sm text-gray-500">
                Catat barang yang ditemukan
              </p>
            </div>
          </div>
        </Link>

        <Link to="/petugas/daftar-barang" className="card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-kai-secondary/10 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-kai-secondary" />
            </div>
            <div>
              <h3 className="font-semibold">Kelola Barang</h3>
              <p className="text-sm text-gray-500">
                Lihat & update semua barang
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

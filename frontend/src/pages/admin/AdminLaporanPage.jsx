import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart3,
  TrendingUp,
  Package,
  FileCheck,
  Users,
  Download,
  Calendar,
  Filter,
  Loader2,
  RefreshCw,
  FileText,
  Eye,
} from 'lucide-react';
import { statsAPI } from '@/lib/api';

export default function AdminLaporanPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await statsAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExportLoading(true);
    try {
      const response = await statsAPI.export({ type, start_date: '2026-01-01' });
      // Create download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-${type}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Laporan berhasil didownload');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Gagal mengexport laporan');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-kai-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Laporan & Statistik</h1>
            <p className="text-gray-500">Analisis data Lost and Found</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input w-auto"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="90">90 Hari Terakhir</option>
              <option value="365">1 Tahun Terakhir</option>
            </select>
            <button onClick={fetchStats} className="btn-outline">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Barang</p>
                <p className="text-3xl font-bold mt-1">{stats?.barang?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Barang Tersedia</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats?.barang?.aktif || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Klaim</p>
                <p className="text-3xl font-bold mt-1">{stats?.klaim?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approval Rate</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">{stats?.klaim?.approval_rate || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Daily Stats */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistik Harian
            </h3>
            <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Grafik akan ditampilkan</p>
                <p className="text-sm text-gray-400">Data 7 hari terakhir</p>
              </div>
            </div>
          </div>

          {/* Top Kategori */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Kategori
            </h3>
            <div className="space-y-3">
              {stats?.top_kategori?.length > 0 ? (
                stats.top_kategori.map((kat, idx) => (
                  <div key={kat.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-kai-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-kai-primary">
                      {idx + 1}
                    </span>
                    <span className="text-lg">{kat.icon}</span>
                    <span className="flex-1 font-medium">{kat.nama}</span>
                    <span className="badge bg-gray-100 text-gray-700">{kat.count} barang</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Belum ada data</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Stations */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Stasiun
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {stats?.top_stations?.length > 0 ? (
              stats.top_stations.map((station, idx) => (
                <div key={station.id} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-kai-primary">{station.count}</p>
                  <p className="font-medium mt-1">{station.nama}</p>
                  <p className="text-xs text-gray-500">{station.kode}</p>
                </div>
              ))
            ) : (
              <div className="col-span-5 text-center py-8">
                <p className="text-gray-500">Belum ada data</p>
              </div>
            )}
          </div>
        </div>

        {/* Klaim Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Status Klaim</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Menunggu</span>
                </div>
                <span className="font-bold">{stats?.klaim?.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Disetujui</span>
                </div>
                <span className="font-bold">{stats?.klaim?.approved || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Ditolak</span>
                </div>
                <span className="font-bold">{stats?.klaim?.rejected || 0}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Approval Rate</span>
                <span className="font-bold text-green-600">{stats?.klaim?.approval_rate || 0}%</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-4">Status Barang</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Tersedia</span>
                </div>
                <span className="font-bold">{stats?.barang?.aktif || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Diklaim</span>
                </div>
                <span className="font-bold">{stats?.barang?.diklaim || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Diambil</span>
                </div>
                <span className="font-bold">{stats?.barang?.diambil || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Diarsipkan</span>
                </div>
                <span className="font-bold">{stats?.barang?.archive || 0}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-4">Export Laporan</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('barang')}
                disabled={exportLoading}
                className="btn-primary w-full justify-start"
              >
                <FileText className="h-4 w-4" />
                Laporan Barang
              </button>
              <button
                onClick={() => handleExport('klaim')}
                disabled={exportLoading}
                className="btn-outline w-full justify-start"
              >
                <FileCheck className="h-4 w-4" />
                Laporan Klaim
              </button>
              <button
                disabled={exportLoading}
                className="btn-ghost w-full justify-start text-gray-500"
              >
                <Download className="h-4 w-4" />
                Export PDF (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

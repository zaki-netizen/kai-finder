import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Loader2,
  MapPin,
  Clock,
  Package,
  Train,
  Ticket,
  Calendar,
  X,
} from 'lucide-react';
import { barangAPI, kategoriAPI, stationsAPI } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';

export default function KatalogKAPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');

  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [kategori, setKategori] = useState([]);
  const [keretaList, setKeretaList] = useState([]);

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    kategori_id: '',
    nama_kereta: '',
    no_tiket: '',
    tanggal: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchBarang();
  }, [page, filters]);

  const fetchFilters = async () => {
    try {
      const kategoriRes = await kategoriAPI.getAll();
      setKategori(kategoriRes.data.data);

      // Get unique kereta names from barang
      const barangRes = await barangAPI.getAll({
        tipe_transport: 'KA_JARAK_JAUH',
        limit: 100,
      });

      const uniqueKereta = [...new Set(
        barangRes.data.data
          .map((b) => b.nama_kereta)
          .filter(Boolean)
      )];
      setKeretaList(uniqueKereta);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const fetchBarang = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        tipe_transport: 'KA_JARAK_JAUH',
        status: 'AKTIF',
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

  const clearFilters = () => {
    setFilters({
      search: '',
      kategori_id: '',
      nama_kereta: '',
      no_tiket: '',
      tanggal: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== 'created_at' && v !== 'desc'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-kai-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚂</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Kereta Api Jarak Jauh</h1>
              <p className="text-white/70">Cari barang yang ditemukan</p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama barang, nomor kereta, gerbong..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-kai-accent"
            />
          </form>

          {/* Quick Search */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-sm text-white/70">Cari berdasarkan:</span>
            {keretaList.slice(0, 5).map((kereta) => (
              <button
                key={kereta}
                onClick={() => handleFilterChange('nama_kereta', kereta)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm"
              >
                {kereta}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={cn(
                  'btn-ghost gap-2',
                  showFilterPanel && 'bg-kai-secondary/10 text-kai-secondary'
                )}
              >
                <Filter className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="bg-kai-secondary text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-red-500"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                className="input py-2 text-sm w-auto"
              >
                <option value="created_at-desc">Terbaru</option>
                <option value="created_at-asc">Terlama</option>
                <option value="nama-asc">Nama A-Z</option>
                <option value="nama-desc">Nama Z-A</option>
              </select>

              <div className="hidden sm:flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2',
                    viewMode === 'grid'
                      ? 'bg-kai-secondary text-white'
                      : 'hover:bg-gray-100'
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2',
                    viewMode === 'list'
                      ? 'bg-kai-secondary text-white'
                      : 'hover:bg-gray-100'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4 animate-slide-down">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">Kategori</label>
                  <select
                    value={filters.kategori_id}
                    onChange={(e) => handleFilterChange('kategori_id', e.target.value)}
                    className="input"
                  >
                    <option value="">Semua</option>
                    {kategori.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.icon} {k.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Nama Kereta</label>
                  <select
                    value={filters.nama_kereta}
                    onChange={(e) => handleFilterChange('nama_kereta', e.target.value)}
                    className="input"
                  >
                    <option value="">Semua</option>
                    {keretaList.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Tanggal</label>
                  <input
                    type="date"
                    value={filters.tanggal}
                    onChange={(e) => handleFilterChange('tanggal', e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Nomor Tiket</label>
                  <input
                    type="text"
                    value={filters.no_tiket}
                    onChange={(e) => handleFilterChange('no_tiket', e.target.value)}
                    placeholder="Contoh: ABC123"
                    className="input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="btn-ghost"
                >
                  Tutup
                </button>
                <button onClick={clearFilters} className="btn-outline">
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 text-gray-500">
          Menampilkan {barang.length} dari {pagination.total || 0} barang
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-kai-secondary" />
          </div>
        ) : barang.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Barang Tidak Ditemukan</h3>
            <p className="text-gray-500 mb-4">
              Coba ubah kata kunci atau filter pencarian Anda
            </p>
            <button onClick={clearFilters} className="btn-secondary">
              Reset Pencarian
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {barang.map((item) => (
                  <Link
                    key={item.id}
                    to={`/barang/${item.id}`}
                    className="card-hover overflow-hidden group"
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {item.foto?.[0] ? (
                        <img
                          src={item.foto[0].thumbnail || item.foto[0].url}
                          alt={item.nama}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="badge-success text-xs">Tersedia</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate group-hover:text-kai-secondary">
                        {item.nama}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.kategori?.icon} {item.kategori?.nama}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <Train className="h-3 w-3" />
                        {item.nama_kereta}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>Gerbong {item.gerbong}</span>
                        <span>Kursi {item.kursi}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {barang.map((item) => (
                  <Link
                    key={item.id}
                    to={`/barang/${item.id}`}
                    className="card p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {item.foto?.[0] ? (
                        <img
                          src={item.foto[0].thumbnail || item.foto[0].url}
                          alt={item.nama}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{item.nama}</h3>
                            <p className="text-sm text-gray-500">
                              {item.kategori?.icon} {item.kategori?.nama}
                            </p>
                          </div>
                          <span className="badge-success">Tersedia</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Train className="h-3 w-3" />
                            {item.nama_kereta}
                          </span>
                          <span>Gerbong {item.gerbong}</span>
                          <span>Kursi {item.kursi}</span>
                          {item.relasi && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.relasi}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.ditemukan_at)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost px-4"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={cn(
                        'w-10 h-10 rounded-lg',
                        page === i + 1
                          ? 'bg-kai-secondary text-white'
                          : 'hover:bg-gray-100'
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="btn-ghost px-4"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

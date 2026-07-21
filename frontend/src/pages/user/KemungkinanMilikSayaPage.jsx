import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Loader2, Package, Heart, CheckCircle, Sparkles } from 'lucide-react';

export default function KemungkinanMilikSayaPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [tipeTransport, setTipeTransport] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query || query.length < 2) {
      toast.error('Masukkan minimal 2 karakter');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (tipeTransport) params.append('tipe_transport', tipeTransport);

      const response = await fetch(`/api/matching/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
        if (!data.data?.length) {
          toast.success('Tidak ada barang yang cocok');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Gagal mencari');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    if (score >= 40) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getMatchLabel = (score) => {
    if (score >= 80) return 'Kemungkinan besar ini milik Anda!';
    if (score >= 60) return 'Kemungkinan besar milik Anda';
    if (score >= 40) return 'Kemungkinan milik Anda';
    return 'Sedikit kemiripan';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kemungkinan Milik Saya</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Temukan barang yang mungkin milik Anda berdasarkan kemiripan
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="inline h-4 w-4 mr-1" />
                Deskripsikan barang Anda
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Contoh: tas ransel hitam merk Eiger dengan tali orange di samping..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all min-h-24"
                rows={4}
              />
              <p className="text-xs text-gray-400 mt-2">
                Jelaskan ciri-ciri barang Anda: nama, warna, merk, ciri khusus
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipe Transportasi
              </label>
              <select
                value={tipeTransport}
                onChange={(e) => setTipeTransport(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
              >
                <option value="">Semua</option>
                <option value="KRL">KRL Commuter Line</option>
                <option value="KA_JARAK_JAUH">KA Jarak Jauh</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Cari Kemiripan
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Hasil Pencarian</h2>
            <span className="bg-pink-100 text-pink-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {results.length} barang
            </span>
          </div>

          <div className="space-y-4">
            {results.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/barang/${item.id}`)}>
                <div className="flex gap-4">
                  {/* Photo */}
                  <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                    {item.foto?.[0] ? (
                      <img src={item.foto[0].thumbnail || item.foto[0].url} alt={item.nama} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.nama}</h3>
                        <p className="text-sm text-gray-500">{item.kategori?.nama}</p>
                      </div>

                      {/* Match Score */}
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(item.match_score)}`}>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {item.match_score}%
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">{item.deskripsi}</p>

                    <div className="mt-2">
                      <span className="text-sm font-medium text-pink-600">
                        {getMatchLabel(item.match_score)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Ditemukan: {new Date(item.ditemukan_at).toLocaleDateString('id-ID')}</span>
                      <span>{item.stasiun?.nama}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !loading && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <Heart className="h-16 w-16 text-pink-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Belum ada pencarian</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Masukkan deskripsi barang Anda untuk mencari yang mungkin milik Anda
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

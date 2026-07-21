import { Link } from 'react-router-dom';
import { Search, Package, Train, Clock, MapPin, Bell, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { barangAPI } from '@/lib/api';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function HomePage() {
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBarang();
  }, []);

  const fetchBarang = async () => {
    try {
      const response = await barangAPI.getAll({ status: 'AKTIF', limit: 6 });
      setBarang(response.data.data);
    } catch (error) {
      console.error('Failed to fetch barang:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-kai-primary text-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logofix.png" alt="Logo" className="h-[100px] w-auto" />
              <div>
                <h1 className="text-lg font-bold">KAI Finder</h1>
                <p className="text-xs text-white/70">Lost & Found</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link to="/kemungkinan-milik-saya" className="text-pink-300 hover:text-pink-200 flex items-center gap-1">
                ❤️ Cari Barang Saya
              </Link>
              <Link to="/krl" className="text-white/80 hover:text-white">
                KRL Commuter
              </Link>
              <Link to="/ka" className="text-white/80 hover:text-white">
                KA Jarak Jauh
              </Link>
              <Link to="/login" className="btn bg-white text-kai-primary hover:bg-gray-100">
                Masuk
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Temukan Barang<br />
              <span className="text-kai-accent">Hilang Anda</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
              Sistem Lost and Found terintegrasi untuk KRL Commuter Line dan
              Kereta Api Jarak Jauh. Cepat, mudah, dan aman.
            </p>

            {/* Search Box */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-2 shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama barang, kategori, atau stasiun..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none"
                    />
                  </div>
                  <Link
                    to={searchTerm ? `/krl?q=${encodeURIComponent(searchTerm)}` : '/krl'}
                    className="btn-primary px-8 py-4"
                  >
                    Cari
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/krl" className="btn bg-white/10 hover:bg-white/20 text-white">
                <Train className="h-4 w-4" />
                KRL Commuter
              </Link>
              <Link to="/ka" className="btn bg-white/10 hover:bg-white/20 text-white">
                <Train className="h-4 w-4" />
                KA Jarak Jauh
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Cara Kerja Kami
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              Proses yang transparan dan mudah untuk menemukan barang Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-kai-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="h-8 w-8 text-kai-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Petugas Menemukan</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Petugas KAI menemukan dan mencatat barang di sistem dengan foto dan deskripsi lengkap
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-kai-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-kai-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cari di Katalog</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Pencarian cepat berdasarkan nama, kategori, stasiun, atau tanggal perjalanan
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-kai-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-kai-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ajukan Klaim</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Verifikasi identitas dan bukti kepemilikan, lalu ambil barang di stasiun
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Items */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Barang Ditemukan Terbaru
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Barang yang baru ditemukan dan siap diklaim
              </p>
            </div>
            <Link
              to="/krl"
              className="btn-outline hidden sm:flex"
            >
              Lihat Semua
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-kai-primary" />
            </div>
          ) : barang.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada barang yang ditemukan
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {barang.map((item) => (
                <Link
                  key={item.id}
                  to={`/barang/${item.id}`}
                  className="card-hover overflow-hidden group"
                >
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                    {item.foto?.[0] ? (
                      <img
                        src={item.foto[0].thumbnail || item.foto[0].url}
                        alt={item.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="badge-success">
                        {item.status === 'AKTIF' ? 'Tersedia' : item.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-kai-primary transition-colors">
                      {item.nama}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.kategori?.nama}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {item.stasiun?.nama}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      {new Date(item.ditemukan_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/krl" className="btn-outline">
              Lihat Semua
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-kai-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Kehilangan Barang di Kereta?
          </h2>
          <p className="text-white/80 mb-8">
            Segera laporkan dan cari di katalog kami. Barang Anda mungkin sudah ditemukan!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn bg-white text-kai-primary hover:bg-gray-100">
              Daftar Akun
            </Link>
            <Link to="/krl" className="btn bg-white/10 text-white hover:bg-white/20">
              Cari Barang
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/logofix.png" alt="Logo" className="h-[100px] w-auto" />
              <div>
                <h3 className="font-bold">KAI Finder</h3>
                <p className="text-sm text-gray-400">Lost & Found PT KAI</p>
              </div>
            </div>

            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/about" className="hover:text-white">
                Tentang
              </Link>
              <Link to="/help" className="hover:text-white">
                Bantuan
              </Link>
              <Link to="/contact" className="hover:text-white">
                Kontak
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 PT Kereta Api Indonesia (Persero). All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

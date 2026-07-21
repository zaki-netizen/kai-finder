import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Package,
  Share2,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
  Train,
  User,
  Phone,
  Mail,
  FileText,
  QrCode,
} from 'lucide-react';
import { barangAPI } from '@/lib/api';
import { formatDate, formatDateTime, getStatusLabel } from '@/lib/utils';

export default function DetailBarangPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [barang, setBarang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    fetchBarang();
  }, [id]);

  const fetchBarang = async () => {
    try {
      const response = await barangAPI.getById(id);
      setBarang(response.data.data);
    } catch (error) {
      console.error('Failed to fetch barang:', error);
      toast.error('Barang tidak ditemukan');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-kai-primary" />
      </div>
    );
  }

  if (!barang) {
    return null;
  }

  const isAvailable = barang.status === 'AKTIF';
  const isKRL = barang.tipe_transport === 'KRL';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${barang.nama} - KAI Finder`,
          text: `Barang ditemukan: ${barang.nama} di ${barang.stasiun?.nama}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link berhasil disalin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <span className={`badge ${isAvailable ? 'badge-success' : 'badge-info'}`}>
                  {getStatusLabel(barang.status)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Share2 className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Photo Gallery */}
        <div className="card overflow-hidden mb-6">
          <div className="aspect-video bg-gray-100 relative">
            {barang.foto && barang.foto.length > 0 ? (
              <>
                <img
                  src={barang.foto[currentPhoto]?.url}
                  alt={barang.nama}
                  className="w-full h-full object-contain"
                />

                {/* Photo Navigation */}
                {barang.foto.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentPhoto((p) =>
                          p === 0 ? barang.foto.length - 1 : p - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPhoto((p) =>
                          p === barang.foto.length - 1 ? 0 : p + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Thumbnails */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {barang.foto.map((photo, index) => (
                        <button
                          key={photo.id}
                          onClick={() => setCurrentPhoto(index)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${
                            currentPhoto === index
                              ? 'border-kai-primary'
                              : 'border-white'
                          }`}
                        >
                          <img
                            src={photo.thumbnail || photo.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-gray-300" />
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{barang.kategori?.icon}</span>
                <span className="badge bg-gray-100 text-gray-700">
                  {barang.kategori?.nama}
                </span>
              </div>
              <h1 className="text-2xl font-bold">{barang.nama}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Kode: {barang.kode}
              </p>
            </div>

            {/* Description */}
            {barang.deskripsi && (
              <div className="card p-4">
                <h3 className="font-semibold mb-2">Deskripsi</h3>
                <p className="text-gray-600">{barang.deskripsi}</p>
              </div>
            )}

            {/* Details */}
            <div className="card p-4">
              <h3 className="font-semibold mb-4">Detail Barang</h3>
              <div className="grid grid-cols-2 gap-4">
                {barang.warna && (
                  <div>
                    <p className="text-sm text-gray-500">Warna</p>
                    <p className="font-medium">{barang.warna}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Ditemukan</p>
                  <p className="font-medium">{formatDateTime(barang.ditemukan_at)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Stasiun</p>
                  <p className="font-medium">{barang.stasiun?.nama}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Transportasi</p>
                  <p className="font-medium flex items-center gap-1">
                    {isKRL ? '🚇 KRL' : '🚂 KA Jarak Jauh'}
                  </p>
                </div>
              </div>

              {/* KRL Specific */}
              {isKRL && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Info Perjalanan</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Jalur</p>
                      <p className="font-medium">{barang.jalur}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tujuan</p>
                      <p className="font-medium">{barang.tujuan}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* KA Specific */}
              {!isKRL && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Info Kereta</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Kereta</p>
                      <p className="font-medium">{barang.nama_kereta}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gerbong / Kursi</p>
                      <p className="font-medium">
                        {barang.gerbong} / {barang.kursi}
                      </p>
                    </div>
                    {barang.relasi && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Relasi</p>
                        <p className="font-medium">{barang.relasi}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ciri Khas */}
            {barang.ciri_khas && (
              <div className="card p-4 border-l-4 border-yellow-400">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Ciri Khas
                </h3>
                <p className="text-gray-600">{barang.ciri_khas}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Location Card */}
            <div className="card p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-kai-primary" />
                Lokasi Penyimpanan
              </h3>
              <p className="text-gray-600">{barang.lokasi_penyimpanan}</p>
              <p className="text-sm text-gray-500 mt-2">
                {barang.stasiun?.nama}
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-center">
                  📍 {barang.lokasi_penyimpanan}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            {isAvailable ? (
              <div className="card p-4 border-2 border-kai-primary">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Barang Tersedia!</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Barang ini siap diklaim. Ajukan klaim sekarang.
                  </p>
                  <Link
                    to={`/klaim/${barang.id}`}
                    className="btn-primary w-full"
                  >
                    Ajukan Klaim
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card p-4">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">
                    {barang.status === 'DIKLAIM'
                      ? 'Sedang Diklaim'
                      : 'Sudah Diambil'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {barang.status === 'DIKLAIM'
                      ? 'Barang ini sedang dalam proses klaim'
                      : 'Barang ini sudah diambil pemiliknya'}
                  </p>
                </div>
              </div>
            )}

            {/* QR Code */}
            {barang.qr_code && (
              <div className="card p-4 text-center">
                <h3 className="font-semibold mb-2 flex items-center gap-2 justify-center">
                  <QrCode className="h-5 w-5" />
                  QR Code
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Scan untuk melihat detail barang
                </p>
                <div className="bg-white p-3 rounded-lg inline-block">
                  {/* Placeholder for QR Code */}
                  <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* "Kemungkinan Milik Saya" */}
            <button className="card p-4 w-full hover:shadow-md transition-shadow border-2 border-dashed border-gray-200">
              <div className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-pink-500" />
                <div className="text-left">
                  <p className="font-medium">Kemungkinan Milik Saya</p>
                  <p className="text-sm text-gray-500">
                    Temukan barang yang cocok
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

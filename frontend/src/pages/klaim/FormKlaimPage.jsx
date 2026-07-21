import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  FileText,
  Upload,
  Loader2,
  Package,
  Ticket,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { barangAPI, klaimAPI, uploadAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function FormKlaimPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [barang, setBarang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState({ ktp: false, bukti: false });

  const [formData, setFormData] = useState({
    nama_pengklaim: '',
    no_hp: '',
    email: '',
    no_tiket: '',
    bukti_ktp: '',
    bukti_kepemilikan: '',
    deskripsi: '',
    warna_barang: '',
    ciri_khas_barang: '',
  });

  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    fetchBarang();
  }, [id]);

  const fetchBarang = async () => {
    try {
      const response = await barangAPI.getById(id);
      const item = response.data.data;

      if (item.status !== 'AKTIF') {
        toast.error('Barang ini tidak tersedia untuk diklaim');
        navigate(-1);
        return;
      }

      setBarang(item);
    } catch (error) {
      console.error('Failed to fetch barang:', error);
      toast.error('Barang tidak ditemukan');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [field]: true }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('files', file);

      const response = await uploadAPI.uploadFoto(formDataUpload);
      const url = response.data.data[0].url;

      setFormData((prev) => ({ ...prev, [field]: url }));
      toast.success('File berhasil diupload');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Gagal mengupload file');
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
      e.target.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nama_pengklaim.trim()) {
      newErrors.nama_pengklaim = 'Nama wajib diisi';
    }

    if (!formData.no_hp.trim()) {
      newErrors.no_hp = 'Nomor HP wajib diisi';
    } else if (!/^[0-9]{10,13}$/.test(formData.no_hp.replace(/[\s-]/g, ''))) {
      newErrors.no_hp = 'Format nomor HP tidak valid';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.bukti_ktp) {
      newErrors.bukti_ktp = 'Foto KTP wajib diupload';
    }

    if (!formData.bukti_kepemilikan) {
      newErrors.bukti_kepemilikan = 'Bukti kepemilikan wajib diupload';
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi wajib diisi';
    } else if (formData.deskripsi.length < 10) {
      newErrors.deskripsi = 'Deskripsi minimal 10 karakter';
    }

    if (!termsAccepted) {
      newErrors.terms = 'Anda harus menyetujui syarat dan ketentuan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Mohon lengkapi form dengan benar');
      return;
    }

    setSubmitting(true);

    try {
      const response = await klaimAPI.create({
        barang_id: id,
        ...formData,
      });

      toast.success('Klaim berhasil diajukan!');
      navigate(`/klaim/success/${response.data.data.id}`);
    } catch (error) {
      console.error('Submit failed:', error);
      const message = error.response?.data?.message || 'Gagal mengajukan klaim';
      toast.error(message);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSubmitting(false);
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
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Ajukan Klaim</h1>
              <p className="text-sm text-gray-500">Klaim barang yang Anda miliki</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Barang Info */}
          <div className="card p-6 flex items-center gap-6">
            {barang.foto?.[0] ? (
              <img
                src={barang.foto[0].thumbnail || barang.foto[0].url}
                alt={barang.nama}
                className="w-24 h-24 rounded-xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-xl">{barang.nama}</h3>
              <p className="text-gray-500 mt-2">
                {barang.kategori?.icon} {barang.kategori?.nama}
              </p>
              <p className="text-gray-500 mt-1">
                📍 Ditemukan di: {barang.stasiun?.nama}
              </p>
            </div>
          </div>

          {/* Form - Identitas */}
          <div className="card p-8 space-y-6">
            <h2 className="text-xl font-bold">Identitas Pengklaim</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Nama */}
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama_pengklaim"
                  value={formData.nama_pengklaim}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className={cn('input py-3', errors.nama_pengklaim && 'input-error')}
                />
                {errors.nama_pengklaim && (
                  <p className="mt-1 text-sm text-red-500">{errors.nama_pengklaim}</p>
                )}
              </div>

              {/* No HP */}
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Nomor HP *
                </label>
                <input
                  type="tel"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className={cn('input py-3', errors.no_hp && 'input-error')}
                />
                {errors.no_hp && (
                  <p className="mt-1 text-sm text-red-500">{errors.no_hp}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="label flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@contoh.com"
                className={cn('input py-3', errors.email && 'input-error')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* No Tiket (KA only) */}
            {barang.tipe_transport === 'KA_JARAK_JAUH' && (
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  Nomor Tiket KA
                </label>
                <input
                  type="text"
                  name="no_tiket"
                  value={formData.no_tiket}
                  onChange={handleChange}
                  placeholder="Masukkan nomor tiket (jika ada)"
                  className="input py-3"
                />
              </div>
            )}
          </div>

          {/* Bukti Kepemilikan */}
          <div className="card p-8 space-y-6">
            <h2 className="text-xl font-bold">Bukti Kepemilikan</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload KTP */}
              <div className="space-y-2">
                <label className="label">Foto KTP/SIM *</label>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                    errors.bukti_ktp
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:border-kai-primary',
                    formData.bukti_ktp && 'border-green-500 bg-green-50'
                  )}
                >
                  {uploading.ktp ? (
                    <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto" />
                  ) : formData.bukti_ktp ? (
                    <div>
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-600 font-medium">KTP berhasil diupload</p>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, bukti_ktp: '' }))}
                        className="text-sm text-red-500 hover:underline mt-3"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Klik untuk upload KTP</p>
                      <p className="text-xs text-gray-400 mt-2">JPEG, PNG (max 5MB)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(e, 'ktp')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.bukti_ktp && (
                  <p className="mt-2 text-sm text-red-500">{errors.bukti_ktp}</p>
                )}
              </div>

              {/* Upload Bukti */}
              <div className="space-y-2">
                <label className="label">Bukti Kepemilikan *</label>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                    errors.bukti_kepemilikan
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:border-kai-primary',
                    formData.bukti_kepemilikan && 'border-green-500 bg-green-50'
                  )}
                >
                  {uploading.bukti ? (
                    <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto" />
                  ) : formData.bukti_kepemilikan ? (
                    <div>
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-600 font-medium">Bukti berhasil diupload</p>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, bukti_kepemilikan: '' }))}
                        className="text-sm text-red-500 hover:underline mt-3"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Foto barang atau nota pembelian</p>
                      <p className="text-xs text-gray-400 mt-2">JPEG, PNG (max 5MB)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(e, 'bukti')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.bukti_kepemilikan && (
                  <p className="mt-2 text-sm text-red-500">{errors.bukti_kepemilikan}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-blue-700">
                💡 <strong>Tips:</strong> Upload foto barang dari berbagai sudut dan nota pembelian untuk memperkuat klaim Anda
              </p>
            </div>
          </div>

          {/* Deskripsi Barang */}
          <div className="card p-8 space-y-6">
            <h2 className="text-xl font-bold">Deskripsi Barang</h2>

            <div className="space-y-2">
              <label className="label flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Deskripsi Ciri-ciri Barang *
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={5}
                placeholder="Jelaskan ciri-ciri barang Anda secara detail. Semakin spesifik, semakin besar peluang klaim disetujui."
                className={cn('input py-3', errors.deskripsi && 'input-error')}
              />
              {errors.deskripsi && (
                <p className="mt-2 text-sm text-red-500">{errors.deskripsi}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="label">Warna</label>
                <input
                  type="text"
                  name="warna_barang"
                  value={formData.warna_barang}
                  onChange={handleChange}
                  placeholder="Warna barang"
                  className="input py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="label">Ciri Khas</label>
                <input
                  type="text"
                  name="ciri_khas_barang"
                  value={formData.ciri_khas_barang}
                  onChange={handleChange}
                  placeholder="Contoh: ada goresan di sisi kanan"
                  className="input py-3"
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="card p-8">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (e.target.checked) {
                    setErrors((prev) => ({ ...prev, terms: '' }));
                  }
                }}
                className="mt-1 w-6 h-6 rounded border-gray-300 text-kai-primary focus:ring-kai-primary"
              />
              <div>
                <p className="font-semibold text-lg">Syarat dan Ketentuan</p>
                <p className="text-gray-600 mt-3 leading-relaxed">
                  Saya menyatakan bahwa data yang saya berikan adalah benar dan saya adalah
                  pemilik sah dari barang yang diklaim. Saya bersedia datang ke stasiun untuk
                  melakukan verifikasi identitas dan pengambilan barang.
                </p>
              </div>
            </label>
            {errors.terms && (
              <p className="mt-3 text-sm text-red-500">{errors.terms}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-outline flex-1 py-4 text-base"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 py-4 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Mengajukan...
                </>
              ) : (
                'Ajukan Klaim'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

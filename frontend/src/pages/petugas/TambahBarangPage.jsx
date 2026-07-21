import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronLeft, Loader2, Upload, Trash2, Star } from 'lucide-react';
import { barangAPI, kategoriAPI, stationsAPI, uploadAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function TambahBarangPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for edit mode
  const isEditMode = !!id; // Check if we're editing

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [barangData, setBarangData] = useState(null); // Store original barang data for edit
  const [kategori, setKategori] = useState([]);
  const [stations, setStations] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]); // Track deleted photos in edit mode

  const [formData, setFormData] = useState({
    tipe_transport: 'KRL',
    nama: '',
    kategori_id: '',
    warna: '',
    deskripsi: '',
    ciri_khas: '',
    jalur: '',
    tujuan: '',
    stasiun_id: '',
    no_kereta: '',
    nama_kereta: '',
    relasi: '',
    gerbong: '',
    kursi: '',
    tanggal_perjalanan: '',
    lokasi_penyimpanan: '',
    ditemukan_at: new Date().toISOString().slice(0, 16),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kategoriRes, stationsRes] = await Promise.all([
        kategoriAPI.getAll(),
        stationsAPI.getAll(),
      ]);

      setKategori(kategoriRes.data.data);

      const allStations = stationsRes.data.data;
      const krlStations = allStations.filter(
        (s) => s.tipe.includes('KRL') || s.tipe.includes('KEDUA')
      );
      const kaStations = allStations.filter(
        (s) => s.tipe.includes('KA_JARAK_JAUH') || s.tipe.includes('KEDUA')
      );

      setStations({ KRL: krlStations, KA_JARAK_JAUH: kaStations });

      // If edit mode, fetch barang data
      if (isEditMode && id) {
        const barangRes = await barangAPI.getById(id);
        const barang = barangRes.data.data;
        setBarangData(barang);

        // Populate form with existing data
        setFormData({
          tipe_transport: barang.tipe_transport || 'KRL',
          nama: barang.nama || '',
          kategori_id: barang.kategori_id || '',
          warna: barang.warna || '',
          deskripsi: barang.deskripsi || '',
          ciri_khas: barang.ciri_khas || '',
          jalur: barang.jalur || '',
          tujuan: barang.tujuan || '',
          stasiun_id: barang.stasiun_id || '',
          no_kereta: barang.no_kereta || '',
          nama_kereta: barang.nama_kereta || '',
          relasi: barang.relasi || '',
          gerbong: barang.gerbong || '',
          kursi: barang.kursi || '',
          tanggal_perjalanan: barang.tanggal_perjalanan?.split('T')[0] || '',
          lokasi_penyimpanan: barang.lokasi_penyimpanan || '',
          ditemukan_at: barang.ditemukan_at ? new Date(barang.ditemukan_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        });

        // Load existing photos
        if (barang.foto && barang.foto.length > 0) {
          setPhotos(barang.foto.map(f => ({
            id: f.id,
            url: f.url,
            thumbnail: f.thumbnail,
            preview: f.thumbnail || f.url,
            isPrimary: f.is_primary,
            isExisting: true, // Mark as existing photo
          })));
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTipeChange = (tipe) => {
    setFormData((prev) => ({
      ...prev,
      tipe_transport: tipe,
      stasiun_id: '',
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama barang wajib diisi';
    }
    if (!formData.kategori_id) {
      newErrors.kategori_id = 'Kategori wajib dipilih';
    }
    if (!formData.stasiun_id) {
      newErrors.stasiun_id = 'Stasiun wajib dipilih';
    }
    if (!formData.lokasi_penyimpanan?.trim()) {
      newErrors.lokasi_penyimpanan = 'Lokasi penyimpanan wajib diisi';
    }
    if (formData.tipe_transport === 'KRL') {
      if (!formData.jalur?.trim()) newErrors.jalur = 'Jalur wajib diisi';
      if (!formData.tujuan?.trim()) newErrors.tujuan = 'Tujuan wajib diisi';
    }
    if (formData.tipe_transport === 'KA_JARAK_JAUH') {
      if (!formData.nama_kereta?.trim()) newErrors.nama_kereta = 'Nama kereta wajib diisi';
      if (!formData.gerbong?.trim()) newErrors.gerbong = 'Nomor gerbong wajib diisi';
      if (!formData.kursi?.trim()) newErrors.kursi = 'Nomor kursi wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (photos.length + files.length > 5) {
      toast.error('Maksimal 5 foto');
      return;
    }

    const newPhotos = files.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      preview: URL.createObjectURL(file),
      file: file,
      isPrimary: photos.length === 0 && idx === 0,
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    toast.success(`${files.length} foto ditambahkan`);
    e.target.value = '';
  };

  const removePhoto = (photoId) => {
    const photoToRemove = photos.find(p => p.id === photoId);
    if (photoToRemove?.preview) {
      URL.revokeObjectURL(photoToRemove.preview);
    }

    // If it's an existing photo, track it for deletion
    if (photoToRemove?.isExisting) {
      setDeletedPhotoIds(prev => [...prev, photoId]);
    }

    const newPhotos = photos.filter(p => p.id !== photoId);
    if (newPhotos.length > 0 && !newPhotos.some(p => p.isPrimary)) {
      newPhotos[0].isPrimary = true;
    }
    setPhotos(newPhotos);
  };

  const setAsPrimary = (photoId) => {
    setPhotos(prev => prev.map(p => ({
      ...p,
      isPrimary: p.id === photoId,
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Mohon lengkapi form dengan benar');
      return;
    }

    setLoading(true);

    try {
      let barang;

      if (isEditMode) {
        // UPDATE mode
        const response = await barangAPI.update(id, formData);
        barang = response.data.data;
        toast.success('Barang berhasil diperbarui');

        // Delete removed photos
        if (deletedPhotoIds.length > 0) {
          for (const photoId of deletedPhotoIds) {
            try {
              await uploadAPI.deleteFoto(photoId);
            } catch (deleteError) {
              console.error('Failed to delete photo:', deleteError);
            }
          }
        }
      } else {
        // CREATE mode
        const response = await barangAPI.create(formData);
        barang = response.data.data;
        toast.success('Barang berhasil ditambahkan');
      }

      // Upload new photos (only in create mode, or new photos in edit mode)
      const newPhotos = photos.filter(p => !p.isExisting && p.file);
      if (newPhotos.length > 0) {
        const formDataUpload = new FormData();
        formDataUpload.append('barang_id', barang.id);
        newPhotos.forEach(photo => {
          if (photo.file) {
            formDataUpload.append('files', photo.file);
          }
        });

        try {
          await uploadAPI.uploadFoto(formDataUpload);
          toast.success(isEditMode ? 'Barang & foto baru berhasil disimpan!' : 'Barang dan foto berhasil disimpan!');
        } catch (uploadError) {
          console.error('Photo upload failed:', uploadError);
          toast.success('Barang berhasil disimpan (foto baru gagal upload)');
        }
      }

      navigate('/petugas/daftar-barang');
    } catch (error) {
      console.error('Submit failed:', error);
      const message = error.response?.data?.message || 'Gagal menyimpan barang';
      toast.error(message);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-kai-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">
              {isEditMode ? 'Edit Barang' : 'Tambah Barang Ditemukan'}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipe Transport */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Tipe Transportasi</h2>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => handleTipeChange('KRL')}
                className={cn('p-4 rounded-xl border-2 transition-all', formData.tipe_transport === 'KRL' ? 'border-kai-primary bg-kai-primary/5' : 'border-gray-200 hover:border-gray-300')}>
                <div className="text-3xl mb-2">🚇</div>
                <div className="font-medium">KRL Commuter Line</div>
                <div className="text-sm text-gray-500">KAI Commuter</div>
              </button>
              <button type="button" onClick={() => handleTipeChange('KA_JARAK_JAUH')}
                className={cn('p-4 rounded-xl border-2 transition-all', formData.tipe_transport === 'KA_JARAK_JAUH' ? 'border-kai-primary bg-kai-primary/5' : 'border-gray-200 hover:border-gray-300')}>
                <div className="text-3xl mb-2">🚂</div>
                <div className="font-medium">Kereta Api Jarak Jauh</div>
                <div className="text-sm text-gray-500">KA Indonesia</div>
              </button>
            </div>
          </div>

          {/* Info Barang */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Barang</h2>
            <div className="grid gap-4">
              <div>
                <label className="label">Nama Barang *</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange}
                  placeholder="Contoh: Tas Ransel Hitam"
                  className={cn('input', errors.nama && 'input-error')} />
                {errors.nama && <p className="mt-1 text-sm text-red-500">{errors.nama}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Kategori *</label>
                  <select name="kategori_id" value={formData.kategori_id} onChange={handleChange}
                    className={cn('input', errors.kategori_id && 'input-error')}>
                    <option value="">Pilih Kategori</option>
                    {kategori.map((k) => (
                      <option key={k.id} value={k.id}>{k.icon} {k.nama}</option>
                    ))}
                  </select>
                  {errors.kategori_id && <p className="mt-1 text-sm text-red-500">{errors.kategori_id}</p>}
                </div>

                <div>
                  <label className="label">Warna</label>
                  <input type="text" name="warna" value={formData.warna} onChange={handleChange}
                    placeholder="Contoh: Hitam, Merah" className="input" />
                </div>
              </div>

              <div>
                <label className="label">Deskripsi</label>
                <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange}
                  rows={3} placeholder="Deskripsi lengkap barang..." className="input" />
              </div>

              <div>
                <label className="label">Ciri Khas</label>
                <textarea name="ciri_khas" value={formData.ciri_khas} onChange={handleChange}
                  rows={2} placeholder="Ciri khusus barang (misal: ada goresan, stiker, dll)" className="input" />
              </div>
            </div>
          </div>

          {/* Foto */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Foto Barang</h2>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
              <input type="file" id="photo-upload" accept="image/*" multiple onChange={handlePhotoChange}
                className="hidden" disabled={photos.length >= 5} />
              <label htmlFor="photo-upload" className={cn('cursor-pointer flex flex-col items-center', photos.length >= 5 && 'opacity-50 cursor-not-allowed')}>
                <Upload className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-500">Klik untuk upload foto (max 5)</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, atau WebP</p>
              </label>
            </div>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-5 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                      <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 flex gap-1">
                        {!photo.isPrimary && (
                          <button type="button" onClick={() => setAsPrimary(photo.id)}
                            className="p-1 bg-white text-gray-600 rounded-full hover:bg-gray-100 shadow">
                            <Star className="h-3 w-3" />
                          </button>
                        )}
                        <button type="button" onClick={() => removePhoto(photo.id)}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {photo.isPrimary && (
                        <div className="absolute bottom-0 left-0 right-0 bg-kai-primary text-white text-xs text-center py-1">
                          Utama
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lokasi & Waktu */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Lokasi & Waktu Ditemukan</h2>
            <div className="grid gap-4">
              <div>
                <label className="label">Stasiun *</label>
                <select name="stasiun_id" value={formData.stasiun_id} onChange={handleChange}
                  className={cn('input', errors.stasiun_id && 'input-error')}>
                  <option value="">Pilih Stasiun</option>
                  {stations[formData.tipe_transport]?.map((s) => (
                    <option key={s.id} value={s.id}>{s.kode} - {s.nama}</option>
                  ))}
                </select>
                {errors.stasiun_id && <p className="mt-1 text-sm text-red-500">{errors.stasiun_id}</p>}
              </div>

              <div>
                <label className="label">Lokasi Penyimpanan *</label>
                <input type="text" name="lokasi_penyimpanan" value={formData.lokasi_penyimpanan}
                  onChange={handleChange} placeholder="Contoh: Ruang barang hilang Lantai 2"
                  className={cn('input', errors.lokasi_penyimpanan && 'input-error')} />
                {errors.lokasi_penyimpanan && <p className="mt-1 text-sm text-red-500">{errors.lokasi_penyimpanan}</p>}
              </div>

              <div>
                <label className="label">Tanggal & Waktu Ditemukan *</label>
                <input type="datetime-local" name="ditemukan_at" value={formData.ditemukan_at}
                  onChange={handleChange} className="input" />
              </div>
            </div>
          </div>

          {/* KRL Specific */}
          {formData.tipe_transport === 'KRL' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Informasi Perjalanan KRL</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Jalur *</label>
                  <input type="text" name="jalur" value={formData.jalur} onChange={handleChange}
                    placeholder="Contoh: KRL Lingkar Dalam"
                    className={cn('input', errors.jalur && 'input-error')} />
                  {errors.jalur && <p className="mt-1 text-sm text-red-500">{errors.jalur}</p>}
                </div>
                <div>
                  <label className="label">Tujuan *</label>
                  <input type="text" name="tujuan" value={formData.tujuan} onChange={handleChange}
                    placeholder="Contoh: Jakarta Kota - Manggarai"
                    className={cn('input', errors.tujuan && 'input-error')} />
                  {errors.tujuan && <p className="mt-1 text-sm text-red-500">{errors.tujuan}</p>}
                </div>
              </div>
            </div>
          )}

          {/* KA Specific */}
          {formData.tipe_transport === 'KA_JARAK_JAUH' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Informasi Perjalanan KA</h2>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nama Kereta *</label>
                    <input type="text" name="nama_kereta" value={formData.nama_kereta} onChange={handleChange}
                      placeholder="Contoh: Argo Bromo Anggrek"
                      className={cn('input', errors.nama_kereta && 'input-error')} />
                    {errors.nama_kereta && <p className="mt-1 text-sm text-red-500">{errors.nama_kereta}</p>}
                  </div>
                  <div>
                    <label className="label">Nomor Kereta</label>
                    <input type="text" name="no_kereta" value={formData.no_kereta} onChange={handleChange}
                      placeholder="Contoh: KA101" className="input" />
                  </div>
                </div>

                <div>
                  <label className="label">Relasi</label>
                  <input type="text" name="relasi" value={formData.relasi} onChange={handleChange}
                    placeholder="Contoh: Jakarta Gambir - Surabaya Gubeng" className="input" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Gerbong *</label>
                    <input type="text" name="gerbong" value={formData.gerbong} onChange={handleChange}
                      placeholder="Contoh: 7" className={cn('input', errors.gerbong && 'input-error')} />
                    {errors.gerbong && <p className="mt-1 text-sm text-red-500">{errors.gerbong}</p>}
                  </div>
                  <div>
                    <label className="label">Kursi *</label>
                    <input type="text" name="kursi" value={formData.kursi} onChange={handleChange}
                      placeholder="Contoh: 21A" className={cn('input', errors.kursi && 'input-error')} />
                    {errors.kursi && <p className="mt-1 text-sm text-red-500">{errors.kursi}</p>}
                  </div>
                  <div>
                    <label className="label">Tanggal Perjalanan</label>
                    <input type="date" name="tanggal_perjalanan" value={formData.tanggal_perjalanan}
                      onChange={handleChange} className="input" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-outline flex-1 py-3">
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Menyimpan...</>
              ) : isEditMode ? 'Perbarui Barang' : 'Simpan Barang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // CREATE STATIONS
  // ============================================
  console.log('📍 Creating stations...');

  const stations = await Promise.all([
    prisma.station.create({
      data: {
        kode: 'JAKK',
        nama: 'Jakarta Kota',
        tipe: ['KRL', 'KA_JARAK_JAUH'],
        lokasi: 'Jakarta Barat',
        alamat: 'Jl. Estação Kota, Jakarta Barat 11110',
      },
    }),
    prisma.station.create({
      data: {
        kode: 'GMR',
        nama: 'Gambir',
        tipe: ['KA_JARAK_JAUH'],
        lokasi: 'Jakarta Pusat',
        alamat: 'Jl. Merdeka Timur 1-3, Jakarta Pusat 10110',
      },
    }),
    prisma.station.create({
      data: {
        kode: 'BD',
        nama: 'Bandung',
        tipe: ['KRL', 'KA_JARAK_JAUH'],
        lokasi: 'Bandung',
        alamat: 'Jl. Kebon Kawung No.1, Bandung 40116',
      },
    }),
    prisma.station.create({
      data: {
        kode: 'SUD',
        nama: 'Sudirman',
        tipe: ['KRL'],
        lokasi: 'Jakarta Pusat',
        alamat: 'Jl. Jl. Jend Sudirman, Jakarta Pusat',
      },
    }),
    prisma.station.create({
      data: {
        kode: 'THB',
        nama: 'Tanah Abang',
        tipe: ['KRL'],
        lokasi: 'Jakarta Pusat',
        alamat: 'Jl. Tanah Abang Timur, Jakarta Pusat',
      },
    }),
    prisma.station.create({
      data: {
        kode: 'MRI',
        nama: 'Manggarai',
        tipe: ['KRL'],
        lokasi: 'Jakarta Selatan',
        alamat: 'Jl. Cilacap No.1, Jakarta Selatan 12860',
      },
    }),
    prisma.station.create({
      data: {
        kode: 'PSE',
        nama: 'Pasar Senen',
        tipe: ['KA_JARAK_JAUH'],
        lokasi: 'Jakarta Pusat',
        alamat: 'Jl. Pasar Senen, Jakarta Pusat',
      },
    }),
    prisma.station.create({
      data: {
        kode: 'YOG',
        nama: 'Yogyakarta',
        tipe: ['KA_JARAK_JAUH'],
        lokasi: 'Yogyakarta',
        alamat: 'Jl. Utama No.1, Yogyakarta 55241',
      },
    }),
  ]);

  console.log(`✅ Created ${stations.length} stations`);

  // ============================================
  // CREATE KATEGORI
  // ============================================
  console.log('📦 Creating categories...');

  const kategoriData = [
    { nama: 'Elektronik', deskripsi: 'Laptop, HP, Kamera, dll', icon: '📱', masa_simpan: 90 },
    { nama: 'Tas', deskripsi: 'Tas ransel, tas tangan, koper', icon: '🎒', masa_simpan: 60 },
    { nama: 'Dompet', deskripsi: 'Dompet, purse, cardholder', icon: '👛', masa_simpan: 30 },
    { nama: 'Dokumen', deskripsi: 'KTP, SIM, Passport, dll', icon: '📄', masa_simpan: 180 },
    { nama: 'Pakaian', deskripsi: 'Jaket, Baju, Celana, dll', icon: '👕', masa_simpan: 30 },
    { nama: 'Aksesoris', deskripsi: 'Jam tangan, perhiasan, kacamata', icon: '⌚', masa_simpan: 60 },
    { nama: 'Buku & Alat Tulis', deskripsi: 'Buku, pulpen, tas', icon: '📚', masa_simpan: 30 },
    { nama: 'Makanan & Minuman', deskripsi: 'Makanan, minuman dalam kontainer', icon: '🍱', masa_simpan: 7 },
    { nama: 'Barang Berbahaya', deskripsi: 'Barang yang tidak boleh disimpan', icon: '⚠️', masa_simpan: 1 },
    { nama: 'Lainnya', deskripsi: 'Barang yang tidak termasuk kategori lain', icon: '📦', masa_simpan: 30 },
  ];

  const kategori = await Promise.all(
    kategoriData.map((k) =>
      prisma.kategori.create({
        data: k,
      })
    )
  );

  console.log(`✅ Created ${kategori.length} categories`);

  // ============================================
  // CREATE USERS
  // ============================================
  console.log('👥 Creating users...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Admin Pusat
  const adminPusat = await prisma.user.create({
    data: {
      email: 'admin@kai.id',
      password: hashedPassword,
      nama: 'Admin Pusat KAI',
      role: 'ADMIN_PUSAT',
      no_hp: '081234567890',
    },
  });

  // Admin Stasiun Jakarta Kota
  const adminStasiun1 = await prisma.user.create({
    data: {
      email: 'admin.jakk@kai.id',
      password: hashedPassword,
      nama: 'Admin Stasiun Jakarta Kota',
      role: 'ADMIN_STASIUN',
      no_hp: '081234567891',
      stasiun_id: stations[0].id,
    },
  });

  // Admin Stasiun Bandung
  const adminStasiun2 = await prisma.user.create({
    data: {
      email: 'admin.bd@kai.id',
      password: hashedPassword,
      nama: 'Admin Stasiun Bandung',
      role: 'ADMIN_STASIUN',
      no_hp: '081234567892',
      stasiun_id: stations[2].id,
    },
  });

  // Petugas KRL
  const petugas1 = await prisma.user.create({
    data: {
      email: 'petugas.krl@kai.id',
      password: hashedPassword,
      nama: 'Petugas KRL Jakarta',
      role: 'PETUGAS',
      no_hp: '081234567893',
      stasiun_id: stations[3].id, // Sudirman
    },
  });

  // Petugas KA
  const petugas2 = await prisma.user.create({
    data: {
      email: 'petugas.ka@kai.id',
      password: hashedPassword,
      nama: 'Petugas Kereta Api Gambir',
      role: 'PETUGAS',
      no_hp: '081234567894',
      stasiun_id: stations[1].id, // Gambir
    },
  });

  // Penumpang (demo user)
  const penumpang = await prisma.user.create({
    data: {
      email: 'penumpang@example.com',
      password: hashedPassword,
      nama: 'Demo Penumpang',
      role: 'PENUMPANG',
      no_hp: '081234567895',
    },
  });

  console.log('✅ Created 6 users');

  // ============================================
  // CREATE SAMPLE BARANG
  // ============================================
  console.log('📦 Creating sample barang...');

  // Sample barang KRL
  const barangKRL = await prisma.barang.create({
    data: {
      kode: 'BRG-2026-0001',
      nama: 'Laptop MacBook Pro 14 inch',
      kategori_id: kategori[0].id, // Elektronik
      warna: 'Space Gray',
      deskripsi: 'Laptop Apple MacBook Pro 14 inch warna space gray. Terdapat stiker kecil di bagian atas keyboard.',
      ciri_khas: 'Stiker kecil berwarna biru di keyboard, ada goresan kecil di bagian belakang layar',
      tipe_transport: 'KRL',
      jalur: 'KRL Lingkar Dalam',
      tujuan: 'Jakarta Kota - Manggarai',
      stasiun_id: stations[3].id, // Sudirman
      lokasi_penyimpanan: 'Ruang barang hilang Lantai 2, dekat pintu masuk utama',
      status: 'AKTIF',
      ditemukan_at: new Date('2026-07-18T14:30:00Z'),
      created_by: petugas1.id,
    },
  });

  // Add foto for barang KRL
  await prisma.barangFoto.create({
    data: {
      barang_id: barangKRL.id,
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
      is_primary: true,
    },
  });

  // Sample barang KA Jarak Jauh
  const barangKA = await prisma.barang.create({
    data: {
      kode: 'BRG-2026-0002',
      nama: 'Tas Ransel Hitam',
      kategori_id: kategori[1].id, // Tas
      warna: 'Hitam',
      deskripsi: 'Tas ransel warna hitam merk Eiger, ukuran sedang. Ada tali pengikat warna orange di samping.',
      ciri_khas: 'Tali pengikat warna orange di samping kanan, logo Eiger di bagian depan',
      tipe_transport: 'KA_JARAK_JAUH',
      no_kereta: 'KA101',
      nama_kereta: 'Argo Bromo Anggrek',
      relasi: 'Jakarta Gambir - Surabaya Gubeng',
      gerbong: '7',
      kursi: '21A',
      stasiun_id: stations[1].id, // Gambir
      lokasi_penyimpanan: 'Ruang barang hilang Depan Pintu 3, Lantai 1',
      status: 'AKTIF',
      ditemukan_at: new Date('2026-07-19T08:15:00Z'),
      created_by: petugas2.id,
    },
  });

  // Add foto for barang KA
  await prisma.barangFoto.create({
    data: {
      barang_id: barangKA.id,
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
      is_primary: true,
    },
  });

  // Another sample - Dompet
  const barangDompet = await prisma.barang.create({
    data: {
      kode: 'BRG-2026-0003',
      nama: 'Dompet Kulit Warna Coklat',
      kategori_id: kategori[2].id, // Dompet
      warna: 'Coklat',
      deskripsi: 'Dompet kulit warna coklat tua, merk Coach. Terdapat uang cash dan beberapa kartu di dalamnya.',
      ciri_khas: 'Logo Coach di bagian depan, ada noda kecil di sudut kanan atas',
      tipe_transport: 'KRL',
      jalur: 'KRL Tanah Abang - Jakarta Kota',
      tujuan: 'Tanah Abang - Jakarta Kota',
      stasiun_id: stations[4].id, // Tanah Abang
      lokasi_penyimpanan: 'Loket Informasi Utama',
      status: 'AKTIF',
      ditemukan_at: new Date('2026-07-20T09:00:00Z'),
      created_by: petugas1.id,
    },
  });

  await prisma.barangFoto.create({
    data: {
      barang_id: barangDompet.id,
      url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=200',
      is_primary: true,
    },
  });

  console.log('✅ Created 3 sample barang');

  // ============================================
  // CREATE SAMPLE KLAIM (VERIFIKASI KLAIM)
  // ============================================
  console.log('📋 Creating sample klaim...');

  // Klaim 1 - PENDING (Laptop MacBook)
  const klaim1 = await prisma.klaim.create({
    data: {
      barang_id: barangKRL.id,
      user_id: penumpang.id,
      nama_pengklaim: 'Budi Santoso',
      no_hp: '081234567896',
      email: 'budi.santoso@email.com',
      bukti_ktp: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400',
      bukti_kepemilikan: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      deskripsi: 'Laptop MacBook Pro 14 inch Space Gray milik saya. Saya tinggalkan di kursi nomor 12 saat perjalanan dari Sudirman ke Manggarai sekitar jam 14.00.',
      warna_barang: 'Space Gray',
      ciri_khas_barang: 'Terdapat stiker kecil berwarna biru di keyboard dan goresan kecil di bagian belakang layar',
      status: 'PENDING',
    },
  });

  // Klaim 2 - PENDING (Tas Ransel)
  const klaim2 = await prisma.klaim.create({
    data: {
      barang_id: barangKA.id,
      user_id: penumpang.id,
      nama_pengklaim: 'Siti Nurhaliza',
      no_hp: '081234567897',
      email: 'siti.nurhaliza@email.com',
      no_tiket: 'KA101-2026-0720-0001',
      bukti_ktp: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400',
      bukti_kepemilikan: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      deskripsi: 'Tas ransel hitam merk Eiger yang saya tinggalkan di gerbong 7 kursi 21A saat perjalanan dari Jakarta Gambir ke Bandung. Di dalam tas ada laptop dan beberapa dokumen penting.',
      warna_barang: 'Hitam',
      ciri_khas_barang: 'Tali pengikat warna orange di samping kanan dan logo Eiger di bagian depan tas',
      status: 'PENDING',
    },
  });

  // Klaim 3 - APPROVED (Dompet)
  const klaim3 = await prisma.klaim.create({
    data: {
      barang_id: barangDompet.id,
      user_id: penumpang.id,
      nama_pengklaim: 'Ahmad Wijaya',
      no_hp: '081234567898',
      email: 'ahmad.wijaya@email.com',
      bukti_ktp: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400',
      bukti_kepemilikan: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
      deskripsi: 'Dompet kulit warna coklat tua merk Coach yang jatuh dari saku celana saat saya turun di Stasiun Tanah Abang.',
      warna_barang: 'Coklat Tua',
      ciri_khas_barang: 'Logo Coach di bagian depan dan ada noda kecil di sudut kanan atas',
      status: 'APPROVED',
      verified_by: adminStasiun1.id,
      verified_at: new Date('2026-07-20T15:30:00Z'),
      kode_verifikasi: 'XYZ789',
    },
  });

  // Klaim 4 - REJECTED (contoh yang ditolak)
  const klaim4 = await prisma.klaim.create({
    data: {
      barang_id: barangKRL.id,
      user_id: penumpang.id,
      nama_pengklaim: 'Dewi Lestari',
      no_hp: '081234567899',
      email: 'dewi.lestari@email.com',
      bukti_ktp: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400',
      bukti_kepemilikan: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      deskripsi: 'Laptop silver yang hilang di KRL. Saya tidak ingat detail ciri-cirinya tapi mungkin laptop saya.',
      warna_barang: 'Silver',
      ciri_khas_barang: 'Tidak ada informasi khusus',
      status: 'REJECTED',
      verified_by: adminStasiun1.id,
      verified_at: new Date('2026-07-19T10:00:00Z'),
      alasan_tolak: 'Deskripsi barang tidak cocok dengan yang ditemukan. Ciri khas yang disebutkan berbeda (warna silver vs space gray, tidak ada stiker).',
    },
  });

  console.log('✅ Created 4 sample klaim');

  // ============================================
  // CREATE SAMPLE NOTIFIKASI
  // ============================================
  console.log('🔔 Creating sample notifications...');

  await prisma.notifikasi.create({
    data: {
      user_id: adminPusat.id,
      judul: 'Barang Baru Ditemukan',
      pesan: 'Laptop MacBook Pro 14 inch ditemukan di Stasiun Sudirman',
      type: 'INFO',
    },
  });

  await prisma.notifikasi.create({
    data: {
      user_id: adminStasiun1.id,
      judul: 'Barang Baru Ditemukan',
      pesan: 'Tas ransel hitam ditemukan di Stasiun Jakarta Kota',
      type: 'INFO',
    },
  });

  console.log('✅ Created sample notifications');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n═══════════════════════════════════════');
  console.log('          ✅ SEED COMPLETE!');
  console.log('═══════════════════════════════════════');
  console.log('\n📊 Data Created:');
  console.log(`   • ${stations.length} Stations`);
  console.log(`   • ${kategori.length} Categories`);
  console.log('   • 6 Users');
  console.log('   • 3 Sample Barang');
  console.log('   • 4 Sample Klaim');
  console.log('\n🔐 Login Credentials:');
  console.log('   Admin Pusat:    admin@kai.id / password123');
  console.log('   Admin Stasiun:  admin.jakk@kai.id / password123');
  console.log('   Petugas KRL:    petugas.krl@kai.id / password123');
  console.log('   Petugas KA:     petugas.ka@kai.id / password123');
  console.log('   Penumpang:      penumpang@example.com / password123');
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

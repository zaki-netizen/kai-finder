# PRD - Product Requirements Document

## Lost and Found PT KAI (KAI Finder)

---

## 📋 Informasi Proyek

| Item | Detail |
|------|--------|
| **Nama Proyek** | KAI Finder - Sistem Lost and Found PT KAI |
| **Versi** | v2.1 |
| **Tanggal** | 20 Juli 2026 |
| **Status** | 🟢 Dalam Development |
| **Tipe** | Web Application |
| **Tujuan** | Proyek Kuliah |

---

## 🎯 Ringkasan Proyek

Sistem informasi berbasis web untuk mengelola barang hilang/ditemukan di stasiun KRL Commuter Line dan Kereta Api Jarak Jauh PT KAI. Sistem ini menghubungkan petugas yang menemukan barang dengan penumpang yang kehilangan.

---

## 👥 Pengguna Sistem

| Role | Deskripsi | Akses |
|------|-----------|-------|
| **Petugas** | Staff yang menemukan & menginput barang | Input barang, update status |
| **Penumpang** | Pengguna yang mencari & mengklaim barang | Pencarian, ajukan klaim |
| **Admin Stasiun** | Admin di level stasiun | Verifikasi klaim, manage barang stasiun |
| **Admin Pusat** | Admin PT KAI pusat | Full access, laporan, statistik |

---

## 📊 Progress Tracker

```
MVP Features (Wajib):
[x] 100% - Auth & RBAC
[x] 100% - CRUD Barang KRL
[x] 100% - CRUD Barang KA
[x] 100% - Search & Filter
[x] 100% - Sistem Klaim
[x] 100% - Dashboard Admin
[x] 100% - Upload Foto
[x] 100% - Notifikasi
[x] 100% - Kelola Barang (Admin)
[x] 100% - Kelola Petugas (Admin)
[x] 100% - Laporan & Statistik (Admin)
[x] 100% - Log Aktivitas (Admin)
[x] 100% - Pengaturan (Admin)

Enhancement Features:
[x] 80%  - QR Code System
[ ] 0%   - Peta Interaktif
[ ] 0%   - "Kemungkinan Milik Saya"
[ ] 0%   - PWA Support
[ ] 0%   - Dark Mode
[ ] 0%   - WhatsApp Notification
[ ] 0%   - Cloudinary Upload
```

---

## ✅ Fitur Core - SUDAH SELESAI

### [x] 1. Sistem Autentikasi & Otorisasi
- [x] Registrasi & Login multi-role
- [x] JWT Authentication dengan Refresh Token
- [x] Role-Based Access Control (RBAC)
- [x] Session management
- [x] Change password

### [x] 2. Modul KRL Commuter Line

#### 2.1 Input Barang (Petugas)
- [x] Form input barang ditemukan
- [x] Upload multi-foto
- [x] Kategori barang
- [x] Informasi perjalanan (jalur, tujuan, tanggal/waktu)
- [x] Lokasi ditemukan (stasiun)
- [x] Lokasi penyimpanan
- [x] Status barang (aktif, diklaim, diambil)
- [x] Ciri khas barang

#### 2.2 Dashboard Pencarian (Penumpang)
- [x] Pencarian dengan filter (nama, kategori, tanggal, jalur, tujuan, stasiun, warna)
- [x] Pagination
- [x] Grid view & list view
- [x] Sort by tanggal

#### 2.3 Detail Barang
- [x] Galeri foto (carousel)
- [x] Deskripsi lengkap
- [x] Lokasi penyimpanan
- [x] Status terkini
- [x] Tombol "Ajukan Klaim"

### [x] 3. Modul Kereta Api Jarak Jauh

#### 3.1 Input Barang (Petugas)
- [x] Form input barang ditemukan
- [x] Input: nama/nomor kereta, relasi, gerbong, kursi
- [x] Upload foto
- [x] Lokasi penyimpanan
- [x] Status & catatan

#### 3.2 Dashboard Pencarian (Penumpang)
- [x] Pencarian (nomor tiket, nama kereta, tanggal)
- [x] Katalog semua barang
- [x] Filter & sorting

#### 3.3 Detail Barang
- [x] Info barang + foto
- [x] Lokasi pengambilan
- [x] Tombol klaim + input nomor tiket

### [x] 4. Sistem Klaim

#### 4.1 Form Klaim (Penumpang)
- [x] Input identitas (nama, no. HP, email)
- [x] Upload bukti kepemilikan (foto KTP + foto barang)
- [x] Deskripsi ciri-ciri barang
- [x] Nomor tiket (untuk KA Jarak Jauh)
- [x] Persetujuan syarat & ketentuan

#### 4.2 Verifikasi (Admin)
- [x] List klaim masuk
- [x] Review dokumen & bukti
- [x] Bandingkan deskripsi barang
- [x] Setuju / Tolak dengan alasan
- [x] Update status barang
- [x] Generate kode verifikasi

#### 4.3 Proses Pengambilan
- [x] Update status → "Sudah Diambil"
- [x] Notifikasi ke penumpang

### [x] 5. Dashboard Admin

#### 5.1 Management Barang ✅ BARU
- [x] CRUD semua barang ditemukan
- [x] Update status barang
- [x] Filter & search advanced
- [x] Statistik ringkasan

#### 5.2 Verifikasi Klaim
- [x] Queue klaim menunggu verifikasi
- [x] Detail klaim + history
- [x] Action: Setuju / Tolak

#### 5.3 Management Petugas ✅ BARU
- [x] List semua petugas
- [x] Tambah petugas baru
- [x] Edit petugas
- [x] Hapus petugas
- [x] Role assignment (Petugas, Admin Stasiun)

#### 5.4 Laporan & Statistik ✅ BARU
- [x] Total barang ditemukan
- [x] Total klaim & approval rate
- [x] Barang per kategori
- [x] Top stasiun
- [x] Statistik harian
- [x] Export laporan (JSON)

#### 5.5 Log Aktivitas (Audit Trail) ✅ BARU
- [x] Riwayat semua aksi (create, update, delete)
- [x] Filter by action, entity type
- [x] Timeline view

#### 5.6 Pengaturan ✅ BARU
- [x] Edit profile
- [x] Ubah password
- [x] Pengaturan notifikasi
- [x] Pengaturan tampilan

### [x] 6. "Kemungkinan Milik Saya" Feature
- [ ] Form input deskripsi barang hilang
- [ ] Fuzzy matching algorithm
- [ ] Match percentage display
- [ ] Notifikasi jika ada match >70%

### [x] 7. Upload & Storage Foto
- [x] Upload multi-foto
- [x] Preview sebelum upload
- [x] Storage: Local disk (belum ke cloud)
- [ ] Cloudinary integration (pending)

### [x] 8. Notifikasi

#### 8.1 In-App Notification
- [x] Bell icon dengan badge count
- [x] Notification center page
- [x] Mark as read / mark all read

---

## ⭐ Fitur Tambahan - BELUM

### [x] 9. QR Code System (80%)
- [x] Generate QR Code unik per barang
- [x] QR berisi link ke detail barang
- [ ] Print QR untuk ditempel di barang

### [ ] 10. Peta Interaktif
- [ ] Denah stasiun
- [ ] Marker lokasi penyimpanan
- [ ] Popup info lokasi
- [ ] Link ke Google Maps

### [ ] 11. "Kemungkinan Milik Saya"
- [ ] Form input deskripsi barang hilang
- [ ] Fuzzy matching algorithm
- [ ] Match percentage display
- [ ] Notifikasi jika ada match >70%
- [ ] List barang yang cocok

### [ ] 12. PWA (Progressive Web App)
- [ ] Service Worker
- [ ] Offline mode (baca katalog)
- [ ] Add to Home Screen
- [ ] Push notifications

### [ ] 13. Dark Mode
- [ ] Toggle light/dark theme
- [ ] Simpan preferensi
- [ ] Consistent design

### [ ] 14. Batas Waktu Penyimpanan
- [ ] Config masa simpan per kategori
- [ ] Auto-archive setelah expired
- [ ] Notifikasi sebelum expire

### [ ] 15. WhatsApp Notification
- [ ] API WhatsApp Business
- [ ] Template message
- [ ] Send notification

### [ ] 16. Cloudinary Integration
- [ ] Setup Cloudinary
- [ ] Upload foto ke Cloudinary
- [ ] Generate thumbnail
- [ ] Delete from Cloudinary

---

## 🗄️ Struktur Database

### Tabel yang sudah dibuat:

```
┌─────────────────────────────────────────┐
│              DATABASE TABLES             │
├─────────────────────────────────────────┤
│                                         │
│  users         ✅  (with role)         │
│  stations      ✅  (8 seed data)       │
│  kategori      ✅  (10 seed data)       │
│  barang        ✅  (3 seed data)        │
│  barang_foto   ✅                       │
│  klaim         ✅                       │
│  notifikasi    ✅                       │
│  audit_log     ✅                       │
│  barang_hilang ✅                       │
│  password_reset ✅                     │
│                                         │
└─────────────────────────────────────────┘
```

### Database Provider:
- **Development:** Neon (PostgreSQL Cloud)
- **Connection:** ✅ Connected

---

## 🔌 API Endpoints

| Kategori | Endpoint | Status |
|----------|----------|--------|
| **Auth** | register, login, logout, me, profile | ✅ |
| **Barang** | CRUD, KRL list, KA list | ✅ |
| **Klaim** | create, verify, confirm | ✅ |
| **Kategori** | CRUD | ✅ |
| **Stations** | list, detail | ✅ |
| **Upload** | foto upload, delete | ✅ |
| **Stats** | dashboard, barang, klaim, export | ✅ |
| **Notifikasi** | list, mark-read, delete | ✅ |
| **QR Code** | generate | ✅ |
| **Audit Log** | list | ✅ |

---

## 📁 Struktur Project

```
kai-finder/
├── backend/                      # Backend API
│   ├── prisma/
│   │   ├── schema.prisma        # 10 tables
│   │   └── seed.js             # Sample data
│   ├── src/
│   │   ├── config/             # Database & App config
│   │   ├── controllers/        # 8 controllers
│   │   ├── middleware/         # Auth & Upload
│   │   ├── routes/             # 9 route files
│   │   └── server.js           # Entry point
│   └── package.json
│
├── frontend/                     # Frontend Web App
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AuthLayout.jsx
│   │   │   │   ├── PetugasLayout.jsx
│   │   │   │   └── AdminLayout.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── barang/
│   │   │   │   ├── KatalogKRLPage.jsx
│   │   │   │   ├── KatalogKAPage.jsx
│   │   │   │   └── DetailBarangPage.jsx
│   │   │   ├── klaim/
│   │   │   │   └── FormKlaimPage.jsx
│   │   │   ├── petugas/
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── DaftarBarangPage.jsx
│   │   │   │   └── TambahBarangPage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── AdminBarangPage.jsx    ✅ BARU
│   │   │   │   ├── AdminPetugasPage.jsx   ✅ BARU
│   │   │   │   ├── VerifikasiKlaimPage.jsx
│   │   │   │   ├── AdminLaporanPage.jsx    ✅ BARU
│   │   │   │   ├── AdminAuditLogPage.jsx  ✅ BARU
│   │   │   │   └── AdminPengaturanPage.jsx ✅ BARU
│   │   │   └── HomePage.jsx
│   │   ├── store/             # Zustand stores
│   │   ├── lib/              # API client & utils
│   │   ├── styles/           # Tailwind CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── PRD-KAI-FINDER.md           # Product Requirements
└── README.md                   # Setup instructions
```

---

## 📅 Milestone & Timeline

| Milestone | Fitur | Status |
|-----------|-------|--------|
| **M1** | Setup project + Auth + DB Schema | ✅ Selesai |
| **M2** | CRUD Barang + Upload Foto | ✅ Selesai |
| **M3** | Search & Filter + Katalog | ✅ Selesai |
| **M4** | Sistem Klaim + Verifikasi | ✅ Selesai |
| **M5** | Dashboard Admin | ✅ Selesai |
| **M6** | Notifikasi + QR Code | ✅ Selesai |
| **M7** | Kelola Admin Menu | ✅ Selesai |
| **M8** | Cloudinary + Enhancement | ⏳ Pending |

---

## 🚀 Cara Menjalankan

### Backend
```bash
cd backend
npm install
npm run dev
# Backend: http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:3000
```

### Database
- **Provider:** Neon (PostgreSQL Cloud)
- **Region:** Singapore
- **Status:** ✅ Connected

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin Pusat** | admin@kai.id | password123 |
| **Admin Stasiun** | admin.jakk@kai.id | password123 |
| **Petugas KRL** | petugas.krl@kai.id | password123 |
| **Petugas KA** | petugas.ka@kai.id | password123 |
| **Penumpang** | penumpang@test.com | password123 |

---

## 📝 Catatan Perubahan

| Tanggal | Versi | Perubahan |
|---------|-------|-----------|
| 20 Juli 2026 | v1.0 | Inisial dokumen PRD |
| 20 Juli 2026 | v2.0 | Update: M1-M6 selesai |
| 20 Juli 2026 | v2.1 | Update: M7 selesai (Admin Menu), semua fitur core MVP selesai |

---

## 🎯 Fitur Prioritas Berikutnya

1. **Cloudinary Integration** - Untuk upload foto ke cloud
2. **"Kemungkinan Milik Saya"** - Fuzzy matching algorithm
3. **Peta Interaktif** - Denah stasiun
4. **Dark Mode** - Toggle tema
5. **PWA Support** - Offline mode

---

## 📊 Statistik Project

| Metric | Value |
|--------|-------|
| Total Files Created | ~40 files |
| Backend Controllers | 8 |
| Frontend Pages | 15+ |
| API Endpoints | 30+ |
| Database Tables | 10 |
| Progress | 85% MVP ✅ |

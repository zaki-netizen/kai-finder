# 🚂 KAI Finder - Lost and Found System

Sistem Lost and Found untuk PT KAI (Kereta Api Indonesia)

![Status](https://img.shields.io/badge/status-Development-yellow)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Deskripsi Proyek

KAI Finder adalah sistem informasi berbasis web untuk mengelola barang hilang/ditemukan di stasiun KRL Commuter Line dan Kereta Api Jarak Jauh PT KAI. Sistem ini menghubungkan petugas yang menemukan barang dengan penumpang yang kehilangan.

---

## 🎯 Fitur

### Fitur Core
- ✅ Sistem Autentikasi Multi-Role (JWT + RBAC)
- ✅ CRUD Barang Ditemukan (KRL & KA Jarak Jauh)
- ✅ Sistem Pencarian & Filter
- ✅ Sistem Klaim dengan Verifikasi
- ✅ Dashboard Admin
- ✅ Upload Foto dengan Kompresi
- ✅ Notifikasi

### Fitur Tambahan
- ⏳ QR Code System
- ⏳ Peta Interaktif
- ⏳ "Kemungkinan Milik Saya" Feature
- ⏳ PWA Support
- ⏳ Dark Mode
- ⏳ WhatsApp Notification

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React + Vite + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Auth** | JWT + Refresh Token |
| **State** | Zustand |

---

## 📁 Struktur Proyek

```
kai-finder/
├── backend/                 # Backend API
│   ├── prisma/             # Database schema & migrations
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Seed data
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── server.js       # Entry point
│   └── package.json
│
├── frontend/                # Frontend Web App
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   └── styles/         # CSS
│   └── package.json
│
├── PRD-KAI-FINDER.md       # Product Requirements Document
└── README.md
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js v18+
- PostgreSQL v14+
- npm atau yarn

### 1. Setup Database

```bash
# Buat database PostgreSQL
createdb kai_finder

# Atau di psql
CREATE DATABASE kai_finder;
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (opsional - untuk data awal)
node prisma/seed.js

# Start server
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin Pusat | admin@kai.id | password123 |
| Admin Stasiun | admin.jakk@kai.id | password123 |
| Petugas KRL | petugas.krl@kai.id | password123 |
| Petugas KA | petugas.ka@kai.id | password123 |
| Penumpang | penumpang@example.com | password123 |

---

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Get current user |

### Barang
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/barang` | List semua barang |
| GET | `/api/barang/:id` | Detail barang |
| POST | `/api/barang` | Create barang |
| PUT | `/api/barang/:id` | Update barang |
| DELETE | `/api/barang/:id` | Delete barang |

### Kategori
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/kategori` | List kategori |

---

## 👥 Role & Akses

| Role | Akses |
|------|-------|
| **PENUMPANG** | Pencarian barang, ajukan klaim |
| **PETUGAS** | Input & update barang |
| **ADMIN_STASIUN** | Verifikasi klaim, manage barang stasiun |
| **ADMIN_PUSAT** | Full access, laporan, statistics |

---

## 📄 Progress Tracker

Lihat `PRD-KAI-FINDER.md` untuk tracking progress lengkap.

---

## 🤝 Kontribusi

Silakan buat issue atau pull request jika menemukan bug atau ingin menambahkan fitur.

---

## 📜 Lisensi

MIT License - © 2026 PT Kereta Api Indonesia (Persero)

---

## 👨‍💻 Author

Proyek Kuliah - KAI Finder

---

<p align="center">
  Made with ❤️ for PT KAI
</p>

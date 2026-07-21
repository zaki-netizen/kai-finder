import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import useThemeStore from '@/store/themeStore';
import { Loader2 } from 'lucide-react';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import KatalogKRLPage from '@/pages/barang/KatalogKRLPage';
import KatalogKAPage from '@/pages/barang/KatalogKAPage';
import DetailBarangPage from '@/pages/barang/DetailBarangPage';
import FormKlaimPage from '@/pages/klaim/FormKlaimPage';
import KemungkinanMilikSayaPage from '@/pages/user/KemungkinanMilikSayaPage';
import VerifikasiKlaimPage from '@/pages/admin/VerifikasiKlaimPage';

// Petugas Pages
import PetugasLayout from '@/components/layout/PetugasLayout';
import PetugasDashboardPage from '@/pages/petugas/DashboardPage';
import DaftarBarangPage from '@/pages/petugas/DaftarBarangPage';
import TambahBarangPage from '@/pages/petugas/TambahBarangPage';

// Admin Pages
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboardPage from '@/pages/admin/DashboardPage';
import AdminBarangPage from '@/pages/admin/AdminBarangPage';
import AdminPetugasPage from '@/pages/admin/AdminPetugasPage';
import AdminLaporanPage from '@/pages/admin/AdminLaporanPage';
import AdminAuditLogPage from '@/pages/admin/AdminAuditLogPage';
import AdminPengaturanPage from '@/pages/admin/AdminPengaturanPage';

// Penumpang Pages
import PenumpangLayout from '@/components/layout/PenumpangLayout';
import PenumpangDashboardPage from '@/pages/penumpang/DashboardPage';
import RiwayatKlaimPage from '@/pages/penumpang/RiwayatKlaimPage';
import NotifikasiPage from '@/pages/penumpang/NotifikasiPage';
import PengaturanPage from '@/pages/penumpang/PengaturanPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const location = useLocation();

  // Save the intended location before redirecting to login
  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    }
  }, [isAuthenticated, isInitialized, location]);

  // Still loading auth state - show spinner
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-kai-primary mx-auto mb-4" />
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { init, isInitialized } = useAuthStore();
  const { init: initTheme } = useThemeStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await init();
      initTheme();
      // Small delay to ensure all state updates are processed
      setTimeout(() => setIsInitializing(false), 100);
    };
    initialize();
  }, [init, initTheme]);

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-kai-primary mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* KRL Routes */}
      <Route path="/krl" element={<KatalogKRLPage />} />
      <Route path="/ka" element={<KatalogKAPage />} />
      <Route path="/barang/:id" element={<DetailBarangPage />} />
      <Route path="/klaim/:id" element={<FormKlaimPage />} />
      <Route path="/kemungkinan-milik-saya" element={<KemungkinanMilikSayaPage />} />

      {/* Protected Routes - Petugas */}
      <Route
        path="/petugas"
        element={
          <ProtectedRoute allowedRoles={['PETUGAS', 'ADMIN_PUSAT', 'ADMIN_STASIUN']}>
            <PetugasLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/petugas/dashboard" replace />} />
        <Route path="dashboard" element={<PetugasDashboardPage />} />
        <Route path="daftar-barang" element={<DaftarBarangPage />} />
        <Route path="tambah-barang" element={<TambahBarangPage />} />
        <Route path="edit-barang/:id" element={<TambahBarangPage />} />
      </Route>

      {/* Protected Routes - Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN_PUSAT', 'ADMIN_STASIUN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="barang" element={<AdminBarangPage />} />
        <Route path="petugas" element={<AdminPetugasPage />} />
        <Route path="klaim" element={<VerifikasiKlaimPage />} />
        <Route path="laporan" element={<AdminLaporanPage />} />
        <Route path="audit-log" element={<AdminAuditLogPage />} />
        <Route path="pengaturan" element={<AdminPengaturanPage />} />
      </Route>

      {/* Protected Routes - Penumpang */}
      <Route
        path="/penumpang"
        element={
          <ProtectedRoute allowedRoles={['PENUMPANG']}>
            <PenumpangLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/penumpang/dashboard" replace />} />
        <Route path="dashboard" element={<PenumpangDashboardPage />} />
        <Route path="barang-saya" element={<div className="p-6"><h1 className="text-2xl font-bold">Barang Saya</h1><p className="text-gray-500 mt-2">Fitur dalam pengembangan</p></div>} />
        <Route path="riwayat-klaim" element={<RiwayatKlaimPage />} />
        <Route path="notifikasi" element={<NotifikasiPage />} />
        <Route path="pengaturan" element={<PengaturanPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6">
          Maaf, halaman yang Anda cari tidak tersedia.
        </p>
        <a href="/" className="btn-primary">
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}

export default App;

import { useState } from 'react';
import { Loader2, Save, User, Lock, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

export default function PengaturanPage() {
  const { user, updateProfile, updatePassword } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    nama: user?.nama || '',
    no_hp: user?.no_hp || '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        toast.success('Profil berhasil diperbarui');
      } else {
        toast.error(result.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      toast.error('Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      // Use the change password endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password berhasil diubah');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Gagal mengubah password');
      }
    } catch (error) {
      toast.error('Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Ubah Password', icon: Lock },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h1>
        <p className="text-gray-500 mt-1">
          Kelola informasi akun Anda
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card max-w-xl">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Profil</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-3xl font-bold">
                  {user?.nama?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{user?.nama}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Penumpang
                </span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileForm.nama}
                  onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email}
                  className="input w-full bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email tidak dapat diubah
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  value={profileForm.no_hp}
                  onChange={(e) => setProfileForm({ ...profileForm, no_hp: e.target.value })}
                  className="input w-full"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card max-w-xl">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Ubah Password</h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input w-full"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal 6 karakter
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input w-full"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Ubah Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

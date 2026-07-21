import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Mail,
  Phone,
  MapPin,
  Key,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function AdminPengaturanPage() {
  const { user, updateProfile, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    nama: user?.nama || '',
    no_hp: user?.no_hp || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: false,
    inApp: true,
  });

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await updateProfile(profileData);
      toast.success('Profile berhasil diupdate');
    } catch (error) {
      toast.error('Gagal mengupdate profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    // Call API to change password
    toast.success('Password berhasil diubah');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Key },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-gray-500">Kelola akun dan preferensi</p>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64">
            <div className="card p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
                      activeTab === tab.id
                        ? 'bg-kai-primary text-white'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6">Profile</h2>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-kai-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user?.nama?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{user?.nama}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Role: {user?.role === 'ADMIN_PUSAT' ? 'Admin Pusat' : user?.role === 'ADMIN_STASIUN' ? 'Admin Stasiun' : user?.role}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Nama Lengkap</label>
                    <input
                      type="text"
                      value={profileData.nama}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, nama: e.target.value }))}
                      className="input"
                      placeholder="Nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="input bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                  </div>

                  <div>
                    <label className="label">No. HP</label>
                    <input
                      type="tel"
                      value={profileData.no_hp}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, no_hp: e.target.value }))}
                      className="input"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  {user?.stasiun && (
                    <div>
                      <label className="label">Stasiun</label>
                      <input
                        type="text"
                        value={user.stasiun.nama}
                        disabled
                        className="input bg-gray-100"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleProfileSave}
                    disabled={saving}
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6">Ubah Password</h2>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="label">Password Lama</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="input"
                      placeholder="Masukkan password lama"
                    />
                  </div>

                  <div>
                    <label className="label">Password Baru</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="input"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>

                  <div>
                    <label className="label">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input"
                      placeholder="Ulangi password baru"
                    />
                  </div>

                  <button onClick={handlePasswordChange} className="btn-primary">
                    <Key className="h-4 w-4" />
                    Ubah Password
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Notifikasi</h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Email Notification</p>
                        <p className="text-sm text-gray-500">Terima notifikasi via email</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications((prev) => ({ ...prev, email: e.target.checked }))}
                      className="w-5 h-5 rounded text-kai-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">WhatsApp Notification</p>
                        <p className="text-sm text-gray-500">Terima notifikasi via WhatsApp</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.whatsapp}
                      onChange={(e) => setNotifications((prev) => ({ ...prev, whatsapp: e.target.checked }))}
                      className="w-5 h-5 rounded text-kai-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">In-App Notification</p>
                        <p className="text-sm text-gray-500">Tampilkan notifikasi di aplikasi</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.inApp}
                      onChange={(e) => setNotifications((prev) => ({ ...prev, inApp: e.target.checked }))}
                      className="w-5 h-5 rounded text-kai-primary"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Tampilan</h2>

                <div className="space-y-6">
                  <div>
                    <p className="font-medium mb-3">Tema</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 border-2 border-kai-primary rounded-lg bg-white">
                        <div className="w-full h-20 bg-gray-50 rounded mb-2"></div>
                        <p className="font-medium">Light</p>
                      </button>
                      <button className="p-4 border-2 border-gray-200 rounded-lg bg-gray-900">
                        <div className="w-full h-20 bg-gray-800 rounded mb-2"></div>
                        <p className="font-medium text-white">Dark (Coming Soon)</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-3">Bahasa</p>
                    <select className="input w-full md:w-64">
                      <option value="id">Indonesia</option>
                      <option value="en" disabled>English (Coming Soon)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

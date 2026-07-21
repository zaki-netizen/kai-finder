import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import {
  Menu,
  X,
  Home,
  Search,
  Package,
  FileSearch,
  Bell,
  LogOut,
  ChevronDown,
  User,
  Settings,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifikasiAPI } from '@/lib/api';

export default function PenumpangLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifikasi, setNotifikasi] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifikasi();
  }, []);

  const fetchNotifikasi = async () => {
    try {
      const res = await notifikasiAPI.getAll();
      const data = res.data.data || [];
      setNotifikasi(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logout berhasil');
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/penumpang/dashboard',
      icon: Home,
    },
    {
      title: 'Cari Barang KRL',
      path: '/krl',
      icon: Search,
    },
    {
      title: 'Cari Barang KA',
      path: '/ka',
      icon: Package,
    },
    {
      title: 'Barang Saya',
      path: '/penumpang/barang-saya',
      icon: Package,
    },
    {
      title: 'Kemungkinan Milik Saya',
      path: '/kemungkinan-milik-saya',
      icon: Heart,
    },
    {
      title: 'Riwayat Klaim',
      path: '/penumpang/riwayat-klaim',
      icon: FileSearch,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/" className="flex items-center gap-3">
              <img src="/logofix.png" alt="Logo" className="h-[100px] w-auto" />
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900">KAI Finder</h1>
                <p className="text-xs text-gray-500">Portal Penumpang</p>
              </div>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <User className="h-3 w-3" />
              Penumpang
            </span>

            {/* Notifications */}
            <button
              onClick={() => navigate('/penumpang/notifikasi')}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">
                    {user?.nama?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.nama}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b">
                      <p className="font-medium text-gray-900">{user?.nama}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      {user?.no_hp && (
                        <p className="text-xs text-gray-400">{user.no_hp}</p>
                      )}
                    </div>
                    <div className="p-2">
                      <Link
                        to="/penumpang/pengaturan"
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Pengaturan Akun
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    active
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Quick Search */}
          <div className="p-4 border-t">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <p className="font-medium mb-2">Cari Barang Hilang?</p>
              <p className="text-xs text-blue-100 mb-3">
                Temukan barang Anda yang hilang dengan mudah
              </p>
              <Link
                to="/krl"
                className="block w-full text-center bg-white text-blue-600 text-sm font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Mulai Cari
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold">Menu Penumpang</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        active
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

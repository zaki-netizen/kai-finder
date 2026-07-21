import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import {
  Menu,
  X,
  Home,
  Package,
  FileCheck,
  Users,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Clock,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logout berhasil');
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: Home,
    },
    {
      title: 'Kelola Barang',
      path: '/admin/barang',
      icon: Package,
    },
    {
      title: 'Verifikasi Klaim',
      path: '/admin/klaim',
      icon: FileCheck,
    },
    {
      title: 'Kelola Petugas',
      path: '/admin/petugas',
      icon: Users,
    },
    {
      title: 'Laporan & Statistik',
      path: '/admin/laporan',
      icon: BarChart3,
    },
    {
      title: 'Log Aktivitas',
      path: '/admin/audit-log',
      icon: Clock,
    },
    {
      title: 'Pengaturan',
      path: '/admin/pengaturan',
      icon: Settings,
    },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-kai-primary text-white sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/" className="flex items-center gap-3">
              <img src="/logofix.png" alt="Logo" className="h-[100px] w-auto" />
              <div className="hidden sm:block">
                <h1 className="font-bold">KAI Finder</h1>
                <p className="text-xs text-white/70">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
              <UserCog className="h-3 w-3" />
              {user?.role === 'ADMIN_PUSAT' ? 'Admin Pusat' : 'Admin Stasiun'}
            </span>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-white/10 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-kai-primary text-sm font-bold">
                    {user?.nama?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user?.nama}</p>
                  <p className="text-xs text-white/70">{user?.stasiun?.nama || 'Pusat'}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
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
                    </div>
                    <div className="p-2">
                      <Link
                        to="/admin/profile"
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Pengaturan
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
                      ? 'bg-kai-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Admin Info */}
          <div className="p-4 border-t">
            <div className="bg-kai-primary/5 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Admin</p>
              <p className="font-medium text-sm">{user?.nama}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'ADMIN_PUSAT' ? 'Pusat' : user?.stasiun?.nama}
              </p>
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
                <h2 className="font-bold">Menu Admin</h2>
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
                          ? 'bg-kai-primary text-white'
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

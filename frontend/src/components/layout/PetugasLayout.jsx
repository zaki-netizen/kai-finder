import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import {
  Menu,
  X,
  Home,
  Package,
  Plus,
  List,
  User,
  LogOut,
  Bell,
  Train,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PetugasLayout() {
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
      path: '/petugas/dashboard',
      icon: Home,
    },
    {
      title: 'Daftar Barang',
      path: '/petugas/daftar-barang',
      icon: List,
    },
    {
      title: 'Tambah Barang',
      path: '/petugas/tambah-barang',
      icon: Plus,
    },
  ];

  const isActive = (path) => {
    if (path === '/petugas/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
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
                <p className="text-xs text-gray-500">Petugas</p>
              </div>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-kai-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.nama?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user?.nama}</p>
                  <p className="text-xs text-gray-500">{user?.stasiun?.nama || 'Petugas'}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <p className="font-medium">{user?.nama}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/petugas/profile"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg"
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
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r min-h-[calc(100vh-64px)] sticky top-16">
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

          {/* Station Info */}
          {user?.stasiun && (
            <div className="p-4 border-t">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Stasiun</p>
                <p className="font-medium">{user.stasiun.nama}</p>
                <p className="text-xs text-gray-500">{user.stasiun.kode}</p>
              </div>
            </div>
          )}
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
                <h2 className="font-bold">Menu</h2>
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

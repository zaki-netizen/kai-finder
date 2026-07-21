import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import AuthLayout from '@/components/layout/AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  const validate = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      errors.password = 'Password wajib diisi';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Check if there's a saved redirect URL
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin'); // Clear it

      // Redirect based on priority:
      // 1. Saved redirect URL from protected page
      // 2. Role-based default
      if (redirectUrl && redirectUrl !== '/login') {
        navigate(redirectUrl, { replace: true });
      } else {
        const role = result.user.role;
        if (role === 'ADMIN_PUSAT' || role === 'ADMIN_STASIUN') {
          navigate('/admin/dashboard');
        } else if (role === 'PETUGAS') {
          navigate('/petugas/dashboard');
        } else if (role === 'PENUMPANG') {
          navigate('/penumpang/dashboard');
        } else {
          navigate('/');
        }
      }
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Selamat Datang!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Masuk ke akun KAI Finder Anda
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className={cn(
                  'input pl-10',
                  validationErrors.email && 'input-error'
                )}
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={cn(
                  'input pl-10 pr-10',
                  validationErrors.password && 'input-error'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
            )}
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-kai-primary focus:ring-kai-primary"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Ingat saya
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-kai-primary hover:text-kai-secondary"
            >
              Lupa password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Masuk...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="text-kai-primary hover:text-kai-secondary font-medium"
          >
            Daftar sekarang
          </Link>
        </p>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Demo Credentials:
          </p>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <p><strong>Admin:</strong> admin@kai.id</p>
            <p><strong>Petugas:</strong> petugas.krl@kai.id</p>
            <p><strong>Penumpang:</strong> penumpang@example.com</p>
            <p className="text-gray-400">Password: password123</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

// Helper for cn
import { cn } from '@/lib/utils';

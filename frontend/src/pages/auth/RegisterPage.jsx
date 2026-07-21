import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import AuthLayout from '@/components/layout/AuthLayout';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_hp: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.nama || formData.nama.length < 2) {
      errors.nama = 'Nama minimal 2 karakter';
    }

    if (!formData.email) {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.no_hp) {
      errors.no_hp = 'Nomor HP wajib diisi';
    } else if (!/^[0-9]{10,13}$/.test(formData.no_hp.replace(/[\s-]/g, ''))) {
      errors.no_hp = 'Format nomor HP tidak valid';
    }

    if (!formData.password) {
      errors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Password tidak cocok';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const result = await register({
      nama: formData.nama,
      email: formData.email,
      no_hp: formData.no_hp,
      password: formData.password,
    });

    if (result.success) {
      navigate('/');
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daftar Akun Baru
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Bergabung dengan KAI Finder
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama */}
          <div>
            <label className="label">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                className={cn(
                  'input pl-10',
                  validationErrors.nama && 'input-error'
                )}
              />
            </div>
            {validationErrors.nama && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.nama}</p>
            )}
          </div>

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

          {/* No HP */}
          <div>
            <label className="label">Nomor HP</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="no_hp"
                value={formData.no_hp}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className={cn(
                  'input pl-10',
                  validationErrors.no_hp && 'input-error'
                )}
              />
            </div>
            {validationErrors.no_hp && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.no_hp}</p>
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
                placeholder="Minimal 6 karakter"
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

          {/* Confirm Password */}
          <div>
            <label className="label">Konfirmasi Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                className={cn(
                  'input pl-10',
                  validationErrors.confirmPassword && 'input-error'
                )}
              />
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              className="mt-1 w-4 h-4 rounded border-gray-300 text-kai-primary focus:ring-kai-primary"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Saya setuju dengan{' '}
              <Link to="/terms" className="text-kai-primary hover:underline">
                Syarat & Ketentuan
              </Link>{' '}
              dan{' '}
              <Link to="/privacy" className="text-kai-primary hover:underline">
                Kebijakan Privasi
              </Link>
            </span>
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
                Mendaftar...
              </>
            ) : (
              'Daftar'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="text-kai-primary hover:text-kai-secondary font-medium"
          >
            Masuk
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

// Helper for cn
import { cn } from '@/lib/utils';

import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kai-primary via-kai-primary to-kai-light flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <img src="/logofix.png" alt="Logo" className="h-[100px] w-auto" />
            <div>
              <h1 className="text-2xl font-bold">KAI Finder</h1>
              <p className="text-sm text-white/70">Lost & Found PT KAI</p>
            </div>
          </Link>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Temukan Barang<br />
            Hilang Anda<br />
            <span className="text-kai-accent">Dengan Mudah</span>
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Sistem Lost and Found terintegrasi untuk KRL Commuter Line dan
            Kereta Api Jarak Jauh. Temukan dan klaim barang Anda dengan cepat dan aman.
          </p>

          <div className="flex gap-6 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-white/70">Barang Ditemukan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-white/70">Tingkat Klaim</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/70">Layanan</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/60">
          © 2026 PT Kereta Api Indonesia (Persero)
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/logofix.png" alt="Logo" className="h-14 w-auto" />
              <div className="text-white">
                <h1 className="text-xl font-bold">KAI Finder</h1>
                <p className="text-xs text-white/70">Lost & Found PT KAI</p>
              </div>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

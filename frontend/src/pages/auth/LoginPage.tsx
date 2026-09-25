import { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useLogin, useGoogleLogin } from '../../hooks/useAuth';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get redirect path from location state (set by ProtectedRoute)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const loginMutation = useLogin(from);
  const googleLoginMutation = useGoogleLogin();

  useEffect(() => {
    const registered = searchParams.get('registered');
    const passwordReset = searchParams.get('passwordReset');
    const error = searchParams.get('error');

    if (registered === 'true') {
      setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
    } else if (passwordReset === 'true') {
      setSuccessMessage('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
    } else if (error) {
      setErrors({ general: decodeURIComponent(error) });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    loginMutation.mutate(formData);
  };

  const handleGoogleLogin = () => {
    googleLoginMutation.mutate();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Đăng nhập</h1>
        <p className="text-slate-500 dark:text-slate-400">Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn.</p>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
          <AlertCircle size={16} />
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all ${
                errors.email ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
              }`}
              placeholder="your@email.com"
              required
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all ${
                errors.password ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
              }`}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
        </div>

        {/* Forgot Password Link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input type="checkbox" id="remember" className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500" />
            <label htmlFor="remember" className="ml-2 text-sm text-slate-600 dark:text-slate-300">Ghi nhớ đăng nhập</label>
          </div>
          <Link to="/auth/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
        <span className="px-4 text-sm text-slate-500 dark:text-slate-400">hoặc</span>
        <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
      </div>

      {/* Google Login */}
      <button
        onClick={handleGoogleLogin}
        className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Đăng nhập với Google
      </button>

      {/* Register Link */}
      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        <span>Chưa có tài khoản? </span>
        <Link to="/auth/register" className="font-semibold text-primary hover:text-primary-hover">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;


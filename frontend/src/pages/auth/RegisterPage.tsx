import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useSendOtp, useRegister } from '../../hooks/useAuth';

const RegisterPage = () => {
  const [step, setStep] = useState<'otp' | 'register'>('otp');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sendOtpMutation = useSendOtp();
  const registerMutation = useRegister();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    sendOtpMutation.mutate(
      { email, type: 'REGISTER' },
      {
        onSuccess: () => {
          setOtpSent(true);
          setStep('register');
        },
        onError: (error: any) => {
          setErrors({ general: error.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.' });
        },
      }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    registerMutation.mutate(
      { email, ...formData },
      {
        onError: (error: any) => {
          if (error.response?.data?.field === 'otp') {
            setErrors({ otp: error.response.data.message || 'OTP không hợp lệ hoặc đã hết hạn' });
          } else {
            setErrors({ general: error.response?.data?.message || 'Đăng ký thất bại' });
          }
        },
      }
    );
  };

  if (step === 'otp') {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Đăng ký</h1>
          <p className="text-slate-500 dark:text-slate-400">Tạo tài khoản mới để bắt đầu học tập</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle size={16} />
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all ${
                  errors.email ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                }`}
                placeholder="your@email.com"
                required
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={sendOtpMutation.isPending}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendOtpMutation.isPending ? 'Đang gửi OTP...' : 'Gửi mã OTP'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          <span>Đã có tài khoản? </span>
          <Link to="/auth/login" className="font-semibold text-primary hover:text-primary-hover">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setStep('otp')}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-1"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Hoàn tất đăng ký</h1>
        <p className="text-slate-500 dark:text-slate-400">Nhập thông tin và mã OTP đã gửi đến {email}</p>
      </div>

      {otpSent && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
          <CheckCircle size={16} />
          Mã OTP đã được gửi đến email của bạn
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
          <AlertCircle size={16} />
          {errors.general}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Họ và tên
          </label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              placeholder="Nguyễn Văn A"
              required
              minLength={1}
              maxLength={100}
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Số điện thoại
          </label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              placeholder="0901234567"
              required
              minLength={9}
              maxLength={15}
            />
          </div>
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
              className="w-full pl-10 pr-12 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              required
              minLength={6}
              maxLength={100}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all ${
                errors.confirmPassword ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
              }`}
              placeholder="••••••••"
              required
              minLength={6}
              maxLength={100}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>}
        </div>

        {/* OTP */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Mã OTP (6 số)
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-center text-2xl tracking-widest ${
                errors.otp ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
              }`}
              placeholder="000000"
              required
              maxLength={6}
            />
          </div>
          {errors.otp && <p className="mt-1 text-xs text-rose-600">{errors.otp}</p>}
          <button
            type="button"
            onClick={handleSendOtp}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Gửi lại mã OTP
          </button>
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {registerMutation.isPending ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;

